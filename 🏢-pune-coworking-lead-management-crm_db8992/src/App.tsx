import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Filter,
  Trash2,
  Edit,
  Search,
  Phone,
  Mail,
  MapPin,
  Building,
  Plus,
  X,
  Check,
  Calendar,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  PieChart,
  Moon,
  Sun,
  ExternalLink,
  Tag,
  ChevronDown
} from 'lucide-react';
import { PieChart as RechartPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define interface for the Lead type
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  source: string;
  requirements: string;
  location: string;
  teamSize: number;
  budget: number;
  notes: string;
  lastContacted: string;
  nextFollowUp: string | null;
  createdAt: string;
  updatedAt: string;
}

// Define interface for Lead Filter
interface LeadFilter {
  status: string;
  source: string;
  location: string;
  search: string;
}

// Define interface for Modal Props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onSave: (lead: Lead) => void;
}

// Constants for lead statuses, sources, and locations
const LEAD_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { value: 'closed-won', label: 'Closed (Won)', color: 'bg-green-500' },
  { value: 'closed-lost', label: 'Closed (Lost)', color: 'bg-red-500' }
];

const LEAD_SOURCES = [
  'Website',
  'Referral',
  'Google',
  'Social Media',
  'Event',
  'Cold Call',
  'Email Campaign',
  'Partner',
  'Advertisement',
  'Other'
];

const PUNE_LOCATIONS = [
  'Kharadi',
  'Hinjewadi',
  'Baner',
  'Viman Nagar',
  'Koregaon Park',
  'Magarpatta',
  'Hadapsar',
  'Aundh',
  'Kothrud',
  'Camp',
  'Shivaji Nagar',
  'Kalyani Nagar'
];

// Generate mock lead data
const generateMockLeads = (): Lead[] => {
  const leads: Lead[] = [];
  
  const names = [
    'Priya Sharma', 'Raj Patel', 'Ananya Desai', 'Vikram Joshi', 
    'Neha Mehta', 'Amit Singh', 'Divya Kumar', 'Rohan Verma',
    'Meera Agarwal', 'Arjun Kapoor', 'Sonal Gupta', 'Karan Malhotra'
  ];
  
  const companies = [
    'TechSphere Solutions', 'InnovatePune', 'Digital Dynamics', 'Quantum Software',
    'Codewave Technologies', 'Future Fintech', 'CreativeSpace', 'Data Innovators',
    'CloudNine Solutions', 'Agile Developers', 'Growth Ventures', 'Smart Automation'
  ];
  
  const requirements = [
    'Looking for a private office for a team of 5',
    'Needs a hot desk for 1 person with 24/7 access',
    'Interested in a dedicated desk solution for 3 people',
    'Requires a meeting room for weekly client meetings',
    'Seeking a virtual office package',
    'Needs event space for company offsite',
    'Looking for a flexible workspace solution',
    'Wants private cabins for executives'
  ];
  
  const statuses: Array<Lead['status']> = [
    'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'
  ];
  
  for (let i = 0; i < 20; i++) {
    const nameIndex = Math.floor(Math.random() * names.length);
    const name = names[nameIndex];
    const email = name.toLowerCase().replace(' ', '.') + '@example.com';
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 60));
    
    const lead: Lead = {
      id: `lead-${i + 1}`,
      name,
      email,
      phone: `+91 ${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
      company: companies[Math.floor(Math.random() * companies.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      source: LEAD_SOURCES[Math.floor(Math.random() * LEAD_SOURCES.length)],
      requirements: requirements[Math.floor(Math.random() * requirements.length)],
      location: PUNE_LOCATIONS[Math.floor(Math.random() * PUNE_LOCATIONS.length)],
      teamSize: Math.floor(Math.random() * 20) + 1,
      budget: (Math.floor(Math.random() * 50) + 10) * 1000,
      notes: '',
      lastContacted: new Date(createdDate.getTime() + Math.random() * (new Date().getTime() - createdDate.getTime())).toISOString(),
      nextFollowUp: Math.random() > 0.3 ? new Date(new Date().getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      createdAt: createdDate.toISOString(),
      updatedAt: new Date(createdDate.getTime() + Math.random() * (new Date().getTime() - createdDate.getTime())).toISOString()
    };
    
    leads.push(lead);
  }
  
  return leads;
};

// Format date for display
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'Not scheduled';
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const App: React.FC = () => {
  // State variables
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<LeadFilter>({
    status: '',
    source: '',
    location: '',
    search: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [view, setView] = useState<'list' | 'analytics'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  const leadsPerPage = 8;
  const modalRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDivElement>(null);
  
  // Effect to initialize leads from localStorage or generate mock data
  useEffect(() => {
    const storedLeads = localStorage.getItem('crm_leads');
    if (storedLeads) {
      setLeads(JSON.parse(storedLeads));
    } else {
      const mockLeads = generateMockLeads();
      setLeads(mockLeads);
      localStorage.setItem('crm_leads', JSON.stringify(mockLeads));
    }
  }, []);
  
  // Effect to filter leads based on filter criteria
  useEffect(() => {
    let result = [...leads];
    
    if (filter.status) {
      result = result.filter(lead => lead.status === filter.status);
    }
    
    if (filter.source) {
      result = result.filter(lead => lead.source === filter.source);
    }
    
    if (filter.location) {
      result = result.filter(lead => lead.location === filter.location);
    }
    
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      result = result.filter(lead => 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.company.toLowerCase().includes(searchLower) ||
        lead.phone.includes(searchLower)
      );
    }
    
    setFilteredLeads(result);
    setCurrentPage(1);
  }, [leads, filter]);

  // Effect to handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  // Effect to handle Escape key press to close modals
  useEffect(() => {
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isDetailsOpen) setIsDetailsOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKeyPress);
    return () => window.removeEventListener('keydown', handleEscKeyPress);
  }, [isModalOpen, isDetailsOpen]);
  
  // Effect to handle clicks outside the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node) && isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDetailsOpen]);
  
  // Helper function to get status badge color
  const getStatusBadgeClass = (status: string): string => {
    const statusObj = LEAD_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-500';
  };
  
  // Handler functions
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddNewLead = () => {
    setCurrentLead(null);
    setIsModalOpen(true);
  };
  
  const handleEditLead = (lead: Lead) => {
    setCurrentLead({...lead});
    setIsModalOpen(true);
  };
  
  const handleDeleteLead = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      const updatedLeads = leads.filter(lead => lead.id !== id);
      setLeads(updatedLeads);
      localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
      
      // Close details panel if the deleted lead was being viewed
      if (selectedLead?.id === id) {
        setIsDetailsOpen(false);
        setSelectedLead(null);
      }
    }
  };
  
  const handleSaveLead = (lead: Lead) => {
    let updatedLeads;
    
    if (lead.id) {
      // Updating existing lead
      updatedLeads = leads.map(l => l.id === lead.id ? {...lead, updatedAt: new Date().toISOString()} : l);
    } else {
      // Adding new lead
      const newLead = {
        ...lead,
        id: `lead-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      updatedLeads = [...leads, newLead];
    }
    
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
    setIsModalOpen(false);
  };
  
  const handleViewLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDetailsOpen(true);
  };
  
  // Analytics data preparation
  const getStatusChartData = () => {
    const statusCounts: Record<string, number> = {};
    LEAD_STATUSES.forEach(status => {
      statusCounts[status.label] = 0;
    });
    
    leads.forEach(lead => {
      const statusObj = LEAD_STATUSES.find(s => s.value === lead.status);
      if (statusObj) {
        statusCounts[statusObj.label]++;
      }
    });
    
    return Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status]
    }));
  };
  
  const getSourceChartData = () => {
    const sourceCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      if (!sourceCounts[lead.source]) {
        sourceCounts[lead.source] = 0;
      }
      sourceCounts[lead.source]++;
    });
    
    return Object.keys(sourceCounts).map(source => ({
      name: source,
      value: sourceCounts[source]
    }));
  };
  
  const getLocationChartData = () => {
    const locationCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      if (!locationCounts[lead.location]) {
        locationCounts[lead.location] = 0;
      }
      locationCounts[lead.location]++;
    });
    
    return Object.keys(locationCounts)
      .map(location => ({
        name: location,
        value: locationCounts[location]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 locations
  };
  
  // Pagination
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  
  // Chart colors
  const CHART_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
  
  // Helper for page navigation
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };
  
  // Placeholder data for empty charts
  const placeholderChartData = [{ name: 'No Data', value: 1 }];

  // Lead Form Modal Component - Inline
  const LeadFormModal = ({ isOpen, onClose, lead, onSave }: ModalProps) => {
    const initialLead: Lead = lead || {
      id: '',
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'new',
      source: '',
      requirements: '',
      location: '',
      teamSize: 1,
      budget: 0,
      notes: '',
      lastContacted: new Date().toISOString(),
      nextFollowUp: null,
      createdAt: '',
      updatedAt: ''
    };
    
    const [formData, setFormData] = useState<Lead>(initialLead);
    
    useEffect(() => {
      if (lead) {
        setFormData({...lead});
      } else {
        setFormData(initialLead);
      }
    }, [lead]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: name === 'teamSize' || name === 'budget' ? Number(value) : value
      }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };
    
    if (!isOpen) return null;
    
    return (
      <div className="modal-backdrop">
        <div 
          ref={modalRef}
          className="modal-content w-full max-w-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-header">
            <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
              {lead ? 'Edit Lead' : 'Add New Lead'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="form-group">
                <label htmlFor="name" className="form-label">Name*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone*</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="company" className="form-label">Company*</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="input"
                  required
                />
              </div>
              
              {/* Lead Information */}
              <div className="form-group">
                <label htmlFor="status" className="form-label">Status*</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  {LEAD_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="source" className="form-label">Source*</label>
                <select
                  id="source"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Source</option>
                  {LEAD_SOURCES.map(source => (
                    <option key={source} value={source}>{source}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="location" className="form-label">Preferred Location*</label>
                <select
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="">Select Location</option>
                  {PUNE_LOCATIONS.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="teamSize" className="form-label">Team Size*</label>
                <input
                  type="number"
                  id="teamSize"
                  name="teamSize"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="input"
                  min="1"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="budget" className="form-label">Budget (₹)*</label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="input"
                  min="0"
                  step="1000"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="nextFollowUp" className="form-label">Next Follow-up</label>
                <input
                  type="date"
                  id="nextFollowUp"
                  name="nextFollowUp"
                  value={formData.nextFollowUp ? new Date(formData.nextFollowUp).toISOString().split('T')[0] : ''}
                  onChange={handleInputChange}
                  className="input"
                />
              </div>
              
              <div className="form-group md:col-span-2">
                <label htmlFor="requirements" className="form-label">Requirements*</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  className="input h-20"
                  required
                ></textarea>
              </div>
              
              <div className="form-group md:col-span-2">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="input h-20"
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={onClose}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
              >
                {lead ? 'Update Lead' : 'Save Lead'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow theme-transition">
        <div className="container-fluid py-4 flex-between">
          <div className="flex items-center space-x-2">
            <Building className="text-primary-600 dark:text-primary-400" size={24} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">PuneWork CRM</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700 focus:outline-none"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="flex items-center space-x-2">
              <User className="text-gray-600 dark:text-gray-300" size={20} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline-block">Admin</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Page Header */}
        <div className="flex-between mb-6 flex-col sm:flex-row gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lead Management</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage your coworking space leads</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setView('list')}
              className={`btn ${view === 'list' ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-white'}`}
            >
              <User className="mr-1" size={16} /> Leads
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`btn ${view === 'analytics' ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-white'}`}
            >
              <BarChart3 className="mr-1" size={16} /> Analytics
            </button>
            <button
              onClick={handleAddNewLead}
              className="btn btn-primary"
            >
              <Plus className="mr-1" size={16} /> Add Lead
            </button>
          </div>
        </div>
        
        {view === 'list' && (
          <>
            {/* Search and Filter Bar */}
            <div className="mb-6 bg-white dark:bg-slate-800 rounded-lg shadow p-4 theme-transition">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search leads..."
                    value={filter.search}
                    onChange={handleFilterChange}
                    className="input pl-10"
                  />
                </div>
                
                <div className="flex flex-wrap md:flex-nowrap gap-2">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 w-full md:w-auto"
                  >
                    <Filter className="mr-1" size={16} /> Filters
                    <ChevronDown className="ml-1" size={16} />
                  </button>
                  
                  <button
                    onClick={() => setFilter({ status: '', source: '', location: '', search: '' })}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 w-full md:w-auto"
                    disabled={!filter.status && !filter.source && !filter.location && !filter.search}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {isFilterOpen && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <div>
                    <label htmlFor="statusFilter" className="form-label">Status</label>
                    <select
                      id="statusFilter"
                      name="status"
                      value={filter.status}
                      onChange={handleFilterChange}
                      className="input"
                    >
                      <option value="">All Statuses</option>
                      {LEAD_STATUSES.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="sourceFilter" className="form-label">Source</label>
                    <select
                      id="sourceFilter"
                      name="source"
                      value={filter.source}
                      onChange={handleFilterChange}
                      className="input"
                    >
                      <option value="">All Sources</option>
                      {LEAD_SOURCES.map(source => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="locationFilter" className="form-label">Location</label>
                    <select
                      id="locationFilter"
                      name="location"
                      value={filter.location}
                      onChange={handleFilterChange}
                      className="input"
                    >
                      <option value="">All Locations</option>
                      {PUNE_LOCATIONS.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            {/* Leads List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden theme-transition">
              {filteredLeads.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No leads found matching your criteria.</p>
                  <button
                    onClick={handleAddNewLead}
                    className="btn btn-primary"
                  >
                    <Plus className="mr-1" size={16} /> Add New Lead
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="table-header px-6 py-3">Name</th>
                          <th className="table-header px-6 py-3">Company</th>
                          <th className="table-header px-6 py-3 hidden md:table-cell">Location</th>
                          <th className="table-header px-6 py-3 hidden md:table-cell">Status</th>
                          <th className="table-header px-6 py-3 hidden lg:table-cell">Last Contact</th>
                          <th className="table-header px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {currentLeads.map(lead => (
                          <tr 
                            key={lead.id} 
                            className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer theme-transition"
                            onClick={() => handleViewLeadDetails(lead)}
                          >
                            <td className="table-cell px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">{lead.name}</div>
                                <div className="text-gray-500 dark:text-gray-400 text-sm">{lead.email}</div>
                              </div>
                            </td>
                            <td className="table-cell px-6 py-4">
                              <div className="font-medium text-gray-900 dark:text-white">{lead.company}</div>
                              <div className="text-gray-500 dark:text-gray-400 text-sm">{lead.teamSize} team members</div>
                            </td>
                            <td className="table-cell px-6 py-4 hidden md:table-cell">
                              <div className="flex items-center">
                                <MapPin className="text-gray-400 mr-1" size={16} />
                                <span>{lead.location}</span>
                              </div>
                            </td>
                            <td className="table-cell px-6 py-4 hidden md:table-cell">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(lead.status)} text-white`}>
                                {LEAD_STATUSES.find(s => s.value === lead.status)?.label || lead.status}
                              </span>
                            </td>
                            <td className="table-cell px-6 py-4 hidden lg:table-cell">
                              {formatDate(lead.lastContacted)}
                            </td>
                            <td className="table-cell px-6 py-4">
                              <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleEditLead(lead); }}
                                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  aria-label="Edit lead"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}
                                  className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                  aria-label="Delete lead"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 sm:px-6">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="btn btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="btn btn-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            Showing <span className="font-medium">{indexOfFirstLead + 1}</span> to <span className="font-medium">
                              {Math.min(indexOfLastLead, filteredLeads.length)}
                            </span> of{' '}
                            <span className="font-medium">{filteredLeads.length}</span> results
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => paginate(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-600"
                            >
                              <span className="sr-only">Previous</span>
                              <ArrowLeft size={16} />
                            </button>
                            
                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                              <button
                                key={number}
                                onClick={() => paginate(number)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium 
                                  ${currentPage === number 
                                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600 dark:bg-primary-900 dark:border-primary-500 dark:text-primary-200' 
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-600'}`}
                              >
                                {number}
                              </button>
                            ))}
                            
                            <button
                              onClick={() => paginate(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-700 dark:border-slate-600 dark:text-gray-300 dark:hover:bg-slate-600"
                            >
                              <span className="sr-only">Next</span>
                              <ArrowRight size={16} />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
        
        {view === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="stat-title">Total Leads</div>
                  <User className="text-primary-600 dark:text-primary-400" size={20} />
                </div>
                <div className="stat-value">{leads.length}</div>
                <div className="stat-desc">All time leads</div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="stat-title">Open Opportunities</div>
                  <Tag className="text-yellow-600 dark:text-yellow-400" size={20} />
                </div>
                <div className="stat-value">
                  {leads.filter(lead => 
                    ['contacted', 'qualified', 'proposal', 'negotiation'].includes(lead.status)
                  ).length}
                </div>
                <div className="stat-desc">Active leads in pipeline</div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div className="stat-title">Conversion Rate</div>
                  <ExternalLink className="text-green-600 dark:text-green-400" size={20} />
                </div>
                <div className="stat-value">
                  {leads.length > 0 
                    ? `${Math.round((leads.filter(lead => lead.status === 'closed-won').length / leads.length) * 100)}%` 
                    : '0%'}
                </div>
                <div className="stat-desc">Closed Won / Total Leads</div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lead Status Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={getStatusChartData().length > 0 ? getStatusChartData() : placeholderChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getStatusChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lead Sources</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getSourceChartData().length > 0 ? getSourceChartData() : placeholderChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                      <Bar dataKey="value" name="Leads" fill="#4F46E5">
                        {getSourceChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Locations</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getLocationChartData().length > 0 ? getLocationChartData() : placeholderChartData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 75, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={70} />
                      <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                      <Bar dataKey="value" name="Leads" fill="#10B981">
                        {getLocationChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lead Pipeline Summary</h3>
                <div className="space-y-4">
                  {LEAD_STATUSES.map(status => {
                    const count = leads.filter(lead => lead.status === status.value).length;
                    const percentage = leads.length > 0 ? (count / leads.length) * 100 : 0;
                    
                    return (
                      <div key={status.value} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{status.label}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{count} leads</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                          <div 
                            className={`h-2.5 rounded-full ${status.color}`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-inner mt-auto py-4 px-4 theme-transition">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Lead Form Modal */}
      <LeadFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={currentLead}
        onSave={handleSaveLead}
      />
      
      {/* Lead Details Sidebar */}
      {isDetailsOpen && selectedLead && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] bg-black bg-opacity-50 flex justify-end">
          <div 
            ref={detailsRef}
            className="lead-details-sidebar max-w-md w-full bg-white dark:bg-slate-800 h-full shadow-xl overflow-y-auto theme-transition animate-slide-in"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedLead.name}</h2>
                <button 
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedLead.status)} text-white`}>
                    {LEAD_STATUSES.find(s => s.value === selectedLead.status)?.label || selectedLead.status}
                  </span>
                  
                  <button
                    onClick={() => handleEditLead(selectedLead)}
                    className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Contact Information</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Mail className="text-gray-400" size={18} />
                      <a 
                        href={`mailto:${selectedLead.email}`} 
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {selectedLead.email}
                      </a>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Phone className="text-gray-400" size={18} />
                      <a 
                        href={`tel:${selectedLead.phone}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        {selectedLead.phone}
                      </a>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Building className="text-gray-400" size={18} />
                      <span>{selectedLead.company}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="text-gray-400" size={18} />
                      <span>{selectedLead.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Lead Details</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                      <p className="font-medium">{selectedLead.source}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Team Size</p>
                      <p className="font-medium">{selectedLead.teamSize} people</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                      <p className="font-medium">₹{selectedLead.budget.toLocaleString('en-IN')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                      <p className="font-medium">{formatDate(selectedLead.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Requirements</h3>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedLead.requirements}</p>
                </div>
                
                {selectedLead.notes && (
                  <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Notes</h3>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{selectedLead.notes}</p>
                  </div>
                )}
                
                <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Follow-up</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last Contacted</p>
                      <p className="font-medium flex items-center">
                        <Calendar className="mr-1 text-gray-400" size={16} />
                        {formatDate(selectedLead.lastContacted)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Next Follow-up</p>
                      <p className="font-medium flex items-center">
                        <Calendar className="mr-1 text-gray-400" size={16} />
                        {formatDate(selectedLead.nextFollowUp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;