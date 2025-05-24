import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Edit, Trash2, Search, Filter, Download, Upload, Eye, EyeOff,
  DollarSign, TrendingUp, TrendingDown, Calendar, Clock, User,
  Building, Mail, Phone, FileText, Check, X, Settings, Moon, Sun,
  ChevronDown, ChevronUp, CreditCard, Receipt, Wallet, AlertCircle,
  CheckCircle, XCircle, Package, Save, ArrowLeft, ArrowRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
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
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  paymentTerms?: string;
}

interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'other';
  reference?: string;
  notes?: string;
}

type ViewMode = 'dashboard' | 'invoices' | 'clients' | 'payments' | 'settings';
type InvoiceModalMode = 'create' | 'edit' | 'view';

function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Main state
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [modalMode, setModalMode] = useState<InvoiceModalMode>('create');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // AI states
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [promptText, setPromptText] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiExtraction, setShowAiExtraction] = useState(false);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({});
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedClients = localStorage.getItem('clients');
    const savedPayments = localStorage.getItem('payments');

    if (savedInvoices) {
      try {
        setInvoices(JSON.parse(savedInvoices));
      } catch (e) {
        console.error('Error parsing saved invoices:', e);
      }
    } else {
      // Initialize with sample data
      const sampleData = generateSampleData();
      setInvoices(sampleData.invoices);
      setClients(sampleData.clients);
      setPayments(sampleData.payments);
    }

    if (savedClients) {
      try {
        setClients(JSON.parse(savedClients));
      } catch (e) {
        console.error('Error parsing saved clients:', e);
      }
    }

    if (savedPayments) {
      try {
        setPayments(JSON.parse(savedPayments));
      } catch (e) {
        console.error('Error parsing saved payments:', e);
      }
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

  // Generate sample data
  function generateSampleData() {
    const sampleClients: Client[] = [
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
        name: 'TechStart Inc.',
        email: 'finance@techstart.com',
        phone: '+1-555-0456',
        address: '456 Innovation Ave, San Francisco, CA 94105'
      },
      {
        id: '3',
        name: 'Global Solutions Ltd.',
        email: 'accounts@globalsolutions.com',
        phone: '+1-555-0789',
        address: '789 Enterprise Blvd, Chicago, IL 60601'
      }
    ];

    const sampleInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        clientId: '1',
        clientName: 'Acme Corporation',
        issueDate: '2024-01-15',
        dueDate: '2024-02-15',
        status: 'paid',
        items: [
          { id: '1', description: 'Web Development Services', quantity: 40, rate: 125, amount: 5000 },
          { id: '2', description: 'UI/UX Design', quantity: 20, rate: 100, amount: 2000 }
        ],
        subtotal: 7000,
        taxRate: 10,
        taxAmount: 700,
        total: 7700,
        notes: 'Thank you for your business!',
        paymentTerms: 'Net 30'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        clientId: '2',
        clientName: 'TechStart Inc.',
        issueDate: '2024-01-20',
        dueDate: '2024-02-20',
        status: 'sent',
        items: [
          { id: '1', description: 'Mobile App Development', quantity: 60, rate: 150, amount: 9000 }
        ],
        subtotal: 9000,
        taxRate: 8.5,
        taxAmount: 765,
        total: 9765,
        paymentTerms: 'Net 30'
      },
      {
        id: '3',
        invoiceNumber: 'INV-2024-003',
        clientId: '3',
        clientName: 'Global Solutions Ltd.',
        issueDate: '2023-12-10',
        dueDate: '2024-01-10',
        status: 'overdue',
        items: [
          { id: '1', description: 'Consulting Services', quantity: 25, rate: 200, amount: 5000 }
        ],
        subtotal: 5000,
        taxRate: 10,
        taxAmount: 500,
        total: 5500,
        paymentTerms: 'Net 30'
      }
    ];

    const samplePayments: Payment[] = [
      {
        id: '1',
        invoiceId: '1',
        amount: 7700,
        paymentDate: '2024-02-10',
        paymentMethod: 'bank_transfer',
        reference: 'TXN-2024-001',
        notes: 'Payment received in full'
      }
    ];

    return { clients: sampleClients, invoices: sampleInvoices, payments: samplePayments };
  }

  // AI Functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPromptText(`Extract invoice data from this document. Return the data in JSON format with the following structure: {
        "invoiceNumber": "string",
        "clientName": "string",
        "clientEmail": "string",
        "clientAddress": "string",
        "issueDate": "YYYY-MM-DD",
        "dueDate": "YYYY-MM-DD",
        "items": [
          {
            "description": "string",
            "quantity": number,
            "rate": number,
            "amount": number
          }
        ],
        "subtotal": number,
        "taxRate": number,
        "taxAmount": number,
        "total": number,
        "notes": "string",
        "paymentTerms": "string"
      }`);
      setShowAiExtraction(true);
    }
  };

  const handleAiExtraction = () => {
    if (!promptText.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file.");
      return;
    }
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };

  const processAiResult = (result: string) => {
    try {
      const extractedData = JSON.parse(result);
      
      // Create or find client
      let clientId = '';
      if (extractedData.clientName) {
        const existingClient = clients.find(c => 
          c.name.toLowerCase() === extractedData.clientName.toLowerCase()
        );
        
        if (existingClient) {
          clientId = existingClient.id;
        } else {
          const newClient: Client = {
            id: Date.now().toString(),
            name: extractedData.clientName || '',
            email: extractedData.clientEmail || '',
            phone: '',
            address: extractedData.clientAddress || ''
          };
          setClients(prev => [...prev, newClient]);
          clientId = newClient.id;
        }
      }

      // Create invoice from extracted data
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: extractedData.invoiceNumber || generateInvoiceNumber(),
        clientId: clientId,
        clientName: extractedData.clientName || '',
        issueDate: extractedData.issueDate || new Date().toISOString().split('T')[0],
        dueDate: extractedData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        items: extractedData.items?.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          description: item.description || '',
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          amount: item.amount || (item.quantity * item.rate) || 0
        })) || [],
        subtotal: extractedData.subtotal || 0,
        taxRate: extractedData.taxRate || 0,
        taxAmount: extractedData.taxAmount || 0,
        total: extractedData.total || 0,
        notes: extractedData.notes || '',
        paymentTerms: extractedData.paymentTerms || 'Net 30'
      };

      setInvoiceForm(newInvoice);
      setModalMode('create');
      setShowInvoiceModal(true);
      setShowAiExtraction(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error processing AI result:', error);
      setAiError('Failed to process extracted data. Please check the format.');
    }
  };

  // Utility functions
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'badge-success';
      case 'sent': return 'badge-info';
      case 'overdue': return 'badge-error';
      case 'cancelled': return 'badge-error';
      default: return 'badge-warning';
    }
  };

  // Filter and search functions
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter === 'this_month') {
      const thisMonth = new Date().getMonth();
      const invoiceMonth = new Date(invoice.issueDate).getMonth();
      matchesDate = thisMonth === invoiceMonth;
    } else if (dateFilter === 'last_month') {
      const lastMonth = new Date().getMonth() - 1;
      const invoiceMonth = new Date(invoice.issueDate).getMonth();
      matchesDate = lastMonth === invoiceMonth;
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Dashboard calculations
  const totalRevenue = invoices.reduce((sum, inv) => 
    inv.status === 'paid' ? sum + inv.total : sum, 0
  );
  
  const pendingAmount = invoices.reduce((sum, inv) => 
    inv.status === 'sent' || inv.status === 'overdue' ? sum + inv.total : sum, 0
  );
  
  const overdueAmount = invoices.reduce((sum, inv) => 
    inv.status === 'overdue' ? sum + inv.total : sum, 0
  );

  // Chart data
  const monthlyData = [
    { month: 'Jan', revenue: 15000, pending: 5000 },
    { month: 'Feb', revenue: 18000, pending: 7000 },
    { month: 'Mar', revenue: 22000, pending: 4000 },
    { month: 'Apr', revenue: 19000, pending: 8000 },
    { month: 'May', revenue: 25000, pending: 6000 },
    { month: 'Jun', revenue: 28000, pending: 9000 }
  ];

  const statusData = [
    { name: 'Paid', value: invoices.filter(i => i.status === 'paid').length, color: '#10B981' },
    { name: 'Sent', value: invoices.filter(i => i.status === 'sent').length, color: '#3B82F6' },
    { name: 'Overdue', value: invoices.filter(i => i.status === 'overdue').length, color: '#EF4444' },
    { name: 'Draft', value: invoices.filter(i => i.status === 'draft').length, color: '#F59E0B' }
  ];

  // Modal handlers
  const openInvoiceModal = (mode: InvoiceModalMode, invoice?: Invoice) => {
    setModalMode(mode);
    if (invoice) {
      setSelectedInvoice(invoice);
      setInvoiceForm(invoice);
    } else {
      setSelectedInvoice(null);
      setInvoiceForm({
        invoiceNumber: generateInvoiceNumber(),
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
        subtotal: 0,
        taxRate: 10,
        taxAmount: 0,
        total: 0,
        paymentTerms: 'Net 30'
      });
    }
    setShowInvoiceModal(true);
  };

  const openClientModal = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setClientForm(client);
    } else {
      setSelectedClient(null);
      setClientForm({});
    }
    setShowClientModal(true);
  };

  const openPaymentModal = (payment?: Payment) => {
    if (payment) {
      setSelectedPayment(payment);
      setPaymentForm(payment);
    } else {
      setSelectedPayment(null);
      setPaymentForm({
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer'
      });
    }
    setShowPaymentModal(true);
  };

  // CRUD operations
  const saveInvoice = () => {
    if (!invoiceForm.clientId || !invoiceForm.items?.length) {
      alert('Please fill in all required fields');
      return;
    }

    const invoice: Invoice = {
      id: selectedInvoice?.id || Date.now().toString(),
      invoiceNumber: invoiceForm.invoiceNumber || generateInvoiceNumber(),
      clientId: invoiceForm.clientId || '',
      clientName: clients.find(c => c.id === invoiceForm.clientId)?.name || '',
      issueDate: invoiceForm.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate || new Date().toISOString().split('T')[0],
      status: invoiceForm.status || 'draft',
      items: invoiceForm.items || [],
      subtotal: invoiceForm.subtotal || 0,
      taxRate: invoiceForm.taxRate || 0,
      taxAmount: invoiceForm.taxAmount || 0,
      total: invoiceForm.total || 0,
      notes: invoiceForm.notes || '',
      paymentTerms: invoiceForm.paymentTerms || 'Net 30'
    };

    if (selectedInvoice) {
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv));
    } else {
      setInvoices(prev => [...prev, invoice]);
    }

    setShowInvoiceModal(false);
    setInvoiceForm({});
  };

  const deleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const saveClient = () => {
    if (!clientForm.name || !clientForm.email) {
      alert('Please fill in all required fields');
      return;
    }

    const client: Client = {
      id: selectedClient?.id || Date.now().toString(),
      name: clientForm.name || '',
      email: clientForm.email || '',
      phone: clientForm.phone || '',
      address: clientForm.address || '',
      taxId: clientForm.taxId
    };

    if (selectedClient) {
      setClients(prev => prev.map(c => c.id === client.id ? client : c));
    } else {
      setClients(prev => [...prev, client]);
    }

    setShowClientModal(false);
    setClientForm({});
  };

  const deleteClient = (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(prev => prev.filter(c => c.id !== id));
    }
  };

  const savePayment = () => {
    if (!paymentForm.invoiceId || !paymentForm.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const payment: Payment = {
      id: selectedPayment?.id || Date.now().toString(),
      invoiceId: paymentForm.invoiceId || '',
      amount: paymentForm.amount || 0,
      paymentDate: paymentForm.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentForm.paymentMethod || 'bank_transfer',
      reference: paymentForm.reference,
      notes: paymentForm.notes
    };

    if (selectedPayment) {
      setPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
    } else {
      setPayments(prev => [...prev, payment]);
    }

    // Update invoice status to paid if full payment
    const invoice = invoices.find(inv => inv.id === payment.invoiceId);
    if (invoice && payment.amount >= invoice.total) {
      setInvoices(prev => prev.map(inv => 
        inv.id === payment.invoiceId ? { ...inv, status: 'paid' } : inv
      ));
    }

    setShowPaymentModal(false);
    setPaymentForm({});
  };

  // Calculate invoice totals
  const calculateInvoiceTotals = () => {
    const subtotal = invoiceForm.items?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;
    const taxAmount = subtotal * ((invoiceForm.taxRate || 0) / 100);
    const total = subtotal + taxAmount;

    setInvoiceForm(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }));
  };

  useEffect(() => {
    calculateInvoiceTotals();
  }, [invoiceForm.items, invoiceForm.taxRate]);

  // Add/remove invoice items
  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setInvoiceForm(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  const removeInvoiceItem = (itemId: string) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items?.filter(item => item.id !== itemId) || []
    }));
  };

  const updateInvoiceItem = (itemId: string, field: string, value: any) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items?.map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          return updatedItem;
        }
        return item;
      }) || []
    }));
  };

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowInvoiceModal(false);
        setShowClientModal(false);
        setShowPaymentModal(false);
        setShowAiExtraction(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Modal effect for body scroll
  useEffect(() => {
    if (showInvoiceModal || showClientModal || showPaymentModal || showAiExtraction) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [showInvoiceModal, showClientModal, showPaymentModal, showAiExtraction]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          processAiResult(result);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <Receipt className="h-8 w-8 text-primary-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">InvoiceFlow</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-slate-300" />
                )}
              </button>
              
              {/* Upload Invoice */}
              <label className="btn btn-secondary cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                AI Extract
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'clients', label: 'Clients', icon: Building },
              { id: 'payments', label: 'Payments', icon: CreditCard }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as ViewMode)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm theme-transition ${
                  currentView === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-wide py-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value">{formatCurrency(totalRevenue)}</div>
                    <div className="stat-desc">+12% from last month</div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Pending Payments</div>
                    <div className="stat-value">{formatCurrency(pendingAmount)}</div>
                    <div className="stat-desc">{invoices.filter(i => i.status === 'sent').length} invoices</div>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Overdue Amount</div>
                    <div className="stat-value">{formatCurrency(overdueAmount)}</div>
                    <div className="stat-desc">{invoices.filter(i => i.status === 'overdue').length} invoices</div>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Clients</div>
                    <div className="stat-value">{clients.length}</div>
                    <div className="stat-desc">Active clients</div>
                  </div>
                  <User className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                    <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Invoice Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
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
                      <th className="table-header">Invoice #</th>
                      <th className="table-header">Client</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {invoices.slice(0, 5).map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">{invoice.clientName}</td>
                        <td className="table-cell">{formatCurrency(invoice.total)}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</td>
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
            {/* Header */}
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h2>
              <button
                onClick={() => openInvoiceModal('create')}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Invoice
              </button>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="form-label">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input"
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
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="input"
                  >
                    <option value="all">All Time</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Export</label>
                  <button
                    onClick={() => exportToCSV(filteredInvoices, 'invoices')}
                    className="btn bg-green-600 text-white hover:bg-green-700 w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    CSV
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
                        <td className="table-cell">{new Date(invoice.issueDate).toLocaleDateString()}</td>
                        <td className="table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                        <td className="table-cell">{formatCurrency(invoice.total)}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openInvoiceModal('view', invoice)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label="View invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openInvoiceModal('edit', invoice)}
                              className="text-green-600 hover:text-green-800"
                              aria-label="Edit invoice"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
                              className="text-red-600 hover:text-red-800"
                              aria-label="Delete invoice"
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
            </div>
          </div>
        )}

        {currentView === 'clients' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h2>
              <button
                onClick={() => openClientModal()}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Client
              </button>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client) => (
                <div key={client.id} className="card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openClientModal(client)}
                        className="text-green-600 hover:text-green-800"
                        aria-label="Edit client"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {client.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                        <Phone className="h-4 w-4" />
                        {client.phone}
                      </div>
                    )}
                    {client.address && (
                      <p className="text-sm text-gray-600 dark:text-slate-400">{client.address}</p>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-slate-400">Total Invoices</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {invoices.filter(inv => inv.clientId === client.id).length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-1">
                      <span className="text-gray-500 dark:text-slate-400">Total Amount</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(
                          invoices
                            .filter(inv => inv.clientId === client.id)
                            .reduce((sum, inv) => sum + inv.total, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentView === 'payments' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payments</h2>
              <button
                onClick={() => openPaymentModal()}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </button>
            </div>

            {/* Payments Table */}
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Payment Date</th>
                      <th className="table-header">Invoice #</th>
                      <th className="table-header">Client</th>
                      <th className="table-header">Amount</th>
                      <th className="table-header">Method</th>
                      <th className="table-header">Reference</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {payments.map((payment) => {
                      const invoice = invoices.find(inv => inv.id === payment.invoiceId);
                      return (
                        <tr key={payment.id}>
                          <td className="table-cell">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                          <td className="table-cell font-medium">{invoice?.invoiceNumber || 'N/A'}</td>
                          <td className="table-cell">{invoice?.clientName || 'N/A'}</td>
                          <td className="table-cell">{formatCurrency(payment.amount)}</td>
                          <td className="table-cell">
                            <span className="capitalize">
                              {payment.paymentMethod.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="table-cell">{payment.reference || 'N/A'}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openPaymentModal(payment)}
                                className="text-green-600 hover:text-green-800"
                                aria-label="Edit payment"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-backdrop" onClick={() => setShowInvoiceModal(false)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {modalMode === 'create' ? 'Create Invoice' : modalMode === 'edit' ? 'Edit Invoice' : 'View Invoice'}
              </h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Invoice Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceForm.invoiceNumber || ''}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={invoiceForm.status || 'draft'}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, status: e.target.value as Invoice['status'] }))}
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
                
                <div>
                  <label className="form-label">Client</label>
                  <select
                    value={invoiceForm.clientId || ''}
                    onChange={(e) => {
                      const clientId = e.target.value;
                      const client = clients.find(c => c.id === clientId);
                      setInvoiceForm(prev => ({ 
                        ...prev, 
                        clientId,
                        clientName: client?.name || '' 
                      }));
                    }}
                    className="input"
                    disabled={modalMode === 'view'}
                  >
                    <option value="">Select a client</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Payment Terms</label>
                  <input
                    type="text"
                    value={invoiceForm.paymentTerms || ''}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="input"
                    placeholder="Net 30"
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div>
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    value={invoiceForm.issueDate || ''}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, issueDate: e.target.value }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  />
                </div>
                
                <div>
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate || ''}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input"
                    disabled={modalMode === 'view'}
                  />
                </div>
              </div>

              {/* Invoice Items */}
              <div>
                <div className="flex-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Items</h4>
                  {modalMode !== 'view' && (
                    <button
                      onClick={addInvoiceItem}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  {invoiceForm.items?.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <label className="form-label">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                          className="input"
                          disabled={modalMode === 'view'}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="form-label">Qty</label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateInvoiceItem(item.id, 'quantity', Number(e.target.value))}
                          className="input"
                          disabled={modalMode === 'view'}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="form-label">Rate</label>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => updateInvoiceItem(item.id, 'rate', Number(e.target.value))}
                          className="input"
                          disabled={modalMode === 'view'}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="form-label">Amount</label>
                        <input
                          type="text"
                          value={formatCurrency(item.amount)}
                          className="input bg-gray-50 dark:bg-slate-700"
                          disabled
                        />
                      </div>
                      
                      {modalMode !== 'view' && (
                        <div className="col-span-1">
                          <button
                            onClick={() => removeInvoiceItem(item.id)}
                            className="btn btn-sm text-red-600 hover:text-red-800 p-2"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(invoiceForm.subtotal || 0)}</span>
                  </div>
                  
                  <div>
                    <label className="form-label">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={invoiceForm.taxRate || 0}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                      className="input"
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">Tax:</span>
                    <span className="font-medium">{formatCurrency(invoiceForm.taxAmount || 0)}</span>
                  </div>
                  
                  <div></div>
                  
                  <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-slate-700 pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(invoiceForm.total || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={invoiceForm.notes || ''}
                  onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input"
                  rows={3}
                  disabled={modalMode === 'view'}
                />
              </div>
            </div>
            
            {modalMode !== 'view' && (
              <div className="modal-footer">
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={saveInvoice}
                  className="btn btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Client Modal */}
      {showClientModal && (
        <div className="modal-backdrop" onClick={() => setShowClientModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedClient ? 'Edit Client' : 'New Client'}
              </h3>
              <button
                onClick={() => setShowClientModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  value={clientForm.name || ''}
                  onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  value={clientForm.email || ''}
                  onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={clientForm.phone || ''}
                  onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="input"
                />
              </div>
              
              <div>
                <label className="form-label">Address</label>
                <textarea
                  value={clientForm.address || ''}
                  onChange={(e) => setClientForm(prev => ({ ...prev, address: e.target.value }))}
                  className="input"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="form-label">Tax ID</label>
                <input
                  type="text"
                  value={clientForm.taxId || ''}
                  onChange={(e) => setClientForm(prev => ({ ...prev, taxId: e.target.value }))}
                  className="input"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowClientModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={saveClient}
                className="btn btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-backdrop" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedPayment ? 'Edit Payment' : 'Record Payment'}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Invoice *</label>
                <select
                  value={paymentForm.invoiceId || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, invoiceId: e.target.value }))}
                  className="input"
                  required
                >
                  <option value="">Select an invoice</option>
                  {invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').map(invoice => (
                    <option key={invoice.id} value={invoice.id}>
                      {invoice.invoiceNumber} - {invoice.clientName} - {formatCurrency(invoice.total)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Amount *</label>
                <input
                  type="number"
                  value={paymentForm.amount || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Payment Date *</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod || 'bank_transfer'}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentMethod: e.target.value as Payment['paymentMethod'] }))}
                  className="input"
                >
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Reference</label>
                <input
                  type="text"
                  value={paymentForm.reference || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, reference: e.target.value }))}
                  className="input"
                  placeholder="Transaction ID, Check #, etc."
                />
              </div>
              
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={paymentForm.notes || ''}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={savePayment}
                className="btn btn-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Extraction Modal */}
      {showAiExtraction && (
        <div className="modal-backdrop" onClick={() => setShowAiExtraction(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                AI Invoice Extraction
              </h3>
              <button
                onClick={() => setShowAiExtraction(false)}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedFile && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-300">{selectedFile.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="h-5 w-5" />
                  <p>Error: {aiError}</p>
                </div>
              )}
              
              {isAiLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-slate-400">Extracting invoice data...</span>
                </div>
              )}
              
              {aiResult && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-300">Extraction Successful!</span>
                  </div>
                  <p className="text-sm text-green-800 dark:text-green-400">
                    Invoice data has been extracted and will be used to create a new invoice.
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAiExtraction(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAiExtraction}
                disabled={isAiLoading || !selectedFile}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Package className="h-4 w-4 mr-2" />
                Extract Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 theme-transition">
        <div className="container-wide py-6">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;