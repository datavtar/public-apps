import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye, 
  DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, 
  AlertCircle, XCircle, Calendar, User, FileText, BarChart3,
  PieChart, Users, Receipt, CreditCard, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, X, Check, Building, Mail, Phone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  items: InvoiceItem[];
  taxRate: number;
  discountRate: number;
  notes: string;
  paymentDate?: string;
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

interface DashboardStats {
  totalInvoices: number;
  totalRevenue: number;
  paidInvoices: number;
  overdueInvoices: number;
  avgInvoiceValue: number;
  monthlyGrowth: number;
}

type ViewMode = 'dashboard' | 'invoices' | 'analytics';
type SortField = 'invoiceNumber' | 'clientName' | 'amount' | 'dueDate' | 'status';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State Management
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // AI Integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    amount: 0,
    dueDate: '',
    issueDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    description: '',
    items: [],
    taxRate: 0,
    discountRate: 0,
    notes: ''
  });

  // Sample Data
  const generateSampleData = (): Invoice[] => {
    const sampleInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        clientName: 'Acme Corporation',
        clientEmail: 'billing@acme.com',
        clientAddress: '123 Business St, New York, NY 10001',
        amount: 2500.00,
        dueDate: '2024-02-15',
        issueDate: '2024-01-15',
        status: 'sent',
        description: 'Web Development Services',
        items: [
          { id: '1', description: 'Frontend Development', quantity: 40, rate: 50, amount: 2000 },
          { id: '2', description: 'Backend Integration', quantity: 10, rate: 50, amount: 500 }
        ],
        taxRate: 8.5,
        discountRate: 0,
        notes: 'Payment due within 30 days',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        clientName: 'TechStart Inc',
        clientEmail: 'finance@techstart.com',
        clientAddress: '456 Innovation Ave, San Francisco, CA 94105',
        amount: 1800.00,
        dueDate: '2024-01-20',
        issueDate: '2024-01-05',
        status: 'overdue',
        description: 'Mobile App Development',
        items: [
          { id: '1', description: 'UI/UX Design', quantity: 20, rate: 60, amount: 1200 },
          { id: '2', description: 'App Development', quantity: 12, rate: 50, amount: 600 }
        ],
        taxRate: 9.5,
        discountRate: 5,
        notes: 'Urgent payment required',
        createdAt: '2024-01-05T09:00:00Z',
        updatedAt: '2024-01-20T15:30:00Z'
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        clientName: 'Global Solutions Ltd',
        clientEmail: 'payments@globalsolutions.com',
        clientAddress: '789 Enterprise Blvd, Chicago, IL 60601',
        amount: 3200.00,
        dueDate: '2024-02-10',
        issueDate: '2024-01-10',
        status: 'paid',
        description: 'Consulting Services',
        items: [
          { id: '1', description: 'Strategic Consulting', quantity: 32, rate: 100, amount: 3200 }
        ],
        taxRate: 7.25,
        discountRate: 0,
        notes: 'Paid via wire transfer',
        paymentDate: '2024-01-25',
        createdAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-25T11:20:00Z'
      },
      {
        id: '4',
        invoiceNumber: 'INV-2024-004',
        clientName: 'StartupHub',
        clientEmail: 'billing@startuphub.io',
        clientAddress: '321 Venture St, Austin, TX 78701',
        amount: 1500.00,
        dueDate: '2024-02-20',
        issueDate: '2024-01-20',
        status: 'draft',
        description: 'Marketing Campaign',
        items: [
          { id: '1', description: 'Campaign Strategy', quantity: 15, rate: 80, amount: 1200 },
          { id: '2', description: 'Content Creation', quantity: 6, rate: 50, amount: 300 }
        ],
        taxRate: 8.25,
        discountRate: 10,
        notes: 'Draft - awaiting client approval',
        createdAt: '2024-01-20T16:00:00Z',
        updatedAt: '2024-01-20T16:00:00Z'
      }
    ];
    return sampleInvoices;
  };

  // Effects
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      const sampleData = generateSampleData();
      setInvoices(sampleData);
      localStorage.setItem('invoices', JSON.stringify(sampleData));
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  useEffect(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'amount') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'dueDate') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  }, [invoices, searchTerm, statusFilter, sortField, sortDirection]);

  // Helper Functions
  const calculateStats = (): DashboardStats => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
    const avgInvoiceValue = totalInvoices > 0 ? invoices.reduce((sum, inv) => sum + inv.amount, 0) / totalInvoices : 0;
    
    // Mock monthly growth calculation
    const thisMonth = new Date().getMonth();
    const lastMonth = thisMonth - 1;
    const thisMonthRevenue = invoices.filter(inv => 
      inv.status === 'paid' && new Date(inv.paymentDate || inv.issueDate).getMonth() === thisMonth
    ).reduce((sum, inv) => sum + inv.amount, 0);
    const lastMonthRevenue = invoices.filter(inv => 
      inv.status === 'paid' && new Date(inv.paymentDate || inv.issueDate).getMonth() === lastMonth
    ).reduce((sum, inv) => sum + inv.amount, 0);
    const monthlyGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    return {
      totalInvoices,
      totalRevenue,
      paidInvoices,
      overdueInvoices,
      avgInvoiceValue,
      monthlyGrowth
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'sent': return 'badge-info';
      case 'overdue': return 'badge-error';
      case 'draft': return 'badge-warning';
      case 'cancelled': return 'text-gray-500';
      default: return 'badge-info';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextNum = invoices.length + 1;
    return `INV-${year}-${String(nextNum).padStart(3, '0')}`;
  };

  const calculateItemAmount = (item: InvoiceItem) => {
    return item.quantity * item.rate;
  };

  const calculateSubtotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + calculateItemAmount(item), 0);
  };

  const calculateTotal = (items: InvoiceItem[], taxRate: number, discountRate: number) => {
    const subtotal = calculateSubtotal(items);
    const discountAmount = subtotal * (discountRate / 100);
    const discountedSubtotal = subtotal - discountAmount;
    const taxAmount = discountedSubtotal * (taxRate / 100);
    return discountedSubtotal + taxAmount;
  };

  // CRUD Operations
  const saveInvoice = (invoiceData: Partial<Invoice>) => {
    const now = new Date().toISOString();
    
    if (editingInvoice) {
      // Update existing invoice
      const updatedInvoice: Invoice = {
        ...editingInvoice,
        ...invoiceData,
        amount: calculateTotal(invoiceData.items || [], invoiceData.taxRate || 0, invoiceData.discountRate || 0),
        updatedAt: now
      } as Invoice;
      
      const updatedInvoices = invoices.map(inv => 
        inv.id === editingInvoice.id ? updatedInvoice : inv
      );
      setInvoices(updatedInvoices);
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    } else {
      // Create new invoice
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: invoiceData.invoiceNumber || generateInvoiceNumber(),
        amount: calculateTotal(invoiceData.items || [], invoiceData.taxRate || 0, invoiceData.discountRate || 0),
        createdAt: now,
        updatedAt: now,
        ...invoiceData
      } as Invoice;
      
      const updatedInvoices = [...invoices, newInvoice];
      setInvoices(updatedInvoices);
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    }
  };

  const deleteInvoice = (id: string) => {
    const updatedInvoices = invoices.filter(inv => inv.id !== id);
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
    setShowDeleteConfirm(null);
  };

  const duplicateInvoice = (invoice: Invoice) => {
    const duplicated: Invoice = {
      ...invoice,
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedInvoices = [...invoices, duplicated];
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };

  // AI Functions
  const handleAiExtraction = () => {
    if (!selectedFile) {
      setAiError('Please select a file to process.');
      return;
    }
    
    setPromptText(`Extract invoice data from this document and return the information in JSON format with the following structure: {
      "invoiceNumber": "string",
      "clientName": "string",
      "clientEmail": "string",
      "clientAddress": "string",
      "amount": number,
      "dueDate": "YYYY-MM-DD",
      "issueDate": "YYYY-MM-DD",
      "description": "string",
      "items": [{
        "description": "string",
        "quantity": number,
        "rate": number
      }],
      "taxRate": number,
      "notes": "string"
    }. Only return the JSON data, no additional text.`);
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    try {
      const extractedData = JSON.parse(result);
      
      // Process items to add IDs and amounts
      const processedItems = (extractedData.items || []).map((item: any, index: number) => ({
        id: (index + 1).toString(),
        description: item.description || '',
        quantity: Number(item.quantity) || 1,
        rate: Number(item.rate) || 0,
        amount: Number(item.quantity || 1) * Number(item.rate || 0)
      }));
      
      setFormData({
        ...formData,
        invoiceNumber: extractedData.invoiceNumber || generateInvoiceNumber(),
        clientName: extractedData.clientName || '',
        clientEmail: extractedData.clientEmail || '',
        clientAddress: extractedData.clientAddress || '',
        dueDate: extractedData.dueDate || '',
        issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
        description: extractedData.description || '',
        items: processedItems,
        taxRate: Number(extractedData.taxRate) || 0,
        discountRate: 0,
        notes: extractedData.notes || '',
        status: 'draft'
      });
      
      setShowAiModal(false);
      setShowModal(true);
    } catch (error) {
      console.error('Failed to parse AI result:', error);
      setAiError('Failed to parse extracted data. Please try again.');
    }
  };

  // Event Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormData(invoice);
    setShowModal(true);
  };

  const handleNewInvoice = () => {
    setEditingInvoice(null);
    setFormData({
      invoiceNumber: generateInvoiceNumber(),
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      amount: 0,
      dueDate: '',
      issueDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      description: '',
      items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
      taxRate: 8.5,
      discountRate: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvoice(null);
    setFormData({
      invoiceNumber: '',
      clientName: '',
      clientEmail: '',
      clientAddress: '',
      amount: 0,
      dueDate: '',
      issueDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      description: '',
      items: [],
      taxRate: 0,
      discountRate: 0,
      notes: ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveInvoice(formData);
    handleCloseModal();
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...(formData.items || [])];
    if (updatedItems[index]) {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };
      
      if (field === 'quantity' || field === 'rate') {
        updatedItems[index].amount = Number(updatedItems[index].quantity) * Number(updatedItems[index].rate);
      }
      
      setFormData({
        ...formData,
        items: updatedItems
      });
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setFormData({
      ...formData,
      items: [...(formData.items || []), newItem]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items?.filter((_, i) => i !== index) || [];
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Client Name', 'Amount', 'Due Date', 'Status', 'Description'];
    const csvData = filteredInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.clientName,
      invoice.amount,
      invoice.dueDate,
      invoice.status,
      invoice.description
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get data for charts
  const getChartData = () => {
    const statusData = [
      { name: 'Paid', value: invoices.filter(inv => inv.status === 'paid').length, color: '#10b981' },
      { name: 'Sent', value: invoices.filter(inv => inv.status === 'sent').length, color: '#3b82f6' },
      { name: 'Overdue', value: invoices.filter(inv => inv.status === 'overdue').length, color: '#ef4444' },
      { name: 'Draft', value: invoices.filter(inv => inv.status === 'draft').length, color: '#f59e0b' }
    ];

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const monthRevenue = invoices.filter(inv => {
        const invDate = new Date(inv.paymentDate || inv.issueDate);
        return invDate.getMonth() === date.getMonth() && 
               invDate.getFullYear() === date.getFullYear() &&
               inv.status === 'paid';
      }).reduce((sum, inv) => sum + inv.amount, 0);
      
      monthlyData.push({ month: monthName, revenue: monthRevenue });
    }

    return { statusData, monthlyData };
  };

  const stats = calculateStats();
  const { statusData, monthlyData } = getChartData();

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInvoices = filteredInvoices.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-lg border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">InvoiceManager</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Finance Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              
              <nav className="flex gap-2">
                <button
                  onClick={() => setViewMode('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'dashboard'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setViewMode('invoices')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'invoices'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    viewMode === 'analytics'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        {viewMode === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-blue-100">Total Invoices</div>
                    <div className="stat-value text-white">{stats.totalInvoices}</div>
                  </div>
                  <FileText className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-green-100">Total Revenue</div>
                    <div className="stat-value text-white">{formatCurrency(stats.totalRevenue)}</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-purple-100">Paid Invoices</div>
                    <div className="stat-value text-white">{stats.paidInvoices}</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-red-100">Overdue</div>
                    <div className="stat-value text-white">{stats.overdueInvoices}</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-200" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="card">
              <div className="flex-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
                <button
                  onClick={() => setViewMode('invoices')}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Invoice #</th>
                      <th className="table-header">Client</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {invoices.slice(0, 5).map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">{invoice.clientName}</td>
                        <td className="table-cell">{formatCurrency(invoice.amount)}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">{formatDate(invoice.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'invoices' && (
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    className="input pl-10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="input w-full sm:w-40"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  onClick={() => setShowAiModal(true)}
                  className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  AI Extract
                </button>
                <button
                  onClick={exportToCSV}
                  className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleNewInvoice}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Invoice
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="card p-0">
              <div className="overflow-x-auto">
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
                        onClick={() => handleSort('amount')}
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          {sortField === 'amount' && (
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
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {currentInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium">{invoice.clientName}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">{invoice.clientEmail}</div>
                          </div>
                        </td>
                        <td className="table-cell font-medium">{formatCurrency(invoice.amount)}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">{formatDate(invoice.dueDate)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => duplicateInvoice(invoice)}
                              className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Duplicate"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(invoice.id)}
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
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
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                  <div className="text-sm text-gray-700 dark:text-slate-300">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredInvoices.length)} of {filteredInvoices.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`btn btn-sm ${
                          page === currentPage
                            ? 'btn-primary'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Average Invoice Value</div>
                    <div className="stat-value">{formatCurrency(stats.avgInvoiceValue)}</div>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Monthly Growth</div>
                    <div className="stat-value flex items-center gap-1">
                      {stats.monthlyGrowth.toFixed(1)}%
                      {stats.monthlyGrowth >= 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Collection Rate</div>
                    <div className="stat-value">
                      {stats.totalInvoices > 0 ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* Detailed Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={statusData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {showModal && (
        <div 
          className="modal-backdrop"
          onClick={handleCloseModal}
          onKeyDown={(e) => e.key === 'Escape' && handleCloseModal()}
          tabIndex={-1}
        >
          <div 
            className="modal-content max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h3>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Invoice Number</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.invoiceNumber || ''}
                      onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="input"
                      value={formData.status || 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Invoice['status'] })}
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
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Client Information
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Client Name</label>
                      <input
                        type="text"
                        className="input"
                        value={formData.clientName || ''}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Client Email</label>
                      <input
                        type="email"
                        className="input"
                        value={formData.clientEmail || ''}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Client Address</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={formData.clientAddress || ''}
                      onChange={(e) => setFormData({ ...formData, clientAddress: e.target.value })}
                    />
                  </div>
                </div>

                {/* Invoice Details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Invoice Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Issue Date</label>
                      <input
                        type="date"
                        className="input"
                        value={formData.issueDate || ''}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        className="input"
                        value={formData.dueDate || ''}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of services/products"
                    />
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">Line Items</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {(formData.items || []).map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="col-span-4">
                          <label className="form-label text-xs">Description</label>
                          <input
                            type="text"
                            className="input input-sm"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="form-label text-xs">Quantity</label>
                          <input
                            type="number"
                            className="input input-sm"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="form-label text-xs">Rate</label>
                          <input
                            type="number"
                            className="input input-sm"
                            min="0"
                            step="0.01"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
                          />
                        </div>
                        <div className="col-span-3">
                          <label className="form-label text-xs">Amount</label>
                          <input
                            type="text"
                            className="input input-sm bg-gray-100 dark:bg-slate-600"
                            value={formatCurrency(item.amount)}
                            readOnly
                          />
                        </div>
                        <div className="col-span-1">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            disabled={(formData.items?.length || 0) <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Totals</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Tax Rate (%)</label>
                      <input
                        type="number"
                        className="input"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.taxRate || 0}
                        onChange={(e) => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Discount Rate (%)</label>
                      <input
                        type="number"
                        className="input"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.discountRate || 0}
                        onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(calculateSubtotal(formData.items || []))}</span>
                      </div>
                      {(formData.discountRate || 0) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({formData.discountRate}%):</span>
                          <span>-{formatCurrency(calculateSubtotal(formData.items || []) * ((formData.discountRate || 0) / 100))}</span>
                        </div>
                      )}
                      {(formData.taxRate || 0) > 0 && (
                        <div className="flex justify-between">
                          <span>Tax ({formData.taxRate}%):</span>
                          <span>{formatCurrency((calculateSubtotal(formData.items || []) - (calculateSubtotal(formData.items || []) * ((formData.discountRate || 0) / 100))) * ((formData.taxRate || 0) / 100))}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal(formData.items || [], formData.taxRate || 0, formData.discountRate || 0))}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or payment terms"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Extract Modal */}
      {showAiModal && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowAiModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowAiModal(false)}
          tabIndex={-1}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Invoice Extraction</h3>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-slate-400">
                Upload an invoice document (PDF, image) and our AI will extract the relevant information automatically.
              </p>
              
              <div className="form-group">
                <label className="form-label">Upload Invoice Document</label>
                <input
                  type="file"
                  className="input"
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Selected: {selectedFile.name}
                  </p>
                </div>
              )}
              
              {isAiLoading && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-yellow-700 dark:text-yellow-300">Processing document...</p>
                  </div>
                </div>
              )}
              
              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <p>{aiError.message || 'An error occurred during processing.'}</p>
                </div>
              )}
              
              {aiResult && (
                <div className="alert alert-success">
                  <CheckCircle className="w-5 h-5" />
                  <p>Invoice data extracted successfully! Click "Use Extracted Data" to populate the form.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAiExtraction}
                disabled={!selectedFile || isAiLoading}
                className="btn bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? 'Processing...' : 'Extract Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="modal-backdrop"
          onClick={() => setShowDeleteConfirm(null)}
          onKeyDown={(e) => e.key === 'Escape' && setShowDeleteConfirm(null)}
          tabIndex={-1}
        >
          <div 
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4">
              <p className="text-gray-600 dark:text-slate-400">
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteInvoice(showDeleteConfirm)}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 mt-12 theme-transition">
        <div className="container-wide">
          <p className="text-center text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;