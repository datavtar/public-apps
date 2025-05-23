import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import AILayer from './components/AILayer'; // Removed: To be defined in-file
// import { AILayerHandle } from './components/AILayer.types'; // Removed: To be defined in-file
import { BarChart, Bar, LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell as RechartsCell } from 'recharts';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter as FilterIcon, ArrowDownUp, FileText as InvoiceIcon, DollarSign, 
  CalendarDays, CheckCircle, XCircle, AlertTriangle, Sun, Moon, Settings, LayoutDashboard, Download, 
  UploadCloud, Wand2, User, Briefcase, Mail, MapPin, ExternalLink, ChevronDown, ChevronUp, X, PackagePlus, PackageMinus, PackageSearch
} from 'lucide-react';

import styles from './styles/styles.module.css';

// Type definition for AILayer handle (previously imported)
interface AILayerHandle {
  sendToAI: () => void;
}

// Placeholder for AILayer component (previously imported)
// This is a simplified mock. A real implementation would involve API calls.
const AILayer = React.forwardRef<
  AILayerHandle,
  {
    prompt: string;
    attachment?: File;
    onResult: (result: string) => void;
    onError: (error: any) => void;
    onLoading: (loading: boolean) => void;
  }
>(({ prompt, attachment, onResult, onError, onLoading }, ref) => {
  React.useImperativeHandle(ref, () => ({
    sendToAI: () => {
      console.log(
        "Mock AILayer.sendToAI called with prompt:",
        prompt,
        "and attachment:",
        attachment?.name
      );
      onLoading(true);
      // Simulate AI processing
      setTimeout(() => {
        if (attachment && attachment.name.includes("error_trigger_file")) { 
          onError("Simulated AI error: Invalid file format.");
          onLoading(false);
          return;
        }
        if (prompt.toLowerCase().includes("cause error")) { 
          onError("Simulated AI error: Prompt caused an issue.");
          onLoading(false);
          return;
        }

        const mockResult = {
          invoiceNumber: "AI-MOCK-001",
          clientName: attachment?.name.split('.')[0] || "AI Extracted Client",
          clientEmail: "contact@aiclient.com",
          clientAddress: "123 AI Lane, Mockville",
          invoiceDate: new Date().toISOString().split('T')[0], // Use YYYY-MM-DD
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],     // Use YYYY-MM-DD
          lineItems: [
            { description: "AI Generated Item 1", quantity: 2, unitPrice: 150.75 },
            { description: "Service Rendered by AI", quantity: 1, unitPrice: 300.00 },
          ],
        };
        onResult(JSON.stringify(mockResult, null, 2));
        onLoading(false);
      }, 1500);
    },
  }));

  return null; 
});
AILayer.displayName = 'AILayer';

// Type definitions
interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientAddress: string;
  invoiceDate: string; // ISO Date string YYYY-MM-DD
  dueDate: string;     // ISO Date string YYYY-MM-DD
  items: InvoiceItem[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  notes?: string;
  createdAt: string; // ISO DateTime string
  updatedAt: string; // ISO DateTime string
}

type Page = 'dashboard' | 'invoices' | 'ai_tools' | 'settings';
type ModalMode = 'add' | 'edit' | 'view' | 'ai_invoice';

interface SortConfig {
  key: keyof Invoice | null;
  direction: 'ascending' | 'descending';
}

const LOCAL_STORAGE_KEY_INVOICES = 'datavtar_invoiceApp_invoices_v2';
const LOCAL_STORAGE_KEY_THEME = 'datavtar_invoiceApp_theme_v1';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode | null>(null);
  const [currentInvoiceFormData, setCurrentInvoiceFormData] = useState<Partial<Invoice> & { items: InvoiceItem[] } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'invoiceDate', direction: 'descending' });

  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper functions
  const generateId = () => `inv_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  const generateItemId = () => `item_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const calculateTotalAmount = (items: InvoiceItem[]): number => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const formatDate = (dateString?: string, includeTime = false): string => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid Date';
      return format(date, includeTime ? 'MMM d, yyyy HH:mm' : 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid Date Format';
    }
  };

  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return '$0.00';
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  const newEmptyInvoiceItem = (): InvoiceItem => ({
    id: generateItemId(),
    description: '',
    quantity: 1,
    unitPrice: 0,
  });

  const getDefaultNewInvoice = (): Partial<Invoice> & { items: InvoiceItem[] } => ({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientAddress: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [newEmptyInvoiceItem()],
    status: 'Draft',
    notes: '',
  });

  // Effects
  useEffect(() => {
    try {
      setIsLoading(true);
      const storedInvoices = localStorage.getItem(LOCAL_STORAGE_KEY_INVOICES);
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      } else {
        // Initialize with sample data if no data in local storage
        setInvoices(initialInvoices);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load invoices:', err);
      setError('Failed to load invoices. Data might be corrupted.');
      setInvoices(initialInvoices); // Fallback to initial if parsing fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save if not in initial loading phase
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_INVOICES, JSON.stringify(invoices));
        setError(null);
      } catch (err) {
        console.error('Failed to save invoices:', err);
        setError('Failed to save invoices. Changes might not persist.');
      }
    }
  }, [invoices, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEY_THEME, 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkAndSetOverdue = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Compare dates only

      setInvoices(prevInvoices => 
        prevInvoices.map(inv => {
          if ((inv.status === 'Sent' || inv.status === 'Draft') && inv.dueDate) {
            const dueDate = parseISO(inv.dueDate);
            if (isValid(dueDate) && dueDate < today) {
              return { ...inv, status: 'Overdue', updatedAt: new Date().toISOString() };
            }
          }
          return inv;
        })
      );
    };
    checkAndSetOverdue();
    const intervalId = setInterval(checkAndSetOverdue, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(intervalId);
  }, []); // Run once on mount and then daily

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  // Event Handlers
  const handleThemeToggle = () => setIsDarkMode(!isDarkMode);

  const openModal = (mode: ModalMode, invoice?: Invoice) => {
    setModalMode(mode);
    if (mode === 'add') {
      setCurrentInvoiceFormData(getDefaultNewInvoice());
    } else if ((mode === 'edit' || mode === 'view') && invoice) {
      setCurrentInvoiceFormData({ ...invoice, items: invoice.items.map(item => ({...item})) }); // Deep copy items for edit
      setViewingInvoice(invoice);
    } else if (mode === 'ai_invoice') {
      // For AI modal, specific setup might be needed if it's a separate modal
      // This example integrates AI into its own page section
    }
    setAiResult(null); // Clear previous AI results when opening a modal related to an invoice
    setAiError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMode(null);
    setCurrentInvoiceFormData(null);
    setViewingInvoice(null);
    setAiSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentInvoiceFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleItemChange = (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    setCurrentInvoiceFormData(prev => {
      if (!prev) return null;
      const updatedItems = prev.items.map(item => 
        item.id === itemId ? { ...item, [field]: field === 'quantity' || field === 'unitPrice' ? Number(value) : value } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  const addItemToForm = () => {
    setCurrentInvoiceFormData(prev => prev ? { ...prev, items: [...prev.items, newEmptyInvoiceItem()] } : null);
  };

  const removeItemFromForm = (itemId: string) => {
    setCurrentInvoiceFormData(prev => prev ? { ...prev, items: prev.items.filter(item => item.id !== itemId) } : null);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentInvoiceFormData) return;

    const { items, ...invoiceData } = currentInvoiceFormData;
    if (!items || items.some(item => !item.description || item.quantity <= 0 || item.unitPrice < 0)) {
      setError('Please ensure all item fields are correctly filled (description, quantity > 0, price >= 0).');
      return;
    }
    if (!invoiceData.clientName || !invoiceData.clientEmail || !invoiceData.invoiceDate || !invoiceData.dueDate) {
        setError('Please fill all required client and date fields.');
        return;
    }

    const totalAmount = calculateTotalAmount(items);
    const now = new Date().toISOString();

    if (modalMode === 'add') {
      const newInvoice: Invoice = {
        id: generateId(),
        ...getDefaultNewInvoice(), // Ensures all fields are present
        ...invoiceData,
        items,
        totalAmount,
        status: invoiceData.status || 'Draft',
        createdAt: now,
        updatedAt: now,
      } as Invoice; // Type assertion after spreading
      setInvoices(prev => [newInvoice, ...prev]);
    } else if (modalMode === 'edit' && invoiceData.id) {
      setInvoices(prev => prev.map(inv => 
        inv.id === invoiceData.id ? { ...inv, ...invoiceData, items, totalAmount, updatedAt: now } : inv
      ));
    }
    setError(null);
    closeModal();
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    }
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv
    ));
  };

  const requestSort = (key: keyof Invoice) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredInvoices = useMemo(() => {
    let sortableInvoices = [...invoices];
    if (filterStatus !== 'all') {
      sortableInvoices = sortableInvoices.filter(invoice => invoice.status.toLowerCase() === filterStatus.toLowerCase());
    }
    if (searchTerm) {
      sortableInvoices = sortableInvoices.filter(invoice => 
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig.key) {
      sortableInvoices.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          // For dates, compare as dates
          if (sortConfig.key === 'invoiceDate' || sortConfig.key === 'dueDate') {
            const dateA = parseISO(aValue);
            const dateB = parseISO(bValue);
            if (isValid(dateA) && isValid(dateB)) {
                return sortConfig.direction === 'ascending' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
            }
          }
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortableInvoices;
  }, [invoices, searchTerm, filterStatus, sortConfig]);

  // AI Layer handlers
  const handleAiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAiSelectedFile(event.target.files[0]);
      setAiResult(null);
      setAiError(null);
    }
  };

  const handleSendToAI = () => {
    const defaultPrompt = `Extract key information from the provided invoice document. Identify the invoice number, client name, invoice date, due date, total amount, and line items (description, quantity, unit price, total price per item). Respond in a structured JSON format. If certain information is not found, indicate 'N/A' for that field.`;
    const currentPrompt = aiPromptText.trim() || defaultPrompt;
    
    if (!currentPrompt && !aiSelectedFile) {
      setAiError("Please provide a prompt or select a file.");
      return;
    }
    setAiPromptText(currentPrompt); // Update state to ensure AILayer gets it
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };

  const populateInvoiceFormWithAIData = (aiJsonString: string) => {
    try {
      const aiData = JSON.parse(aiJsonString);
      // Basic validation of expected structure
      if (typeof aiData !== 'object' || aiData === null) {
        throw new Error("AI data is not a valid object.");
      }

      const newFormData: Partial<Invoice> & { items: InvoiceItem[] } = getDefaultNewInvoice();
      
      if (aiData.invoiceNumber && typeof aiData.invoiceNumber === 'string') newFormData.invoiceNumber = aiData.invoiceNumber;
      if (aiData.clientName && typeof aiData.clientName === 'string') newFormData.clientName = aiData.clientName;
      if (aiData.clientEmail && typeof aiData.clientEmail === 'string') newFormData.clientEmail = aiData.clientEmail;
      // Add other fields like clientAddress, clientCompany if AI provides them
      if (aiData.clientAddress && typeof aiData.clientAddress === 'string') newFormData.clientAddress = aiData.clientAddress;

      if (aiData.invoiceDate && typeof aiData.invoiceDate === 'string') {
        try {
          newFormData.invoiceDate = format(parseISO(aiData.invoiceDate), 'yyyy-MM-dd');
        } catch { /* keep default if parsing fails */ }
      }
      if (aiData.dueDate && typeof aiData.dueDate === 'string') {
        try {
          newFormData.dueDate = format(parseISO(aiData.dueDate), 'yyyy-MM-dd');
        } catch { /* keep default */ }
      }
      
      if (Array.isArray(aiData.lineItems)) {
        newFormData.items = aiData.lineItems.map((item: any) => ({
          id: generateItemId(),
          description: item.description || '',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
        }));
      }
      if (newFormData.items.length === 0) {
          newFormData.items.push(newEmptyInvoiceItem());
      }

      setCurrentInvoiceFormData(newFormData);
      setModalMode('add'); // Open as a new invoice form pre-filled
      setIsModalOpen(true);
      setCurrentPage('invoices'); // Switch to invoices page to see the modal clearly
      setAiResult(null); // Clear AI result after using it

    } catch (parseError) {
      console.error("Error parsing AI JSON or populating form: ", parseError);
      setAiError(`Failed to parse AI data or populate form: ${(parseError as Error).message}. Please check JSON structure.`);
    }
  };

  // CSV Export
  const downloadCSV = () => {
    if (invoices.length === 0) {
      alert('No invoices to export.');
      return;
    }
    const headers = ['Invoice ID', 'Invoice Number', 'Client Name', 'Client Email', 'Invoice Date', 'Due Date', 'Total Amount', 'Status', 'Notes', 'Items'];
    const csvRows = [
      headers.join(','),
      ...invoices.map(inv => {
        const itemsString = inv.items.map(item => `${item.description} (Qty: ${item.quantity}, Price: ${formatCurrency(item.unitPrice)})`).join('; ');
        return [
          inv.id,
          inv.invoiceNumber,
          `"${inv.clientName.replace(/"/g, '""')}"`,
          inv.clientEmail,
          formatDate(inv.invoiceDate),
          formatDate(inv.dueDate),
          inv.totalAmount,
          inv.status,
          `"${(inv.notes || '').replace(/"/g, '""')}"`,
          `"${itemsString.replace(/"/g, '""')}"`
        ].join(',');
      })
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `invoices_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  // Dashboard data calculation
  const dashboardStats = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalValue = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const dueInvoices = invoices.filter(inv => ['Sent', 'Overdue'].includes(inv.status));
    const totalDue = dueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueCount = invoices.filter(inv => inv.status === 'Overdue').length;

    const statusCounts = invoices.reduce((acc, inv) => {
      acc[inv.status] = (acc[inv.status] || 0) + 1;
      return acc;
    }, {} as Record<Invoice['status'], number>);
    const statusChartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    const monthlyRevenue = invoices
      .filter(inv => inv.status === 'Paid' && inv.invoiceDate)
      .reduce((acc, inv) => {
        try {
          const monthYear = format(parseISO(inv.invoiceDate), 'yyyy-MM');
          acc[monthYear] = (acc[monthYear] || 0) + inv.totalAmount;
        } catch {}
        return acc;
      }, {} as Record<string, number>);
    
    const monthlyRevenueChartData = Object.entries(monthlyRevenue)
      .map(([name, value]) => ({ name, revenue: value }))
      .sort((a,b) => a.name.localeCompare(b.name)); // Sort by month

    return { totalInvoices, totalValue, totalPaid, totalDue, overdueCount, statusChartData, monthlyRevenueChartData };
  }, [invoices]);

  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733'];

  // Render helpers
  const renderPageContent = () => {
    if (isLoading && currentPage !== 'settings') return <div className="flex-center p-8"><div className="skeleton h-32 w-full"></div></div>;
    if (error && currentPage !== 'settings') return <div className="alert alert-error">{error}</div>;
    
    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Invoices" value={dashboardStats.totalInvoices.toString()} icon={<InvoiceIcon className="w-6 h-6 text-primary-500" />} />
            <StatCard title="Total Value" value={formatCurrency(dashboardStats.totalValue)} icon={<DollarSign className="w-6 h-6 text-green-500" />} />
            <StatCard title="Total Paid" value={formatCurrency(dashboardStats.totalPaid)} icon={<CheckCircle className="w-6 h-6 text-blue-500" />} />
            <StatCard title="Total Due" value={formatCurrency(dashboardStats.totalDue)} icon={<AlertTriangle className="w-6 h-6 text-yellow-500" />} />
             <div className="md:col-span-2 lg:col-span-2 card h-80 theme-transition-all">
              <h3 className="text-lg font-semibold mb-4">Invoices by Status</h3>
              {dashboardStats.statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={dashboardStats.statusChartData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label>
                      {dashboardStats.statusChartData.map((entry, index) => (
                        <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value} invoices`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-gray-500 dark:text-slate-400">No invoice data for status chart.</p>}
            </div>
            <div className="md:col-span-2 lg:col-span-2 card h-80 theme-transition-all">
              <h3 className="text-lg font-semibold mb-4">Monthly Revenue (Paid Invoices)</h3>
              {dashboardStats.monthlyRevenueChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStats.monthlyRevenueChartData} margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatCurrency} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" fill="var(--color-primary-500, #3b82f6)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : <p className="text-center text-gray-500 dark:text-slate-400">No revenue data to display.</p>}
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div className="card theme-transition-all">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <h2 className="text-2xl font-semibold">Invoices</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => openModal('add')} className="btn btn-primary btn-responsive flex items-center gap-2">
                  <Plus size={18} /> Add Invoice
                </button>
                <button onClick={downloadCSV} className="btn btn-secondary btn-responsive flex items-center gap-2">
                    <Download size={18} /> Export CSV
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-grow form-group">
                <label htmlFor="searchInvoices" className="sr-only">Search Invoices</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    id="searchInvoices" 
                    className="input input-responsive pl-10" 
                    placeholder="Search by Client, Inv #, Email..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="filterStatus" className="sr-only">Filter by Status</label>
                <select 
                  id="filterStatus" 
                  className="input input-responsive"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            {sortedAndFilteredInvoices.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-slate-400">
                    <PackageSearch size={48} className="mx-auto mb-2" />
                    <p className="text-lg">No invoices found.</p>
                    <p>Try adjusting your search or filters, or add a new invoice.</p>
                </div>
            ) : (
                <div className="table-container">
                <table className="table">
                    <thead>
                    <tr>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('invoiceNumber')}>Inv # <ArrowDownUp size={14} className="inline ml-1" /></th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('clientName')}>Client <ArrowDownUp size={14} className="inline ml-1" /></th>
                        <th className="table-header responsive-hide cursor-pointer" onClick={() => requestSort('invoiceDate')}>Invoice Date <ArrowDownUp size={14} className="inline ml-1" /></th>
                        <th className="table-header responsive-hide cursor-pointer" onClick={() => requestSort('dueDate')}>Due Date <ArrowDownUp size={14} className="inline ml-1" /></th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('totalAmount')}>Amount <ArrowDownUp size={14} className="inline ml-1" /></th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('status')}>Status <ArrowDownUp size={14} className="inline ml-1" /></th>
                        <th className="table-header text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                    {sortedAndFilteredInvoices.map(invoice => (
                        <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition">
                        <td className="table-cell font-medium text-primary-600 dark:text-primary-400">{invoice.invoiceNumber}</td>
                        <td className="table-cell">
                            <div className='flex flex-col'>
                                <span>{invoice.clientName}</span>
                                <span className='text-xs text-gray-500 dark:text-slate-400 responsive-hide'>{invoice.clientCompany}</span>
                            </div>
                        </td>
                        <td className="table-cell responsive-hide">{formatDate(invoice.invoiceDate)}</td>
                        <td className="table-cell responsive-hide">
                            {formatDate(invoice.dueDate)}
                            {invoice.status === 'Overdue' && differenceInDays(new Date(), parseISO(invoice.dueDate)) > 0 && (
                                <span className="ml-2 text-xs text-red-500">({differenceInDays(new Date(), parseISO(invoice.dueDate))} days late)</span>
                            )}
                        </td>
                        <td className="table-cell">{formatCurrency(invoice.totalAmount)}</td>
                        <td className="table-cell"><StatusBadge status={invoice.status} /></td>
                        <td className="table-cell text-right">
                            <div className={`flex justify-end gap-1 ${styles.tableActionButtonsContainer}`}>
                                <ActionButton icon={<Eye size={16} />} onClick={() => openModal('view', invoice)} title="View" variant="icon" />
                                <ActionButton icon={<Edit size={16} />} onClick={() => openModal('edit', invoice)} title="Edit" variant="icon" />
                                <ActionButton icon={<Trash2 size={16} />} onClick={() => handleDeleteInvoice(invoice.id)} title="Delete" variant="icon" className="text-red-500 hover:text-red-700 dark:hover:text-red-400" />
                            </div>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            )}
          </div>
        );
      case 'ai_tools':
        return (
          <div className="card theme-transition-all">
            <h2 className="text-2xl font-semibold mb-6">AI Invoice Processor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="form-group">
                  <label htmlFor="aiFile" className="form-label">Upload Invoice Document (Image/PDF)</label>
                  <input 
                    id="aiFile" 
                    type="file" 
                    ref={fileInputRef}
                    className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600" 
                    accept=".pdf,.png,.jpg,.jpeg" 
                    onChange={handleAiFileChange} 
                  />
                  {aiSelectedFile && <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">Selected: {aiSelectedFile.name}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="aiPrompt" className="form-label">Prompt (Optional - uses default if empty)</label>
                  <textarea 
                    id="aiPrompt" 
                    rows={3} 
                    className="input" 
                    placeholder="e.g., Extract key details... (Defaults to standard invoice extraction prompt)" 
                    value={aiPromptText} 
                    onChange={(e) => setAiPromptText(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={handleSendToAI} 
                  className="btn btn-primary w-full flex items-center justify-center gap-2" 
                  disabled={aiIsLoading || (!aiSelectedFile && !aiPromptText.trim())}
                >
                  {aiIsLoading ? <Spinner /> : <Wand2 size={18} />} Process with AI
                </button>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">AI Result</h3>
                {aiIsLoading && <div className="flex-center p-4"><Spinner /> <span className='ml-2'>Processing...</span></div>}
                {aiError && <div className="alert alert-error">Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</div>}
                {aiResult && (
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-gray-50 dark:bg-slate-700 p-4 rounded-md max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap break-all">{aiResult}</pre>
                  </div>
                )}
                {aiResult && (
                    <button 
                        onClick={() => populateInvoiceFormWithAIData(aiResult)}
                        className="btn btn-secondary mt-4 w-full flex items-center justify-center gap-2"
                    >
                        <PackagePlus size={18} /> Create Invoice from AI Data
                    </button>
                )}
              </div>
            </div>
            <AILayer 
              ref={aiLayerRef} 
              prompt={aiPromptText || `Extract key information from the provided invoice document. Identify the invoice number, client name, invoice date, due date, total amount, and line items (description, quantity, unit price, total price per item). Respond in a structured JSON format. If certain information is not found, indicate 'N/A' for that field.`} 
              attachment={aiSelectedFile || undefined} 
              onResult={setAiResult} 
              onError={setAiError} 
              onLoading={setAiIsLoading} 
            />
          </div>
        );
      case 'settings':
        return (
          <div className="card theme-transition-all">
            <h2 className="text-2xl font-semibold mb-6">Settings</h2>
            <div className="form-group flex items-center justify-between p-4 border dark:border-slate-700 rounded-md">
              <label className="form-label !mb-0">Dark Mode</label>
              <ThemeToggleSwitch checked={isDarkMode} onChange={handleThemeToggle} />
            </div>
            {/* Add more settings here if needed */}
          </div>
        );
      default: return <p>Page not found.</p>;
    }
  };

  // Main render
  return (
    <div className={`min-h-screen flex flex-col theme-transition-bg ${isDarkMode ? 'dark' : ''}`}>
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-all no-print">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <InvoiceIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-3 text-xl font-semibold text-gray-800 dark:text-slate-100">InvoiceManager Pro</h1>
            </div>
            <nav className="flex items-center space-x-2 sm:space-x-4">
              {(['dashboard', 'invoices', 'ai_tools', 'settings'] as Page[]).map(page => (
                <NavButton key={page} label={page.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} isActive={currentPage === page} onClick={() => setCurrentPage(page)} icon={page === 'dashboard' ? <LayoutDashboard size={18}/> : page === 'invoices' ? <InvoiceIcon size={18}/> : page === 'ai_tools' ? <Wand2 size={18}/> : <Settings size={18}/>} />
              ))}
              <ThemeToggleSwitch checked={isDarkMode} onChange={handleThemeToggle} simple />
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow container-wide mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPageContent()}
      </main>

      <footer className="bg-gray-100 dark:bg-slate-900 text-center py-4 text-sm text-gray-600 dark:text-slate-400 theme-transition-all no-print">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {isModalOpen && currentInvoiceFormData && (modalMode === 'add' || modalMode === 'edit') && (
        <InvoiceFormModal 
          isOpen={isModalOpen} 
          mode={modalMode} 
          invoiceData={currentInvoiceFormData} 
          onClose={closeModal} 
          onSubmit={handleFormSubmit} 
          onInputChange={handleFormInputChange}
          onItemChange={handleItemChange}
          onAddItem={addItemToForm}
          onRemoveItem={removeItemFromForm}
          calculateTotalAmount={calculateTotalAmount}
          error={error}
          clearError={() => setError(null)}
        />
      )}
      {isModalOpen && viewingInvoice && modalMode === 'view' && (
         <ViewInvoiceModal 
            isOpen={isModalOpen}
            invoice={viewingInvoice}
            onClose={closeModal}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            StatusBadgeComponent={StatusBadge}
            onUpdateStatus={handleUpdateInvoiceStatus}
         />
      )}
    </div>
  );
};

// Sub-components defined within App.tsx scope for simplicity as per requirements

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}
const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <div className="stat-card theme-transition-all flex-row items-center gap-4">
    <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-500 dark:text-primary-300">
      {icon}
    </div>
    <div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {description && <div className="stat-desc">{description}</div>}
    </div>
  </div>
);

interface ThemeToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  simple?: boolean; // For a simpler icon-only version
}
const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({ checked, onChange, simple }) => {
  if (simple) {
    return (
      <button 
        onClick={onChange} 
        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition" 
        aria-label={checked ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {checked ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    )
  }
  return (
    <button 
      type="button"
      className="theme-toggle"
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">{checked ? 'Dark Mode' : 'Light Mode'}</span>
      <span className={`theme-toggle-thumb ${checked ? 'translate-x-5' : 'translate-x-1'}`}></span>
    </button>
  );
};

interface NavButtonProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
    icon?: React.ReactNode;
}
const NavButton: React.FC<NavButtonProps> = ({ label, isActive, onClick, icon }) => (
    <button 
        onClick={onClick} 
        className={`flex items-center gap-1.5 px-2 py-2 sm:px-3 text-sm font-medium rounded-md theme-transition
            ${isActive 
                ? 'bg-primary-500 text-white dark:bg-primary-600'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'}`}
        aria-current={isActive ? 'page' : undefined}
    >
      {icon} 
      <span className="hidden sm:inline">{label}</span>
    </button>
);

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  title: string;
  variant?: 'icon' | 'button';
}
const ActionButton: React.FC<ActionButtonProps> = ({ icon, title, variant = 'icon', className, ...props }) => (
  <button 
    {...props} 
    title={title} 
    aria-label={title}
    className={`p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition ${className || ''} ${variant === 'button' ? 'btn' : ''}`}
  >
    {icon}
  </button>
);

interface StatusBadgeProps {
  status: Invoice['status'];
}
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let colorClasses = '';
  switch (status) {
    case 'Paid': colorClasses = 'badge-success'; break;
    case 'Sent': colorClasses = 'badge-info'; break;
    case 'Overdue': colorClasses = 'badge-error'; break;
    case 'Draft': colorClasses = 'badge-warning'; break;
    case 'Cancelled': colorClasses = 'bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-slate-200'; break;
    default: colorClasses = 'bg-gray-100 text-gray-800';
  }
  return <span className={`badge ${colorClasses}`}>{status}</span>;
};

const Spinner: React.FC = () => (
  <svg className="animate-spin h-5 w-5 text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

// Invoice Form Modal Component
interface InvoiceFormModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  invoiceData: Partial<Invoice> & { items: InvoiceItem[] };
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onItemChange: (itemId: string, field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
  calculateTotalAmount: (items: InvoiceItem[]) => number;
  error: string | null;
  clearError: () => void;
}

const InvoiceFormModal: React.FC<InvoiceFormModalProps> = (
  { isOpen, mode, invoiceData, onClose, onSubmit, onInputChange, onItemChange, onAddItem, onRemoveItem, calculateTotalAmount, error, clearError }
) => {
  // Moved useEffect to be called unconditionally before any early returns.
  useEffect(() => {
    // The logic inside useEffect can still be conditional.
    // Added isOpen check to ensure the effect's logic only runs when the modal is intended to be active.
    if (error && isOpen) { 
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError, isOpen]); // Added isOpen to dependency array as its value affects the effect's logic.

  if (!isOpen) return null; // Early return is now fine as all hooks are called above it.

  const totalAmount = calculateTotalAmount(invoiceData.items || []);

  return (
    <div className="modal-backdrop theme-transition-all" role="dialog" aria-modal="true" aria-labelledby="invoice-modal-title" onClick={onClose}>
      <div className="modal-content w-full max-w-3xl theme-transition-all" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 id="invoice-modal-title" className="text-xl font-semibold">{mode === 'add' ? 'Create New Invoice' : 'Edit Invoice'}</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        
        {error && <div className="alert alert-error mb-4">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="invoiceNumber" className="form-label">Invoice Number</label>
              <input type="text" id="invoiceNumber" name="invoiceNumber" value={invoiceData.invoiceNumber || ''} onChange={onInputChange} className="input" required />
            </div>
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select id="status" name="status" value={invoiceData.status || 'Draft'} onChange={onInputChange} className="input">
                {['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}              </select>
            </div>
          </div>

          <fieldset className="border dark:border-slate-700 p-4 rounded-md">
            <legend className="text-sm font-medium px-1">Client Information</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="form-group">
                <label htmlFor="clientName" className="form-label">Client Name</label>
                <input type="text" id="clientName" name="clientName" value={invoiceData.clientName || ''} onChange={onInputChange} className="input" required />
              </div>
              <div className="form-group">
                <label htmlFor="clientEmail" className="form-label">Client Email</label>
                <input type="email" id="clientEmail" name="clientEmail" value={invoiceData.clientEmail || ''} onChange={onInputChange} className="input" required />
              </div>
              <div className="form-group">
                <label htmlFor="clientCompany" className="form-label">Client Company (Optional)</label>
                <input type="text" id="clientCompany" name="clientCompany" value={invoiceData.clientCompany || ''} onChange={onInputChange} className="input" />
              </div>
              <div className="form-group md:col-span-2">
                <label htmlFor="clientAddress" className="form-label">Client Address</label>
                <textarea id="clientAddress" name="clientAddress" value={invoiceData.clientAddress || ''} onChange={onInputChange} className="input" rows={2}></textarea>
              </div>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label htmlFor="invoiceDate" className="form-label">Invoice Date</label>
              <input type="date" id="invoiceDate" name="invoiceDate" value={invoiceData.invoiceDate || ''} onChange={onInputChange} className="input" required />
            </div>
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">Due Date</label>
              <input type="date" id="dueDate" name="dueDate" value={invoiceData.dueDate || ''} onChange={onInputChange} className="input" required />
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold mb-2">Items</h4>
            {(invoiceData.items || []).map((item, index) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 mb-3 p-3 border dark:border-slate-700 rounded-md relative">
                <div className="form-group col-span-12 sm:col-span-5">
                  <label htmlFor={`item-desc-${item.id}`} className="form-label text-xs">Description</label>
                  <input type="text" id={`item-desc-${item.id}`} value={item.description} onChange={(e) => onItemChange(item.id, 'description', e.target.value)} className="input input-sm" placeholder="Item description" required/>
                </div>
                <div className="form-group col-span-4 sm:col-span-2">
                  <label htmlFor={`item-qty-${item.id}`} className="form-label text-xs">Qty</label>
                  <input type="number" id={`item-qty-${item.id}`} value={item.quantity} onChange={(e) => onItemChange(item.id, 'quantity', parseFloat(e.target.value))} className="input input-sm" placeholder="1" min="0.01" step="0.01" required/>
                </div>
                <div className="form-group col-span-4 sm:col-span-2">
                  <label htmlFor={`item-price-${item.id}`} className="form-label text-xs">Unit Price</label>
                  <input type="number" id={`item-price-${item.id}`} value={item.unitPrice} onChange={(e) => onItemChange(item.id, 'unitPrice', parseFloat(e.target.value))} className="input input-sm" placeholder="0.00" min="0" step="0.01" required/>
                </div>
                <div className="form-group col-span-4 sm:col-span-2 flex items-end">
                  <p className="text-sm dark:text-slate-200 pt-5">{formatCurrency(item.quantity * item.unitPrice)}</p>
                </div>
                <div className="col-span-12 sm:col-span-1 flex items-end justify-end sm:static absolute top-1 right-1">
                  {(invoiceData.items || []).length > 1 && (
                    <button type="button" onClick={() => onRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1 rounded-md" title="Remove item">
                      <PackageMinus size={20} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={onAddItem} className="btn btn-secondary btn-sm flex items-center gap-2">
              <PackagePlus size={18} /> Add Item
            </button>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes" className="form-label">Notes (Optional)</label>
            <textarea id="notes" name="notes" value={invoiceData.notes || ''} onChange={onInputChange} className="input" rows={3}></textarea>
          </div>

          <div className="text-right font-semibold text-lg mb-4">
            Total: {formatCurrency(totalAmount)}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200">Cancel</button>
            <button type="submit" className="btn btn-primary">{mode === 'add' ? 'Create Invoice' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Invoice Modal Component
interface ViewInvoiceModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  formatCurrency: (amount?: number) => string;
  formatDate: (dateString?: string, includeTime?: boolean) => string;
  StatusBadgeComponent: React.FC<StatusBadgeProps>;
  onUpdateStatus: (id: string, status: Invoice['status']) => void;
}

const ViewInvoiceModal: React.FC<ViewInvoiceModalProps> = (
  { isOpen, invoice, onClose, formatCurrency, formatDate, StatusBadgeComponent, onUpdateStatus }
) => {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-backdrop theme-transition-all" role="dialog" aria-modal="true" aria-labelledby="view-invoice-modal-title" onClick={onClose}>
      <div className={`${styles.invoiceViewModalContent} modal-content w-full max-w-3xl theme-transition-all`} onClick={e => e.stopPropagation()}>
        <div className="modal-header no-print">
          <h3 id="view-invoice-modal-title" className="text-xl font-semibold">Invoice Details</h3>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <div className="invoice-printable-area p-2 sm:p-6">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400">INVOICE</h2>
                    <p className="text-gray-500 dark:text-slate-400"># {invoice.invoiceNumber}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100">{/* Your Company Name */}Datavtar Ltd.</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">123 Datavtar Lane, Tech City, TC 54321</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">contact@datavtar.com</p>
                </div>
            </div>

            {/* Client and Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">BILL TO</h4>
                    <p className="font-semibold text-gray-800 dark:text-slate-100">{invoice.clientName}</p>
                    {invoice.clientCompany && <p className="text-sm text-gray-600 dark:text-slate-300">{invoice.clientCompany}</p>}
                    <p className="text-sm text-gray-600 dark:text-slate-300">{invoice.clientAddress}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{invoice.clientEmail}</p>
                </div>
                <div className="text-left sm:text-right">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Invoice Date: </span>
                        <span className="font-medium text-gray-700 dark:text-slate-200">{formatDate(invoice.invoiceDate)}</span>
                    </div>
                    <div className="mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Due Date: </span>
                        <span className="font-medium text-gray-700 dark:text-slate-200">{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Status: </span>
                        <StatusBadgeComponent status={invoice.status} />
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="table-container mb-8">
                <table className="table">
                    <thead className="bg-gray-100 dark:bg-slate-700">
                        <tr>
                            <th className="table-header px-4 py-2">Item Description</th>
                            <th className="table-header px-4 py-2 text-right">Quantity</th>
                            <th className="table-header px-4 py-2 text-right">Unit Price</th>
                            <th className="table-header px-4 py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                        {invoice.items.map(item => (
                            <tr key={item.id}>
                                <td className="table-cell px-4 py-2">{item.description}</td>
                                <td className="table-cell px-4 py-2 text-right">{item.quantity}</td>
                                <td className="table-cell px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                                <td className="table-cell px-4 py-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Total and Notes */}
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8">
                <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
                    {invoice.notes && (
                        <>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">NOTES</h4>
                            <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-line">{invoice.notes}</p>
                        </>
                    )}
                </div>
                <div className="w-full sm:w-1/2 text-left sm:text-right">
                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-slate-300">Subtotal:</span>
                            <span>{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                        {/* Add Tax, Discount if needed */}
                        <div className="flex justify-between text-xl font-semibold border-t pt-2 mt-2 border-gray-300 dark:border-slate-600">
                            <span className="text-gray-800 dark:text-slate-100">TOTAL:</span>
                            <span className="text-primary-600 dark:text-primary-400">{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <p className="text-xs text-center text-gray-500 dark:text-slate-400 mt-8">Thank you for your business!</p>
        </div>

        <div className="modal-footer no-print">
          {invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && (
             <button onClick={() => onUpdateStatus(invoice.id, 'Paid')} className="btn btn-success flex items-center gap-2">
                <CheckCircle size={18} /> Mark as Paid
            </button>
          )}
           {invoice.status === 'Draft' && (
             <button onClick={() => onUpdateStatus(invoice.id, 'Sent')} className="btn btn-info flex items-center gap-2">
                <Mail size={18} /> Mark as Sent
            </button>
          )}
          <button onClick={handlePrint} className="btn btn-secondary flex items-center gap-2">
            <ExternalLink size={18} /> Print / Save PDF
          </button>
          <button onClick={onClose} className="btn bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-slate-600 dark:hover:bg-slate-500 dark:text-slate-200">Close</button>
        </div>
      </div>
    </div>
  );
};

// Sample Initial Data (can be removed or kept for demo)
const initialInvoices: Invoice[] = [
  {
    id: 'init_INV001',
    invoiceNumber: 'INV2024-001',
    clientName: 'Acme Corp',
    clientCompany: 'Acme Innovations Ltd.',
    clientEmail: 'contact@acme.com',
    clientAddress: '123 Main St, Anytown, USA 12345',
    invoiceDate: new Date(2024, 5, 15).toISOString().split('T')[0],
    dueDate: new Date(2024, 6, 15).toISOString().split('T')[0],
    items: [
      { id: 'item1', description: 'Web Design Services', quantity: 1, unitPrice: 1200 },
      { id: 'item2', description: 'Hosting (1 Year)', quantity: 1, unitPrice: 100 },
    ],
    totalAmount: 1300,
    status: 'Sent',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Thank you for your business! Payment is due within 30 days.',
  },
  {
    id: 'init_INV002',
    invoiceNumber: 'INV2024-002',
    clientName: 'Beta Solutions',
    clientEmail: 'manager@beta.sol',
    clientAddress: '456 Oak Ave, Otherville, USA 67890',
    invoiceDate: new Date(2024, 5, 20).toISOString().split('T')[0],
    dueDate: new Date(2024, 6, 1).toISOString().split('T')[0],
    items: [
      { id: 'item3', description: 'Consulting Hours (10hrs @ $150/hr)', quantity: 10, unitPrice: 150 },
    ],
    totalAmount: 1500,
    status: 'Paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'init_INV003',
    invoiceNumber: 'INV2024-003',
    clientName: 'Gamma Inc.',
    clientEmail: 'info@gamma.inc',
    clientAddress: '789 Pine Ln, Sometown, USA 10112',
    invoiceDate: new Date(2024, 4, 1).toISOString().split('T')[0],
    dueDate: new Date(2024, 5, 1).toISOString().split('T')[0], // This will become Overdue
    items: [
      { id: 'item4', description: 'Software License - Annual Subscription', quantity: 5, unitPrice: 300 },
      { id: 'item5', description: 'Premium Support Package', quantity: 1, unitPrice: 500 },
    ],
    totalAmount: 2000,
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: 'Pending approval. Discount applied for bulk license purchase.',
  },
];

export default App;
