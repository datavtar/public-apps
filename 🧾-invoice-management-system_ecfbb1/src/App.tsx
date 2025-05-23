import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download, Upload, FileText, DollarSign, Calendar, Clock, User, Building, AlertCircle, CheckCircle, XCircle, Sun, Moon, X, ArrowUp, ArrowDown } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  items: InvoiceItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface FilterState {
  status: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
}

type SortField = 'invoiceNumber' | 'clientName' | 'issueDate' | 'dueDate' | 'totalAmount' | 'status';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State Management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    dateRange: '',
    minAmount: '',
    maxAmount: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: 'draft',
    description: '',
    items: [],
    notes: ''
  });
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{
    id: '1',
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0
  }]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      try {
        const parsedInvoices = JSON.parse(savedInvoices);
        setInvoices(Array.isArray(parsedInvoices) ? parsedInvoices : []);
      } catch (err) {
        console.error('Error parsing saved invoices:', err);
        setInvoices([]);
      }
    }
  }, []);

  // Save invoices to localStorage whenever invoices change
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Modal effects
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        closeViewModal();
        setIsFilterOpen(false);
      }
    };

    if (isModalOpen || isViewModalOpen || isFilterOpen) {
      document.body.classList.add('modal-open');
      document.addEventListener('keydown', handleEscape);
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen, isViewModalOpen, isFilterOpen]);

  // Utility Functions
  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const existingNumbers = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith(`INV-${year}${month}`))
      .map(num => parseInt(num.split('-')[2]) || 0);
    const nextNumber = Math.max(0, ...existingNumbers) + 1;
    return `INV-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
  };

  const calculateItemAmount = (quantity: number, rate: number): number => {
    return quantity * rate;
  };

  const calculateTotals = (items: InvoiceItem[], taxRate: number = 0.1): { amount: number; taxAmount: number; totalAmount: number } => {
    const amount = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = amount * taxRate;
    const totalAmount = amount + taxAmount;
    return { amount, taxAmount, totalAmount };
  };

  const getStatusColor = (status: Invoice['status']): string => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'sent': return 'badge-info';
      case 'overdue': return 'badge-error';
      case 'cancelled': return 'badge-error';
      case 'draft': return 'badge-warning';
      default: return 'badge-info';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'draft': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Form Functions
  const resetForm = () => {
    setFormData({
      invoiceNumber: generateInvoiceNumber(),
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      amount: 0,
      taxAmount: 0,
      totalAmount: 0,
      status: 'draft',
      description: '',
      items: [],
      notes: ''
    });
    setFormItems([{
      id: '1',
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }]);
  };

  const handleInputChange = (field: keyof Invoice, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...formItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = calculateItemAmount(
        updatedItems[index].quantity,
        updatedItems[index].rate
      );
    }
    
    setFormItems(updatedItems);
    
    const totals = calculateTotals(updatedItems);
    setFormData(prev => ({
      ...prev,
      amount: totals.amount,
      taxAmount: totals.taxAmount,
      totalAmount: totals.totalAmount
    }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: String(formItems.length + 1),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setFormItems([...formItems, newItem]);
  };

  const removeItem = (index: number) => {
    if (formItems.length > 1) {
      const updatedItems = formItems.filter((_, i) => i !== index);
      setFormItems(updatedItems);
      
      const totals = calculateTotals(updatedItems);
      setFormData(prev => ({
        ...prev,
        amount: totals.amount,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount
      }));
    }
  };

  // CRUD Operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (!formData.clientName?.trim() || !formData.clientEmail?.trim() || !formData.dueDate) {
        throw new Error('Please fill in all required fields');
      }
      
      const now = new Date().toISOString();
      const invoiceData: Invoice = {
        id: selectedInvoice?.id || `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        invoiceNumber: formData.invoiceNumber || generateInvoiceNumber(),
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientAddress: formData.clientAddress || '',
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: formData.dueDate,
        amount: formData.amount || 0,
        taxAmount: formData.taxAmount || 0,
        totalAmount: formData.totalAmount || 0,
        status: formData.status || 'draft',
        description: formData.description || '',
        items: formItems,
        notes: formData.notes || '',
        createdAt: selectedInvoice?.createdAt || now,
        updatedAt: now
      };
      
      if (selectedInvoice) {
        setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? invoiceData : inv));
      } else {
        setInvoices(prev => [invoiceData, ...prev]);
      }
      
      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setFormData(invoice);
    setFormItems(invoice.items || []);
    openModal();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handleView = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
  };

  // Modal Functions
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
    resetForm();
    setError(null);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedInvoice(null);
  };

  // Filter and Search Functions
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filters.status || invoice.status === filters.status;
    
    const matchesAmount = 
      (!filters.minAmount || invoice.totalAmount >= parseFloat(filters.minAmount)) &&
      (!filters.maxAmount || invoice.totalAmount <= parseFloat(filters.maxAmount));
    
    let matchesDate = true;
    if (filters.dateRange) {
      const invoiceDate = new Date(invoice.issueDate);
      const today = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          matchesDate = invoiceDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= monthAgo;
          break;
        case 'year':
          const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= yearAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesAmount && matchesDate;
  });

  // Sorting
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (sortField === 'issueDate' || sortField === 'dueDate') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (sortField === 'totalAmount') {
      aValue = parseFloat(String(aValue));
      bValue = parseFloat(String(bValue));
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export Functions
  const exportToCSV = () => {
    const headers = [
      'Invoice Number',
      'Client Name',
      'Client Email',
      'Issue Date',
      'Due Date',
      'Amount',
      'Tax Amount',
      'Total Amount',
      'Status',
      'Description'
    ];
    
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(invoice => [
        `"${invoice.invoiceNumber}"`,
        `"${invoice.clientName}"`,
        `"${invoice.clientEmail}"`,
        `"${invoice.issueDate}"`,
        `"${invoice.dueDate}"`,
        invoice.amount,
        invoice.taxAmount,
        invoice.totalAmount,
        `"${invoice.status}"`,
        `"${invoice.description}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const headers = [
      'Invoice Number',
      'Client Name',
      'Client Email',
      'Client Address',
      'Issue Date (YYYY-MM-DD)',
      'Due Date (YYYY-MM-DD)',
      'Amount',
      'Tax Amount',
      'Total Amount',
      'Status (draft/sent/paid/overdue/cancelled)',
      'Description',
      'Notes'
    ];
    
    const sampleData = [
      'INV-202501-0001',
      'Sample Client Inc.',
      'client@example.com',
      '123 Business St, City, State 12345',
      '2025-01-15',
      '2025-02-15',
      '1000.00',
      '100.00',
      '1100.00',
      'draft',
      'Sample invoice description',
      'Sample notes'
    ];
    
    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'invoice_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const newInvoices: Invoice[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length < headers.length) continue;
          
          const invoice: Invoice = {
            id: `imp_${Date.now()}_${i}`,
            invoiceNumber: values[0] || generateInvoiceNumber(),
            clientName: values[1] || '',
            clientEmail: values[2] || '',
            clientAddress: values[3] || '',
            issueDate: values[4] || new Date().toISOString().split('T')[0],
            dueDate: values[5] || '',
            amount: parseFloat(values[6]) || 0,
            taxAmount: parseFloat(values[7]) || 0,
            totalAmount: parseFloat(values[8]) || 0,
            status: (values[9] as Invoice['status']) || 'draft',
            description: values[10] || '',
            notes: values[11] || '',
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          
          newInvoices.push(invoice);
        }
        
        setInvoices(prev => [...newInvoices, ...prev]);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
  };

  // Statistics
  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'sent').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalRevenue: invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0),
    pendingRevenue: invoices
      .filter(inv => ['sent', 'overdue'].includes(inv.status))
      .reduce((sum, inv) => sum + inv.totalAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <div className="flex-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Manage your invoices and track payments</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Statistics */}
      <div className="container-wide py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div className="stat-title">Total Invoices</div>
            </div>
            <div className="stat-value">{stats.total}</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="stat-title">Paid</div>
            </div>
            <div className="stat-value">{stats.paid}</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div className="stat-title">Pending</div>
            </div>
            <div className="stat-value">{stats.pending}</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="stat-title">Overdue</div>
            </div>
            <div className="stat-value">{stats.overdue}</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div className="stat-title">Revenue</div>
            </div>
            <div className="stat-value text-lg">{formatCurrency(stats.totalRevenue)}</div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <div className="stat-title">Pending Revenue</div>
            </div>
            <div className="stat-value text-lg">{formatCurrency(stats.pendingRevenue)}</div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search invoices by number, client name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filter
              </button>
              
              <button
                onClick={exportToCSV}
                className="btn bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={downloadTemplate}
                className="btn bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Template
              </button>
              
              <label className="btn bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={() => {
                  resetForm();
                  setFormData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
                  openModal();
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Invoice
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterOpen && (
            <div className="border-t border-gray-200 dark:border-slate-600 pt-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="input"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="input"
                  >
                    <option value="">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                    <option value="year">Last year</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Min Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={filters.minAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Max Amount</label>
                  <input
                    type="number"
                    placeholder="999999.99"
                    value={filters.maxAmount}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setFilters({ status: '', dateRange: '', minAmount: '', maxAmount: '' })}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Invoices Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    <div className="flex items-center gap-1">
                      Invoice #
                      {sortField === 'invoiceNumber' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('clientName')}
                  >
                    <div className="flex items-center gap-1">
                      Client
                      {sortField === 'clientName' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('issueDate')}
                  >
                    <div className="flex items-center gap-1">
                      Issue Date
                      {sortField === 'issueDate' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center gap-1">
                      Due Date
                      {sortField === 'dueDate' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {sortField === 'totalAmount' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-12 h-12 text-gray-400" />
                        <p className="text-gray-500 dark:text-slate-400">
                          {searchTerm || Object.values(filters).some(f => f) ? 'No invoices found matching your criteria' : 'No invoices yet'}
                        </p>
                        {!searchTerm && !Object.values(filters).some(f => f) && (
                          <button
                            onClick={() => {
                              resetForm();
                              setFormData(prev => ({ ...prev, invoiceNumber: generateInvoiceNumber() }));
                              openModal();
                            }}
                            className="btn btn-primary flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Create your first invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">{invoice.clientName}</div>
                          <div className="text-sm text-gray-500 dark:text-slate-400">{invoice.clientEmail}</div>
                        </div>
                      </td>
                      <td className="table-cell">{formatDate(invoice.issueDate)}</td>
                      <td className="table-cell">{formatDate(invoice.dueDate)}</td>
                      <td className="table-cell font-medium">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="table-cell">
                        <span className={`badge ${getStatusColor(invoice.status)} flex items-center gap-1`}>
                          {getStatusIcon(invoice.status)}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleView(invoice)}
                            className="p-2 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            aria-label="View invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="p-2 text-gray-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            aria-label="Edit invoice"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            className="p-2 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            aria-label="Delete invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-slate-600">
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, sortedInvoices.length)} to{' '}
                {Math.min(currentPage * itemsPerPage, sortedInvoices.length)} of {sortedInvoices.length} invoices
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded text-sm ${
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Form Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Invoice Number *</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => handleInputChange('status', e.target.value as Invoice['status'])}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Client Information */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Client Information</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Client Name *</label>
                    <input
                      type="text"
                      value={formData.clientName || ''}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Client Email *</label>
                    <input
                      type="email"
                      value={formData.clientEmail || ''}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Client Address</label>
                  <textarea
                    value={formData.clientAddress || ''}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Dates</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Issue Date</label>
                    <input
                      type="date"
                      value={formData.issueDate || ''}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Due Date *</label>
                    <input
                      type="date"
                      value={formData.dueDate || ''}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="input"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Items</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <div className="md:col-span-4">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="input"
                          placeholder="Item description"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="input"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="form-label">Rate</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                          className="input"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="md:col-span-3">
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          value={item.amount}
                          className="input bg-gray-100 dark:bg-slate-600"
                          readOnly
                        />
                      </div>
                      
                      <div className="md:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={formItems.length === 1}
                          className="btn btn-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Subtotal</label>
                    <input
                      type="number"
                      value={formData.amount || 0}
                      className="input bg-gray-100 dark:bg-slate-600"
                      readOnly
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tax Amount (10%)</label>
                    <input
                      type="number"
                      value={formData.taxAmount || 0}
                      className="input bg-gray-100 dark:bg-slate-600"
                      readOnly
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Total Amount</label>
                    <input
                      type="number"
                      value={formData.totalAmount || 0}
                      className="input bg-gray-100 dark:bg-slate-600 font-semibold"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Description and Notes */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Invoice description"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="input"
                      rows={3}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isLoading}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {selectedInvoice ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedInvoice ? 'Update Invoice' : 'Create Invoice'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {isViewModalOpen && selectedInvoice && (
        <div className="modal-backdrop" onClick={closeViewModal}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Invoice Details
              </h3>
              <button
                onClick={closeViewModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedInvoice.invoiceNumber}</h2>
                  <p className="text-gray-500 dark:text-slate-400">Invoice Details</p>
                </div>
                <span className={`badge ${getStatusColor(selectedInvoice.status)} text-lg px-4 py-2 flex items-center gap-2`}>
                  {getStatusIcon(selectedInvoice.status)}
                  {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                </span>
              </div>

              {/* Client and Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Client Information
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                    <p className="font-medium">{selectedInvoice.clientName}</p>
                    <p className="text-gray-600 dark:text-slate-400">{selectedInvoice.clientEmail}</p>
                    {selectedInvoice.clientAddress && (
                      <p className="text-gray-600 dark:text-slate-400 mt-2">{selectedInvoice.clientAddress}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Important Dates
                  </h4>
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Issue Date:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.issueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-400">Due Date:</span>
                      <span className="font-medium">{formatDate(selectedInvoice.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Items</h4>
                  <div className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Description</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Rate</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                        {selectedInvoice.items.map((item, index) => (
                          <tr key={index} className="bg-white dark:bg-slate-800">
                            <td className="px-4 py-2 text-sm">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">{formatCurrency(item.rate)}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Tax:</span>
                    <span className="font-medium">{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-slate-600 pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Description and Notes */}
              {(selectedInvoice.description || selectedInvoice.notes) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedInvoice.description && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                      <p className="text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                        {selectedInvoice.description}
                      </p>
                    </div>
                  )}
                  
                  {selectedInvoice.notes && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                      <p className="text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                        {selectedInvoice.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={closeViewModal}
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              >
                Close
              </button>
              <button
                onClick={() => {
                  closeViewModal();
                  handleEdit(selectedInvoice);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 mt-12 theme-transition">
        <div className="container-wide">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;