import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  FileText, 
  DollarSign, 
  Calendar, 
  User, 
  Building2, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  X,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorEmail: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  category: string;
  paymentTerms: string;
  taxAmount: number;
  discount: number;
  subtotal: number;
  attachments?: string[];
}

interface InvoiceFormData {
  vendorName: string;
  vendorEmail: string;
  amount: string;
  dueDate: string;
  issueDate: string;
  status: Invoice['status'];
  description: string;
  category: string;
  paymentTerms: string;
  taxAmount: string;
  discount: string;
}

interface FilterState {
  status: string;
  category: string;
  dateRange: string;
  amountRange: string;
}

interface SortState {
  field: keyof Invoice | '';
  direction: 'asc' | 'desc';
}

const INVOICE_CATEGORIES = [
  'Office Supplies',
  'Software & Technology',
  'Marketing & Advertising',
  'Professional Services',
  'Utilities',
  'Travel & Expenses',
  'Equipment',
  'Maintenance',
  'Other'
];

const PAYMENT_TERMS = [
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Due on Receipt',
  'COD'
];

const SAMPLE_INVOICES: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    vendorName: 'TechCorp Solutions',
    vendorEmail: 'billing@techcorp.com',
    amount: 5500.00,
    dueDate: '2024-02-15',
    issueDate: '2024-01-15',
    status: 'sent',
    description: 'Monthly software licensing and support services',
    category: 'Software & Technology',
    paymentTerms: 'Net 30',
    taxAmount: 500.00,
    discount: 0,
    subtotal: 5000.00
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    vendorName: 'Office Depot',
    vendorEmail: 'accounts@officedepot.com',
    amount: 1250.75,
    dueDate: '2024-01-30',
    issueDate: '2024-01-10',
    status: 'overdue',
    description: 'Office supplies and equipment purchase',
    category: 'Office Supplies',
    paymentTerms: 'Net 15',
    taxAmount: 100.75,
    discount: 50.00,
    subtotal: 1200.00
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    vendorName: 'Creative Agency Pro',
    vendorEmail: 'finance@creativeagency.com',
    amount: 8750.00,
    dueDate: '2024-02-28',
    issueDate: '2024-01-28',
    status: 'paid',
    description: 'Q1 marketing campaign design and implementation',
    category: 'Marketing & Advertising',
    paymentTerms: 'Net 30',
    taxAmount: 750.00,
    discount: 0,
    subtotal: 8000.00
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    vendorName: 'Legal Associates LLC',
    vendorEmail: 'billing@legalassociates.com',
    amount: 3200.00,
    dueDate: '2024-02-10',
    issueDate: '2024-01-25',
    status: 'draft',
    description: 'Contract review and legal consultation services',
    category: 'Professional Services',
    paymentTerms: 'Net 15',
    taxAmount: 200.00,
    discount: 0,
    subtotal: 3000.00
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    vendorName: 'PowerGrid Utilities',
    vendorEmail: 'accounts@powergrid.com',
    amount: 892.45,
    dueDate: '2024-02-05',
    issueDate: '2024-01-20',
    status: 'sent',
    description: 'Monthly electricity and utilities',
    category: 'Utilities',
    paymentTerms: 'Net 15',
    taxAmount: 67.45,
    discount: 0,
    subtotal: 825.00
  }
];

export default function App() {
  // State Management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    status: '',
    category: '',
    dateRange: '',
    amountRange: ''
  });
  const [sortState, setSortState] = useState<SortState>({ field: '', direction: 'asc' });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [formData, setFormData] = useState<InvoiceFormData>({
    vendorName: '',
    vendorEmail: '',
    amount: '',
    dueDate: '',
    issueDate: '',
    status: 'draft',
    description: '',
    category: '',
    paymentTerms: 'Net 30',
    taxAmount: '',
    discount: ''
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      setInvoices(SAMPLE_INVOICES);
      localStorage.setItem('invoices', JSON.stringify(SAMPLE_INVOICES));
    }
  }, []);

  // Save to localStorage whenever invoices change
  useEffect(() => {
    if (invoices.length > 0) {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    }
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

  // Filter and search logic
  useEffect(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(invoice => invoice.status === filters.status);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(invoice => invoice.category === filters.category);
    }

    // Date range filter
    if (filters.dateRange) {
      const today = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'last7days':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'last30days':
          filterDate.setDate(today.getDate() - 30);
          break;
        case 'last90days':
          filterDate.setDate(today.getDate() - 90);
          break;
        default:
          break;
      }
      
      if (filters.dateRange !== '') {
        filtered = filtered.filter(invoice => 
          new Date(invoice.issueDate) >= filterDate
        );
      }
    }

    // Amount range filter
    if (filters.amountRange) {
      filtered = filtered.filter(invoice => {
        switch (filters.amountRange) {
          case 'under1000':
            return invoice.amount < 1000;
          case '1000to5000':
            return invoice.amount >= 1000 && invoice.amount <= 5000;
          case 'over5000':
            return invoice.amount > 5000;
          default:
            return true;
        }
      });
    }

    // Sorting
    if (sortState.field) {
      filtered.sort((a, b) => {
        const aVal = a[sortState.field as keyof Invoice];
        const bVal = b[sortState.field as keyof Invoice];
        
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortState.direction === 'asc' 
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortState.direction === 'asc' 
            ? aVal - bVal
            : bVal - aVal;
        }
        
        return 0;
      });
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [invoices, searchTerm, filters, sortState]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent' || inv.status === 'draft')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;
    
    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueCount,
      paidPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0
    };
  }, [invoices]);

  // Pagination
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Utility functions
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const resetForm = () => {
    setFormData({
      vendorName: '',
      vendorEmail: '',
      amount: '',
      dueDate: '',
      issueDate: '',
      status: 'draft',
      description: '',
      category: '',
      paymentTerms: 'Net 30',
      taxAmount: '',
      discount: ''
    });
  };

  const openModal = (mode: 'add' | 'edit' | 'view', invoice?: Invoice) => {
    setModalMode(mode);
    setSelectedInvoice(invoice || null);
    
    if (mode === 'add') {
      resetForm();
      setFormData(prev => ({
        ...prev,
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      }));
    } else if (invoice && (mode === 'edit' || mode === 'view')) {
      setFormData({
        vendorName: invoice.vendorName,
        vendorEmail: invoice.vendorEmail,
        amount: invoice.amount.toString(),
        dueDate: invoice.dueDate,
        issueDate: invoice.issueDate,
        status: invoice.status,
        description: invoice.description,
        category: invoice.category,
        paymentTerms: invoice.paymentTerms,
        taxAmount: invoice.taxAmount.toString(),
        discount: invoice.discount.toString()
      });
    }
    
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    resetForm();
    document.body.classList.remove('modal-open');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount) || 0;
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const subtotal = amount - taxAmount - discount;
    
    const invoiceData: Invoice = {
      id: selectedInvoice?.id || Date.now().toString(),
      invoiceNumber: selectedInvoice?.invoiceNumber || generateInvoiceNumber(),
      vendorName: formData.vendorName,
      vendorEmail: formData.vendorEmail,
      amount,
      dueDate: formData.dueDate,
      issueDate: formData.issueDate,
      status: formData.status,
      description: formData.description,
      category: formData.category,
      paymentTerms: formData.paymentTerms,
      taxAmount,
      discount,
      subtotal
    };

    if (modalMode === 'add') {
      setInvoices(prev => [...prev, invoiceData]);
    } else if (modalMode === 'edit' && selectedInvoice) {
      setInvoices(prev => prev.map(inv => 
        inv.id === selectedInvoice.id ? invoiceData : inv
      ));
    }

    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handleSort = (field: keyof Invoice) => {
    setSortState(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'sent': return 'badge-info';
      case 'overdue': return 'badge-error';
      case 'cancelled': return 'badge-error';
      default: return 'badge-warning';
    }
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <FileText className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Invoice Number',
      'Vendor Name',
      'Vendor Email',
      'Amount',
      'Status',
      'Issue Date',
      'Due Date',
      'Category',
      'Description'
    ];
    
    const csvData = filteredInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.vendorName,
      invoice.vendorEmail,
      invoice.amount.toFixed(2),
      invoice.status,
      invoice.issueDate,
      invoice.dueDate,
      invoice.category,
      invoice.description.replace(/,/g, ';')
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const headers = [
      'Vendor Name',
      'Vendor Email',
      'Amount',
      'Issue Date (YYYY-MM-DD)',
      'Due Date (YYYY-MM-DD)',
      'Status (draft/sent/paid/overdue/cancelled)',
      'Description',
      'Category',
      'Payment Terms',
      'Tax Amount',
      'Discount'
    ];
    
    const sampleRow = [
      'Sample Vendor LLC',
      'billing@samplevendor.com',
      '1500.00',
      '2024-01-15',
      '2024-02-15',
      'draft',
      'Sample invoice description',
      'Office Supplies',
      'Net 30',
      '150.00',
      '0.00'
    ];
    
    const csvContent = [headers, sampleRow]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoice_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const newInvoices: Invoice[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
          if (values.length >= 6 && values[0]) {
            const invoice: Invoice = {
              id: Date.now().toString() + i,
              invoiceNumber: generateInvoiceNumber(),
              vendorName: values[0] || '',
              vendorEmail: values[1] || '',
              amount: parseFloat(values[2]) || 0,
              issueDate: values[3] || format(new Date(), 'yyyy-MM-dd'),
              dueDate: values[4] || format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
              status: (values[5] as Invoice['status']) || 'draft',
              description: values[6] || '',
              category: values[7] || 'Other',
              paymentTerms: values[8] || 'Net 30',
              taxAmount: parseFloat(values[9]) || 0,
              discount: parseFloat(values[10]) || 0,
              subtotal: (parseFloat(values[2]) || 0) - (parseFloat(values[9]) || 0) - (parseFloat(values[10]) || 0)
            };
            newInvoices.push(invoice);
          }
        }
        
        if (newInvoices.length > 0) {
          setInvoices(prev => [...prev, ...newInvoices]);
          alert(`Successfully imported ${newInvoices.length} invoices.`);
        }
      } catch (error) {
        alert('Error parsing CSV file. Please check the format and try again.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Manage your invoices and payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              
              <button
                onClick={() => openModal('add')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Invoice
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container-wide py-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Total Invoices</div>
                <div className="stat-value">{analytics.totalInvoices}</div>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Total Amount</div>
                <div className="stat-value">${analytics.totalAmount.toFixed(2)}</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Paid Amount</div>
                <div className="stat-value">${analytics.paidAmount.toFixed(2)}</div>
                <div className="stat-desc">{analytics.paidPercentage.toFixed(1)}% of total</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Overdue</div>
                <div className="stat-value">{analytics.overdueCount}</div>
                <div className="stat-desc">Require attention</div>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn ${showFilters ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'} flex items-center gap-2`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              
              <button
                onClick={exportToCSV}
                className="btn bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={downloadTemplate}
                className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Template
              </button>
              
              <label className="btn bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
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
                  <label className="form-label">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    <option value="">All Categories</option>
                    {INVOICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Date Range</label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="input"
                  >
                    <option value="">All Time</option>
                    <option value="last7days">Last 7 Days</option>
                    <option value="last30days">Last 30 Days</option>
                    <option value="last90days">Last 90 Days</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Amount Range</label>
                  <select
                    value={filters.amountRange}
                    onChange={(e) => setFilters(prev => ({ ...prev, amountRange: e.target.value }))}
                    className="input"
                  >
                    <option value="">All Amounts</option>
                    <option value="under1000">Under $1,000</option>
                    <option value="1000to5000">$1,000 - $5,000</option>
                    <option value="over5000">Over $5,000</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => setFilters({ status: '', category: '', dateRange: '', amountRange: '' })}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

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
                      {sortState.field === 'invoiceNumber' && (
                        sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('vendorName')}
                  >
                    <div className="flex items-center gap-1">
                      Vendor
                      {sortState.field === 'vendorName' && (
                        sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center gap-1">
                      Amount
                      {sortState.field === 'amount' && (
                        sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-1">
                      Status
                      {sortState.field === 'status' && (
                        sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center gap-1">
                      Due Date
                      {sortState.field === 'dueDate' && (
                        sortState.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {paginatedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{invoice.vendorName}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{invoice.vendorEmail}</div>
                      </div>
                    </td>
                    <td className="table-cell font-medium">${invoice.amount.toFixed(2)}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusColor(invoice.status)} flex items-center gap-1`}>
                        {getStatusIcon(invoice.status)}
                        {invoice.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</div>
                      {new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' && (
                        <div className="text-xs text-red-500">Overdue</div>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openModal('view', invoice)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', invoice)}
                          className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No invoices found</h3>
              <p className="text-gray-500 dark:text-slate-400 mb-4">Get started by creating your first invoice.</p>
              <button
                onClick={() => openModal('add')}
                className="btn btn-primary"
              >
                Add Invoice
              </button>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex-between mt-6 pt-4 border-t border-gray-200 dark:border-slate-600">
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`btn ${currentPage === page ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'}`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-slate-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div 
          className="modal-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="modal-content max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Add New Invoice' : 
                 modalMode === 'edit' ? 'Edit Invoice' : 'Invoice Details'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:text-slate-500 dark:hover:text-slate-400"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Vendor Name *</label>
                  <input
                    type="text"
                    value={formData.vendorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorName: e.target.value }))}
                    className="input"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Vendor Email *</label>
                  <input
                    type="email"
                    value={formData.vendorEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, vendorEmail: e.target.value }))}
                    className="input"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="input"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Invoice['status'] }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Issue Date *</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="input"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input"
                    required
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  >
                    <option value="">Select Category</option>
                    {INVOICE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  >
                    {PAYMENT_TERMS.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tax Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, taxAmount: e.target.value }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="input"
                  rows={3}
                  disabled={modalMode === 'view'}
                />
              </div>
              
              {modalMode !== 'view' && (
                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {modalMode === 'add' ? 'Create Invoice' : 'Update Invoice'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 theme-transition">
        <div className="container-wide py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}