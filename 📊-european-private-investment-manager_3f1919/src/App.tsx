import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { Chart } from 'chart.js/auto';
import { 
  DollarSign, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Search, 
  Plus, 
  Moon, 
  Sun, 
  Filter, 
  ChevronDown, 
  LineChart, 
  BarChart, 
  PieChart,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import styles from './styles/styles.module.css';

// TypeScript Interfaces
interface Investment {
  id: string;
  name: string;
  amount: number;
  date: string;
  type: InvestmentType;
  country: string;
  currency: string;
  return: number;
  status: InvestmentStatus;
  notes?: string;
}

enum InvestmentType {
  STOCK = 'Stock',
  BOND = 'Bond',
  REALESTATE = 'Real Estate',
  CRYPTO = 'Cryptocurrency',
  ETF = 'ETF',
  MUTUAL_FUND = 'Mutual Fund',
  PRIVATE_EQUITY = 'Private Equity',
  OTHER = 'Other'
}

enum InvestmentStatus {
  ACTIVE = 'Active',
  PENDING = 'Pending',
  CLOSED = 'Closed',
  SOLD = 'Sold'
}

interface FilterOptions {
  type: InvestmentType | '';
  country: string;
  status: InvestmentStatus | '';
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

type FormValues = Omit<Investment, 'id'>;

// Sample countries with currencies
const countryCurrencies: { [key: string]: string } = {
  'Austria': 'EUR',
  'Belgium': 'EUR',
  'Finland': 'EUR',
  'France': 'EUR',
  'Germany': 'EUR',
  'Greece': 'EUR',
  'Ireland': 'EUR',
  'Italy': 'EUR',
  'Netherlands': 'EUR',
  'Portugal': 'EUR',
  'Spain': 'EUR',
  'United Kingdom': 'GBP',
  'Switzerland': 'CHF',
  'Sweden': 'SEK',
  'Norway': 'NOK',
  'Denmark': 'DKK',
  'Poland': 'PLN',
  'Czech Republic': 'CZK',
  'Hungary': 'HUF',
  'Romania': 'RON'
};

export default function App() {
  // State Management
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard' | 'export'>('list');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [sortConfig, setSortConfig] = useState<{ key: keyof Investment, direction: 'ascending' | 'descending' } | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    type: '',
    country: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('bar');
  
  // Chart References
  const typeChartRef = useRef<HTMLCanvasElement | null>(null);
  const typeChartInstance = useRef<Chart | null>(null);
  const returnChartRef = useRef<HTMLCanvasElement | null>(null);
  const returnChartInstance = useRef<Chart | null>(null);
  const countryChartRef = useRef<HTMLCanvasElement | null>(null);
  const countryChartInstance = useRef<Chart | null>(null);
  
  // Form handling
  const { register, handleSubmit, reset, control, setValue, formState: { errors } } = useForm<FormValues>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // Load investments from localStorage on initial render
  useEffect(() => {
    const savedInvestments = localStorage.getItem('investments');
    if (savedInvestments) {
      setInvestments(JSON.parse(savedInvestments));
    } else {
      // Sample data for demonstration
      const sampleInvestments: Investment[] = [
        {
          id: '1',
          name: 'DAX Index Fund',
          amount: 25000,
          date: '2023-01-15',
          type: InvestmentType.ETF,
          country: 'Germany',
          currency: 'EUR',
          return: 8.5,
          status: InvestmentStatus.ACTIVE,
          notes: 'Long term investment'
        },
        {
          id: '2',
          name: 'London Real Estate',
          amount: 150000,
          date: '2022-06-20',
          type: InvestmentType.REALESTATE,
          country: 'United Kingdom',
          currency: 'GBP',
          return: 4.2,
          status: InvestmentStatus.ACTIVE,
          notes: 'Apartment in central London'
        },
        {
          id: '3',
          name: 'Swiss Government Bond',
          amount: 50000,
          date: '2023-03-10',
          type: InvestmentType.BOND,
          country: 'Switzerland',
          currency: 'CHF',
          return: 2.1,
          status: InvestmentStatus.ACTIVE,
          notes: 'Maturity in 2028'
        },
        {
          id: '4',
          name: 'Bitcoin',
          amount: 15000,
          date: '2022-11-05',
          type: InvestmentType.CRYPTO,
          country: 'Germany',
          currency: 'EUR',
          return: 15.7,
          status: InvestmentStatus.ACTIVE,
          notes: 'High risk investment'
        },
        {
          id: '5',
          name: 'Scandinavian Luxury Hotels',
          amount: 75000,
          date: '2022-08-12',
          type: InvestmentType.PRIVATE_EQUITY,
          country: 'Sweden',
          currency: 'SEK',
          return: 9.3,
          status: InvestmentStatus.ACTIVE,
          notes: 'Private equity in hotel chain'
        }
      ];
      setInvestments(sampleInvestments);
      localStorage.setItem('investments', JSON.stringify(sampleInvestments));
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

  // Save investments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('investments', JSON.stringify(investments));
  }, [investments]);

  // Initialize form with editing investment data when editing
  useEffect(() => {
    if (editingInvestment) {
      Object.entries(editingInvestment).forEach(([key, value]) => {
        if (key !== 'id') {
          setValue(key as keyof FormValues, value);
        }
      });
    } else {
      reset({
        name: '',
        amount: 0,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: InvestmentType.STOCK,
        country: 'Germany',
        currency: 'EUR',
        return: 0,
        status: InvestmentStatus.ACTIVE,
        notes: ''
      });
    }
  }, [editingInvestment, setValue, reset]);

  // Update charts when investments or chart type changes
  useEffect(() => {
    if (activeTab === 'dashboard' && investments.length > 0) {
      updateCharts();
    }
    return () => {
      // Clean up chart instances
      if (typeChartInstance.current) {
        typeChartInstance.current.destroy();
        typeChartInstance.current = null;
      }
      if (returnChartInstance.current) {
        returnChartInstance.current.destroy();
        returnChartInstance.current = null;
      }
      if (countryChartInstance.current) {
        countryChartInstance.current.destroy();
        countryChartInstance.current = null;
      }
    };
  }, [activeTab, investments, chartType]);

  // Auto hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Update currency when country changes
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    const currency = countryCurrencies[country] || 'EUR';
    setValue('country', country);
    setValue('currency', currency);
  };

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    if (editingInvestment) {
      // Update existing investment
      const updatedInvestments = investments.map(inv => 
        inv.id === editingInvestment.id ? { ...data, id: inv.id } : inv
      );
      setInvestments(updatedInvestments);
      setNotification({ message: 'Investment updated successfully', type: 'success' });
    } else {
      // Add new investment
      const newInvestment: Investment = {
        ...data,
        id: Date.now().toString(),
      };
      setInvestments([...investments, newInvestment]);
      setNotification({ message: 'Investment added successfully', type: 'success' });
    }
    setEditingInvestment(null);
    reset();
  };

  // Delete investment handler
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      const updatedInvestments = investments.filter(inv => inv.id !== id);
      setInvestments(updatedInvestments);
      setNotification({ message: 'Investment deleted successfully', type: 'success' });
    }
  };

  // Edit investment handler
  const handleEdit = (investment: Investment) => {
    setEditingInvestment(investment);
  };

  // Filter investments based on search term and filter options
  const filteredInvestments = investments.filter(inv => {
    const matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.country.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply additional filters if they are set
    const matchesType = filterOptions.type ? inv.type === filterOptions.type : true;
    const matchesCountry = filterOptions.country ? inv.country === filterOptions.country : true;
    const matchesStatus = filterOptions.status ? inv.status === filterOptions.status : true;
    
    const matchesDateFrom = filterOptions.dateFrom 
      ? new Date(inv.date) >= new Date(filterOptions.dateFrom) 
      : true;
      
    const matchesDateTo = filterOptions.dateTo 
      ? new Date(inv.date) <= new Date(filterOptions.dateTo) 
      : true;
      
    const matchesMinAmount = filterOptions.minAmount 
      ? inv.amount >= parseFloat(filterOptions.minAmount) 
      : true;
      
    const matchesMaxAmount = filterOptions.maxAmount 
      ? inv.amount <= parseFloat(filterOptions.maxAmount) 
      : true;

    return matchesSearch && matchesType && matchesCountry && matchesStatus && 
           matchesDateFrom && matchesDateTo && matchesMinAmount && matchesMaxAmount;
  });

  // Sorting logic
  const sortedInvestments = React.useMemo(() => {
    let sortableItems = [...filteredInvestments];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredInvestments, sortConfig]);

  // Request sort handler
  const requestSort = (key: keyof Investment) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Import CSV handler
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Map headers to our investment properties
        const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
        const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
        const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
        const typeIndex = headers.findIndex(h => h.toLowerCase().includes('type'));
        const countryIndex = headers.findIndex(h => h.toLowerCase().includes('country'));
        const currencyIndex = headers.findIndex(h => h.toLowerCase().includes('currency'));
        const returnIndex = headers.findIndex(h => h.toLowerCase().includes('return'));
        const statusIndex = headers.findIndex(h => h.toLowerCase().includes('status'));
        const notesIndex = headers.findIndex(h => h.toLowerCase().includes('notes'));
        
        const newInvestments: Investment[] = [];
        
        // Start from 1 to skip headers
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',');
          
          // Basic validation
          if (values.length < 5) continue;
          
          const mapToEnum = (value: string, enumType: any): any => {
            const upperValue = value.trim().toUpperCase();
            for (const key in enumType) {
              if (key.toUpperCase() === upperValue || 
                  enumType[key].toUpperCase().replace(/[_\s]/g, '') === upperValue.replace(/[_\s]/g, '')) {
                return enumType[key];
              }
            }
            return Object.values(enumType)[0]; // Default to first value
          };
          
          const investment: Investment = {
            id: Date.now().toString() + i,
            name: nameIndex >= 0 ? values[nameIndex].trim() : `Investment ${i}`,
            amount: amountIndex >= 0 ? parseFloat(values[amountIndex]) || 0 : 0,
            date: dateIndex >= 0 ? values[dateIndex].trim() : format(new Date(), 'yyyy-MM-dd'),
            type: typeIndex >= 0 ? mapToEnum(values[typeIndex], InvestmentType) : InvestmentType.STOCK,
            country: countryIndex >= 0 ? values[countryIndex].trim() : 'Germany',
            currency: currencyIndex >= 0 ? values[currencyIndex].trim() : 'EUR',
            return: returnIndex >= 0 ? parseFloat(values[returnIndex]) || 0 : 0,
            status: statusIndex >= 0 ? mapToEnum(values[statusIndex], InvestmentStatus) : InvestmentStatus.ACTIVE,
            notes: notesIndex >= 0 ? values[notesIndex].trim() : ''
          };
          
          newInvestments.push(investment);
        }
        
        setInvestments(prev => [...prev, ...newInvestments]);
        setNotification({ message: `${newInvestments.length} investments imported successfully`, type: 'success' });
      } catch (error) {
        setNotification({ message: 'Error importing CSV file', type: 'error' });
        console.error('Error importing CSV:', error);
      }
      setIsImporting(false);
      // Reset file input
      if (event.target) event.target.value = '';
    };
    
    reader.onerror = () => {
      setNotification({ message: 'Error reading CSV file', type: 'error' });
      setIsImporting(false);
      // Reset file input
      if (event.target) event.target.value = '';
    };
    
    setIsImporting(true);
    reader.readAsText(file);
  };

  // Export to CSV handler
  const handleExportCSV = () => {
    const headers = ['id', 'name', 'amount', 'date', 'type', 'country', 'currency', 'return', 'status', 'notes'];
    const csvContent = [
      headers.join(','),
      ...sortedInvestments.map(inv => [
        inv.id,
        inv.name,
        inv.amount,
        inv.date,
        inv.type,
        inv.country,
        inv.currency,
        inv.return,
        inv.status,
        inv.notes || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `investment_portfolio_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset filters handler
  const resetFilters = () => {
    setFilterOptions({
      type: '',
      country: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
    setSearchTerm('');
    setShowFilters(false);
    setNotification({ message: 'Filters reset', type: 'success' });
  };

  // Update charts function
  const updateCharts = () => {
    // Type distribution chart
    const typeData: Record<string, number> = {};
    investments.forEach(inv => {
      typeData[inv.type] = (typeData[inv.type] || 0) + inv.amount;
    });

    const typeChartData: ChartData = {
      labels: Object.keys(typeData),
      datasets: [{
        label: 'Investment by Type',
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
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };

    // Return performance chart
    const sortedByDate = [...investments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const returnChartData: ChartData = {
      labels: sortedByDate.map(inv => format(new Date(inv.date), 'MMM yyyy')),
      datasets: [{
        label: 'Return (%)',
        data: sortedByDate.map(inv => inv.return),
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2
      }]
    };

    // Country distribution chart
    const countryData: Record<string, number> = {};
    investments.forEach(inv => {
      countryData[inv.country] = (countryData[inv.country] || 0) + inv.amount;
    });

    const countryChartData: ChartData = {
      labels: Object.keys(countryData),
      datasets: [{
        label: 'Investment by Country',
        data: Object.values(countryData),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(199, 199, 199, 0.7)',
          'rgba(83, 102, 255, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(199, 199, 199, 1)',
          'rgba(83, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    };

    // Create or update type chart
    if (typeChartRef.current) {
      if (typeChartInstance.current) {
        typeChartInstance.current.destroy();
      }
      typeChartInstance.current = new Chart(typeChartRef.current, {
        type: chartType,
        data: typeChartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Investment Distribution by Type'
            }
          }
        },
      });
    }

    // Create or update return chart
    if (returnChartRef.current) {
      if (returnChartInstance.current) {
        returnChartInstance.current.destroy();
      }
      returnChartInstance.current = new Chart(returnChartRef.current, {
        type: chartType === 'pie' ? 'line' : chartType, // Line chart is better for time series
        data: returnChartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Investment Return Performance'
            }
          }
        },
      });
    }

    // Create or update country chart
    if (countryChartRef.current) {
      if (countryChartInstance.current) {
        countryChartInstance.current.destroy();
      }
      countryChartInstance.current = new Chart(countryChartRef.current, {
        type: chartType,
        data: countryChartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Investment Distribution by Country'
            }
          }
        },
      });
    }
  };

  // Sample Excel template for export
  const handleExportTemplate = () => {
    const headers = ['name', 'amount', 'date', 'type', 'country', 'currency', 'return', 'status', 'notes'];
    const sampleData = [
      'DAX Index Fund,25000,2023-01-15,ETF,Germany,EUR,8.5,Active,Long term investment',
      'London Real Estate,150000,2022-06-20,Real Estate,United Kingdom,GBP,4.2,Active,Apartment in central London',
      'Swiss Government Bond,50000,2023-03-10,Bond,Switzerland,CHF,2.1,Active,Maturity in 2028'
    ];
    
    const csvContent = [
      headers.join(','),
      ...sampleData
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'investment_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get investment totals for dashboard summary
  const getTotalInvestments = () => {
    return investments.reduce((total, inv) => total + inv.amount, 0);
  };

  const getAverageReturn = () => {
    if (investments.length === 0) return 0;
    return investments.reduce((total, inv) => total + inv.return, 0) / investments.length;
  };

  const getCountriesCount = () => {
    const countries = new Set(investments.map(inv => inv.country));
    return countries.size;
  };

  // Define status badge classes
  const getStatusBadgeClass = (status: InvestmentStatus) => {
    switch (status) {
      case InvestmentStatus.ACTIVE:
        return 'badge badge-success';
      case InvestmentStatus.PENDING:
        return 'badge badge-warning';
      case InvestmentStatus.CLOSED:
      case InvestmentStatus.SOLD:
        return 'badge badge-error';
      default:
        return 'badge';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <DollarSign className="h-8 w-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
                Investment Portfolio Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveTab('list')} 
                className={`btn ${activeTab === 'list' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                role="tab"
                aria-selected={activeTab === 'list'}
                aria-controls="investments-list-panel"
              >
                Investments
              </button>
              <button 
                onClick={() => setActiveTab('dashboard')} 
                className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                role="tab"
                aria-selected={activeTab === 'dashboard'}
                aria-controls="dashboard-panel"
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('export')} 
                className={`btn ${activeTab === 'export' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                role="tab"
                aria-selected={activeTab === 'export'}
                aria-controls="export-panel"
              >
                Import/Export
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)} 
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'alert alert-success' : 'alert alert-error'} fade-in`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="h-5 w-5 mr-2" />
            ) : (
              <X className="h-5 w-5 mr-2" />
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}

      <main className="flex-grow container-fluid py-8">
        {/* Investments List Tab */}
        {activeTab === 'list' && (
          <div id="investments-list-panel" role="tabpanel">
            <div className="mb-6 flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search investments..."
                    className="input pl-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search investments"
                  />
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  aria-expanded={showFilters}
                  aria-controls="filter-panel"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transform ${showFilters ? 'rotate-180' : ''} transition-transform`} />
                </button>
                <button 
                  onClick={resetFilters}
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  aria-label="Reset filters"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div id="filter-panel" className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow slide-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="filter-type">Investment Type</label>
                    <select
                      id="filter-type"
                      className="input"
                      value={filterOptions.type}
                      onChange={(e) => setFilterOptions({...filterOptions, type: e.target.value as InvestmentType | ''})}
                    >
                      <option value="">All Types</option>
                      {Object.values(InvestmentType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="filter-country">Country</label>
                    <select
                      id="filter-country"
                      className="input"
                      value={filterOptions.country}
                      onChange={(e) => setFilterOptions({...filterOptions, country: e.target.value})}
                    >
                      <option value="">All Countries</option>
                      {Object.keys(countryCurrencies).map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="filter-status">Status</label>
                    <select
                      id="filter-status"
                      className="input"
                      value={filterOptions.status}
                      onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value as InvestmentStatus | ''})}
                    >
                      <option value="">All Statuses</option>
                      {Object.values(InvestmentStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="filter-date-from">Date From</label>
                    <input
                      id="filter-date-from"
                      type="date"
                      className="input"
                      value={filterOptions.dateFrom}
                      onChange={(e) => setFilterOptions({...filterOptions, dateFrom: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="filter-date-to">Date To</label>
                    <input
                      id="filter-date-to"
                      type="date"
                      className="input"
                      value={filterOptions.dateTo}
                      onChange={(e) => setFilterOptions({...filterOptions, dateTo: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="filter-min-amount">Min Amount</label>
                    <input
                      id="filter-min-amount"
                      type="number"
                      className="input"
                      placeholder="0"
                      value={filterOptions.minAmount}
                      onChange={(e) => setFilterOptions({...filterOptions, minAmount: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="filter-max-amount">Max Amount</label>
                    <input
                      id="filter-max-amount"
                      type="number"
                      className="input"
                      placeholder="Max"
                      value={filterOptions.maxAmount}
                      onChange={(e) => setFilterOptions({...filterOptions, maxAmount: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Investments Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <div className="table-container">
                {sortedInvestments.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => requestSort('name')}
                          aria-sort={sortConfig?.key === 'name' ? sortConfig.direction : 'none'}
                        >
                          Name
                          {sortConfig?.key === 'name' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => requestSort('amount')}
                          aria-sort={sortConfig?.key === 'amount' ? sortConfig.direction : 'none'}
                        >
                          Amount
                          {sortConfig?.key === 'amount' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => requestSort('date')}
                          aria-sort={sortConfig?.key === 'date' ? sortConfig.direction : 'none'}
                        >
                          Date
                          {sortConfig?.key === 'date' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => requestSort('type')}
                          aria-sort={sortConfig?.key === 'type' ? sortConfig.direction : 'none'}
                        >
                          Type
                          {sortConfig?.key === 'type' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => requestSort('country')}
                          aria-sort={sortConfig?.key === 'country' ? sortConfig.direction : 'none'}
                        >
                          Country
                          {sortConfig?.key === 'country' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => requestSort('return')}
                          aria-sort={sortConfig?.key === 'return' ? sortConfig.direction : 'none'}
                        >
                          Return %
                          {sortConfig?.key === 'return' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th 
                          className="table-header cursor-pointer"
                          onClick={() => requestSort('status')}
                          aria-sort={sortConfig?.key === 'status' ? sortConfig.direction : 'none'}
                        >
                          Status
                          {sortConfig?.key === 'status' && (
                            <span className="ml-1">{sortConfig.direction === 'ascending' ? '↑' : '↓'}</span>
                          )}
                        </th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {sortedInvestments.map(investment => (
                        <tr key={investment.id}>
                          <td className="table-cell font-medium">{investment.name}</td>
                          <td className="table-cell">
                            {investment.amount.toLocaleString()} {investment.currency}
                          </td>
                          <td className="table-cell">{format(new Date(investment.date), 'dd MMM yyyy')}</td>
                          <td className="table-cell">{investment.type}</td>
                          <td className="table-cell">{investment.country}</td>
                          <td className="table-cell">{investment.return.toFixed(2)}%</td>
                          <td className="table-cell">
                            <span className={getStatusBadgeClass(investment.status)}>{investment.status}</span>
                          </td>
                          <td className="table-cell">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEdit(investment)}
                                className="p-1 rounded text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
                                aria-label={`Edit ${investment.name}`}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(investment.id)}
                                className="p-1 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition-colors"
                                aria-label={`Delete ${investment.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    No investments found. Add a new investment or import from CSV.
                  </div>
                )}
              </div>
            </div>

            {/* Add/Edit Investment Form */}
            <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingInvestment ? 'Edit Investment' : 'Add New Investment'}
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Investment Name</label>
                    <input
                      id="name"
                      type="text"
                      className="input"
                      {...register('name', { required: 'Name is required' })}
                      aria-invalid={errors.name ? 'true' : 'false'}
                    />
                    {errors.name && <p className="form-error">{errors.name.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="amount">Amount</label>
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      className="input"
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
                    <label className="form-label" htmlFor="date">Investment Date</label>
                    <input
                      id="date"
                      type="date"
                      className="input"
                      {...register('date', { required: 'Date is required' })}
                      aria-invalid={errors.date ? 'true' : 'false'}
                    />
                    {errors.date && <p className="form-error">{errors.date.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="type">Investment Type</label>
                    <select
                      id="type"
                      className="input"
                      {...register('type')}
                    >
                      {Object.values(InvestmentType).map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="country">Country</label>
                    <select
                      id="country"
                      className="input"
                      {...register('country')}
                      onChange={handleCountryChange}
                    >
                      {Object.keys(countryCurrencies).map((country) => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="currency">Currency</label>
                    <Controller
                      name="currency"
                      control={control}
                      render={({ field }) => (
                        <input
                          id="currency"
                          type="text"
                          className="input bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                          {...field}
                          readOnly
                        />
                      )}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="return">Expected Return (%)</label>
                    <input
                      id="return"
                      type="number"
                      step="0.01"
                      className="input"
                      {...register('return', { 
                        valueAsNumber: true,
                        required: 'Return rate is required'
                      })}
                      aria-invalid={errors.return ? 'true' : 'false'}
                    />
                    {errors.return && <p className="form-error">{errors.return.message}</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="status">Status</label>
                    <select
                      id="status"
                      className="input"
                      {...register('status')}
                    >
                      {Object.values(InvestmentStatus).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group md:col-span-2 lg:col-span-3">
                    <label className="form-label" htmlFor="notes">Notes</label>
                    <textarea
                      id="notes"
                      className="input h-24"
                      {...register('notes')}
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  {editingInvestment && (
                    <button 
                      type="button" 
                      className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={() => {
                        reset();
                        setEditingInvestment(null);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingInvestment ? 'Update Investment' : 'Add Investment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div id="dashboard-panel" role="tabpanel">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat-card">
                <div className="stat-title">Total Investments</div>
                <div className="stat-value">
                  {getTotalInvestments().toLocaleString()} €
                </div>
                <div className="stat-desc">{investments.length} investments</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Average Return</div>
                <div className="stat-value">{getAverageReturn().toFixed(2)}%</div>
                <div className="stat-desc">Annual expected return</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Countries</div>
                <div className="stat-value">{getCountriesCount()}</div>
                <div className="stat-desc">European countries</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Active Investments</div>
                <div className="stat-value">
                  {investments.filter(inv => inv.status === InvestmentStatus.ACTIVE).length}
                </div>
                <div className="stat-desc">Out of {investments.length} total</div>
              </div>
            </div>

            {/* Chart Controls */}
            <div className="mb-6 flex justify-end space-x-3">
              <button 
                onClick={() => setChartType('bar')} 
                className={`btn btn-sm ${chartType === 'bar' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                aria-pressed={chartType === 'bar'}
                aria-label="Bar chart"
              >
                <BarChart className="h-4 w-4 mr-1" /> Bar
              </button>
              <button 
                onClick={() => setChartType('line')} 
                className={`btn btn-sm ${chartType === 'line' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                aria-pressed={chartType === 'line'}
                aria-label="Line chart"
              >
                <LineChart className="h-4 w-4 mr-1" /> Line
              </button>
              <button 
                onClick={() => setChartType('pie')} 
                className={`btn btn-sm ${chartType === 'pie' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                aria-pressed={chartType === 'pie'}
                aria-label="Pie chart"
              >
                <PieChart className="h-4 w-4 mr-1" /> Pie
              </button>
            </div>

            {/* Charts */}
            {investments.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card aspect-w-16 aspect-h-9">
                  <div className="p-4">
                    <canvas ref={typeChartRef} aria-label="Investment distribution by type"></canvas>
                  </div>
                </div>
                <div className="card aspect-w-16 aspect-h-9">
                  <div className="p-4">
                    <canvas ref={countryChartRef} aria-label="Investment distribution by country"></canvas>
                  </div>
                </div>
                <div className="card aspect-w-16 aspect-h-9 lg:col-span-2">
                  <div className="p-4">
                    <canvas ref={returnChartRef} aria-label="Investment return performance"></canvas>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">No Investment Data</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">Add investments to see analytics and charts.</p>
                <div className="mt-4">
                  <button onClick={() => setActiveTab('list')} className="btn btn-primary">
                    Add Investments
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Import/Export Tab */}
        {activeTab === 'export' && (
          <div id="export-panel" role="tabpanel">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Investments</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Import your investment data from a CSV file. Make sure the file has the correct format.
                </p>
                <div className="mt-6 space-y-4">
                  <button 
                    onClick={handleExportTemplate} 
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv"
                      className="hidden"
                      onChange={handleImportCSV}
                      disabled={isImporting}
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-primary w-full"
                      disabled={isImporting}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isImporting ? 'Importing...' : 'Import CSV'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Export Investments</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Export your investment data to a CSV file that you can use in Excel or other applications.
                </p>
                <div className="mt-6 space-y-4">
                  <button 
                    onClick={handleExportCSV} 
                    className="btn btn-primary w-full"
                    disabled={investments.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export All Investments
                  </button>
                  <button 
                    onClick={() => handleExportCSV()} 
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 w-full"
                    disabled={investments.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Filtered Investments
                  </button>
                </div>
              </div>

              <div className="card md:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Data Management</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Manage your locally stored investment data.
                </p>
                <div className="mt-4">
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                    <p className="text-yellow-700 dark:text-yellow-300">
                      <strong>Note:</strong> All data is stored locally in your browser. Clearing your browser data will erase your investments.
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete all investments? This cannot be undone.')) {
                        setInvestments([]);
                        setNotification({ message: 'All investments deleted', type: 'success' });
                      }
                    }} 
                    className="btn bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Investments
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-6 shadow-inner theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
