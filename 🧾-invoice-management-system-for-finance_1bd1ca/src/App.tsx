import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import AILayer from './components/AILayer'; // Assuming this file exists as per instructions
import { AILayerHandle } from './components/AILayer.types'; // Assuming this file exists
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { 
  Plus, Edit, Trash2, Eye, Search, Filter as FilterIcon, ArrowUpDown, Sun, Moon, FileText, DollarSign, 
  CalendarDays, User, CheckCircle, XCircle, Clock, Send, Download, UploadCloud, Sparkles, ChevronDown, 
  ChevronUp, AlertTriangle, Info, LayoutDashboard, Printer, ListChecks, ChevronLeft, Save
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
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
  clientAddress: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  notes?: string;
  currency: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

type View = 
  | { name: 'dashboard' }
  | { name: 'invoiceList' }
  | { name: 'invoiceForm'; id?: string }
  | { name: 'invoiceDetail'; id: string };

interface SortConfig {
  key: keyof Invoice | 'effectiveStatus';
  direction: 'ascending' | 'descending';
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];
const INVOICE_STATUSES: Invoice['status'][] = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];
const INVOICE_STATUS_COLORS: Record<Invoice['status'] | 'Overdue', string> = {
  Draft: 'bg-gray-500',
  Sent: 'bg-blue-500',
  Paid: 'bg-green-500',
  Overdue: 'bg-red-500',
  Cancelled: 'bg-yellow-500',
};

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentView, setCurrentView] = useState<View>({ name: 'dashboard' });
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('invoiceApp_darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // AI Layer State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const initialNewInvoiceData: Partial<Invoice> = {
    invoiceNumber: '', clientName: '', clientEmail: '', clientAddress: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'), dueDate: format(new Date(), 'yyyy-MM-dd'),
    items: [], totalAmount: 0, status: 'Draft', currency: 'USD', notes: ''
  };
  const [newInvoiceData, setNewInvoiceData] = useState<Partial<Invoice>>(initialNewInvoiceData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // List View State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'issueDate', direction: 'descending'});

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalConfirmAction, setModalConfirmAction] = useState<(() => void) | null>(null);

  // Load initial data from localStorage and set up theme
  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('invoiceApp_invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (e) {
      console.error('Failed to parse invoices from localStorage:', e);
      setError('Could not load saved invoices. Data might be corrupted.');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save after initial load completes
      localStorage.setItem('invoiceApp_invoices', JSON.stringify(invoices));
    }
  }, [invoices, isLoading]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('invoiceApp_darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('invoiceApp_darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeModal();
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  const generateId = () => crypto.randomUUID();

  const getEffectiveStatus = useCallback((invoice: Invoice): Invoice['status'] | 'Overdue' => {
    if (invoice.status === 'Paid' || invoice.status === 'Cancelled' || invoice.status === 'Draft') {
      return invoice.status;
    }
    if (isValid(parseISO(invoice.dueDate)) && differenceInDays(new Date(), parseISO(invoice.dueDate)) > 0) {
      return 'Overdue';
    }
    return invoice.status;
  }, []);
  
  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).format(amount);
  };

  const calculateTotalAmount = (items: InvoiceItem[]): number => {
    return items.reduce((sum, item) => sum + item.total, 0);
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    setError(null); 
    setAiError(null);
    setAiResult(null);
    if (view.name === 'invoiceForm' && !view.id) {
      setNewInvoiceData({...initialNewInvoiceData, invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, items: []});
      setFormErrors({});
    } else if (view.name === 'invoiceForm' && view.id) {
      const invoiceToEdit = invoices.find(inv => inv.id === view.id);
      if (invoiceToEdit) {
        setNewInvoiceData({ ...invoiceToEdit });
        setFormErrors({});
      } else {
        setError(`Invoice with ID ${view.id} not found.`);
        setCurrentView({ name: 'invoiceList' });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewInvoiceData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const items = [...(newInvoiceData.items || [])];
    const item = { ...items[index] };
    (item[field] as any) = field === 'quantity' || field === 'unitPrice' ? parseFloat(value as string) || 0 : value;
    
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = (item.quantity || 0) * (item.unitPrice || 0);
    }
    items[index] = item;
    setNewInvoiceData(prev => ({ ...prev, items, totalAmount: calculateTotalAmount(items) }));
  };

  const addItem = () => {
    const newItem: InvoiceItem = { id: generateId(), description: '', quantity: 1, unitPrice: 0, total: 0 };
    setNewInvoiceData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const removeItem = (index: number) => {
    setNewInvoiceData(prev => {
      const items = [...(prev.items || [])];
      items.splice(index, 1);
      return { ...prev, items, totalAmount: calculateTotalAmount(items) };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!newInvoiceData.invoiceNumber?.trim()) errors.invoiceNumber = 'Invoice number is required.';
    if (!newInvoiceData.clientName?.trim()) errors.clientName = 'Client name is required.';
    if (!newInvoiceData.clientEmail?.trim()) errors.clientEmail = 'Client email is required.';
    else if (!/\S+@\S+\.\S+/.test(newInvoiceData.clientEmail)) errors.clientEmail = 'Invalid email format.';
    if (!newInvoiceData.issueDate) errors.issueDate = 'Issue date is required.';
    else if (!isValid(parseISO(newInvoiceData.issueDate))) errors.issueDate = 'Invalid issue date.';
    if (!newInvoiceData.dueDate) errors.dueDate = 'Due date is required.';
    else if (!isValid(parseISO(newInvoiceData.dueDate))) errors.dueDate = 'Invalid due date.';
    else if (newInvoiceData.issueDate && newInvoiceData.dueDate && parseISO(newInvoiceData.dueDate) < parseISO(newInvoiceData.issueDate)) {
      errors.dueDate = 'Due date cannot be before issue date.';
    }
    if (!newInvoiceData.items || newInvoiceData.items.length === 0) errors.items = 'At least one item is required.';
    else {
      newInvoiceData.items.forEach((item, index) => {
        if (!item.description.trim()) errors[`item_description_${index}`] = `Item ${index + 1} description is required.`;
        if (item.quantity <= 0) errors[`item_quantity_${index}`] = `Item ${index + 1} quantity must be positive.`;
        if (item.unitPrice < 0) errors[`item_unitPrice_${index}`] = `Item ${index + 1} unit price cannot be negative.`;
      });
    }
    if (!newInvoiceData.currency) errors.currency = 'Currency is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const now = new Date().toISOString();
    const invoiceToSave: Invoice = {
      ...initialNewInvoiceData, // Ensure all fields are present
      ...newInvoiceData,
      id: newInvoiceData.id || generateId(),
      totalAmount: calculateTotalAmount(newInvoiceData.items || []),
      createdAt: newInvoiceData.id ? (invoices.find(inv => inv.id === newInvoiceData.id)?.createdAt || now) : now,
      updatedAt: now,
    } as Invoice; // Type assertion after ensuring all fields

    if (newInvoiceData.id) { // Editing
      setInvoices(prev => prev.map(inv => inv.id === invoiceToSave.id ? invoiceToSave : inv));
    } else { // Creating
      setInvoices(prev => [invoiceToSave, ...prev]);
    }
    navigateTo({ name: 'invoiceList' });
  };
  
  const handleDeleteInvoice = (id: string) => {
    openModal(
      'Confirm Deletion',
      <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>,
      () => {
        setInvoices(prev => prev.filter(inv => inv.id !== id));
        closeModal();
      }
    );
  };

  const handleUpdateStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv));
  };

  // AI Functions
  const handleAIFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setAiSelectedFile(event.target.files[0]);
      setAiError(null);
      setAiResult(null);
    }
  };

  const handleExtractDataWithAI = () => {
    if (!aiSelectedFile) {
      setAiError('Please select an invoice file (image or PDF) to extract data from.');
      return;
    }
    const prompt = `Extract key information from the attached invoice document. Respond ONLY with a JSON object containing these fields: invoiceNumber (string), clientName (string), clientEmail (string), clientAddress (string), issueDate (string, 'YYYY-MM-DD' format), dueDate (string, 'YYYY-MM-DD' format), items (array of objects, each with {description: string, quantity: number, unitPrice: number}), currency (string, e.g. 'USD'). If a field is not found or unclear, use null or an appropriate default. Ensure quantities and unitPrices are numbers. Calculate item total if possible.`;
    setAiPromptText(prompt);
    setAiResult(null);
    setAiError(null);
    // setIsLoading(true); // AILayer's onLoading will handle this.
    // Delay slightly to ensure promptText state is updated before AILayer picks it up
    setTimeout(() => {
        aiLayerRef.current?.sendToAI();
    }, 100);
  };

  useEffect(() => {
    if (aiResult) {
      try {
        const parsedData = JSON.parse(aiResult);
        // Basic validation of parsed data structure
        if (typeof parsedData !== 'object' || parsedData === null) {
          throw new Error('AI response is not a valid JSON object.');
        }

        const updatedFormData: Partial<Invoice> = { ...newInvoiceData };
        if (parsedData.invoiceNumber && typeof parsedData.invoiceNumber === 'string') updatedFormData.invoiceNumber = parsedData.invoiceNumber;
        if (parsedData.clientName && typeof parsedData.clientName === 'string') updatedFormData.clientName = parsedData.clientName;
        if (parsedData.clientEmail && typeof parsedData.clientEmail === 'string') updatedFormData.clientEmail = parsedData.clientEmail;
        if (parsedData.clientAddress && typeof parsedData.clientAddress === 'string') updatedFormData.clientAddress = parsedData.clientAddress;
        if (parsedData.issueDate && typeof parsedData.issueDate === 'string' && isValid(parseISO(parsedData.issueDate))) updatedFormData.issueDate = format(parseISO(parsedData.issueDate), 'yyyy-MM-dd');
        if (parsedData.dueDate && typeof parsedData.dueDate === 'string' && isValid(parseISO(parsedData.dueDate))) updatedFormData.dueDate = format(parseISO(parsedData.dueDate), 'yyyy-MM-dd');
        if (parsedData.currency && typeof parsedData.currency === 'string' && CURRENCIES.includes(parsedData.currency.toUpperCase())) updatedFormData.currency = parsedData.currency.toUpperCase();

        if (Array.isArray(parsedData.items)) {
          const newItems: InvoiceItem[] = parsedData.items.map((item: any) => ({
            id: generateId(),
            description: String(item.description || ''),
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.unitPrice || 0),
            total: Number(item.quantity || 1) * Number(item.unitPrice || 0),
          })).filter(item => item.description); // Filter out items with no description
          updatedFormData.items = newItems;
          updatedFormData.totalAmount = calculateTotalAmount(newItems);
        }
        setNewInvoiceData(updatedFormData);
        setAiError(null);
        // Optionally, show a success message
        openModal("AI Data Extraction Successful", <p>Invoice data has been pre-filled from the document.</p>, closeModal);
      } catch (e: any) {
        console.error('Error parsing AI result:', e);
        setAiError(`Failed to process AI response: ${e.message}. Please check the data or enter manually.`);
        openModal("AI Data Extraction Failed", <p>Could not parse data from AI. Please check the file or enter manually. Error: {e.message}</p>, closeModal);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiResult]); // Dependency on newInvoiceData removed to avoid loop, manage updates within effect

  // List View Logic
  const filteredInvoices = useMemo(() => {
    return invoices
      .map(inv => ({ ...inv, effectiveStatus: getEffectiveStatus(inv) }))
      .filter(invoice => {
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch = 
          invoice.invoiceNumber.toLowerCase().includes(searchTermLower) ||
          invoice.clientName.toLowerCase().includes(searchTermLower) ||
          invoice.clientEmail.toLowerCase().includes(searchTermLower);
        const matchesStatus = filterStatus === 'All' || invoice.effectiveStatus === filterStatus;
        return matchesSearch && matchesStatus;
      });
  }, [invoices, searchTerm, filterStatus, getEffectiveStatus]);

  const sortedInvoices = useMemo(() => {
    if (!sortConfig) return filteredInvoices;
    return [...filteredInvoices].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'issueDate' || sortConfig.key === 'dueDate') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [filteredInvoices, sortConfig]);

  const requestSort = (key: SortConfig['key']) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Modal functions
  const openModal = (title: string, content: React.ReactNode, onConfirm?: () => void) => {
    setModalContent(
      <>
        <div className="modal-header">
          <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-100" aria-label="Close modal">
            <XCircle size={24} />
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-slate-300">{content}</div>
        {(onConfirm || title === "Invoice Details") && (
          <div className="modal-footer">
            <button onClick={closeModal} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">Close</button>
            {onConfirm && <button onClick={onConfirm} className="btn btn-primary">Confirm</button>}
            {title === "Invoice Details" && selectedInvoice && 
              <button onClick={() => window.print()} className="btn btn-secondary flex items-center gap-2"><Printer size={16}/> Print</button>
            }
          </div>
        )}
      </>
    );
    setModalConfirmAction(onConfirm ? () => onConfirm : null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setModalConfirmAction(null);
    setSelectedInvoice(null); // Clear selected invoice when modal closes
  };
  
  const viewInvoiceDetail = (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      setSelectedInvoice(invoice);
      const effectiveStatus = getEffectiveStatus(invoice);
      openModal(
        "Invoice Details",
        (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div><strong>Invoice #:</strong> {invoice.invoiceNumber}</div>
              <div><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-medium rounded-full text-white ${INVOICE_STATUS_COLORS[effectiveStatus]}`}>{effectiveStatus}</span></div>
              <div><strong>Client:</strong> {invoice.clientName}</div>
              <div><strong>Email:</strong> {invoice.clientEmail}</div>
              <div className="col-span-2"><strong>Address:</strong> {invoice.clientAddress}</div>
              <div><strong>Issue Date:</strong> {format(parseISO(invoice.issueDate), 'MMM dd, yyyy')}</div>
              <div><strong>Due Date:</strong> {format(parseISO(invoice.dueDate), 'MMM dd, yyyy')}</div>
              <div><strong>Currency:</strong> {invoice.currency}</div>
            </div>
            <h4 className="font-semibold mt-4">Items:</h4>
            <ul className="list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
              {invoice.items.map(item => (
                <li key={item.id}>{item.description} ({item.quantity} x {formatCurrency(item.unitPrice, invoice.currency)}) = {formatCurrency(item.total, invoice.currency)}</li>
              ))}
            </ul>
            <div className="text-right font-bold text-base">Total: {formatCurrency(invoice.totalAmount, invoice.currency)}</div>
            {invoice.notes && <div><strong>Notes:</strong> <p className="whitespace-pre-wrap text-xs p-2 bg-gray-100 dark:bg-slate-700 rounded">{invoice.notes}</p></div>}
            <div className="text-xs text-gray-500 dark:text-slate-400">
              Created: {format(parseISO(invoice.createdAt), 'MMM dd, yyyy HH:mm')}<br/>
              Last Updated: {format(parseISO(invoice.updatedAt), 'MMM dd, yyyy HH:mm')}
            </div>
          </div>
        )
      );
    }
  };
  
  // Render Functions
  const renderHeader = () => (
    <header className="bg-slate-800 dark:bg-slate-900 text-white p-4 shadow-md sticky top-0 z-[var(--z-sticky)] no-print">
      <div className="container-wide mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center gap-2 text-xl sm:text-2xl font-bold mb-2 sm:mb-0">
          <FileText size={28}/> Invoice Management System
        </div>
        <nav className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          <button onClick={() => navigateTo({name: 'dashboard'})} className={`btn btn-sm ${currentView.name === 'dashboard' ? 'bg-primary-500' : 'bg-slate-700 hover:bg-slate-600'} text-white flex items-center gap-1`}><LayoutDashboard size={16}/> Dashboard</button>
          <button onClick={() => navigateTo({name: 'invoiceList'})} className={`btn btn-sm ${currentView.name === 'invoiceList' ? 'bg-primary-500' : 'bg-slate-700 hover:bg-slate-600'} text-white flex items-center gap-1`}><ListChecks size={16}/> Invoices</button>
          <button onClick={() => navigateTo({name: 'invoiceForm'})} className="btn btn-sm btn-primary flex items-center gap-1"><Plus size={16}/> New Invoice</button>
          <ThemeToggleSwitch />
        </nav>
      </div>
    </header>
  );

  const ThemeToggleSwitch = () => (
    <button 
      className="theme-toggle focus:ring-offset-slate-800"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-thumb">
        {isDarkMode ? <Moon size={12} className="text-slate-800"/> : <Sun size={12} className="text-yellow-500"/>}
      </span>
    </button>
  );
  
  const renderFooter = () => (
    <footer className="bg-slate-100 dark:bg-slate-900 text-center p-4 text-sm text-gray-600 dark:text-slate-400 mt-auto no-print border-t dark:border-slate-700">
      Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
    </footer>
  );

  const renderDashboard = () => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => getEffectiveStatus(inv) === 'Paid');
    const totalPaidAmount = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const dueInvoices = invoices.filter(inv => !['Paid', 'Cancelled'].includes(getEffectiveStatus(inv)));
    const totalDueAmount = dueInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const overdueInvoicesCount = invoices.filter(inv => getEffectiveStatus(inv) === 'Overdue').length;

    const statusData = INVOICE_STATUSES.map(status => ({
      name: status,
      value: invoices.filter(inv => getEffectiveStatus(inv) === status).length,
    }));
    if (overdueInvoicesCount > 0 && !statusData.find(s => s.name === 'Overdue')) {
      // This logic is a bit off, as 'Overdue' is a computed status, not one of INVOICE_STATUSES.
      // For chart, we may need to adjust how statusData is computed for 'Overdue'.
    }
    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    const monthlyRevenueData = invoices
      .filter(inv => getEffectiveStatus(inv) === 'Paid' && isValid(parseISO(inv.issueDate)))
      .reduce((acc, inv) => {
        const month = format(parseISO(inv.issueDate), 'yyyy-MM');
        acc[month] = (acc[month] || 0) + inv.totalAmount;
        return acc;
      }, {} as Record<string, number>);
    
    const chartableMonthlyRevenue = Object.entries(monthlyRevenueData)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a,b) => a.month.localeCompare(b.month));

    return (
      <div className="container-wide mx-auto p-4 md:p-6 lg:p-8 space-y-6 fade-in">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Total Invoices" value={totalInvoices.toString()} icon={<FileText className="text-blue-500" size={24}/>} />
          <StatCard title="Total Paid" value={formatCurrency(totalPaidAmount, 'USD')} icon={<CheckCircle className="text-green-500" size={24}/>} description={`${paidInvoices.length} invoices`} />
          <StatCard title="Total Due" value={formatCurrency(totalDueAmount, 'USD')} icon={<Clock className="text-orange-500" size={24}/>} description={`${dueInvoices.length} invoices`} />
          <StatCard title="Overdue" value={overdueInvoicesCount.toString()} icon={<AlertTriangle className="text-red-500" size={24}/>} description={`${overdueInvoicesCount > 0 ? 'Action required' : 'All good!'}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card card-responsive">
            <h3 className="text-lg font-medium mb-4">Invoices by Status</h3>
            {invoices.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(value) => `${value} invoices`} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
            ) : <p className="text-center text-gray-500 dark:text-slate-400">No invoice data to display.</p>}
          </div>
          <div className="card card-responsive">
            <h3 className="text-lg font-medium mb-4">Monthly Revenue (Paid Invoices)</h3>
            {chartableMonthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartableMonthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value as number, 'USD')} />
                <Tooltip formatter={(value) => formatCurrency(value as number, 'USD')} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-primary-500, #3b82f6)" />
              </BarChart>
            </ResponsiveContainer>
            ) : <p className="text-center text-gray-500 dark:text-slate-400">No revenue data to display.</p>}
          </div>
        </div>
      </div>
    );
  };

  const StatCard: React.FC<{title: string, value: string, icon?: React.ReactNode, description?: string}> = ({title, value, icon, description}) => (
    <div className="stat-card theme-transition-all">
      <div className="flex items-center justify-between">
        <p className="stat-title">{title}</p>
        {icon}
      </div>
      <p className="stat-value">{value}</p>
      {description && <p className="stat-desc">{description}</p>}
    </div>
  );

  const renderInvoiceList = () => (
    <div className="container-wide mx-auto p-4 md:p-6 lg:p-8 space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Invoices</h2>
        <button onClick={() => navigateTo({name: 'invoiceForm'})} className="btn btn-primary btn-responsive flex items-center gap-2"><Plus size={18}/> Add New Invoice</button>
      </div>
      <div className="card card-responsive p-0 md:p-0">
        <div className="p-4 flex flex-col md:flex-row gap-4 border-b dark:border-slate-700">
          <div className="relative flex-grow">
            <input 
              type="text" 
              placeholder="Search by Invoice #, Client Name, Email..."
              className="input input-responsive pl-10 w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
          </div>
          <div className="flex-shrink-0">
            <select 
              className="input input-responsive w-full md:w-auto"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {([...INVOICE_STATUSES, 'Overdue'] as const).filter((item, index, self) => self.indexOf(item) === index).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="table-container rounded-b-lg">
          <table className="table">
            <thead className="table-header">
              <tr>
                {['Invoice #', 'Client', 'Issue Date', 'Due Date', 'Amount', 'Status', 'Actions'].map(header => {
                  let sortKey: SortConfig['key'] | null = null;
                  if (header === 'Invoice #') sortKey = 'invoiceNumber';
                  else if (header === 'Client') sortKey = 'clientName';
                  else if (header === 'Issue Date') sortKey = 'issueDate';
                  else if (header === 'Due Date') sortKey = 'dueDate';
                  else if (header === 'Amount') sortKey = 'totalAmount';
                  else if (header === 'Status') sortKey = 'effectiveStatus';

                  return (
                    <th key={header} scope="col" className="table-cell px-3 py-3 sm:px-6">
                      {sortKey ? (
                        <button onClick={() => requestSort(sortKey!)} className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 font-medium">
                          {header}
                          {sortConfig?.key === sortKey && (sortConfig.direction === 'ascending' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                          {sortConfig?.key !== sortKey && <ArrowUpDown size={14} className="text-gray-400"/>}
                        </button>
                      ) : header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan={7} className="table-cell text-center py-10"><LoadingSpinner /></td></tr>
              ) : sortedInvoices.length === 0 ? (
                <tr><td colSpan={7} className="table-cell text-center py-10 text-gray-500 dark:text-slate-400">No invoices found.</td></tr>
              ) : (
                sortedInvoices.map(invoice => {
                  const effectiveStatus = invoice.effectiveStatus as Invoice['status'] | 'Overdue'; // Already computed in sortedInvoices
                  return (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors duration-150">
                      <td className="table-cell px-3 py-3 sm:px-6 font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                      <td className="table-cell px-3 py-3 sm:px-6">
                        <div>{invoice.clientName}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{invoice.clientEmail}</div>
                      </td>
                      <td className="table-cell px-3 py-3 sm:px-6">{format(parseISO(invoice.issueDate), 'MMM dd, yyyy')}</td>
                      <td className="table-cell px-3 py-3 sm:px-6">{format(parseISO(invoice.dueDate), 'MMM dd, yyyy')}</td>
                      <td className="table-cell px-3 py-3 sm:px-6">{formatCurrency(invoice.totalAmount, invoice.currency)}</td>
                      <td className="table-cell px-3 py-3 sm:px-6">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full text-white ${INVOICE_STATUS_COLORS[effectiveStatus]}`}>{effectiveStatus}</span>
                      </td>
                      <td className="table-cell px-3 py-3 sm:px-6 whitespace-nowrap space-x-1 sm:space-x-2">
                        <button onClick={() => viewInvoiceDetail(invoice.id)} className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" title="View Details"><Eye size={18}/></button>
                        <button onClick={() => navigateTo({ name: 'invoiceForm', id: invoice.id })} className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300" title="Edit Invoice"><Edit size={18}/></button>
                        <button onClick={() => handleDeleteInvoice(invoice.id)} className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" title="Delete Invoice"><Trash2 size={18}/></button>
                        {effectiveStatus === 'Draft' && <button onClick={() => handleUpdateStatus(invoice.id, 'Sent')} className="p-1 text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300" title="Mark as Sent"><Send size={18}/></button>}
                        {effectiveStatus === 'Sent' && <button onClick={() => handleUpdateStatus(invoice.id, 'Paid')} className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300" title="Mark as Paid"><DollarSign size={18}/></button>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderInvoiceForm = () => (
    <div className="container-narrow mx-auto p-4 md:p-6 lg:p-8 space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{newInvoiceData.id ? 'Edit Invoice' : 'Create New Invoice'}</h2>
        <button onClick={() => navigateTo({name: 'invoiceList'})} className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"><ChevronLeft size={16}/> Back to List</button>
      </div>

      {/* AI Extraction Section */} 
      {!newInvoiceData.id && (
        <div className="card card-responsive">
          <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><Sparkles size={20} className="text-primary-500"/> AI-Powered Data Extraction</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">Upload an existing invoice (PDF or image) to automatically fill in the details.</p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input 
              type="file"
              accept=".pdf,image/*"
              ref={aiFileInputRef}
              onChange={handleAIFileSelect}
              className={styles.fileInputHidden} 
              id="ai-file-input"
            />
            <label htmlFor="ai-file-input" className="btn btn-secondary btn-responsive flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 cursor-pointer">
              <UploadCloud size={18}/> Choose File
            </label>
            {aiSelectedFile && <span className="text-sm text-gray-700 dark:text-slate-300 truncate max-w-xs">{aiSelectedFile.name}</span>}
            <button 
              onClick={handleExtractDataWithAI} 
              disabled={!aiSelectedFile || isAILoading}
              className="btn btn-primary btn-responsive flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAILoading ? <LoadingSpinner size="sm"/> : <><Sparkles size={18}/> Extract Data</>}
            </button>
          </div>
          {aiError && <p className="form-error mt-2">AI Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>}
        </div>
      )}

      <form onSubmit={handleSubmitInvoice} className="card card-responsive space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput name="invoiceNumber" label="Invoice Number" value={newInvoiceData.invoiceNumber || ''} onChange={handleInputChange} error={formErrors.invoiceNumber} required />
          <FormSelect name="currency" label="Currency" value={newInvoiceData.currency || 'USD'} onChange={handleInputChange} error={formErrors.currency} options={CURRENCIES.map(c => ({value: c, label: c}))} required />
        </div>
        
        <fieldset className="border dark:border-slate-600 p-4 rounded-md">
          <legend className="text-sm font-medium px-1 text-gray-700 dark:text-slate-300">Client Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            <FormInput name="clientName" label="Client Name" value={newInvoiceData.clientName || ''} onChange={handleInputChange} error={formErrors.clientName} required />
            <FormInput name="clientEmail" label="Client Email" type="email" value={newInvoiceData.clientEmail || ''} onChange={handleInputChange} error={formErrors.clientEmail} required />
          </div>
          <div className="mt-4">
            <FormInput name="clientAddress" label="Client Address" value={newInvoiceData.clientAddress || ''} onChange={handleInputChange} error={formErrors.clientAddress} />
          </div>
        </fieldset>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput name="issueDate" label="Issue Date" type="date" value={newInvoiceData.issueDate || ''} onChange={handleInputChange} error={formErrors.issueDate} required />
          <FormInput name="dueDate" label="Due Date" type="date" value={newInvoiceData.dueDate || ''} onChange={handleInputChange} error={formErrors.dueDate} required />
        </div>

        <div>
          <h3 className="text-md font-medium mb-2 text-gray-800 dark:text-white">Invoice Items</h3>
          {formErrors.items && <p className="form-error mb-2">{formErrors.items}</p>}
          <div className="space-y-4">
            {(newInvoiceData.items || []).map((item, index) => (
              <div key={item.id} className="p-3 border dark:border-slate-600 rounded-md bg-gray-50 dark:bg-slate-700/50 relative">
                <button type="button" onClick={() => removeItem(index)} className="absolute top-2 right-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Remove item">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6">
                    <FormInput 
                      name={`item_description_${index}`} 
                      label={`Item ${index + 1} Description`} 
                      value={item.description} 
                      onChange={e => handleItemChange(index, 'description', e.target.value)} 
                      error={formErrors[`item_description_${index}`]} 
                      required 
                      smallLabel
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <FormInput 
                      name={`item_quantity_${index}`} 
                      label="Qty" 
                      type="number" 
                      value={item.quantity.toString()} 
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)} 
                      error={formErrors[`item_quantity_${index}`]} 
                      required 
                      smallLabel
                      inputProps={{min: "0.01", step: "0.01"}}
                    />
                  </div>
                  <div className="sm:col-span-2">
                     <FormInput 
                      name={`item_unitPrice_${index}`} 
                      label="Unit Price" 
                      type="number" 
                      value={item.unitPrice.toString()} 
                      onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} 
                      error={formErrors[`item_unitPrice_${index}`]} 
                      required 
                      smallLabel
                      inputProps={{min: "0", step: "0.01"}}
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-end pb-1">
                    <p className="text-sm text-gray-700 dark:text-slate-300 w-full text-right font-medium">
                      {formatCurrency(item.total, newInvoiceData.currency || 'USD')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addItem} className="btn btn-sm bg-green-500 hover:bg-green-600 text-white mt-3 flex items-center gap-1">
            <Plus size={16}/> Add Item
          </button>
        </div>

        <div className="text-right">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Total: {formatCurrency(newInvoiceData.totalAmount || 0, newInvoiceData.currency || 'USD')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect name="status" label="Status" value={newInvoiceData.status || 'Draft'} onChange={handleInputChange} error={formErrors.status} options={INVOICE_STATUSES.map(s => ({value: s, label: s}))} required />
          <div>
            <label htmlFor="notes" className="form-label">Notes (Optional)</label>
            <textarea id="notes" name="notes" value={newInvoiceData.notes || ''} onChange={handleInputChange} rows={3} className="input"></textarea>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-600">
          <button type="button" onClick={() => navigateTo({name: 'invoiceList'})} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">Cancel</button>
          <button type="submit" className="btn btn-primary flex items-center gap-2"><Save size={18}/> {newInvoiceData.id ? 'Update Invoice' : 'Save Invoice'}</button>
        </div>
      </form>
    </div>
  );

  const FormInput: React.FC<{name: string, label: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, type?: string, required?: boolean, smallLabel?: boolean, inputProps?: React.InputHTMLAttributes<HTMLInputElement>}> = 
  ({ name, label, value, onChange, error, type = 'text', required = false, smallLabel = false, inputProps = {} }) => (
    <div className="form-group mb-0">
      <label htmlFor={name} className={`form-label ${smallLabel ? 'text-xs' : ''}`}>{label}{required && <span className="text-red-500">*</span>}</label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required={required} {...inputProps} />
      {error && <p className="form-error">{error}</p>}
    </div>
  );

  const FormSelect: React.FC<{name: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, error?: string, options: {value: string, label: string}[], required?: boolean}> = 
  ({ name, label, value, onChange, error, options, required = false }) => (
    <div className="form-group mb-0">
      <label htmlFor={name} className="form-label">{label}{required && <span className="text-red-500">*</span>}</label>
      <select id={name} name={name} value={value} onChange={onChange} className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} required={required}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <p className="form-error">{error}</p>}
    </div>
  );

  const renderCurrentView = () => {
    if (isLoading && currentView.name !== 'invoiceForm') {
      return <div className="flex-grow flex items-center justify-center"><LoadingSpinner /></div>;
    }
    switch (currentView.name) {
      case 'dashboard': return renderDashboard();
      case 'invoiceList': return renderInvoiceList();
      case 'invoiceForm': return renderInvoiceForm();
      // InvoiceDetail is rendered via modal for now
      default: return renderDashboard();
    }
  };

  const LoadingSpinner: React.FC<{size?: 'sm' | 'md' | 'lg'}> = ({size = 'md'}) => {
    const sizeClasses = {
      sm: 'w-5 h-5 border-2',
      md: 'w-8 h-8 border-4',
      lg: 'w-12 h-12 border-4',
    };
    return (
      <div role="status" className="flex justify-center items-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-primary-500 border-t-transparent dark:border-primary-400 dark:border-t-transparent`}></div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  };

  const AlertDisplay: React.FC<{message: string, type: 'error' | 'info', onClose?: () => void}> = ({message, type, onClose}) => {
    const baseClasses = "alert mb-0";
    const typeClasses = type === 'error' ? "alert-error" : "alert-info";
    const Icon = type === 'error' ? AlertTriangle : Info;
    return (
      <div className={`${baseClasses} ${typeClasses}`} role="alert">
        <Icon size={20} />
        <span>{message}</span>
        {onClose && 
          <button onClick={onClose} className="ml-auto p-1 rounded-md hover:bg-opacity-20 hover:bg-current" aria-label="Close alert">
            <XCircle size={18}/>
          </button>
        }
      </div>
    );
  };
  
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${isDarkMode ? 'dark' : ''} bg-gray-100 dark:bg-slate-900 print:bg-white`}>
      {renderHeader()}
      <main className="flex-grow container-fluid mx-auto py-0 print:p-0">
        {error && <div className="p-4 print:hidden"><AlertDisplay message={error} type="error" onClose={() => setError(null)} /></div>}
        {renderCurrentView()}
      </main>
      {renderFooter()}

      {/* AI Layer Component (Headless) */} 
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        attachment={aiSelectedFile || undefined}
        onResult={(apiResult) => setAiResult(apiResult)}
        onError={(apiError) => setAiError(apiError)}
        onLoading={(loadingStatus) => setIsAILoading(loadingStatus)}
      />

      {/* Modal */} 
      {isModalOpen && (
        <div 
          className="modal-backdrop print:hidden" 
          onClick={closeModal} 
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-content theme-transition-all" onClick={e => e.stopPropagation()}>
            {modalContent}
          </div>
        </div>
      )}
      {/* Print-specific styles and content */} 
      <div className="hidden print:block p-8">
        {selectedInvoice && (
            <div className="space-y-4 text-sm">
              <h1 className="text-2xl font-bold text-center mb-6">Invoice</h1>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6">
                <div>
                  <h2 className="text-lg font-semibold">{selectedInvoice.clientName}</h2>
                  <p>{selectedInvoice.clientAddress}</p>
                  <p>{selectedInvoice.clientEmail}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-lg font-semibold">Invoice #{selectedInvoice.invoiceNumber}</h2>
                  <p>Date Issued: {format(parseISO(selectedInvoice.issueDate), 'MMMM dd, yyyy')}</p>
                  <p>Date Due: {format(parseISO(selectedInvoice.dueDate), 'MMMM dd, yyyy')}</p>
                  <p>Status: <span className="font-semibold">{getEffectiveStatus(selectedInvoice)}</span></p>
                </div>
              </div>
              <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Item Description</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Unit Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedInvoice.items.map(item => (
                    <tr key={item.id}>
                      <td className="px-4 py-2 whitespace-normal">{item.description}</td>
                      <td className="px-4 py-2 text-right">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice, selectedInvoice.currency)}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.total, selectedInvoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-semibold text-gray-700">Grand Total:</td>
                    <td className="px-4 py-2 text-right font-semibold text-gray-700">{formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currency)}</td>
                  </tr>
                </tfoot>
              </table>
              {selectedInvoice.notes && (
                <div className="mt-6">
                  <h3 className="font-semibold">Notes:</h3>
                  <p className="text-xs p-2 border border-gray-200 rounded bg-gray-50 whitespace-pre-wrap">{selectedInvoice.notes}</p>
                </div>
              )}
              <div className="mt-12 text-center text-xs text-gray-500">
                <p>Thank you for your business!</p>
                <p>Datavtar Private Limited Invoice System</p>
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default App;
