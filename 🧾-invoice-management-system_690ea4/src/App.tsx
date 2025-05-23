import React, { useState, useEffect, useRef } from 'react';
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
  Building, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle,
  Moon,
  Sun,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

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

interface InvoiceStats {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  overdueInvoices: number;
  pendingAmount: number;
  paidAmount: number;
}

type SortField = 'invoiceNumber' | 'clientName' | 'amount' | 'issueDate' | 'dueDate' | 'status';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'list' | 'create' | 'edit' | 'view';

const App: React.FC = () => {
  // AI Layer Integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiPanel, setShowAiPanel] = useState<boolean>(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Core state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  
  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  
  // Form state for new/edit invoice
  const [formData, setFormData] = useState<Partial<Invoice>>({});
  const [formItems, setFormItems] = useState<InvoiceItem[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Load data on mount
  useEffect(() => {
    loadInvoices();
  }, []);

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Load invoices from localStorage
  const loadInvoices = (): void => {
    try {
      const savedInvoices = localStorage.getItem('invoices');
      if (savedInvoices) {
        const parsedInvoices = JSON.parse(savedInvoices);
        setInvoices(parsedInvoices);
      } else {
        // Initialize with sample data
        const sampleInvoices = generateSampleInvoices();
        setInvoices(sampleInvoices);
        localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
      }
    } catch (error) {
      console.error('Error loading invoices:', error);
      setInvoices([]);
    }
  };

  // Save invoices to localStorage
  const saveInvoices = (invoiceList: Invoice[]): void => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoiceList));
    } catch (error) {
      console.error('Error saving invoices:', error);
    }
  };

  // Generate sample invoices
  const generateSampleInvoices = (): Invoice[] => {
    const sampleData: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        clientName: 'Acme Corporation',
        clientEmail: 'billing@acme.com',
        clientAddress: '123 Business St, New York, NY 10001',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        amount: 5000,
        taxAmount: 500,
        totalAmount: 5500,
        status: 'paid',
        description: 'Web development services',
        items: [
          { id: '1', description: 'Frontend Development', quantity: 40, rate: 100, amount: 4000 },
          { id: '2', description: 'Backend Development', quantity: 20, rate: 120, amount: 2400 }
        ],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        clientName: 'Tech Solutions Inc',
        clientEmail: 'accounts@techsolutions.com',
        clientAddress: '456 Tech Ave, San Francisco, CA 94105',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        amount: 3200,
        taxAmount: 320,
        totalAmount: 3520,
        status: 'sent',
        description: 'Mobile app development',
        items: [
          { id: '1', description: 'iOS Development', quantity: 30, rate: 110, amount: 3300 },
          { id: '2', description: 'Testing', quantity: 10, rate: 80, amount: 800 }
        ],
        createdAt: '2024-01-20T09:00:00Z',
        updatedAt: '2024-01-20T09:00:00Z'
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        clientName: 'Global Enterprises',
        clientEmail: 'finance@global-ent.com',
        clientAddress: '789 Corporate Blvd, Chicago, IL 60601',
        issueDate: '2023-12-15',
        dueDate: '2024-01-15',
        amount: 7500,
        taxAmount: 750,
        totalAmount: 8250,
        status: 'overdue',
        description: 'Consulting services',
        items: [
          { id: '1', description: 'Strategy Consulting', quantity: 50, rate: 150, amount: 7500 }
        ],
        createdAt: '2023-12-15T14:00:00Z',
        updatedAt: '2023-12-15T14:00:00Z'
      }
    ];
    return sampleData;
  };

  // Calculate stats
  const calculateStats = (): InvoiceStats => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
    const pendingAmount = totalRevenue - paidAmount;
    
    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      overdueInvoices,
      pendingAmount,
      paidAmount
    };
  };

  // Filter and sort invoices
  const getFilteredAndSortedInvoices = (): Invoice[] => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'amount' || sortField === 'totalAmount') {
        aValue = a.totalAmount;
        bValue = b.totalAmount;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  // Pagination
  const getPaginatedInvoices = (): Invoice[] => {
    const filtered = getFilteredAndSortedInvoices();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (): number => {
    const filtered = getFilteredAndSortedInvoices();
    return Math.ceil(filtered.length / itemsPerPage);
  };

  // CRUD operations
  const createInvoice = (invoiceData: Partial<Invoice>): void => {
    const newInvoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: invoiceData.clientName || '',
      clientEmail: invoiceData.clientEmail || '',
      clientAddress: invoiceData.clientAddress || '',
      issueDate: invoiceData.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate || '',
      amount: invoiceData.amount || 0,
      taxAmount: invoiceData.taxAmount || 0,
      totalAmount: invoiceData.totalAmount || 0,
      status: invoiceData.status || 'draft',
      description: invoiceData.description || '',
      items: formItems || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);
    setViewMode('list');
    resetForm();
  };

  const updateInvoice = (invoiceData: Partial<Invoice>): void => {
    if (!editingInvoice) return;
    
    const updatedInvoice: Invoice = {
      ...editingInvoice,
      ...invoiceData,
      items: formItems,
      updatedAt: new Date().toISOString()
    };
    
    const updatedInvoices = invoices.map(inv => 
      inv.id === editingInvoice.id ? updatedInvoice : inv
    );
    
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);
    setViewMode('list');
    setEditingInvoice(null);
    resetForm();
  };

  const deleteInvoice = (id: string): void => {
    const updatedInvoices = invoices.filter(inv => inv.id !== id);
    setInvoices(updatedInvoices);
    saveInvoices(updatedInvoices);
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  // Form handling
  const resetForm = (): void => {
    setFormData({});
    setFormItems([]);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.clientName?.trim()) errors.clientName = 'Client name is required';
    if (!formData.clientEmail?.trim()) errors.clientEmail = 'Client email is required';
    if (!formData.dueDate) errors.dueDate = 'Due date is required';
    if (formItems.length === 0) errors.items = 'At least one item is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (): void => {
    if (!validateForm()) return;
    
    // Calculate totals
    const amount = formItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = amount * 0.1; // 10% tax
    const totalAmount = amount + taxAmount;
    
    const invoiceData = {
      ...formData,
      amount,
      taxAmount,
      totalAmount
    };
    
    if (editingInvoice) {
      updateInvoice(invoiceData);
    } else {
      createInvoice(invoiceData);
    }
  };

  // Item management
  const addItem = (): void => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setFormItems([...formItems, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any): void => {
    const updatedItems = [...formItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate amount
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = updatedItems[index].quantity * updatedItems[index].rate;
    }
    
    setFormItems(updatedItems);
  };

  const removeItem = (index: number): void => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  // Export functionality
  const exportToCSV = (): void => {
    const headers = ['Invoice Number', 'Client Name', 'Issue Date', 'Due Date', 'Amount', 'Status'];
    const csvContent = [
      headers.join(','),
      ...invoices.map(inv => [
        inv.invoiceNumber,
        `"${inv.clientName}"`,
        inv.issueDate,
        inv.dueDate,
        inv.totalAmount,
        inv.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'invoices.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // AI functionality
  const handleSendToAI = (): void => {
    if (!promptText.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };

  const processAIResult = (result: string): void => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(result);
      if (parsed.invoiceData) {
        // Auto-fill form with AI-extracted data
        setFormData(prev => ({ ...prev, ...parsed.invoiceData }));
        if (parsed.items) {
          setFormItems(parsed.items);
        }
      }
    } catch {
      // If not JSON, treat as plain text result
      setAiResult(result);
    }
  };

  // Chart data
  const getChartData = () => {
    const statusCounts = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));

    const monthlyData = invoices.reduce((acc, inv) => {
      const month = new Date(inv.issueDate).toLocaleString('default', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.amount += inv.totalAmount;
      } else {
        acc.push({ month, amount: inv.totalAmount });
      }
      return acc;
    }, [] as { month: string; amount: number }[]);

    return { pieData, monthlyData };
  };

  const stats = calculateStats();
  const { pieData, monthlyData } = getChartData();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDeleteModal) {
          setShowDeleteModal(false);
        } else if (showAiPanel) {
          setShowAiPanel(false);
        } else if (viewMode !== 'list') {
          setViewMode('list');
          resetForm();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDeleteModal, showAiPanel, viewMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer Integration */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          processAIResult(result);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Manager</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Finance Team Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAiPanel(true)}
                className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                AI Assistant
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb flex-center">
                  {isDarkMode ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6">
        {viewMode === 'list' && (
          <>
            {/* Stats Cards */}
            <div className="grid-responsive mb-6">
              <div className="stat-card">
                <div className="stat-title">Total Invoices</div>
                <div className="stat-value">{stats.totalInvoices}</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Active invoices
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value">${stats.totalRevenue.toLocaleString()}</div>
                <div className="stat-desc flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  All time
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Paid Amount</div>
                <div className="stat-value text-green-600">${stats.paidAmount.toLocaleString()}</div>
                <div className="stat-desc flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {stats.paidInvoices} invoices
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Overdue</div>
                <div className="stat-value text-red-600">{stats.overdueInvoices}</div>
                <div className="stat-desc flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Need attention
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Invoice Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                    <Bar dataKey="amount" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Controls */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 w-full sm:w-64"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input w-full sm:w-auto"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  
                  <button
                    onClick={() => {
                      setViewMode('create');
                      resetForm();
                    }}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header cursor-pointer" onClick={() => {
                        if (sortField === 'invoiceNumber') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('invoiceNumber');
                          setSortOrder('asc');
                        }
                      }}>
                        <div className="flex items-center gap-1">
                          Invoice #
                          {sortField === 'invoiceNumber' && (
                            sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="table-header cursor-pointer" onClick={() => {
                        if (sortField === 'clientName') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('clientName');
                          setSortOrder('asc');
                        }
                      }}>
                        <div className="flex items-center gap-1">
                          Client
                          {sortField === 'clientName' && (
                            sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="table-header">Issue Date</th>
                      <th className="table-header">Due Date</th>
                      <th className="table-header cursor-pointer" onClick={() => {
                        if (sortField === 'amount') {
                          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        } else {
                          setSortField('amount');
                          setSortOrder('desc');
                        }
                      }}>
                        <div className="flex items-center gap-1">
                          Amount
                          {sortField === 'amount' && (
                            sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getPaginatedInvoices().map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium">{invoice.clientName}</div>
                            <div className="text-sm text-gray-500">{invoice.clientEmail}</div>
                          </div>
                        </td>
                        <td className="table-cell">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td className="table-cell font-medium">${invoice.totalAmount.toLocaleString()}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            invoice.status === 'paid' ? 'badge-success' :
                            invoice.status === 'overdue' ? 'badge-error' :
                            invoice.status === 'sent' ? 'badge-info' :
                            'badge-warning'
                          }`}>
                            {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                            {invoice.status === 'overdue' && <AlertCircle className="w-3 h-3" />}
                            {invoice.status === 'sent' && <Clock className="w-3 h-3" />}
                            {invoice.status === 'draft' && <Edit className="w-3 h-3" />}
                            {invoice.status === 'cancelled' && <XCircle className="w-3 h-3" />}
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setViewMode('view');
                              }}
                              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingInvoice(invoice);
                                setFormData(invoice);
                                setFormItems(invoice.items || []);
                                setViewMode('edit');
                              }}
                              className="btn btn-sm bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setInvoiceToDelete(invoice.id);
                                setShowDeleteModal(true);
                              }}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
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

              {/* Pagination */}
              {getTotalPages() > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, getFilteredAndSortedInvoices().length)} of {getFilteredAndSortedInvoices().length} results
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === getTotalPages()}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Create/Edit Invoice Form */}
        {(viewMode === 'create' || viewMode === 'edit') && (
          <div className="card">
            <div className="flex-between mb-6">
              <div>
                <h2 className="text-xl font-bold">
                  {viewMode === 'create' ? 'Create New Invoice' : 'Edit Invoice'}
                </h2>
                <p className="text-gray-500 dark:text-slate-400">
                  {viewMode === 'create' ? 'Fill in the details below' : 'Update invoice information'}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewMode('list');
                  resetForm();
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Back to List
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Client Information</h3>
                
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    value={formData.clientName || ''}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className={`input ${formErrors.clientName ? 'border-red-500' : ''}`}
                    placeholder="Enter client name"
                  />
                  {formErrors.clientName && <p className="form-error">{formErrors.clientName}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Client Email *</label>
                  <input
                    type="email"
                    value={formData.clientEmail || ''}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className={`input ${formErrors.clientEmail ? 'border-red-500' : ''}`}
                    placeholder="Enter client email"
                  />
                  {formErrors.clientEmail && <p className="form-error">{formErrors.clientEmail}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Client Address</label>
                  <textarea
                    value={formData.clientAddress || ''}
                    onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Enter client address"
                  />
                </div>
              </div>

              {/* Invoice Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Invoice Details</h3>
                
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className={`input ${formErrors.dueDate ? 'border-red-500' : ''}`}
                  />
                  {formErrors.dueDate && <p className="form-error">{formErrors.dueDate}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Invoice['status'] })}
                    className="input"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Enter invoice description"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mt-8">
              <div className="flex-between mb-4">
                <h3 className="text-lg font-medium">Invoice Items</h3>
                <button
                  onClick={addItem}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
              
              {formErrors.items && <p className="form-error mb-4">{formErrors.items}</p>}
              
              <div className="space-y-3">
                {formItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-gray-200 dark:border-slate-600 rounded-lg">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="input"
                        placeholder="Item description"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="input"
                        placeholder="Qty"
                        min="0"
                        step="1"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="input"
                        placeholder="Rate"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        ${item.amount.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              {formItems.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${formItems.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%):</span>
                      <span>${(formItems.reduce((sum, item) => sum + item.amount, 0) * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${(formItems.reduce((sum, item) => sum + item.amount, 0) * 1.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
              <button
                onClick={() => {
                  setViewMode('list');
                  resetForm();
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                {viewMode === 'create' ? 'Create Invoice' : 'Update Invoice'}
              </button>
            </div>
          </div>
        )}

        {/* View Invoice */}
        {viewMode === 'view' && selectedInvoice && (
          <div className="card">
            <div className="flex-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Invoice Details</h2>
                <p className="text-gray-500 dark:text-slate-400">{selectedInvoice.invoiceNumber}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingInvoice(selectedInvoice);
                    setFormData(selectedInvoice);
                    setFormItems(selectedInvoice.items || []);
                    setViewMode('edit');
                  }}
                  className="btn bg-yellow-600 text-white hover:bg-yellow-700"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Back to List
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Invoice Info */}
              <div>
                <h3 className="text-lg font-medium mb-4">Invoice Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Invoice Number:</span>
                    <span className="font-medium">{selectedInvoice.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Issue Date:</span>
                    <span>{new Date(selectedInvoice.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Due Date:</span>
                    <span>{new Date(selectedInvoice.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Status:</span>
                    <span className={`badge ${
                      selectedInvoice.status === 'paid' ? 'badge-success' :
                      selectedInvoice.status === 'overdue' ? 'badge-error' :
                      selectedInvoice.status === 'sent' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h3 className="text-lg font-medium mb-4">Client Information</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 dark:text-slate-400">Name:</span>
                    <div className="font-medium">{selectedInvoice.clientName}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-slate-400">Email:</span>
                    <div>{selectedInvoice.clientEmail}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-slate-400">Address:</span>
                    <div>{selectedInvoice.clientAddress}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {selectedInvoice.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-600 dark:text-slate-400">{selectedInvoice.description}</p>
              </div>
            )}

            {/* Items */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">Items</h3>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Description</th>
                      <th className="table-header">Quantity</th>
                      <th className="table-header">Rate</th>
                      <th className="table-header">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {selectedInvoice.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="table-cell">{item.description}</td>
                        <td className="table-cell">{item.quantity}</td>
                        <td className="table-cell">${item.rate.toFixed(2)}</td>
                        <td className="table-cell">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals */}
              <div className="flex justify-end mt-4">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${selectedInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-slate-400">
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => invoiceToDelete && deleteInvoice(invoiceToDelete)}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Panel */}
      {showAiPanel && (
        <div className="modal-backdrop" onClick={() => setShowAiPanel(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Invoice Assistant</h3>
              <button
                onClick={() => setShowAiPanel(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Describe what you need help with:</label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="e.g., 'Extract invoice data from this document' or 'Help me create an invoice for web development services'"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Upload Document (optional):</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="input"
                  accept=".pdf,.jpg,.jpeg,.png,.txt"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-500 mt-1">Selected: {selectedFile.name}</p>
                )}
              </div>
              
              <button
                onClick={handleSendToAI}
                disabled={isAiLoading}
                className="btn btn-primary w-full flex items-center gap-2"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
                {isAiLoading ? 'Processing...' : 'Get AI Help'}
              </button>
              
              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="w-4 h-4" />
                  <span>Error: {aiError.message || aiError}</span>
                </div>
              )}
              
              {aiResult && (
                <div className="alert alert-success">
                  <CheckCircle className="w-4 h-4" />
                  <div className="space-y-2">
                    <p className="font-medium">AI Response:</p>
                    <pre className="text-sm whitespace-pre-wrap bg-gray-50 dark:bg-slate-700 p-3 rounded">
                      {aiResult}
                    </pre>
                  </div>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowAiPanel(false);
                  setPromptText('');
                  setSelectedFile(null);
                  setAiResult(null);
                  setAiError(null);
                }}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-auto theme-transition">
        <div className="container-wide py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;