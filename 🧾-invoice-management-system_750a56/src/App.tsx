import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  ChevronDown,
  Mail,
  Phone,
  Building,
  User,
  Save,
  ArrowLeft,
  Sun,
  Moon
} from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
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

type SortField = 'invoiceNumber' | 'clientName' | 'issueDate' | 'dueDate' | 'total' | 'status';
type SortOrder = 'asc' | 'desc';

const INVOICE_STORAGE_KEY = 'invoice_management_data';
const THEME_STORAGE_KEY = 'invoice_management_theme';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('issueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'form' | 'detail'>('list');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
    taxRate: 10,
    notes: ''
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem(INVOICE_STORAGE_KEY);
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (savedInvoices) {
      try {
        const parsedInvoices = JSON.parse(savedInvoices);
        setInvoices(parsedInvoices);
        setFilteredInvoices(parsedInvoices);
      } catch (error) {
        console.error('Error parsing saved invoices:', error);
        // Initialize with sample data if parsing fails
        initializeSampleData();
      }
    } else {
      initializeSampleData();
    }

    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Initialize with sample data
  const initializeSampleData = () => {
    const sampleInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2025-001',
        clientName: 'Acme Corporation',
        clientEmail: 'billing@acme.com',
        clientPhone: '+1-555-0123',
        clientAddress: '123 Business Ave, Suite 100\nNew York, NY 10001',
        issueDate: '2025-01-01',
        dueDate: '2025-01-31',
        status: 'sent',
        items: [
          { id: '1', description: 'Web Development Services', quantity: 40, rate: 150, amount: 6000 },
          { id: '2', description: 'UI/UX Design', quantity: 20, rate: 100, amount: 2000 }
        ],
        subtotal: 8000,
        taxRate: 10,
        taxAmount: 800,
        total: 8800,
        notes: 'Payment terms: Net 30 days',
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z'
      },
      {
        id: '2',
        invoiceNumber: 'INV-2025-002',
        clientName: 'Tech Solutions Inc',
        clientEmail: 'accounts@techsolutions.com',
        clientPhone: '+1-555-0456',
        clientAddress: '456 Innovation Drive\nSan Francisco, CA 94105',
        issueDate: '2025-01-05',
        dueDate: '2025-02-04',
        status: 'paid',
        items: [
          { id: '1', description: 'Mobile App Development', quantity: 60, rate: 120, amount: 7200 }
        ],
        subtotal: 7200,
        taxRate: 8.5,
        taxAmount: 612,
        total: 7812,
        notes: 'Thank you for your business!',
        createdAt: '2025-01-05T14:30:00Z',
        updatedAt: '2025-01-10T09:15:00Z'
      },
      {
        id: '3',
        invoiceNumber: 'INV-2025-003',
        clientName: 'Global Enterprises',
        clientEmail: 'finance@global.com',
        clientPhone: '+1-555-0789',
        clientAddress: '789 Corporate Blvd\nChicago, IL 60601',
        issueDate: '2024-12-15',
        dueDate: '2025-01-14',
        status: 'overdue',
        items: [
          { id: '1', description: 'Consulting Services', quantity: 25, rate: 200, amount: 5000 },
          { id: '2', description: 'Project Management', quantity: 15, rate: 180, amount: 2700 }
        ],
        subtotal: 7700,
        taxRate: 10,
        taxAmount: 770,
        total: 8470,
        notes: 'Overdue payment - please remit immediately',
        createdAt: '2024-12-15T11:20:00Z',
        updatedAt: '2025-01-15T16:45:00Z'
      }
    ];
    setInvoices(sampleInvoices);
    setFilteredInvoices(sampleInvoices);
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(sampleInvoices));
  };

  // Save to localStorage whenever invoices change
  useEffect(() => {
    if (invoices.length > 0) {
      localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
    }
  }, [invoices]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'total') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === 'issueDate' || sortField === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter, sortField, sortOrder]);

  // Theme toggle
  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_STORAGE_KEY, 'light');
    }
  };

  // Calculate totals for form
  const calculateTotals = (items: InvoiceItem[], taxRate: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.invoiceNumber || !formData.clientName || !formData.issueDate || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    const items = (formData.items || []).filter(item => item.description.trim() !== '');
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const { subtotal, taxAmount, total } = calculateTotals(items, formData.taxRate || 0);
    
    const invoiceData: Invoice = {
      id: editingInvoice?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber!,
      clientName: formData.clientName!,
      clientEmail: formData.clientEmail || '',
      clientPhone: formData.clientPhone || '',
      clientAddress: formData.clientAddress || '',
      issueDate: formData.issueDate!,
      dueDate: formData.dueDate!,
      status: formData.status as Invoice['status'] || 'draft',
      items,
      subtotal,
      taxRate: formData.taxRate || 0,
      taxAmount,
      total,
      notes: formData.notes || '',
      createdAt: editingInvoice?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingInvoice) {
      setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? invoiceData : inv));
    } else {
      setInvoices(prev => [...prev, invoiceData]);
    }

    resetForm();
    setCurrentView('list');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      clientAddress: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'draft',
      items: [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }],
      taxRate: 10,
      notes: ''
    });
    setEditingInvoice(null);
    setShowModal(false);
  };

  // Handle edit
  const handleEdit = (invoice: Invoice) => {
    setFormData(invoice);
    setEditingInvoice(invoice);
    setCurrentView('form');
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  // Handle item changes
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = [...(formData.items || [])];
    const item = { ...updatedItems[index] };
    
    if (field === 'quantity' || field === 'rate') {
      item[field] = Number(value) || 0;
      item.amount = item.quantity * item.rate;
    } else {
      (item as any)[field] = value;
    }
    
    updatedItems[index] = item;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  // Add new item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));
  };

  // Remove item
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }));
  };

  // Handle CSV export
  const exportToCSV = () => {
    const headers = [
      'Invoice Number',
      'Client Name',
      'Client Email',
      'Issue Date',
      'Due Date',
      'Status',
      'Subtotal',
      'Tax Amount',
      'Total',
      'Notes'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(invoice => [
        `"${invoice.invoiceNumber}"`,
        `"${invoice.clientName}"`,
        `"${invoice.clientEmail}"`,
        `"${invoice.issueDate}"`,
        `"${invoice.dueDate}"`,
        `"${invoice.status}"`,
        invoice.subtotal.toFixed(2),
        invoice.taxAmount.toFixed(2),
        invoice.total.toFixed(2),
        `"${invoice.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle status change
  const handleStatusChange = (invoiceId: string, newStatus: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId 
        ? { ...inv, status: newStatus, updatedAt: new Date().toISOString() }
        : inv
    ));
  };

  // Get status badge styling
  const getStatusBadge = (status: Invoice['status']) => {
    const baseClasses = 'badge text-xs font-medium px-2 py-1 rounded-full';
    switch (status) {
      case 'paid':
        return `${baseClasses} badge-success`;
      case 'overdue':
        return `${baseClasses} badge-error`;
      case 'sent':
        return `${baseClasses} badge-info`;
      case 'draft':
        return `${baseClasses} badge-warning`;
      case 'cancelled':
        return `${baseClasses} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  // Calculate dashboard stats
  const stats = {
    total: invoices.length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'sent').length,
    overdue: invoices.filter(inv => inv.status === 'overdue').length,
    totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0),
    pendingRevenue: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0)
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal || showDeleteModal) {
          setShowModal(false);
          setShowDeleteModal(false);
          setShowFilterDropdown(false);
        } else if (currentView !== 'list') {
          setCurrentView('list');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showModal, showDeleteModal, currentView]);

  // Invoice detail view
  const InvoiceDetailView = ({ invoice }: { invoice: Invoice }) => (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentView('list')}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(invoice)}
            className="btn btn-primary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => window.print()}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Print
          </button>
        </div>
      </div>

      <div className="card bg-white dark:bg-gray-800 print:shadow-none">
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">INVOICE</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">{invoice.invoiceNumber}</p>
            </div>
            <div className={getStatusBadge(invoice.status)}>
              {invoice.status.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Bill To:</h3>
            <div className="text-gray-900 dark:text-white">
              <p className="font-semibold text-lg">{invoice.clientName}</p>
              {invoice.clientEmail && <p className="text-gray-600 dark:text-gray-300">{invoice.clientEmail}</p>}
              {invoice.clientPhone && <p className="text-gray-600 dark:text-gray-300">{invoice.clientPhone}</p>}
              {invoice.clientAddress && (
                <div className="text-gray-600 dark:text-gray-300 mt-2">
                  {invoice.clientAddress.split('\n').map((line, index) => (
                    <p key={index}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Invoice Details:</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Issue Date:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Due Date:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header text-left">Description</th>
                  <th className="table-header text-right">Qty</th>
                  <th className="table-header text-right">Rate</th>
                  <th className="table-header text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="table-cell">{item.description}</td>
                    <td className="table-cell text-right">{item.quantity}</td>
                    <td className="table-cell text-right">${item.rate.toFixed(2)}</td>
                    <td className="table-cell text-right font-medium">${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Tax ({invoice.taxRate}%):</span>
              <span>${invoice.taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                <span>Total:</span>
                <span>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Notes:</h3>
            <p className="text-gray-700 dark:text-gray-300">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  // Invoice form view
  const InvoiceFormView = () => {
    const { subtotal, taxAmount, total } = calculateTotals(formData.items || [], formData.taxRate || 0);

    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
          <button
            onClick={() => setCurrentView('list')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Invoice Number *</label>
              <input
                type="text"
                className="input"
                value={formData.invoiceNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="input"
                value={formData.status || 'draft'}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Invoice['status'] }))}
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Client Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Client Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.clientName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.clientEmail || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={formData.clientPhone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  className="input"
                  value={formData.taxRate || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                className="input"
                rows={3}
                value={formData.clientAddress || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                placeholder="Street Address\nCity, State ZIP"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label">Issue Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.issueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="btn btn-primary btn-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            </div>
            <div className="space-y-4">
              {(formData.items || []).map((item, index) => (
                <div key={item.id || index} className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-12 md:col-span-5">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="input"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="form-label">Qty</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="form-label">Rate</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', e.target.value)}
                    />
                  </div>
                  <div className="col-span-3 md:col-span-2">
                    <label className="form-label">Amount</label>
                    <div className="input bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      ${item.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {(formData.items || []).length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="btn bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 p-2"
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
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Tax ({formData.taxRate || 0}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes or payment terms"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setCurrentView('list')}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save className="w-4 h-4 mr-2" />
                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  };

  // Main list view
  const ListView = () => (
    <div>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoice Management</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your invoices and track payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 p-2"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {
              resetForm();
              setFormData(prev => ({
                ...prev,
                invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`
              }));
              setCurrentView('form');
            }}
            className="btn btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Invoices</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Paid Invoices</div>
              <div className="stat-value text-green-600">{stats.paid}</div>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Pending</div>
              <div className="stat-value text-yellow-600">{stats.pending}</div>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Overdue</div>
              <div className="stat-value text-red-600">{stats.overdue}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Revenue (Paid)</div>
              <div className="stat-value text-green-600">${stats.totalRevenue.toFixed(2)}</div>
              <div className="stat-desc flex items-center text-green-600">
                <TrendingUp className="w-4 h-4 mr-1" />
                From {stats.paid} paid invoices
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Pending Revenue</div>
              <div className="stat-value text-yellow-600">${stats.pendingRevenue.toFixed(2)}</div>
              <div className="stat-desc flex items-center text-yellow-600">
                <Clock className="w-4 h-4 mr-1" />
                From {stats.pending} pending invoices
              </div>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-2">
                    <select
                      className="w-full input"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setShowFilterDropdown(false);
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft</option>
                      <option value="sent">Sent</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={exportToCSV}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
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
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (sortField === 'invoiceNumber') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('invoiceNumber');
                      setSortOrder('asc');
                    }
                  }}
                >
                  Invoice # {sortField === 'invoiceNumber' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (sortField === 'clientName') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('clientName');
                      setSortOrder('asc');
                    }
                  }}
                >
                  Client {sortField === 'clientName' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (sortField === 'issueDate') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('issueDate');
                      setSortOrder('desc');
                    }
                  }}
                >
                  Issue Date {sortField === 'issueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="table-header cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (sortField === 'dueDate') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('dueDate');
                      setSortOrder('asc');
                    }
                  }}
                >
                  Due Date {sortField === 'dueDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header">Status</th>
                <th 
                  className="table-header text-right cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    if (sortField === 'total') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortField('total');
                      setSortOrder('desc');
                    }
                  }}
                >
                  Total {sortField === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell font-medium">
                      <button
                        onClick={() => {
                          setViewingInvoice(invoice);
                          setCurrentView('detail');
                        }}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {invoice.invoiceNumber}
                      </button>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{invoice.clientName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.clientEmail}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      {format(new Date(invoice.issueDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="table-cell">
                      <div className={`${
                        new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' 
                          ? 'text-red-600 dark:text-red-400 font-medium' 
                          : ''
                      }`}>
                        {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="table-cell">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value as Invoice['status'])}
                        className={`${getStatusBadge(invoice.status)} border-none bg-transparent cursor-pointer`}
                      >
                        <option value="draft">Draft</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="table-cell text-right font-medium">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setViewingInvoice(invoice);
                            setCurrentView('detail');
                          }}
                          className="btn bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 p-1"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="btn bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 p-1"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setInvoiceToDelete(invoice.id);
                            setShowDeleteModal(true);
                          }}
                          className="btn bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 p-1"
                          title="Delete"
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
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="container-fluid py-8">
        {currentView === 'list' && <ListView />}
        {currentView === 'form' && <InvoiceFormView />}
        {currentView === 'detail' && viewingInvoice && <InvoiceDetailView invoice={viewingInvoice} />}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Delete</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this invoice? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => invoiceToDelete && handleDelete(invoiceToDelete)}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;