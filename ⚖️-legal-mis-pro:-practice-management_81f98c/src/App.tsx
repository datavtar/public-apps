import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  User, 
  LogOut, 
  FileText, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Scale, 
  Gavel, 
  Building,
  Phone,
  Mail,
  MapPin,
  Tag,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  FileImage,
  Brain,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Target
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

// Types and Interfaces
interface Case {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  clientId: string;
  type: string;
  status: 'Active' | 'Pending' | 'Closed' | 'On Hold';
  priority: 'High' | 'Medium' | 'Low';
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  description: string;
  assignedLawyer: string;
  billableHours: number;
  totalBilled: number;
  court: string;
  nextHearing?: string;
  notes: string;
  documents: string[];
  timeline: TimelineEvent[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  type: 'Individual' | 'Corporate';
  registrationDate: string;
  totalCases: number;
  activeCases: number;
  totalBilled: number;
  status: 'Active' | 'Inactive';
  notes: string;
  emergencyContact?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  category: 'Contract' | 'Court Filing' | 'Evidence' | 'Correspondence' | 'Legal Brief' | 'Other';
  caseId?: string;
  clientId?: string;
  uploadDate: string;
  size: string;
  description: string;
  tags: string[];
  content?: string;
}

interface FinancialRecord {
  id: string;
  type: 'Invoice' | 'Payment' | 'Expense';
  caseId?: string;
  clientId?: string;
  amount: number;
  date: string;
  description: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  invoiceNumber?: string;
  paymentMethod?: string;
}

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'hearing' | 'filing' | 'meeting' | 'payment' | 'other';
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'Court Hearing' | 'Client Meeting' | 'Deadline' | 'Internal Meeting';
  caseId?: string;
  clientId?: string;
  location?: string;
  description: string;
  reminder: boolean;
}

// Dark Mode Hook
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

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // Modal and Form States
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingCase, setEditingCase] = useState<Case | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editingFinancial, setEditingFinancial] = useState<FinancialRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{type: string, id: string} | null>(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Form States
  const [caseForm, setCaseForm] = useState<Partial<Case>>({});
  const [clientForm, setClientForm] = useState<Partial<Client>>({});
  const [documentForm, setDocumentForm] = useState<Partial<Document>>({});
  const [financialForm, setFinancialForm] = useState<Partial<FinancialRecord>>({});
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadedCases = localStorage.getItem('legalMIS_cases');
    const loadedClients = localStorage.getItem('legalMIS_clients');
    const loadedDocuments = localStorage.getItem('legalMIS_documents');
    const loadedFinancials = localStorage.getItem('legalMIS_financials');
    const loadedEvents = localStorage.getItem('legalMIS_events');

    if (loadedCases) setCases(JSON.parse(loadedCases));
    else initializeSampleData();
    
    if (loadedClients) setClients(JSON.parse(loadedClients));
    if (loadedDocuments) setDocuments(JSON.parse(loadedDocuments));
    if (loadedFinancials) setFinancialRecords(JSON.parse(loadedFinancials));
    if (loadedEvents) setCalendarEvents(JSON.parse(loadedEvents));
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('legalMIS_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('legalMIS_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('legalMIS_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('legalMIS_financials', JSON.stringify(financialRecords));
  }, [financialRecords]);

  useEffect(() => {
    localStorage.setItem('legalMIS_events', JSON.stringify(calendarEvents));
  }, [calendarEvents]);

  const initializeSampleData = () => {
    const sampleCases: Case[] = [
      {
        id: '1',
        caseNumber: 'LEG-2025-001',
        title: 'Smith vs. Johnson Contract Dispute',
        client: 'John Smith',
        clientId: '1',
        type: 'Civil Litigation',
        status: 'Active',
        priority: 'High',
        startDate: '2025-01-15',
        expectedEndDate: '2025-06-15',
        description: 'Contract dispute regarding breach of service agreement',
        assignedLawyer: currentUser?.first_name + ' ' + currentUser?.last_name || 'Legal Team',
        billableHours: 45.5,
        totalBilled: 22750,
        court: 'District Court',
        nextHearing: '2025-02-20',
        notes: 'Client meeting scheduled for next week',
        documents: ['1', '2'],
        timeline: [
          {
            id: '1',
            date: '2025-01-15',
            title: 'Case Filed',
            description: 'Initial complaint filed with court',
            type: 'filing'
          },
          {
            id: '2',
            date: '2025-01-20',
            title: 'Client Meeting',
            description: 'Initial consultation with client',
            type: 'meeting'
          }
        ]
      },
      {
        id: '2',
        caseNumber: 'LEG-2025-002',
        title: 'ABC Corp Employment Case',
        client: 'ABC Corporation',
        clientId: '2',
        type: 'Employment Law',
        status: 'Pending',
        priority: 'Medium',
        startDate: '2025-02-01',
        expectedEndDate: '2025-08-01',
        description: 'Employment discrimination case',
        assignedLawyer: currentUser?.first_name + ' ' + currentUser?.last_name || 'Legal Team',
        billableHours: 12.0,
        totalBilled: 6000,
        court: 'Labor Court',
        notes: 'Awaiting additional documentation',
        documents: ['3'],
        timeline: [
          {
            id: '3',
            date: '2025-02-01',
            title: 'Case Initiated',
            description: 'Initial consultation completed',
            type: 'meeting'
          }
        ]
      }
    ];

    const sampleClients: Client[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0123',
        address: '123 Main St, City, State 12345',
        type: 'Individual',
        registrationDate: '2025-01-10',
        totalCases: 1,
        activeCases: 1,
        totalBilled: 22750,
        status: 'Active',
        notes: 'Reliable client, prefers email communication',
        emergencyContact: 'Jane Smith - +1-555-0124'
      },
      {
        id: '2',
        name: 'ABC Corporation',
        email: 'legal@abccorp.com',
        phone: '+1-555-0456',
        address: '456 Business Ave, Corporate City, State 54321',
        company: 'ABC Corporation',
        type: 'Corporate',
        registrationDate: '2025-01-25',
        totalCases: 1,
        activeCases: 1,
        totalBilled: 6000,
        status: 'Active',
        notes: 'Fortune 500 company, multiple contact points'
      }
    ];

    const sampleDocuments: Document[] = [
      {
        id: '1',
        name: 'Service Agreement Contract',
        type: 'PDF',
        category: 'Contract',
        caseId: '1',
        clientId: '1',
        uploadDate: '2025-01-15',
        size: '2.4 MB',
        description: 'Original service agreement between parties',
        tags: ['contract', 'service', 'dispute'],
        content: 'Service agreement details...'
      },
      {
        id: '2',
        name: 'Court Filing Receipt',
        type: 'PDF',
        category: 'Court Filing',
        caseId: '1',
        uploadDate: '2025-01-16',
        size: '0.8 MB',
        description: 'Receipt of court filing submission',
        tags: ['court', 'filing', 'receipt']
      },
      {
        id: '3',
        name: 'Employment Agreement',
        type: 'DOCX',
        category: 'Contract',
        caseId: '2',
        clientId: '2',
        uploadDate: '2025-02-01',
        size: '1.2 MB',
        description: 'Employee contract under review',
        tags: ['employment', 'contract', 'discrimination']
      }
    ];

    const sampleFinancials: FinancialRecord[] = [
      {
        id: '1',
        type: 'Invoice',
        caseId: '1',
        clientId: '1',
        amount: 22750,
        date: '2025-01-30',
        description: 'Legal services for contract dispute case',
        status: 'Paid',
        invoiceNumber: 'INV-2025-001',
        paymentMethod: 'Bank Transfer'
      },
      {
        id: '2',
        type: 'Invoice',
        caseId: '2',
        clientId: '2',
        amount: 6000,
        date: '2025-02-05',
        description: 'Initial consultation and case analysis',
        status: 'Pending',
        invoiceNumber: 'INV-2025-002'
      },
      {
        id: '3',
        type: 'Expense',
        caseId: '1',
        amount: 250,
        date: '2025-01-20',
        description: 'Court filing fees',
        status: 'Paid'
      }
    ];

    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Court Hearing - Smith vs Johnson',
        date: '2025-02-20',
        time: '10:00 AM',
        type: 'Court Hearing',
        caseId: '1',
        clientId: '1',
        location: 'District Court Room 3',
        description: 'Preliminary hearing for contract dispute case',
        reminder: true
      },
      {
        id: '2',
        title: 'Client Meeting - ABC Corp',
        date: '2025-02-15',
        time: '2:00 PM',
        type: 'Client Meeting',
        caseId: '2',
        clientId: '2',
        location: 'Office Conference Room',
        description: 'Review employment case documentation',
        reminder: true
      }
    ];

    setCases(sampleCases);
    setClients(sampleClients);
    setDocuments(sampleDocuments);
    setFinancialRecords(sampleFinancials);
    setCalendarEvents(sampleEvents);
  };

  // AI Functions
  const handleAnalyzeDocument = (file: File) => {
    setSelectedFile(file);
    const prompt = `Analyze this legal document and extract key information. Return a JSON response with the following structure:
    {
      "documentType": "Contract|Court Filing|Legal Brief|Evidence|Other",
      "title": "Document title",
      "parties": ["Party 1", "Party 2"],
      "keyDates": ["YYYY-MM-DD"],
      "financialAmount": "Amount if any",
      "summary": "Brief summary",
      "urgency": "High|Medium|Low",
      "actionItems": ["Action 1", "Action 2"],
      "tags": ["tag1", "tag2"]
    }`;
    
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(prompt, file);
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    try {
      const parsed = JSON.parse(result);
      // Auto-populate document form with AI results
      if (parsed && typeof parsed === 'object') {
        setDocumentForm(prev => ({
          ...prev,
          name: parsed.title || '',
          category: parsed.documentType || 'Other',
          description: parsed.summary || '',
          tags: parsed.tags || []
        }));
      }
    } catch (error) {
      // If not JSON, treat as markdown
      console.log('AI response is not JSON, displaying as markdown');
    }
  };

  // CRUD Functions
  const addCase = () => {
    if (!caseForm.title || !caseForm.client) return;
    
    const newCase: Case = {
      id: Date.now().toString(),
      caseNumber: `LEG-${new Date().getFullYear()}-${(cases.length + 1).toString().padStart(3, '0')}`,
      title: caseForm.title || '',
      client: caseForm.client || '',
      clientId: caseForm.clientId || '',
      type: caseForm.type || 'General',
      status: caseForm.status || 'Active',
      priority: caseForm.priority || 'Medium',
      startDate: caseForm.startDate || new Date().toISOString().split('T')[0],
      expectedEndDate: caseForm.expectedEndDate || '',
      description: caseForm.description || '',
      assignedLawyer: currentUser?.first_name + ' ' + currentUser?.last_name || 'Legal Team',
      billableHours: 0,
      totalBilled: 0,
      court: caseForm.court || '',
      nextHearing: caseForm.nextHearing || '',
      notes: caseForm.notes || '',
      documents: [],
      timeline: [{
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        title: 'Case Created',
        description: 'Case file opened and assigned',
        type: 'other'
      }]
    };

    setCases([...cases, newCase]);
    setCaseForm({});
    setShowCaseModal(false);
  };

  const updateCase = () => {
    if (!editingCase) return;
    
    setCases(cases.map(c => c.id === editingCase.id ? { ...editingCase, ...caseForm } : c));
    setEditingCase(null);
    setCaseForm({});
    setShowCaseModal(false);
  };

  const deleteCase = (id: string) => {
    setCases(cases.filter(c => c.id !== id));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const addClient = () => {
    if (!clientForm.name || !clientForm.email) return;
    
    const newClient: Client = {
      id: Date.now().toString(),
      name: clientForm.name || '',
      email: clientForm.email || '',
      phone: clientForm.phone || '',
      address: clientForm.address || '',
      company: clientForm.company || '',
      type: clientForm.type || 'Individual',
      registrationDate: new Date().toISOString().split('T')[0],
      totalCases: 0,
      activeCases: 0,
      totalBilled: 0,
      status: 'Active',
      notes: clientForm.notes || '',
      emergencyContact: clientForm.emergencyContact || ''
    };

    setClients([...clients, newClient]);
    setClientForm({});
    setShowClientModal(false);
  };

  const updateClient = () => {
    if (!editingClient) return;
    
    setClients(clients.map(c => c.id === editingClient.id ? { ...editingClient, ...clientForm } : c));
    setEditingClient(null);
    setClientForm({});
    setShowClientModal(false);
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const addDocument = () => {
    if (!documentForm.name) return;
    
    const newDocument: Document = {
      id: Date.now().toString(),
      name: documentForm.name || '',
      type: documentForm.type || 'PDF',
      category: documentForm.category || 'Other',
      caseId: documentForm.caseId || '',
      clientId: documentForm.clientId || '',
      uploadDate: new Date().toISOString().split('T')[0],
      size: '1.0 MB',
      description: documentForm.description || '',
      tags: documentForm.tags || []
    };

    setDocuments([...documents, newDocument]);
    setDocumentForm({});
    setShowDocumentModal(false);
  };

  const addFinancialRecord = () => {
    if (!financialForm.amount || !financialForm.description) return;
    
    const newRecord: FinancialRecord = {
      id: Date.now().toString(),
      type: financialForm.type || 'Invoice',
      caseId: financialForm.caseId || '',
      clientId: financialForm.clientId || '',
      amount: Number(financialForm.amount) || 0,
      date: financialForm.date || new Date().toISOString().split('T')[0],
      description: financialForm.description || '',
      status: financialForm.status || 'Pending',
      invoiceNumber: financialForm.invoiceNumber || '',
      paymentMethod: financialForm.paymentMethod || ''
    };

    setFinancialRecords([...financialRecords, newRecord]);
    setFinancialForm({});
    setShowFinancialModal(false);
  };

  const addCalendarEvent = () => {
    if (!eventForm.title || !eventForm.date) return;
    
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventForm.title || '',
      date: eventForm.date || '',
      time: eventForm.time || '',
      type: eventForm.type || 'Internal Meeting',
      caseId: eventForm.caseId || '',
      clientId: eventForm.clientId || '',
      location: eventForm.location || '',
      description: eventForm.description || '',
      reminder: eventForm.reminder || false
    };

    setCalendarEvents([...calendarEvents, newEvent]);
    setEventForm({});
    setShowCalendarModal(false);
  };

  // Filter Functions
  const getFilteredCases = () => {
    return cases.filter(case_ => {
      const matchesSearch = case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           case_.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || case_.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || case_.priority === priorityFilter;
      const matchesType = typeFilter === 'All' || case_.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });
  };

  // Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = data.map(row => 
      Object.values(row).map(field => 
        typeof field === 'string' ? `"${field.replace(/"/g, '""')}"` : field
      ).join(',')
    ).join('\n');
    
    const csv = headers + '\n' + csvContent;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Statistics for Dashboard
  const getStatistics = () => {
    const activeCases = cases.filter(c => c.status === 'Active').length;
    const totalRevenue = financialRecords.filter(f => f.type === 'Invoice' && f.status === 'Paid').reduce((sum, f) => sum + f.amount, 0);
    const pendingPayments = financialRecords.filter(f => f.type === 'Invoice' && f.status === 'Pending').reduce((sum, f) => sum + f.amount, 0);
    const totalBillableHours = cases.reduce((sum, c) => sum + c.billableHours, 0);
    
    return { activeCases, totalRevenue, pendingPayments, totalBillableHours };
  };

  const statistics = getStatistics();

  // Chart Data
  const caseStatusData = [
    { name: 'Active', value: cases.filter(c => c.status === 'Active').length, fill: '#3b82f6' },
    { name: 'Pending', value: cases.filter(c => c.status === 'Pending').length, fill: '#f59e0b' },
    { name: 'Closed', value: cases.filter(c => c.status === 'Closed').length, fill: '#10b981' },
    { name: 'On Hold', value: cases.filter(c => c.status === 'On Hold').length, fill: '#ef4444' }
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000, expenses: 12000 },
    { month: 'Feb', revenue: 38000, expenses: 11000 },
    { month: 'Mar', revenue: 52000, expenses: 13500 },
    { month: 'Apr', revenue: 47000, expenses: 12500 },
    { month: 'May', revenue: 55000, expenses: 14000 },
    { month: 'Jun', revenue: 62000, expenses: 15000 }
  ];

  // Delete Confirmation Handler
  const handleDelete = () => {
    if (!deleteTarget) return;
    
    switch (deleteTarget.type) {
      case 'case':
        deleteCase(deleteTarget.id);
        break;
      case 'client':
        deleteClient(deleteTarget.id);
        break;
      case 'document':
        setDocuments(documents.filter(d => d.id !== deleteTarget.id));
        break;
      case 'financial':
        setFinancialRecords(financialRecords.filter(f => f.id !== deleteTarget.id));
        break;
      case 'event':
        setCalendarEvents(calendarEvents.filter(e => e.id !== deleteTarget.id));
        break;
    }
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  // Clear All Data
  const clearAllData = () => {
    setCases([]);
    setClients([]);
    setDocuments([]);
    setFinancialRecords([]);
    setCalendarEvents([]);
    localStorage.removeItem('legalMIS_cases');
    localStorage.removeItem('legalMIS_clients');
    localStorage.removeItem('legalMIS_documents');
    localStorage.removeItem('legalMIS_financials');
    localStorage.removeItem('legalMIS_events');
  };

  // Render Functions
  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="heading-2">Legal MIS Dashboard</h2>
          <p className="text-caption">Overview of your legal practice management</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={logout} className="btn btn-secondary">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <p className="stat-title">Active Cases</p>
              <p className="stat-value">{statistics.activeCases}</p>
            </div>
            <Scale className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <p className="stat-title">Total Revenue</p>
              <p className="stat-value">${statistics.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <p className="stat-title">Pending Payments</p>
              <p className="stat-value">${statistics.pendingPayments.toLocaleString()}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <p className="stat-title">Billable Hours</p>
              <p className="stat-value">{statistics.totalBillableHours}</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Case Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={caseStatusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {caseStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Monthly Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Recent Cases</h3>
        <div className="space-y-3">
          {cases.slice(0, 5).map(case_ => (
            <div key={case_.id} className="flex-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div>
                <p className="font-medium">{case_.title}</p>
                <p className="text-caption">{case_.client} • {case_.status}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  case_.priority === 'High' ? 'badge-error' : 
                  case_.priority === 'Medium' ? 'badge-warning' : 'badge-gray'
                }`}>
                  {case_.priority}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCases = () => (
    <div id="cases-tab" className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="heading-2">Case Management</h2>
          <p className="text-caption">Manage all your legal cases</p>
        </div>
        <button 
          onClick={() => {
            setEditingCase(null);
            setCaseForm({});
            setShowCaseModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Case
        </button>
      </div>

      {/* Filters */}
      <div className="card card-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <input
              type="text"
              placeholder="Search cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div className="form-group">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Closed">Closed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
          <div className="form-group">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="select"
            >
              <option value="All">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <button
              onClick={() => exportToCSV(cases, 'cases.csv')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {getFilteredCases().map(case_ => (
          <div key={case_.id} className="card card-padding hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex-between">
                <span className="text-sm font-mono text-gray-500">{case_.caseNumber}</span>
                <span className={`badge ${
                  case_.status === 'Active' ? 'badge-success' : 
                  case_.status === 'Pending' ? 'badge-warning' : 
                  case_.status === 'Closed' ? 'badge-gray' : 'badge-error'
                }`}>
                  {case_.status}
                </span>
              </div>
              
              <div>
                <h3 className="heading-6">{case_.title}</h3>
                <p className="text-caption">{case_.client}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex-between text-sm">
                  <span>Type:</span>
                  <span className="font-medium">{case_.type}</span>
                </div>
                <div className="flex-between text-sm">
                  <span>Priority:</span>
                  <span className={`font-medium ${
                    case_.priority === 'High' ? 'text-red-600' : 
                    case_.priority === 'Medium' ? 'text-orange-600' : 'text-green-600'
                  }`}>{case_.priority}</span>
                </div>
                <div className="flex-between text-sm">
                  <span>Billable Hours:</span>
                  <span className="font-medium">{case_.billableHours}h</span>
                </div>
                <div className="flex-between text-sm">
                  <span>Total Billed:</span>
                  <span className="font-medium">${case_.totalBilled.toLocaleString()}</span>
                </div>
              </div>
              
              {case_.nextHearing && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Next Hearing:</span>
                    <span>{new Date(case_.nextHearing).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCase(case_);
                    setCaseForm(case_);
                    setShowCaseModal(true);
                  }}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget({type: 'case', id: case_.id});
                    setShowDeleteConfirm(true);
                  }}
                  className="btn btn-error btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderClients = () => (
    <div id="clients-tab" className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="heading-2">Client Management</h2>
          <p className="text-caption">Manage your client portfolio</p>
        </div>
        <button 
          onClick={() => {
            setEditingClient(null);
            setClientForm({});
            setShowClientModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map(client => (
          <div key={client.id} className="card card-padding hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex-between">
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                    {client.type === 'Corporate' ? <Building className="w-5 h-5" /> : <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="heading-6">{client.name}</h3>
                    <span className={`badge ${client.status === 'Active' ? 'badge-success' : 'badge-gray'}`}>
                      {client.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{client.address}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Cases</p>
                  <p className="font-bold text-lg">{client.totalCases}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-500">Total Billed</p>
                  <p className="font-bold text-lg">${client.totalBilled.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingClient(client);
                    setClientForm(client);
                    setShowClientModal(true);
                  }}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget({type: 'client', id: client.id});
                    setShowDeleteConfirm(true);
                  }}
                  className="btn btn-error btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div id="documents-tab" className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="heading-2">Document Management</h2>
          <p className="text-caption">Organize and manage legal documents</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setEditingDocument(null);
              setDocumentForm({});
              setShowDocumentModal(true);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Add Document
          </button>
        </div>
      </div>

      {/* AI Document Analysis */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          AI Document Analysis
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAnalyzeDocument(file);
              }}
              className="input flex-1"
            />
            <button
              onClick={() => selectedFile && handleAnalyzeDocument(selectedFile)}
              disabled={!selectedFile || isAiLoading}
              className="btn btn-primary"
            >
              {isAiLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          
          {aiResult && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Result:</h4>
              <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none">
                {aiResult}
              </ReactMarkdown>
            </div>
          )}
          
          {aiError && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-700 dark:text-red-300">
              Error analyzing document: {aiError.toString()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {documents.map(doc => (
          <div key={doc.id} className="card card-padding hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex-between">
                <div className="flex items-center gap-3">
                  <FileImage className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="heading-6">{doc.name}</h3>
                    <p className="text-caption">{doc.type} • {doc.size}</p>
                  </div>
                </div>
                <span className={`badge badge-${
                  doc.category === 'Contract' ? 'primary' : 
                  doc.category === 'Court Filing' ? 'warning' : 
                  doc.category === 'Evidence' ? 'error' : 'gray'
                }`}>
                  {doc.category}
                </span>
              </div>
              
              <p className="text-sm">{doc.description}</p>
              
              <div className="flex flex-wrap gap-1">
                {doc.tags.map(tag => (
                  <span key={tag} className="badge badge-gray text-xs">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-gray-500">
                Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
              </div>
              
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm flex-1">
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget({type: 'document', id: doc.id});
                    setShowDeleteConfirm(true);
                  }}
                  className="btn btn-error btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinancials = () => (
    <div id="financials-tab" className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="heading-2">Financial Management</h2>
          <p className="text-caption">Track billing and payments</p>
        </div>
        <button 
          onClick={() => {
            setEditingFinancial(null);
            setFinancialForm({});
            setShowFinancialModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Type</th>
              <th className="table-header-cell">Amount</th>
              <th className="table-header-cell">Client/Case</th>
              <th className="table-header-cell">Date</th>
              <th className="table-header-cell">Status</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {financialRecords.map(record => (
              <tr key={record.id} className="table-row">
                <td className="table-cell">
                  <span className={`badge ${
                    record.type === 'Invoice' ? 'badge-primary' : 
                    record.type === 'Payment' ? 'badge-success' : 'badge-warning'
                  }`}>
                    {record.type}
                  </span>
                </td>
                <td className="table-cell font-medium">
                  ${record.amount.toLocaleString()}
                </td>
                <td className="table-cell">
                  <div>
                    <p className="font-medium">{clients.find(c => c.id === record.clientId)?.name || 'N/A'}</p>
                    <p className="text-caption">{cases.find(c => c.id === record.caseId)?.title || 'General'}</p>
                  </div>
                </td>
                <td className="table-cell">
                  {new Date(record.date).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    record.status === 'Paid' ? 'badge-success' : 
                    record.status === 'Pending' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget({type: 'financial', id: record.id});
                        setShowDeleteConfirm(true);
                      }}
                      className="btn btn-error btn-sm"
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
  );

  const renderCalendar = () => (
    <div id="calendar-tab" className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="heading-2">Calendar & Schedule</h2>
          <p className="text-caption">Manage court dates and meetings</p>
        </div>
        <button 
          onClick={() => {
            setEditingEvent(null);
            setEventForm({});
            setShowCalendarModal(true);
          }}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {calendarEvents.map(event => (
          <div key={event.id} className="card card-padding hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="flex-between">
                <span className={`badge ${
                  event.type === 'Court Hearing' ? 'badge-error' : 
                  event.type === 'Client Meeting' ? 'badge-primary' : 
                  event.type === 'Deadline' ? 'badge-warning' : 'badge-gray'
                }`}>
                  {event.type}
                </span>
                {event.reminder && <AlertCircle className="w-5 h-5 text-orange-500" />}
              </div>
              
              <div>
                <h3 className="heading-6">{event.title}</h3>
                <p className="text-caption">{event.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{event.time}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{event.location}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button className="btn btn-secondary btn-sm flex-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget({type: 'event', id: event.id});
                    setShowDeleteConfirm(true);
                  }}
                  className="btn btn-error btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div id="reports-tab" className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="heading-2">Reports & Analytics</h2>
          <p className="text-caption">Legal practice insights and analytics</p>
        </div>
        <button 
          onClick={() => exportToCSV(cases, 'legal-report.csv')}
          className="btn btn-primary"
        >
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Case Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'High', value: cases.filter(c => c.priority === 'High').length, fill: '#ef4444' },
                  { name: 'Medium', value: cases.filter(c => c.priority === 'Medium').length, fill: '#f59e0b' },
                  { name: 'Low', value: cases.filter(c => c.priority === 'Low').length, fill: '#10b981' }
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              />
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-600">{cases.length}</p>
            <p className="text-sm text-gray-600">Total Cases</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">${statistics.totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Revenue Generated</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-600">{clients.length}</p>
            <p className="text-sm text-gray-600">Active Clients</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <div>
        <h2 className="heading-2">Settings</h2>
        <p className="text-caption">Manage your legal MIS preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex-between">
              <span>Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className={`toggle ${isDark ? 'toggle-checked' : ''}`}
              >
                <span className="toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <button 
              onClick={() => exportToCSV(cases, 'all-cases.csv')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export All Cases
            </button>
            <button 
              onClick={() => exportToCSV(clients, 'all-clients.csv')}
              className="btn btn-secondary w-full"
            >
              <Download className="w-4 h-4" />
              Export All Clients
            </button>
            <button 
              onClick={clearAllData}
              className="btn btn-error w-full"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      <div className="card card-padding">
        <h3 className="heading-5 mb-4">User Information</h3>
        <div className="space-y-3">
          <div className="flex-between">
            <span>Name:</span>
            <span className="font-medium">{currentUser?.first_name} {currentUser?.last_name}</span>
          </div>
          <div className="flex-between">
            <span>Email:</span>
            <span className="font-medium">{currentUser?.email}</span>
          </div>
          <div className="flex-between">
            <span>Role:</span>
            <span className="font-medium">{currentUser?.role}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Components
  const CaseModal = () => (
    <div className="modal-backdrop" onClick={() => setShowCaseModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5">{editingCase ? 'Edit Case' : 'Add New Case'}</h3>
          <button onClick={() => setShowCaseModal(false)}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Case Title *</label>
            <input
              type="text"
              value={caseForm.title || ''}
              onChange={(e) => setCaseForm({...caseForm, title: e.target.value})}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Client *</label>
              <select
                value={caseForm.clientId || ''}
                onChange={(e) => {
                  const client = clients.find(c => c.id === e.target.value);
                  setCaseForm({
                    ...caseForm, 
                    clientId: e.target.value,
                    client: client?.name || ''
                  });
                }}
                className="select"
                required
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                value={caseForm.type || ''}
                onChange={(e) => setCaseForm({...caseForm, type: e.target.value})}
                className="select"
              >
                <option value="">Select Type</option>
                <option value="Civil Litigation">Civil Litigation</option>
                <option value="Criminal Defense">Criminal Defense</option>
                <option value="Employment Law">Employment Law</option>
                <option value="Corporate Law">Corporate Law</option>
                <option value="Family Law">Family Law</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Intellectual Property">Intellectual Property</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={caseForm.status || 'Active'}
                onChange={(e) => setCaseForm({...caseForm, status: e.target.value as Case['status']})}
                className="select"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Closed">Closed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={caseForm.priority || 'Medium'}
                onChange={(e) => setCaseForm({...caseForm, priority: e.target.value as Case['priority']})}
                className="select"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Court</label>
              <input
                type="text"
                value={caseForm.court || ''}
                onChange={(e) => setCaseForm({...caseForm, court: e.target.value})}
                className="input"
                placeholder="Court name"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={caseForm.startDate || ''}
                onChange={(e) => setCaseForm({...caseForm, startDate: e.target.value})}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected End Date</label>
              <input
                type="date"
                value={caseForm.expectedEndDate || ''}
                onChange={(e) => setCaseForm({...caseForm, expectedEndDate: e.target.value})}
                className="input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Next Hearing</label>
            <input
              type="date"
              value={caseForm.nextHearing || ''}
              onChange={(e) => setCaseForm({...caseForm, nextHearing: e.target.value})}
              className="input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={caseForm.description || ''}
              onChange={(e) => setCaseForm({...caseForm, description: e.target.value})}
              className="textarea"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              value={caseForm.notes || ''}
              onChange={(e) => setCaseForm({...caseForm, notes: e.target.value})}
              className="textarea"
              rows={2}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowCaseModal(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            onClick={editingCase ? updateCase : addCase}
            className="btn btn-primary"
          >
            {editingCase ? 'Update Case' : 'Add Case'}
          </button>
        </div>
      </div>
    </div>
  );

  const ClientModal = () => (
    <div className="modal-backdrop" onClick={() => setShowClientModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>
          <button onClick={() => setShowClientModal(false)}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Name *</label>
              <input
                type="text"
                value={clientForm.name || ''}
                onChange={(e) => setClientForm({...clientForm, name: e.target.value})}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                value={clientForm.type || 'Individual'}
                onChange={(e) => setClientForm({...clientForm, type: e.target.value as Client['type']})}
                className="select"
              >
                <option value="Individual">Individual</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                value={clientForm.email || ''}
                onChange={(e) => setClientForm({...clientForm, email: e.target.value})}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={clientForm.phone || ''}
                onChange={(e) => setClientForm({...clientForm, phone: e.target.value})}
                className="input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address</label>
            <textarea
              value={clientForm.address || ''}
              onChange={(e) => setClientForm({...clientForm, address: e.target.value})}
              className="textarea"
              rows={2}
            />
          </div>
          {clientForm.type === 'Corporate' && (
            <div className="form-group">
              <label className="form-label">Company</label>
              <input
                type="text"
                value={clientForm.company || ''}
                onChange={(e) => setClientForm({...clientForm, company: e.target.value})}
                className="input"
              />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Emergency Contact</label>
            <input
              type="text"
              value={clientForm.emergencyContact || ''}
              onChange={(e) => setClientForm({...clientForm, emergencyContact: e.target.value})}
              className="input"
              placeholder="Contact person and phone"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              value={clientForm.notes || ''}
              onChange={(e) => setClientForm({...clientForm, notes: e.target.value})}
              className="textarea"
              rows={3}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowClientModal(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button 
            onClick={editingClient ? updateClient : addClient}
            className="btn btn-primary"
          >
            {editingClient ? 'Update Client' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  );

  const DocumentModal = () => (
    <div className="modal-backdrop" onClick={() => setShowDocumentModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5">Add New Document</h3>
          <button onClick={() => setShowDocumentModal(false)}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Document Name *</label>
            <input
              type="text"
              value={documentForm.name || ''}
              onChange={(e) => setDocumentForm({...documentForm, name: e.target.value})}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                value={documentForm.category || 'Other'}
                onChange={(e) => setDocumentForm({...documentForm, category: e.target.value as Document['category']})}
                className="select"
              >
                <option value="Contract">Contract</option>
                <option value="Court Filing">Court Filing</option>
                <option value="Evidence">Evidence</option>
                <option value="Correspondence">Correspondence</option>
                <option value="Legal Brief">Legal Brief</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">File Type</label>
              <select
                value={documentForm.type || 'PDF'}
                onChange={(e) => setDocumentForm({...documentForm, type: e.target.value})}
                className="select"
              >
                <option value="PDF">PDF</option>
                <option value="DOC">DOC</option>
                <option value="DOCX">DOCX</option>
                <option value="TXT">TXT</option>
                <option value="IMG">Image</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Associated Case</label>
              <select
                value={documentForm.caseId || ''}
                onChange={(e) => setDocumentForm({...documentForm, caseId: e.target.value})}
                className="select"
              >
                <option value="">Select Case</option>
                {cases.map(case_ => (
                  <option key={case_.id} value={case_.id}>{case_.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Associated Client</label>
              <select
                value={documentForm.clientId || ''}
                onChange={(e) => setDocumentForm({...documentForm, clientId: e.target.value})}
                className="select"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={documentForm.description || ''}
              onChange={(e) => setDocumentForm({...documentForm, description: e.target.value})}
              className="textarea"
              rows={3}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma separated)</label>
            <input
              type="text"
              value={documentForm.tags?.join(', ') || ''}
              onChange={(e) => setDocumentForm({
                ...documentForm, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
              className="input"
              placeholder="contract, evidence, important"
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowDocumentModal(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={addDocument} className="btn btn-primary">
            Add Document
          </button>
        </div>
      </div>
    </div>
  );

  const FinancialModal = () => (
    <div className="modal-backdrop" onClick={() => setShowFinancialModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5">Add Financial Record</h3>
          <button onClick={() => setShowFinancialModal(false)}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Type *</label>
              <select
                value={financialForm.type || 'Invoice'}
                onChange={(e) => setFinancialForm({...financialForm, type: e.target.value as FinancialRecord['type']})}
                className="select"
                required
              >
                <option value="Invoice">Invoice</option>
                <option value="Payment">Payment</option>
                <option value="Expense">Expense</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount *</label>
              <input
                type="number"
                value={financialForm.amount || ''}
                onChange={(e) => setFinancialForm({...financialForm, amount: Number(e.target.value)})}
                className="input"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Associated Case</label>
              <select
                value={financialForm.caseId || ''}
                onChange={(e) => setFinancialForm({...financialForm, caseId: e.target.value})}
                className="select"
              >
                <option value="">Select Case</option>
                {cases.map(case_ => (
                  <option key={case_.id} value={case_.id}>{case_.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Associated Client</label>
              <select
                value={financialForm.clientId || ''}
                onChange={(e) => setFinancialForm({...financialForm, clientId: e.target.value})}
                className="select"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                value={financialForm.date || ''}
                onChange={(e) => setFinancialForm({...financialForm, date: e.target.value})}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                value={financialForm.status || 'Pending'}
                onChange={(e) => setFinancialForm({...financialForm, status: e.target.value as FinancialRecord['status']})}
                className="select"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          {financialForm.type === 'Invoice' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Invoice Number</label>
                <input
                  type="text"
                  value={financialForm.invoiceNumber || ''}
                  onChange={(e) => setFinancialForm({...financialForm, invoiceNumber: e.target.value})}
                  className="input"
                  placeholder="INV-2025-001"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select
                  value={financialForm.paymentMethod || ''}
                  onChange={(e) => setFinancialForm({...financialForm, paymentMethod: e.target.value})}
                  className="select"
                >
                  <option value="">Select Method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              value={financialForm.description || ''}
              onChange={(e) => setFinancialForm({...financialForm, description: e.target.value})}
              className="textarea"
              rows={3}
              required
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowFinancialModal(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={addFinancialRecord} className="btn btn-primary">
            Add Record
          </button>
        </div>
      </div>
    </div>
  );

  const CalendarModal = () => (
    <div className="modal-backdrop" onClick={() => setShowCalendarModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5">Add Calendar Event</h3>
          <button onClick={() => setShowCalendarModal(false)}>
            <XCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="modal-body space-y-4">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              value={eventForm.title || ''}
              onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
              className="input"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                value={eventForm.date || ''}
                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                className="input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                value={eventForm.time || ''}
                onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                className="input"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Event Type</label>
            <select
              value={eventForm.type || 'Internal Meeting'}
              onChange={(e) => setEventForm({...eventForm, type: e.target.value as CalendarEvent['type']})}
              className="select"
            >
              <option value="Court Hearing">Court Hearing</option>
              <option value="Client Meeting">Client Meeting</option>
              <option value="Deadline">Deadline</option>
              <option value="Internal Meeting">Internal Meeting</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Associated Case</label>
              <select
                value={eventForm.caseId || ''}
                onChange={(e) => setEventForm({...eventForm, caseId: e.target.value})}
                className="select"
              >
                <option value="">Select Case</option>
                {cases.map(case_ => (
                  <option key={case_.id} value={case_.id}>{case_.title}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Associated Client</label>
              <select
                value={eventForm.clientId || ''}
                onChange={(e) => setEventForm({...eventForm, clientId: e.target.value})}
                className="select"
              >
                <option value="">Select Client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              value={eventForm.location || ''}
              onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
              className="input"
              placeholder="Court room, office, etc."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              value={eventForm.description || ''}
              onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
              className="textarea"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="reminder"
              checked={eventForm.reminder || false}
              onChange={(e) => setEventForm({...eventForm, reminder: e.target.checked})}
              className="checkbox"
            />
            <label htmlFor="reminder" className="form-label">Set reminder</label>
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowCalendarModal(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={addCalendarEvent} className="btn btn-primary">
            Add Event
          </button>
        </div>
      </div>
    </div>
  );

  // Delete Confirmation Modal
  const DeleteConfirmModal = () => (
    <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
      <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="heading-5">Confirm Delete</h3>
        </div>
        <div className="modal-body">
          <p>Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.</p>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleDelete} className="btn btn-error">
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCaseModal(false);
        setShowClientModal(false);
        setShowDocumentModal(false);
        setShowFinancialModal(false);
        setShowCalendarModal(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Tab navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'cases', label: 'Cases', icon: Scale },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  if (!currentUser) {
    return (
      <div className="flex-center min-h-screen">
        <div className="text-center">
          <h1 className="heading-2 mb-4">Legal MIS Pro</h1>
          <p className="text-caption">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <div id="generation_issue_fallback" className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Gavel className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="heading-6">Legal MIS Pro</h1>
                <p className="text-xs text-gray-500">Practice Management</p>
              </div>
            </div>
          </div>
          
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full nav-link flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === tab.id ? 'nav-link-active' : ''
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <User className="w-8 h-8 text-gray-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{currentUser.first_name} {currentUser.last_name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="container-lg py-8">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'cases' && renderCases()}
            {activeTab === 'clients' && renderClients()}
            {activeTab === 'documents' && renderDocuments()}
            {activeTab === 'financials' && renderFinancials()}
            {activeTab === 'calendar' && renderCalendar()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 py-6 px-8 bg-white dark:bg-gray-800">
            <div className="container-lg">
              <p className="text-center text-caption">
                Copyright © 2025 Datavtar Private Limited. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </div>

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Modals */}
      {showCaseModal && <CaseModal />}
      {showClientModal && <ClientModal />}
      {showDocumentModal && <DocumentModal />}
      {showFinancialModal && <FinancialModal />}
      {showCalendarModal && <CalendarModal />}
      {showDeleteConfirm && <DeleteConfirmModal />}
    </div>
  );
};

export default App;