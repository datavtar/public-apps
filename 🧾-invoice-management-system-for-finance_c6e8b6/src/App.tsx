import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Moon,
  Sun,
  ChevronDown,
  ChevronUp,
  Receipt,
  CreditCard,
  Building
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  total: number;
  notes?: string;
  paymentMethod?: PaymentMethod;
  paidDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
}

type ViewMode = 'dashboard' | 'invoices' | 'clients' | 'payments' | 'reports';

const App: React.FC = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Main State
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Modal States
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'this_month' | 'last_month' | 'this_year'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'client'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form States
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({});
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({});
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedClients = localStorage.getItem('clients');
    const savedPayments = localStorage.getItem('payments');

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      // Initialize with sample data
      const sampleInvoices = generateSampleInvoices();
      setInvoices(sampleInvoices);
      localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
    }

    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      // Initialize with sample clients
      const sampleClients = generateSampleClients();
      setClients(sampleClients);
      localStorage.setItem('clients', JSON.stringify(sampleClients));
    }

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  // Theme management
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle Escape key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Sample data generators
  const generateSampleClients = (): Client[] => [
    {
      id: '1',
      name: 'Acme Corporation',
      email: 'billing@acme.com',
      phone: '+1-555-0123',
      address: '123 Business St, New York, NY 10001',
      taxId: 'TAX123456'
    },
    {
      id: '2',
      name: 'Tech Solutions Inc',
      email: 'accounts@techsolutions.com',
      phone: '+1-555-0456',
      address: '456 Tech Ave, San Francisco, CA 94102',
      taxId: 'TAX789012'
    },
    {
      id: '3',
      name: 'Global Industries',
      email: 'finance@global.com',
      phone: '+1-555-0789',
      address: '789 Global Blvd, Chicago, IL 60601',
      taxId: 'TAX345678'
    }
  ];

  const generateSampleInvoices = (): Invoice[] => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());

    return [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        clientId: '1',
        clientName: 'Acme Corporation',
        issueDate: today.toISOString().split('T')[0],
        dueDate: nextMonth.toISOString().split('T')[0],
        status: 'sent',
        items: [
          { id: '1', description: 'Web Development Services', quantity: 40, rate: 100, amount: 4000 },
          { id: '2', description: 'UI/UX Design', quantity: 20, rate: 80, amount: 1600 }
        ],
        subtotal: 5600,
        taxRate: 10,
        taxAmount: 560,
        discount: 0,
        total: 6160,
        notes: 'Payment terms: Net 30 days',
        createdAt: today.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        clientId: '2',
        clientName: 'Tech Solutions Inc',
        issueDate: lastMonth.toISOString().split('T')[0],
        dueDate: today.toISOString().split('T')[0],
        status: 'paid',
        items: [
          { id: '3', description: 'Software Consulting', quantity: 30, rate: 120, amount: 3600 }
        ],
        subtotal: 3600,
        taxRate: 8.5,
        taxAmount: 306,
        discount: 200,
        total: 3706,
        paymentMethod: 'bank_transfer',
        paidDate: today.toISOString().split('T')[0],
        createdAt: lastMonth.toISOString(),
        updatedAt: today.toISOString()
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        clientId: '3',
        clientName: 'Global Industries',
        issueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 45).toISOString().split('T')[0],
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 15).toISOString().split('T')[0],
        status: 'overdue',
        items: [
          { id: '4', description: 'System Integration', quantity: 60, rate: 90, amount: 5400 },
          { id: '5', description: 'Technical Support', quantity: 10, rate: 60, amount: 600 }
        ],
        subtotal: 6000,
        taxRate: 10,
        taxAmount: 600,
        discount: 0,
        total: 6600,
        createdAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 45).toISOString(),
        updatedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 45).toISOString()
      }
    ];
  };

  // Utility functions
  const generateId = (): string => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
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

  const getStatusColor = (status: InvoiceStatus): string => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'sent': return 'badge-info';
      case 'overdue': return 'badge-error';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'badge-warning';
    }
  };

  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'sent': return <Clock className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Modal management
  const closeAllModals = () => {
    setShowInvoiceModal(false);
    setShowClientModal(false);
    setShowPaymentModal(false);
    setEditingInvoice(null);
    setEditingClient(null);
    setSelectedInvoiceForPayment(null);
    resetForms();
    document.body.classList.remove('modal-open');
  };

  const resetForms = () => {
    setInvoiceForm({});
    setClientForm({});
    setPaymentForm({});
    setInvoiceItems([]);
  };

  // Invoice operations
  const openInvoiceModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setInvoiceForm(invoice);
      setInvoiceItems(invoice.items || []);
    } else {
      resetForms();
      setInvoiceForm({
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        taxRate: 10,
        discount: 0
      });
      setInvoiceItems([{ id: generateId(), description: '', quantity: 1, rate: 0, amount: 0 }]);
    }
    setShowInvoiceModal(true);
    document.body.classList.add('modal-open');
  };

  const saveInvoice = () => {
    if (!invoiceForm.clientId || !invoiceForm.invoiceNumber || invoiceItems.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * (invoiceForm.taxRate || 0) / 100;
    const total = subtotal + taxAmount - (invoiceForm.discount || 0);
    const client = clients.find(c => c.id === invoiceForm.clientId);

    const invoiceData: Invoice = {
      id: editingInvoice?.id || generateId(),
      invoiceNumber: invoiceForm.invoiceNumber || '',
      clientId: invoiceForm.clientId || '',
      clientName: client?.name || '',
      issueDate: invoiceForm.issueDate || '',
      dueDate: invoiceForm.dueDate || '',
      status: invoiceForm.status || 'draft',
      items: invoiceItems,
      subtotal,
      taxRate: invoiceForm.taxRate || 0,
      taxAmount,
      discount: invoiceForm.discount || 0,
      total,
      notes: invoiceForm.notes || '',
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingInvoice) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? invoiceData : inv));
    } else {
      setInvoices(prev => [...prev, invoiceData]);
    }

    closeAllModals();
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const updatedInvoice = { ...inv, status, updatedAt: new Date().toISOString() };
        if (status === 'paid' && !inv.paidDate) {
          updatedInvoice.paidDate = new Date().toISOString().split('T')[0];
        }
        return updatedInvoice;
      }
      return inv;
    }));
  };

  // Client operations
  const openClientModal = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      setClientForm(client);
    } else {
      resetForms();
    }
    setShowClientModal(true);
    document.body.classList.add('modal-open');
  };

  const saveClient = () => {
    if (!clientForm.name || !clientForm.email) {
      alert('Please fill in all required fields');
      return;
    }

    const clientData: Client = {
      id: editingClient?.id || generateId(),
      name: clientForm.name || '',
      email: clientForm.email || '',
      phone: clientForm.phone || '',
      address: clientForm.address || '',
      taxId: clientForm.taxId || ''
    };

    if (editingClient) {
      setClients(prev => prev.map(client => client.id === editingClient.id ? clientData : client));
    } else {
      setClients(prev => [...prev, clientData]);
    }

    closeAllModals();
  };

  const deleteClient = (id: string) => {
    const hasInvoices = invoices.some(inv => inv.clientId === id);
    if (hasInvoices) {
      alert('Cannot delete client with existing invoices');
      return;
    }
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(prev => prev.filter(client => client.id !== id));
    }
  };

  // Payment operations
  const openPaymentModal = (invoice: Invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentForm({
      amount: invoice.total,
      date: new Date().toISOString().split('T')[0],
      method: 'bank_transfer'
    });
    setShowPaymentModal(true);
    document.body.classList.add('modal-open');
  };

  const recordPayment = () => {
    if (!selectedInvoiceForPayment || !paymentForm.amount || !paymentForm.date) {
      alert('Please fill in all required fields');
      return;
    }

    const payment: Payment = {
      id: generateId(),
      invoiceId: selectedInvoiceForPayment.id,
      amount: paymentForm.amount || 0,
      method: paymentForm.method || 'other',
      date: paymentForm.date || '',
      reference: paymentForm.reference || '',
      notes: paymentForm.notes || ''
    };

    setPayments(prev => [...prev, payment]);
    updateInvoiceStatus(selectedInvoiceForPayment.id, 'paid');
    closeAllModals();
  };

  // Invoice item operations
  const addInvoiceItem = () => {
    setInvoiceItems(prev => [...prev, {
      id: generateId(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    }]);
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = updatedItem.quantity * updatedItem.rate;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Filtering and sorting
  const getFilteredInvoices = () => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const invoiceDate = new Date(invoice.issueDate);
        const now = new Date();
        
        switch (dateFilter) {
          case 'this_month':
            matchesDate = invoiceDate.getMonth() === now.getMonth() && 
                         invoiceDate.getFullYear() === now.getFullYear();
            break;
          case 'last_month':
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
            matchesDate = invoiceDate.getMonth() === lastMonth.getMonth() && 
                         invoiceDate.getFullYear() === lastMonth.getFullYear();
            break;
          case 'this_year':
            matchesDate = invoiceDate.getFullYear() === now.getFullYear();
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.issueDate).getTime();
          bValue = new Date(b.issueDate).getTime();
          break;
        case 'amount':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'client':
          aValue = a.clientName;
          bValue = b.clientName;
          break;
        default:
          aValue = a.issueDate;
          bValue = b.issueDate;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  };

  // Analytics calculations
  const getDashboardStats = () => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const pendingInvoices = invoices.filter(inv => inv.status === 'sent');
    
    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const outstandingAmount = invoices
      .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.total, 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
    
    return {
      totalInvoices,
      totalRevenue,
      outstandingAmount,
      overdueAmount,
      paidCount: paidInvoices.length,
      overdueCount: overdueInvoices.length,
      pendingCount: pendingInvoices.length
    };
  };

  const getChartData = () => {
    const monthlyData: { [key: string]: { month: string; revenue: number; invoices: number } } = {};
    
    invoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthName, revenue: 0, invoices: 0 };
      }
      
      if (invoice.status === 'paid') {
        monthlyData[monthKey].revenue += invoice.total;
      }
      monthlyData[monthKey].invoices += 1;
    });
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  };

  const getStatusChartData = () => {
    const statusCounts = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<InvoiceStatus, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status as InvoiceStatus)
    }));
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Status', 'Amount', 'Paid Date'];
    const csvContent = [
      headers.join(','),
      ...getFilteredInvoices().map(invoice => [
        invoice.invoiceNumber,
        `"${invoice.clientName}"`,
        invoice.issueDate,
        invoice.dueDate,
        invoice.status,
        invoice.total,
        invoice.paidDate || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = getDashboardStats();
  const chartData = getChartData();
  const statusChartData = getStatusChartData();
  const filteredInvoices = getFilteredInvoices();

  return (
    <div className={`min-h-screen theme-transition ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 min-h-screen">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="container-fluid">
            <div className="flex-between py-4">
              <div className="flex items-center gap-3">
                <Receipt className="w-8 h-8 text-primary-600" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Manager</h1>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-primary-50 dark:bg-slate-800 border-b border-primary-100 dark:border-slate-700">
          <div className="container-fluid">
            <div className="flex gap-1 py-2">
              {(['dashboard', 'invoices', 'clients', 'payments', 'reports'] as ViewMode[]).map((view) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === view
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-700 dark:text-slate-300 hover:bg-primary-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {view.charAt(0).toUpperCase() + view.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container-fluid py-6">
          {/* Dashboard View */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="flex-between">
                    <div>
                      <div className="stat-title">Total Revenue</div>
                      <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                      <div className="stat-desc">{stats.paidCount} paid invoices</div>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex-between">
                    <div>
                      <div className="stat-title">Outstanding</div>
                      <div className="stat-value">{formatCurrency(stats.outstandingAmount)}</div>
                      <div className="stat-desc">{stats.pendingCount} pending</div>
                    </div>
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex-between">
                    <div>
                      <div className="stat-title">Overdue</div>
                      <div className="stat-value">{formatCurrency(stats.overdueAmount)}</div>
                      <div className="stat-desc">{stats.overdueCount} overdue</div>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="flex-between">
                    <div>
                      <div className="stat-title">Total Invoices</div>
                      <div className="stat-value">{stats.totalInvoices}</div>
                      <div className="stat-desc">All time</div>
                    </div>
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Monthly Revenue</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Invoice Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 70}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Invoices */}
              <div className="card">
                <div className="flex-between mb-4">
                  <h3 className="text-lg font-medium">Recent Invoices</h3>
                  <button
                    onClick={() => setCurrentView('invoices')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Invoice</th>
                        <th className="table-header">Client</th>
                        <th className="table-header">Date</th>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {invoices.slice(0, 5).map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                          <td className="table-cell">{invoice.clientName}</td>
                          <td className="table-cell">{formatDate(invoice.issueDate)}</td>
                          <td className="table-cell">{formatCurrency(invoice.total)}</td>
                          <td className="table-cell">
                            <span className={`badge ${getStatusColor(invoice.status)} flex items-center gap-1`}>
                              {getStatusIcon(invoice.status)}
                              {invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Invoices View */}
          {currentView === 'invoices' && (
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold">Invoices</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={exportToCSV}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => openInvoiceModal()}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Invoice
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="card">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className="input pl-10"
                        placeholder="Search invoices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      className="input"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
                    >
                      <option value="all">All Status</option>
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
                      className="input"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                    >
                      <option value="all">All Time</option>
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                      <option value="this_year">This Year</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Sort By</label>
                    <div className="flex gap-2">
                      <select
                        className="input"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      >
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                        <option value="status">Status</option>
                        <option value="client">Client</option>
                      </select>
                      <button
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                      >
                        {sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="card">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Invoice #</th>
                        <th className="table-header">Client</th>
                        <th className="table-header">Issue Date</th>
                        <th className="table-header">Due Date</th>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice.id}>
                          <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                          <td className="table-cell">{invoice.clientName}</td>
                          <td className="table-cell">{formatDate(invoice.issueDate)}</td>
                          <td className="table-cell">{formatDate(invoice.dueDate)}</td>
                          <td className="table-cell">{formatCurrency(invoice.total)}</td>
                          <td className="table-cell">
                            <select
                              value={invoice.status}
                              onChange={(e) => updateInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
                              className={`badge ${getStatusColor(invoice.status)} border-0 text-xs`}
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="paid">Paid</option>
                              <option value="overdue">Overdue</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openInvoiceModal(invoice)}
                                className="p-1 text-blue-600 hover:text-blue-700"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {invoice.status === 'sent' && (
                                <button
                                  onClick={() => openPaymentModal(invoice)}
                                  className="p-1 text-green-600 hover:text-green-700"
                                  title="Record Payment"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteInvoice(invoice.id)}
                                className="p-1 text-red-600 hover:text-red-700"
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
                  <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                    No invoices found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clients View */}
          {currentView === 'clients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold">Clients</h2>
                <button
                  onClick={() => openClientModal()}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Client
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.map((client) => {
                  const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
                  const totalAmount = clientInvoices.reduce((sum, inv) => sum + (inv.status === 'paid' ? inv.total : 0), 0);
                  const outstandingAmount = clientInvoices.reduce((sum, inv) => sum + (inv.status !== 'paid' && inv.status !== 'cancelled' ? inv.total : 0), 0);
                  
                  return (
                    <div key={client.id} className="card">
                      <div className="flex-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex-center">
                            <Building className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{client.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{client.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openClientModal(client)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteClient(client.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex-between">
                          <span className="text-gray-500 dark:text-slate-400">Total Paid:</span>
                          <span className="font-medium">{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex-between">
                          <span className="text-gray-500 dark:text-slate-400">Outstanding:</span>
                          <span className="font-medium">{formatCurrency(outstandingAmount)}</span>
                        </div>
                        <div className="flex-between">
                          <span className="text-gray-500 dark:text-slate-400">Invoices:</span>
                          <span className="font-medium">{clientInvoices.length}</span>
                        </div>
                      </div>
                      
                      {client.phone && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                          <p className="text-sm text-gray-500 dark:text-slate-400">{client.phone}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payments View */}
          {currentView === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Payments</h2>
              
              <div className="card">
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Invoice</th>
                        <th className="table-header">Client</th>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Method</th>
                        <th className="table-header">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {payments.map((payment) => {
                        const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                        return (
                          <tr key={payment.id}>
                            <td className="table-cell">{formatDate(payment.date)}</td>
                            <td className="table-cell font-medium">{invoice?.invoiceNumber}</td>
                            <td className="table-cell">{invoice?.clientName}</td>
                            <td className="table-cell">{formatCurrency(payment.amount)}</td>
                            <td className="table-cell">
                              <span className="badge badge-success">{payment.method.replace('_', ' ')}</span>
                            </td>
                            <td className="table-cell">{payment.reference || '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {payments.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                    No payments recorded
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reports View */}
          {currentView === 'reports' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Reports</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Revenue Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Invoice Volume</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="invoices" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Financial Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                    <div className="text-sm text-green-600">Total Revenue</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(stats.outstandingAmount)}</div>
                    <div className="text-sm text-blue-600">Outstanding</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</div>
                    <div className="text-sm text-red-600">Overdue</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalInvoices}</div>
                    <div className="text-sm text-purple-600">Total Invoices</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="modal-backdrop" onClick={closeAllModals}>
            <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium">
                  {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                </h3>
                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Invoice Number</label>
                    <input
                      type="text"
                      className="input"
                      value={invoiceForm.invoiceNumber || ''}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Client</label>
                    <select
                      className="input"
                      value={invoiceForm.clientId || ''}
                      onChange={(e) => {
                        const client = clients.find(c => c.id === e.target.value);
                        setInvoiceForm(prev => ({
                          ...prev,
                          clientId: e.target.value,
                          clientName: client?.name || ''
                        }));
                      }}
                      required
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Issue Date</label>
                    <input
                      type="date"
                      className="input"
                      value={invoiceForm.issueDate || ''}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, issueDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Due Date</label>
                    <input
                      type="date"
                      className="input"
                      value={invoiceForm.dueDate || ''}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Status</label>
                    <select
                      className="input"
                      value={invoiceForm.status || 'draft'}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, status: e.target.value as InvoiceStatus }))}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Tax Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input"
                      value={invoiceForm.taxRate || 0}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                {/* Invoice Items */}
                <div>
                  <div className="flex-between mb-4">
                    <h4 className="text-md font-medium">Items</h4>
                    <button
                      onClick={addInvoiceItem}
                      className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {invoiceItems.map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                        <div className="col-span-12 sm:col-span-5">
                          <label className="form-label">Description</label>
                          <input
                            type="text"
                            className="input"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="form-label">Qty</label>
                          <input
                            type="number"
                            className="input"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-4 sm:col-span-2">
                          <label className="form-label">Rate</label>
                          <input
                            type="number"
                            className="input"
                            value={item.rate}
                            onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-3 sm:col-span-2">
                          <label className="form-label">Amount</label>
                          <div className="input bg-gray-50 dark:bg-slate-700">
                            {formatCurrency(item.amount)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          <button
                            onClick={() => removeInvoiceItem(item.id)}
                            className="p-2 text-red-600 hover:text-red-700"
                            disabled={invoiceItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Totals */}
                <div className="border-t pt-4">
                  <div className="max-w-sm ml-auto space-y-2">
                    <div className="flex-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(invoiceItems.reduce((sum, item) => sum + item.amount, 0))}</span>
                    </div>
                    <div className="flex-between">
                      <span>Tax ({invoiceForm.taxRate || 0}%):</span>
                      <span>{formatCurrency(invoiceItems.reduce((sum, item) => sum + item.amount, 0) * (invoiceForm.taxRate || 0) / 100)}</span>
                    </div>
                    <div>
                      <div className="flex-between mb-2">
                        <span>Discount:</span>
                        <input
                          type="number"
                          className="input w-24 text-right"
                          value={invoiceForm.discount || 0}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div className="flex-between border-t pt-2 font-bold">
                      <span>Total:</span>
                      <span>
                        {formatCurrency(
                          invoiceItems.reduce((sum, item) => sum + item.amount, 0) * (1 + (invoiceForm.taxRate || 0) / 100) - (invoiceForm.discount || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={invoiceForm.notes || ''}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={closeAllModals}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveInvoice}
                  className="btn btn-primary"
                >
                  {editingInvoice ? 'Update' : 'Create'} Invoice
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Modal */}
        {showClientModal && (
          <div className="modal-backdrop" onClick={closeAllModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h3>
                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Company Name *</label>
                  <input
                    type="text"
                    className="input"
                    value={clientForm.name || ''}
                    onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="input"
                    value={clientForm.email || ''}
                    onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="input"
                    value={clientForm.phone || ''}
                    onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={clientForm.address || ''}
                    onChange={(e) => setClientForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="form-label">Tax ID</label>
                  <input
                    type="text"
                    className="input"
                    value={clientForm.taxId || ''}
                    onChange={(e) => setClientForm(prev => ({ ...prev, taxId: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={closeAllModals}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={saveClient}
                  className="btn btn-primary"
                >
                  {editingClient ? 'Update' : 'Add'} Client
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoiceForPayment && (
          <div className="modal-backdrop" onClick={closeAllModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium">Record Payment</h3>
                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-medium">{selectedInvoiceForPayment.invoiceNumber}</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {selectedInvoiceForPayment.clientName} • {formatCurrency(selectedInvoiceForPayment.total)}
                  </p>
                </div>
                
                <div>
                  <label className="form-label">Payment Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input"
                    value={paymentForm.amount || ''}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Payment Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={paymentForm.date || ''}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Payment Method</label>
                  <select
                    className="input"
                    value={paymentForm.method || 'bank_transfer'}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, method: e.target.value as PaymentMethod }))}
                  >
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Reference Number</label>
                  <input
                    type="text"
                    className="input"
                    value={paymentForm.reference || ''}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="Transaction ID, Check number, etc."
                  />
                </div>
                
                <div>
                  <label className="form-label">Notes</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={paymentForm.notes || ''}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional payment notes..."
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={closeAllModals}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={recordPayment}
                  className="btn btn-primary"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-auto">
          <div className="container-fluid">
            <div className="text-center text-sm text-gray-500 dark:text-slate-400">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;