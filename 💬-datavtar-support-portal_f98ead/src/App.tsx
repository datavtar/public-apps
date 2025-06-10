import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, UserPlus, Ticket, Plus, Filter, Search, Settings, 
  MessageCircle, Clock, CheckCircle, AlertCircle, ArrowUp, 
  ArrowDown, Edit, Trash2, Eye, Send, Paperclip, Download,
  Upload, BarChart, TrendingUp, Users, FileText, Calendar,
  Tag, Star, ChevronDown, ChevronUp, X, Check, Mail, Phone,
  Brain
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: File[];
  responses?: TicketResponse[];
  tags?: string[];
  estimatedResolution?: string;
}

interface TicketResponse {
  id: string;
  ticketId: string;
  message: string;
  author: string;
  isAdmin: boolean;
  createdAt: string;
}

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResolutionTime: number;
}

interface FilterOptions {
  status: string;
  priority: string;
  category: string;
  assignedTo: string;
  dateRange: string;
}

const CATEGORIES = [
  'Technical Support',
  'Billing',
  'Feature Request',
  'Bug Report',
  'Account Management',
  'General Inquiry'
];

const PRIORITY_COLORS = {
  Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  High: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const STATUS_COLORS = {
  Open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  Closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
};

function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'All',
    priority: 'All',
    category: 'All',
    assignedTo: 'All',
    dateRange: 'All'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showSettings, setShowSettings] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // AI Integration State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form State
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    priority: 'Medium' as const,
    attachments: [] as File[]
  });
  const [newResponse, setNewResponse] = useState('');

  // Load data from localStorage
  useEffect(() => {
    const savedTickets = localStorage.getItem('datavtar_support_tickets');
    if (savedTickets) {
      setTickets(JSON.parse(savedTickets));
    } else {
      // Initialize with sample data
      const sampleTickets: SupportTicket[] = [
        {
          id: '1',
          title: 'Unable to access dashboard',
          description: 'Getting 500 error when trying to load the main dashboard',
          category: 'Technical Support',
          priority: 'High',
          status: 'Open',
          createdBy: currentUser?.username || 'user1',
          createdAt: '2025-06-08T10:00:00Z',
          updatedAt: '2025-06-08T10:00:00Z',
          tags: ['dashboard', 'error', '500'],
          responses: []
        },
        {
          id: '2',
          title: 'Billing inquiry for premium plan',
          description: 'Need clarification on premium plan features and pricing',
          category: 'Billing',
          priority: 'Medium',
          status: 'In Progress',
          createdBy: currentUser?.username || 'user1',
          assignedTo: 'support_agent1',
          createdAt: '2025-06-07T14:30:00Z',
          updatedAt: '2025-06-09T09:15:00Z',
          tags: ['billing', 'premium'],
          responses: [
            {
              id: 'r1',
              ticketId: '2',
              message: 'Thank you for contacting us. Let me get the pricing details for you.',
              author: 'support_agent1',
              isAdmin: true,
              createdAt: '2025-06-09T09:15:00Z'
            }
          ]
        }
      ];
      setTickets(sampleTickets);
      localStorage.setItem('datavtar_support_tickets', JSON.stringify(sampleTickets));
    }
  }, [currentUser]);

  // Save tickets to localStorage whenever tickets change
  useEffect(() => {
    localStorage.setItem('datavtar_support_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Calculate statistics
  const getTicketStats = (): TicketStats => {
    const userTickets = currentUser?.role === 'admin' 
      ? tickets 
      : tickets.filter(t => t.createdBy === currentUser?.username);
    
    return {
      total: userTickets.length,
      open: userTickets.filter(t => t.status === 'Open').length,
      inProgress: userTickets.filter(t => t.status === 'In Progress').length,
      resolved: userTickets.filter(t => t.status === 'Resolved').length,
      closed: userTickets.filter(t => t.status === 'Closed').length,
      avgResolutionTime: 24 // Placeholder calculation
    };
  };

  // Filter and sort tickets
  const getFilteredTickets = () => {
    let filteredTickets = currentUser?.role === 'admin' 
      ? tickets 
      : tickets.filter(t => t.createdBy === currentUser?.username);

    // Apply filters
    if (filters.status !== 'All') {
      filteredTickets = filteredTickets.filter(t => t.status === filters.status);
    }
    if (filters.priority !== 'All') {
      filteredTickets = filteredTickets.filter(t => t.priority === filters.priority);
    }
    if (filters.category !== 'All') {
      filteredTickets = filteredTickets.filter(t => t.category === filters.category);
    }
    if (filters.assignedTo !== 'All' && currentUser?.role === 'admin') {
      filteredTickets = filteredTickets.filter(t => t.assignedTo === filters.assignedTo);
    }

    // Apply search
    if (searchQuery) {
      filteredTickets = filteredTickets.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.includes(searchQuery)
      );
    }

    // Apply sorting
    filteredTickets.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filteredTickets;
  };

  // AI Functions
  const analyzeTicketWithAI = async (ticket: SupportTicket) => {
    const prompt = `Analyze this support ticket and provide insights:
    
    Title: ${ticket.title}
    Description: ${ticket.description}
    Category: ${ticket.category}
    Priority: ${ticket.priority}
    
    Please provide analysis in JSON format with these fields:
    {
      "severity_assessment": "string",
      "suggested_category": "string", 
      "recommended_priority": "string",
      "initial_response_suggestion": "string",
      "estimated_resolution_time": "string",
      "required_expertise": "string",
      "sentiment": "string"
    }`;

    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to analyze ticket with AI');
      setAiLoading(false);
    }
  };

  const generateResponseWithAI = async (ticket: SupportTicket) => {
    const context = ticket.responses?.map(r => `${r.author}: ${r.message}`).join('\n') || '';
    const prompt = `Generate a helpful response for this support ticket:
    
    Title: ${ticket.title}
    Description: ${ticket.description}
    Category: ${ticket.category}
    Priority: ${ticket.priority}
    Previous responses: ${context}
    
    Provide a professional, helpful response that addresses the user's concern. Keep it concise and actionable.`;

    setAiLoading(true);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to generate AI response');
      setAiLoading(false);
    }
  };

  // Ticket Management Functions
  const createTicket = () => {
    if (!newTicket.title.trim() || !newTicket.description.trim()) return;

    const ticket: SupportTicket = {
      id: Date.now().toString(),
      title: newTicket.title,
      description: newTicket.description,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'Open',
      createdBy: currentUser?.username || 'anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: newTicket.attachments,
      responses: [],
      tags: []
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({
      title: '',
      description: '',
      category: CATEGORIES[0],
      priority: 'Medium',
      attachments: []
    });
    setShowCreateForm(false);
    setActiveTab('tickets');
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, status, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
  };

  const assignTicket = (ticketId: string, assignedTo: string) => {
    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, assignedTo, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
  };

  const deleteTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(ticket => ticket.id !== ticketId));
    setShowDeleteConfirm(null);
  };

  const addResponse = (ticketId: string) => {
    if (!newResponse.trim()) return;

    const response: TicketResponse = {
      id: Date.now().toString(),
      ticketId,
      message: newResponse,
      author: currentUser?.username || 'anonymous',
      isAdmin: currentUser?.role === 'admin',
      createdAt: new Date().toISOString()
    };

    setTickets(prev =>
      prev.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              responses: [...(ticket.responses || []), response],
              updatedAt: new Date().toISOString()
            }
          : ticket
      )
    );
    setNewResponse('');
  };

  // Export functions
  const exportTicketsCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Created By', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...getFilteredTickets().map(ticket =>
        [
          ticket.id,
          `"${ticket.title}"`,
          ticket.category,
          ticket.priority,
          ticket.status,
          ticket.createdBy,
          ticket.createdAt,
          ticket.updatedAt
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datavtar_support_tickets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = getTicketStats();
  const filteredTickets = getFilteredTickets();

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* AI Layer Integration */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          setAiLoading(false);
          // Try to parse JSON response for structured data
          try {
            const parsed = JSON.parse(result);
            if (parsed.initial_response_suggestion && selectedTicket) {
              setNewResponse(parsed.initial_response_suggestion);
            }
          } catch {
            // If not JSON, use as plain text
            if (result && !newResponse) {
              setNewResponse(result);
            }
          }
        }}
        onError={(error) => {
          setAiError(error);
          setAiLoading(false);
        }}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#548b99] to-[#95c7c3] rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                  Datavtar Support Portal
                </h1>
                <p className="text-sm text-[#548B99]">Customer Support Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {currentUser?.first_name || currentUser?.username}
                {currentUser?.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Admin
                  </span>
                )}
              </span>
              <button
                onClick={logout}
                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart },
              { id: 'tickets', label: 'My Tickets', icon: Ticket },
              { id: 'create', label: 'Create Ticket', icon: Plus },
              ...(currentUser?.role === 'admin' ? [{ id: 'admin', label: 'Admin Panel', icon: Users }] : []),
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#548b99] text-[#548b99]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Dashboard</h2>
              <div className="flex gap-2">
                <button
                  onClick={exportTicketsCSV}
                  className="btn bg-[#548b99] text-white hover:bg-[#3d6a75] flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Tickets</div>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-desc">All time tickets</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Open</div>
                <div className="stat-value text-blue-600">{stats.open}</div>
                <div className="stat-desc">Awaiting response</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">In Progress</div>
                <div className="stat-value text-yellow-600">{stats.inProgress}</div>
                <div className="stat-desc">Being worked on</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Resolved</div>
                <div className="stat-value text-green-600">{stats.resolved}</div>
                <div className="stat-desc">Solution provided</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Avg Resolution</div>
                <div className="stat-value text-purple-600">{stats.avgResolutionTime}h</div>
                <div className="stat-desc">Average time</div>
              </div>
            </div>

            {/* Recent Tickets */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Tickets</h3>
              <div className="space-y-3">
                {filteredTickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{ticket.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">#{ticket.id}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${PRIORITY_COLORS[ticket.priority]}`}>
                        {ticket.priority}
                      </span>
                      <span className={`badge ${STATUS_COLORS[ticket.status]}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentUser?.role === 'admin' ? 'All Tickets' : 'My Tickets'}
              </h2>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10 w-full sm:w-64"
                  />
                </div>
                
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="input w-full sm:w-auto"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="input w-full sm:w-auto"
                >
                  <option value="All">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Tickets List */}
            <div className="card p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">
                        <button
                          onClick={() => {
                            setSortBy('date');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Ticket ID
                          {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>
                      </th>
                      <th className="table-header">Title</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">
                        <button
                          onClick={() => {
                            setSortBy('priority');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Priority
                          {sortBy === 'priority' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>
                      </th>
                      <th className="table-header">
                        <button
                          onClick={() => {
                            setSortBy('status');
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          }}
                          className="flex items-center gap-1 hover:text-gray-700"
                        >
                          Status
                          {sortBy === 'status' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
                        </button>
                      </th>
                      <th className="table-header">Created</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="table-cell font-mono text-sm">#{ticket.id}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{ticket.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {ticket.description}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell">{ticket.category}</td>
                        <td className="table-cell">
                          <span className={`badge ${PRIORITY_COLORS[ticket.priority]}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${STATUS_COLORS[ticket.status]}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="table-cell text-sm text-gray-500">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedTicket(ticket);
                                setShowTicketModal(true);
                              }}
                              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            {currentUser?.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => analyzeTicketWithAI(ticket)}
                                  className="btn btn-sm bg-purple-100 text-purple-700 hover:bg-purple-200"
                                  disabled={aiLoading}
                                >
                                  <Brain className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(ticket.id)}
                                  className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredTickets.length === 0 && (
                <div className="text-center py-12">
                  <Ticket className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No tickets found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {searchQuery || Object.values(filters).some(f => f !== 'All')
                      ? 'Try adjusting your search or filters.'
                      : 'Get started by creating your first support ticket.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Ticket Tab */}
        {activeTab === 'create' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Support Ticket</h2>
            
            <div className="card">
              <form onSubmit={(e) => { e.preventDefault(); createTicket(); }} className="space-y-6">
                <div className="form-group">
                  <label className="form-label" htmlFor="ticket-title">
                    Ticket Title *
                  </label>
                  <input
                    id="ticket-title"
                    type="text"
                    value={newTicket.title}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, title: e.target.value }))}
                    className="input"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ticket-category">
                    Category
                  </label>
                  <select
                    id="ticket-category"
                    value={newTicket.category}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ticket-priority">
                    Priority
                  </label>
                  <select
                    id="ticket-priority"
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="input"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ticket-description">
                    Description *
                  </label>
                  <textarea
                    id="ticket-description"
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    rows={6}
                    placeholder="Please provide detailed information about your issue, including steps to reproduce, error messages, and any relevant context."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="ticket-attachments">
                    Attachments (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="ticket-attachments" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-[#548b99] hover:text-[#3d6a75] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#548b99]">
                          <span>Upload files</span>
                          <input
                            id="ticket-attachments"
                            type="file"
                            multiple
                            className="sr-only"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setNewTicket(prev => ({ ...prev, attachments: files }));
                            }}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, PDF up to 10MB each
                      </p>
                    </div>
                  </div>
                  {newTicket.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {newTicket.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewTicket(prev => ({
                                ...prev,
                                attachments: prev.attachments.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewTicket({
                        title: '',
                        description: '',
                        category: CATEGORIES[0],
                        priority: 'Medium',
                        attachments: []
                      });
                    }}
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    className="btn bg-[#548b99] text-white hover:bg-[#3d6a75] flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Admin Panel Tab */}
        {activeTab === 'admin' && currentUser?.role === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
            
            {/* Admin Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">Unassigned Tickets</div>
                <div className="stat-value text-red-600">
                  {tickets.filter(t => !t.assignedTo && t.status !== 'Closed').length}
                </div>
                <div className="stat-desc">Need assignment</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">High Priority</div>
                <div className="stat-value text-orange-600">
                  {tickets.filter(t => t.priority === 'High' || t.priority === 'Critical').length}
                </div>
                <div className="stat-desc">Urgent attention</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Response Rate</div>
                <div className="stat-value text-green-600">85%</div>
                <div className="stat-desc">Last 30 days</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Avg Resolution</div>
                <div className="stat-value text-blue-600">18h</div>
                <div className="stat-desc">This month</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    const openTickets = tickets.filter(t => t.status === 'Open');
                    openTickets.forEach(ticket => {
                      updateTicketStatus(ticket.id, 'In Progress');
                    });
                  }}
                  className="btn bg-yellow-100 text-yellow-800 hover:bg-yellow-200 justify-start"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark All Open as In Progress
                </button>
                
                <button
                  onClick={exportTicketsCSV}
                  className="btn bg-blue-100 text-blue-800 hover:bg-blue-200 justify-start"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Tickets
                </button>
                
                <button
                  onClick={() => {
                    const highPriorityTickets = tickets.filter(t => 
                      (t.priority === 'High' || t.priority === 'Critical') && 
                      !t.assignedTo
                    );
                    highPriorityTickets.forEach(ticket => {
                      assignTicket(ticket.id, 'admin_auto_assign');
                    });
                  }}
                  className="btn bg-red-100 text-red-800 hover:bg-red-200 justify-start"
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Auto-assign High Priority
                </button>
              </div>
            </div>

            {/* AI Analysis Results */}
            {aiResult && (
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Analysis Result</h3>
                  <button
                    onClick={() => setAiResult(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {aiResult}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Export All Data</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download all your support tickets as CSV</p>
                  </div>
                  <button
                    onClick={exportTicketsCSV}
                    className="btn bg-[#548b99] text-white hover:bg-[#3d6a75] flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Clear All Data</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Delete all tickets and reset the portal</p>
                    </div>
                    <button
                      onClick={() => setShowClearAllConfirm(true)}
                      className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#548b99] focus:ring-[#548b99]" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Email notifications for ticket updates</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#548b99] focus:ring-[#548b99]" defaultChecked />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Browser notifications for new responses</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-[#548b99] focus:ring-[#548b99]" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">SMS notifications for critical tickets</span>
                </label>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Support Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#548b99]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Support</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">support@datavtar.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#548b99]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Phone Support</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#548b99]" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Business Hours</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="modal-backdrop" onClick={() => setShowTicketModal(false)}>
          <div className="modal-content max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Ticket #{selectedTicket.id}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created by {selectedTicket.createdBy} on {new Date(selectedTicket.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Ticket Header */}
              <div>
                <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {selectedTicket.title}
                </h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`badge ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                    {selectedTicket.priority}
                  </span>
                  <span className={`badge ${STATUS_COLORS[selectedTicket.status]}`}>
                    {selectedTicket.status}
                  </span>
                  <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {selectedTicket.category}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Admin Controls */}
              {currentUser?.role === 'admin' && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Admin Controls</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => {
                        updateTicketStatus(selectedTicket.id, e.target.value as SupportTicket['status']);
                        setSelectedTicket(prev => prev ? { ...prev, status: e.target.value as SupportTicket['status'] } : null);
                      }}
                      className="input"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    
                    <input
                      type="text"
                      placeholder="Assign to..."
                      value={selectedTicket.assignedTo || ''}
                      onChange={(e) => {
                        assignTicket(selectedTicket.id, e.target.value);
                        setSelectedTicket(prev => prev ? { ...prev, assignedTo: e.target.value } : null);
                      }}
                      className="input"
                    />
                    
                    <button
                      onClick={() => generateResponseWithAI(selectedTicket)}
                      disabled={aiLoading}
                      className="btn bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-2"
                    >
                      <Brain className="w-4 h-4" />
                      {aiLoading ? 'Generating...' : 'AI Suggest'}
                    </button>
                  </div>
                </div>
              )}

              {/* Responses */}
              <div>
                <h5 className="font-medium text-gray-900 dark:text-white mb-3">Responses</h5>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTicket.responses?.map((response) => (
                    <div
                      key={response.id}
                      className={`p-4 rounded-lg ${
                        response.isAdmin
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : 'bg-gray-50 dark:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {response.author}
                          {response.isAdmin && (
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Support Team
                            </span>
                          )}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(response.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{response.message}</p>
                    </div>
                  ))}
                  
                  {(!selectedTicket.responses || selectedTicket.responses.length === 0) && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No responses yet. Be the first to respond!
                    </p>
                  )}
                </div>
              </div>

              {/* Add Response */}
              <div>
                <label className="form-label" htmlFor="new-response">
                  Add Response
                </label>
                <textarea
                  id="new-response"
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="Type your response here..."
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={() => addResponse(selectedTicket.id)}
                    disabled={!newResponse.trim()}
                    className="btn bg-[#548b99] text-white hover:bg-[#3d6a75] flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delete Ticket</h3>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this ticket? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteTicket(showDeleteConfirm)}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearAllConfirm && (
        <div className="modal-backdrop" onClick={() => setShowClearAllConfirm(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Clear All Data</h3>
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete all tickets? This action is irreversible and will remove all ticket data from the application.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowClearAllConfirm(false)}
                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTickets([]);
                  localStorage.removeItem('datavtar_support_tickets');
                  setShowClearAllConfirm(false);
                }}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Confirm & Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;