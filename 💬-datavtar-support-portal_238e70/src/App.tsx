import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  User, Settings, Plus, Search, Filter, Edit, Trash2, Eye, 
  Clock, CheckCircle, AlertCircle, XCircle, FileText, 
  TrendingUp, Users, MessageCircle, BarChart3, Download,
  Upload, Tag, Calendar, ArrowUp, ArrowDown, Mail,
  Bell, Star, Target, Zap, Brain, Moon, Sun
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'billing' | 'general' | 'feature_request';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  customerEmail: string;
  customerName: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: File[];
  aiAnalysis?: {
    suggestedCategory: string;
    suggestedPriority: string;
    sentiment: 'positive' | 'neutral' | 'negative';
    summary: string;
  };
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

type ViewMode = 'customer' | 'admin';
type ActiveTab = 'dashboard' | 'tickets' | 'create' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  // Form States
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'general' as Ticket['category'],
    priority: 'medium' as Ticket['priority']
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // AI States
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [promptText, setPromptText] = useState('');

  // Settings States
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedTickets = localStorage.getItem('datavtar_support_tickets');
    const savedDarkMode = localStorage.getItem('datavtar_dark_mode');
    
    if (savedTickets) {
      const parsedTickets = JSON.parse(savedTickets);
      setTickets(parsedTickets);
      setFilteredTickets(parsedTickets);
    } else {
      // Initialize with sample data
      const sampleTickets: Ticket[] = [
        {
          id: '1',
          title: 'Login Issue - Cannot Access Dashboard',
          description: 'I am unable to log into my account. The system shows "Invalid credentials" even though I am using the correct password.',
          category: 'technical',
          priority: 'high',
          status: 'open',
          customerEmail: 'john.doe@example.com',
          customerName: 'John Doe',
          assignedTo: 'Sarah Wilson',
          createdAt: '2025-06-09T10:30:00Z',
          updatedAt: '2025-06-09T10:30:00Z'
        },
        {
          id: '2',
          title: 'Billing Discrepancy',
          description: 'There seems to be an error in my monthly bill. I was charged twice for the same service.',
          category: 'billing',
          priority: 'medium',
          status: 'in_progress',
          customerEmail: 'jane.smith@example.com',
          customerName: 'Jane Smith',
          assignedTo: 'Mike Johnson',
          createdAt: '2025-06-08T14:15:00Z',
          updatedAt: '2025-06-09T09:20:00Z'
        },
        {
          id: '3',
          title: 'Feature Request - Dark Mode',
          description: 'Would love to have a dark mode option in the application for better user experience during night time usage.',
          category: 'feature_request',
          priority: 'low',
          status: 'resolved',
          customerEmail: 'alex.brown@example.com',
          customerName: 'Alex Brown',
          assignedTo: 'Lisa Chen',
          createdAt: '2025-06-07T16:45:00Z',
          updatedAt: '2025-06-09T11:30:00Z'
        },
        {
          id: '4',
          title: 'API Integration Help',
          description: 'Need assistance with API integration. The documentation is unclear about authentication headers.',
          category: 'technical',
          priority: 'medium',
          status: 'open',
          customerEmail: 'dev.team@company.com',
          customerName: 'Development Team',
          assignedTo: 'David Kumar',
          createdAt: '2025-06-09T08:15:00Z',
          updatedAt: '2025-06-09T08:15:00Z'
        },
        {
          id: '5',
          title: 'Account Upgrade Request',
          description: 'I would like to upgrade my account to the premium plan. What are the steps and pricing?',
          category: 'billing',
          priority: 'low',
          status: 'in_progress',
          customerEmail: 'customer@startup.com',
          customerName: 'Startup Customer',
          assignedTo: 'Sarah Wilson',
          createdAt: '2025-06-08T16:20:00Z',
          updatedAt: '2025-06-09T12:10:00Z'
        },
        {
          id: '6',
          title: 'Data Export Feature Missing',
          description: 'The data export feature mentioned in the documentation is not visible in my dashboard.',
          category: 'feature_request',
          priority: 'medium',
          status: 'resolved',
          customerEmail: 'analyst@corp.com',
          customerName: 'Data Analyst',
          assignedTo: 'Lisa Chen',
          createdAt: '2025-06-07T11:30:00Z',
          updatedAt: '2025-06-08T15:45:00Z'
        }
      ];
      setTickets(sampleTickets);
      setFilteredTickets(sampleTickets);
      localStorage.setItem('datavtar_support_tickets', JSON.stringify(sampleTickets));
    }

    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save tickets to localStorage
  useEffect(() => {
    localStorage.setItem('datavtar_support_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Filter tickets based on search and filters
  useEffect(() => {
    let filtered = tickets;

    // Filter by user email if customer view
    if (viewMode === 'customer' && currentUser) {
      filtered = filtered.filter(ticket => ticket.customerEmail === currentUser.email);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ticket =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    }

    setFilteredTickets(filtered);
  }, [tickets, searchTerm, filterStatus, filterPriority, viewMode, currentUser]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('datavtar_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('datavtar_dark_mode', 'false');
    }
  };

  // Calculate statistics
  const calculateStats = (): TicketStats => {
    const relevantTickets = viewMode === 'customer' && currentUser 
      ? tickets.filter(t => t.customerEmail === currentUser.email)
      : tickets;

    return {
      total: relevantTickets.length,
      open: relevantTickets.filter(t => t.status === 'open').length,
      inProgress: relevantTickets.filter(t => t.status === 'in_progress').length,
      resolved: relevantTickets.filter(t => t.status === 'resolved').length,
      closed: relevantTickets.filter(t => t.status === 'closed').length,
      byPriority: {
        critical: relevantTickets.filter(t => t.priority === 'critical').length,
        high: relevantTickets.filter(t => t.priority === 'high').length,
        medium: relevantTickets.filter(t => t.priority === 'medium').length,
        low: relevantTickets.filter(t => t.priority === 'low').length
      },
      byCategory: {
        technical: relevantTickets.filter(t => t.category === 'technical').length,
        billing: relevantTickets.filter(t => t.category === 'billing').length,
        general: relevantTickets.filter(t => t.category === 'general').length,
        feature_request: relevantTickets.filter(t => t.category === 'feature_request').length
      }
    };
  };

  // AI Analysis Function
  const analyzeTicketWithAI = async (title: string, description: string) => {
    const prompt = `Analyze this support ticket and provide insights in JSON format:
    
Title: ${title}
Description: ${description}

Please return a JSON object with these exact fields:
{
  "suggestedCategory": "technical|billing|general|feature_request",
  "suggestedPriority": "low|medium|high|critical", 
  "sentiment": "positive|neutral|negative",
  "summary": "brief summary of the issue"
}`;

    setPromptText(prompt);
    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError("Failed to analyze ticket with AI");
    }
  };

  // Create new ticket
  const handleCreateTicket = async () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) {
      setAiError("Please fill in all required fields");
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      ...newTicket,
      customerEmail: currentUser?.email || 'guest@example.com',
      customerName: currentUser?.first_name && currentUser?.last_name 
        ? `${currentUser.first_name} ${currentUser.last_name}` 
        : currentUser?.username || 'Guest User',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: selectedFiles.length > 0 ? selectedFiles : undefined
    };

    // Add AI analysis if available
    if (aiResult) {
      try {
        const analysis = JSON.parse(aiResult);
        ticket.aiAnalysis = analysis;
      } catch (error) {
        console.log('Could not parse AI analysis');
      }
    }

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
    setSelectedFiles([]);
    setAiResult(null);
    setActiveTab('tickets');
  };

  // Update ticket
  const handleUpdateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, ...updates, updatedAt: new Date().toISOString() }
        : ticket
    ));
    setSelectedTicket(null);
    setShowTicketModal(false);
  };

  // Delete ticket
  const handleDeleteTicket = (ticketId: string) => {
    setConfirmMessage('Are you sure you want to delete this ticket? This action cannot be undone.');
    setConfirmAction(() => () => {
      setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
      setShowConfirmDialog(false);
      setSelectedTicket(null);
      setShowTicketModal(false);
    });
    setShowConfirmDialog(true);
  };

  // Export data as CSV
  const handleExportData = () => {
    const csvContent = [
      ['ID', 'Title', 'Category', 'Priority', 'Status', 'Customer', 'Created Date', 'Updated Date'],
      ...filteredTickets.map(ticket => [
        ticket.id,
        ticket.title,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.customerName,
        new Date(ticket.createdAt).toLocaleDateString(),
        new Date(ticket.updatedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datavtar-support-tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear all data
  const handleClearAllData = () => {
    setConfirmMessage('Are you sure you want to delete all tickets? This action cannot be undone.');
    setConfirmAction(() => () => {
      setTickets([]);
      localStorage.removeItem('datavtar_support_tickets');
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // File upload handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  // Template download
  const handleDownloadTemplate = () => {
    const templateContent = [
      ['title', 'description', 'category', 'priority', 'customerEmail', 'customerName'],
      ['Sample Issue Title', 'Detailed description of the issue', 'technical', 'medium', 'user@example.com', 'User Name']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ticket-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'resolved': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'closed': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      case 'high': return 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const stats = calculateStats();

  return (
    <div id="welcome_fallback" className={`min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 transition-all duration-300 ${styles.appContainer}`}>
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="container-wide">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#548b99] to-[#95c7c3] flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Datavtar Support</h1>
                  <p className="text-sm text-[#548B99]">Customer Support Portal</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('customer')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'customer' 
                      ? 'bg-white dark:bg-slate-600 text-[#1F2E3D] dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#1F2E3D] dark:hover:text-white'
                  }`}
                >
                  Customer
                </button>
                <button
                  onClick={() => setViewMode('admin')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === 'admin' 
                      ? 'bg-white dark:bg-slate-600 text-[#1F2E3D] dark:text-white shadow-sm' 
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#1F2E3D] dark:hover:text-white'
                  }`}
                >
                  Admin
                </button>
              </div>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-[#1F2E3D] dark:text-[#e7f7f7]">
                    {currentUser?.first_name} {currentUser?.last_name}
                  </p>
                  <p className="text-xs text-[#548B99]">{currentUser?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition-all"
                >
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container-wide">
          <div className="flex gap-1 py-2">
            <button
              id="dashboard-tab"
              onClick={() => setActiveTab('dashboard')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#548b99] text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              id="tickets-tab"
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'tickets'
                  ? 'bg-[#548b99] text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Tickets
            </button>
            <button
              id="create-tab"
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-[#548b99] text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create Ticket
            </button>
            <button
              id="settings-tab"
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-[#548b99] text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="generation_issue_fallback" className="flex-1 py-8">
        <div className="container-wide">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                  {viewMode === 'admin' ? 'Admin Dashboard' : 'My Support Dashboard'}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleExportData}
                    className="btn bg-[#548b99] text-white hover:bg-[#3d6b75] rounded-xl"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Total Tickets</p>
                      <p className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Open Tickets</p>
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.open}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                      <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.inProgress}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Resolved</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Recent Tickets Section */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Recent Tickets</h3>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className="btn bg-[#548b99] text-white hover:bg-[#3d6b75] rounded-xl text-sm"
                  >
                    View All Tickets
                  </button>
                </div>
                
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No tickets found</h4>
                    <p className="text-slate-500 dark:text-slate-500 mb-4">
                      Create your first support ticket to get started.
                    </p>
                    <button
                      onClick={() => setActiveTab('create')}
                      className="btn bg-[#548b99] text-white hover:bg-[#3d6b75] rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Ticket
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTickets.slice(0, 10).map((ticket) => (
                      <div 
                        key={ticket.id} 
                        className="p-6 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-xl hover:shadow-lg transition-all cursor-pointer border border-slate-200 dark:border-slate-600 hover:border-[#548b99] dark:hover:border-[#95c7c3]"
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowTicketModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] line-clamp-1">
                                {ticket.title}
                              </h4>
                              {ticket.aiAnalysis && (
                                <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full">
                                  <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                  <span className="text-xs text-purple-600 dark:text-purple-400">AI</span>
                                </div>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {ticket.customerName}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                              {viewMode === 'admin' && ticket.assignedTo && (
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3" />
                                  {ticket.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            {ticket.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {filteredTickets.length > 10 && (
                  <div className="text-center mt-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Showing 10 of {filteredTickets.length} tickets
                    </p>
                    <button
                      onClick={() => setActiveTab('tickets')}
                      className="btn bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl"
                    >
                      View All {filteredTickets.length} Tickets
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tickets Tab */}
          {activeTab === 'tickets' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                  {viewMode === 'admin' ? 'All Tickets' : 'My Tickets'}
                </h2>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#548b99] focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                  >
                    <option value="all">All Priority</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No tickets found</h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'Create your first support ticket to get started.'}
                    </p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setShowTicketModal(true);
                      }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">{ticket.title}</h3>
                            {ticket.aiAnalysis && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded-full">
                                <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                <span className="text-xs text-purple-600 dark:text-purple-400">AI Analyzed</span>
                              </div>
                            )}
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{ticket.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-500">
                            <span>{ticket.customerName}</span>
                            <span>•</span>
                            <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            {viewMode === 'admin' && ticket.assignedTo && (
                              <>
                                <span>•</span>
                                <span>Assigned to {ticket.assignedTo}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {ticket.status.replace('_', ' ')}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                            {ticket.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Create Ticket Tab */}
          {activeTab === 'create' && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Create New Support Ticket</h2>
                
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newTicket.title}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of your issue"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#548b99] focus:border-transparent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={newTicket.description}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of your issue..."
                      rows={6}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#548b99] focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Category and Priority */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Category
                      </label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value as Ticket['category'] }))}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                      >
                        <option value="general">General</option>
                        <option value="technical">Technical</option>
                        <option value="billing">Billing</option>
                        <option value="feature_request">Feature Request</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Priority
                      </label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as Ticket['priority'] }))}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  {/* File Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Attachments
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                    />
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="text-sm text-slate-600 dark:text-slate-400">
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-purple-600 dark:text-purple-400">AI Analysis</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      Get AI-powered suggestions for category and priority based on your ticket content.
                    </p>
                    <button
                      onClick={() => analyzeTicketWithAI(newTicket.title, newTicket.description)}
                      disabled={!newTicket.title.trim() || !newTicket.description.trim() || isAiLoading}
                      className="btn bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                    >
                      {isAiLoading ? (
                        <>
                          <Zap className="w-4 h-4 mr-2 animate-pulse" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze with AI
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Results */}
                  {aiResult && (
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                      <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">AI Analysis Results</h4>
                      <div className="text-sm text-green-700 dark:text-green-300">
                        {(() => {
                          try {
                            const analysis = JSON.parse(aiResult);
                            return (
                              <div className="space-y-2">
                                <p><strong>Suggested Category:</strong> {analysis.suggestedCategory?.replace('_', ' ')}</p>
                                <p><strong>Suggested Priority:</strong> {analysis.suggestedPriority}</p>
                                <p><strong>Sentiment:</strong> {analysis.sentiment}</p>
                                <p><strong>Summary:</strong> {analysis.summary}</p>
                                <div className="mt-3 flex gap-2">
                                  <button
                                    onClick={() => setNewTicket(prev => ({ ...prev, category: analysis.suggestedCategory }))}
                                    className="btn-sm bg-green-600 text-white hover:bg-green-700 rounded-lg"
                                  >
                                    Apply Category
                                  </button>
                                  <button
                                    onClick={() => setNewTicket(prev => ({ ...prev, priority: analysis.suggestedPriority }))}
                                    className="btn-sm bg-green-600 text-white hover:bg-green-700 rounded-lg"
                                  >
                                    Apply Priority
                                  </button>
                                </div>
                              </div>
                            );
                          } catch {
                            return <pre className="whitespace-pre-wrap">{aiResult}</pre>;
                          }
                        })()}
                      </div>
                    </div>
                  )}

                  {/* AI Error */}
                  {aiError && (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                      <p className="text-sm text-red-700 dark:text-red-300">
                        AI Analysis Error: {aiError.toString()}
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCreateTicket}
                      disabled={!newTicket.title.trim() || !newTicket.description.trim()}
                      className="flex-1 btn bg-[#548b99] text-white hover:bg-[#3d6b75] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Ticket
                    </button>
                    <button
                      onClick={() => {
                        setNewTicket({ title: '', description: '', category: 'general', priority: 'medium' });
                        setSelectedFiles([]);
                        setAiResult(null);
                        setAiError(null);
                      }}
                      className="btn bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-8">Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Data Management */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Data Management</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Export Data</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Download all ticket data as CSV file</p>
                      <button
                        onClick={handleExportData}
                        className="btn bg-[#548b99] text-white hover:bg-[#3d6b75] rounded-xl"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </button>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Import Template</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Download template for bulk ticket import</p>
                      <button
                        onClick={handleDownloadTemplate}
                        className="btn bg-blue-600 text-white hover:bg-blue-700 rounded-xl"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </button>
                    </div>

                    <div>
                      <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Permanently delete all ticket data</p>
                      <button
                        onClick={handleClearAllData}
                        className="btn bg-red-600 text-white hover:bg-red-700 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>

                {/* Appearance Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Appearance</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Theme</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Choose your preferred theme</p>
                      <button
                        onClick={toggleDarkMode}
                        className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                      >
                        {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        <span>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
                      </button>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Statistics</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <div className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7]">Total Tickets</div>
                          <div className="text-slate-600 dark:text-slate-400">{tickets.length}</div>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                          <div className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7]">My Tickets</div>
                          <div className="text-slate-600 dark:text-slate-400">
                            {tickets.filter(t => t.customerEmail === currentUser?.email).length}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Settings */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700 lg:col-span-2">
                  <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">AI Features</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                      <h4 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7] mb-1">Smart Analysis</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">AI-powered ticket categorization and priority suggestions</p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <h4 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7] mb-1">Sentiment Detection</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Understand customer emotion and urgency levels</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <Zap className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <h4 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7] mb-1">Quick Insights</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Generate ticket summaries and key points automatically</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-400">AI Disclaimer</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          AI suggestions are meant to assist and improve efficiency. Please review and validate all AI-generated recommendations before taking action.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">Ticket Details</h3>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Ticket Header */}
              <div>
                <h4 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">{selectedTicket.title}</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status.replace('_', ' ')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    {selectedTicket.category.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                <h5 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">Customer Information</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Name:</span>
                    <span className="ml-2 text-[#1F2E3D] dark:text-[#e7f7f7]">{selectedTicket.customerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Email:</span>
                    <span className="ml-2 text-[#1F2E3D] dark:text-[#e7f7f7]">{selectedTicket.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Created:</span>
                    <span className="ml-2 text-[#1F2E3D] dark:text-[#e7f7f7]">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-600 dark:text-slate-400">Updated:</span>
                    <span className="ml-2 text-[#1F2E3D] dark:text-[#e7f7f7]">{new Date(selectedTicket.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h5 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">Description</h5>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* AI Analysis */}
              {selectedTicket.aiAnalysis && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h5 className="font-medium text-purple-600 dark:text-purple-400">AI Analysis</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Suggested Category:</span>
                      <span className="ml-2 text-[#1F2E3D] dark:text-[#e7f7f7]">{selectedTicket.aiAnalysis.suggestedCategory?.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Suggested Priority:</span>
                      <span className="ml-2 text-[#1F2E3D] dark:text-[#e7f7f7]">{selectedTicket.aiAnalysis.suggestedPriority}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Sentiment:</span>
                      <span className="ml-2 text-[#1F2E3D] dark:text-[#e7f7f7]">{selectedTicket.aiAnalysis.sentiment}</span>
                    </div>
                  </div>
                  {selectedTicket.aiAnalysis.summary && (
                    <div className="mt-3">
                      <span className="text-slate-600 dark:text-slate-400">Summary:</span>
                      <p className="mt-1 text-[#1F2E3D] dark:text-[#e7f7f7]">{selectedTicket.aiAnalysis.summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Actions */}
              {viewMode === 'admin' && (
                <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4">
                  <h5 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Admin Actions</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Update */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as Ticket['status'];
                          handleUpdateTicket(selectedTicket.id, { status: newStatus });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>

                    {/* Priority Update */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => {
                          const newPriority = e.target.value as Ticket['priority'];
                          handleUpdateTicket(selectedTicket.id, { priority: newPriority });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    {/* Assignment */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Assigned To</label>
                      <select
                        value={selectedTicket.assignedTo || ''}
                        onChange={(e) => {
                          handleUpdateTicket(selectedTicket.id, { assignedTo: e.target.value || undefined });
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#548b99]"
                      >
                        <option value="">Unassigned</option>
                        <option value="Sarah Wilson">Sarah Wilson</option>
                        <option value="Mike Johnson">Mike Johnson</option>
                        <option value="Lisa Chen">Lisa Chen</option>
                        <option value="David Kumar">David Kumar</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                      className="btn bg-red-600 text-white hover:bg-red-700 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">Confirm Action</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">{confirmMessage}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (confirmAction) {
                      confirmAction();
                    }
                  }}
                  className="flex-1 btn bg-red-600 text-white hover:bg-red-700 rounded-xl"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 btn bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6">
        <div className="container-wide">
          <div className="text-center text-sm text-slate-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;