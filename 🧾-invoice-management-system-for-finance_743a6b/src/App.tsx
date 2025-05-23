import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell as RechartsCell } from 'recharts';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { format, parseISO, isPast, differenceInDays } from 'date-fns';
import AILayer from './components/AILayer'; // Assumed to exist
import { AILayerHandle } from './components/AILayer.types'; // Assumed to exist
import {
    Sun, Moon, PlusCircle, Search as SearchIcon, Filter as FilterIcon, Edit3, Trash2, Eye, X, ChevronDown, ChevronsUpDown, AlertCircle, CheckCircle2, Download, Loader2, FileText, LayoutDashboard, Brain
} from 'lucide-react';

import styles from './styles/styles.module.css';

const APP_NAME = 'InvoiceMaster';
const LOCAL_STORAGE_KEY = `${APP_NAME}_invoices`;
const LOCAL_STORAGE_THEME_KEY = `${APP_NAME}_theme`;

type InvoiceItem = {
    id: string;
    description: string;
    quantity: number;
    price: number;
};

type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Partial';

interface Invoice {
    id: string;
    invoiceNumber: string;
    clientName: string;
    clientEmail: string;
    invoiceDate: string; // ISO string
    dueDate: string; // ISO string
    items: InvoiceItem[];
    totalAmount: number;
    status: InvoiceStatus;
}

type AppView = 'dashboard' | 'invoices' | 'addInvoice' | 'editInvoice';

interface SortConfig {
    key: keyof Invoice | 'totalAmount';
    direction: 'ascending' | 'descending';
}

const App: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [currentView, setCurrentView] = useState<AppView>('dashboard');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<'viewInvoice' | 'aiSummary' | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<InvoiceStatus | ''>('');
    const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        const savedMode = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
        return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });
    const [isLoading, setIsLoadingState] = useState(false);
    const [appError, setAppError] = useState<string | null>(null);

    // AI Layer State
    const aiLayerRef = useRef<AILayerHandle>(null);
    const [aiPromptText, setAiPromptText] = useState('');
    const [aiResult, setAiResult] = useState<string | null>(null);
    const [aiIsLoading, setAiIsLoading] = useState(false);
    const [aiError, setAiError] = useState<any | null>(null);

    const { register, handleSubmit, control, reset, formState: { errors }, setValue, watch } = useForm<Invoice>();
    const watchedItems = watch("items");

    useEffect(() => {
        const storedInvoices = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedInvoices) {
            setInvoices(JSON.parse(storedInvoices));
        } else {
            // Initialize with sample data if no data in localStorage
            setInvoices([
                {
                    id: '1', invoiceNumber: 'INV-2024-001', clientName: 'Acme Corp', clientEmail: 'contact@acme.com',
                    invoiceDate: new Date(2024, 5, 15).toISOString(), dueDate: new Date(2024, 6, 15).toISOString(),
                    items: [{ id: 'item1', description: 'Web Development', quantity: 10, price: 150 }],
                    totalAmount: 1500, status: 'Sent'
                },
                {
                    id: '2', invoiceNumber: 'INV-2024-002', clientName: 'Beta Solutions', clientEmail: 'info@beta.com',
                    invoiceDate: new Date(2024, 5, 20).toISOString(), dueDate: new Date(2024, 6, 5).toISOString(), // Overdue example
                    items: [{ id: 'item1', description: 'Consulting Hours', quantity: 5, price: 200 }],
                    totalAmount: 1000, status: 'Overdue'
                },
                {
                    id: '3', invoiceNumber: 'INV-2024-003', clientName: 'Gamma Inc.', clientEmail: 'support@gamma.com',
                    invoiceDate: new Date(2024, 6, 1).toISOString(), dueDate: new Date(2024, 6, 30).toISOString(),
                    items: [{ id: 'item1', description: 'Cloud Services', quantity: 1, price: 500 }],
                    totalAmount: 500, status: 'Paid'
                },
            ]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(invoices));
    }, [invoices]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem(LOCAL_STORAGE_THEME_KEY, 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem(LOCAL_STORAGE_THEME_KEY, 'false');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const calculatedTotal = watchedItems?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;
        setValue('totalAmount', calculatedTotal);
    }, [watchedItems, setValue]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const handleAddItem = () => {
        const currentItems = watch('items') || [];
        setValue('items', [...currentItems, { id: Date.now().toString(), description: '', quantity: 1, price: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        const currentItems = watch('items') || [];
        setValue('items', currentItems.filter((_, i) => i !== index));
    };

    const onSubmitInvoice: SubmitHandler<Invoice> = (data) => {
        setIsLoadingState(true);
        try {
            if (currentView === 'editInvoice' && selectedInvoice) {
                setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? { ...selectedInvoice, ...data } : inv));
            } else {
                const newInvoice: Invoice = {
                    ...data,
                    id: Date.now().toString(),
                    invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString().slice(-4)}`, // Auto-generate if empty
                };
                setInvoices([...invoices, newInvoice]);
            }
            reset();
            setCurrentView('invoices');
            setSelectedInvoice(null);
            setAppError(null);
        } catch (error) {
            setAppError('Failed to save invoice. Please try again.');
            console.error(error);
        } finally {
            setIsLoadingState(false);
        }
    };

    const handleDeleteInvoice = (id: string) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            setInvoices(invoices.filter(inv => inv.id !== id));
        }
    };

    const handleViewInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setModalContent('viewInvoice');
        setIsModalOpen(true);
        document.body.classList.add('modal-open');
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        reset(invoice); // Pre-fill form
        setCurrentView('editInvoice');
    };

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalContent(null);
        setSelectedInvoice(null);
        setAiResult(null);
        setAiError(null);
        document.body.classList.remove('modal-open');
    }, []);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeModal();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeModal]);

    const getStatusWithOverdueCheck = (invoice: Invoice): InvoiceStatus => {
        if (invoice.status === 'Paid') return 'Paid';
        if (isPast(parseISO(invoice.dueDate)) && invoice.status !== 'Paid') return 'Overdue';
        return invoice.status;
    };

    const filteredAndSortedInvoices = useMemo(() => {
        let processedInvoices = invoices.map(inv => ({ ...inv, status: getStatusWithOverdueCheck(inv) }));

        if (searchTerm) {
            processedInvoices = processedInvoices.filter(inv =>
                inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                inv.clientName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (filterStatus) {
            processedInvoices = processedInvoices.filter(inv => inv.status === filterStatus);
        }
        if (sortConfig !== null) {
            processedInvoices.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Invoice];
                const bValue = b[sortConfig.key as keyof Invoice];

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                return 0;
            });
        }
        return processedInvoices;
    }, [invoices, searchTerm, filterStatus, sortConfig]);

    const requestSort = (key: keyof Invoice | 'totalAmount') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key: keyof Invoice | 'totalAmount') => {
        if (!sortConfig || sortConfig.key !== key) return <ChevronsUpDown className="h-4 w-4 ml-1 inline-block" />;
        return sortConfig.direction === 'ascending' ? '▲' : '▼';
    };

    const invoiceStatusOptions: InvoiceStatus[] = ['Draft', 'Sent', 'Paid', 'Overdue', 'Partial'];
    const statusColors: Record<InvoiceStatus, string> = {
        Draft: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
        Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        Partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    };

    // Dashboard data
    const dashboardStats = useMemo(() => {
        const totalInvoices = invoices.length;
        const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
        const paidAmount = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
        const dueAmount = totalAmount - paidAmount;
        const overdueCount = filteredAndSortedInvoices.filter(inv => inv.status === 'Overdue').length;
        return { totalInvoices, totalAmount, paidAmount, dueAmount, overdueCount };
    }, [invoices, filteredAndSortedInvoices]);

    const invoiceStatusChartData = useMemo(() => {
        const counts: Record<InvoiceStatus, number> = { Draft: 0, Sent: 0, Paid: 0, Overdue: 0, Partial: 0 };
        filteredAndSortedInvoices.forEach(inv => {
            counts[inv.status] = (counts[inv.status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredAndSortedInvoices]);

    const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    // AI Functionality
    const handleSendInvoiceSummaryToAI = (invoice: Invoice) => {
        if (!invoice) return;
        const prompt = `Provide a concise summary for the following invoice, focusing on key details and any actions that might be apparent from the data.
Invoice Number: ${invoice.invoiceNumber}
Client: ${invoice.clientName}
Total Amount: $${invoice.totalAmount.toFixed(2)}
Due Date: ${format(parseISO(invoice.dueDate), 'PPP')}
Status: ${invoice.status}
Items:
${invoice.items.map(item => `- ${item.description} (Qty: ${item.quantity}, Price: $${item.price.toFixed(2)})`).join('\n')}

Respond in simple text, highlighting the most important information.`;
        setAiPromptText(prompt);
        setAiResult(null);
        setAiError(null);
        setSelectedInvoice(invoice);
        setModalContent('aiSummary');
        setIsModalOpen(true);
        document.body.classList.add('modal-open');
        // The actual call will happen once the modal is open and user clicks a button there, or automatically
        // For now, let's make it so that the modal opens, and a button there triggers sendToAI
    };

    const triggerAISummary = () => {
        if (!aiPromptText.trim()) {
            setAiError("Prompt is empty. Cannot send to AI.");
            return;
        }
        aiLayerRef.current?.sendToAI();
    };

    const downloadCSV = () => {
        const headers = ['Invoice #', 'Client Name', 'Client Email', 'Invoice Date', 'Due Date', 'Total Amount', 'Status', 'Items'];
        const rows = filteredAndSortedInvoices.map(inv => [
            inv.invoiceNumber,
            inv.clientName,
            inv.clientEmail,
            format(parseISO(inv.invoiceDate), 'yyyy-MM-dd'),
            format(parseISO(inv.dueDate), 'yyyy-MM-dd'),
            inv.totalAmount.toFixed(2),
            inv.status,
            inv.items.map(item => `${item.description} (Qty:${item.quantity} Price:${item.price})`).join('; ')
        ]);

        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "invoices_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render helpers
    const renderHeader = () => (
        <header className="bg-slate-100 dark:bg-slate-800 p-4 shadow-md theme-transition-all sticky top-0 z-[var(--z-sticky)]">
            <div className="container-wide flex-between">
                <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{APP_NAME}</h1>
                <nav className="flex items-center space-x-2 md:space-x-4">
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`btn-responsive ${currentView === 'dashboard' ? 'btn-primary' : 'bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        aria-current={currentView === 'dashboard' ? 'page' : undefined}
                    >
                        <LayoutDashboard size={18} className="inline-block mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </button>
                    <button
                        onClick={() => setCurrentView('invoices')}
                        className={`btn-responsive ${currentView === 'invoices' ? 'btn-primary' : 'bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                        aria-current={currentView === 'invoices' ? 'page' : undefined}
                    >
                        <FileText size={18} className="inline-block mr-1 md:mr-2" />
                        <span className="hidden sm:inline">Invoices</span>
                    </button>
                    <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700" aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}>
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                </nav>
            </div>
        </header>
    );

    const renderDashboard = () => (
        <div className="p-4 md:p-6 space-y-6 fade-in">
            <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[ 
                    { title: 'Total Invoices', value: dashboardStats.totalInvoices, desc: '' },
                    { title: 'Total Amount', value: `$${dashboardStats.totalAmount.toFixed(2)}`, desc: '' },
                    { title: 'Paid Amount', value: `$${dashboardStats.paidAmount.toFixed(2)}`, desc: `${((dashboardStats.paidAmount/dashboardStats.totalAmount)*100||0).toFixed(0)}% paid` },
                    { title: 'Due Amount', value: `$${dashboardStats.dueAmount.toFixed(2)}`, desc: `${dashboardStats.overdueCount} overdue` }
                ].map(stat => (
                    <div key={stat.title} className="stat-card theme-transition-all">
                        <div className="stat-title">{stat.title}</div>
                        <div className="stat-value">{stat.value}</div>
                        {stat.desc && <div className="stat-desc">{stat.desc}</div>}
                    </div>
                ))}
            </div>
            <div className="card theme-transition-all">
                <h3 className="text-lg font-medium mb-4">Invoices by Status</h3>
                {invoiceStatusChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie data={invoiceStatusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {invoiceStatusChartData.map((entry, index) => (
                                    <RechartsCell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                ) : (
                     <p className="text-gray-500 dark:text-slate-400">No invoice data to display.</p>
                )}
            </div>
        </div>
    );

    const renderInvoiceList = () => (
        <div className="p-4 md:p-6 fade-in">
            <div className="flex-between mb-4 flex-wrap gap-2">
                <h2 className="text-2xl font-semibold">Invoices</h2>
                <button onClick={() => { reset({ items: [{ id: Date.now().toString(), description: '', quantity: 1, price: 0 }], invoiceDate: format(new Date(), 'yyyy-MM-dd'), dueDate: format(new Date(), 'yyyy-MM-dd'), status: 'Draft' }); setCurrentView('addInvoice'); }} className="btn btn-primary btn-responsive">
                    <PlusCircle size={18} className="inline-block mr-2" /> Add Invoice
                </button>
            </div>

            <div className="mb-4 p-4 card theme-transition-all flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-grow w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Search by Invoice # or Client..."
                        className="input input-responsive pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                <div className="relative w-full sm:w-auto sm:min-w-[180px]">
                     <select
                        className="input input-responsive appearance-none pr-8"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as InvoiceStatus | '')}
                    >
                        <option value="">All Statuses</option>
                        {invoiceStatusOptions.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <FilterIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <button onClick={downloadCSV} className="btn bg-secondary-500 text-white hover:bg-secondary-600 btn-responsive w-full sm:w-auto">
                    <Download size={18} className="inline-block mr-2" /> Download CSV
                </button>
            </div>

            {filteredAndSortedInvoices.length === 0 && !isLoading ? (
                <div className="card theme-transition-all text-center py-8">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-medium">No Invoices Found</h3>
                    <p className="text-gray-500 dark:text-slate-400 mt-2">
                        {searchTerm || filterStatus ? 'Try adjusting your search or filters.' : 'Create your first invoice to get started!'}
                    </p>
                </div>
            ) : (
                <div className="table-container theme-transition-bg">
                    <table className="table">
                        <thead className="table-header">
                            <tr>
                                {[
                                    { label: 'Invoice #', key: 'invoiceNumber' as const },
                                    { label: 'Client', key: 'clientName' as const },
                                    { label: 'Amount', key: 'totalAmount' as const },
                                    { label: 'Due Date', key: 'dueDate' as const },
                                    { label: 'Status', key: 'status' as const },
                                    { label: 'Actions', key: 'actions' as const}
                                ].map(col => (
                                    <th key={col.key} scope="col" className="table-cell px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                        {col.key !== 'actions' ? (
                                             <button onClick={() => requestSort(col.key)} className="flex items-center hover:text-primary-600 dark:hover:text-primary-400">
                                                {col.label} {getSortIndicator(col.key)}
                                            </button>
                                        ) : col.label }
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700 theme-transition-all">
                            {filteredAndSortedInvoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 theme-transition-bg">
                                    <td className="table-cell px-4 py-3 whitespace-nowrap font-medium text-primary-600 dark:text-primary-400">{invoice.invoiceNumber}</td>
                                    <td className="table-cell px-4 py-3 whitespace-nowrap">{invoice.clientName}</td>
                                    <td className="table-cell px-4 py-3 whitespace-nowrap">${invoice.totalAmount.toFixed(2)}</td>
                                    <td className="table-cell px-4 py-3 whitespace-nowrap">{format(parseISO(invoice.dueDate), 'MMM d, yyyy')}</td>
                                    <td className="table-cell px-4 py-3 whitespace-nowrap">
                                        <span className={`badge ${statusColors[invoice.status]}`}>{invoice.status}</span>
                                    </td>
                                    <td className="table-cell px-4 py-3 whitespace-nowrap space-x-1">
                                        <button onClick={() => handleViewInvoice(invoice)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" aria-label="View Invoice">
                                            <Eye size={18} className="text-blue-500" />
                                        </button>
                                        <button onClick={() => handleEditInvoice(invoice)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" aria-label="Edit Invoice">
                                            <Edit3 size={18} className="text-yellow-500" />
                                        </button>
                                        <button onClick={() => handleDeleteInvoice(invoice.id)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" aria-label="Delete Invoice">
                                            <Trash2 size={18} className="text-red-500" />
                                        </button>
                                        <button onClick={() => handleSendInvoiceSummaryToAI(invoice)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded" aria-label="Get AI Summary">
                                            <Brain size={18} className="text-purple-500" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderInvoiceForm = (isEditMode: boolean) => (
        <div className="p-4 md:p-6 fade-in container-narrow">
            <h2 className="text-2xl font-semibold mb-6">{isEditMode ? 'Edit Invoice' : 'Create New Invoice'}</h2>
            {appError && (
                <div className="alert alert-error mb-4">
                    <AlertCircle size={20} /> <p>{appError}</p>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmitInvoice)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="invoiceNumber" className="form-label">Invoice Number</label>
                        <input id="invoiceNumber" {...register('invoiceNumber')} className="input" placeholder="e.g., INV-001 (auto if empty)" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="clientName" className="form-label">Client Name *</label>
                        <input id="clientName" {...register('clientName', { required: 'Client name is required' })} className={`input ${errors.clientName ? 'border-red-500' : ''}`} />
                        {errors.clientName && <p className="form-error">{errors.clientName.message}</p>}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="clientEmail" className="form-label">Client Email *</label>
                    <input id="clientEmail" type="email" {...register('clientEmail', { required: 'Client email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email address' }})} className={`input ${errors.clientEmail ? 'border-red-500' : ''}`} />
                    {errors.clientEmail && <p className="form-error">{errors.clientEmail.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="invoiceDate" className="form-label">Invoice Date *</label>
                        <input id="invoiceDate" type="date" {...register('invoiceDate', { required: 'Invoice date is required',setValueAs: (v: string) => v ? parseISO(v).toISOString() : '' })} className={`input ${errors.invoiceDate ? 'border-red-500' : ''}`} defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                        {errors.invoiceDate && <p className="form-error">{errors.invoiceDate.message}</p>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="dueDate" className="form-label">Due Date *</label>
                        <input id="dueDate" type="date" {...register('dueDate', { required: 'Due date is required', setValueAs: (v: string) => v ? parseISO(v).toISOString() : '' })} className={`input ${errors.dueDate ? 'border-red-500' : ''}`} defaultValue={format(new Date(), 'yyyy-MM-dd')} />
                        {errors.dueDate && <p className="form-error">{errors.dueDate.message}</p>}
                    </div>
                </div>

                <h3 className="text-lg font-medium pt-4 border-t dark:border-slate-700">Items</h3>
                {watchedItems?.map((item, index) => (
                    <div key={item.id || index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-end p-3 border dark:border-slate-700 rounded-md">
                        <div className="form-group md:col-span-5">
                            <label htmlFor={`items.${index}.description`} className="form-label text-sm">Description *</label>
                            <input id={`items.${index}.description`} {...register(`items.${index}.description` as const, { required: true })} className="input input-sm" placeholder="Item description"/>
                        </div>
                        <div className="form-group md:col-span-2">
                            <label htmlFor={`items.${index}.quantity`} className="form-label text-sm">Qty *</label>
                            <input id={`items.${index}.quantity`} type="number" {...register(`items.${index}.quantity` as const, { required: true, valueAsNumber: true, min: 1 })} className="input input-sm" placeholder="1" />
                        </div>
                        <div className="form-group md:col-span-2">
                            <label htmlFor={`items.${index}.price`} className="form-label text-sm">Price *</label>
                            <input id={`items.${index}.price`} type="number" step="0.01" {...register(`items.${index}.price` as const, { required: true, valueAsNumber: true, min: 0 })} className="input input-sm" placeholder="0.00" />
                        </div>
                        <div className="form-group md:col-span-2">
                             <label className="form-label text-sm">Amount</label>
                             <p className="input input-sm bg-slate-50 dark:bg-slate-700">${((item.quantity || 0) * (item.price || 0)).toFixed(2)}</p>
                        </div>
                        <div className="md:col-span-1">
                            <button type="button" onClick={() => handleRemoveItem(index)} className="btn bg-red-500 text-white hover:bg-red-600 btn-sm w-full" aria-label="Remove item">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
                 {(errors.items && !Array.isArray(errors.items)) && <p className="form-error">Please add at least one item and fill all item fields.</p>}
                <button type="button" onClick={handleAddItem} className="btn btn-secondary btn-sm">
                    <PlusCircle size={16} className="inline-block mr-1" /> Add Item
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t dark:border-slate-700">
                    <div className="form-group">
                        <label htmlFor="status" className="form-label">Status *</label>
                        <Controller
                            name="status"
                            control={control}
                            rules={{ required: "Status is required" }}
                            defaultValue="Draft"
                            render={({ field }) => (
                                <select {...field} id="status" className={`input ${errors.status ? 'border-red-500' : ''}`}>
                                    {invoiceStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            )}
                        />
                        {errors.status && <p className="form-error">{errors.status.message}</p>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Total Amount</label>
                        <p className="text-2xl font-semibold dark:text-white">${watch('totalAmount')?.toFixed(2) || '0.00'}</p>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button type="button" onClick={() => { reset(); setCurrentView('invoices'); setSelectedInvoice(null); }} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={isLoadingState}>
                        {isLoadingState ? <Loader2 size={20} className="animate-spin mr-2 inline" /> : null}
                        {isEditMode ? 'Save Changes' : 'Create Invoice'}
                    </button>
                </div>
            </form>
        </div>
    );

    const renderModal = () => {
        if (!isModalOpen || !selectedInvoice) return null;

        const renderInvoiceDetailContent = () => (
            <>
                <div className="modal-header">
                    <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Details: {selectedInvoice.invoiceNumber}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" aria-label="Close modal">
                        <X size={24} />
                    </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-slate-300">
                    <p><strong>Client:</strong> {selectedInvoice.clientName} ({selectedInvoice.clientEmail})</p>
                    <p><strong>Invoice Date:</strong> {format(parseISO(selectedInvoice.invoiceDate), 'PPP')}</p>
                    <p><strong>Due Date:</strong> {format(parseISO(selectedInvoice.dueDate), 'PPP')} 
                        {getStatusWithOverdueCheck(selectedInvoice) === 'Overdue' && 
                            <span className="ml-2 text-red-500 font-semibold">(Overdue by {differenceInDays(new Date(), parseISO(selectedInvoice.dueDate))} days)</span>}
                    </p>
                    <p><strong>Status:</strong> <span className={`badge ${statusColors[getStatusWithOverdueCheck(selectedInvoice)]}`}>{getStatusWithOverdueCheck(selectedInvoice)}</span></p>
                    <div className="pt-2 mt-2 border-t dark:border-slate-600">
                        <h4 className="font-semibold mb-1">Items:</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {selectedInvoice.items.map(item => (
                                <li key={item.id}>{item.description} (Qty: {item.quantity}, Price: ${item.price.toFixed(2)}, Total: ${(item.quantity * item.price).toFixed(2)})</li>
                            ))}
                        </ul>
                    </div>
                    <p className="text-lg font-semibold mt-3 pt-3 border-t dark:border-slate-600"><strong>Total Amount:</strong> ${selectedInvoice.totalAmount.toFixed(2)}</p>
                </div>
                <div className="modal-footer">
                    <button onClick={() => { handleSendInvoiceSummaryToAI(selectedInvoice); /* Modal content will switch */ }} className="btn btn-secondary">
                        <Brain size={18} className="mr-2" /> Get AI Summary
                    </button>
                    <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Close
                    </button>
                </div>
            </>
        );

        const renderAISummaryContent = () => (
            <>
                <div className="modal-header">
                    <h3 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">AI Summary for {selectedInvoice.invoiceNumber}</h3>
                    <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" aria-label="Close modal">
                        <X size={24} />
                    </button>
                </div>
                <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-slate-300">
                    {aiIsLoading && (
                        <div className="flex-center p-6">
                            <Loader2 size={32} className="animate-spin text-primary-500" />
                            <p className="ml-3">Generating summary...</p>
                        </div>
                    )}
                    {aiError && (
                        <div className="alert alert-error">
                            <AlertCircle size={20} /> <p>{typeof aiError === 'string' ? aiError : JSON.stringify(aiError)}</p>
                        </div>
                    )}
                    {aiResult && (
                        <div className="prose prose-sm dark:prose-invert max-w-none p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                            <p>{aiResult}</p>
                        </div>
                    )}
                    {!aiIsLoading && !aiResult && !aiError && (
                        <p>Click "Generate" to get an AI-powered summary of this invoice.</p>
                    )}
                </div>
                <div className="modal-footer">
                    <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                        Close
                    </button>
                    <button onClick={triggerAISummary} className="btn btn-primary" disabled={aiIsLoading || !aiPromptText.trim()}>
                        {aiIsLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Brain size={18} className="mr-2" />} Generate
                    </button>
                </div>
            </>
        );

        return (
            <div className="modal-backdrop theme-transition-all" onClick={closeModal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <div className="modal-content theme-transition-all" onClick={(e) => e.stopPropagation()}>
                    {modalContent === 'viewInvoice' && renderInvoiceDetailContent()}
                    {modalContent === 'aiSummary' && renderAISummaryContent()}
                </div>
            </div>
        );
    };

    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard': return renderDashboard();
            case 'invoices': return renderInvoiceList();
            case 'addInvoice': return renderInvoiceForm(false);
            case 'editInvoice': return renderInvoiceForm(true);
            default: return renderDashboard();
        }
    };

    return (
        <div className={`min-h-screen flex flex-col ${isDarkMode ? 'dark' : ''} bg-bg-secondary dark:bg-slate-900 text-text-base theme-transition-all`}>
            {renderHeader()}
            <main className="flex-grow container-fluid py-0 px-0 md:px-0 md:py-0">
                {renderCurrentView()}
            </main>
            <footer className="text-center p-4 text-sm text-gray-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 theme-transition-all">
                Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
            </footer>
            {renderModal()}
            <AILayer
                ref={aiLayerRef}
                prompt={aiPromptText}
                onResult={setAiResult}
                onError={setAiError}
                onLoading={setAiIsLoading}
            />
        </div>
    );
};

export default App;
