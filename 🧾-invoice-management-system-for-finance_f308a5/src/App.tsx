import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AILayer from './components/AILayer'; // Assuming AILayer.tsx is in ./components/
import { AILayerHandle } from './components/AILayer.types'; // Assuming AILayer.types.ts is in ./components/
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, Sector } from 'recharts';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import styles from './styles/styles.module.css';
import {
    Sun, Moon, FileText, Plus, Edit, Trash2, Eye, Search, Filter as FilterIcon, ArrowDownUp,
    DollarSign, TrendingUp, AlertCircle, X, Check, UploadCloud, Download, BrainCircuit, ChevronDown, ChevronUp, Calendar, Users, BarChart2, PieChart as PieChartIcon, Settings, LogOut, LayoutDashboard
} from 'lucide-react';

// Types
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
    clientAddress: string;
    invoiceDate: string;
    dueDate: string;
    items: InvoiceItem[];
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
    notes?: string;
    taxRate: number; // Percentage, e.g., 0.1 for 10%
    createdAt: string;
    updatedAt: string;
}

type AppView = 'dashboard' | 'invoices';
type ModalType = 'addInvoice' | 'editInvoice' | 'viewInvoice' | 'aiHelper' | null;
type SortKey = keyof Invoice | 'totalAmount';
interface SortConfig {
    key: SortKey;
    direction: 'asc' | 'desc';
}

const APP_VERSION = '1.0.0';
const LOCAL_STORAGE_KEYS = {
    INVOICES: 'finance_invoices_data',
    DARK_MODE: 'finance_dark_mode',
    APP_VIEW: 'finance_app_view'
};

const initialInvoiceFormValues: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'items'> & { items: Omit<InvoiceItem, 'id'>[] } = {
    invoiceNumber: '',
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0.1, // Default 10% tax
    notes: '',
};

// Helper Functions
const generateId = () => crypto.randomUUID();

const calculateItemTotal = (item: InvoiceItem) => item.quantity * item.unitPrice;
const calculateSubTotal = (items: InvoiceItem[]) => items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
const calculateTaxAmount = (subTotal: number, taxRate: number) => subTotal * taxRate;
const calculateTotalAmount = (items: InvoiceItem[], taxRate: number) => {
    const subTotal = calculateSubTotal(items);
    const taxAmount = calculateTaxAmount(subTotal, taxRate);
    return subTotal + taxAmount;
};

const App: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
        return savedMode ? JSON.parse(savedMode) : window.matchMedia('(prefers-color-scheme: dark)').matches;
    });
    const [currentView, setCurrentView] = useState<AppView>(() => 
        (localStorage.getItem(LOCAL_STORAGE_KEYS.APP_VIEW) as AppView) || 'dashboard'
    );
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [modalOpen, setModalOpen] = useState<ModalType>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<Invoice['status'] | 'All'>('All');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'invoiceDate', direction: 'desc' });

    const [appIsLoading, setAppIsLoading] = useState<boolean>(true);
    const [appError, setAppError] = useState<string | null>(null);

    // AI Layer State
    const aiLayerRef = useRef<AILayerHandle>(null);
    const [aiPromptText, setAiPromptText] = useState<string>('');
    const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [aiIsLoading, setAiIsLoading] = useState<boolean>(false);
    const [aiError, setAiError] = useState<any | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    type InvoiceFormData = Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'items'> & { items: InvoiceItem[]; status?: Invoice['status'] };

    const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<InvoiceFormData>({
        defaultValues: initialInvoiceFormValues
    });
    const watchedItems = watch('items');
    const watchedTaxRate = watch('taxRate');


    // Effects
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    useEffect(() => {
        try {
            setAppIsLoading(true);
            const storedInvoices = localStorage.getItem(LOCAL_STORAGE_KEYS.INVOICES);
            if (storedInvoices) {
                const parsedInvoices = JSON.parse(storedInvoices) as Array<Omit<Invoice, 'status'> & { status: string; id: string; [key: string]: any }>;
                const validInvoiceStatuses: ReadonlyArray<Invoice['status']> = ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'];
                
                const typedInvoices: Invoice[] = parsedInvoices.map(inv => {
                    let finalStatus: Invoice['status'] = 'Draft'; // Default status

                    if (validInvoiceStatuses.includes(inv.status as Invoice['status'])) {
                        finalStatus = inv.status as Invoice['status'];
                    } else {
                        if (inv.status !== undefined && inv.status !== null) {
                           console.warn(`Invalid status "${inv.status}" for invoice ID ${inv.id || 'unknown'}. Defaulting to 'Draft'.`);
                        }
                        // finalStatus remains 'Draft'
                    }
                    // Reconstruct the invoice object to ensure it matches the Invoice interface
                    return {
                        id: inv.id,
                        invoiceNumber: inv.invoiceNumber,
                        clientName: inv.clientName,
                        clientEmail: inv.clientEmail,
                        clientAddress: inv.clientAddress,
                        invoiceDate: inv.invoiceDate,
                        dueDate: inv.dueDate,
                        items: inv.items.map((item: any) => ({
                            id: item.id || generateId(),
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice
                        })),
                        status: finalStatus,
                        notes: inv.notes,
                        taxRate: inv.taxRate,
                        createdAt: inv.createdAt,
                        updatedAt: inv.updatedAt,
                    } as Invoice; // Assert as Invoice after ensuring all fields align
                });
                setInvoices(typedInvoices);
            } else {
                // Add sample data if no data exists
                setInvoices([
                    {
                        id: generateId(), invoiceNumber: 'INV-2024-001', clientName: 'Tech Solutions Inc.', clientEmail: 'billing@techsolutions.com', clientAddress: '123 Tech Park, Silicon Valley, CA', invoiceDate: '2024-07-15', dueDate: '2024-08-14', 
                        items: [{ id: generateId(), description: 'Consulting Services', quantity: 10, unitPrice: 150 }], taxRate: 0.08, status: 'Paid', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    },
                    {
                        id: generateId(), invoiceNumber: 'INV-2024-002', clientName: 'Creative Designs LLC', clientEmail: 'accounts@creativedesigns.com', clientAddress: '456 Art Lane, New York, NY', invoiceDate: '2024-07-20', dueDate: '2024-08-19', 
                        items: [{ id: generateId(), description: 'Website Design Package', quantity: 1, unitPrice: 2500 }], taxRate: 0.10, status: 'Sent', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    },
                    {
                        id: generateId(), invoiceNumber: 'INV-2024-003', clientName: 'Global Corp', clientEmail: 'finance@globalcorp.com', clientAddress: '789 Business Hub, London, UK', invoiceDate: '2024-06-01', dueDate: '2024-06-30', 
                        items: [{ id: generateId(), description: 'Software License', quantity: 5, unitPrice: 500 }], taxRate: 0.05, status: 'Overdue', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                    },
                ]);
            }
        } catch (error) {
            console.error("Failed to load invoices from local storage:", error);
            setAppError("Failed to load data. Please try refreshing.");
            setInvoices([]); // Fallback to empty array
        }
        setAppIsLoading(false);
    }, []);

    useEffect(() => {
        if (!appIsLoading) { // Avoid saving initial empty/default state before loading
            localStorage.setItem(LOCAL_STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
        }
    }, [invoices, appIsLoading]);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.APP_VIEW, currentView);
    }, [currentView]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // CRUD Operations
    const addInvoice = (data: Omit<InvoiceFormData, 'status'>) => { // Status is not part of add form data initially
        const newInvoice: Invoice = {
            ...data,
            id: generateId(),
            items: data.items.map(item => ({ ...item, id: generateId() })),
            status: 'Draft', // Default status for new invoices
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setInvoices(prev => [newInvoice, ...prev]);
    };

    const updateInvoice = (id: string, data: InvoiceFormData) => {
        setInvoices(prev => prev.map(inv => inv.id === id ? {
            ...inv, // Spread existing invoice to retain fields like createdAt
            ...data, // Spread form data, which includes status if edited
            items: data.items.map(item => ({ ...item, id: item.id || generateId() })),
            updatedAt: new Date().toISOString()
        } as Invoice : inv)); 
    };

    const deleteInvoice = (id: string) => {
        if (window.confirm("Are you sure you want to delete this invoice?")) {
            setInvoices(prev => prev.filter(inv => inv.id !== id));
        }
    };

    const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
        setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status, updatedAt: new Date().toISOString() } : inv));
    };

    // Modal Management
    const openModal = (type: ModalType, invoice?: Invoice) => {
        setModalOpen(type);
        if ((type === 'editInvoice' || type === 'viewInvoice') && invoice) {
            setSelectedInvoice(invoice);
            reset({
                ...invoice, 
                invoiceDate: format(parseISO(invoice.invoiceDate), 'yyyy-MM-dd'),
                dueDate: format(parseISO(invoice.dueDate), 'yyyy-MM-dd'),
                status: invoice.status // Ensure status is part of the form data for editing
            });
        } else if (type === 'addInvoice') {
            setSelectedInvoice(null);
            reset(initialInvoiceFormValues);
        }
        if (type !== 'aiHelper') {
            setAiResult(null); setAiError(null); setAiSelectedFile(null);
        }
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        setModalOpen(null);
        setSelectedInvoice(null);
        reset(initialInvoiceFormValues);
        setAiResult(null); setAiError(null); setAiSelectedFile(null);
        document.body.classList.remove('modal-open');
    };

    // Form Submission
    const onInvoiceFormSubmit: SubmitHandler<InvoiceFormData> = (data) => {
        if (selectedInvoice && modalOpen === 'editInvoice') {
            updateInvoice(selectedInvoice.id, data);
        } else {
            addInvoice(data as Omit<InvoiceFormData, 'status'>); // Cast because addInvoice expects no status initially
        }
        closeModal();
    };

    // AI Related Functions
    const handleAiFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setAiSelectedFile(event.target.files[0]);
            setAiResult(null); 
            setAiError(null);
        }
    };

    const handleExtractInvoiceData = () => {
        if (!aiSelectedFile) {
            setAiError("Please select a file to extract data from.");
            return;
        }
        const specificPrompt = `Extract invoice details from this document. Provide clientName (string), invoiceNumber (string), invoiceDate (string, YYYY-MM-DD format), dueDate (string, YYYY-MM-DD format), items (array of objects, each with description (string), quantity (number), unitPrice (number)), taxRate (number, e.g., 0.1 for 10%), and notes (string, optional). Respond strictly in JSON format. If a field is not found, omit it or set to null. Ensure dates are valid. Example item: { "description": "Product A", "quantity": 2, "unitPrice": 50.00 }.`;
        setAiPromptText(specificPrompt);
        setAiResult(null); 
        setAiError(null);
        setTimeout(() => { 
            aiLayerRef.current?.sendToAI();
        }, 0);
    };

    useEffect(() => {
        if (aiResult && modalOpen === 'aiHelper') {
            try {
                const parsedData = JSON.parse(aiResult);
                if (parsedData.invoiceNumber) setValue('invoiceNumber', parsedData.invoiceNumber);
                if (parsedData.clientName) setValue('clientName', parsedData.clientName);
                if (parsedData.clientEmail) setValue('clientEmail', parsedData.clientEmail || '');
                if (parsedData.clientAddress) setValue('clientAddress', parsedData.clientAddress || '');
                if (parsedData.invoiceDate) setValue('invoiceDate', format(parseISO(parsedData.invoiceDate), 'yyyy-MM-dd'));
                if (parsedData.dueDate) setValue('dueDate', format(parseISO(parsedData.dueDate), 'yyyy-MM-dd'));
                if (parsedData.items && Array.isArray(parsedData.items)) {
                    setValue('items', parsedData.items.map((item: any) => ({
                        description: item.description || '',
                        quantity: Number(item.quantity) || 1,
                        unitPrice: Number(item.unitPrice) || 0,
                        id: generateId() // New items from AI don't have existing IDs
                    })));
                }
                if (typeof parsedData.taxRate === 'number') setValue('taxRate', parsedData.taxRate);
                if (parsedData.notes) setValue('notes', parsedData.notes);
                // Do not prefill status from AI, user should set it or it defaults for new invoices.
                setModalOpen(selectedInvoice ? 'editInvoice' : 'addInvoice');
                alert('Invoice data extracted and pre-filled. Please review and save.');
            } catch (e) {
                console.error("Error parsing AI result:", e);
                setAiError("Failed to parse extracted data. The AI response might not be in the expected JSON format.");
            }
        }
    }, [aiResult, setValue, modalOpen, selectedInvoice]);

    // Filtering and Sorting Logic
    const filteredInvoices = useMemo(() => {
        return invoices
            .filter(invoice => {
                const searchTermLower = searchTerm.toLowerCase();
                const matchesSearch = 
                    invoice.invoiceNumber.toLowerCase().includes(searchTermLower) ||
                    invoice.clientName.toLowerCase().includes(searchTermLower) ||
                    invoice.clientEmail.toLowerCase().includes(searchTermLower);
                const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
                return matchesSearch && matchesStatus;
            })
            .map(invoice => {
                if (invoice.status === 'Sent' && differenceInDays(new Date(), parseISO(invoice.dueDate)) > 0) {
                    // Create a new object to avoid mutating state directly if `invoices` elements were shared refs
                    return { ...invoice, status: 'Overdue' as Invoice['status'] }; 
                }
                return invoice;
            });
    }, [invoices, searchTerm, statusFilter]);

    const sortedInvoices: Invoice[] = useMemo(() => {
        if (!sortConfig) return filteredInvoices;
        return [...filteredInvoices].sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'totalAmount') {
                aValue = calculateTotalAmount(a.items, a.taxRate);
                bValue = calculateTotalAmount(b.items, b.taxRate);
            } else {
                aValue = a[sortConfig.key as keyof Invoice];
                bValue = b[sortConfig.key as keyof Invoice];
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                if (sortConfig.key === 'invoiceDate' || sortConfig.key === 'dueDate') {
                    return sortConfig.direction === 'asc' ? 
                           new Date(aValue).getTime() - new Date(bValue).getTime() :
                           new Date(bValue).getTime() - new Date(aValue).getTime();
                }
                return sortConfig.direction === 'asc' ? 
                       aValue.localeCompare(bValue) : 
                       bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
    }, [filteredInvoices, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // CSV Template Download
    const downloadCSVTemplate = () => {
        const headers = ['InvoiceNumber', 'ClientName', 'ClientEmail', 'ClientAddress', 'InvoiceDate (YYYY-MM-DD)', 'DueDate (YYYY-MM-DD)', 'ItemDescription', 'ItemQuantity', 'ItemUnitPrice', 'TaxRate (e.g., 0.1 for 10%)', 'Notes'];
        const exampleRow = ['INV-2024-DEMO', 'Sample Client', 'client@example.com', '123 Sample St', format(new Date(), 'yyyy-MM-dd'), format(addDays(new Date(), 30), 'yyyy-MM-dd'), 'Sample Service', '1', '100', '0.1', 'Sample notes'];
        const csvContent = [
            headers.join(','),
            exampleRow.join(',')
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'invoice_template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Dashboard Data
    const dashboardStats = useMemo(() => {
        const totalInvoices = invoices.length;
        const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
        const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue' || (inv.status === 'Sent' && differenceInDays(new Date(), parseISO(inv.dueDate)) > 0));
        const totalRevenue = paidInvoices.reduce((sum, inv) => sum + calculateTotalAmount(inv.items, inv.taxRate), 0);
        const outstandingAmount = invoices
            .filter(inv => inv.status === 'Sent' || inv.status === 'Overdue')
            .reduce((sum, inv) => sum + calculateTotalAmount(inv.items, inv.taxRate), 0);

        return {
            totalInvoices,
            paidCount: paidInvoices.length,
            overdueCount: overdueInvoices.length,
            totalRevenue,
            outstandingAmount
        };
    }, [invoices]);

    const invoiceStatusData = useMemo(() => {
        const statuses: { [key in Invoice['status']]?: number } = {};
        invoices.forEach(inv => {
            const currentStatus = (inv.status === 'Sent' && differenceInDays(new Date(), parseISO(inv.dueDate)) > 0) ? 'Overdue' : inv.status;
            statuses[currentStatus] = (statuses[currentStatus] || 0) + 1;
        });
        return Object.entries(statuses).map(([name, value]) => ({ name: name as Invoice['status'], value }));
    }, [invoices]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    const CustomTooltipContent = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-700 p-2 border border-gray-300 dark:border-slate-600 rounded shadow-lg">
                    <p className="label text-sm font-semibold">{`${label} : ${payload[0].value}`}</p>
                    {payload[0].payload.description && <p className="intro text-xs">{payload[0].payload.description}</p>}
                </div>
            );
        }
        return null;
    };

    if (appIsLoading) {
        return (
            <div className="flex-center h-screen bg-gray-100 dark:bg-slate-900">
                <div className="text-xl font-semibold text-gray-700 dark:text-slate-300">Loading Invoice System...</div>
            </div>
        );
    }

    if (appError) {
        return (
            <div className="flex-center h-screen bg-red-50 dark:bg-red-900 p-4">
                <div className="alert alert-error">
                    <AlertCircle className="h-6 w-6" />
                    <p>{appError}</p>
                </div>
            </div>
        );
    }
    
    const currentFormSubTotal = calculateSubTotal(watchedItems || []);
    const currentFormTaxAmount = calculateTaxAmount(currentFormSubTotal, watchedTaxRate || 0);
    const currentFormTotalAmount = currentFormSubTotal + currentFormTaxAmount;

    return (
        <div className={`flex flex-col min-h-screen theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
            <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition">
                <div className="container-wide mx-auto px-4 py-3 flex-between">
                    <div className="flex-start gap-2">
                        <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Invoice Management</h1>
                    </div>
                    <div className="flex-start gap-4">
                        <button 
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors" 
                            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDarkMode ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-slate-600" />}
                        </button>
                         <button className="btn btn-sm bg-slate-600 text-white hover:bg-slate-700 responsive-hide">
                            <LogOut size={16} className="mr-1" /> Sign Out (Demo)
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 theme-transition-bg bg-gray-50 dark:bg-slate-900">
                <nav className="w-16 md:w-56 bg-white dark:bg-slate-800 p-4 space-y-2 shadow-lg theme-transition no-print">
                    {[ 
                        { view: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { view: 'invoices', label: 'Invoices', icon: FileText },
                    ].map(item => (
                        <button
                            key={item.view}
                            onClick={() => setCurrentView(item.view as AppView)}
                            title={item.label}
                            className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors 
                                        ${currentView === item.view 
                                            ? 'bg-primary-500 text-white dark:bg-primary-600' 
                                            : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}
                                        md:px-3 md:py-2`}
                        >
                            <item.icon size={20} />
                            <span className="hidden md:inline">{item.label}</span>
                        </button>
                    ))}
                     <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                        <button title="Settings" className={`w-full flex items-center gap-3 p-2 rounded-md text-sm font-medium transition-colors text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 md:px-3 md:py-2`}>
                            <Settings size={20} /> 
                            <span className="hidden md:inline">Settings</span>
                        </button>
                    </div>
                </nav>

                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    {currentView === 'dashboard' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">Dashboard</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="stat-card"><div className="stat-title">Total Revenue</div><div className="stat-value">${dashboardStats.totalRevenue.toLocaleString()}</div><Users className="absolute top-4 right-4 text-gray-300 dark:text-slate-600" size={24}/></div>
                                <div className="stat-card"><div className="stat-title">Outstanding Amount</div><div className="stat-value">${dashboardStats.outstandingAmount.toLocaleString()}</div><AlertCircle className="absolute top-4 right-4 text-yellow-400 dark:text-yellow-500" size={24}/></div>
                                <div className="stat-card"><div className="stat-title">Paid Invoices</div><div className="stat-value">{dashboardStats.paidCount}</div><Check className="absolute top-4 right-4 text-green-500 dark:text-green-600" size={24}/></div>
                                <div className="stat-card"><div className="stat-title">Overdue Invoices</div><div className="stat-value">{dashboardStats.overdueCount}</div><TrendingUp className="absolute top-4 right-4 text-red-500 dark:text-red-600" size={24}/></div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="card h-96">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"><PieChartIcon size={20}/> Invoice Status Distribution</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RechartsPieChart>
                                            <Pie data={invoiceStatusData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={80} label fill="#8884d8">
                                                {invoiceStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltipContent />} />
                                            <Legend />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="card h-96">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BarChart2 size={20}/> Monthly Revenue (Placeholder)</h3>
                                     <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[{name: 'Jan', revenue: 4000}, {name: 'Feb', revenue: 3000}, {name: 'Mar', revenue: 5000}]} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700"/>
                                            <XAxis dataKey="name" className="text-xs dark:fill-slate-300"/>
                                            <YAxis className="text-xs dark:fill-slate-300"/>
                                            <Tooltip content={<CustomTooltipContent />} wrapperClassName="rounded-md shadow-lg" />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="var(--color-primary-500, #3B82F6)" className="dark:fill-primary-400" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}
                    {currentView === 'invoices' && (
                        <div className="space-y-6">
                            <div className="flex-between flex-wrap gap-4">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-slate-100">Manage Invoices</h2>
                                <div className="flex gap-2 flex-wrap">
                                    <button onClick={downloadCSVTemplate} className="btn bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1 btn-responsive">
                                        <Download size={16} /> Template
                                    </button>
                                    <button onClick={() => openModal('addInvoice')} className="btn btn-primary flex items-center gap-1 btn-responsive">
                                        <Plus size={16} /> New Invoice
                                    </button>
                                </div>
                            </div>
                            <div className="card card-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                    <div className="form-group">
                                        <label htmlFor="search" className="form-label">Search Invoices</label>
                                        <div className="relative">
                                            <input id="search" type="text" placeholder="Search by Inv #, Client Name, Email" className="input pl-10 input-responsive" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"/>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
                                        <select id="statusFilter" className="input input-responsive" value={statusFilter} onChange={e => setStatusFilter(e.target.value as Invoice['status'] | 'All')}>
                                            <option value="All">All Statuses</option>
                                            {['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="dateRange" className="form-label">Date Range (Upcoming)</label>
                                        <input id="dateRange" type="text" placeholder="Select date range" className="input input-responsive" disabled />
                                    </div>
                                </div>
                            </div>
                            <div className="table-container">
                                <table className="table">
                                    <thead className="table-header">
                                        <tr>
                                            {[
                                                { key: 'invoiceNumber', label: 'Invoice #' },
                                                { key: 'clientName', label: 'Client' },
                                                { key: 'invoiceDate', label: 'Issued' },
                                                { key: 'dueDate', label: 'Due Date' },
                                                { key: 'totalAmount', label: 'Total' },
                                                { key: 'status', label: 'Status' },
                                                { key: 'actions', label: 'Actions', sortable: false },
                                            ].map(col => (
                                                <th key={col.key} className="table-cell px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => col.sortable !== false && requestSort(col.key as SortKey)}>
                                                    <div className="flex items-center gap-1">
                                                        {col.label}
                                                        {col.sortable !== false && sortConfig?.key === col.key && (sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                                                        {col.sortable !== false && sortConfig?.key !== col.key && <ArrowDownUp size={14} className="text-gray-400"/>}
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                        {sortedInvoices.length > 0 ? sortedInvoices.map(invoice => (
                                            <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors">
                                                <td className="table-cell px-4 py-3 font-medium text-primary-600 dark:text-primary-400">{invoice.invoiceNumber}</td>
                                                <td className="table-cell px-4 py-3">
                                                    <div>{invoice.clientName}</div>
                                                    <div className="text-xs text-gray-500 dark:text-slate-400">{invoice.clientEmail}</div>
                                                </td>
                                                <td className="table-cell px-4 py-3">{format(parseISO(invoice.invoiceDate), 'MMM dd, yyyy')}</td>
                                                <td className="table-cell px-4 py-3">{format(parseISO(invoice.dueDate), 'MMM dd, yyyy')}</td>
                                                <td className="table-cell px-4 py-3 font-semibold">${calculateTotalAmount(invoice.items, invoice.taxRate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                <td className="table-cell px-4 py-3">
                                                    <span className={`badge 
                                                        ${invoice.status === 'Paid' ? 'badge-success' : 
                                                         invoice.status === 'Overdue' ? 'badge-error' : 
                                                         invoice.status === 'Sent' ? 'badge-info' : 
                                                         invoice.status === 'Draft' ? 'badge-warning' : 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200'}
                                                    `}>{invoice.status}</span>
                                                </td>
                                                <td className="table-cell px-4 py-3 space-x-1">
                                                    <button onClick={() => openModal('viewInvoice', invoice)} title="View Invoice" className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-900"><Eye size={18}/></button>
                                                    <button onClick={() => openModal('editInvoice', invoice)} title="Edit Invoice" className="p-1.5 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900"><Edit size={18}/></button>
                                                    <button onClick={() => deleteInvoice(invoice.id)} title="Delete Invoice" className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded hover:bg-red-100 dark:hover:bg-red-900"><Trash2 size={18}/></button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={7} className="table-cell text-center py-10 text-gray-500 dark:text-slate-400">No invoices found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {sortedInvoices.length > 10 && (
                                <div className="flex-center mt-4">
                                    <p className="text-sm text-gray-600 dark:text-slate-400">Pagination (placeholder)</p>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {modalOpen && (
                <div className="modal-backdrop theme-transition-all" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                    <div className={`modal-content theme-transition-all ${modalOpen === 'viewInvoice' ? 'max-w-2xl' : 'max-w-3xl'} ${styles.modalScrollable}`} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 id="modal-title" className="text-xl font-semibold text-gray-800 dark:text-slate-100">
                                {modalOpen === 'addInvoice' && 'Create New Invoice'}
                                {modalOpen === 'editInvoice' && 'Edit Invoice'}
                                {modalOpen === 'viewInvoice' && `Invoice Details: ${selectedInvoice?.invoiceNumber}`}
                                {modalOpen === 'aiHelper' && 'Extract Data with AI'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors" aria-label="Close modal">
                                <X size={24}/>
                            </button>
                        </div>

                        {modalOpen === 'aiHelper' ? (
                            <div className="mt-4 space-y-4">
                                <div className="form-group">
                                    <label htmlFor="aiFile" className="form-label">Upload Invoice Document (Image/PDF)</label>
                                    <input type="file" id="aiFile" accept="image/*,application/pdf" onChange={handleAiFileChange} ref={fileInputRef} className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-slate-700 dark:file:text-slate-200 dark:hover:file:bg-slate-600"/>
                                    {aiSelectedFile && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Selected: {aiSelectedFile.name}</p>}
                                </div>
                                {aiIsLoading && <p className="text-sm text-blue-600 dark:text-blue-400">Extracting data, please wait...</p>}
                                {aiError && <p className="form-error">Error: {typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>}
                                {aiResult && <div className="form-group"><label className="form-label">AI Raw Result:</label><textarea readOnly value={aiResult} className="input h-32 text-xs"/></div>}
                                <button onClick={handleExtractInvoiceData} disabled={!aiSelectedFile || aiIsLoading} className="btn btn-primary w-full flex-center gap-2">
                                    {aiIsLoading ? 'Processing...' : <><BrainCircuit size={18}/> Extract Data</>}
                                </button>
                            </div>
                        ) : modalOpen === 'viewInvoice' && selectedInvoice ? (
                            <div className={`mt-4 space-y-4 prose dark:prose-invert max-w-none ${styles.invoicePrintArea}`} id="invoice-to-print">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <h4 className="font-semibold">From:</h4>
                                        <p>Datavtar Finance Team<br/>123 Datavtar Avenue<br/>Innovation City, DC 12345</p>
                                    </div>
                                    <div className="text-right">
                                        <h4 className="font-semibold">To:</h4>
                                        <p>{selectedInvoice.clientName}<br/>{selectedInvoice.clientAddress}<br/>{selectedInvoice.clientEmail}</p>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-6 pb-2 border-b dark:border-slate-600">
                                    <div>
                                        <p><strong>Invoice Date:</strong> {format(parseISO(selectedInvoice.invoiceDate), 'MMMM dd, yyyy')}</p>
                                        <p><strong>Due Date:</strong> {format(parseISO(selectedInvoice.dueDate), 'MMMM dd, yyyy')}</p>
                                    </div>
                                    <p className={`text-2xl font-bold px-3 py-1 rounded 
                                        ${selectedInvoice.status === 'Paid' ? 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-800' : 
                                         selectedInvoice.status === 'Overdue' ? 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-800' : 
                                         'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-800'}`}>{selectedInvoice.status}
                                    </p>
                                </div>
                                <table className="w-full mb-6">
                                    <thead className="bg-gray-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="p-2 text-left font-semibold">Description</th>
                                            <th className="p-2 text-right font-semibold">Quantity</th>
                                            <th className="p-2 text-right font-semibold">Unit Price</th>
                                            <th className="p-2 text-right font-semibold">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map(item => (
                                            <tr key={item.id} className="border-b dark:border-slate-600">
                                                <td className="p-2">{item.description}</td>
                                                <td className="p-2 text-right">{item.quantity}</td>
                                                <td className="p-2 text-right">${item.unitPrice.toFixed(2)}</td>
                                                <td className="p-2 text-right">${calculateItemTotal(item).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="grid grid-cols-2 gap-4 text-right mb-6">
                                    <div></div>
                                    <div>
                                        <p><strong>Subtotal:</strong> ${calculateSubTotal(selectedInvoice.items).toFixed(2)}</p>
                                        <p><strong>Tax ({selectedInvoice.taxRate * 100}%):</strong> ${calculateTaxAmount(calculateSubTotal(selectedInvoice.items), selectedInvoice.taxRate).toFixed(2)}</p>
                                        <p className="text-xl font-bold"><strong>Total:</strong> ${calculateTotalAmount(selectedInvoice.items, selectedInvoice.taxRate).toFixed(2)}</p>
                                    </div>
                                </div>
                                {selectedInvoice.notes && (
                                    <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded">
                                        <h4 className="font-semibold">Notes:</h4>
                                        <p>{selectedInvoice.notes}</p>
                                    </div>
                                )}
                                <div className="modal-footer mt-6 no-print">
                                    <button onClick={() => window.print()} className="btn bg-gray-500 text-white hover:bg-gray-600">Print</button>
                                    {selectedInvoice.status === 'Draft' && <button onClick={() => {updateInvoiceStatus(selectedInvoice.id, 'Sent'); closeModal();}} className="btn btn-info">Mark as Sent</button>}
                                    {selectedInvoice.status === 'Sent' && <button onClick={() => {updateInvoiceStatus(selectedInvoice.id, 'Paid'); closeModal();}} className="btn btn-success">Mark as Paid</button>}
                                    <button onClick={closeModal} className="btn btn-secondary">Close</button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onInvoiceFormSubmit)} className="mt-4 space-y-4">
                                <div className="flex justify-end">
                                     <button type="button" onClick={() => openModal('aiHelper')} className="btn btn-sm bg-teal-500 hover:bg-teal-600 text-white flex items-center gap-1">
                                        <BrainCircuit size={16}/> AI Extract
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="invoiceNumber" className="form-label">Invoice Number</label>
                                        <input id="invoiceNumber" {...register('invoiceNumber', { required: 'Invoice number is required' })} className={`input ${errors.invoiceNumber ? 'border-red-500' : ''}`} />
                                        {errors.invoiceNumber && <p className="form-error">{errors.invoiceNumber.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="clientName" className="form-label">Client Name</label>
                                        <input id="clientName" {...register('clientName', { required: 'Client name is required' })} className={`input ${errors.clientName ? 'border-red-500' : ''}`} />
                                        {errors.clientName && <p className="form-error">{errors.clientName.message}</p>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="clientEmail" className="form-label">Client Email</label>
                                        <input id="clientEmail" type="email" {...register('clientEmail', { pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' }})} className={`input ${errors.clientEmail ? 'border-red-500' : ''}`} />
                                        {errors.clientEmail && <p className="form-error">{errors.clientEmail.message}</p>}
                                    </div>
                                     <div className="form-group">
                                        <label htmlFor="clientAddress" className="form-label">Client Address</label>
                                        <textarea id="clientAddress" {...register('clientAddress')} rows={2} className="input" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label htmlFor="invoiceDate" className="form-label">Invoice Date</label>
                                        <input id="invoiceDate" type="date" {...register('invoiceDate', { required: 'Invoice date is required' })} className={`input ${errors.invoiceDate ? 'border-red-500' : ''}`} />
                                        {errors.invoiceDate && <p className="form-error">{errors.invoiceDate.message}</p>}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="dueDate" className="form-label">Due Date</label>
                                        <input id="dueDate" type="date" {...register('dueDate', { required: 'Due date is required' })} className={`input ${errors.dueDate ? 'border-red-500' : ''}`} />
                                        {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
                                    </div>
                                </div>
                                
                                <h4 className="text-md font-semibold pt-2 border-t dark:border-slate-700">Invoice Items</h4>
                                <Controller
                                    control={control}
                                    name="items"
                                    rules={{ validate: items => (items && items.length > 0) || 'At least one item is required'}}
                                    render={({ field: { onChange, value = [] } }) => (
                                        <div className="space-y-3">
                                            {value.map((item, index) => (
                                                <div key={(item as any).id || index} className="grid grid-cols-12 gap-2 items-center p-2 border dark:border-slate-700 rounded">
                                                    <div className="col-span-12 md:col-span-5 form-group">
                                                        {index === 0 && <label className="form-label text-xs">Description</label>}
                                                        <input {...register(`items.${index}.description`, { required: true })} placeholder="Item description" className="input input-sm" />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2 form-group">
                                                        {index === 0 && <label className="form-label text-xs">Qty</label>}
                                                        <input type="number" {...register(`items.${index}.quantity`, { required: true, valueAsNumber: true, min: 1 })} placeholder="1" className="input input-sm" />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2 form-group">
                                                        {index === 0 && <label className="form-label text-xs">Price</label>}
                                                        <input type="number" step="0.01" {...register(`items.${index}.unitPrice`, { required: true, valueAsNumber: true, min: 0 })} placeholder="0.00" className="input input-sm" />
                                                    </div>
                                                    <div className="col-span-4 md:col-span-2 form-group">
                                                        {index === 0 && <label className="form-label text-xs">Total</label>}
                                                        <input type="text" readOnly value={`$${( (item.quantity || 0) * (item.unitPrice || 0) ).toFixed(2)}`} className="input input-sm bg-gray-100 dark:bg-slate-700" />
                                                    </div>
                                                    <div className="col-span-12 md:col-span-1 flex justify-end">
                                                        {value.length > 1 && <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={18}/></button>}
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => onChange([...value, { description: '', quantity: 1, unitPrice: 0, id: generateId() }])} className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex items-center gap-1">
                                                <Plus size={16}/> Add Item
                                            </button>
                                            {errors.items && <p className="form-error">{errors.items.message || (errors.items as any)?.root?.message}</p>}
                                        </div>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t dark:border-slate-700">
                                     <div className="form-group">
                                        <label htmlFor="taxRate" className="form-label">Tax Rate (%)</label>
                                        <input id="taxRate" type="number" step="0.01" {...register('taxRate', { valueAsNumber: true, min: 0, max: 1 })} className="input" placeholder="e.g. 0.1 for 10%"/>
                                    </div>
                                    <div className="form-group text-right md:pt-6">
                                        <p className="text-sm">Subtotal: <span className="font-semibold">${currentFormSubTotal.toFixed(2)}</span></p>
                                        <p className="text-sm">Tax: <span className="font-semibold">${currentFormTaxAmount.toFixed(2)}</span></p>
                                        <p className="text-lg font-bold">Total: <span className="font-semibold">${currentFormTotalAmount.toFixed(2)}</span></p>
                                    </div>
                                </div>
                                 <div className="form-group">
                                    <label htmlFor="notes" className="form-label">Notes</label>
                                    <textarea id="notes" {...register('notes')} rows={3} className="input" />
                                </div>
                                {modalOpen === 'editInvoice' && selectedInvoice && (
                                    <div className="form-group">
                                        <label htmlFor="status" className="form-label">Status</label>
                                        <Controller
                                            name="status"
                                            control={control}
                                            defaultValue={selectedInvoice.status} // This should be Invoice['status']
                                            render={({ field }) => (
                                                <select {...field} id="status" className="input">
                                                    {['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            )}
                                        />
                                    </div>
                                )}
                                <div className="modal-footer">
                                    <button type="button" onClick={closeModal} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Cancel</button>
                                    <button type="submit" className="btn btn-primary">{selectedInvoice ? 'Save Changes' : 'Create Invoice'}</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <AILayer
                ref={aiLayerRef}
                prompt={aiPromptText} 
                attachment={aiSelectedFile || undefined}
                onResult={(apiResult) => setAiResult(apiResult)}
                onError={(apiError) => setAiError(apiError)}
                onLoading={(loadingStatus) => setAiIsLoading(loadingStatus)}
            />

            <footer className="bg-slate-100 dark:bg-slate-800 text-center py-4 border-t border-gray-200 dark:border-slate-700 theme-transition no-print">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                    Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved. (Invoice System v{APP_VERSION})
                </p>
            </footer>
        </div>
    );
};

export default App;
