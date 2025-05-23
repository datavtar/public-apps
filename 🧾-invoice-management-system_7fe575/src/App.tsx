import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { 
  Sun, Moon, PlusCircle, Edit3, Trash2, Eye, Search, Filter as FilterIcon, Download, X as XIcon, 
  ArrowDownUp, ArrowUp, ArrowDown, DollarSign, FileText, CalendarDays, CheckCircle, AlertTriangle, Info, Loader2, Wand2, Users, ListChecks, Package, Clock
} from 'lucide-react';

// AI Layer imports - Assuming these files exist as per instructions
import AILayer from './components/AILayer'; // Assuming this path is correct
import { AILayerHandle } from './components/AILayer.types'; // Assuming this path is correct

import styles from './styles/styles.module.css';

const APP_VERSION = '1.0.0';
const LOCAL_STORAGE_KEY = 'invoiceManagementApp_invoices_v1';

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
  clientName: string;
  clientEmail: string;
  invoiceDate: string; // ISO string
  dueDate: string; // ISO string
  items: InvoiceItem[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue';
  notes?: string;
}

type ModalMode = 'add' | 'edit' | 'view';
type SortableFields = keyof Pick<Invoice, 'invoiceNumber' | 'clientName' | 'dueDate' | 'totalAmount' | 'status'>;

interface SortConfig {
  key: SortableFields;
  direction: 'ascending' | 'descending';
}

const INVOICE_STATUSES: Invoice['status'][] = ['Draft', 'Sent', 'Paid', 'Overdue'];
const STATUS_COLORS: Record<Invoice['status'], string> = {
  Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const PIE_CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const initialInvoices: Invoice[] = [
  {
    id: 'inv_1722192053781',
    invoiceNumber: 'INV-2024-001',
    clientName: 'Tech Solutions Inc.',
    clientEmail: 'billing@techsolutions.com',
    invoiceDate: new Date().toISOString(),
    dueDate: addDays(new Date(), 30).toISOString(),
    items: [
      { id: 'item_1', description: 'Software Development Services', quantity: 100, unitPrice: 75, total: 7500 },
      { id: 'item_2', description: 'Cloud Hosting (Annual)', quantity: 1, unitPrice: 1200, total: 1200 },
    ],
    totalAmount: 8700,
    status: 'Sent',
    notes: 'Annual contract renewal for software development and cloud hosting services.',
  },
  {
    id: 'inv_1722192053782',
    invoiceNumber: 'INV-2024-002',
    clientName: 'Creative Designs Co.',
    clientEmail: 'accounts@creativedesigns.co',
    invoiceDate: addDays(new Date(), -15).toISOString(),
    dueDate: addDays(new Date(), 15).toISOString(),
    items: [
      { id: 'item_3', description: 'Graphic Design Package', quantity: 1, unitPrice: 1500, total: 1500 },
      { id: 'item_4', description: 'Logo Animation', quantity: 1, unitPrice: 500, total: 500 },
    ],
    totalAmount: 2000,
    status: 'Paid',
    notes: 'Project completed and payment received.',
  },
  {
    id: 'inv_1722192053783',
    invoiceNumber: 'INV-2024-003',
    clientName: 'Global Exports Ltd.',
    clientEmail: 'finance@globalexports.com',
    invoiceDate: addDays(new Date(), -45).toISOString(),
    dueDate: addDays(new Date(), -15).toISOString(), // Overdue
    items: [
      { id: 'item_5', description: 'Consultation Services', quantity: 20, unitPrice: 100, total: 2000 },
    ],
    totalAmount: 2000,
    status: 'Overdue',
  },
];

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const savedInvoices = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedInvoices) {
      const parsedInvoices = JSON.parse(savedInvoices) as Invoice[];
      // Basic validation, could be more thorough
      return parsedInvoices.map(inv => ({...inv, invoiceDate: inv.invoiceDate || new Date().toISOString(), dueDate: inv.dueDate || new Date().toISOString() }));
    }
    return initialInvoices;
  });

  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);
  const [appError, setAppError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [currentInvoice, setCurrentInvoice] = useState<Partial<Invoice> | null>(null);
  
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [invoiceToDeleteId, setInvoiceToDeleteId] = useState<string | null>(null);

  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAIInsights, setShowAIInsights] = useState<boolean>(false);

  // Effects
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(invoices));
    } catch (error) {
      console.error("Failed to save invoices to localStorage:", error);
      setAppError("Could not save data. Changes might be lost upon refresh.");
    }
  }, [invoices]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDeleteConfirmModal) setShowDeleteConfirmModal(false);
        else if (isModalOpen) closeModal();
      }
    };
    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen, showDeleteConfirmModal]);

  useEffect(() => {
    // Simulate initial app loading, e.g., if data came from an async source
    setIsAppLoading(false);
  }, []);

  // Helper Functions
  const generateId = (prefix: string = 'id_') => `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const formatDateForDisplay = (isoDateString?: string) => {
    if (!isoDateString) return 'N/A';
    try {
      return format(parseISO(isoDateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatDateForInput = (isoDateString?: string) => {
    if (!isoDateString) return '';
    try {
      return format(parseISO(isoDateString), 'yyyy-MM-dd');
    } catch {
      return '';
    }
  };

  const calculateItemTotal = (item: Partial<InvoiceItem>): number => {
    return (item.quantity || 0) * (item.unitPrice || 0);
  };

  const calculateGrandTotal = (items: InvoiceItem[] = []): number => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const getNextInvoiceNumber = (): string => {
    if (invoices.length === 0) return 'INV-001';
    const lastInvoiceNumber = invoices
      .map(inv => inv.invoiceNumber)
      .filter(num => num.startsWith('INV-'))
      .map(num => parseInt(num.replace('INV-', ''), 10))
      .filter(num => !isNaN(num))
      .sort((a, b) => b - a)[0];
    const nextNum = (lastInvoiceNumber || 0) + 1;
    return `INV-${String(nextNum).padStart(3, '0')}`;
  };

  // Event Handlers
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as Invoice['status'] | 'all');
  };

  const requestSort = (key: SortableFields) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const openModal = (mode: ModalMode, invoice?: Invoice) => {
    setModalMode(mode);
    setAiResult(null);
    setAiError(null);
    setShowAIInsights(false);
    if (mode === 'add') {
      setCurrentInvoice({
        invoiceNumber: getNextInvoiceNumber(),
        invoiceDate: new Date().toISOString(),
        dueDate: addDays(new Date(), 30).toISOString(),
        items: [{ id: generateId('item_'), description: '', quantity: 1, unitPrice: 0, total: 0 }],
        status: 'Draft',
      });
    } else if (invoice) {
      setCurrentInvoice({ ...invoice, items: invoice.items.map(item => ({...item})) }); // Deep copy items
    } else {
      setAppError("Error: Tried to open modal for existing invoice without providing invoice data.");
      return;
    }
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentInvoice(null);
    document.body.classList.remove('modal-open');
  };

  const handleInvoiceFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentInvoice(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setCurrentInvoice(prev => {
      if (!prev || !prev.items) return prev;
      const newItems = [...prev.items];
      const itemToUpdate = { ...newItems[index] } as InvoiceItem;
      (itemToUpdate[field] as any) = field === 'description' ? value : Number(value);
      if (field === 'quantity' || field === 'unitPrice') {
        itemToUpdate.total = calculateItemTotal(itemToUpdate);
      }
      newItems[index] = itemToUpdate;
      return { ...prev, items: newItems, totalAmount: calculateGrandTotal(newItems) };
    });
  };

  const handleAddItem = () => {
    setCurrentInvoice(prev => {
      if (!prev) return prev;
      const newItems = prev.items ? [...prev.items] : [];
      newItems.push({ id: generateId('item_'), description: '', quantity: 1, unitPrice: 0, total: 0 });
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index: number) => {
    setCurrentInvoice(prev => {
      if (!prev || !prev.items) return prev;
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems, totalAmount: calculateGrandTotal(newItems) };
    });
  };

  const handleSaveInvoice = () => {
    if (!currentInvoice || !currentInvoice.clientName || !currentInvoice.invoiceDate || !currentInvoice.dueDate) {
      setAppError("Please fill all required fields."); // Simple validation
      return;
    }
    
    const finalInvoice: Invoice = {
      id: currentInvoice.id || generateId('inv_'),
      invoiceNumber: currentInvoice.invoiceNumber || getNextInvoiceNumber(),
      clientName: currentInvoice.clientName,
      clientEmail: currentInvoice.clientEmail || '',
      invoiceDate: currentInvoice.invoiceDate,
      dueDate: currentInvoice.dueDate,
      items: currentInvoice.items || [],
      totalAmount: calculateGrandTotal(currentInvoice.items || []),
      status: currentInvoice.status || 'Draft',
      notes: currentInvoice.notes,
    };

    setInvoices(prevInvoices => {
      if (modalMode === 'add') {
        return [...prevInvoices, finalInvoice];
      } else {
        return prevInvoices.map(inv => (inv.id === finalInvoice.id ? finalInvoice : inv));
      }
    });
    closeModal();
  };

  const handleDeleteInvoiceRequest = (id: string) => {
    setInvoiceToDeleteId(id);
    setShowDeleteConfirmModal(true);
    document.body.classList.add('modal-open');
  };

  const confirmDeleteInvoice = () => {
    if (invoiceToDeleteId) {
      setInvoices(prevInvoices => prevInvoices.filter(inv => inv.id !== invoiceToDeleteId));
    }
    setShowDeleteConfirmModal(false);
    setInvoiceToDeleteId(null);
    document.body.classList.remove('modal-open');
  };

  const cancelDeleteInvoice = () => {
    setShowDeleteConfirmModal(false);
    setInvoiceToDeleteId(null);
    document.body.classList.remove('modal-open');
  };
  
  const handleDownloadCSV = () => {
    if (filteredAndSortedInvoices.length === 0) {
        setAppError("No data to download.");
        return;
    }
    const header = ['Invoice Number', 'Client Name', 'Client Email', 'Invoice Date', 'Due Date', 'Total Amount', 'Status', 'Items', 'Notes'];
    const rows = filteredAndSortedInvoices.map(inv => [
        inv.invoiceNumber,
        inv.clientName,
        inv.clientEmail,
        formatDateForDisplay(inv.invoiceDate),
        formatDateForDisplay(inv.dueDate),
        inv.totalAmount.toFixed(2),
        inv.status,
        inv.items.map(item => `${item.description} (Qty: ${item.quantity}, Price: ${item.unitPrice.toFixed(2)})`).join('; '),
        inv.notes || ''
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [header.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoices_${format(new Date(), 'yyyyMMddHHmmss')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToAI = useCallback(() => {
    if (!currentInvoice) {
      setAiError("No invoice data to analyze.");
      return;
    }
    const prompt = `Analyze this invoice and provide a brief summary and potential financial insight. Client: ${currentInvoice.clientName}, Total: ${currentInvoice.totalAmount}, Due: ${formatDateForDisplay(currentInvoice.dueDate)}, Items: ${currentInvoice.items?.map(i => i.description).slice(0,2).join(', ') + (currentInvoice.items && currentInvoice.items.length > 2 ? '...' : '')}. Respond in 2-3 short sentences.`;
    
    setAiPromptText(prompt);
    setAiResult(null);
    setAiError(null);
    // setIsLoading(true); // AILayer's onLoading will handle this
    
    // Ensure AILayer is ready with the new prompt before calling sendToAI
    // A slight delay can help if AILayer needs a tick to update its internal state from props
    setTimeout(() => {
        if (aiLayerRef.current) {
            aiLayerRef.current.sendToAI();
        } else {
            setAiError("AI Layer is not available.");
            setIsAILoading(false);
        }
    }, 0);
  }, [currentInvoice]);

  // Computed Values
  const filteredAndSortedInvoices = React.useMemo(() => {
    let filtered = invoices;
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(lowerSearchTerm) || 
        inv.clientName.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Update overdue status dynamically
    filtered = filtered.map(inv => {
      if (inv.status !== 'Paid' && differenceInDays(new Date(), parseISO(inv.dueDate)) > 0) {
        return { ...inv, status: 'Overdue' as Invoice['status'] };
      }
      return inv;
    });

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];

        if (valA === undefined || valB === undefined) return 0;

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return filtered;
  }, [invoices, searchTerm, statusFilter, sortConfig]);

  const dashboardStats = React.useMemo(() => {
    const totalInvoices = filteredAndSortedInvoices.length;
    const totalValue = filteredAndSortedInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = filteredAndSortedInvoices.filter(inv => inv.status === 'Paid').length;
    const overdueInvoices = filteredAndSortedInvoices.filter(inv => inv.status === 'Overdue').length;
    const statusCounts = INVOICE_STATUSES.map(status => ({
      name: status,
      value: filteredAndSortedInvoices.filter(inv => inv.status === status).length,
    }));
    return { totalInvoices, totalValue, paidInvoices, overdueInvoices, statusCounts };
  }, [filteredAndSortedInvoices]);

  if (isAppLoading) {
    return (
      <div className="flex-center min-h-screen bg-slate-100 dark:bg-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
        <p className="ml-4 text-lg font-medium text-slate-700 dark:text-slate-300">Loading Invoices...</p>
      </div>
    );
  }
  
  // JSX Structure
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${styles.appContainer}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition">
        <div className="container-wide mx-auto px-4 py-3 flex-between">
          <div className="flex items-center gap-2">
            <Package size={28} className="text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">Invoice Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 theme-transition"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
            </button>
            <button 
              onClick={() => openModal('add')}
              className="btn btn-primary btn-responsive flex items-center gap-2"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">New Invoice</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container-wide mx-auto px-4 py-6">
        {appError && (
          <div className="alert alert-error mb-4">
            <AlertTriangle size={20} /> <p>{appError}</p>
            <button onClick={() => setAppError(null)} className="ml-auto text-sm font-medium">Dismiss</button>
          </div>
        )}

        {/* Dashboard Section */}
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-3">Dashboard Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[ 
              { title: 'Total Invoices', value: dashboardStats.totalInvoices, icon: FileText, color: 'text-blue-500' },
              { title: 'Total Value', value: `$${dashboardStats.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, icon: DollarSign, color: 'text-green-500' },
              { title: 'Paid Invoices', value: dashboardStats.paidInvoices, icon: CheckCircle, color: 'text-teal-500' },
              { title: 'Overdue Invoices', value: dashboardStats.overdueInvoices, icon: AlertTriangle, color: 'text-red-500' },
            ].map(stat => (
              <div key={stat.title} className="stat-card theme-transition-all">
                <div className="flex items-center justify-between">
                  <p className="stat-title">{stat.title}</p>
                  <stat.icon size={20} className={`${stat.color} opacity-70`} />
                </div>
                <p className="stat-value">{stat.value}</p>
              </div>
            ))}
          </div>
          {dashboardStats.statusCounts.some(s => s.value > 0) ? (
            <div className="card theme-transition-all">
              <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200 mb-2">Invoice Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={dashboardStats.statusCounts.filter(s => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dashboardStats.statusCounts.filter(s => s.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[INVOICE_STATUSES.indexOf(entry.name as Invoice['status']) % PIE_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} invoices`, undefined]}/>
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="card theme-transition-all text-center py-8">
                <ListChecks size={48} className="mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                <p className="text-slate-500 dark:text-slate-400">No invoice data available for charts.</p>
            </div>
          )}
        </section>

        {/* Controls: Search, Filter, Download */}
        <section className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg shadow theme-transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="form-group">
              <label htmlFor="search" className="form-label">Search Invoices</label>
              <div className="relative">
                <input 
                  type="text" 
                  id="search" 
                  name="search" 
                  className="input input-responsive pr-10" 
                  placeholder="Client name or Invoice #"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search invoices by client name or invoice number"
                />
                <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500"/>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
              <div className="relative">
                <select 
                  id="statusFilter" 
                  name="statusFilter"
                  className="input input-responsive appearance-none pr-10" 
                  value={statusFilter}
                  onChange={handleFilterChange}
                  aria-label="Filter invoices by status"
                >
                  <option value="all">All Statuses</option>
                  {INVOICE_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <FilterIcon size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"/>
              </div>
            </div>
            <button 
              onClick={handleDownloadCSV}
              className="btn bg-secondary-600 text-white hover:bg-secondary-700 btn-responsive flex items-center justify-center gap-2 md:mt-0 mt-4"
              aria-label="Download invoices as CSV"
            >
              <Download size={18} /> Download CSV
            </button>
          </div>
        </section>

        {/* Invoice List Table */}
        <section className="table-container theme-transition-all">
          <table className="table">
            <thead className="table-header">
              <tr>
                {([
                  { label: 'Invoice #', key: 'invoiceNumber' as SortableFields, icon: FileText },
                  { label: 'Client', key: 'clientName' as SortableFields, icon: Users },
                  { label: 'Due Date', key: 'dueDate' as SortableFields, icon: CalendarDays },
                  { label: 'Amount', key: 'totalAmount' as SortableFields, icon: DollarSign },
                  { label: 'Status', key: 'status' as SortableFields, icon: ListChecks },
                  { label: 'Actions', icon: CogIcon } // CogIcon is a placeholder for generic action column styling
                ] as Array<{label: string, key?: SortableFields, icon: React.ElementType}>).map(({label, key, icon: IconComponent}) => (
                  <th key={label} scope="col" className="table-cell px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">
                    <button 
                      onClick={key ? () => requestSort(key) : undefined} 
                      className={`flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-100 transition-colors ${key ? 'cursor-pointer' : 'cursor-default'}`}
                      disabled={!key}
                      aria-label={key ? `Sort by ${label}` : label}
                    >
                      <IconComponent size={14} className="mr-1 opacity-70" />
                      {label}
                      {key && sortConfig && sortConfig.key === key && (
                        sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                      {key && (!sortConfig || sortConfig.key !== key) && <ArrowDownUp size={14} className="opacity-30" />}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700 theme-transition-all">
              {filteredAndSortedInvoices.length > 0 ? (
                filteredAndSortedInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                    <td className="table-cell px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{invoice.invoiceNumber}</td>
                    <td className="table-cell px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">{invoice.clientName}</td>
                    <td className={`table-cell px-4 py-3 whitespace-nowrap text-sm ${differenceInDays(new Date(), parseISO(invoice.dueDate)) > 0 && invoice.status !== 'Paid' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                      {formatDateForDisplay(invoice.dueDate)}
                    </td>
                    <td className="table-cell px-4 py-3 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">${invoice.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="table-cell px-4 py-3 whitespace-nowrap text-sm">
                      <span className={`badge ${STATUS_COLORS[invoice.status]}`}>{invoice.status}</span>
                    </td>
                    <td className="table-cell px-4 py-3 whitespace-nowrap text-sm font-medium stack-x">
                      <button onClick={() => openModal('view', invoice)} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1" title="View Invoice" aria-label={`View invoice ${invoice.invoiceNumber}`}><Eye size={18}/></button>
                      <button onClick={() => openModal('edit', invoice)} className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200 p-1" title="Edit Invoice" aria-label={`Edit invoice ${invoice.invoiceNumber}`}><Edit3 size={18}/></button>
                      <button onClick={() => handleDeleteInvoiceRequest(invoice.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1" title="Delete Invoice" aria-label={`Delete invoice ${invoice.invoiceNumber}`}><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="table-cell text-center py-10 text-slate-500 dark:text-slate-400">
                    <Info size={32} className="mx-auto mb-2" />
                    No invoices found. Try adjusting your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      {/* Invoice Modal (Add/Edit/View) */}
      {isModalOpen && currentInvoice && (
        <div className="modal-backdrop theme-transition" role="dialog" aria-modal="true" aria-labelledby="invoice-modal-title" onClick={closeModal}>
          <div className="modal-content theme-transition-all w-full max-w-2xl max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="invoice-modal-title" className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                {modalMode === 'add' ? 'Create New Invoice' : modalMode === 'edit' ? `Edit Invoice ${currentInvoice.invoiceNumber}` : `View Invoice ${currentInvoice.invoiceNumber}`}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" aria-label="Close modal">
                <XIcon size={24} />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (modalMode !== 'view') handleSaveInvoice(); }} className="mt-4 space-y-4 overflow-y-auto pr-2" style={{maxHeight: 'calc(95vh - 200px)'}}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="invoiceNumber" className="form-label">Invoice Number</label>
                  <input type="text" id="invoiceNumber" name="invoiceNumber" className="input" value={currentInvoice.invoiceNumber || ''} onChange={handleInvoiceFormChange} readOnly={modalMode !== 'add'} disabled={modalMode !== 'add'} />
                </div>
                <div className="form-group">
                  <label htmlFor="clientName" className="form-label">Client Name *</label>
                  <input type="text" id="clientName" name="clientName" className="input" value={currentInvoice.clientName || ''} onChange={handleInvoiceFormChange} readOnly={modalMode === 'view'} required />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="clientEmail" className="form-label">Client Email</label>
                <input type="email" id="clientEmail" name="clientEmail" className="input" value={currentInvoice.clientEmail || ''} onChange={handleInvoiceFormChange} readOnly={modalMode === 'view'} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="invoiceDate" className="form-label">Invoice Date *</label>
                  <input type="date" id="invoiceDate" name="invoiceDate" className="input" value={formatDateForInput(currentInvoice.invoiceDate)} onChange={handleInvoiceFormChange} readOnly={modalMode === 'view'} required />
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date *</label>
                  <input type="date" id="dueDate" name="dueDate" className="input" value={formatDateForInput(currentInvoice.dueDate)} onChange={handleInvoiceFormChange} readOnly={modalMode === 'view'} required />
                </div>
              </div>

              <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 pt-2 border-t border-slate-200 dark:border-slate-700">Items</h4>
              {currentInvoice.items?.map((item, index) => (
                <div key={item.id || index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-2 border border-slate-200 dark:border-slate-700 rounded-md">
                  <div className="form-group md:col-span-5">
                    {index === 0 && <label className="form-label text-xs">Description</label>}
                    <input type="text" placeholder="Item description" className="input input-sm" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} readOnly={modalMode === 'view'} />
                  </div>
                  <div className="form-group md:col-span-2">
                    {index === 0 && <label className="form-label text-xs">Qty</label>}
                    <input type="number" placeholder="Qty" className="input input-sm" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} readOnly={modalMode === 'view'} min="0" />
                  </div>
                  <div className="form-group md:col-span-2">
                    {index === 0 && <label className="form-label text-xs">Unit Price</label>}
                    <input type="number" placeholder="Price" className="input input-sm" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} readOnly={modalMode === 'view'} min="0" step="0.01" />
                  </div>
                  <div className="form-group md:col-span-2">
                    {index === 0 && <label className="form-label text-xs">Total</label>}
                    <input type="text" className="input input-sm bg-slate-50 dark:bg-slate-700" value={`$${item.total.toFixed(2)}`} readOnly />
                  </div>
                  {modalMode !== 'view' && (
                    <div className="md:col-span-1 flex justify-end">
                      <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1" aria-label="Remove item">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {modalMode !== 'view' && (
                <button type="button" onClick={handleAddItem} className="btn btn-sm bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 flex items-center gap-1">
                  <PlusCircle size={16} /> Add Item
                </button>
              )}

              <div className="form-group pt-2 border-t border-slate-200 dark:border-slate-700">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea id="notes" name="notes" rows={3} className="input" value={currentInvoice.notes || ''} onChange={handleInvoiceFormChange} readOnly={modalMode === 'view'} placeholder="Optional notes or terms..."></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select id="status" name="status" className="input" value={currentInvoice.status || 'Draft'} onChange={handleInvoiceFormChange} disabled={modalMode === 'view'}>
                    {INVOICE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600 dark:text-slate-300">Grand Total</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">${(currentInvoice.totalAmount || 0).toFixed(2)}</p>
                </div>
              </div>
              
              {/* AI Insights Section */}
              {(modalMode === 'view' || modalMode === 'edit') && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button 
                    type="button" 
                    onClick={() => { handleSendToAI(); setShowAIInsights(true); }}
                    className="btn btn-secondary btn-sm flex items-center gap-2 mb-2"
                    disabled={isAILoading}
                  >
                    {isAILoading ? <Loader2 size={16} className="animate-spin"/> : <Wand2 size={16} />} Get AI Insights
                  </button>
                  {showAIInsights && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-md min-h-[60px]">
                      {isAILoading && <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2"><Loader2 size={16} className="animate-spin"/>Analyzing...</p>}
                      {aiError && <p className="text-sm text-red-500 dark:text-red-400">Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>}
                      {aiResult && <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{aiResult}</p>}
                      {!isAILoading && !aiError && !aiResult && <p className="text-sm text-slate-500 dark:text-slate-400">Click button above to generate AI insights for this invoice.</p>}
                    </div>
                  )}
                </div>
              )}

              {modalMode !== 'view' && (
                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                  <button type="submit" className="btn btn-primary">
                    {modalMode === 'add' ? 'Create Invoice' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="modal-backdrop theme-transition" role="dialog" aria-modal="true" aria-labelledby="delete-confirm-title" onClick={cancelDeleteInvoice}>
          <div className="modal-content theme-transition-all max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="delete-confirm-title" className="text-lg font-medium text-slate-800 dark:text-slate-100">Confirm Deletion</h3>
              <button onClick={cancelDeleteInvoice} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" aria-label="Close modal">
                <XIcon size={24} />
              </button>
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Are you sure you want to delete this invoice? This action cannot be undone.</p>
            <div className="modal-footer">
              <button onClick={cancelDeleteInvoice} className="btn bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
              <button onClick={confirmDeleteInvoice} className="btn bg-red-600 text-white hover:bg-red-700">Delete Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer Component (Headless) */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText} 
        // attachment={aiSelectedFile || undefined} // File attachment not used in this example
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => setAiError(apiError)}
        onLoading={(loadingStatus) => setIsAILoading(loadingStatus)}
      />

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 text-center py-4 mt-auto theme-transition">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved. App Version: {APP_VERSION}
        </p>
      </footer>
    </div>
  );
};

// Placeholder for CogIcon if not available or for generic actions icon
const CogIcon: React.FC<{size: number, className?: string}> = ({size, className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 22v-2"/><path d="m17 20.66-1-1.73"/><path d="M11 10.27 7 3.34"/><path d="m20.66 17-1.73-1"/><path d="m3.34 7 1.73 1"/><path d="M14 12h8"/><path d="M2 12h2"/><path d="m20.66 7-1.73 1"/><path d="m3.34 17 1.73-1"/><path d="m17 3.34-1 1.73"/><path d="m11 13.73 4 6.93"/></svg>
  );

export default App;
