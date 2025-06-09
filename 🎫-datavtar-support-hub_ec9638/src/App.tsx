import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  TrendingUp, 
  Download, 
  Upload, 
  Settings, 
  FileText, 
  Send, 
  ArrowLeft,
  BarChart3,
  PieChart,
  Calendar,
  Tag,
  User,
  Mail,
  Phone
} from 'lucide-react';

// Types and Interfaces
interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  tags: string[];
  attachments: string[];
  responses: TicketResponse[];
}

interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  author: string;
  authorRole: 'admin' | 'user';
  createdAt: string;
  isAIGenerated?: boolean;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

interface SystemSettings {
  categories: string[];
  priorities: Array<{ value: string; label: string; color: string }>;
  defaultAssignee: string;
  autoResponse: boolean;
  aiSuggestions: boolean;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketForm, setShowTicketForm] = useState<boolean>(false);
  const [stats, setStats] = useState<TicketStats>({ total: 0, open: 0, inProgress: 0, resolved: 0, closed: 0 });
  const [settings, setSettings] = useState<SystemSettings>({
    categories: ['Technical Issue', 'Billing', 'Feature Request', 'Account Support', 'General Inquiry'],
    priorities: [
      { value: 'low', label: 'Low', color: '#6b7280' },
      { value: 'medium', label: 'Medium', color: '#f59e0b' },
      { value: 'high', label: 'High', color: '#ef4444' },
      { value: 'urgent', label: 'Urgent', color: '#dc2626' }
    ],
    defaultAssignee: 'support@datavtar.com',
    autoResponse: true,
    aiSuggestions: true
  });

  // AI Layer Integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // Form States
  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  const [responseForm, setResponseForm] = useState<string>('');

  // Load data on component mount
  useEffect(() => {
    loadTickets();
    loadSettings();
  }, []);

  // Update stats when tickets change
  useEffect(() => {
    updateStats();
  }, [tickets]);

  const loadTickets = (): void => {
    const savedTickets = localStorage.getItem('support_tickets');
    if (savedTickets) {
      const parsedTickets = JSON.parse(savedTickets);
      setTickets(parsedTickets);
    } else {
      // Initialize with sample data
      const sampleTickets: SupportTicket[] = [
        {
          id: '1',
          title: 'Unable to login to dashboard',
          description: 'I am experiencing issues logging into my dashboard. The login page shows an error message.',
          category: 'Technical Issue',
          priority: 'high',
          status: 'open',
          createdBy: 'john.doe@example.com',
          createdAt: '2025-06-07T10:30:00Z',
          updatedAt: '2025-06-07T10:30:00Z',
          tags: ['login', 'dashboard', 'authentication'],
          attachments: [],
          responses: []
        },
        {
          id: '2',
          title: 'Billing inquiry for enterprise plan',
          description: 'I need clarification on the billing cycle for our enterprise plan subscription.',
          category: 'Billing',
          priority: 'medium',
          status: 'in-progress',
          createdBy: 'sarah.wilson@company.com',
          createdAt: '2025-06-06T14:15:00Z',
          updatedAt: '2025-06-08T09:20:00Z',
          assignedTo: 'support@datavtar.com',
          tags: ['billing', 'enterprise', 'subscription'],
          attachments: [],
          responses: [
            {
              id: 'r1',
              ticketId: '2',
              message: 'Thank you for reaching out. I will review your account details and get back to you with the billing information.',
              author: 'support@datavtar.com',
              authorRole: 'admin',
              createdAt: '2025-06-08T09:20:00Z'
            }
          ]
        }
      ];
      setTickets(sampleTickets);
      localStorage.setItem('support_tickets', JSON.stringify(sampleTickets));
    }
  };

  const loadSettings = (): void => {
    const savedSettings = localStorage.getItem('support_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveTickets = (updatedTickets: SupportTicket[]): void => {
    localStorage.setItem('support_tickets', JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
  };

  const saveSettings = (updatedSettings: SystemSettings): void => {
    localStorage.setItem('support_settings', JSON.stringify(updatedSettings));
    setSettings(updatedSettings);
  };

  const updateStats = (): void => {
    const newStats: TicketStats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
    setStats(newStats);
  };

  const handleCreateTicket = (): void => {
    if (!ticketForm.title.trim() || !ticketForm.description.trim()) {
      return;
    }

    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      title: ticketForm.title,
      description: ticketForm.description,
      category: ticketForm.category || settings.categories[0],
      priority: ticketForm.priority,
      status: 'open',
      createdBy: currentUser?.email || 'anonymous@example.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      attachments: [],
      responses: []
    };

    const updatedTickets = [newTicket, ...tickets];
    saveTickets(updatedTickets);
    setTicketForm({ title: '', description: '', category: '', priority: 'medium' });
    setShowTicketForm(false);

    // Auto-categorize using AI if enabled
    if (settings.aiSuggestions) {
      analyzeTicketWithAI(newTicket);
    }
  };

  const analyzeTicketWithAI = (ticket: SupportTicket): void => {
    const prompt = `Analyze this support ticket and provide categorization suggestions. Return JSON with keys "suggestedCategory", "suggestedPriority", "suggestedTags", "analysis".

    Ticket Details:
    Title: ${ticket.title}
    Description: ${ticket.description}
    Current Category: ${ticket.category}
    Current Priority: ${ticket.priority}

    Available Categories: ${settings.categories.join(', ')}
    Available Priorities: low, medium, high, urgent`;

    setAiPrompt(prompt);
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      console.error('Failed to analyze ticket with AI:', error);
    }
  };

  const handleAddResponse = (ticketId: string): void => {
    if (!responseForm.trim()) return;

    const response: TicketResponse = {
      id: Date.now().toString(),
      ticketId,
      message: responseForm,
      author: currentUser?.email || 'support@datavtar.com',
      authorRole: currentUser?.role === 'admin' ? 'admin' : 'user',
      createdAt: new Date().toISOString()
    };

    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          responses: [...ticket.responses, response],
          updatedAt: new Date().toISOString(),
          status: ticket.status === 'open' ? 'in-progress' : ticket.status
        };
      }
      return ticket;
    });

    saveTickets(updatedTickets);
    setResponseForm('');

    // Update selected ticket if it's the one being updated
    const updatedTicket = updatedTickets.find(t => t.id === ticketId);
    if (updatedTicket) {
      setSelectedTicket(updatedTicket);
    }
  };

  const updateTicketStatus = (ticketId: string, newStatus: SupportTicket['status']): void => {
    const updatedTickets = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    });

    saveTickets(updatedTickets);

    // Update selected ticket if it's the one being updated
    const updatedTicket = updatedTickets.find(t => t.id === ticketId);
    if (updatedTicket) {
      setSelectedTicket(updatedTicket);
    }
  };

  const generateAIResponse = (ticket: SupportTicket): void => {
    const conversationHistory = ticket.responses.map(r => 
      `${r.authorRole}: ${r.message}`
    ).join('\n');

    const prompt = `Generate a helpful customer support response for this ticket. Be professional, empathetic, and solution-focused.

    Ticket: ${ticket.title}
    Description: ${ticket.description}
    Category: ${ticket.category}
    Priority: ${ticket.priority}
    
    Previous conversation:
    ${conversationHistory}
    
    Please provide a professional response that addresses the customer's concern.`;

    setAiPrompt(prompt);
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      console.error('Failed to generate AI response:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const exportTickets = (): void => {
    const csvContent = [
      ['ID', 'Title', 'Category', 'Priority', 'Status', 'Created By', 'Created At', 'Updated At'].join(','),
      ...tickets.map(ticket => [
        ticket.id,
        `"${ticket.title}"`,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.createdBy,
        ticket.createdAt,
        ticket.updatedAt
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'support_tickets.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getPriorityColor = (priority: string): string => {
    const priorityObj = settings.priorities.find(p => p.value === priority);
    return priorityObj?.color || '#6b7280';
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAdmin = currentUser?.role === 'admin';

  // Handle AI result for auto-categorization
  useEffect(() => {
    if (aiResult && aiResult.includes('suggestedCategory')) {
      try {
        const aiData = JSON.parse(aiResult);
        // You could implement auto-updating ticket with AI suggestions here
        console.log('AI Analysis:', aiData);
      } catch (error) {
        console.error('Failed to parse AI response:', error);
      }
    } else if (aiResult && selectedTicket) {
      // AI response for ticket - set it as response form value
      setResponseForm(aiResult);
    }
  }, [aiResult, selectedTicket]);

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-[#f7fafc] to-[#e7f7f7] dark:from-[#2d3748] dark:to-[#1a202c]">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-[#2d3748] shadow-lg border-b border-[#95c7c3]/20">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#548b99] to-[#95c7c3]"></div>
                <h1 className="text-xl font-bold text-[#1f2e3d] dark:text-[#e7f7f7]">
                  Datavtar Support
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#548b99]">
                Welcome, {currentUser?.first_name || 'User'}
              </span>
              <button
                onClick={logout}
                className="btn bg-[#548b99] text-white hover:bg-[#426c7a] transition-all duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-[#2d3748] border-b border-[#95c7c3]/20">
        <div className="container-wide">
          <div className="flex gap-1 py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'tickets', label: 'Tickets', icon: Ticket },
              ...(isAdmin ? [{ id: 'analytics', label: 'Analytics', icon: TrendingUp }] : []),
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-[#548b99] text-white shadow-lg'
                    : 'text-[#548b99] hover:bg-[#e7f7f7] dark:hover:bg-[#4a5568]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-wide py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-[#1f2e3d] dark:text-[#e7f7f7]">Dashboard</h2>
              {!isAdmin && (
                <button
                  id="create-ticket-btn"
                  onClick={() => setShowTicketForm(true)}
                  className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Create Ticket
                </button>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid-responsive">
              <div className="stat-card bg-gradient-to-r from-[#e7f7f7] to-[#cce7e6] border border-[#95c7c3]/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="stat-title text-[#548b99]">Total Tickets</div>
                <div className="stat-value text-[#1f2e3d] dark:text-white">{stats.total}</div>
                <div className="stat-desc text-[#548b99]">All time</div>
              </div>
              <div className="stat-card bg-gradient-to-r from-red-50 to-red-100 border border-red-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="stat-title text-red-600">Open Tickets</div>
                <div className="stat-value text-red-700">{stats.open}</div>
                <div className="stat-desc text-red-600">Needs attention</div>
              </div>
              <div className="stat-card bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="stat-title text-yellow-600">In Progress</div>
                <div className="stat-value text-yellow-700">{stats.inProgress}</div>
                <div className="stat-desc text-yellow-600">Being worked on</div>
              </div>
              <div className="stat-card bg-gradient-to-r from-green-50 to-green-100 border border-green-200 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="stat-title text-green-600">Resolved</div>
                <div className="stat-value text-green-700">{stats.resolved}</div>
                <div className="stat-desc text-green-600">This month</div>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
              <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">Recent Tickets</h3>
              <div className="space-y-3">
                {tickets.slice(0, 5).map(ticket => (
                  <div
                    key={ticket.id}
                    className="p-4 rounded-lg border border-[#95c7c3]/20 hover:bg-[#e7f7f7]/50 dark:hover:bg-[#4a5568]/50 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setActiveTab('tickets');
                    }}
                  >
                    <div className="flex-between mb-2">
                      <h4 className="font-medium text-[#1f2e3d] dark:text-[#e7f7f7]">{ticket.title}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-[#424b54] dark:text-[#f7fafc] mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex-between text-xs text-[#548b99]">
                      <span>{ticket.createdBy}</span>
                      <span>{formatDate(ticket.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {selectedTicket ? (
              // Ticket Detail View
              <div className="space-y-6">
                <div className="flex-between">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="flex items-center gap-2 text-[#548b99] hover:text-[#426c7a] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to tickets
                  </button>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value as SupportTicket['status'])}
                        className="input px-3 py-2 text-sm rounded-lg border border-[#95c7c3]/30"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      <button
                        onClick={() => generateAIResponse(selectedTicket)}
                        disabled={aiLoading}
                        className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2 disabled:opacity-50"
                      >
                        {aiLoading ? 'Generating...' : 'AI Suggest'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                  <div className="flex-between mb-4">
                    <h1 className="text-xl font-bold text-[#1f2e3d] dark:text-[#e7f7f7]">
                      {selectedTicket.title}
                    </h1>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(selectedTicket.status)}
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: getPriorityColor(selectedTicket.priority) }}
                      >
                        {selectedTicket.priority}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-[#e7f7f7]/50 dark:bg-[#4a5568]/50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-[#548b99]">Created by:</span>
                      <p className="text-[#1f2e3d] dark:text-[#e7f7f7]">{selectedTicket.createdBy}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#548b99]">Category:</span>
                      <p className="text-[#1f2e3d] dark:text-[#e7f7f7]">{selectedTicket.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[#548b99]">Created:</span>
                      <p className="text-[#1f2e3d] dark:text-[#e7f7f7]">{formatDate(selectedTicket.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-2">Description</h3>
                    <p className="text-[#424b54] dark:text-[#f7fafc] leading-relaxed">
                      {selectedTicket.description}
                    </p>
                  </div>

                  {/* Responses */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                      Conversation ({selectedTicket.responses.length})
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {selectedTicket.responses.map(response => (
                        <div
                          key={response.id}
                          className={`p-4 rounded-lg ${
                            response.authorRole === 'admin'
                              ? 'bg-[#548b99]/10 border border-[#548b99]/20 ml-4'
                              : 'bg-gray-50 dark:bg-[#4a5568] border border-gray-200 dark:border-[#4a5568] mr-4'
                          }`}
                        >
                          <div className="flex-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-[#1f2e3d] dark:text-[#e7f7f7]">
                                {response.author}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                response.authorRole === 'admin'
                                  ? 'bg-[#548b99] text-white'
                                  : 'bg-gray-200 dark:bg-[#4a5568] text-[#424b54] dark:text-[#f7fafc]'
                              }`}>
                                {response.authorRole}
                              </span>
                              {response.isAIGenerated && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  AI Generated
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#548b99]">
                              {formatDate(response.createdAt)}
                            </span>
                          </div>
                          <p className="text-[#424b54] dark:text-[#f7fafc] leading-relaxed">
                            {response.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Response */}
                  {(isAdmin || selectedTicket.createdBy === currentUser?.email) && (
                    <div className="border-t border-[#95c7c3]/20 pt-4">
                      <h4 className="font-medium text-[#1f2e3d] dark:text-[#e7f7f7] mb-2">Add Response</h4>
                      <div className="flex gap-2">
                        <textarea
                          value={responseForm}
                          onChange={(e) => setResponseForm(e.target.value)}
                          placeholder="Type your response..."
                          className="flex-1 input min-h-[100px] resize-none"
                        />
                        <button
                          onClick={() => handleAddResponse(selectedTicket.id)}
                          disabled={!responseForm.trim()}
                          className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2 disabled:opacity-50 px-4 py-2 h-fit"
                        >
                          <Send className="w-4 h-4" />
                          Send
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Tickets List View
              <div className="space-y-6">
                <div className="flex-between">
                  <h2 className="text-2xl font-bold text-[#1f2e3d] dark:text-[#e7f7f7]">Support Tickets</h2>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={exportTickets}
                        className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                    )}
                    {!isAdmin && (
                      <button
                        onClick={() => setShowTicketForm(true)}
                        className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Ticket
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#548b99] w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="input"
                    >
                      <option value="all">All Status</option>
                      <option value="open">Open</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="input"
                    >
                      <option value="all">All Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <div className="flex items-center gap-2 text-sm text-[#548b99]">
                      <Filter className="w-4 h-4" />
                      {filteredTickets.length} tickets
                    </div>
                  </div>
                </div>

                {/* Tickets List */}
                <div className="grid gap-4">
                  {filteredTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20 hover:shadow-xl transition-all duration-200 cursor-pointer hover:border-[#548b99]/40"
                    >
                      <div className="flex-between mb-3">
                        <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] hover:text-[#548b99] transition-colors">
                          {ticket.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          <span
                            className="px-2 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                          >
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[#424b54] dark:text-[#f7fafc] mb-3 line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex-between text-sm">
                        <div className="flex items-center gap-4">
                          <span className="text-[#548b99]">
                            <User className="w-4 h-4 inline mr-1" />
                            {ticket.createdBy}
                          </span>
                          <span className="text-[#548b99]">
                            <Tag className="w-4 h-4 inline mr-1" />
                            {ticket.category}
                          </span>
                          {ticket.responses.length > 0 && (
                            <span className="text-[#548b99]">
                              <MessageCircle className="w-4 h-4 inline mr-1" />
                              {ticket.responses.length} replies
                            </span>
                          )}
                        </div>
                        <span className="text-[#548b99]">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTickets.length === 0 && (
                  <div className="text-center py-12">
                    <Ticket className="w-16 h-16 text-[#95c7c3] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#1f2e3d] dark:text-[#e7f7f7] mb-2">
                      No tickets found
                    </h3>
                    <p className="text-[#424b54] dark:text-[#f7fafc]">
                      {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first support ticket to get started'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab (Admin Only) */}
        {activeTab === 'analytics' && isAdmin && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1f2e3d] dark:text-[#e7f7f7]">Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                  Ticket Status Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { status: 'open', count: stats.open, color: '#ef4444' },
                    { status: 'in-progress', count: stats.inProgress, color: '#f59e0b' },
                    { status: 'resolved', count: stats.resolved, color: '#10b981' },
                    { status: 'closed', count: stats.closed, color: '#6b7280' }
                  ].map(({ status, count, color }) => (
                    <div key={status} className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: color }}
                      ></div>
                      <span className="capitalize font-medium text-[#1f2e3d] dark:text-[#e7f7f7] min-w-[100px]">
                        {status.replace('-', ' ')}
                      </span>
                      <div className="flex-1 bg-gray-200 dark:bg-[#4a5568] rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: color,
                            width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-[#548b99] font-medium min-w-[40px] text-right">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Distribution */}
              <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                  Priority Distribution
                </h3>
                <div className="space-y-3">
                  {settings.priorities.map(priority => {
                    const count = tickets.filter(t => t.priority === priority.value).length;
                    return (
                      <div key={priority.value} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: priority.color }}
                        ></div>
                        <span className="capitalize font-medium text-[#1f2e3d] dark:text-[#e7f7f7] min-w-[100px]">
                          {priority.label}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-[#4a5568] rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: priority.color,
                              width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-[#548b99] font-medium min-w-[40px] text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                  Category Distribution
                </h3>
                <div className="space-y-3">
                  {settings.categories.map((category, index) => {
                    const count = tickets.filter(t => t.category === category).length;
                    const colors = ['#548b99', '#95c7c3', '#7fb3b5', '#6a9fa7', '#426c7a'];
                    const color = colors[index % colors.length];
                    return (
                      <div key={category} className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: color }}
                        ></div>
                        <span className="font-medium text-[#1f2e3d] dark:text-[#e7f7f7] min-w-[150px]">
                          {category}
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-[#4a5568] rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              backgroundColor: color,
                              width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-[#548b99] font-medium min-w-[40px] text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {tickets
                    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                    .slice(0, 5)
                    .map(ticket => (
                      <div key={ticket.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#e7f7f7]/50 dark:hover:bg-[#4a5568]/50 transition-colors">
                        {getStatusIcon(ticket.status)}
                        <div className="flex-1">
                          <p className="font-medium text-[#1f2e3d] dark:text-[#e7f7f7] line-clamp-1">
                            {ticket.title}
                          </p>
                          <p className="text-sm text-[#548b99]">
                            {formatDate(ticket.updatedAt)}
                          </p>
                        </div>
                        <span
                          className="px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: getPriorityColor(ticket.priority) }}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-[#1f2e3d] dark:text-[#e7f7f7]">Settings</h2>
            
            <div className="grid gap-6">
              {/* Categories Management */}
              <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                  Ticket Categories
                </h3>
                <div className="space-y-3">
                  {settings.categories.map((category, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={category}
                        onChange={(e) => {
                          const newCategories = [...settings.categories];
                          newCategories[index] = e.target.value;
                          setSettings({ ...settings, categories: newCategories });
                        }}
                        className="flex-1 input"
                      />
                      <button
                        onClick={() => {
                          const newCategories = settings.categories.filter((_, i) => i !== index);
                          setSettings({ ...settings, categories: newCategories });
                        }}
                        className="btn bg-red-500 text-white hover:bg-red-600 px-3 py-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      setSettings({
                        ...settings,
                        categories: [...settings.categories, 'New Category']
                      });
                    }}
                    className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>
              </div>

              {/* System Preferences */}
              <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                  System Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#1f2e3d] dark:text-[#e7f7f7]">AI Suggestions</h4>
                      <p className="text-sm text-[#424b54] dark:text-[#f7fafc]">
                        Enable AI-powered ticket categorization and response suggestions
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.aiSuggestions}
                        onChange={(e) => setSettings({ ...settings, aiSuggestions: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#548b99]/25 dark:peer-focus:ring-[#548b99]/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#548b99]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-[#1f2e3d] dark:text-[#e7f7f7]">Auto Response</h4>
                      <p className="text-sm text-[#424b54] dark:text-[#f7fafc]">
                        Automatically send confirmation emails when tickets are created
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoResponse}
                        onChange={(e) => setSettings({ ...settings, autoResponse: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#548b99]/25 dark:peer-focus:ring-[#548b99]/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#548b99]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card bg-white dark:bg-[#2d3748] shadow-lg border border-[#95c7c3]/20">
                <h3 className="text-lg font-semibold text-[#1f2e3d] dark:text-[#e7f7f7] mb-4">
                  Data Management
                </h3>
                {!showDeleteConfirm ? (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={exportTickets}
                      className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export All Data
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Clear All Data
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-500/30">
                    <p className="font-medium text-red-700 dark:text-red-300 mb-4">
                      Are you sure you want to delete all tickets? This action cannot be undone.
                    </p>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          localStorage.removeItem('support_tickets');
                          setTickets([]);
                          setShowDeleteConfirm(false);
                        }}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                      >
                        Yes, Delete All Data
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Settings */}
              <div className="flex justify-end">
                <button
                  onClick={() => saveSettings(settings)}
                  className="btn bg-[#548b99] text-white hover:bg-[#426c7a] flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Ticket Modal */}
      {showTicketForm && (
        <div className="modal-backdrop" onClick={() => setShowTicketForm(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-[#1f2e3d] dark:text-[#e7f7f7]">Create New Ticket</h3>
              <button
                onClick={() => setShowTicketForm(false)}
                className="text-gray-400 hover:text-gray-500 text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  value={ticketForm.title}
                  onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                  placeholder="Brief description of your issue"
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="input"
                >
                  <option value="">Select category</option>
                  {settings.categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as any })}
                  className="input"
                >
                  {settings.priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                  placeholder="Detailed description of your issue or request"
                  className="input min-h-[120px] resize-none"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowTicketForm(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!ticketForm.title.trim() || !ticketForm.description.trim()}
                className="btn bg-[#548b99] text-white hover:bg-[#426c7a] disabled:opacity-50"
              >
                Create Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-[#2d3748] border-t border-[#95c7c3]/20 mt-12">
        <div className="container-wide py-6">
          <div className="text-center text-sm text-[#548b99]">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;