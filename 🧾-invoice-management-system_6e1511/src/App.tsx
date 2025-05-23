import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Plus, Edit, Trash2, Eye, Search as SearchIconLucide, X, Moon, Sun,
  FileText, ChevronDown, ChevronUp, Printer, Send, AlertCircle,
  Brain, ArrowLeft, Save, BarChart3, Download, Palette, ChevronsUpDown, Info, Lightbulb
} from 'lucide-react';

// AILayer imports - assumed to exist
import AILayer from './components/AILayer'; // Assuming this path
import { AILayerHandle } from './components/AILayer.types'; // Assuming this path

// Styles module can be empty or have very specific styles
// import styles from './styles/styles.module.css';

// localStorage keys
const LOCAL_STORAGE_KEYS = {
  INVOICES: 'financeAppInvoices',
  DARK_MODE: 'financeAppDarkMode',
};

// Invoice Status Enum
enum InvoiceStatus {
  Draft = "Draft",
  Sent = "Sent",
  Paid = "Paid",
  Overdue = "Overdue",
  Cancelled = "Cancelled"
}

// Invoice Item Interface
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Invoice Interface
interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subTotal: number;
  taxRate: number; // e.g., 10 for 10%
  taxAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
}

// Sort Config
type SortKey = keyof Pick<Invoice, 'invoiceNumber' | 'clientName' | 'dueDate' | 'totalAmount' | 'status'>;
interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

// Views
type View = 'dashboard' | 'list' | 'add' | 'edit' | 'details';

// Default Invoice (for new or editing)
const getDefaultInvoice = (): Omit<Invoice, 'id' | 'subTotal' | 'taxAmount' | 'totalAmount'> => ({
  invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  items: [{ id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
  taxRate: 10, // Default 10% tax
  status: InvoiceStatus.Draft,
  notes: '',
});

// Sample Invoices if local storage is empty
const getSampleInvoices = (): Invoice[] => [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    clientName: 'Tech Solutions Inc.',
    clientEmail: 'billing@techsolutions.com',
    clientAddress: '123 Tech Park, Silicon Valley, CA 94000',
    issueDate: '2024-06-01',
    dueDate: '2024-07-01',
    items: [
      { id: 'item1', description: 'Web Development Services', quantity: 1, unitPrice: 2500, total: 2500 },
      { id: 'item2', description: 'Consulting Hours', quantity: 10, unitPrice: 150, total: 1500 },
    ],
    subTotal: 4000,
    taxRate: 10,
    taxAmount: 400,
    totalAmount: 4400,
    status: InvoiceStatus.Sent,
    notes: 'Payment due within 30 days.',
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    clientName: 'Creative Designs Co.',
    clientEmail: 'accounts@creativedesigns.co',
    clientAddress: '456 Art Lane, Design District, NY 10001',
    issueDate: '2024-07-15',
    dueDate: '2024-08-14',
    items: [
      { id: 'item3', description: 'Logo Design Package', quantity: 1, unitPrice: 1200, total: 1200 },
    ],
    subTotal: 1200,
    taxRate: 8,
    taxAmount: 96,
    totalAmount: 1296,
    status: InvoiceStatus.Paid,
    notes: 'Thank you for your business!',
  },
];

// Helper Functions
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

// Main App Component
const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceFormData, setInvoiceFormData] = useState<Omit<Invoice, 'id' | 'subTotal' | 'taxAmount' | 'totalAmount'>>(getDefaultInvoice());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'issueDate', direction: 'desc'});

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [isLoading, setIsLoading] = useState(true); 
  const [appError, setAppError] = useState<string | null>(null); 

  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedInvoices = localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES);
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      } else {
        setInvoices(getSampleInvoices());
      }
    } catch (error) {
      console.error("Failed to load invoices from local storage:", error);
      setAppError("Failed to load invoices. Data might be corrupted. Using sample data.");
      setInvoices(getSampleInvoices()); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) { 
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
      } catch (error) {
        console.error("Failed to save invoices to local storage:", error);
        setAppError("Failed to save invoices. Changes might not persist.");
      }
    }
  }, [invoices, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'false');
    }
  }, [isDarkMode]);

  const calculateTotals = useCallback((items: InvoiceItem[], taxRate: number): { subTotal: number; taxAmount: number; totalAmount: number } => {
    const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
    const taxAmount = subTotal * (taxRate / 100);
    const totalAmount = subTotal + taxAmount;
    return { subTotal, taxAmount, totalAmount };
  }, []);

  useEffect(() => {
    if (currentView === 'add' || currentView === 'edit') {
      const { subTotal, taxAmount, totalAmount } = calculateTotals(invoiceFormData.items, invoiceFormData.taxRate);
      setInvoiceFormData(prev => ({ ...prev, subTotal, taxAmount, totalAmount }));
    }
  }, [invoiceFormData.items, invoiceFormData.taxRate, currentView, calculateTotals]);

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoiceFormData(prev => ({
      ...prev,
      [name]: name === 'taxRate' || name === 'quantity' || name === 'unitPrice' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const updatedItems = invoiceFormData.items.map((item, i) => {
      if (i === index) {
        const newItem = { ...item, [field]: typeof item[field] === 'number' ? Number(value) || 0 : String(value) };
        if (field === 'quantity' || field === 'unitPrice') {
          newItem.total = (field === 'quantity' ? (Number(value) || 0) * newItem.unitPrice : newItem.quantity * (Number(value) || 0));
        }
        return newItem;
      }
      return item;
    });
    setInvoiceFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const addItem = () => {
    setInvoiceFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setInvoiceFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitInvoice = () => {
    const { subTotal, taxAmount, totalAmount } = calculateTotals(invoiceFormData.items, invoiceFormData.taxRate);
    const finalInvoiceData = { ...invoiceFormData, subTotal, taxAmount, totalAmount };

    if (currentView === 'add') {
      const newInvoice: Invoice = {
        ...finalInvoiceData,
        id: Date.now().toString(),
      };
      setInvoices(prev => [newInvoice, ...prev]);
    } else if (currentView === 'edit' && selectedInvoice) {
      const updatedInvoice: Invoice = {
        ...finalInvoiceData,
        id: selectedInvoice.id,
      };
      setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? updatedInvoice : inv));
    }
    setCurrentView('list');
    setSelectedInvoice(null);
    setInvoiceFormData(getDefaultInvoice());
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    const { id, ...formData } = invoice; 
    setInvoiceFormData(formData); 
    setCurrentView('edit');
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    openModal(
      'Confirm Deletion',
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Are you sure you want to delete this invoice? This action cannot be undone.
        </p>
        <div className="modal-footer">
          <button type="button" onClick={closeModal} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
          <button type="button" onClick={() => {
            setInvoices(prev => prev.filter(inv => inv.id !== invoiceId));
            closeModal();
          }} className="btn btn-primary bg-red-600 hover:bg-red-700">Delete</button>
        </div>
      </div>
    );
  };
  
  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setCurrentView('details');
  };

  const openModal = (title: string, content: React.ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalTitle('');
    document.body.classList.remove('modal-open');
  };

  const openAiModal = () => {
    setIsAiModalOpen(true);
    document.body.classList.add('modal-open');
  };
  const closeAiModal = () => {
    setIsAiModalOpen(false);
    setAiResult(null);
    setAiError(null);
    document.body.classList.remove('modal-open');
  }

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isAiModalOpen) closeAiModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, isAiModalOpen]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];
    const today = new Date().toISOString().split('T')[0];

    result = result.map(inv => {
        if (inv.status === InvoiceStatus.Sent && inv.dueDate < today) {
            return {...inv, status: InvoiceStatus.Overdue};
        }
        return inv;
    });
    
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(lowerSearchTerm) ||
        inv.clientName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(inv => inv.status === statusFilter);
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [invoices, searchTerm, statusFilter, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown size={16} className="ml-1 text-gray-400 dark:text-gray-500 opacity-50 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' ? <ChevronUp size={16} className="ml-1" /> : <ChevronDown size={16} className="ml-1" />;
  };

  const getStatusColor = (status: InvoiceStatus): string => {
    switch (status) {
      case InvoiceStatus.Paid: return 'badge-success';
      case InvoiceStatus.Sent: return 'badge-info';
      case InvoiceStatus.Draft: return 'badge-warning'; 
      case InvoiceStatus.Overdue: return 'badge-error';
      case InvoiceStatus.Cancelled: return 'bg-gray-400 text-gray-800 dark:bg-gray-600 dark:text-gray-200';
      default: return 'badge-info';
    }
  };

  const handleAiSummarizeInvoice = (invoice: Invoice | null) => {
    if (!invoice) return;
    const prompt = `
      Summarize the following invoice and extract key information.
      Respond in a structured JSON format with keys: "invoiceNumber", "clientName", "totalAmount", "dueDate", "status", and a "briefSummary" of items or purpose.

      Invoice Data:
      Invoice Number: ${invoice.invoiceNumber}
      Client: ${invoice.clientName}
      Issue Date: ${formatDate(invoice.issueDate)}
      Due Date: ${formatDate(invoice.dueDate)}
      Status: ${invoice.status}
      Items:
      ${invoice.items.map(item => `- ${item.description} (Qty: ${item.quantity}, Price: ${formatCurrency(item.unitPrice)}, Total: ${formatCurrency(item.total)})`).join('\n')}
      Subtotal: ${formatCurrency(invoice.subTotal)}
      Tax (${invoice.taxRate}%): ${formatCurrency(invoice.taxAmount)}
      Total Amount: ${formatCurrency(invoice.totalAmount)}
      ${invoice.notes ? `Notes: ${invoice.notes}` : ''}
    `;
    setAiPromptText(prompt);
    setAiResult(null);
    setAiError(null);
    openAiModal();
    setTimeout(() => {
        if (aiLayerRef.current) {
            aiLayerRef.current.sendToAI();
        } else {
            setAiError("AI Layer is not available. Ensure it's properly configured.");
            setAiIsLoading(false);
        }
    }, 100);
  };

  const handleExportToCSV = () => {
    if (filteredAndSortedInvoices.length === 0) {
      openModal('Export Error', <p>No invoices to export.</p>);
      return;
    }
    const headers = ['Invoice #', 'Client Name', 'Client Email', 'Client Address', 'Issue Date', 'Due Date', 'Subtotal', 'Tax Rate (%)', 'Tax Amount', 'Total Amount', 'Status', 'Notes', 'Items'];
    const csvRows = [headers.join(',')];

    filteredAndSortedInvoices.forEach(invoice => {
      const itemsString = invoice.items.map(item => `${item.description} (Qty: ${item.quantity}, Price: ${item.unitPrice})`).join('; ');
      const row = [
        invoice.invoiceNumber,
        invoice.clientName,
        invoice.clientEmail,
        `"${invoice.clientAddress.replace(/"/g, '""')}"`,
        formatDate(invoice.issueDate),
        formatDate(invoice.dueDate),
        invoice.subTotal,
        invoice.taxRate,
        invoice.taxAmount,
        invoice.totalAmount,
        invoice.status,
        `"${(invoice.notes || '').replace(/"/g, '""')}"`,
        `"${itemsString.replace(/"/g, '""')}"`
      ].map(field => String(field)).join(',');
      csvRows.push(row);
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'invoices.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
        openModal('Export Error', <p>CSV export is not supported by your browser.</p>);
    }
  };

  const dashboardStats = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalPaid = invoices.filter(inv => inv.status === InvoiceStatus.Paid).reduce((sum, inv) => sum + inv.totalAmount, 0);
    const totalOutstanding = invoices.filter(inv => inv.status === InvoiceStatus.Sent || inv.status === InvoiceStatus.Overdue).reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueCount = invoices.filter(inv => inv.status === InvoiceStatus.Overdue).length;
    return { totalInvoices, totalPaid, totalOutstanding, overdueCount };
  }, [invoices]);

  const renderNavButton = (viewName: View, label: string, icon: React.ReactNode) => (
    <button
        type="button"
        onClick={() => { setCurrentView(viewName); setSelectedInvoice(null); setInvoiceFormData(getDefaultInvoice()); }}
        className={`flex items-center space-x-2 px-3 py-2.5 md:px-4 md:py-2 rounded-md transition-colors w-full text-left text-sm md:text-base
            ${currentView === viewName 
                ? 'bg-primary-600 text-white shadow-sm'
                : 'hover:bg-primary-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
            }`}
        aria-current={currentView === viewName ? 'page' : undefined}
        >
        {icon}
        <span className="hidden md:inline">{label}</span>
    </button>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
           <p className="ml-4 text-gray-600 dark:text-gray-300">Loading invoices...</p>
        </div>
      );
    }
    if (appError) {
        return (
            <div className="alert alert-error m-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{appError}</p>
            </div>
        );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="p-4 md:p-6 space-y-6 fade-in">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card"><div className="stat-title">Total Invoices</div><div className="stat-value">{dashboardStats.totalInvoices}</div></div>
              <div className="stat-card"><div className="stat-title">Total Paid</div><div className="stat-value">{formatCurrency(dashboardStats.totalPaid)}</div></div>
              <div className="stat-card"><div className="stat-title">Total Outstanding</div><div className="stat-value">{formatCurrency(dashboardStats.totalOutstanding)}</div></div>
              <div className="stat-card"><div className="stat-title">Overdue Invoices</div><div className="stat-value text-red-500 dark:text-red-400">{dashboardStats.overdueCount}</div></div>
            </div>
            <div className="card">
                <h3 className="text-lg font-medium mb-4">Invoice Status Overview</h3>
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                    Chart placeholder. Recharts integration can be added here for visual data representation.
                </div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="p-4 md:p-6 fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Invoices</h2>
              <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                <div className="relative flex-grow sm:flex-grow-0">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="input input-responsive pr-10 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search invoices"
                  />
                  <SearchIconLucide size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
                  className="input input-responsive flex-grow sm:flex-grow-0"
                  aria-label="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  {Object.values(InvoiceStatus).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <button type="button" onClick={handleExportToCSV} className="btn btn-secondary btn-responsive flex items-center gap-1.5 flex-grow sm:flex-grow-0 justify-center">
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    {([
                        {key: 'invoiceNumber', label: 'Invoice #'},
                        {key: 'clientName', label: 'Client'},
                        {key: 'dueDate', label: 'Due Date', className: 'hidden md:table-cell'},
                        {key: 'totalAmount', label: 'Amount', className: 'text-right'},
                        {key: 'status', label: 'Status'}
                    ] as {key: SortKey, label: string, className?: string}[]).map(col => (
                        <th key={col.key} className={`table-header group ${col.className || ''}`} onClick={() => requestSort(col.key)} role="columnheader" aria-sort={sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}>
                            <button type="button" className="flex items-center w-full h-full text-left focus:outline-none">
                                {col.label}{getSortIcon(col.key)}
                            </button>
                        </th>
                    ))}
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredAndSortedInvoices.length > 0 ? filteredAndSortedInvoices.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                      <td className="table-cell font-medium text-primary-600 dark:text-primary-400"><button type="button" onClick={() => handleViewDetails(invoice)} className="hover:underline">{invoice.invoiceNumber}</button></td>
                      <td className="table-cell truncate max-w-xs">{invoice.clientName}</td>
                      <td className="table-cell hidden md:table-cell">{formatDate(invoice.dueDate)}</td>
                      <td className="table-cell text-right">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="table-cell"><span className={`badge ${getStatusColor(invoice.status)}`}>{invoice.status}</span></td>
                      <td className="table-cell text-right">
                        <div className="flex justify-end items-center space-x-1">
                          <button type="button" onClick={() => handleViewDetails(invoice)} title="View Details" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400"><Eye size={18}/></button>
                          <button type="button" onClick={() => handleEditInvoice(invoice)} title="Edit Invoice" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400"><Edit size={18}/></button>
                          <button type="button" onClick={() => handleDeleteInvoice(invoice.id)} title="Delete Invoice" className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 hover:text-red-600 dark:hover:text-red-400"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} className="table-cell text-center py-10 text-gray-500 dark:text-gray-400"><FileText size={36} className="mx-auto mb-2 opacity-50" />No invoices match your criteria.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'add':
      case 'edit':
        return (
          <div className="p-4 md:p-6 max-w-4xl mx-auto fade-in">
            <button type="button" onClick={() => setCurrentView('list')} className="btn btn-secondary btn-sm mb-6 flex items-center gap-1.5">
                <ArrowLeft size={16} /> Back to List
            </button>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">{currentView === 'add' ? 'Create New Invoice' : 'Edit Invoice'}</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmitInvoice(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="form-group"><label htmlFor="invoiceNumber" className="form-label">Invoice #</label><input type="text" name="invoiceNumber" id="invoiceNumber" value={invoiceFormData.invoiceNumber} onChange={handleFormInputChange} className="input" required /></div>
                    <div className="form-group"><label htmlFor="clientName" className="form-label">Client Name</label><input type="text" name="clientName" id="clientName" value={invoiceFormData.clientName} onChange={handleFormInputChange} className="input" required /></div>
                    <div className="form-group"><label htmlFor="clientEmail" className="form-label">Client Email</label><input type="email" name="clientEmail" id="clientEmail" value={invoiceFormData.clientEmail} onChange={handleFormInputChange} className="input" required /></div>
                    <div className="form-group"><label htmlFor="clientAddress" className="form-label">Client Address</label><textarea name="clientAddress" id="clientAddress" value={invoiceFormData.clientAddress} onChange={handleFormInputChange} className="input" rows={2}></textarea></div>
                    <div className="form-group"><label htmlFor="issueDate" className="form-label">Issue Date</label><input type="date" name="issueDate" id="issueDate" value={invoiceFormData.issueDate} onChange={handleFormInputChange} className="input" required /></div>
                    <div className="form-group"><label htmlFor="dueDate" className="form-label">Due Date</label><input type="date" name="dueDate" id="dueDate" value={invoiceFormData.dueDate} onChange={handleFormInputChange} className="input" required /></div>
                </div>

                <div className="space-y-3 pt-2">
                    <h3 className="text-lg font-medium text-gray-700 dark:text-slate-200">Items</h3>
                    {invoiceFormData.items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-12 gap-x-3 gap-y-2 p-3 border border-gray-200 dark:border-slate-700 rounded-md items-center">
                        <input type="text" placeholder="Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="input col-span-12 md:col-span-5" required />
                        <input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="input col-span-4 sm:col-span-3 md:col-span-2" min="0" required />
                        <input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="input col-span-4 sm:col-span-3 md:col-span-2" min="0" step="0.01" required />
                        <div className="col-span-4 sm:col-span-3 md:col-span-2 text-sm text-gray-700 dark:text-slate-300 text-right pr-2 font-medium">{formatCurrency(item.total)}</div>
                        <button type="button" onClick={() => removeItem(index)} title="Remove item" className="text-red-500 hover:text-red-700 col-span-12 sm:col-span-3 md:col-span-1 flex justify-end md:justify-center items-center p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/50">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    ))}
                    <button type="button" onClick={addItem} className="btn btn-secondary btn-sm flex items-center gap-1.5">
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2">
                    <div className="form-group"><label htmlFor="taxRate" className="form-label">Tax Rate (%)</label><input type="number" name="taxRate" id="taxRate" value={invoiceFormData.taxRate} onChange={handleFormInputChange} className="input" min="0" step="0.01" /></div>
                    <div className="form-group"><label htmlFor="status" className="form-label">Status</label><select name="status" id="status" value={invoiceFormData.status} onChange={handleFormInputChange} className="input" required>{Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div className="form-group"><label htmlFor="notes" className="form-label">Notes/Terms</label><textarea name="notes" id="notes" value={invoiceFormData.notes || ''} onChange={handleFormInputChange} className="input" rows={3}></textarea></div>

                <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-slate-300"><span>Subtotal:</span> <span>{formatCurrency(calculateTotals(invoiceFormData.items, invoiceFormData.taxRate).subTotal)}</span></div>
                    <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-slate-300"><span>Tax ({invoiceFormData.taxRate}%):</span> <span>{formatCurrency(calculateTotals(invoiceFormData.items, invoiceFormData.taxRate).taxAmount)}</span></div>
                    <div className="flex justify-between text-lg font-semibold text-gray-800 dark:text-white"><span>Total Amount:</span> <span>{formatCurrency(calculateTotals(invoiceFormData.items, invoiceFormData.taxRate).totalAmount)}</span></div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button type="button" onClick={() => setCurrentView('list')} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Cancel</button>
                    <button type="submit" className="btn btn-primary flex items-center gap-1.5">
                        <Save size={16} /> {currentView === 'add' ? 'Create Invoice' : 'Save Changes'}
                    </button>
                </div>
            </form>
          </div>
        );
      case 'details':
        if (!selectedInvoice) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">No invoice selected or invoice data is unavailable.</div>;
        return (
            <div className="p-4 md:p-6 max-w-4xl mx-auto fade-in">
                <button type="button" onClick={() => setCurrentView('list')} className="btn btn-secondary btn-sm mb-6 flex items-center gap-1.5">
                    <ArrowLeft size={16} /> Back to List
                </button>
                <div className="card print-container">
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-6 pb-4 border-b border-gray-200 dark:border-slate-700">
                        <div>
                            <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400">{selectedInvoice.invoiceNumber}</h2>
                            <span className={`badge ${getStatusColor(selectedInvoice.status)} mt-1`}>{selectedInvoice.status}</span>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:text-right">
                            <p className="text-sm text-gray-500 dark:text-slate-400">Issue Date: {formatDate(selectedInvoice.issueDate)}</p>
                            <p className={`text-sm font-medium ${selectedInvoice.status === InvoiceStatus.Overdue ? 'text-red-500 dark:text-red-400' : 'text-gray-600 dark:text-slate-300'}`}>Due Date: {formatDate(selectedInvoice.dueDate)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Bill To:</h3>
                            <p className="font-medium text-gray-800 dark:text-white text-lg">{selectedInvoice.clientName}</p>
                            <p className="text-sm text-gray-600 dark:text-slate-300">{selectedInvoice.clientEmail}</p>
                            <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-line">{selectedInvoice.clientAddress}</p>
                        </div>
                        <div className="md:text-right">
                             <h3 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">From:</h3>
                            <p className="font-medium text-gray-800 dark:text-white text-lg">Datavtar Finance</p>
                            <p className="text-sm text-gray-600 dark:text-slate-300">finance@datavtar.com</p>
                            <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-line">123 Datavtar Drive\nInnovate City, IN 56789</p>
                        </div>
                    </div>

                    <div className="table-container mb-8">
                        <table className="table">
                            <thead className="bg-gray-100 dark:bg-slate-700/50">
                                <tr>
                                    <th className="table-header">Item Description</th>
                                    <th className="table-header text-center">Quantity</th>
                                    <th className="table-header text-right">Unit Price</th>
                                    <th className="table-header text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedInvoice.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="table-cell py-3 pr-3">{item.description}</td>
                                        <td className="table-cell py-3 text-center">{item.quantity}</td>
                                        <td className="table-cell py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                                        <td className="table-cell py-3 text-right font-medium">{formatCurrency(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        {selectedInvoice.notes && (
                            <div className="md:w-1/2">
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Notes:</h4>
                                <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-line prose prose-sm dark:prose-invert max-w-none">{selectedInvoice.notes}</p>
                            </div>
                        )}
                        <div className={`w-full ${selectedInvoice.notes ? 'md:w-1/2 md:pl-4' : ''} flex md:justify-end`}>
                            <div className="w-full md:max-w-xs space-y-1.5 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-md">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300"><span>Subtotal:</span><span>{formatCurrency(selectedInvoice.subTotal)}</span></div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-slate-300"><span>Tax ({selectedInvoice.taxRate}%):</span><span>{formatCurrency(selectedInvoice.taxAmount)}</span></div>
                                <hr className="my-1.5 border-gray-200 dark:border-slate-600"/>
                                <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-white"><span>Total Amount:</span><span>{formatCurrency(selectedInvoice.totalAmount)}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-3 no-print">
                        <button type="button" onClick={() => window.print()} className="btn btn-secondary btn-responsive flex items-center justify-center gap-2">
                            <Printer size={18} /> Print / PDF
                        </button>
                         <button type="button" onClick={() => handleAiSummarizeInvoice(selectedInvoice)} className="btn btn-primary bg-purple-600 hover:bg-purple-700 btn-responsive flex items-center justify-center gap-2">
                            <Brain size={18} /> AI Summary
                        </button>
                        <button type="button" onClick={() => {
                            const emailBody = `Dear ${selectedInvoice.clientName},\n\nPlease find attached your invoice ${selectedInvoice.invoiceNumber} for ${formatCurrency(selectedInvoice.totalAmount)} due on ${formatDate(selectedInvoice.dueDate)}.\n\nThank you,\nDatavtar Finance`;
                            window.location.href = `mailto:${selectedInvoice.clientEmail}?subject=Invoice ${selectedInvoice.invoiceNumber} from Datavtar&body=${encodeURIComponent(emailBody)}`;
                            if (selectedInvoice.status === InvoiceStatus.Draft) {
                                setInvoices(prev => prev.map(inv => inv.id === selectedInvoice.id ? {...inv, status: InvoiceStatus.Sent} : inv));
                            }
                        }} className="btn btn-primary btn-responsive flex items-center justify-center gap-2">
                            <Send size={18} /> Send Invoice
                        </button>
                    </div>
                </div>
            </div>
        );
      default: return <div className="p-6 text-center text-gray-500 dark:text-gray-400">View not found. Please select an option from the sidebar.</div>;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        onResult={(apiResult) => { setAiResult(apiResult); setAiIsLoading(false); }}
        onError={(apiError) => { setAiError(apiError); setAiIsLoading(false); }}
        onLoading={(loadingStatus) => setAiIsLoading(loadingStatus)}
      />

      <div className="flex flex-1 h-screen overflow-hidden">
        <aside className="w-16 md:w-60 bg-white dark:bg-slate-800 p-2 md:p-4 shadow-lg theme-transition-all flex flex-col space-y-2 no-print shrink-0">
            <div className="flex items-center justify-center md:justify-start mb-4 md:mb-6 p-2 md:p-0 md:pl-2">
                 <Palette size={28} className="text-primary-600 dark:text-primary-400 md:mr-2 shrink-0" />
                <h1 className="hidden md:block text-xl font-bold text-primary-600 dark:text-primary-400 whitespace-nowrap">Finance Hub</h1>
            </div>
            {renderNavButton('dashboard', 'Dashboard', <BarChart3 size={20} className="shrink-0" />)}
            {renderNavButton('list', 'Invoices', <FileText size={20} className="shrink-0" />)}
            {renderNavButton('add', 'New Invoice', <Plus size={20} className="shrink-0" />)}
            
            <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700">
                 <button
                    type="button"
                    onClick={() => openModal(
                        "AI Feature Information",
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                            <p className="flex items-start gap-2"><Brain size={24} className="text-purple-500 shrink-0 mt-0.5"/><span>This application uses AI to provide summaries of invoices.</span></p>
                            <p>Click the <Brain size={16} className="inline text-purple-500"/> icon on an invoice's detail page to generate an AI summary.</p>
                            <p>The AI processes the invoice data to extract key information and provide a concise overview.</p>
                        </div>
                    )}
                    className={`flex items-center space-x-2 px-3 py-2.5 md:px-4 md:py-2 rounded-md transition-colors w-full text-left text-sm md:text-base hover:bg-primary-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300`}
                    >
                    <Lightbulb size={20} className="shrink-0" />
                    <span className="hidden md:inline">AI Info</span>
                </button>
            </div>
        </aside>

        <main className="flex-1 bg-gray-100 dark:bg-slate-900 overflow-y-auto theme-transition-all">
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm p-3 flex justify-end items-center no-print theme-transition-all">
                 <button type="button" onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 transition-colors" aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
                    {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
                </button>
            </header>
            {renderContent()}
        </main>
      </div>

      <footer className="p-4 bg-gray-200 dark:bg-slate-800 text-center text-xs sm:text-sm text-gray-600 dark:text-slate-400 no-print theme-transition-all shrink-0">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {isModalOpen && (
        <div 
          className="modal-backdrop theme-transition-all fade-in"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title-generic"
        >
          <div className="modal-content theme-transition-all slide-in w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="modal-title-generic" className="text-lg font-medium text-gray-900 dark:text-white">{modalTitle}</h3>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full -m-1" aria-label="Close modal">
                <X size={24} />
              </button>
            </div>
            <div className="mt-2">{modalContent}</div>
          </div>
        </div>
      )}

      {isAiModalOpen && (
        <div 
            className="modal-backdrop theme-transition-all fade-in"
            onClick={closeAiModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title-ai"
        >
            <div className="modal-content theme-transition-all slide-in w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3 id="modal-title-ai" className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <Brain size={20} className="text-purple-500"/> AI Invoice Summary
                    </h3>
                    <button type="button" onClick={closeAiModal} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1 rounded-full -m-1" aria-label="Close AI modal">
                        <X size={24} />
                    </button>
                </div>
                <div className="mt-4 min-h-[200px]">
                    {aiIsLoading && (
                        <div className="flex-center flex-col space-y-3 py-10">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">AI is processing the invoice...</p>
                        </div>
                    )}
                    {aiError && (
                        <div className="alert alert-error">
                            <AlertCircle className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold">AI Error</p>
                                <p className="text-sm break-all">{typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>
                            </div>
                        </div>
                    )}
                    {aiResult && !aiIsLoading && (
                        <div className="prose dark:prose-invert max-w-none p-3 bg-gray-50 dark:bg-slate-700/50 rounded-md text-sm">
                            <pre className="whitespace-pre-wrap break-all">{(() => {
                                try {
                                    const parsedJson = JSON.parse(aiResult);
                                    return JSON.stringify(parsedJson, null, 2);
                                } catch (e) {
                                    return aiResult;
                                }
                            })()}</pre>
                        </div>
                    )}
                    {!aiIsLoading && !aiError && !aiResult && (
                        <div className="text-center text-gray-400 dark:text-slate-500 py-10">
                            <Info size={32} className="mx-auto mb-2 opacity-50"/>
                            <p>AI summary will appear here once processed.</p>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button type="button" onClick={closeAiModal} className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600">Close</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
