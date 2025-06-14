import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  User, Users, Briefcase, Clock, FileText, DollarSign, BarChart3,
  Settings, Plus, Edit, Trash2, Search, Filter, Download, Upload,
  Eye, Calendar, TrendingUp, TrendingDown, Sun, Moon, Menu, X,
  Building, Mail, Phone, MapPin, Tag, Calculator, Receipt,
  CheckCircle, AlertCircle, PieChart, Target, Wallet
} from 'lucide-react';

// Types and Interfaces
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  businessType: string;
  taxId: string;
  status: 'active' | 'inactive';
  createdDate: string;
  notes: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  rate: number;
  category: string;
  isActive: boolean;
}

interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  serviceId: string;
  serviceName: string;
  status: 'planning' | 'active' | 'review' | 'completed';
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  rate: number;
  priority: 'low' | 'medium' | 'high';
}

interface TimeEntry {
  id: string;
  projectId: string;
  projectTitle: string;
  clientName: string;
  description: string;
  hours: number;
  rate: number;
  date: string;
  billable: boolean;
  invoiced: boolean;
}

interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  notes: string;
}

interface InvoiceItem {
  description: string;
  hours: number;
  rate: number;
  amount: number;
}

interface Document {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
  category: string;
}

interface BusinessSettings {
  businessName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  defaultTaxRate: number;
  currency: string;
  timeZone: string;
  fiscalYear: string;
}

// Dark mode hook
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };
  
  return { isDark, toggleDarkMode };
};

function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
    defaultTaxRate: 0,
    currency: 'USD',
    timeZone: 'UTC',
    fiscalYear: 'Jan-Dec'
  });

  // Form states
  const [showClientModal, setShowClientModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedClients = localStorage.getItem('accounting-clients');
    const savedServices = localStorage.getItem('accounting-services');
    const savedProjects = localStorage.getItem('accounting-projects');
    const savedTimeEntries = localStorage.getItem('accounting-time-entries');
    const savedInvoices = localStorage.getItem('accounting-invoices');
    const savedDocuments = localStorage.getItem('accounting-documents');
    const savedSettings = localStorage.getItem('accounting-settings');

    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedServices) setServices(JSON.parse(savedServices));
    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedTimeEntries) setTimeEntries(JSON.parse(savedTimeEntries));
    if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
    if (savedSettings) setBusinessSettings(JSON.parse(savedSettings));

    // Add sample data if empty
    if (!savedClients || JSON.parse(savedClients).length === 0) {
      const sampleClients = [
        {
          id: '1',
          name: 'ABC Corp',
          email: 'contact@abccorp.com',
          phone: '(555) 123-4567',
          address: '123 Business St, City, ST 12345',
          businessType: 'Corporation',
          taxId: '12-3456789',
          status: 'active' as const,
          createdDate: '2025-01-15',
          notes: 'Annual tax filing and quarterly reviews'
        },
        {
          id: '2',
          name: 'XYZ LLC',
          email: 'info@xyzllc.com',
          phone: '(555) 987-6543',
          address: '456 Commerce Ave, City, ST 12345',
          businessType: 'LLC',
          taxId: '98-7654321',
          status: 'active' as const,
          createdDate: '2025-02-01',
          notes: 'Monthly bookkeeping services'
        }
      ];
      setClients(sampleClients);
      localStorage.setItem('accounting-clients', JSON.stringify(sampleClients));
    }

    if (!savedServices || JSON.parse(savedServices).length === 0) {
      const sampleServices = [
        {
          id: '1',
          name: 'Tax Preparation',
          description: 'Individual and business tax return preparation',
          rate: 150,
          category: 'Tax Services',
          isActive: true
        },
        {
          id: '2',
          name: 'Bookkeeping',
          description: 'Monthly bookkeeping and reconciliation',
          rate: 75,
          category: 'Accounting Services',
          isActive: true
        },
        {
          id: '3',
          name: 'Financial Consulting',
          description: 'Business financial planning and analysis',
          rate: 200,
          category: 'Consulting',
          isActive: true
        }
      ];
      setServices(sampleServices);
      localStorage.setItem('accounting-services', JSON.stringify(sampleServices));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accounting-clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('accounting-services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('accounting-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('accounting-time-entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    localStorage.setItem('accounting-invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('accounting-documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('accounting-settings', JSON.stringify(businessSettings));
  }, [businessSettings]);

  // AI Integration
  const handleAIDocumentProcessing = (file: File) => {
    const prompt = `Analyze this financial document and extract key information. Return JSON with the following structure:
    {
      "documentType": "invoice|receipt|bank_statement|tax_form|other",
      "clientName": "extracted client/company name",
      "amount": "numeric amount",
      "date": "date in YYYY-MM-DD format",
      "description": "brief description of transaction",
      "category": "expense category",
      "vendor": "vendor/supplier name if applicable",
      "taxAmount": "tax amount if applicable",
      "items": [{"description": "item description", "amount": "item amount"}]
    }`;
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(prompt, file);
  };

  const processAIResult = (result: string) => {
    try {
      const parsedData = JSON.parse(result);
      
      // Auto-create client if new
      if (parsedData.clientName && !clients.find(c => c.name.toLowerCase().includes(parsedData.clientName.toLowerCase()))) {
        const newClient: Client = {
          id: Date.now().toString(),
          name: parsedData.clientName,
          email: '',
          phone: '',
          address: '',
          businessType: 'Unknown',
          taxId: '',
          status: 'active',
          createdDate: new Date().toISOString().split('T')[0],
          notes: 'Auto-created from AI document processing'
        };
        setClients(prev => [...prev, newClient]);
      }

      // Auto-create time entry or expense based on document type
      if (parsedData.amount && parsedData.description) {
        const newTimeEntry: TimeEntry = {
          id: Date.now().toString(),
          projectId: '',
          projectTitle: 'Document Processing',
          clientName: parsedData.clientName || 'Unknown Client',
          description: parsedData.description,
          hours: 1,
          rate: parseFloat(parsedData.amount) || 0,
          date: parsedData.date || new Date().toISOString().split('T')[0],
          billable: true,
          invoiced: false
        };
        setTimeEntries(prev => [...prev, newTimeEntry]);
      }

      setAiResult(`Document processed successfully! Extracted: ${parsedData.documentType} for ${parsedData.clientName} - $${parsedData.amount}`);
    } catch (error) {
      setAiResult(result); // Show as markdown if not JSON
    }
  };

  // CRUD Operations
  const handleSaveClient = (clientData: Partial<Client>) => {
    if (editingItem) {
      setClients(prev => prev.map(c => c.id === editingItem.id ? { ...c, ...clientData } : c));
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        createdDate: new Date().toISOString().split('T')[0],
        status: 'active',
        ...clientData as Client
      };
      setClients(prev => [...prev, newClient]);
    }
    setShowClientModal(false);
    setEditingItem(null);
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleSaveService = (serviceData: Partial<Service>) => {
    if (editingItem) {
      setServices(prev => prev.map(s => s.id === editingItem.id ? { ...s, ...serviceData } : s));
    } else {
      const newService: Service = {
        id: Date.now().toString(),
        isActive: true,
        ...serviceData as Service
      };
      setServices(prev => [...prev, newService]);
    }
    setShowServiceModal(false);
    setEditingItem(null);
  };

  const handleDeleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveProject = (projectData: Partial<Project>) => {
    if (editingItem) {
      setProjects(prev => prev.map(p => p.id === editingItem.id ? { ...p, ...projectData } : p));
    } else {
      const client = clients.find(c => c.id === projectData.clientId);
      const service = services.find(s => s.id === projectData.serviceId);
      const newProject: Project = {
        id: Date.now().toString(),
        clientName: client?.name || '',
        serviceName: service?.name || '',
        status: 'planning',
        actualHours: 0,
        priority: 'medium',
        rate: service?.rate || 0,
        ...projectData as Project
      };
      setProjects(prev => [...prev, newProject]);
    }
    setShowProjectModal(false);
    setEditingItem(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveTimeEntry = (timeData: Partial<TimeEntry>) => {
    if (editingItem) {
      setTimeEntries(prev => prev.map(t => t.id === editingItem.id ? { ...t, ...timeData } : t));
    } else {
      const project = projects.find(p => p.id === timeData.projectId);
      const newTimeEntry: TimeEntry = {
        id: Date.now().toString(),
        projectTitle: project?.title || '',
        clientName: project?.clientName || '',
        billable: true,
        invoiced: false,
        rate: project?.rate || 0,
        ...timeData as TimeEntry
      };
      setTimeEntries(prev => [...prev, newTimeEntry]);
      
      // Update project actual hours
      if (project) {
        setProjects(prev => prev.map(p => 
          p.id === project.id 
            ? { ...p, actualHours: p.actualHours + (timeData.hours || 0) }
            : p
        ));
      }
    }
    setShowTimeModal(false);
    setEditingItem(null);
  };

  const handleDeleteTimeEntry = (id: string) => {
    const timeEntry = timeEntries.find(t => t.id === id);
    if (timeEntry) {
      setTimeEntries(prev => prev.filter(t => t.id !== id));
      // Update project actual hours
      const project = projects.find(p => p.id === timeEntry.projectId);
      if (project) {
        setProjects(prev => prev.map(p => 
          p.id === project.id 
            ? { ...p, actualHours: Math.max(0, p.actualHours - timeEntry.hours) }
            : p
        ));
      }
    }
  };

  const generateInvoice = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    const unbilledEntries = timeEntries.filter(t => t.clientName === client?.name && t.billable && !t.invoiced);
    
    if (unbilledEntries.length === 0) return;

    const items: InvoiceItem[] = unbilledEntries.map(entry => ({
      description: `${entry.projectTitle} - ${entry.description}`,
      hours: entry.hours,
      rate: entry.rate,
      amount: entry.hours * entry.rate
    }));

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (businessSettings.defaultTaxRate / 100);
    const total = subtotal + tax;

    const newInvoice: Invoice = {
      id: Date.now().toString(),
      clientId,
      clientName: client?.name || '',
      invoiceNumber: `INV-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items,
      subtotal,
      tax,
      total,
      status: 'draft',
      notes: ''
    };

    setInvoices(prev => [...prev, newInvoice]);
    
    // Mark time entries as invoiced
    setTimeEntries(prev => prev.map(t => 
      unbilledEntries.some(ue => ue.id === t.id) ? { ...t, invoiced: true } : t
    ));
  };

  // Export functions
  const exportData = (dataType: string) => {
    let data: any[] = [];
    let filename = '';
    
    switch (dataType) {
      case 'clients':
        data = clients;
        filename = 'clients.csv';
        break;
      case 'services':
        data = services;
        filename = 'services.csv';
        break;
      case 'projects':
        data = projects;
        filename = 'projects.csv';
        break;
      case 'timeEntries':
        data = timeEntries;
        filename = 'time-entries.csv';
        break;
      case 'invoices':
        data = invoices;
        filename = 'invoices.csv';
        break;
      default:
        return;
    }
    
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = (type: string) => {
    let headers: string[] = [];
    let filename = '';
    
    switch (type) {
      case 'clients':
        headers = ['name', 'email', 'phone', 'address', 'businessType', 'taxId', 'notes'];
        filename = 'clients-template.csv';
        break;
      case 'services':
        headers = ['name', 'description', 'rate', 'category'];
        filename = 'services-template.csv';
        break;
      case 'timeEntries':
        headers = ['projectTitle', 'clientName', 'description', 'hours', 'rate', 'date', 'billable'];
        filename = 'time-entries-template.csv';
        break;
      default:
        return;
    }
    
    const csvContent = headers.join(',') + '\nExample Data,example@email.com,555-1234,123 Main St,Corporation,12-3456789,Sample notes';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dashboard calculations
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const pendingInvoices = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const billableHours = timeEntries.filter(t => t.billable && !t.invoiced).reduce((sum, t) => sum + t.hours, 0);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'time', label: 'Time Tracking', icon: Clock },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Receipt },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Filter data based on search and filters
  const getFilteredData = (data: any[], searchFields: string[]) => {
    return data.filter(item => {
      const matchesSearch = searchTerm === '' || searchFields.some(field => 
        item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={processAIResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">AccountingPro</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser?.first_name}</span>
              </div>
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out theme-transition`}>
          <div className="flex flex-col h-full pt-4">
            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`${item.id}-tab`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div id="generation_issue_fallback" className="max-w-7xl mx-auto">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-gray-900 dark:text-white">Dashboard</h2>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Total Revenue</div>
                        <div className="stat-value text-green-600">${totalRevenue.toLocaleString()}</div>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Pending Invoices</div>
                        <div className="stat-value text-orange-600">${pendingInvoices.toLocaleString()}</div>
                      </div>
                      <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>

                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Active Clients</div>
                        <div className="stat-value text-blue-600">{activeClients}</div>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Active Projects</div>
                        <div className="stat-value text-purple-600">{activeProjects}</div>
                      </div>
                      <Target className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>

                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Unbilled Hours</div>
                        <div className="stat-value text-red-600">{billableHours.toFixed(1)}</div>
                      </div>
                      <Clock className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="card-header">
                      <h3 className="heading-5 text-gray-900 dark:text-white">Recent Projects</h3>
                    </div>
                    <div className="card-body">
                      <div className="space-y-4">
                        {projects.slice(0, 5).map((project) => (
                          <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{project.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{project.clientName}</div>
                            </div>
                            <span className={`badge ${
                              project.status === 'completed' ? 'badge-success' :
                              project.status === 'active' ? 'badge-primary' :
                              project.status === 'review' ? 'badge-warning' : 'badge-gray'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="card-header">
                      <h3 className="heading-5 text-gray-900 dark:text-white">Recent Invoices</h3>
                    </div>
                    <div className="card-body">
                      <div className="space-y-4">
                        {invoices.slice(0, 5).map((invoice) => (
                          <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{invoice.clientName}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium text-gray-900 dark:text-white">${invoice.total.toLocaleString()}</div>
                              <span className={`badge ${
                                invoice.status === 'paid' ? 'badge-success' :
                                invoice.status === 'sent' ? 'badge-primary' :
                                invoice.status === 'overdue' ? 'badge-error' : 'badge-gray'
                              }`}>
                                {invoice.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clients */}
            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-gray-900 dark:text-white">Clients</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => downloadTemplate('clients')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Template
                    </button>
                    <button
                      onClick={() => exportData('clients')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowClientModal(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Client
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search clients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Clients Table */}
                <div className="table-container">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Name</th>
                        <th className="table-header-cell">Email</th>
                        <th className="table-header-cell">Phone</th>
                        <th className="table-header-cell">Business Type</th>
                        <th className="table-header-cell">Status</th>
                        <th className="table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {getFilteredData(clients, ['name', 'email', 'businessType']).map((client) => (
                        <tr key={client.id} className="table-row">
                          <td className="table-cell font-medium">{client.name}</td>
                          <td className="table-cell">{client.email}</td>
                          <td className="table-cell">{client.phone}</td>
                          <td className="table-cell">{client.businessType}</td>
                          <td className="table-cell">
                            <span className={`badge ${client.status === 'active' ? 'badge-success' : 'badge-gray'}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => generateInvoice(client.id)}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                                title="Generate Invoice"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingItem(client);
                                  setShowClientModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClient(client.id)}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
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
              </div>
            )}

            {/* Services */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-gray-900 dark:text-white">Services</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => downloadTemplate('services')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Template
                    </button>
                    <button
                      onClick={() => exportData('services')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowServiceModal(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Service
                    </button>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <div key={service.id} className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="card-body">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="heading-5 text-gray-900 dark:text-white mb-1">{service.name}</h3>
                            <span className="badge badge-primary">{service.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(service);
                                setShowServiceModal(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-caption mb-4">{service.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-green-600">${service.rate}/hr</span>
                          <span className={`badge ${service.isActive ? 'badge-success' : 'badge-gray'}`}>
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-gray-900 dark:text-white">Projects</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => exportData('projects')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowProjectModal(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Project
                    </button>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="select"
                  >
                    <option value="all">All Status</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {getFilteredData(projects, ['title', 'clientName', 'serviceName']).map((project) => (
                    <div key={project.id} className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="card-body">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="heading-5 text-gray-900 dark:text-white mb-1">{project.title}</h3>
                            <p className="text-caption mb-2">{project.clientName} • {project.serviceName}</p>
                            <span className={`badge ${
                              project.priority === 'high' ? 'badge-error' :
                              project.priority === 'medium' ? 'badge-warning' : 'badge-gray'
                            }`}>
                              {project.priority} priority
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(project);
                                setShowProjectModal(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-caption mb-4">{project.description}</p>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Progress</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {project.actualHours}/{project.estimatedHours} hours
                            </span>
                          </div>
                          <div className="progress">
                            <div 
                              className="progress-bar"
                              style={{ width: `${Math.min(100, (project.actualHours / project.estimatedHours) * 100)}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className={`badge ${
                              project.status === 'completed' ? 'badge-success' :
                              project.status === 'active' ? 'badge-primary' :
                              project.status === 'review' ? 'badge-warning' : 'badge-gray'
                            }`}>
                              {project.status}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Due: {new Date(project.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Time Tracking */}
            {activeTab === 'time' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-gray-900 dark:text-white">Time Tracking</h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => downloadTemplate('timeEntries')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Template
                    </button>
                    <button
                      onClick={() => exportData('timeEntries')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setShowTimeModal(true);
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Log Time
                    </button>
                  </div>
                </div>

                {/* Time Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Total Hours</div>
                        <div className="stat-value text-blue-600">{timeEntries.reduce((sum, t) => sum + t.hours, 0).toFixed(1)}</div>
                      </div>
                      <Clock className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>

                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Billable Hours</div>
                        <div className="stat-value text-green-600">{timeEntries.filter(t => t.billable).reduce((sum, t) => sum + t.hours, 0).toFixed(1)}</div>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Unbilled Value</div>
                        <div className="stat-value text-orange-600">${timeEntries.filter(t => t.billable && !t.invoiced).reduce((sum, t) => sum + (t.hours * t.rate), 0).toLocaleString()}</div>
                      </div>
                      <Wallet className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>

                {/* Time Entries Table */}
                <div className="table-container">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Date</th>
                        <th className="table-header-cell">Client</th>
                        <th className="table-header-cell">Project</th>
                        <th className="table-header-cell">Description</th>
                        <th className="table-header-cell">Hours</th>
                        <th className="table-header-cell">Rate</th>
                        <th className="table-header-cell">Amount</th>
                        <th className="table-header-cell">Status</th>
                        <th className="table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {timeEntries.map((entry) => (
                        <tr key={entry.id} className="table-row">
                          <td className="table-cell">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="table-cell">{entry.clientName}</td>
                          <td className="table-cell">{entry.projectTitle}</td>
                          <td className="table-cell">{entry.description}</td>
                          <td className="table-cell">{entry.hours}</td>
                          <td className="table-cell">${entry.rate}</td>
                          <td className="table-cell">${(entry.hours * entry.rate).toFixed(2)}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              {entry.billable && (
                                <span className="badge badge-success">Billable</span>
                              )}
                              {entry.invoiced && (
                                <span className="badge badge-primary">Invoiced</span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(entry);
                                  setShowTimeModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTimeEntry(entry.id)}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded"
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
              </div>
            )}

            {/* Invoices */}
            {activeTab === 'invoices' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-gray-900 dark:text-white">Invoices</h2>
                  <button
                    onClick={() => exportData('invoices')}
                    className="btn btn-secondary btn-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>

                {/* Invoice Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="stat-title">Total Invoiced</div>
                    <div className="stat-value text-blue-600">${invoices.reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}</div>
                  </div>
                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="stat-title">Paid</div>
                    <div className="stat-value text-green-600">${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}</div>
                  </div>
                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="stat-title">Pending</div>
                    <div className="stat-value text-orange-600">${invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}</div>
                  </div>
                  <div className="stat-card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="stat-title">Overdue</div>
                    <div className="stat-value text-red-600">${invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0).toLocaleString()}</div>
                  </div>
                </div>

                {/* Invoices Table */}
                <div className="table-container">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Invoice #</th>
                        <th className="table-header-cell">Client</th>
                        <th className="table-header-cell">Date</th>
                        <th className="table-header-cell">Due Date</th>
                        <th className="table-header-cell">Amount</th>
                        <th className="table-header-cell">Status</th>
                        <th className="table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="table-row">
                          <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                          <td className="table-cell">{invoice.clientName}</td>
                          <td className="table-cell">{new Date(invoice.date).toLocaleDateString()}</td>
                          <td className="table-cell">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                          <td className="table-cell font-medium">${invoice.total.toLocaleString()}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              invoice.status === 'paid' ? 'badge-success' :
                              invoice.status === 'sent' ? 'badge-primary' :
                              invoice.status === 'overdue' ? 'badge-error' : 'badge-gray'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingItem(invoice);
                                  setShowInvoiceModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                                title="View Invoice"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const updatedInvoice = { ...invoice, status: 'paid' as const };
                                  setInvoices(prev => prev.map(inv => inv.id === invoice.id ? updatedInvoice : inv));
                                }}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                                title="Mark as Paid"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-gray-900 dark:text-white">Documents</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowDocumentModal(true);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Upload Document
                  </button>
                </div>

                {/* AI Document Processing */}
                <div className="card bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-xl">
                  <div className="card-body">
                    <h3 className="heading-5 text-gray-900 dark:text-white mb-4">AI Document Processing</h3>
                    <p className="text-caption mb-4">Upload financial documents (receipts, invoices, bank statements) and let AI extract key information automatically.</p>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setSelectedFile(file);
                            handleAIDocumentProcessing(file);
                          }
                        }}
                        className="input"
                      />
                      {aiLoading && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          Processing...
                        </div>
                      )}
                    </div>

                    {aiResult && (
                      <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResult}</ReactMarkdown>
                        </div>
                      </div>
                    )}

                    {aiError && (
                      <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                        <p className="text-red-800 dark:text-red-200">Error processing document: {aiError.message || 'Unknown error'}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {documents.map((doc) => (
                    <div key={doc.id} className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                      <div className="card-body">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="heading-6 text-gray-900 dark:text-white mb-1">{doc.name}</h3>
                            <p className="text-caption">{doc.clientName}</p>
                            <span className="badge badge-primary">{doc.category}</span>
                          </div>
                          <FileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                          <div>Type: {doc.type}</div>
                          <div>Size: {doc.size}</div>
                          <div>Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="heading-2 text-gray-900 dark:text-white">Settings</h2>

                {/* Business Settings */}
                <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="card-header">
                    <h3 className="heading-5 text-gray-900 dark:text-white">Business Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label className="form-label">Business Name</label>
                        <input
                          type="text"
                          value={businessSettings.businessName}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, businessName: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          value={businessSettings.email}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, email: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone</label>
                        <input
                          type="tel"
                          value={businessSettings.phone}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, phone: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Website</label>
                        <input
                          type="url"
                          value={businessSettings.website}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, website: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="form-group md:col-span-2">
                        <label className="form-label">Address</label>
                        <textarea
                          value={businessSettings.address}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, address: e.target.value }))}
                          className="textarea"
                          rows={3}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tax ID</label>
                        <input
                          type="text"
                          value={businessSettings.taxId}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, taxId: e.target.value }))}
                          className="input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Default Tax Rate (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={businessSettings.defaultTaxRate}
                          onChange={(e) => setBusinessSettings(prev => ({ ...prev, defaultTaxRate: parseFloat(e.target.value) || 0 }))}
                          className="input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Data Management */}
                <div className="card bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                  <div className="card-header">
                    <h3 className="heading-5 text-gray-900 dark:text-white">Data Management</h3>
                  </div>
                  <div className="card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => {
                          const allData = {
                            clients,
                            services,
                            projects,
                            timeEntries,
                            invoices,
                            documents,
                            businessSettings
                          };
                          const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'accounting-data-backup.json';
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="btn btn-primary"
                      >
                        <Download className="w-4 h-4" />
                        Download All Data
                      </button>
                      <button
                        onClick={() => {
                          const confirmDelete = window.confirm('Are you sure you want to delete all data? This cannot be undone.');
                          if (confirmDelete) {
                            setClients([]);
                            setServices([]);
                            setProjects([]);
                            setTimeEntries([]);
                            setInvoices([]);
                            setDocuments([]);
                            localStorage.clear();
                          }
                        }}
                        className="btn btn-error"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete All Data
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modals */}
            {/* Client Modal */}
            {showClientModal && (
              <div className="modal-backdrop" onClick={() => setShowClientModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="heading-5 text-gray-900 dark:text-white">
                      {editingItem ? 'Edit Client' : 'Add Client'}
                    </h3>
                    <button
                      onClick={() => setShowClientModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <ClientForm
                      client={editingItem}
                      onSave={handleSaveClient}
                      onCancel={() => setShowClientModal(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Service Modal */}
            {showServiceModal && (
              <div className="modal-backdrop" onClick={() => setShowServiceModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="heading-5 text-gray-900 dark:text-white">
                      {editingItem ? 'Edit Service' : 'Add Service'}
                    </h3>
                    <button
                      onClick={() => setShowServiceModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <ServiceForm
                      service={editingItem}
                      onSave={handleSaveService}
                      onCancel={() => setShowServiceModal(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Project Modal */}
            {showProjectModal && (
              <div className="modal-backdrop" onClick={() => setShowProjectModal(false)}>
                <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="heading-5 text-gray-900 dark:text-white">
                      {editingItem ? 'Edit Project' : 'Add Project'}
                    </h3>
                    <button
                      onClick={() => setShowProjectModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <ProjectForm
                      project={editingItem}
                      clients={clients}
                      services={services}
                      onSave={handleSaveProject}
                      onCancel={() => setShowProjectModal(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Time Entry Modal */}
            {showTimeModal && (
              <div className="modal-backdrop" onClick={() => setShowTimeModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="heading-5 text-gray-900 dark:text-white">
                      {editingItem ? 'Edit Time Entry' : 'Log Time'}
                    </h3>
                    <button
                      onClick={() => setShowTimeModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <TimeEntryForm
                      timeEntry={editingItem}
                      projects={projects}
                      onSave={handleSaveTimeEntry}
                      onCancel={() => setShowTimeModal(false)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Modal */}
            {showInvoiceModal && editingItem && (
              <div className="modal-backdrop" onClick={() => setShowInvoiceModal(false)}>
                <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="heading-5 text-gray-900 dark:text-white">Invoice Details</h3>
                    <button
                      onClick={() => setShowInvoiceModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="modal-body">
                    <InvoiceDetail
                      invoice={editingItem}
                      businessSettings={businessSettings}
                      onClose={() => setShowInvoiceModal(false)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 py-6 theme-transition">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

// Form Components
function ClientForm({ client, onSave, onCancel }: { client?: Client; onSave: (data: Partial<Client>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    businessType: client?.businessType || '',
    taxId: client?.taxId || '',
    notes: client?.notes || '',
    status: client?.status || 'active' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Business Type</label>
          <select
            value={formData.businessType}
            onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
            className="select"
          >
            <option value="">Select Type</option>
            <option value="Sole Proprietorship">Sole Proprietorship</option>
            <option value="Partnership">Partnership</option>
            <option value="LLC">LLC</option>
            <option value="Corporation">Corporation</option>
            <option value="S-Corp">S-Corp</option>
            <option value="Non-Profit">Non-Profit</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Tax ID</label>
          <input
            type="text"
            value={formData.taxId}
            onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
            className="select"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Address</label>
        <textarea
          value={formData.address}
          onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
          className="textarea"
          rows={3}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="textarea"
          rows={3}
        />
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {client ? 'Update' : 'Create'} Client
        </button>
      </div>
    </form>
  );
}

function ServiceForm({ service, onSave, onCancel }: { service?: Service; onSave: (data: Partial<Service>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    rate: service?.rate || 0,
    category: service?.category || '',
    isActive: service?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label form-label-required">Service Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="textarea"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Hourly Rate ($)</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.rate}
            onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="select"
          >
            <option value="">Select Category</option>
            <option value="Tax Services">Tax Services</option>
            <option value="Accounting Services">Accounting Services</option>
            <option value="Bookkeeping">Bookkeeping</option>
            <option value="Payroll">Payroll</option>
            <option value="Consulting">Consulting</option>
            <option value="Audit Services">Audit Services</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="checkbox"
          />
          <span className="form-label">Active Service</span>
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {service ? 'Update' : 'Create'} Service
        </button>
      </div>
    </form>
  );
}

function ProjectForm({ 
  project, 
  clients, 
  services, 
  onSave, 
  onCancel 
}: { 
  project?: Project; 
  clients: Client[]; 
  services: Service[]; 
  onSave: (data: Partial<Project>) => void; 
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    clientId: project?.clientId || '',
    serviceId: project?.serviceId || '',
    startDate: project?.startDate || new Date().toISOString().split('T')[0],
    dueDate: project?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: project?.estimatedHours || 0,
    priority: project?.priority || 'medium' as const,
    status: project?.status || 'planning' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label form-label-required">Project Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="textarea"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Client</label>
          <select
            required
            value={formData.clientId}
            onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
            className="select"
          >
            <option value="">Select Client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label form-label-required">Service</label>
          <select
            required
            value={formData.serviceId}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceId: e.target.value }))}
            className="select"
          >
            <option value="">Select Service</option>
            {services.map(service => (
              <option key={service.id} value={service.id}>{service.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label form-label-required">Start Date</label>
          <input
            type="date"
            required
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required">Due Date</label>
          <input
            type="date"
            required
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Estimated Hours</label>
          <input
            type="number"
            step="0.5"
            value={formData.estimatedHours}
            onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
            className="select"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'planning' | 'active' | 'review' | 'completed' }))}
          className="select"
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {project ? 'Update' : 'Create'} Project
        </button>
      </div>
    </form>
  );
}

function TimeEntryForm({ 
  timeEntry, 
  projects, 
  onSave, 
  onCancel 
}: { 
  timeEntry?: TimeEntry; 
  projects: Project[]; 
  onSave: (data: Partial<TimeEntry>) => void; 
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    projectId: timeEntry?.projectId || '',
    description: timeEntry?.description || '',
    hours: timeEntry?.hours || 0,
    date: timeEntry?.date || new Date().toISOString().split('T')[0],
    billable: timeEntry?.billable ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label form-label-required">Project</label>
        <select
          required
          value={formData.projectId}
          onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
          className="select"
        >
          <option value="">Select Project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.title} - {project.clientName}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label form-label-required">Description</label>
        <textarea
          required
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="textarea"
          rows={3}
          placeholder="Describe the work performed..."
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label form-label-required">Hours</label>
          <input
            type="number"
            step="0.25"
            required
            value={formData.hours}
            onChange={(e) => setFormData(prev => ({ ...prev, hours: parseFloat(e.target.value) || 0 }))}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label form-label-required">Date</label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            className="input"
          />
        </div>
      </div>
      <div className="form-group">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.billable}
            onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
            className="checkbox"
          />
          <span className="form-label">Billable</span>
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {timeEntry ? 'Update' : 'Log'} Time
        </button>
      </div>
    </form>
  );
}

function InvoiceDetail({ invoice, businessSettings, onClose }: { invoice: Invoice; businessSettings: BusinessSettings; onClose: () => void }) {
  const downloadPDF = () => {
    // Create printable invoice content
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">${businessSettings.businessName || 'AccountingPro'}</h1>
          <p>${businessSettings.address}</p>
          <p>${businessSettings.phone} | ${businessSettings.email}</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <h3>Bill To:</h3>
            <p><strong>${invoice.clientName}</strong></p>
          </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Hours</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Rate</th>
              <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 10px;">${item.description}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.hours}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${item.rate.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">$${item.amount.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: right; margin-bottom: 30px;">
          <p><strong>Subtotal: $${invoice.subtotal.toFixed(2)}</strong></p>
          <p><strong>Tax: $${invoice.tax.toFixed(2)}</strong></p>
          <p style="font-size: 18px; color: #2563eb;"><strong>Total: $${invoice.total.toFixed(2)}</strong></p>
        </div>
        
        ${invoice.notes ? `<div><p><strong>Notes:</strong></p><p>${invoice.notes}</p></div>` : ''}
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice ${invoice.invoiceNumber}</title>
            <style>
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${printContent}
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="heading-3 text-gray-900 dark:text-white">Invoice {invoice.invoiceNumber}</h2>
        <button
          onClick={downloadPDF}
          className="btn btn-primary btn-sm"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="heading-5 text-gray-900 dark:text-white mb-2">From:</h3>
            <p className="font-medium">{businessSettings.businessName || 'AccountingPro'}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{businessSettings.address}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{businessSettings.phone}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{businessSettings.email}</p>
          </div>
          <div>
            <h3 className="heading-5 text-gray-900 dark:text-white mb-2">Bill To:</h3>
            <p className="font-medium">{invoice.clientName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Invoice Date</p>
            <p className="font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
            <p className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <span className={`badge ${
              invoice.status === 'paid' ? 'badge-success' :
              invoice.status === 'sent' ? 'badge-primary' :
              invoice.status === 'overdue' ? 'badge-error' : 'badge-gray'
            }`}>
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="table-container mb-6">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Description</th>
                <th className="table-header-cell text-right">Hours</th>
                <th className="table-header-cell text-right">Rate</th>
                <th className="table-header-cell text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {invoice.items.map((item, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">{item.description}</td>
                  <td className="table-cell text-right">{item.hours}</td>
                  <td className="table-cell text-right">${item.rate.toFixed(2)}</td>
                  <td className="table-cell text-right">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${invoice.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total:</span>
              <span>${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="heading-6 text-gray-900 dark:text-white mb-2">Notes:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;