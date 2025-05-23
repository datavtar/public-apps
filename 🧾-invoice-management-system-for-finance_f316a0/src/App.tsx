import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// Import AILayer and AILayerHandle as per instructions
// These files are assumed to exist at these paths and are NOT part of the generated code.
import AILayer from './components/AILayer'; // This line will cause an error if the file doesn't exist, but per instructions, assume it does.
import { AILayerHandle } from './components/AILayer.types'; // Same assumption here.

// Lucide Icons (ensure all used icons are imported)
import {
  Sun, Moon, Plus, Pencil, Trash2, Search, ArrowUp, ArrowDown, Upload, Download, BrainCircuit, X, ExternalLink, Info, AlertTriangle, CheckCircle, Briefcase, DollarSign, FileText
} from 'lucide-react';

// START: Types and Interfaces (declared directly in App.tsx)
enum InvoiceStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Overdue = 'Overdue',
}

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
  clientEmail: string;
  invoiceDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  totalAmount: number;
  status: InvoiceStatus;
}

type SortableInvoiceKeys = keyof Pick<Invoice, 'invoiceNumber' | 'clientName' | 'dueDate' | 'totalAmount' | 'status'>;

interface SortConfig {
  key: SortableInvoiceKeys;
  direction: 'ascending' | 'descending';
}

// For the form, allow partial data, especially from AI
type InvoiceFormData = Partial<Omit<Invoice, 'id' | 'totalAmount' | 'items'>> & {
  items?: Partial<InvoiceItem>[];
  invoiceNumber?: string | null;
  clientName?: string | null;
  clientEmail?: string | null;
  invoiceDate?: string | null;
  dueDate?: string | null;
  status?: InvoiceStatus | string | null; // Allow string initially from AI
};
// END: Types and Interfaces

const App: React.FC = () => {
  // Core State
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appError, setAppError] = useState<string | null>(null); // General app errors

  // UI State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'dueDate', direction: 'descending' });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentInvoiceForEdit, setCurrentInvoiceForEdit] = useState<Invoice | null>(null); // For editing existing invoice
  
  // Form State
  const [formClientName, setFormClientName] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formInvoiceDate, setFormInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDate, setFormDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default 30 days from now
  const [formItems, setFormItems] = useState<InvoiceItem[]>([{ id: `item-${Date.now()}`, description: '', quantity: 1, unitPrice: 0 }]);
  const [formStatus, setFormStatus] = useState<InvoiceStatus>(InvoiceStatus.Pending);
  const [formInvoiceNumber, setFormInvoiceNumber] = useState('');
  const [formValidationError, setFormValidationError] = useState<string | null>(null);


  // AI Layer State (as per Point 53.A)
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPromptText, setAiPromptText] = useState<string>('');
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Utility Functions
  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const calculateTotalAmount = (items: InvoiceItem[]): number => {
    return items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  };
  const formatCurrency = (amount: number | undefined): string => {
    return (amount ?? 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' });
  };
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Invalid Date';
    }
  };

  // Load invoices from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      } else {
        setInvoices([
          { id: generateId(), invoiceNumber: `INV-${Date.now() + 1}`, clientName: 'Tech Solutions Inc.', clientEmail: 'billing@techsolutions.com', invoiceDate: '2024-07-01', dueDate: '2024-07-31', items: [{ id: generateId(), description: 'Consulting Services', quantity: 10, unitPrice: 100 }, { id: generateId(), description: 'Software License', quantity: 1, unitPrice: 500 }], totalAmount: 1500, status: InvoiceStatus.Pending },
          { id: generateId(), invoiceNumber: `INV-${Date.now() + 2}`, clientName: 'Creative Designs LLC', clientEmail: 'accounts@creativedesigns.com', invoiceDate: '2024-07-15', dueDate: '2024-08-15', items: [{ id: generateId(), description: 'Logo Design', quantity: 1, unitPrice: 800 }, { id: generateId(), description: 'Brand Guidelines', quantity: 1, unitPrice: 1200 }], totalAmount: 2000, status: InvoiceStatus.Paid },
        ]);
      }
    } catch (error) {
      console.error("Failed to load invoices from localStorage:", error);
      setAppError("Could not load invoice data. Please try refreshing the page.");
      setInvoices([]);
    }
    setIsLoading(false);
  }, []);

  // Save invoices to localStorage when they change
  useEffect(() => {
    if (!isLoading) {
        try {
            localStorage.setItem('invoices', JSON.stringify(invoices));
        } catch (error) {
            console.error("Failed to save invoices to localStorage:", error);
            setAppError("Could not save invoice data. Changes might not persist.");
        }
    }
  }, [invoices, isLoading]);

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

  // Modal Escape key handler
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isModalOpen]); // eslint-disable-line react-hooks/exhaustive-deps -- closeModal is stable


  // AI Result Processing
  useEffect(() => {
    if (aiResult) {
      try {
        const parsedData: InvoiceFormData = JSON.parse(aiResult);
        
        setModalMode('add');
        setFormClientName(parsedData.clientName || '');
        setFormClientEmail(parsedData.clientEmail || '');

        const today = new Date().toISOString().split('T')[0];
        const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        setFormInvoiceDate((parsedData.invoiceDate && !isNaN(new Date(parsedData.invoiceDate).valueOf())) ? parsedData.invoiceDate : today);
        setFormDueDate((parsedData.dueDate && !isNaN(new Date(parsedData.dueDate).valueOf())) ? parsedData.dueDate : defaultDueDate);

        const parsedItems = parsedData.items?.map(item => ({
          id: generateId(),
          description: item?.description || 'N/A',
          quantity: typeof item?.quantity === 'number' ? item.quantity : 1,
          unitPrice: typeof item?.unitPrice === 'number' ? item.unitPrice : 0,
        })) || [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }];
        setFormItems(parsedItems.length > 0 ? parsedItems : [{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
        
        const aiStatus = parsedData.status;
        setFormStatus(aiStatus && Object.values(InvoiceStatus).includes(aiStatus as InvoiceStatus) ? aiStatus as InvoiceStatus : InvoiceStatus.Pending);
        setFormInvoiceNumber(parsedData.invoiceNumber || `INV-${Date.now()}`);
        
        setIsModalOpen(true);
        setAiResult(null);
        setAiSelectedFile(null);
      } catch (error) {
        console.error("Error parsing AI result:", error);
        setAiError("Failed to parse AI suggestion. Please check the data or enter manually.");
        setAiResult(null);
      }
    }
  }, [aiResult]);


  // CRUD and Helper Functions
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const requestSort = (key: SortableInvoiceKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const resetFormFields = () => {
    setFormClientName('');
    setFormClientEmail('');
    setFormInvoiceDate(new Date().toISOString().split('T')[0]);
    setFormDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setFormItems([{ id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
    setFormStatus(InvoiceStatus.Pending);
    setFormInvoiceNumber('');
    setCurrentInvoiceForEdit(null);
    setFormValidationError(null);
  };

  const openModal = (mode: 'add' | 'edit', invoiceToEdit?: Invoice) => {
    resetFormFields();
    setModalMode(mode);
    if (mode === 'edit' && invoiceToEdit) {
      setCurrentInvoiceForEdit(invoiceToEdit);
      setFormClientName(invoiceToEdit.clientName);
      setFormClientEmail(invoiceToEdit.clientEmail);
      setFormInvoiceDate(invoiceToEdit.invoiceDate);
      setFormDueDate(invoiceToEdit.dueDate);
      setFormItems(invoiceToEdit.items.map(item => ({...item})));
      setFormStatus(invoiceToEdit.status);
      setFormInvoiceNumber(invoiceToEdit.invoiceNumber);
    } else {
      setFormInvoiceNumber(`INV-${Date.now()}`);
    }
    setIsModalOpen(true);
    setAiError(null);
  };

  const closeModalCB = useCallback(() => {
    setIsModalOpen(false);
    resetFormFields();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- resetFormFields is stable as it only uses setters

  const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
    const newItems = [...formItems];
    const itemToUpdate = { ...newItems[index] };

    if (field === 'quantity' || field === 'unitPrice') {
        (itemToUpdate[field] as number) = Number(value) || 0;
    } else if (field === 'description') {
        (itemToUpdate[field] as string) = String(value);
    }
    
    newItems[index] = itemToUpdate;
    setFormItems(newItems);
  };

  const addItem = () => {
    setFormItems([...formItems, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (formItems.length > 1) {
      const newItems = formItems.filter((_, i) => i !== index);
      setFormItems(newItems);
    } else {
      setFormValidationError("An invoice must have at least one item.");
      setTimeout(() => setFormValidationError(null), 3000);
    }
  };
  
  const validateForm = (): boolean => {
    if (!formClientName.trim()) { setFormValidationError("Client Name is required."); return false; }
    if (!formInvoiceNumber.trim()) { setFormValidationError("Invoice Number is required."); return false; }
    if (!formInvoiceDate) { setFormValidationError("Invoice Date is required."); return false; }
    if (!formDueDate) { setFormValidationError("Due Date is required."); return false; }
    if (new Date(formDueDate) < new Date(formInvoiceDate)) { setFormValidationError("Due Date cannot be before Invoice Date."); return false; }
    if (formItems.some(item => !item.description.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
        setFormValidationError("All items must have a description, positive quantity, and non-negative unit price.");
        return false;
    }
    if (formItems.length === 0) {
      setFormValidationError("An invoice must have at least one item.");
      return false;
    }
    setFormValidationError(null);
    return true;
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    const totalAmount = calculateTotalAmount(formItems);
    const invoiceData = {
      invoiceNumber: formInvoiceNumber,
      clientName: formClientName,
      clientEmail: formClientEmail,
      invoiceDate: formInvoiceDate,
      dueDate: formDueDate,
      items: formItems,
      totalAmount,
      status: formStatus,
    };

    if (modalMode === 'add') {
      setInvoices([...invoices, { ...invoiceData, id: generateId() }]);
    } else if (modalMode === 'edit' && currentInvoiceForEdit) {
      setInvoices(invoices.map(inv => inv.id === currentInvoiceForEdit.id ? { ...invoiceData, id: currentInvoiceForEdit.id } : inv));
    }
    closeModalCB();
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      setInvoices(invoices.filter(invoice => invoice.id !== id));
    }
  };

  const filteredAndSortedInvoices = useMemo(() => {
    let sortedInvoices = [...invoices];
    if (searchTerm) {
      sortedInvoices = sortedInvoices.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.clientEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortedInvoices.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }
    return sortedInvoices;
  }, [invoices, searchTerm, sortConfig]);

  // AI Layer related functions
  const handleAIFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAiSelectedFile(file);
      setAiError(null);
      setAiPromptText("Extract invoice details from this document. Respond in JSON format with keys: invoiceNumber (string), clientName (string), clientEmail (string, optional), invoiceDate (string, YYYY-MM-DD), dueDate (string, YYYY-MM-DD), items (array of objects, each with description (string), quantity (number), unitPrice (number)), status (string, optional, one of 'Pending', 'Paid', 'Overdue'). If a field is not found, use null or omit it. For items, if quantity or unitPrice is not found, use 0 for that field. Ensure numbers are actual numbers, not strings.");
    }
  };

  const handleSendToAI = () => {
    if (!aiSelectedFile) {
      setAiError("Please select an invoice file to process.");
      return;
    }
    if (!aiPromptText.trim()){
        setAiError("AI prompt is missing.");
        return;
    }
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI();
  };
  
  const downloadCSVTemplate = () => {
    const csvHeader = "Invoice Number,Client Name,Client Email,Invoice Date (YYYY-MM-DD),Due Date (YYYY-MM-DD),Status,Item Description,Item Quantity,Item Unit Price\n";
    const exampleRow = "INV-EXAMPLE-001,Example Client,client@example.com,2024-01-01,2024-01-31,Pending,Sample Service,1,100.00\n";
    const csvContent = csvHeader + exampleRow;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "invoice_template.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
  };

  const getSortIndicator = (key: SortableInvoiceKeys) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'ascending' ? <ArrowUp className="w-4 h-4 inline ml-1" /> : <ArrowDown className="w-4 h-4 inline ml-1" />;
    }
    return <ArrowDown className="w-4 h-4 inline ml-1 opacity-20" />; 
  };

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Paid: return 'badge-success';
      case InvoiceStatus.Pending: return 'badge-warning';
      case InvoiceStatus.Overdue: return 'badge-error';
      default: return 'badge-info';
    }
  };

  if (isLoading && invoices.length === 0) { 
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-4 flex flex-col items-center justify-center theme-transition-all">
        <div className="w-full max-w-4xl space-y-4">
          <div className="skeleton-text w-1/2 h-8 mx-auto"></div>
          <div className="skeleton-text w-full h-12"></div>
          <div className="card-responsive p-0">
            <div className="skeleton-text w-full h-64"></div>
          </div>
        </div>
         <p className="text-center mt-4 text-slate-500 dark:text-slate-400">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''} theme-transition-all`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPromptText}
        attachment={aiSelectedFile || undefined}
        onResult={(apiResult) => {setAiResult(apiResult); setIsAILoading(false);}}
        onError={(apiError) => {setAiError(apiError); setIsAILoading(false);}}
        onLoading={(loadingStatus) => setIsAILoading(loadingStatus)}
      />

      <header className="bg-white dark:bg-slate-800 shadow-md p-4 theme-transition-bg no-print">
        <div className="container-wide mx-auto flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Briefcase className="w-8 h-8"/> Invoice Manager
          </h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-slate-600" />}
            </button>
            <button
              onClick={() => openModal('add')}
              className="btn btn-primary btn-responsive flex items-center gap-2"
              aria-label="Add New Invoice"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">New Invoice</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow container-wide mx-auto p-4 sm:p-6 theme-transition-bg">
        {appError && (
          <div className="alert alert-error mb-4" role="alert">
            <AlertTriangle className="w-5 h-5" />
            <span>{appError}</span>
          </div>
        )}

        <div className="card card-responsive mb-6 theme-transition-all">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2 text-gray-700 dark:text-slate-200">
            <BrainCircuit className="w-6 h-6 text-primary-500" /> AI-Powered Invoice Import
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
            Upload an invoice document (e.g., PDF, JPG, PNG). Our AI will attempt to extract the details and prefill the new invoice form.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 items-end">
            <div className="form-group">
              <label htmlFor="aiFile" className="form-label">Invoice Document</label>
              <input
                type="file"
                id="aiFile"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleAIFileChange}
                className="input input-responsive file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-700 file:text-primary-700 dark:file:text-primary-200 hover:file:bg-primary-100 dark:hover:file:bg-primary-600"
                aria-describedby="aiFileHelp"
              />
              <p id="aiFileHelp" className="mt-1 text-xs text-gray-500 dark:text-slate-400">Max file size: 5MB. Supported: PDF, JPG, PNG.</p>
            </div>
            <button
              onClick={handleSendToAI}
              disabled={isAILoading || !aiSelectedFile}
              className="btn btn-primary btn-responsive w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAILoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" /> Process with AI
                </>
              )}
            </button>
          </div>
          {aiError && (
            <div className="alert alert-error mt-4" role="alert">
              <AlertTriangle className="w-5 h-5" />
              <span>AI Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</span>
            </div>
          )}
           <div className="mt-4">
            <button onClick={downloadCSVTemplate} className="btn text-sm bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center gap-2">
              <Download className="w-4 h-4" /> Download CSV Template
            </button>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">For manual data preparation and entry.</p>
          </div>
        </div>
        
        <div className="mb-6 grid md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-1">
                 <div className="form-group">
                    <label htmlFor="searchInvoice" className="form-label sr-only">Search Invoices</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-gray-400 dark:text-slate-500" />
                        </div>
                        <input
                            type="text"
                            id="searchInvoice"
                            placeholder="Search by Invoice #, Client..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="input input-responsive pl-10"
                            aria-label="Search invoices"
                        />
                    </div>
                </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center md:text-right">
                <div className="stat-card card-sm">
                    <div className="stat-title flex items-center justify-center md:justify-start gap-1"><FileText className="w-4 h-4"/>Total Invoices</div>
                    <div className="stat-value">{invoices.length}</div>
                </div>
                <div className="stat-card card-sm">
                    <div className="stat-title flex items-center justify-center md:justify-start gap-1"><DollarSign className="w-4 h-4"/>Total Pending</div>
                    <div className="stat-value">{formatCurrency(invoices.filter(inv => inv.status === InvoiceStatus.Pending).reduce((sum, inv) => sum + inv.totalAmount, 0))}</div>
                </div>
                 <div className="stat-card card-sm hidden sm:block">
                    <div className="stat-title flex items-center justify-center md:justify-start gap-1"><CheckCircle className="w-4 h-4"/>Total Paid</div>
                    <div className="stat-value">{formatCurrency(invoices.filter(inv => inv.status === InvoiceStatus.Paid).reduce((sum, inv) => sum + inv.totalAmount, 0))}</div>
                </div>
            </div>
        </div>

        {isLoading && invoices.length > 0 ? (
             <div className="card-responsive p-0"><div className="skeleton-text w-full h-64"></div></div>
        ) : filteredAndSortedInvoices.length === 0 && !isLoading ? (
          <div className="card card-responsive text-center py-12 theme-transition-all">
            <Info className="w-16 h-16 text-gray-400 dark:text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200 mb-2">No Invoices Found</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              {searchTerm ? "Try adjusting your search or filter criteria." : "Get started by adding a new invoice or importing one using AI."}
            </p>
            <button
              onClick={() => openModal('add')}
              className="btn btn-primary btn-responsive flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" /> Add New Invoice
            </button>
          </div>
        ) : (
          <div className="table-container theme-transition-all">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('invoiceNumber')}>Invoice # {getSortIndicator('invoiceNumber')}</th>
                  <th className="table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('clientName')}>Client {getSortIndicator('clientName')}</th>
                  <th className="table-cell hidden sm:table-cell">Invoice Date</th>
                  <th className="table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('dueDate')}>Due Date {getSortIndicator('dueDate')}</th>
                  <th className="table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('totalAmount')}>Amount {getSortIndicator('totalAmount')}</th>
                  <th className="table-cell cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('status')}>Status {getSortIndicator('status')}</th>
                  <th className="table-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 theme-transition-bg">
                {filteredAndSortedInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="table-cell font-medium text-primary-600 dark:text-primary-400">{invoice.invoiceNumber}</td>
                    <td className="table-cell">
                      <div>{invoice.clientName}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 hidden md:block">{invoice.clientEmail}</div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">{formatDate(invoice.invoiceDate)}</td>
                    <td className="table-cell">{formatDate(invoice.dueDate)}</td>
                    <td className="table-cell">{formatCurrency(invoice.totalAmount)}</td>
                    <td className="table-cell">
                      <span className={`badge ${getStatusBadgeColor(invoice.status)}`}>{invoice.status}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openModal('edit', invoice)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          aria-label={`Edit invoice ${invoice.invoiceNumber}`}
                        >
                          <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`Delete invoice ${invoice.invoiceNumber}`}
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <footer className="text-center p-4 text-sm text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition-all no-print">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
        <a href="https://datavtar.com" target="_blank" rel="noopener noreferrer" className="ml-2 text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1">
            Visit Datavtar <ExternalLink className="w-3 h-3"/>
        </a>
      </footer>

      {isModalOpen && (
        <div 
            className="modal-backdrop theme-transition-all" 
            onClick={closeModalCB}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invoice-modal-title"
        >
          <div className="modal-content theme-transition-all w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="invoice-modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                {modalMode === 'add' ? 'Add New Invoice' : 'Edit Invoice'}
              </h3>
              <button onClick={closeModalCB} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200" aria-label="Close modal">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {formValidationError && (
                <div className="alert alert-error" role="alert">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{formValidationError}</span>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="clientName" className="form-label">Client Name</label>
                  <input type="text" id="clientName" value={formClientName} onChange={(e) => setFormClientName(e.target.value)} className="input input-responsive" required />
                </div>
                <div className="form-group">
                  <label htmlFor="clientEmail" className="form-label">Client Email</label>
                  <input type="email" id="clientEmail" value={formClientEmail} onChange={(e) => setFormClientEmail(e.target.value)} className="input input-responsive" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                 <div className="form-group">
                    <label htmlFor="invoiceNumber" className="form-label">Invoice Number</label>
                    <input type="text" id="invoiceNumber" value={formInvoiceNumber} onChange={(e) => setFormInvoiceNumber(e.target.value)} className="input input-responsive" placeholder={`e.g., INV-${Date.now()}`} required />
                </div>
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select id="status" value={formStatus} onChange={(e) => setFormStatus(e.target.value as InvoiceStatus)} className="input input-responsive" required>
                    {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="invoiceDate" className="form-label">Invoice Date</label>
                  <input type="date" id="invoiceDate" value={formInvoiceDate} onChange={(e) => setFormInvoiceDate(e.target.value)} className="input input-responsive" required />
                </div>
                <div className="form-group">
                  <label htmlFor="dueDate" className="form-label">Due Date</label>
                  <input type="date" id="dueDate" value={formDueDate} onChange={(e) => setFormDueDate(e.target.value)} className="input input-responsive" required />
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-md font-semibold mb-2 text-gray-700 dark:text-slate-200">Invoice Items</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {formItems.map((item, index) => (
                  <div key={item.id} className="p-3 border border-gray-200 dark:border-slate-700 rounded-md grid grid-cols-1 sm:grid-cols-12 gap-2 items-end relative">
                    <div className="form-group sm:col-span-5">
                      <label htmlFor={`itemDesc-${index}`} className="form-label text-xs">Description</label>
                      <input type="text" id={`itemDesc-${index}`} value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="input input-sm" placeholder="Service or Product" required />
                    </div>
                    <div className="form-group sm:col-span-2">
                      <label htmlFor={`itemQty-${index}`} className="form-label text-xs">Qty</label>
                      <input type="number" id={`itemQty-${index}`} value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="input input-sm" placeholder="1" min="0.01" step="any" required />
                    </div>
                    <div className="form-group sm:col-span-3">
                      <label htmlFor={`itemPrice-${index}`} className="form-label text-xs">Unit Price</label>
                      <input type="number" id={`itemPrice-${index}`} value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} className="input input-sm" placeholder="0.00" min="0" step="any" required />
                    </div>
                    <div className="sm:col-span-2 flex items-end pb-1">
                        <p className="text-sm text-gray-700 dark:text-slate-200 w-full text-right sm:text-left font-medium">
                            {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                        </p>
                    </div>
                     <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-700 disabled:opacity-50"
                        disabled={formItems.length <= 1}
                        aria-label="Remove item"
                      >
                        <X className="w-3 h-3" />
                      </button>
                  </div>
                ))}
                </div>
                <button type="button" onClick={addItem} className="btn btn-sm mt-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center gap-1">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="pt-2 text-right">
                <p className="text-lg font-semibold text-gray-800 dark:text-slate-100">
                  Total Amount: {formatCurrency(calculateTotalAmount(formItems))}
                </p>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={closeModalCB} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Save Invoice' : 'Update Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
