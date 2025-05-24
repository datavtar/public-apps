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
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  FileText, 
  BarChart3, 
  PieChart as LucidePieChart,
  Settings,
  Moon,
  Sun,
  User,
  Mail,
  Phone,
  Building,
  CreditCard,
  Receipt,
  Percent,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
type PaymentMethod = 'bank_transfer' | 'credit_card' | 'check' | 'cash' | 'paypal';
type InvoiceType = 'standard' | 'recurring' | 'credit_note' | 'proforma';

interface Customer {
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
  taxRate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  type: InvoiceType;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  paymentTerms?: string;
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

interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const App: React.FC = () => {
  // Core state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'invoices' | 'customers' | 'payments' | 'reports' | 'settings'>('dashboard');
  
  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'invoice' | 'customer' | 'payment' | 'view' | 'ai'>('invoice');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'customer'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // AI Layer state
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  // Form state
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({
    items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 }]
  });
  const [customerForm, setCustomerForm] = useState<Partial<Customer>>({});
  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedCustomers = localStorage.getItem('customers');
    const savedPayments = localStorage.getItem('payments');
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      // Initialize with sample data
      const sampleData = generateSampleData();
      setInvoices(sampleData.invoices);
      setCustomers(sampleData.customers);
      setPayments(sampleData.payments);
    }
    
    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
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
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);
  
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

  // Generate sample data
  const generateSampleData = () => {
    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1-555-0123',
        address: '123 Business St, Suite 100, New York, NY 10001',
        taxId: 'US123456789'
      },
      {
        id: '2',
        name: 'TechStart Inc.',
        email: 'finance@techstart.com',
        phone: '+1-555-0456',
        address: '456 Innovation Ave, San Francisco, CA 94105',
        taxId: 'US987654321'
      },
      {
        id: '3',
        name: 'Global Solutions Ltd.',
        email: 'accounts@globalsolutions.com',
        phone: '+1-555-0789',
        address: '789 Enterprise Blvd, Chicago, IL 60601',
        taxId: 'US456789123'
      }
    ];
    
    const sampleInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customer: sampleCustomers[0],
        issueDate: '2024-01-15',
        dueDate: '2024-02-14',
        status: 'paid',
        type: 'standard',
        items: [
          {
            id: '1',
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 125,
            taxRate: 8.25,
            amount: 5000
          },
          {
            id: '2',
            description: 'UI/UX Design',
            quantity: 20,
            unitPrice: 150,
            taxRate: 8.25,
            amount: 3000
          }
        ],
        subtotal: 8000,
        taxAmount: 660,
        discountAmount: 0,
        totalAmount: 8660,
        notes: 'Thank you for your business!',
        paymentTerms: 'Net 30',
        paymentMethod: 'bank_transfer',
        paidDate: '2024-02-10',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-02-10T14:30:00Z'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customerId: '2',
        customer: sampleCustomers[1],
        issueDate: '2024-01-20',
        dueDate: '2024-02-19',
        status: 'sent',
        type: 'standard',
        items: [
          {
            id: '1',
            description: 'Software Consulting',
            quantity: 30,
            unitPrice: 200,
            taxRate: 8.25,
            amount: 6000
          }
        ],
        subtotal: 6000,
        taxAmount: 495,
        discountAmount: 100,
        totalAmount: 6395,
        notes: 'Early payment discount applied',
        paymentTerms: 'Net 30',
        createdAt: '2024-01-20T09:15:00Z',
        updatedAt: '2024-01-20T09:15:00Z'
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        customerId: '3',
        customer: sampleCustomers[2],
        issueDate: '2024-01-10',
        dueDate: '2024-02-09',
        status: 'overdue',
        type: 'standard',
        items: [
          {
            id: '1',
            description: 'Data Analysis Services',
            quantity: 25,
            unitPrice: 180,
            taxRate: 8.25,
            amount: 4500
          }
        ],
        subtotal: 4500,
        taxAmount: 371.25,
        discountAmount: 0,
        totalAmount: 4871.25,
        paymentTerms: 'Net 30',
        createdAt: '2024-01-10T11:45:00Z',
        updatedAt: '2024-01-10T11:45:00Z'
      }
    ];
    
    const samplePayments: Payment[] = [
      {
        id: '1',
        invoiceId: '1',
        amount: 8660,
        method: 'bank_transfer',
        date: '2024-02-10',
        reference: 'TXN-001234',
        notes: 'Full payment received'
      }
    ];
    
    return { invoices: sampleInvoices, customers: sampleCustomers, payments: samplePayments };
  };

  // Utility functions
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(3, '0')}`;
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
  
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: InvoiceStatus) => {
    switch (status) {
      case 'draft': return <FileText className="w-4 h-4" />;
      case 'sent': return <Clock className="w-4 h-4" />;
      case 'paid': return <CheckCircle className="w-4 h-4" />;
      case 'overdue': return <AlertCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Calculate dashboard statistics
  const getDashboardStats = (): DashboardStats => {
    const totalRevenue = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    
    return {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(inv => inv.status === 'paid').length,
      pendingInvoices: invoices.filter(inv => inv.status === 'sent').length,
      overdueInvoices: invoices.filter(inv => inv.status === 'overdue').length
    };
  };

  // Filter and sort invoices
  const getFilteredInvoices = () => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const matchesDateRange = !dateRange.start || !dateRange.end ||
                              (invoice.issueDate >= dateRange.start && invoice.issueDate <= dateRange.end);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
    
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.issueDate);
          bValue = new Date(b.issueDate);
          break;
        case 'amount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'customer':
          aValue = a.customer.name;
          bValue = b.customer.name;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  };

  // Invoice CRUD operations
  const saveInvoice = () => {
    if (!invoiceForm.customer || !invoiceForm.items || invoiceForm.items.length === 0) {
      alert('Please fill in all required fields');
      return;
    }
    
    const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = invoiceForm.items.reduce((sum, item) => {
      const itemTax = (item.amount || 0) * ((item.taxRate || 0) / 100);
      return sum + itemTax;
    }, 0);
    const totalAmount = subtotal + taxAmount - (invoiceForm.discountAmount || 0);
    
    const invoice: Invoice = {
      id: editingInvoice?.id || generateId(),
      invoiceNumber: editingInvoice?.invoiceNumber || generateInvoiceNumber(),
      customerId: invoiceForm.customer.id!,
      customer: invoiceForm.customer,
      issueDate: invoiceForm.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: invoiceForm.status || 'draft',
      type: invoiceForm.type || 'standard',
      items: invoiceForm.items,
      subtotal,
      taxAmount,
      discountAmount: invoiceForm.discountAmount || 0,
      totalAmount,
      notes: invoiceForm.notes,
      paymentTerms: invoiceForm.paymentTerms,
      paymentMethod: invoiceForm.paymentMethod,
      paidDate: invoiceForm.paidDate,
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (editingInvoice) {
      setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? invoice : inv));
    } else {
      setInvoices([...invoices, invoice]);
    }
    
    closeModal();
  };
  
  const deleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
    }
  };
  
  const duplicateInvoice = (invoice: Invoice) => {
    const newInvoice = {
      ...invoice,
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      status: 'draft' as InvoiceStatus,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidDate: undefined
    };
    setInvoices([...invoices, newInvoice]);
  };

  // Customer CRUD operations
  const saveCustomer = () => {
    if (!customerForm.name || !customerForm.email) {
      alert('Please fill in required fields');
      return;
    }
    
    const customer: Customer = {
      id: editingCustomer?.id || generateId(),
      name: customerForm.name,
      email: customerForm.email,
      phone: customerForm.phone || '',
      address: customerForm.address || '',
      taxId: customerForm.taxId
    };
    
    if (editingCustomer) {
      setCustomers(customers.map(cust => cust.id === editingCustomer.id ? customer : cust));
    } else {
      setCustomers([...customers, customer]);
    }
    
    closeModal();
  };
  
  const deleteCustomer = (id: string) => {
    const hasInvoices = invoices.some(inv => inv.customerId === id);
    if (hasInvoices) {
      alert('Cannot delete customer with existing invoices');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this customer?')) {
      setCustomers(customers.filter(cust => cust.id !== id));
    }
  };

  // Payment operations
  const savePayment = () => {
    if (!paymentForm.invoiceId || !paymentForm.amount || !paymentForm.method || !paymentForm.date) {
      alert('Please fill in all required fields');
      return;
    }
    
    const payment: Payment = {
      id: generateId(),
      invoiceId: paymentForm.invoiceId,
      amount: paymentForm.amount,
      method: paymentForm.method,
      date: paymentForm.date,
      reference: paymentForm.reference,
      notes: paymentForm.notes
    };
    
    setPayments([...payments, payment]);
    
    // Update invoice status if fully paid
    const invoice = invoices.find(inv => inv.id === paymentForm.invoiceId);
    if (invoice) {
      const totalPaid = payments
        .filter(p => p.invoiceId === invoice.id)
        .reduce((sum, p) => sum + p.amount, 0) + payment.amount;
      
      if (totalPaid >= invoice.totalAmount) {
        setInvoices(invoices.map(inv => 
          inv.id === invoice.id 
            ? { ...inv, status: 'paid' as InvoiceStatus, paidDate: payment.date }
            : inv
        ));
      }
    }
    
    closeModal();
  };

  // Modal management
  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type);
    
    if (type === 'invoice') {
      if (item) {
        setEditingInvoice(item);
        setInvoiceForm(item);
      } else {
        setEditingInvoice(null);
        setInvoiceForm({
          items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 }],
          status: 'draft',
          type: 'standard',
          discountAmount: 0
        });
      }
    } else if (type === 'customer') {
      if (item) {
        setEditingCustomer(item);
        setCustomerForm(item);
      } else {
        setEditingCustomer(null);
        setCustomerForm({});
      }
    } else if (type === 'payment') {
      setPaymentForm({ invoiceId: item?.id || '', method: 'bank_transfer' });
    } else if (type === 'view') {
      setViewingInvoice(item);
    } else if (type === 'ai') {
      setPromptText('');
      setSelectedFile(null);
      setAiResult(null);
      setAiError(null);
    }
    
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
    setEditingInvoice(null);
    setEditingCustomer(null);
    setViewingInvoice(null);
    setInvoiceForm({ items: [{ id: '1', description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 }] });
    setCustomerForm({});
    setPaymentForm({});
  };

  // Invoice item management
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: generateId(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      amount: 0
    };
    setInvoiceForm({
      ...invoiceForm,
      items: [...(invoiceForm.items || []), newItem]
    });
  };
  
  const updateInvoiceItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const items = [...(invoiceForm.items || [])];
    items[index] = { ...items[index], [field]: value };
    
    if (field === 'quantity' || field === 'unitPrice') {
      items[index].amount = items[index].quantity * items[index].unitPrice;
    }
    
    setInvoiceForm({ ...invoiceForm, items });
  };
  
  const removeInvoiceItem = (index: number) => {
    const items = [...(invoiceForm.items || [])];
    items.splice(index, 1);
    setInvoiceForm({ ...invoiceForm, items });
  };

  // AI functionality
  const handleSendToAI = () => {
    if (!promptText.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPromptText('Analyze this invoice document and extract key information including customer details, line items, amounts, dates, and payment terms. Provide a structured summary.');
    }
  };

  // Export functionality
  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Customer', 'Issue Date', 'Due Date', 'Status', 'Total Amount'];
    const csvContent = [
      headers.join(','),
      ...getFilteredInvoices().map(invoice => [
        invoice.invoiceNumber,
        `"${invoice.customer.name}"`,
        invoice.issueDate,
        invoice.dueDate,
        invoice.status,
        invoice.totalAmount
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'invoices.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Chart data preparation
  const getMonthlyRevenueData = () => {
    const monthlyData: { [key: string]: number } = {};
    invoices.filter(inv => inv.status === 'paid').forEach(invoice => {
      const month = invoice.issueDate.substring(0, 7); // YYYY-MM
      monthlyData[month] = (monthlyData[month] || 0) + invoice.totalAmount;
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue
      }));
  };
  
  const getStatusDistributionData = () => {
    const statusCounts: { [key: string]: number } = {};
    invoices.forEach(invoice => {
      statusCounts[invoice.status] = (statusCounts[invoice.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
  };

  const stats = getDashboardStats();
  const filteredInvoices = getFilteredInvoices();
  const monthlyRevenue = getMonthlyRevenueData();
  const statusDistribution = getStatusDistributionData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Receipt className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Manager</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => openModal('ai')}
                className="btn btn-sm bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                AI Analysis
              </button>
              
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

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'customers', label: 'Customers', icon: User },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'reports', label: 'Reports', icon: LucidePieChart },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap theme-transition ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Pending</div>
                    <div className="stat-value">{formatCurrency(stats.pendingAmount)}</div>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Overdue</div>
                    <div className="stat-value">{formatCurrency(stats.overdueAmount)}</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Invoices</div>
                    <div className="stat-value">{stats.totalInvoices}</div>
                  </div>
                  <FileText className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Invoice #</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {invoices.slice(0, 5).map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">{invoice.customer.name}</td>
                        <td className="table-cell">{formatDate(invoice.issueDate)}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)} flex items-center gap-1`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell font-medium">{formatCurrency(invoice.totalAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            {/* Filters and Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 theme-transition">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
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
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="input w-full sm:w-auto"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="input w-full sm:w-auto"
                    placeholder="Start Date"
                  />
                  
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="input w-full sm:w-auto"
                    placeholder="End Date"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={exportToCSV}
                    className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                  
                  <button
                    onClick={() => openModal('invoice')}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Invoice
                  </button>
                </div>
              </div>
            </div>

            {/* Invoices Table */}
            <div className="card p-0 overflow-hidden">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">
                        <button
                          onClick={() => {
                            if (sortBy === 'date') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy('date');
                              setSortOrder('desc');
                            }
                          }}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-200"
                        >
                          Invoice #
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="table-header">
                        <button
                          onClick={() => {
                            if (sortBy === 'customer') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy('customer');
                              setSortOrder('asc');
                            }
                          }}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-200"
                        >
                          Customer
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="table-header">Issue Date</th>
                      <th className="table-header">Due Date</th>
                      <th className="table-header">
                        <button
                          onClick={() => {
                            if (sortBy === 'status') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy('status');
                              setSortOrder('asc');
                            }
                          }}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-200"
                        >
                          Status
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="table-header">
                        <button
                          onClick={() => {
                            if (sortBy === 'amount') {
                              setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortBy('amount');
                              setSortOrder('desc');
                            }
                          }}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-200"
                        >
                          Amount
                          <ArrowUpDown className="w-3 h-3" />
                        </button>
                      </th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium">{invoice.customer.name}</div>
                            <div className="text-sm text-gray-500 dark:text-slate-400">{invoice.customer.email}</div>
                          </div>
                        </td>
                        <td className="table-cell">{formatDate(invoice.issueDate)}</td>
                        <td className="table-cell">
                          <span className={invoice.status === 'overdue' && new Date(invoice.dueDate) < new Date() ? 'text-red-600 font-medium' : ''}>
                            {formatDate(invoice.dueDate)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(invoice.status)}
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell font-medium">{formatCurrency(invoice.totalAmount)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openModal('view', invoice)}
                              className="p-1 text-gray-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 theme-transition"
                              title="View Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openModal('invoice', invoice)}
                              className="p-1 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 theme-transition"
                              title="Edit Invoice"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {invoice.status !== 'paid' && (
                              <button
                                onClick={() => openModal('payment', invoice)}
                                className="p-1 text-gray-600 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 theme-transition"
                                title="Record Payment"
                              >
                                <CreditCard className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => duplicateInvoice(invoice)}
                              className="p-1 text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 theme-transition"
                              title="Duplicate Invoice"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
                              className="p-1 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 theme-transition"
                              title="Delete Invoice"
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
                  <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No invoices found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Get started by creating a new invoice.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
              <button
                onClick={() => openModal('customer')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Customer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer) => {
                const customerInvoices = invoices.filter(inv => inv.customerId === customer.id);
                const totalAmount = customerInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
                const paidAmount = customerInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
                
                return (
                  <div key={customer.id} className="card hover:shadow-lg theme-transition">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{customer.name}</h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {customer.email}
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4" />
                              {customer.address}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">Total Sales</span>
                              <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-slate-400">Invoices</span>
                              <p className="font-medium text-gray-900 dark:text-white">{customerInvoices.length}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => openModal('customer', customer)}
                          className="p-1 text-gray-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 theme-transition"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCustomer(customer.id)}
                          className="p-1 text-gray-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 theme-transition"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {customers.length === 0 && (
              <div className="text-center py-12">
                <User className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No customers yet</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Get started by adding your first customer.</p>
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment History</h2>

            <div className="card p-0 overflow-hidden">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Invoice #</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Method</th>
                      <th className="table-header">Reference</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {payments.map((payment) => {
                      const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                      return (
                        <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                          <td className="table-cell">{formatDate(payment.date)}</td>
                          <td className="table-cell font-medium">{invoice?.invoiceNumber}</td>
                          <td className="table-cell">{invoice?.customer.name}</td>
                          <td className="table-cell font-medium">{formatCurrency(payment.amount)}</td>
                          <td className="table-cell">
                            <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                          </td>
                          <td className="table-cell">{payment.reference || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {payments.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No payments recorded</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Payments will appear here once invoices are paid.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h2>

            {/* Revenue Trend */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Customers */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Customers by Revenue</h3>
              <div className="space-y-4">
                {customers.map((customer) => {
                  const customerRevenue = invoices
                    .filter(inv => inv.customerId === customer.id && inv.status === 'paid')
                    .reduce((sum, inv) => sum + inv.totalAmount, 0);
                  const maxRevenue = Math.max(...customers.map(c => 
                    invoices.filter(inv => inv.customerId === c.id && inv.status === 'paid')
                           .reduce((sum, inv) => sum + inv.totalAmount, 0)
                  ));
                  const percentage = maxRevenue > 0 ? (customerRevenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={customer.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{customer.name}</span>
                          <span className="text-sm text-gray-600 dark:text-slate-400">{formatCurrency(customerRevenue)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appearance Settings */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</span>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Toggle between light and dark themes</p>
                    </div>
                    <button
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                        isDarkMode ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isDarkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                  <button
                    onClick={exportToCSV}
                    className="w-full btn bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </button>
                  
                  <button
                    onClick={() => {
                      if (window.confirm('This will reset all data. Are you sure?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="w-full btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="modal-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className={`modal-content ${
              modalType === 'view' ? 'max-w-4xl' : 
              modalType === 'ai' ? 'max-w-3xl' : 'max-w-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Invoice Modal */}
            {modalType === 'invoice' && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Customer *</label>
                      <select
                        value={invoiceForm.customer?.id || ''}
                        onChange={(e) => {
                          const customer = customers.find(c => c.id === e.target.value);
                          setInvoiceForm({ ...invoiceForm, customer });
                        }}
                        className="input"
                        required
                      >
                        <option value="">Select Customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>{customer.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        value={invoiceForm.status || 'draft'}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as InvoiceStatus })}
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
                      <label className="form-label">Issue Date</label>
                      <input
                        type="date"
                        value={invoiceForm.issueDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                        className="input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Due Date</label>
                      <input
                        type="date"
                        value={invoiceForm.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                        className="input"
                      />
                    </div>
                  </div>

                  {/* Line Items */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">Line Items</h4>
                      <button
                        type="button"
                        onClick={addInvoiceItem}
                        className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Add Item
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {(invoiceForm.items || []).map((item, index) => (
                        <div key={item.id} className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                              className="input input-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              className="input input-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Unit Price"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                              className="input input-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="Tax %"
                              value={item.taxRate}
                              onChange={(e) => updateInvoiceItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                              className="input input-sm"
                            />
                          </div>
                          <div className="col-span-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                          <div className="col-span-1">
                            {(invoiceForm.items || []).length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeInvoiceItem(index)}
                                className="p-1 text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency((invoiceForm.items || []).reduce((sum, item) => sum + item.amount, 0))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency((invoiceForm.items || []).reduce((sum, item) => sum + (item.amount * (item.taxRate / 100)), 0))}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Discount:</span>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceForm.discountAmount || 0}
                          onChange={(e) => setInvoiceForm({ ...invoiceForm, discountAmount: parseFloat(e.target.value) || 0 })}
                          className="input input-sm w-24 text-right"
                        />
                      </div>
                      <div className="border-t border-gray-200 dark:border-slate-600 pt-2 flex justify-between font-medium text-base">
                        <span>Total:</span>
                        <span>
                          {formatCurrency(
                            (invoiceForm.items || []).reduce((sum, item) => sum + item.amount, 0) +
                            (invoiceForm.items || []).reduce((sum, item) => sum + (item.amount * (item.taxRate / 100)), 0) -
                            (invoiceForm.discountAmount || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Payment Terms</label>
                      <input
                        type="text"
                        placeholder="e.g., Net 30"
                        value={invoiceForm.paymentTerms || ''}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentTerms: e.target.value })}
                        className="input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Payment Method</label>
                      <select
                        value={invoiceForm.paymentMethod || ''}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentMethod: e.target.value as PaymentMethod })}
                        className="input"
                      >
                        <option value="">Select Method</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="check">Check</option>
                        <option value="cash">Cash</option>
                        <option value="paypal">PayPal</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      rows={3}
                      placeholder="Additional notes or terms..."
                      value={invoiceForm.notes || ''}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                    Cancel
                  </button>
                  <button onClick={saveInvoice} className="btn btn-primary">
                    {editingInvoice ? 'Update' : 'Create'} Invoice
                  </button>
                </div>
              </>
            )}

            {/* Customer Modal */}
            {modalType === 'customer' && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                    {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Company Name *</label>
                    <input
                      type="text"
                      value={customerForm.name || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={customerForm.email || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      value={customerForm.phone || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea
                      rows={3}
                      value={customerForm.address || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Tax ID</label>
                    <input
                      type="text"
                      value={customerForm.taxId || ''}
                      onChange={(e) => setCustomerForm({ ...customerForm, taxId: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                    Cancel
                  </button>
                  <button onClick={saveCustomer} className="btn btn-primary">
                    {editingCustomer ? 'Update' : 'Add'} Customer
                  </button>
                </div>
              </>
            )}

            {/* Payment Modal */}
            {modalType === 'payment' && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                    Record Payment
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={paymentForm.amount || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Payment Method *</label>
                    <select
                      value={paymentForm.method || 'bank_transfer'}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as PaymentMethod })}
                      className="input"
                      required
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="check">Check</option>
                      <option value="cash">Cash</option>
                      <option value="paypal">PayPal</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Payment Date *</label>
                    <input
                      type="date"
                      value={paymentForm.date || new Date().toISOString().split('T')[0]}
                      onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Reference Number</label>
                    <input
                      type="text"
                      value={paymentForm.reference || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                      className="input"
                      placeholder="Transaction ID, Check number, etc."
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Notes</label>
                    <textarea
                      rows={3}
                      value={paymentForm.notes || ''}
                      onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                      className="input"
                      placeholder="Additional payment notes..."
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                    Cancel
                  </button>
                  <button onClick={savePayment} className="btn btn-primary">
                    Record Payment
                  </button>
                </div>
              </>
            )}

            {/* View Invoice Modal */}
            {modalType === 'view' && viewingInvoice && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                    Invoice {viewingInvoice.invoiceNumber}
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Invoice Header */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Bill To:</h4>
                      <div className="text-sm text-gray-600 dark:text-slate-400">
                        <p className="font-medium text-gray-900 dark:text-white">{viewingInvoice.customer.name}</p>
                        <p>{viewingInvoice.customer.email}</p>
                        {viewingInvoice.customer.phone && <p>{viewingInvoice.customer.phone}</p>}
                        {viewingInvoice.customer.address && <p>{viewingInvoice.customer.address}</p>}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-500 dark:text-slate-400">Issue Date:</span> {formatDate(viewingInvoice.issueDate)}</p>
                        <p><span className="text-gray-500 dark:text-slate-400">Due Date:</span> {formatDate(viewingInvoice.dueDate)}</p>
                        <p><span className="text-gray-500 dark:text-slate-400">Status:</span> 
                          <span className={`ml-2 badge ${getStatusColor(viewingInvoice.status)}`}>
                            {viewingInvoice.status.charAt(0).toUpperCase() + viewingInvoice.status.slice(1)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Items:</h4>
                    <div className="table-container">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header text-left">Description</th>
                            <th className="table-header text-right">Qty</th>
                            <th className="table-header text-right">Unit Price</th>
                            <th className="table-header text-right">Tax</th>
                            <th className="table-header text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                          {viewingInvoice.items.map((item) => (
                            <tr key={item.id}>
                              <td className="table-cell text-left">{item.description}</td>
                              <td className="table-cell text-right">{item.quantity}</td>
                              <td className="table-cell text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="table-cell text-right">{item.taxRate}%</td>
                              <td className="table-cell text-right font-medium">{formatCurrency(item.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(viewingInvoice.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>{formatCurrency(viewingInvoice.taxAmount)}</span>
                      </div>
                      {viewingInvoice.discountAmount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount:</span>
                          <span>-{formatCurrency(viewingInvoice.discountAmount)}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 dark:border-slate-600 pt-2 flex justify-between font-medium text-base">
                        <span>Total:</span>
                        <span>{formatCurrency(viewingInvoice.totalAmount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(viewingInvoice.notes || viewingInvoice.paymentTerms) && (
                    <div className="space-y-3">
                      {viewingInvoice.paymentTerms && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Payment Terms:</h4>
                          <p className="text-sm text-gray-600 dark:text-slate-400">{viewingInvoice.paymentTerms}</p>
                        </div>
                      )}
                      {viewingInvoice.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">Notes:</h4>
                          <p className="text-sm text-gray-600 dark:text-slate-400">{viewingInvoice.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                    Close
                  </button>
                  <button
                    onClick={() => {
                      closeModal();
                      openModal('invoice', viewingInvoice);
                    }}
                    className="btn btn-primary"
                  >
                    Edit Invoice
                  </button>
                </div>
              </>
            )}

            {/* AI Analysis Modal */}
            {modalType === 'ai' && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                    AI Invoice Analysis
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* File Upload */}
                  <div className="form-group">
                    <label className="form-label">Upload Invoice Document</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-slate-400">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-500">
                          PDF, JPG, PNG up to 10MB
                        </p>
                      </label>
                    </div>
                    {selectedFile && (
                      <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  {/* AI Prompt */}
                  <div className="form-group">
                    <label className="form-label">Analysis Prompt</label>
                    <textarea
                      rows={4}
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="input"
                      placeholder="Enter your analysis request or let AI auto-analyze the uploaded document..."
                    />
                  </div>

                  {/* AI Result */}
                  {(aiResult || aiError || isAiLoading) && (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">AI Analysis Result:</h4>
                      {isAiLoading && (
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Analyzing document...</span>
                        </div>
                      )}
                      {aiError && (
                        <div className="text-red-600 dark:text-red-400 text-sm">
                          <p>Error: {aiError.message || 'An error occurred during analysis'}</p>
                        </div>
                      )}
                      {aiResult && (
                        <div className="text-sm text-gray-700 dark:text-slate-300">
                          <pre className="whitespace-pre-wrap">{aiResult}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                    Close
                  </button>
                  <button
                    onClick={handleSendToAI}
                    disabled={isAiLoading || (!promptText.trim() && !selectedFile)}
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAiLoading ? 'Analyzing...' : 'Analyze with AI'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-fluid">
          <p className="text-center text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Keyboard shortcuts handler */}
      {isModalOpen && (
        <div
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              closeModal();
            }
          }}
          tabIndex={-1}
          className="fixed inset-0 pointer-events-none"
        />
      )}
    </div>
  );
};

export default App;