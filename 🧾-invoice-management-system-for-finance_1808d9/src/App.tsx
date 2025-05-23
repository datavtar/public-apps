import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  DollarSign, 
  Receipt, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  ArrowUp,
  ArrowDown,
  FileText,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line } from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

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
  unitPrice: number;
  total: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  client: Client;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

type FilterStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
type SortField = 'invoiceNumber' | 'issueDate' | 'dueDate' | 'totalAmount' | 'status';
type SortDirection = 'asc' | 'desc';

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices' | 'clients'>('dashboard');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'invoice' | 'client' | 'view'>('invoice');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);
  
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Initialize sample data
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedClients = localStorage.getItem('clients');
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    } else {
      const sampleClients: Client[] = [
        {
          id: '1',
          name: 'Acme Corporation',
          email: 'billing@acme.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business Ave, New York, NY 10001',
          taxId: 'US123456789'
        },
        {
          id: '2',
          name: 'Tech Solutions Ltd',
          email: 'accounts@techsolutions.com',
          phone: '+1 (555) 987-6543',
          address: '456 Innovation Dr, San Francisco, CA 94105',
          taxId: 'US987654321'
        },
        {
          id: '3',
          name: 'Global Enterprises',
          email: 'finance@global.com',
          phone: '+1 (555) 555-0123',
          address: '789 Corporate Blvd, Chicago, IL 60601',
          taxId: 'US456789123'
        }
      ];
      setClients(sampleClients);
      localStorage.setItem('clients', JSON.stringify(sampleClients));
    }
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      const sampleInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          clientId: '1',
          client: {
            id: '1',
            name: 'Acme Corporation',
            email: 'billing@acme.com',
            phone: '+1 (555) 123-4567',
            address: '123 Business Ave, New York, NY 10001',
            taxId: 'US123456789'
          },
          issueDate: '2024-01-15',
          dueDate: '2024-02-14',
          items: [
            { id: '1', description: 'Web Development Services', quantity: 40, unitPrice: 125, total: 5000 },
            { id: '2', description: 'Project Management', quantity: 20, unitPrice: 100, total: 2000 }
          ],
          subtotal: 7000,
          taxRate: 8.25,
          taxAmount: 577.5,
          discountAmount: 0,
          totalAmount: 7577.5,
          status: 'paid',
          notes: 'Thank you for your business!',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          clientId: '2',
          client: {
            id: '2',
            name: 'Tech Solutions Ltd',
            email: 'accounts@techsolutions.com',
            phone: '+1 (555) 987-6543',
            address: '456 Innovation Dr, San Francisco, CA 94105',
            taxId: 'US987654321'
          },
          issueDate: '2024-01-20',
          dueDate: '2024-02-19',
          items: [
            { id: '1', description: 'Software Consultation', quantity: 15, unitPrice: 200, total: 3000 },
            { id: '2', description: 'Technical Documentation', quantity: 25, unitPrice: 80, total: 2000 }
          ],
          subtotal: 5000,
          taxRate: 8.25,
          taxAmount: 412.5,
          discountAmount: 250,
          totalAmount: 5162.5,
          status: 'sent',
          notes: '',
          createdAt: '2024-01-20T09:00:00Z',
          updatedAt: '2024-01-20T09:00:00Z'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          clientId: '3',
          client: {
            id: '3',
            name: 'Global Enterprises',
            email: 'finance@global.com',
            phone: '+1 (555) 555-0123',
            address: '789 Corporate Blvd, Chicago, IL 60601',
            taxId: 'US456789123'
          },
          issueDate: '2024-01-25',
          dueDate: '2024-01-25',
          items: [
            { id: '1', description: 'Monthly Retainer', quantity: 1, unitPrice: 5000, total: 5000 }
          ],
          subtotal: 5000,
          taxRate: 8.25,
          taxAmount: 412.5,
          discountAmount: 0,
          totalAmount: 5412.5,
          status: 'overdue',
          notes: 'Payment terms: Net 30',
          createdAt: '2024-01-25T11:00:00Z',
          updatedAt: '2024-01-25T11:00:00Z'
        }
      ];
      setInvoices(sampleInvoices);
      localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
    }
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle escape key for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showAIModal) {
          setShowAIModal(false);
        } else if (showModal) {
          setShowModal(false);
        }
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [showModal, showAIModal]);

  // Generate next invoice number
  const generateInvoiceNumber = (): string => {
    const year = new Date().getFullYear();
    const existingNumbers = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith(`INV-${year}-`))
      .map(num => parseInt(num.split('-')[2]) || 0);
    const nextNumber = Math.max(...existingNumbers, 0) + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  // Filter and sort invoices
  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'invoiceNumber':
          aValue = a.invoiceNumber;
          bValue = b.invoiceNumber;
          break;
        case 'issueDate':
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Calculate dashboard statistics
  const calculateStats = () => {
    const total = invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const pending = invoices.filter(inv => inv.status === 'sent').reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    const overdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, invoice) => sum + invoice.totalAmount, 0);
    
    return { total, paid, pending, overdue, count: invoices.length };
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'sent': return 'badge-info';
      case 'overdue': return 'badge-error';
      case 'draft': return 'badge-warning';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      default: return 'badge-info';
    }
  };

  // Get chart data
  const getChartData = () => {
    const monthlyData: { [key: string]: number } = {};
    const statusData: { [key: string]: number } = {};
    
    invoices.forEach(invoice => {
      const month = new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[month] = (monthlyData[month] || 0) + invoice.totalAmount;
      statusData[invoice.status] = (statusData[invoice.status] || 0) + 1;
    });
    
    const monthlyChartData = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount: Math.round(amount)
    }));
    
    const statusChartData = Object.entries(statusData).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
    
    return { monthlyChartData, statusChartData };
  };

  // Handle invoice operations
  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setModalType('invoice');
    setShowModal(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setModalType('invoice');
    setShowModal(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setViewingInvoice(invoice);
    setModalType('view');
    setShowModal(true);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };

  // Handle client operations
  const handleAddClient = () => {
    setEditingClient(null);
    setModalType('client');
    setShowModal(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setModalType('client');
    setShowModal(true);
  };

  const handleDeleteClient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(client => client.id !== id));
      // Also update invoices to remove client reference
      setInvoices(invoices.filter(invoice => invoice.clientId !== id));
    }
  };

  // Handle AI functionality
  const handleSendToAI = () => {
    if (!promptText.trim() && !selectedFile) {
      setError("Please provide a prompt or select a file.");
      return;
    }
    setResult(null);
    setError(null);
    aiLayerRef.current?.sendToAI();
  };

  const handleAIAnalysis = () => {
    setPromptText('Analyze this invoice document and extract key information including client details, invoice items, amounts, and dates. Provide the analysis in a structured format.');
    setShowAIModal(true);
  };

  // Export data as CSV
  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Status', 'Total Amount'];
    const csvData = filteredInvoices.map(invoice => [
      invoice.invoiceNumber,
      invoice.client.name,
      invoice.issueDate,
      invoice.dueDate,
      invoice.status,
      invoice.totalAmount.toFixed(2)
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
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

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setShowAIModal(false);
    setEditingInvoice(null);
    setEditingClient(null);
    setViewingInvoice(null);
    document.body.classList.remove('modal-open');
  };

  const stats = calculateStats();
  const { monthlyChartData, statusChartData } = getChartData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Manager</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleAIAnalysis}
                className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                AI Analysis
              </button>
              
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex gap-6 pb-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('invoices')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'invoices'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Invoices
            </button>
            <button
              onClick={() => setCurrentView('clients')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'clients'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Clients
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value">${stats.total.toLocaleString()}</div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Paid Invoices</div>
                    <div className="stat-value">${stats.paid.toLocaleString()}</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Pending</div>
                    <div className="stat-value">${stats.pending.toLocaleString()}</div>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Overdue</div>
                    <div className="stat-value">${stats.overdue.toLocaleString()}</div>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                      labelStyle={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1px solid #475569' : '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Invoice Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip 
                      formatter={(value) => [value, 'Count']}
                      labelStyle={{ color: isDarkMode ? '#f1f5f9' : '#1f2937' }}
                      contentStyle={{ 
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        border: isDarkMode ? '1px solid #475569' : '1px solid #d1d5db',
                        borderRadius: '8px'
                      }}
                    />
                    <pie
                      dataKey="value"
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="card">
              <div className="flex-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
                <button
                  onClick={() => setCurrentView('invoices')}
                  className="btn btn-primary btn-sm"
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
                      <th className="table-header">Date</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {invoices.slice(0, 5).map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">{invoice.client.name}</td>
                        <td className="table-cell">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="table-cell">${invoice.totalAmount.toLocaleString()}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
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

        {currentView === 'invoices' && (
          <div className="space-y-6">
            {/* Invoice Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
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
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={handleAddInvoice}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  New Invoice
                </button>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th 
                        className="table-header cursor-pointer select-none"
                        onClick={() => handleSort('invoiceNumber')}
                      >
                        <div className="flex items-center gap-1">
                          Invoice #
                          {sortField === 'invoiceNumber' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="table-header">Client</th>
                      <th 
                        className="table-header cursor-pointer select-none"
                        onClick={() => handleSort('issueDate')}
                      >
                        <div className="flex items-center gap-1">
                          Issue Date
                          {sortField === 'issueDate' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="table-header cursor-pointer select-none"
                        onClick={() => handleSort('dueDate')}
                      >
                        <div className="flex items-center gap-1">
                          Due Date
                          {sortField === 'dueDate' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="table-header cursor-pointer select-none"
                        onClick={() => handleSort('totalAmount')}
                      >
                        <div className="flex items-center gap-1">
                          Amount
                          {sortField === 'totalAmount' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="table-header cursor-pointer select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Status
                          {sortField === 'status' && (
                            sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                          )}
                        </div>
                      </th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium">{invoice.client.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.client.email}</div>
                          </div>
                        </td>
                        <td className="table-cell">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td className="table-cell font-medium">${invoice.totalAmount.toLocaleString()}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewInvoice(invoice)}
                              className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                              title="Edit Invoice"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                              title="Delete Invoice"
                            >
                              <Trash2 className="h-4 w-4" />
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
                  <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No invoices found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new invoice.</p>
                  <div className="mt-6">
                    <button
                      onClick={handleAddInvoice}
                      className="btn btn-primary"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'clients' && (
          <div className="space-y-6">
            {/* Client Actions */}
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h2>
              <button
                onClick={handleAddClient}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Client
              </button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                        <Building className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ID: {client.id}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Edit Client"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete Client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Mail className="h-4 w-4" />
                      {client.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Phone className="h-4 w-4" />
                      {client.phone}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {client.address}
                    </div>
                    {client.taxId && (
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Tax ID: {client.taxId}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Total Invoices:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoices.filter(inv => inv.clientId === client.id).length}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500 dark:text-gray-400">Total Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${invoices
                          .filter(inv => inv.clientId === client.id)
                          .reduce((sum, inv) => sum + inv.totalAmount, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {clients.length === 0 && (
              <div className="text-center py-12">
                <Building className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No clients found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding a new client.</p>
                <div className="mt-6">
                  <button
                    onClick={handleAddClient}
                    className="btn btn-primary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Client
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <InvoiceModal
          type={modalType}
          invoice={editingInvoice}
          client={editingClient}
          viewingInvoice={viewingInvoice}
          clients={clients}
          onSave={(data) => {
            if (modalType === 'invoice') {
              const invoiceData = data as Invoice;
              if (editingInvoice) {
                setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? invoiceData : inv));
              } else {
                setInvoices([...invoices, invoiceData]);
              }
            } else if (modalType === 'client') {
              const clientData = data as Client;
              if (editingClient) {
                setClients(clients.map(cli => cli.id === editingClient.id ? clientData : cli));
                // Update invoices with updated client data
                setInvoices(invoices.map(inv => 
                  inv.clientId === clientData.id ? { ...inv, client: clientData } : inv
                ));
              } else {
                setClients([...clients, clientData]);
              }
            }
            closeModal();
          }}
          onClose={closeModal}
        />
      )}

      {showAIModal && (
        <AIModal
          promptText={promptText}
          setPromptText={setPromptText}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          result={result}
          isLoading={isLoading}
          error={error}
          onSendToAI={handleSendToAI}
          onClose={() => setShowAIModal(false)}
        />
      )}

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(apiResult) => setResult(apiResult)}
        onError={(apiError) => setError(apiError)}
        onLoading={(loadingStatus) => setIsLoading(loadingStatus)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12">
        <div className="container-wide py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Invoice/Client Modal Component
interface ModalProps {
  type: 'invoice' | 'client' | 'view';
  invoice?: Invoice | null;
  client?: Client | null;
  viewingInvoice?: Invoice | null;
  clients: Client[];
  onSave: (data: Invoice | Client) => void;
  onClose: () => void;
}

const InvoiceModal: React.FC<ModalProps> = ({ 
  type, 
  invoice, 
  client, 
  viewingInvoice, 
  clients, 
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState<any>({});
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  useEffect(() => {
    if (type === 'invoice') {
      if (invoice) {
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          clientId: invoice.clientId,
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          status: invoice.status,
          notes: invoice.notes || '',
          taxRate: invoice.taxRate,
          discountAmount: invoice.discountAmount || 0
        });
        setItems(invoice.items);
      } else {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        setFormData({
          invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
          clientId: '',
          issueDate: tomorrow.toISOString().split('T')[0],
          dueDate: nextMonth.toISOString().split('T')[0],
          status: 'draft',
          notes: '',
          taxRate: 8.25,
          discountAmount: 0
        });
        setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
      }
    } else if (type === 'client') {
      if (client) {
        setFormData(client);
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          address: '',
          taxId: ''
        });
      }
    }
  }, [type, invoice, client]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (type === 'invoice') {
      if (!formData.invoiceNumber?.trim()) newErrors.invoiceNumber = 'Invoice number is required';
      if (!formData.clientId) newErrors.clientId = 'Client is required';
      if (!formData.issueDate) newErrors.issueDate = 'Issue date is required';
      if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
      if (items.length === 0 || !items.some(item => item.description.trim())) {
        newErrors.items = 'At least one item is required';
      }
    } else if (type === 'client') {
      if (!formData.name?.trim()) newErrors.name = 'Client name is required';
      if (!formData.email?.trim()) newErrors.email = 'Email is required';
      if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
      if (!formData.address?.trim()) newErrors.address = 'Address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    if (type === 'invoice') {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      if (!selectedClient) return;
      
      const validItems = items.filter(item => item.description.trim());
      const subtotal = validItems.reduce((sum, item) => sum + item.total, 0);
      const taxAmount = subtotal * (formData.taxRate / 100);
      const totalAmount = subtotal + taxAmount - (formData.discountAmount || 0);
      
      const invoiceData: Invoice = {
        id: invoice?.id || Date.now().toString(),
        invoiceNumber: formData.invoiceNumber,
        clientId: formData.clientId,
        client: selectedClient,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
        items: validItems,
        subtotal,
        taxRate: formData.taxRate,
        taxAmount,
        discountAmount: formData.discountAmount || 0,
        totalAmount,
        status: formData.status,
        notes: formData.notes,
        createdAt: invoice?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      onSave(invoiceData);
    } else if (type === 'client') {
      const clientData: Client = {
        id: client?.id || Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId
      };
      
      onSave(clientData);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  if (type === 'view' && viewingInvoice) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Invoice {viewingInvoice.invoiceNumber}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className={styles.invoicePrint}>
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{viewingInvoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Issue Date: {new Date(viewingInvoice.issueDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Due Date: {new Date(viewingInvoice.dueDate).toLocaleDateString()}</p>
                  <span className={`badge ${getStatusColor(viewingInvoice.status)} mt-2 inline-block`}>
                    {viewingInvoice.status.charAt(0).toUpperCase() + viewingInvoice.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {/* Client Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Bill To:</h3>
                  <div className="text-gray-600 dark:text-gray-300">
                    <p className="font-medium">{viewingInvoice.client.name}</p>
                    <p>{viewingInvoice.client.email}</p>
                    <p>{viewingInvoice.client.phone}</p>
                    <p className="whitespace-pre-line">{viewingInvoice.client.address}</p>
                    {viewingInvoice.client.taxId && <p>Tax ID: {viewingInvoice.client.taxId}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">From:</h3>
                  <div className="text-gray-600 dark:text-gray-300">
                    <p className="font-medium">Your Company Name</p>
                    <p>your-email@company.com</p>
                    <p>+1 (555) 000-0000</p>
                    <p>Your Business Address</p>
                  </div>
                </div>
              </div>
              
              {/* Invoice Items */}
              <div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-600">
                      <th className="text-left py-2 font-semibold text-gray-900 dark:text-white">Description</th>
                      <th className="text-right py-2 font-semibold text-gray-900 dark:text-white">Qty</th>
                      <th className="text-right py-2 font-semibold text-gray-900 dark:text-white">Rate</th>
                      <th className="text-right py-2 font-semibold text-gray-900 dark:text-white">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingInvoice.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-slate-700">
                        <td className="py-3 text-gray-900 dark:text-white">{item.description}</td>
                        <td className="py-3 text-right text-gray-600 dark:text-gray-300">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-600 dark:text-gray-300">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 text-right text-gray-900 dark:text-white">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Invoice Totals */}
              <div className="flex justify-end">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">${viewingInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  {viewingInvoice.discountAmount > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-300">Discount:</span>
                      <span className="text-gray-900 dark:text-white">-${viewingInvoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600 dark:text-gray-300">Tax ({viewingInvoice.taxRate}%):</span>
                    <span className="text-gray-900 dark:text-white">${viewingInvoice.taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t border-gray-200 dark:border-slate-600 font-semibold">
                    <span className="text-gray-900 dark:text-white">Total:</span>
                    <span className="text-gray-900 dark:text-white">${viewingInvoice.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              {viewingInvoice.notes && (
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h3>
                  <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{viewingInvoice.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => window.print()}
              className="btn bg-blue-600 text-white hover:bg-blue-700"
            >
              Print Invoice
            </button>
            <button onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type === 'invoice' 
              ? (invoice ? 'Edit Invoice' : 'Create New Invoice')
              : (client ? 'Edit Client' : 'Add New Client')
            }
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {type === 'invoice' ? (
            <>
              {/* Invoice Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    className="input"
                    required
                  />
                  {errors.invoiceNumber && <p className="form-error">{errors.invoiceNumber}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Client</label>
                  <select
                    value={formData.clientId || ''}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                  {errors.clientId && <p className="form-error">{errors.clientId}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    value={formData.issueDate || ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="input"
                    required
                  />
                  {errors.issueDate && <p className="form-error">{errors.issueDate}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate || ''}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="input"
                    required
                  />
                  {errors.dueDate && <p className="form-error">{errors.dueDate}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                  <label className="form-label">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxRate || 0}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
              </div>
              
              {/* Invoice Items */}
              <div className="form-group">
                <div className="flex items-center justify-between mb-4">
                  <label className="form-label mb-0">Invoice Items</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-12 sm:col-span-5">
                        <label className="form-label text-xs">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          className="input input-sm"
                          placeholder="Service or product description"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="form-label text-xs">Quantity</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="input input-sm"
                          min="1"
                        />
                      </div>
                      <div className="col-span-4 sm:col-span-2">
                        <label className="form-label text-xs">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="input input-sm"
                        />
                      </div>
                      <div className="col-span-3 sm:col-span-2">
                        <label className="form-label text-xs">Total</label>
                        <div className="input input-sm bg-gray-50 dark:bg-slate-700">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
                          disabled={items.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.items && <p className="form-error">{errors.items}</p>}
              </div>
              
              {/* Discount and Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Discount Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountAmount || 0}
                    onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Additional notes or payment terms"
                  />
                </div>
              </div>
              
              {/* Invoice Summary */}
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Invoice Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                    <span className="font-medium">${items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                  </div>
                  {formData.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Discount:</span>
                      <span className="font-medium">-${(formData.discountAmount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Tax ({formData.taxRate || 0}%):</span>
                    <span className="font-medium">${(items.reduce((sum, item) => sum + item.total, 0) * ((formData.taxRate || 0) / 100)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total:</span>
                    <span>${(items.reduce((sum, item) => sum + item.total, 0) + (items.reduce((sum, item) => sum + item.total, 0) * ((formData.taxRate || 0) / 100)) - (formData.discountAmount || 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Client Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Client Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    required
                  />
                  {errors.name && <p className="form-error">{errors.name}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    required
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    required
                  />
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label">Tax ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.taxId || ''}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="input"
                  rows={3}
                  required
                />
                {errors.address && <p className="form-error">{errors.address}</p>}
              </div>
            </>
          )}
          
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {type === 'invoice' 
                ? (invoice ? 'Update Invoice' : 'Create Invoice')
                : (client ? 'Update Client' : 'Add Client')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// AI Modal Component
interface AIModalProps {
  promptText: string;
  setPromptText: (text: string) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  result: string | null;
  isLoading: boolean;
  error: any;
  onSendToAI: () => void;
  onClose: () => void;
}

const AIModal: React.FC<AIModalProps> = ({
  promptText,
  setPromptText,
  selectedFile,
  setSelectedFile,
  result,
  isLoading,
  error,
  onSendToAI,
  onClose
}) => {
  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            AI Invoice Analysis
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="form-group">
            <label className="form-label">AI Prompt</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              className="input"
              rows={4}
              placeholder="Enter your AI prompt or leave default for invoice analysis..."
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Upload Invoice Document (Optional)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="input"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp"
            />
            {selectedFile && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          
          {error && (
            <div className="alert alert-error">
              <AlertCircle className="h-5 w-5" />
              <p>Error: {error.toString()}</p>
            </div>
          )}
          
          {result && (
            <div className="form-group">
              <label className="form-label">AI Analysis Result</label>
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white">
                  {result}
                </pre>
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
            Close
          </button>
          <button
            onClick={onSendToAI}
            disabled={isLoading || (!promptText.trim() && !selectedFile)}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Analyze with AI
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function for status colors (moved outside component)
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return 'badge-success';
    case 'sent': return 'badge-info';
    case 'overdue': return 'badge-error';
    case 'draft': return 'badge-warning';
    case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    default: return 'badge-info';
  }
};

export default App;