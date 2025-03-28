import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import {
  Upload,
  Download,
  Plus,
  Trash2,
  Edit,
  Search,
  SortAsc,
  SortDesc,
  FileSpreadsheet,
  Filter,
  ChevronDown,
  PieChart,
  BarChart,
  LineChart,
  DollarSign,
  Euro,
  Sun,
  Moon,
  X,
  Save,
  Info,
  AlertCircle
} from 'lucide-react';
import styles from './styles/styles.module.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title
);

function App() {
  // Types and interfaces
  type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF';
  type AssetClass = 'Stocks' | 'Bonds' | 'Real Estate' | 'Cash' | 'Commodities' | 'Alternative';
  type Region = 'Western Europe' | 'Eastern Europe' | 'Northern Europe' | 'Southern Europe' | 'Pan-European';
  type InvestmentStatus = 'Active' | 'Sold' | 'Pending';
  
  interface Investment {
    id: string;
    name: string;
    amount: number;
    currency: Currency;
    assetClass: AssetClass;
    region: Region;
    purchaseDate: string;
    status: InvestmentStatus;
    annualReturn?: number;
    notes?: string;
  }

  interface FormattedInvestment extends Investment {
    formattedAmount: string;
    formattedDate: string;
    formattedReturn: string;
  }

  interface FilterState {
    assetClass: AssetClass | 'All';
    region: Region | 'All';
    status: InvestmentStatus | 'All';
    minAmount: number | null;
    maxAmount: number | null;
  }

  interface SortState {
    field: keyof Investment | '';
    direction: 'asc' | 'desc';
  }

  // State definitions
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    assetClass: 'All',
    region: 'All',
    status: 'All',
    minAmount: null,
    maxAmount: null
  });
  const [sort, setSort] = useState<SortState>({ field: '', direction: 'asc' });
  const [activeView, setActiveView] = useState<'table' | 'pie' | 'bar' | 'line'>('table');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form handling
  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<Investment>({});

  // Effect for dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Load data from localStorage
  useEffect(() => {
    const storedInvestments = localStorage.getItem('investments');
    if (storedInvestments) {
      setInvestments(JSON.parse(storedInvestments));
    } else {
      // Sample data if no existing data
      const sampleData: Investment[] = [
        {
          id: '1',
          name: 'European Growth Fund',
          amount: 50000,
          currency: 'EUR',
          assetClass: 'Stocks',
          region: 'Western Europe',
          purchaseDate: '2022-01-15',
          status: 'Active',
          annualReturn: 7.5,
          notes: 'High growth potential'
        },
        {
          id: '2',
          name: 'Swiss Bond Portfolio',
          amount: 75000,
          currency: 'CHF',
          assetClass: 'Bonds',
          region: 'Western Europe',
          purchaseDate: '2021-11-20',
          status: 'Active',
          annualReturn: 2.3,
          notes: 'Conservative investment'
        },
        {
          id: '3',
          name: 'London Property Fund',
          amount: 120000,
          currency: 'GBP',
          assetClass: 'Real Estate',
          region: 'Northern Europe',
          purchaseDate: '2020-08-05',
          status: 'Active',
          annualReturn: 5.1
        }
      ];
      setInvestments(sampleData);
      localStorage.setItem('investments', JSON.stringify(sampleData));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever investments change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('investments', JSON.stringify(investments));
    }
  }, [investments, isLoading]);

  // Functions for investment management
  const addInvestment = (data: Investment) => {
    const newInvestment = {
      ...data,
      id: Date.now().toString()
    };
    setInvestments([...investments, newInvestment]);
    setIsModalOpen(false);
    showNotification('Investment added successfully', 'success');
    reset();
  };

  const updateInvestment = (data: Investment) => {
    if (!selectedInvestment) return;
    
    const updatedInvestments = investments.map(inv => 
      inv.id === selectedInvestment.id ? { ...data, id: selectedInvestment.id } : inv
    );
    
    setInvestments(updatedInvestments);
    setIsModalOpen(false);
    setSelectedInvestment(null);
    showNotification('Investment updated successfully', 'success');
    reset();
  };

  const deleteInvestment = () => {
    if (!selectedInvestment) return;
    
    const updatedInvestments = investments.filter(inv => inv.id !== selectedInvestment.id);
    setInvestments(updatedInvestments);
    setIsDeleteModalOpen(false);
    setSelectedInvestment(null);
    showNotification('Investment deleted successfully', 'success');
  };

  const openAddModal = () => {
    setSelectedInvestment(null);
    reset({
      name: '',
      amount: 0,
      currency: 'EUR',
      assetClass: 'Stocks',
      region: 'Western Europe',
      purchaseDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'Active',
      annualReturn: 0,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    reset(investment);
    setIsModalOpen(true);
  };

  const openDeleteModal = (investment: Investment) => {
    setSelectedInvestment(investment);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvestment(null);
    reset();
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedInvestment(null);
  };

  // Search and filtering
  const filteredInvestments = investments.filter(inv => {
    let matchesSearch = true;
    let matchesFilters = true;
    
    // Search term filter
    if (searchTerm) {
      matchesSearch = inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inv.status.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    // Asset class filter
    if (filters.assetClass !== 'All' && inv.assetClass !== filters.assetClass) {
      matchesFilters = false;
    }
    
    // Region filter
    if (filters.region !== 'All' && inv.region !== filters.region) {
      matchesFilters = false;
    }
    
    // Status filter
    if (filters.status !== 'All' && inv.status !== filters.status) {
      matchesFilters = false;
    }
    
    // Amount range filter
    if (filters.minAmount !== null && inv.amount < filters.minAmount) {
      matchesFilters = false;
    }
    
    if (filters.maxAmount !== null && inv.amount > filters.maxAmount) {
      matchesFilters = false;
    }
    
    return matchesSearch && matchesFilters;
  });

  // Sorting function
  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    if (sort.field) {
      const fieldA = a[sort.field];
      const fieldB = b[sort.field];
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sort.direction === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sort.direction === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      } else if (fieldA instanceof Date && fieldB instanceof Date) {
        return sort.direction === 'asc'
          ? fieldA.getTime() - fieldB.getTime()
          : fieldB.getTime() - fieldA.getTime();
      }
    }
    return 0;
  });

  const toggleSort = (field: keyof Investment) => {
    setSort(prevSort => ({
      field,
      direction: prevSort.field === field && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Format data for display
  const formatCurrency = (amount: number, currency: Currency): string => {
    const formatter = new Intl.NumberFormatter('en-EU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    return formatter.format(amount);
  };

  const formatDate = (dateString: string): string => {
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    return `${value.toFixed(1)}%`;
  };

  // Prepare chart data
  const prepareChartData = () => {
    // For asset class distribution
    const assetClassData = {
      labels: [] as string[],
      datasets: [
        {
          data: [] as number[],
          backgroundColor: [
            '#4F46E5', // indigo-600
            '#0891B2', // cyan-600
            '#059669', // emerald-600
            '#D97706', // amber-600
            '#DC2626', // red-600
            '#7C3AED'  // purple-600
          ],
          borderWidth: 1,
        },
      ],
    };

    const assetClassTotals: Record<AssetClass, number> = {
      'Stocks': 0,
      'Bonds': 0,
      'Real Estate': 0,
      'Cash': 0,
      'Commodities': 0,
      'Alternative': 0
    };

    // Calculate totals for each asset class
    filteredInvestments.forEach(inv => {
      assetClassTotals[inv.assetClass] += inv.amount;
    });

    // Populate chart data
    Object.entries(assetClassTotals).forEach(([assetClass, total]) => {
      if (total > 0) {
        assetClassData.labels.push(assetClass);
        assetClassData.datasets[0].data.push(total);
      }
    });

    // For region distribution
    const regionData = {
      labels: ['Western Europe', 'Eastern Europe', 'Northern Europe', 'Southern Europe', 'Pan-European'],
      datasets: [
        {
          label: 'Investment by Region',
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            'rgba(79, 70, 229, 0.6)', // indigo
            'rgba(8, 145, 178, 0.6)', // cyan
            'rgba(5, 150, 105, 0.6)', // emerald
            'rgba(217, 119, 6, 0.6)', // amber
            'rgba(220, 38, 38, 0.6)'  // red
          ],
          borderColor: [
            'rgba(79, 70, 229, 1)',
            'rgba(8, 145, 178, 1)',
            'rgba(5, 150, 105, 1)',
            'rgba(217, 119, 6, 1)',
            'rgba(220, 38, 38, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };

    // Calculate totals for each region
    const regionIndex: Record<Region, number> = {
      'Western Europe': 0,
      'Eastern Europe': 1,
      'Northern Europe': 2,
      'Southern Europe': 3,
      'Pan-European': 4
    };

    filteredInvestments.forEach(inv => {
      const index = regionIndex[inv.region];
      regionData.datasets[0].data[index] += inv.amount;
    });

    // For performance over time
    const timeData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Performance 2023',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => Math.random() * 10),
          borderColor: 'rgba(79, 70, 229, 1)',
          backgroundColor: 'rgba(79, 70, 229, 0.2)',
          tension: 0.3,
        },
        {
          label: 'Performance 2024',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0].map(() => Math.random() * 10),
          borderColor: 'rgba(5, 150, 105, 1)',
          backgroundColor: 'rgba(5, 150, 105, 0.2)',
          tension: 0.3,
        }
      ],
    };

    return { assetClassData, regionData, timeData };
  };

  const chartData = prepareChartData();

  // CSV Export & Import
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Name', 'Amount', 'Currency', 'Asset Class', 'Region', 'Purchase Date', 'Status', 'Annual Return', 'Notes'];
    const rows = investments.map(inv => [
      inv.name,
      inv.amount,
      inv.currency,
      inv.assetClass,
      inv.region,
      inv.purchaseDate,
      inv.status,
      inv.annualReturn || '',
      inv.notes || ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape commas, quotes, etc.
        if (cell === null || cell === undefined) return '';
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `investments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Data exported successfully', 'success');
  };

  const downloadTemplate = () => {
    // Create template CSV
    const headers = ['Name', 'Amount', 'Currency', 'Asset Class', 'Region', 'Purchase Date', 'Status', 'Annual Return', 'Notes'];
    const example = [
      'European Growth Fund',
      '50000',
      'EUR',
      'Stocks',
      'Western Europe',
      '2023-01-15',
      'Active',
      '7.5',
      'Example investment notes'
    ];
    
    const csvContent = [
      headers.join(','),
      example.join(',')
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'investment_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('Template downloaded successfully', 'success');
  };

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n');
    return lines.map(line => {
      let inQuotes = false;
      let currentStr = '';
      const result: string[] = [];
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (i < line.length - 1 && line[i + 1] === '"') {
            // Double quotes inside quoted string
            currentStr += '"';
            i++;
          } else {
            // Toggle quote mode
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          // End of field
          result.push(currentStr);
          currentStr = '';
        } else {
          currentStr += char;
        }
      }
      
      result.push(currentStr); // Add the last field
      return result;
    });
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = parseCSV(content);
        
        if (data.length < 2) {
          throw new Error('File contains no data rows');
        }
        
        const headers = data[0];
        const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
        const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
        const currencyIndex = headers.findIndex(h => h.toLowerCase() === 'currency');
        const assetClassIndex = headers.findIndex(h => h.toLowerCase() === 'asset class');
        const regionIndex = headers.findIndex(h => h.toLowerCase() === 'region');
        const dateIndex = headers.findIndex(h => h.toLowerCase() === 'purchase date');
        const statusIndex = headers.findIndex(h => h.toLowerCase() === 'status');
        const returnIndex = headers.findIndex(h => h.toLowerCase() === 'annual return');
        const notesIndex = headers.findIndex(h => h.toLowerCase() === 'notes');
        
        if (nameIndex === -1 || amountIndex === -1 || currencyIndex === -1 || 
            assetClassIndex === -1 || regionIndex === -1 || dateIndex === -1 || 
            statusIndex === -1) {
          throw new Error('Required columns missing in the CSV file');
        }
        
        const newInvestments: Investment[] = [];
        
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row.length < headers.length || !row[nameIndex]) continue; // Skip empty rows
          
          const investmentData: Investment = {
            id: Date.now().toString() + i,
            name: row[nameIndex],
            amount: parseFloat(row[amountIndex]),
            currency: row[currencyIndex] as Currency,
            assetClass: row[assetClassIndex] as AssetClass,
            region: row[regionIndex] as Region,
            purchaseDate: row[dateIndex],
            status: row[statusIndex] as InvestmentStatus,
            annualReturn: returnIndex !== -1 && row[returnIndex] ? parseFloat(row[returnIndex]) : undefined,
            notes: notesIndex !== -1 ? row[notesIndex] : undefined
          };
          
          if (!isNaN(investmentData.amount)) {
            newInvestments.push(investmentData);
          }
        }
        
        if (newInvestments.length === 0) {
          throw new Error('No valid investments found in the file');
        }
        
        setInvestments([...investments, ...newInvestments]);
        showNotification(`Imported ${newInvestments.length} investments successfully`, 'success');
      } catch (error) {
        showNotification(`Import error: ${(error as Error).message}`, 'error');
      }
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.onerror = () => {
      showNotification('Error reading the file', 'error');
    };
    
    reader.readAsText(file);
  };

  // Show notifications
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getCurrencyIcon = (currency: Currency) => {
    switch (currency) {
      case 'EUR':
        return <Euro className="h-4 w-4" />;
      case 'USD':
        return <DollarSign className="h-4 w-4" />;
      case 'GBP':
        return <span className="font-semibold">£</span>;
      case 'CHF':
        return <span className="font-semibold">CHF</span>;
      default:
        return null;
    }
  };

  // Render table and charts
  const renderInvestmentTable = () => {
    return (
      <div className="table-container mt-6 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="table w-full">
          <thead>
            <tr>
              <th className="table-header" onClick={() => toggleSort('name')}>
                <div className="flex items-center justify-between">
                  <span>Name</span>
                  {sort.field === 'name' && (
                    sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="table-header" onClick={() => toggleSort('amount')}>
                <div className="flex items-center justify-between">
                  <span>Amount</span>
                  {sort.field === 'amount' && (
                    sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="table-header hidden sm:table-cell" onClick={() => toggleSort('assetClass')}>
                <div className="flex items-center justify-between">
                  <span>Asset Class</span>
                  {sort.field === 'assetClass' && (
                    sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="table-header hidden md:table-cell" onClick={() => toggleSort('region')}>
                <div className="flex items-center justify-between">
                  <span>Region</span>
                  {sort.field === 'region' && (
                    sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="table-header hidden lg:table-cell" onClick={() => toggleSort('purchaseDate')}>
                <div className="flex items-center justify-between">
                  <span>Date</span>
                  {sort.field === 'purchaseDate' && (
                    sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="table-header hidden md:table-cell" onClick={() => toggleSort('status')}>
                <div className="flex items-center justify-between">
                  <span>Status</span>
                  {sort.field === 'status' && (
                    sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="table-header hidden lg:table-cell" onClick={() => toggleSort('annualReturn')}>
                <div className="flex items-center justify-between">
                  <span>Return</span>
                  {sort.field === 'annualReturn' && (
                    sort.direction === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="table-header text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedInvestments.length === 0 ? (
              <tr>
                <td colSpan={8} className="table-cell text-center py-12">
                  <div className="flex flex-col items-center space-y-3">
                    <AlertCircle className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No investments found</p>
                    <button 
                      className="btn btn-primary flex items-center gap-2 mt-2"
                      onClick={openAddModal}
                    >
                      <Plus className="h-4 w-4" /> Add Investment
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              sortedInvestments.map(inv => (
                <tr 
                  key={inv.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 text-left cursor-pointer transition-colors"
                >
                  <td className="table-cell font-medium text-gray-900 dark:text-white">{inv.name}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      {getCurrencyIcon(inv.currency)}
                      <span>{inv.amount.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="table-cell hidden sm:table-cell">{inv.assetClass}</td>
                  <td className="table-cell hidden md:table-cell">{inv.region}</td>
                  <td className="table-cell hidden lg:table-cell">{formatDate(inv.purchaseDate)}</td>
                  <td className="table-cell hidden md:table-cell">
                    <span className={`badge ${inv.status === 'Active' ? 'badge-success' : inv.status === 'Sold' ? 'badge-error' : 'badge-warning'}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="table-cell hidden lg:table-cell">{formatPercentage(inv.annualReturn)}</td>
                  <td className="table-cell text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        className="btn-sm bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                        onClick={() => openEditModal(inv)}
                        aria-label="Edit investment"
                        name="edit-investment"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="btn-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                        onClick={() => openDeleteModal(inv)}
                        aria-label="Delete investment"
                        name="delete-investment"
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
    );
  };

  const renderCharts = () => {
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Asset Allocation</h3>
          <div className="flex justify-center" style={{ height: '250px' }}>
            {chartData.assetClassData.labels.length > 0 ? (
              <Pie data={chartData.assetClassData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <AlertCircle className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Regional Distribution</h3>
          <div className="flex justify-center" style={{ height: '250px' }}>
            <Bar 
              data={chartData.regionData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </div>
        </div>
        
        <div className="card bg-white dark:bg-gray-800 p-4 rounded-lg shadow md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Over Time</h3>
          <div className="flex justify-center" style={{ height: '250px' }}>
            <Line 
              data={chartData.timeData} 
              options={{
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Investment Portfolio Manager</h1>
            
            <div className="flex items-center space-x-2">
              <button 
                className="theme-toggle"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                name="theme-toggle"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid px-4 sm:px-6 py-8">
        {/* Action Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              className="btn btn-primary flex items-center justify-center gap-2"
              onClick={openAddModal}
              aria-label="Add new investment"
              name="add-investment"
            >
              <Plus className="h-4 w-4" /> Add Investment
            </button>
            
            <div className="relative">
              <button 
                className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                aria-label="Filter investments"
                name="filter-investments"
              >
                <Filter className="h-4 w-4" /> Filters
                <ChevronDown className="h-4 w-4" />
              </button>
              
              {isFilterMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-10">
                  <div className="p-4 space-y-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="assetClassFilter">Asset Class</label>
                      <select 
                        id="assetClassFilter"
                        className="input"
                        value={filters.assetClass}
                        onChange={(e) => setFilters({...filters, assetClass: e.target.value as AssetClass | 'All'})}
                        name="asset-class-filter"
                      >
                        <option value="All">All Classes</option>
                        <option value="Stocks">Stocks</option>
                        <option value="Bonds">Bonds</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Cash">Cash</option>
                        <option value="Commodities">Commodities</option>
                        <option value="Alternative">Alternative</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="regionFilter">Region</label>
                      <select 
                        id="regionFilter"
                        className="input"
                        value={filters.region}
                        onChange={(e) => setFilters({...filters, region: e.target.value as Region | 'All'})}
                        name="region-filter"
                      >
                        <option value="All">All Regions</option>
                        <option value="Western Europe">Western Europe</option>
                        <option value="Eastern Europe">Eastern Europe</option>
                        <option value="Northern Europe">Northern Europe</option>
                        <option value="Southern Europe">Southern Europe</option>
                        <option value="Pan-European">Pan-European</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="statusFilter">Status</label>
                      <select 
                        id="statusFilter"
                        className="input"
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value as InvestmentStatus | 'All'})}
                        name="status-filter"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Sold">Sold</option>
                        <option value="Pending">Pending</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="minAmount">Min Amount</label>
                        <input 
                          id="minAmount"
                          type="number"
                          className="input"
                          placeholder="Min"
                          value={filters.minAmount ?? ''}
                          onChange={(e) => setFilters({...filters, minAmount: e.target.value ? parseInt(e.target.value) : null})}
                          name="min-amount-filter"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="maxAmount">Max Amount</label>
                        <input 
                          id="maxAmount"
                          type="number"
                          className="input"
                          placeholder="Max"
                          value={filters.maxAmount ?? ''}
                          onChange={(e) => setFilters({...filters, maxAmount: e.target.value ? parseInt(e.target.value) : null})}
                          name="max-amount-filter"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setFilters({
                            assetClass: 'All',
                            region: 'All',
                            status: 'All',
                            minAmount: null,
                            maxAmount: null
                          });
                        }}
                        aria-label="Reset filters"
                        name="reset-filters"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              <div className="form-group mb-0 flex-1">
                <div className="relative">
                  <input
                    type="text"
                    className="input pl-9 w-full"
                    placeholder="Search investments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search investments"
                    name="search-investments"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="btn-group">
              <button 
                className={`btn-groupitem ${activeView === 'table' ? 'btn-groupitem-active' : ''}`}
                onClick={() => setActiveView('table')}
                aria-label="Table view"
                name="table-view"
              >
                <FileSpreadsheet className="h-4 w-4" />
              </button>
              <button 
                className={`btn-groupitem ${activeView === 'pie' ? 'btn-groupitem-active' : ''}`}
                onClick={() => setActiveView('pie')}
                aria-label="Pie chart view"
                name="pie-chart-view"
              >
                <PieChart className="h-4 w-4" />
              </button>
              <button 
                className={`btn-groupitem ${activeView === 'bar' ? 'btn-groupitem-active' : ''}`}
                onClick={() => setActiveView('bar')}
                aria-label="Bar chart view"
                name="bar-chart-view"
              >
                <BarChart className="h-4 w-4" />
              </button>
              <button 
                className={`btn-groupitem ${activeView === 'line' ? 'btn-groupitem-active' : ''}`}
                onClick={() => setActiveView('line')}
                aria-label="Line chart view"
                name="line-chart-view"
              >
                <LineChart className="h-4 w-4" />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button 
                className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={exportToCSV}
                aria-label="Export to CSV"
                name="export-csv"
              >
                <Download className="h-4 w-4" /> Export
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  id="csvImport"
                  className="hidden"
                  accept=".csv"
                  onChange={importFromCSV}
                  ref={fileInputRef}
                  name="import-csv"
                />
                <button 
                  className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Import from CSV"
                  name="import-button"
                >
                  <Upload className="h-4 w-4" /> Import
                </button>
              </div>
              
              <button 
                className="btn btn-secondary flex items-center justify-center gap-2 w-full sm:w-auto"
                onClick={downloadTemplate}
                aria-label="Download template"
                name="download-template"
              >
                <Download className="h-4 w-4" /> Template
              </button>
            </div>
          </div>
        </div>
        
        {/* Dashboard Content */}
        <div className="space-y-6">
          {/* Investment Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat-card">
              <div className="stat-title">Total Investments</div>
              <div className="stat-value">{investments.length}</div>
              <div className="stat-desc">{investments.filter(inv => inv.status === 'Active').length} active investments</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">Total Portfolio Value</div>
              <div className="stat-value">
                {formatCurrency(
                  investments.reduce((sum, inv) => sum + inv.amount, 0), 
                  'EUR'
                )}
              </div>
              <div className="stat-desc">Across {new Set(investments.map(inv => inv.currency)).size} currencies</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">Average Annual Return</div>
              <div className="stat-value">
                {investments.length > 0 
                  ? formatPercentage(
                      investments
                        .filter(inv => inv.annualReturn !== undefined)
                        .reduce((sum, inv) => sum + (inv.annualReturn || 0), 0) / 
                      investments.filter(inv => inv.annualReturn !== undefined).length
                    )
                  : 'N/A'}
              </div>
              <div className="stat-desc">Based on reported returns</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-title">Asset Classes</div>
              <div className="stat-value">{new Set(investments.map(inv => inv.assetClass)).size}</div>
              <div className="stat-desc">Spread across {new Set(investments.map(inv => inv.region)).size} regions</div>
            </div>
          </div>
          
          {/* Investments Table/Charts */}
          {isLoading ? (
            <div className="space-y-3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="skeleton-text w-1/2"></div>
              <div className="skeleton-text w-full"></div>
              <div className="skeleton-text w-2/3"></div>
              <div className="skeleton-text w-full"></div>
              <div className="skeleton-text w-3/4"></div>
            </div>
          ) : (
            <>
              {activeView === 'table' && renderInvestmentTable()}
              {(activeView === 'pie' || activeView === 'bar' || activeView === 'line') && renderCharts()}
            </>
          )}
        </div>
      </main>

      {/* Add/Edit Investment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedInvestment ? 'Edit Investment' : 'Add New Investment'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" 
                onClick={closeModal}
                aria-label="Close modal"
                name="close-modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(selectedInvestment ? updateInvestment : addInvestment)} className="mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="name">Investment Name</label>
                  <input 
                    id="name"
                    type="text" 
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="European Growth Fund"
                    {...register('name', { required: true })}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    name="investment-name"
                  />
                  {errors.name && <p className="form-error">Investment name is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">Amount</label>
                  <input 
                    id="amount"
                    type="number" 
                    className={`input ${errors.amount ? 'border-red-500' : ''}`}
                    placeholder="50000"
                    step="0.01"
                    min="0"
                    {...register('amount', { 
                      required: true,
                      valueAsNumber: true,
                      min: 0
                    })}
                    aria-invalid={errors.amount ? 'true' : 'false'}
                    name="investment-amount"
                  />
                  {errors.amount && <p className="form-error">Valid amount is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select 
                    id="currency"
                    className={`input ${errors.currency ? 'border-red-500' : ''}`}
                    {...register('currency', { required: true })}
                    aria-invalid={errors.currency ? 'true' : 'false'}
                    name="investment-currency"
                  >
                    <option value="EUR">Euro (EUR)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="GBP">British Pound (GBP)</option>
                    <option value="CHF">Swiss Franc (CHF)</option>
                  </select>
                  {errors.currency && <p className="form-error">Currency is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="assetClass">Asset Class</label>
                  <select 
                    id="assetClass"
                    className={`input ${errors.assetClass ? 'border-red-500' : ''}`}
                    {...register('assetClass', { required: true })}
                    aria-invalid={errors.assetClass ? 'true' : 'false'}
                    name="investment-asset-class"
                  >
                    <option value="Stocks">Stocks</option>
                    <option value="Bonds">Bonds</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Cash">Cash</option>
                    <option value="Commodities">Commodities</option>
                    <option value="Alternative">Alternative</option>
                  </select>
                  {errors.assetClass && <p className="form-error">Asset class is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="region">Region</label>
                  <select 
                    id="region"
                    className={`input ${errors.region ? 'border-red-500' : ''}`}
                    {...register('region', { required: true })}
                    aria-invalid={errors.region ? 'true' : 'false'}
                    name="investment-region"
                  >
                    <option value="Western Europe">Western Europe</option>
                    <option value="Eastern Europe">Eastern Europe</option>
                    <option value="Northern Europe">Northern Europe</option>
                    <option value="Southern Europe">Southern Europe</option>
                    <option value="Pan-European">Pan-European</option>
                  </select>
                  {errors.region && <p className="form-error">Region is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="purchaseDate">Purchase Date</label>
                  <input 
                    id="purchaseDate"
                    type="date" 
                    className={`input ${errors.purchaseDate ? 'border-red-500' : ''}`}
                    {...register('purchaseDate', { required: true })}
                    aria-invalid={errors.purchaseDate ? 'true' : 'false'}
                    name="investment-purchase-date"
                  />
                  {errors.purchaseDate && <p className="form-error">Purchase date is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select 
                    id="status"
                    className={`input ${errors.status ? 'border-red-500' : ''}`}
                    {...register('status', { required: true })}
                    aria-invalid={errors.status ? 'true' : 'false'}
                    name="investment-status"
                  >
                    <option value="Active">Active</option>
                    <option value="Sold">Sold</option>
                    <option value="Pending">Pending</option>
                  </select>
                  {errors.status && <p className="form-error">Status is required</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="annualReturn">
                    Annual Return (%)
                    <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                  </label>
                  <input 
                    id="annualReturn"
                    type="number" 
                    className="input"
                    placeholder="7.5"
                    step="0.1"
                    {...register('annualReturn', { 
                      valueAsNumber: true,
                      min: -100,
                      max: 1000
                    })}
                    name="investment-annual-return"
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="notes">
                    Notes
                    <span className="text-gray-500 text-xs ml-1">(Optional)</span>
                  </label>
                  <textarea 
                    id="notes"
                    className="input min-h-[80px]"
                    placeholder="Additional information about this investment..."
                    {...register('notes')}
                    name="investment-notes"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={closeModal}
                  aria-label="Cancel"
                  name="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center gap-2"
                  aria-label="Save investment"
                  name="save-investment"
                >
                  <Save className="h-4 w-4" /> {selectedInvestment ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" 
                onClick={closeDeleteModal}
                aria-label="Close delete modal"
                name="close-delete-modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete the investment 
                    <span className="font-medium text-gray-700 dark:text-gray-300"> {selectedInvestment?.name}</span>? 
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={closeDeleteModal}
                aria-label="Cancel deletion"
                name="cancel-delete"
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 flex items-center gap-2"
                onClick={deleteInvestment}
                aria-label="Confirm deletion"
                name="confirm-delete"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed bottom-4 right-4 max-w-md z-50 fade-in ${notification.type === 'success' ? 'alert alert-success' : 'alert alert-error'}`}>
          <div className="flex items-start">
            {notification.type === 'success' ? 
              <Info className="h-5 w-5" /> : 
              <AlertCircle className="h-5 w-5" />}
            <p className="ml-3">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container-fluid px-4 sm:px-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
