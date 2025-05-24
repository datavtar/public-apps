import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns';
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
  Clock,
  AlertCircle,
  FileText,
  Building,
  Calendar,
  User,
  Settings,
  Upload,
  X,
  Check,
  Send,
  ChevronDown,
  ChevronRight,
  BarChart3,
  PieChart,
  Users,
  Receipt
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax: number;
  total: number;
  lineItems: LineItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId?: string;
  paymentTerms: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

type TabType = 'dashboard' | 'invoices' | 'vendors' | 'settings';
type InvoiceStatus = 'all' | 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

function App() {
  // AI Layer setup
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  // App state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedVendorFilter, setSelectedVendorFilter] = useState('');
  const [showAiUpload, setShowAiUpload] = useState(false);
  
  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    vendorId: '',
    vendorName: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    status: 'draft',
    subtotal: 0,
    tax: 0,
    total: 0,
    lineItems: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: ''
  });
  
  // Vendor form state
  const [vendorForm, setVendorForm] = useState<Partial<Vendor>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    paymentTerms: 30,
    status: 'active'
  });

  // Sample data initialization
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedVendors = localStorage.getItem('vendors');
    
    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices));
    } else {
      // Initialize with sample data
      const sampleInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2024-001',
          vendorId: '1',
          vendorName: 'TechSupplies Inc.',
          issueDate: '2024-01-15',
          dueDate: '2024-02-14',
          status: 'paid',
          subtotal: 1200.00,
          tax: 120.00,
          total: 1320.00,
          lineItems: [
            { id: '1', description: 'Office Software License', quantity: 1, rate: 1200.00, amount: 1200.00 }
          ],
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          invoiceNumber: 'INV-2024-002',
          vendorId: '2',
          vendorName: 'Office Essentials',
          issueDate: '2024-01-20',
          dueDate: '2024-02-19',
          status: 'sent',
          subtotal: 450.00,
          tax: 45.00,
          total: 495.00,
          lineItems: [
            { id: '1', description: 'Printer Paper (5 reams)', quantity: 5, rate: 50.00, amount: 250.00 },
            { id: '2', description: 'Ink Cartridges', quantity: 4, rate: 50.00, amount: 200.00 }
          ],
          createdAt: '2024-01-20T14:30:00Z',
          updatedAt: '2024-01-20T14:30:00Z'
        },
        {
          id: '3',
          invoiceNumber: 'INV-2024-003',
          vendorId: '3',
          vendorName: 'Cloud Services Pro',
          issueDate: '2024-01-25',
          dueDate: '2024-01-31',
          status: 'overdue',
          subtotal: 800.00,
          tax: 80.00,
          total: 880.00,
          lineItems: [
            { id: '1', description: 'Monthly Cloud Storage', quantity: 1, rate: 800.00, amount: 800.00 }
          ],
          createdAt: '2024-01-25T09:15:00Z',
          updatedAt: '2024-01-25T09:15:00Z'
        }
      ];
      setInvoices(sampleInvoices);
      localStorage.setItem('invoices', JSON.stringify(sampleInvoices));
    }
    
    if (savedVendors) {
      setVendors(JSON.parse(savedVendors));
    } else {
      // Initialize with sample vendors
      const sampleVendors: Vendor[] = [
        {
          id: '1',
          name: 'TechSupplies Inc.',
          email: 'billing@techsupplies.com',
          phone: '+1-555-0123',
          address: '123 Tech Street, Silicon Valley, CA 94000',
          taxId: '12-3456789',
          paymentTerms: 30,
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          name: 'Office Essentials',
          email: 'orders@officeessentials.com',
          phone: '+1-555-0456',
          address: '456 Business Ave, Corporate City, NY 10001',
          taxId: '98-7654321',
          paymentTerms: 15,
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: '3',
          name: 'Cloud Services Pro',
          email: 'support@cloudservicespro.com',
          phone: '+1-555-0789',
          address: '789 Digital Drive, Tech Town, WA 98001',
          taxId: '45-6789012',
          paymentTerms: 7,
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ];
      setVendors(sampleVendors);
      localStorage.setItem('vendors', JSON.stringify(sampleVendors));
    }
  }, []);

  // AI Processing function
  const handleAiExtraction = () => {
    if (!selectedFile) {
      setAiError('Please select a file to process.');
      return;
    }
    
    setPromptText(`Extract invoice data from this document and return it in the following JSON format:
    {
      "invoiceNumber": "string",
      "vendorName": "string",
      "issueDate": "YYYY-MM-DD",
      "dueDate": "YYYY-MM-DD",
      "subtotal": number,
      "tax": number,
      "total": number,
      "lineItems": [
        {
          "description": "string",
          "quantity": number,
          "rate": number,
          "amount": number
        }
      ],
      "notes": "string"
    }
    
    Please ensure all numbers are properly formatted and dates are in YYYY-MM-DD format.`);
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };

  // Handle AI result
  useEffect(() => {
    if (aiResult) {
      try {
        const extractedData = JSON.parse(aiResult);
        
        // Find or create vendor
        let vendorId = '';
        const existingVendor = vendors.find(v => 
          v.name.toLowerCase() === extractedData.vendorName?.toLowerCase()
        );
        
        if (existingVendor) {
          vendorId = existingVendor.id;
        } else if (extractedData.vendorName) {
          const newVendorId = Date.now().toString();
          const newVendor: Vendor = {
            id: newVendorId,
            name: extractedData.vendorName,
            email: '',
            phone: '',
            address: '',
            paymentTerms: 30,
            status: 'active',
            createdAt: new Date().toISOString()
          };
          const updatedVendors = [...vendors, newVendor];
          setVendors(updatedVendors);
          localStorage.setItem('vendors', JSON.stringify(updatedVendors));
          vendorId = newVendorId;
        }
        
        // Create line items with IDs
        const lineItems: LineItem[] = extractedData.lineItems?.map((item: any, index: number) => ({
          id: (index + 1).toString(),
          description: item.description || '',
          quantity: item.quantity || 1,
          rate: item.rate || 0,
          amount: item.amount || (item.quantity * item.rate) || 0
        })) || [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }];
        
        // Update invoice form with extracted data
        setInvoiceForm({
          invoiceNumber: extractedData.invoiceNumber || '',
          vendorId,
          vendorName: extractedData.vendorName || '',
          issueDate: extractedData.issueDate || format(new Date(), 'yyyy-MM-dd'),
          dueDate: extractedData.dueDate || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          status: 'draft',
          subtotal: extractedData.subtotal || 0,
          tax: extractedData.tax || 0,
          total: extractedData.total || 0,
          lineItems,
          notes: extractedData.notes || ''
        });
        
        setShowAiUpload(false);
        setShowInvoiceModal(true);
        setSelectedFile(null);
        
      } catch (error) {
        setAiError('Failed to parse extracted data. Please try again or enter manually.');
      }
    }
  }, [aiResult, vendors]);

  // Save data to localStorage
  const saveInvoices = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
  };
  
  const saveVendors = (updatedVendors: Vendor[]) => {
    setVendors(updatedVendors);
    localStorage.setItem('vendors', JSON.stringify(updatedVendors));
  };

  // Invoice functions
  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const count = invoices.length + 1;
    return `INV-${year}-${count.toString().padStart(3, '0')}`;
  };
  
  const calculateLineItemAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };
  
  const calculateTotals = (lineItems: LineItem[], taxRate: number = 0.1) => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };
  
  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...(invoiceForm.lineItems || [])];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    
    if (field === 'quantity' || field === 'rate') {
      updatedItems[index].amount = calculateLineItemAmount(
        updatedItems[index].quantity,
        updatedItems[index].rate
      );
    }
    
    const { subtotal, tax, total } = calculateTotals(updatedItems);
    
    setInvoiceForm({
      ...invoiceForm,
      lineItems: updatedItems,
      subtotal,
      tax,
      total
    });
  };
  
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    
    setInvoiceForm({
      ...invoiceForm,
      lineItems: [...(invoiceForm.lineItems || []), newItem]
    });
  };
  
  const removeLineItem = (index: number) => {
    const updatedItems = (invoiceForm.lineItems || []).filter((_, i) => i !== index);
    const { subtotal, tax, total } = calculateTotals(updatedItems);
    
    setInvoiceForm({
      ...invoiceForm,
      lineItems: updatedItems,
      subtotal,
      tax,
      total
    });
  };
  
  const saveInvoice = () => {
    if (!invoiceForm.invoiceNumber || !invoiceForm.vendorName) {
      alert('Please fill in required fields');
      return;
    }
    
    const now = new Date().toISOString();
    
    if (editingInvoice) {
      const updatedInvoices = invoices.map(inv => 
        inv.id === editingInvoice.id 
          ? { ...invoiceForm, id: editingInvoice.id, updatedAt: now } as Invoice
          : inv
      );
      saveInvoices(updatedInvoices);
    } else {
      const newInvoice: Invoice = {
        ...invoiceForm,
        id: Date.now().toString(),
        createdAt: now,
        updatedAt: now
      } as Invoice;
      saveInvoices([...invoices, newInvoice]);
    }
    
    closeInvoiceModal();
  };
  
  const deleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const updatedInvoices = invoices.filter(inv => inv.id !== id);
      saveInvoices(updatedInvoices);
    }
  };
  
  const openInvoiceModal = (invoice?: Invoice) => {
    if (invoice) {
      setEditingInvoice(invoice);
      setInvoiceForm(invoice);
    } else {
      setEditingInvoice(null);
      setInvoiceForm({
        invoiceNumber: generateInvoiceNumber(),
        vendorId: '',
        vendorName: '',
        issueDate: format(new Date(), 'yyyy-MM-dd'),
        dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
        status: 'draft',
        subtotal: 0,
        tax: 0,
        total: 0,
        lineItems: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
        notes: ''
      });
    }
    setShowInvoiceModal(true);
  };
  
  const closeInvoiceModal = () => {
    setShowInvoiceModal(false);
    setEditingInvoice(null);
    setInvoiceForm({
      invoiceNumber: '',
      vendorId: '',
      vendorName: '',
      issueDate: format(new Date(), 'yyyy-MM-dd'),
      dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      status: 'draft',
      subtotal: 0,
      tax: 0,
      total: 0,
      lineItems: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
      notes: ''
    });
  };

  // Vendor functions
  const saveVendor = () => {
    if (!vendorForm.name || !vendorForm.email) {
      alert('Please fill in required fields');
      return;
    }
    
    const now = new Date().toISOString();
    
    if (editingVendor) {
      const updatedVendors = vendors.map(vendor => 
        vendor.id === editingVendor.id 
          ? { ...vendorForm, id: editingVendor.id } as Vendor
          : vendor
      );
      saveVendors(updatedVendors);
    } else {
      const newVendor: Vendor = {
        ...vendorForm,
        id: Date.now().toString(),
        createdAt: now
      } as Vendor;
      saveVendors([...vendors, newVendor]);
    }
    
    closeVendorModal();
  };
  
  const deleteVendor = (id: string) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      const updatedVendors = vendors.filter(vendor => vendor.id !== id);
      saveVendors(updatedVendors);
    }
  };
  
  const openVendorModal = (vendor?: Vendor) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorForm(vendor);
    } else {
      setEditingVendor(null);
      setVendorForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        paymentTerms: 30,
        status: 'active'
      });
    }
    setShowVendorModal(true);
  };
  
  const closeVendorModal = () => {
    setShowVendorModal(false);
    setEditingVendor(null);
    setVendorForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      paymentTerms: 30,
      status: 'active'
    });
  };

  // Filter and search functions
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesVendor = !selectedVendorFilter || invoice.vendorId === selectedVendorFilter;
    
    let matchesDate = true;
    if (dateRange.start) {
      matchesDate = matchesDate && new Date(invoice.issueDate) >= new Date(dateRange.start);
    }
    if (dateRange.end) {
      matchesDate = matchesDate && new Date(invoice.issueDate) <= new Date(dateRange.end);
    }
    
    return matchesSearch && matchesStatus && matchesVendor && matchesDate;
  });

  // Export function
  const exportToCSV = () => {
    const headers = ['Invoice Number', 'Vendor', 'Issue Date', 'Due Date', 'Status', 'Total'];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(invoice => [
        invoice.invoiceNumber,
        invoice.vendorName,
        invoice.issueDate,
        invoice.dueDate,
        invoice.status,
        invoice.total.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Dashboard calculations
  const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent');
  
  const paidRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0);

  // Chart data
  const statusData = [
    { name: 'Paid', value: paidInvoices.length, amount: paidRevenue, color: '#10b981' },
    { name: 'Pending', value: pendingInvoices.length, amount: pendingAmount, color: '#f59e0b' },
    { name: 'Overdue', value: overdueInvoices.length, amount: overdueAmount, color: '#ef4444' },
    { name: 'Draft', value: invoices.filter(inv => inv.status === 'draft').length, amount: invoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.total, 0), color: '#6b7280' }
  ];

  const monthlyData = (() => {
    const months = {};
    invoices.forEach(invoice => {
      const month = format(new Date(invoice.issueDate), 'MMM yyyy');
      if (!months[month]) {
        months[month] = { name: month, amount: 0, count: 0 };
      }
      months[month].amount += invoice.total;
      months[month].count += 1;
    });
    return Object.values(months).slice(-6);
  })();

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const statusColors = {
      paid: 'badge-success',
      sent: 'badge-info',
      overdue: 'badge-error',
      draft: 'badge-warning',
      cancelled: 'badge-error'
    };
    
    return (
      <span className={`badge ${statusColors[status as keyof typeof statusColors] || 'badge-info'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showInvoiceModal) closeInvoiceModal();
        if (showVendorModal) closeVendorModal();
        if (showAiUpload) setShowAiUpload(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showInvoiceModal, showVendorModal, showAiUpload]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer */}
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
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">InvoiceFlow</h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">Finance Management System</p>
              </div>
            </div>
            
            <nav className="flex items-center space-x-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'invoices', label: 'Invoices', icon: FileText },
                { id: 'vendors', label: 'Vendors', icon: Users },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value">${totalRevenue.toFixed(2)}</div>
                    <div className="stat-desc">{invoices.length} total invoices</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Paid Amount</div>
                    <div className="stat-value">${paidRevenue.toFixed(2)}</div>
                    <div className="stat-desc">{paidInvoices.length} paid invoices</div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Pending Amount</div>
                    <div className="stat-value">${pendingAmount.toFixed(2)}</div>
                    <div className="stat-desc">{pendingInvoices.length} pending</div>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Overdue Amount</div>
                    <div className="stat-value">${overdueAmount.toFixed(2)}</div>
                    <div className="stat-desc">{overdueInvoices.length} overdue</div>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    <Tooltip formatter={(value, name) => [`${value} invoices`, name]} />
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-4 mt-4">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600 dark:text-slate-300">
                        {item.name}: {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                    <Area type="monotone" dataKey="amount" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Invoices */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Invoice #</th>
                      <th className="table-header">Vendor</th>
                      <th className="table-header">Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {invoices.slice(0, 5).map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">{invoice.vendorName}</td>
                        <td className="table-cell">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</td>
                        <td className="table-cell">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="table-cell font-semibold">${invoice.total.toFixed(2)}</td>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowAiUpload(true)}
                  className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  AI Extract
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
            
            {/* Search and Filters */}
            <div className="card">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      className="input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus)}
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                  
                  <button
                    onClick={exportToCSV}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Start Date</label>
                    <input
                      type="date"
                      className="input"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">End Date</label>
                    <input
                      type="date"
                      className="input"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="form-label">Vendor</label>
                    <select
                      className="input"
                      value={selectedVendorFilter}
                      onChange={(e) => setSelectedVendorFilter(e.target.value)}
                    >
                      <option value="">All Vendors</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
                    </select>
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
                      <th className="table-header">Invoice #</th>
                      <th className="table-header">Vendor</th>
                      <th className="table-header">Issue Date</th>
                      <th className="table-header">Due Date</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Total</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">{invoice.vendorName}</td>
                        <td className="table-cell">{format(new Date(invoice.issueDate), 'MMM dd, yyyy')}</td>
                        <td className="table-cell">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</td>
                        <td className="table-cell">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="table-cell font-semibold">${invoice.total.toFixed(2)}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openInvoiceModal(invoice)}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteInvoice(invoice.id)}
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
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">No invoices found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendors</h2>
              <button
                onClick={() => openVendorModal()}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Vendor
              </button>
            </div>
            
            <div className="card">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Email</th>
                      <th className="table-header">Phone</th>
                      <th className="table-header">Payment Terms</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {vendors.map((vendor) => (
                      <tr key={vendor.id}>
                        <td className="table-cell font-medium">{vendor.name}</td>
                        <td className="table-cell">{vendor.email}</td>
                        <td className="table-cell">{vendor.phone}</td>
                        <td className="table-cell">{vendor.paymentTerms} days</td>
                        <td className="table-cell">
                          <StatusBadge status={vendor.status} />
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openVendorModal(vendor)}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteVendor(vendor.id)}
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
              
              {vendors.length === 0 && (
                <div className="text-center py-8">
                  <Building className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">No vendors found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Company Name</label>
                    <input type="text" className="input" defaultValue="Your Company Name" />
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <textarea className="input" rows={3} defaultValue="123 Business Street\nCity, State 12345" />
                  </div>
                  <div>
                    <label className="form-label">Tax ID</label>
                    <input type="text" className="input" defaultValue="12-3456789" />
                  </div>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Default Payment Terms (days)</label>
                    <input type="number" className="input" defaultValue={30} />
                  </div>
                  <div>
                    <label className="form-label">Default Tax Rate (%)</label>
                    <input type="number" className="input" defaultValue={10} step="0.1" />
                  </div>
                  <div>
                    <label className="form-label">Invoice Number Prefix</label>
                    <input type="text" className="input" defaultValue="INV-" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn bg-blue-600 text-white hover:bg-blue-700">
                  Export All Data
                </button>
                <button className="btn bg-red-600 text-white hover:bg-red-700">
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AI Upload Modal */}
      {showAiUpload && (
        <div className="modal-backdrop" onClick={() => setShowAiUpload(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Invoice Extraction</h3>
              <button
                onClick={() => setShowAiUpload(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-slate-300">
                Upload an invoice document (PDF, image) and our AI will extract the data automatically.
              </p>
              
              <div>
                <label className="form-label">Select File</label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="input"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                  <p className="text-sm text-gray-600 dark:text-slate-300">
                    Selected: {selectedFile.name}
                  </p>
                </div>
              )}
              
              {aiError && (
                <div className="alert alert-error">
                  <AlertCircle className="w-5 h-5" />
                  <p>{aiError}</p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAiUpload(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAiExtraction}
                disabled={!selectedFile || isAiLoading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? 'Processing...' : 'Extract Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-backdrop" onClick={closeInvoiceModal}>
          <div className={`${styles.modalLarge} bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] overflow-auto p-6 m-4`} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingInvoice ? 'Edit Invoice' : 'New Invoice'}
              </h3>
              <button
                onClick={closeInvoiceModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Invoice Number *</label>
                  <input
                    type="text"
                    className="input"
                    value={invoiceForm.invoiceNumber || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="input"
                    value={invoiceForm.status || 'draft'}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, status: e.target.value as Invoice['status'] })}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Vendor *</label>
                  <select
                    className="input"
                    value={invoiceForm.vendorId || ''}
                    onChange={(e) => {
                      const vendor = vendors.find(v => v.id === e.target.value);
                      setInvoiceForm({
                        ...invoiceForm,
                        vendorId: e.target.value,
                        vendorName: vendor?.name || ''
                      });
                    }}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Vendor Name (if not in list)</label>
                  <input
                    type="text"
                    className="input"
                    value={invoiceForm.vendorName || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, vendorName: e.target.value })}
                    placeholder="Enter vendor name manually"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Issue Date</label>
                  <input
                    type="date"
                    className="input"
                    value={invoiceForm.issueDate || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, issueDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    className="input"
                    value={invoiceForm.dueDate || ''}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  />
                </div>
              </div>
              
              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Line Items</h4>
                  <button
                    onClick={addLineItem}
                    className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Item
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(invoiceForm.lineItems || []).map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                      <div className="col-span-12 md:col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          className="input"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          className="input"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <input
                          type="number"
                          placeholder="Rate"
                          className="input"
                          value={item.rate}
                          onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="col-span-3 md:col-span-2">
                        <input
                          type="number"
                          className="input"
                          value={item.amount.toFixed(2)}
                          readOnly
                        />
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => removeLineItem(index)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          disabled={(invoiceForm.lineItems || []).length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Totals */}
              <div className="border-t border-gray-200 dark:border-slate-600 pt-4">
                <div className="flex justify-end">
                  <div className="w-full md:w-1/2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-300">Subtotal:</span>
                      <span className="font-medium">${(invoiceForm.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-slate-300">Tax:</span>
                      <span className="font-medium">${(invoiceForm.tax || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold border-t border-gray-200 dark:border-slate-600 pt-2">
                      <span>Total:</span>
                      <span>${(invoiceForm.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={invoiceForm.notes || ''}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                  placeholder="Additional notes or terms..."
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={closeInvoiceModal}
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

      {/* Vendor Modal */}
      {showVendorModal && (
        <div className="modal-backdrop" onClick={closeVendorModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingVendor ? 'Edit Vendor' : 'New Vendor'}
              </h3>
              <button
                onClick={closeVendorModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={vendorForm.name || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="input"
                  value={vendorForm.email || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                />
              </div>
              
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="text"
                  className="input"
                  value={vendorForm.phone || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                />
              </div>
              
              <div>
                <label className="form-label">Address</label>
                <textarea
                  className="input"
                  rows={3}
                  value={vendorForm.address || ''}
                  onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Tax ID</label>
                  <input
                    type="text"
                    className="input"
                    value={vendorForm.taxId || ''}
                    onChange={(e) => setVendorForm({ ...vendorForm, taxId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Payment Terms (days)</label>
                  <input
                    type="number"
                    className="input"
                    value={vendorForm.paymentTerms || 30}
                    onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: parseInt(e.target.value) || 30 })}
                  />
                </div>
              </div>
              
              <div>
                <label className="form-label">Status</label>
                <select
                  className="input"
                  value={vendorForm.status || 'active'}
                  onChange={(e) => setVendorForm({ ...vendorForm, status: e.target.value as Vendor['status'] })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={closeVendorModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={saveVendor}
                className="btn btn-primary"
              >
                {editingVendor ? 'Update' : 'Create'} Vendor
              </button>
            </div>
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

export default App;