import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  User, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronDown, 
  Phone, 
  Mail, 
  Building, 
  Calendar, 
  X, 
  ChevronUp,
  Check,
  Download,
  Upload,
  ArrowDownUp,
  Clock,
  FileText,
  Moon,
  Sun
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';

// Define types
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: LeadStatus;
  source: LeadSource;
  notes: string;
  requirements: LeadRequirements;
  createdAt: string;
  lastContactedAt: string | null;
  nextFollowUp: string | null;
  tags: string[];
}

interface LeadRequirements {
  seatingCapacity: number;
  budget: number;
  moveInDate: string | null;
  duration: string;
  amenities: string[];
}

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
type LeadSource = 'Website' | 'Referral' | 'Cold Call' | 'Social Media' | 'Event' | 'Partner' | 'Other';
type SortField = 'name' | 'email' | 'company' | 'status' | 'createdAt' | 'lastContactedAt' | 'nextFollowUp';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State declarations
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState<Lead | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<LeadStatus | ''>('');
  const [filterSource, setFilterSource] = useState<LeadSource | ''>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  
  // Sort states
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dark mode detection and toggle
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setDarkMode(savedMode || prefersDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Sample lead data for initialization
  const sampleLeads: Lead[] = [
    {
      id: '1',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1 (555) 123-4567',
      company: 'Tech Innovators',
      status: 'Qualified',
      source: 'Website',
      notes: 'Looking for a modern space with good amenities for a tech team of 10 people.',
      requirements: {
        seatingCapacity: 10,
        budget: 5000,
        moveInDate: '2023-11-01',
        duration: '12 months',
        amenities: ['High-speed internet', '24/7 access', 'Meeting rooms']
      },
      createdAt: '2023-09-15T09:30:00Z',
      lastContactedAt: '2023-09-20T14:15:00Z',
      nextFollowUp: '2023-09-25T10:00:00Z',
      tags: ['Tech', 'Startup', 'Growing']
    },
    {
      id: '2',
      name: 'Michael Johnson',
      email: 'michael.j@example.com',
      phone: '+1 (555) 987-6543',
      company: 'Creative Designs',
      status: 'Negotiation',
      source: 'Referral',
      notes: 'Design agency looking for a creative space for their team.',
      requirements: {
        seatingCapacity: 15,
        budget: 7500,
        moveInDate: '2023-10-15',
        duration: '24 months',
        amenities: ['Design studio', 'High-speed internet', 'Lounge area']
      },
      createdAt: '2023-09-10T11:45:00Z',
      lastContactedAt: '2023-09-18T16:30:00Z',
      nextFollowUp: '2023-09-22T13:00:00Z',
      tags: ['Design', 'Creative', 'Agency']
    },
    {
      id: '3',
      name: 'Sarah Lee',
      email: 'sarah.lee@example.com',
      phone: '+1 (555) 234-5678',
      company: 'Freelance Writer',
      status: 'New',
      source: 'Social Media',
      notes: 'Freelance writer looking for a hot desk option.',
      requirements: {
        seatingCapacity: 1,
        budget: 300,
        moveInDate: '2023-10-01',
        duration: '3 months',
        amenities: ['Quiet space', 'Coffee']
      },
      createdAt: '2023-09-18T10:00:00Z',
      lastContactedAt: null,
      nextFollowUp: '2023-09-21T09:00:00Z',
      tags: ['Freelancer', 'Writer', 'Hotdesk']
    },
    {
      id: '4',
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+1 (555) 876-5432',
      company: 'Finance Pro',
      status: 'Closed Won',
      source: 'Partner',
      notes: 'Financial consultant signed up for a private office.',
      requirements: {
        seatingCapacity: 3,
        budget: 2500,
        moveInDate: '2023-09-25',
        duration: '12 months',
        amenities: ['Private office', 'Meeting room access', 'Secure facilities']
      },
      createdAt: '2023-09-05T14:20:00Z',
      lastContactedAt: '2023-09-15T11:30:00Z',
      nextFollowUp: null,
      tags: ['Finance', 'Private Office', 'Professional']
    },
    {
      id: '5',
      name: 'Emily Wilson',
      email: 'emily.w@example.com',
      phone: '+1 (555) 345-6789',
      company: 'Legal Advisors',
      status: 'Proposal',
      source: 'Website',
      notes: 'Law firm looking for a professional space for their team.',
      requirements: {
        seatingCapacity: 8,
        budget: 4500,
        moveInDate: '2023-11-15',
        duration: '24 months',
        amenities: ['Private offices', 'Conference room', 'Legal library']
      },
      createdAt: '2023-09-12T09:15:00Z',
      lastContactedAt: '2023-09-17T15:45:00Z',
      nextFollowUp: '2023-09-24T14:00:00Z',
      tags: ['Legal', 'Professional', 'Private']
    }
  ];

  // Initialize from localStorage or use sample data
  useEffect(() => {
    const savedLeads = localStorage.getItem('crm_leads');
    if (savedLeads) {
      setLeads(JSON.parse(savedLeads));
    } else {
      setLeads(sampleLeads);
      localStorage.setItem('crm_leads', JSON.stringify(sampleLeads));
    }
  }, []);

  // Update filtered leads when leads or filters change
  useEffect(() => {
    let result = [...leads];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        lead => lead.name.toLowerCase().includes(term) ||
               lead.email.toLowerCase().includes(term) ||
               lead.company.toLowerCase().includes(term) ||
               lead.phone.toLowerCase().includes(term)
      );
    }
    
    // Apply status filter
    if (filterStatus) {
      result = result.filter(lead => lead.status === filterStatus);
    }
    
    // Apply source filter
    if (filterSource) {
      result = result.filter(lead => lead.source === filterSource);
    }
    
    // Apply date range filter
    if (filterDateFrom) {
      result = result.filter(lead => new Date(lead.createdAt) >= new Date(filterDateFrom));
    }
    
    if (filterDateTo) {
      result = result.filter(lead => new Date(lead.createdAt) <= new Date(filterDateTo));
    }
    
    // Apply sorting
    result.sort((a, b) => {
      // Handle null values for dates
      if (sortField === 'lastContactedAt' || sortField === 'nextFollowUp') {
        const valueA = a[sortField] ? new Date(a[sortField] as string).getTime() : 0;
        const valueB = b[sortField] ? new Date(b[sortField] as string).getTime() : 0;
        
        return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
      }
      
      // Handle date sorting
      if (sortField === 'createdAt') {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Handle string sorting
      const valueA = a[sortField]?.toString().toLowerCase() || '';
      const valueB = b[sortField]?.toString().toLowerCase() || '';
      
      return sortDirection === 'asc' 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    
    setFilteredLeads(result);
  }, [leads, searchTerm, filterStatus, filterSource, filterDateFrom, filterDateTo, sortField, sortDirection]);

  // Save to localStorage whenever leads change
  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);

  // Handle keyboard events (Escape key for modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsFilterModalOpen(false);
        setIsViewModalOpen(false);
        setIsImportModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle clicks outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsFilterModalOpen(false);
        setIsViewModalOpen(false);
        setIsImportModalOpen(false);
      }
    };

    if (
      isAddModalOpen || 
      isEditModalOpen || 
      isDeleteModalOpen || 
      isFilterModalOpen ||
      isViewModalOpen ||
      isImportModalOpen
    ) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAddModalOpen, isEditModalOpen, isDeleteModalOpen, isFilterModalOpen, isViewModalOpen, isImportModalOpen]);

  // Modal control functions
  const openAddModal = () => {
    setCurrentLead(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setCurrentLead({...lead});
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (lead: Lead) => {
    setCurrentLead(lead);
    setIsDeleteModalOpen(true);
  };

  const openViewModal = (lead: Lead) => {
    setCurrentLead(lead);
    setIsViewModalOpen(true);
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsFilterModalOpen(false);
    setIsViewModalOpen(false);
    setIsImportModalOpen(false);
    setCurrentLead(null);
  };

  // CRUD operations
  const addLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newLead: Lead = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      status: formData.get('status') as LeadStatus,
      source: formData.get('source') as LeadSource,
      notes: formData.get('notes') as string,
      requirements: {
        seatingCapacity: parseInt(formData.get('seatingCapacity') as string, 10),
        budget: parseInt(formData.get('budget') as string, 10),
        moveInDate: formData.get('moveInDate') as string,
        duration: formData.get('duration') as string,
        amenities: (formData.get('amenities') as string).split(',').map(item => item.trim())
      },
      createdAt: new Date().toISOString(),
      lastContactedAt: null,
      nextFollowUp: formData.get('nextFollowUp') as string || null,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim())
    };
    
    setLeads(prevLeads => [...prevLeads, newLead]);
    closeAllModals();
  };

  const updateLead = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentLead) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedLead: Lead = {
      ...currentLead,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      status: formData.get('status') as LeadStatus,
      source: formData.get('source') as LeadSource,
      notes: formData.get('notes') as string,
      requirements: {
        seatingCapacity: parseInt(formData.get('seatingCapacity') as string, 10),
        budget: parseInt(formData.get('budget') as string, 10),
        moveInDate: formData.get('moveInDate') as string,
        duration: formData.get('duration') as string,
        amenities: (formData.get('amenities') as string).split(',').map(item => item.trim())
      },
      lastContactedAt: new Date().toISOString(),
      nextFollowUp: formData.get('nextFollowUp') as string || null,
      tags: (formData.get('tags') as string).split(',').map(tag => tag.trim())
    };
    
    setLeads(prevLeads => 
      prevLeads.map(lead => 
        lead.id === updatedLead.id ? updatedLead : lead
      )
    );
    
    closeAllModals();
  };

  const deleteLead = () => {
    if (!currentLead) return;
    
    setLeads(prevLeads => prevLeads.filter(lead => lead.id !== currentLead.id));
    closeAllModals();
  };

  // Status color mapping function
  const getStatusColor = (status: LeadStatus): string => {
    const statusColors: Record<LeadStatus, string> = {
      'New': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Contacted': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Qualified': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Proposal': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'Negotiation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Closed Won': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Closed Lost': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterStatus('');
    setFilterSource('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setIsFilterModalOpen(false);
  };

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Format date-time for display
  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Export leads to CSV
  const exportLeads = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Created At', 'Last Contacted', 'Next Follow Up', 'Notes', 'Seating Capacity', 'Budget', 'Move In Date', 'Duration', 'Amenities', 'Tags'];
    
    const csvContent = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        `"${lead.name}"`,
        `"${lead.email}"`,
        `"${lead.phone}"`,
        `"${lead.company}"`,
        `"${lead.status}"`,
        `"${lead.source}"`,
        `"${formatDateTime(lead.createdAt)}"`,
        `"${formatDateTime(lead.lastContactedAt)}"`,
        `"${formatDateTime(lead.nextFollowUp)}"`,
        `"${lead.notes.replace(/"/g, '""')}"`,
        lead.requirements.seatingCapacity,
        lead.requirements.budget,
        `"${formatDate(lead.requirements.moveInDate)}"`,
        `"${lead.requirements.duration}"`,
        `"${lead.requirements.amenities.join(', ')}"`,
        `"${lead.tags.join(', ')}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `coworking_leads_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export template CSV
  const downloadTemplate = () => {
    const headers = ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Notes', 'Seating Capacity', 'Budget', 'Move In Date', 'Duration', 'Amenities', 'Next Follow Up', 'Tags'];
    const sample = ['John Doe', 'john@example.com', '+1 (555) 123-4567', 'Example Co', 'New', 'Website', 'Looking for a space for 5 people', '5', '2500', '2023-12-01', '12 months', 'High-speed internet, Meeting rooms', '2023-10-15', 'Tech, Startup'];
    
    const csvContent = [
      headers.join(','),
      sample.join(',')
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'coworking_leads_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle file upload click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Import leads from CSV
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',');

        const newLeads: Lead[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          const values = rows[i].split(',');
          const leadData: Record<string, string> = {};
          
          headers.forEach((header, index) => {
            leadData[header.trim()] = values[index]?.trim() || '';
          });
          
          const newLead: Lead = {
            id: Date.now().toString() + i,
            name: leadData['Name'] || '',
            email: leadData['Email'] || '',
            phone: leadData['Phone'] || '',
            company: leadData['Company'] || '',
            status: (leadData['Status'] as LeadStatus) || 'New',
            source: (leadData['Source'] as LeadSource) || 'Other',
            notes: leadData['Notes'] || '',
            requirements: {
              seatingCapacity: parseInt(leadData['Seating Capacity'] || '0', 10),
              budget: parseInt(leadData['Budget'] || '0', 10),
              moveInDate: leadData['Move In Date'] || null,
              duration: leadData['Duration'] || '',
              amenities: (leadData['Amenities'] || '').split(',').map(item => item.trim())
            },
            createdAt: new Date().toISOString(),
            lastContactedAt: null,
            nextFollowUp: leadData['Next Follow Up'] || null,
            tags: (leadData['Tags'] || '').split(',').map(tag => tag.trim())
          };
          
          newLeads.push(newLead);
        }
        
        if (newLeads.length > 0) {
          setLeads(prev => [...prev, ...newLeads]);
          alert(`Successfully imported ${newLeads.length} leads.`);
          setIsImportModalOpen(false);
        }
      } catch (error) {
        alert('Error parsing the CSV file. Please check the format and try again.');
        console.error('CSV import error:', error);
      }
    };
    reader.readAsText(file);
  };

  // Dashboard data computations
  const getDashboardData = useCallback(() => {
    // Status distribution for pie chart
    const statusDistribution = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const pieChartData = Object.entries(statusDistribution).map(([name, value]) => ({ name, value }));

    // Source distribution for bar chart
    const sourceDistribution = leads.reduce<Record<string, number>>((acc, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {});

    const barChartData = Object.entries(sourceDistribution)
      .map(([name, value]) => ({ name, value }));

    // Monthly lead count
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        month: format(date, 'MMM yyyy'),
        date: date
      };
    }).reverse();

    const monthlyLeads = last6Months.map(({ month, date }) => {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = leads.filter(lead => {
        const createdDate = new Date(lead.createdAt);
        return createdDate >= startOfMonth && createdDate <= endOfMonth;
      }).length;
      
      return { name: month, value: count };
    });

    // Following up data
    const currentDate = new Date();
    const upcomingFollowUps = leads.filter(lead => {
      if (!lead.nextFollowUp) return false;
      const followUpDate = new Date(lead.nextFollowUp);
      const diffDays = Math.floor((followUpDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    });

    return {
      totalLeads: leads.length,
      newLeads: leads.filter(lead => lead.status === 'New').length,
      qualifiedLeads: leads.filter(lead => lead.status === 'Qualified').length,
      closedWon: leads.filter(lead => lead.status === 'Closed Won').length,
      closedLost: leads.filter(lead => lead.status === 'Closed Lost').length,
      pieChartData,
      barChartData,
      monthlyLeads,
      upcomingFollowUps,
      conversionRate: leads.length > 0 ? ((leads.filter(lead => lead.status === 'Closed Won').length / leads.length) * 100).toFixed(1) : '0'
    };
  }, [leads]);

  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff7f0e'];

  const dashboardData = getDashboardData();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Coworking CRM
            </h1>
            <div className="flex items-center gap-4">
              <button 
                className="btn-sm theme-transition flex items-center gap-1" 
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                <span className="hidden sm:inline">{darkMode ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <nav className="flex space-x-4">
            <button
              className={`px-3 py-2 text-sm font-medium ${activeTab === 'list' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} theme-transition`}
              onClick={() => setActiveTab('list')}
            >
              Leads List
            </button>
            <button
              className={`px-3 py-2 text-sm font-medium ${activeTab === 'dashboard' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'} theme-transition`}
              onClick={() => setActiveTab('dashboard')}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow container-fluid py-6">
        {activeTab === 'list' ? (
          <>
            {/* Leads List View */}
            <div className="flex-between mb-6 flex-col sm:flex-row gap-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Leads Management</h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    className="input input-sm pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>
                <button 
                  className="btn btn-sm flex items-center justify-center gap-1" 
                  onClick={() => setIsFilterModalOpen(true)}
                  aria-label="Filter leads"
                >
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
                <div className="dropdown relative">
                  <button className="btn btn-sm bg-gray-700 text-white hover:bg-gray-800 focus:ring-gray-500 flex items-center justify-center gap-1" aria-label="Export/Import options">
                    <span>Export/Import</span>
                    <ChevronDown size={16} />
                  </button>
                  <div className={`${styles.dropdownMenu} absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-10 hidden group-focus-within:block`}>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2" 
                      onClick={exportLeads}
                    >
                      <Download size={16} /> Export to CSV
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                      onClick={() => setIsImportModalOpen(true)}
                    >
                      <Upload size={16} /> Import from CSV
                    </button>
                  </div>
                </div>
                <button 
                  className="btn btn-primary btn-sm flex items-center justify-center gap-1"
                  onClick={openAddModal}
                  aria-label="Add new lead"
                >
                  <Plus size={16} />
                  <span>Add Lead</span>
                </button>
              </div>
            </div>

            {/* Filters active indicator */}
            {(filterStatus || filterSource || filterDateFrom || filterDateTo) && (
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Active filters:</span>
                {filterStatus && (
                  <span className="badge badge-info flex items-center gap-1">
                    Status: {filterStatus}
                    <button onClick={() => setFilterStatus('')} aria-label="Remove status filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterSource && (
                  <span className="badge badge-info flex items-center gap-1">
                    Source: {filterSource}
                    <button onClick={() => setFilterSource('')} aria-label="Remove source filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterDateFrom && (
                  <span className="badge badge-info flex items-center gap-1">
                    From: {formatDate(filterDateFrom)}
                    <button onClick={() => setFilterDateFrom('')} aria-label="Remove date from filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                {filterDateTo && (
                  <span className="badge badge-info flex items-center gap-1">
                    To: {formatDate(filterDateTo)}
                    <button onClick={() => setFilterDateTo('')} aria-label="Remove date to filter">
                      <X size={12} />
                    </button>
                  </span>
                )}
                <button 
                  onClick={resetFilters} 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  aria-label="Clear all filters"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow theme-transition">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700">
                    <th className="table-header py-3 pl-4 pr-3">
                      <button 
                        className="flex items-center gap-1 focus:outline-none"
                        onClick={() => handleSort('name')}
                        aria-label="Sort by name"
                      >
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="table-header py-3 px-3 hidden md:table-cell">
                      <button 
                        className="flex items-center gap-1 focus:outline-none"
                        onClick={() => handleSort('email')}
                        aria-label="Sort by email"
                      >
                        Contact
                        {sortField === 'email' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="table-header py-3 px-3 hidden lg:table-cell">
                      <button 
                        className="flex items-center gap-1 focus:outline-none"
                        onClick={() => handleSort('company')}
                        aria-label="Sort by company"
                      >
                        Company
                        {sortField === 'company' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="table-header py-3 px-3">
                      <button 
                        className="flex items-center gap-1 focus:outline-none"
                        onClick={() => handleSort('status')}
                        aria-label="Sort by status"
                      >
                        Status
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="table-header py-3 px-3 hidden md:table-cell">
                      <button 
                        className="flex items-center gap-1 focus:outline-none"
                        onClick={() => handleSort('createdAt')}
                        aria-label="Sort by created date"
                      >
                        Created
                        {sortField === 'createdAt' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="table-header py-3 px-3 hidden lg:table-cell">
                      <button 
                        className="flex items-center gap-1 focus:outline-none"
                        onClick={() => handleSort('nextFollowUp')}
                        aria-label="Sort by follow up date"
                      >
                        Next Follow-up
                        {sortField === 'nextFollowUp' && (
                          sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                        )}
                      </button>
                    </th>
                    <th className="table-header py-3 pl-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map(lead => (
                      <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer" onClick={() => openViewModal(lead)}>
                        <td className="table-cell py-4 pl-4 pr-3 font-medium text-gray-900 dark:text-white">
                          {lead.name}
                        </td>
                        <td className="table-cell py-4 px-3 hidden md:table-cell">
                          <div className="text-gray-700 dark:text-gray-300 flex flex-col">
                            <span className="flex items-center gap-1">
                              <Mail size={14} /> {lead.email}
                            </span>
                            <span className="flex items-center gap-1 mt-1">
                              <Phone size={14} /> {lead.phone}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell py-4 px-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Building size={16} /> {lead.company}
                          </div>
                        </td>
                        <td className="table-cell py-4 px-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="table-cell py-4 px-3 hidden md:table-cell">
                          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                            <Calendar size={16} /> {formatDate(lead.createdAt)}
                          </div>
                        </td>
                        <td className="table-cell py-4 px-3 hidden lg:table-cell">
                          {lead.nextFollowUp ? (
                            <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
                              <Clock size={16} /> {formatDate(lead.nextFollowUp)}
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Not scheduled</span>
                          )}
                        </td>
                        <td className="table-cell py-4 pl-3 pr-4">
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300" 
                              onClick={() => openEditModal(lead)}
                              aria-label="Edit lead"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" 
                              onClick={() => openDeleteModal(lead)}
                              aria-label="Delete lead"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="table-cell py-8 text-center text-gray-500 dark:text-gray-400">
                        {searchTerm || filterStatus || filterSource || filterDateFrom || filterDateTo ? (
                          <div>
                            <p>No leads match your search criteria.</p>
                            <button 
                              className="text-blue-600 dark:text-blue-400 hover:underline mt-2" 
                              onClick={resetFilters}
                            >
                              Clear filters
                            </button>
                          </div>
                        ) : (
                          <div>
                            <p>No leads found.</p>
                            <button 
                              className="btn btn-primary btn-sm mt-2" 
                              onClick={openAddModal}
                            >
                              Add your first lead
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            {/* Dashboard View */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Dashboard Overview</h2>
              
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <div className="stat-card">
                  <div className="stat-title">Total Leads</div>
                  <div className="stat-value">{dashboardData.totalLeads}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">New Leads</div>
                  <div className="stat-value">{dashboardData.newLeads}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Qualified Leads</div>
                  <div className="stat-value">{dashboardData.qualifiedLeads}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Closed Won</div>
                  <div className="stat-value">{dashboardData.closedWon}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Conversion Rate</div>
                  <div className="stat-value">{dashboardData.conversionRate}%</div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Status Distribution */}
                <div className="card">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Lead Status Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {dashboardData.pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => [`${value} leads`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Source Distribution */}
                <div className="card">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Lead Sources</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" name="Leads" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Monthly Performance */}
                <div className="card">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Monthly Lead Acquisition</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.monthlyLeads}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" name="Leads" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Upcoming Follow-ups */}
                <div className="card">
                  <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">Upcoming Follow-ups (Next 7 Days)</h3>
                  {dashboardData.upcomingFollowUps.length > 0 ? (
                    <div className="overflow-y-auto max-h-64">
                      <ul className="space-y-3">
                        {dashboardData.upcomingFollowUps.map(lead => (
                          <li key={lead.id} className="border-b border-gray-100 dark:border-slate-700 pb-2 last:border-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white">{lead.name}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{lead.company}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-800 dark:text-white">
                                  {lead.nextFollowUp ? formatDate(lead.nextFollowUp) : 'Not set'}
                                </p>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(lead.status)}`}>
                                  {lead.status}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No upcoming follow-ups scheduled for the next 7 days.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-lg mx-auto overflow-y-auto" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="add-lead-title"
          >
            <div className="modal-header">
              <h3 id="add-lead-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Add New Lead
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 focus:outline-none" 
                onClick={closeAllModals}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={addLead}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="company" className="form-label">Company *</label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Status *</label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    required
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="source" className="form-label">Source *</label>
                  <select
                    id="source"
                    name="source"
                    className="input"
                    required
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Event">Event</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="seatingCapacity" className="form-label">Seating Capacity</label>
                  <input
                    id="seatingCapacity"
                    name="seatingCapacity"
                    type="number"
                    min="1"
                    className="input"
                    defaultValue="1"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="budget" className="form-label">Budget ($)</label>
                  <input
                    id="budget"
                    name="budget"
                    type="number"
                    min="0"
                    className="input"
                    defaultValue="0"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="moveInDate" className="form-label">Move-in Date</label>
                  <input
                    id="moveInDate"
                    name="moveInDate"
                    type="date"
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="duration" className="form-label">Duration</label>
                  <input
                    id="duration"
                    name="duration"
                    type="text"
                    className="input"
                    placeholder="e.g. 6 months"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="amenities" className="form-label">Amenities</label>
                  <input
                    id="amenities"
                    name="amenities"
                    type="text"
                    className="input"
                    placeholder="e.g. High-speed internet, Meeting rooms"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="nextFollowUp" className="form-label">Next Follow-up</label>
                  <input
                    id="nextFollowUp"
                    name="nextFollowUp"
                    type="datetime-local"
                    className="input"
                  />
                </div>
                
                <div className="form-group sm:col-span-2">
                  <label htmlFor="tags" className="form-label">Tags</label>
                  <input
                    id="tags"
                    name="tags"
                    type="text"
                    className="input"
                    placeholder="e.g. Tech, Startup (comma separated)"
                  />
                </div>
                
                <div className="form-group sm:col-span-2">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="input"
                    placeholder="Add any additional notes here"
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  onClick={closeAllModals}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {isEditModalOpen && currentLead && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-lg mx-auto overflow-y-auto" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="edit-lead-title"
          >
            <div className="modal-header">
              <h3 id="edit-lead-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Lead
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 focus:outline-none" 
                onClick={closeAllModals}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={updateLead}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">Name *</label>
                  <input
                    id="edit-name"
                    name="name"
                    type="text"
                    className="input"
                    defaultValue={currentLead.name}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-email" className="form-label">Email *</label>
                  <input
                    id="edit-email"
                    name="email"
                    type="email"
                    className="input"
                    defaultValue={currentLead.email}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-phone" className="form-label">Phone *</label>
                  <input
                    id="edit-phone"
                    name="phone"
                    type="tel"
                    className="input"
                    defaultValue={currentLead.phone}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-company" className="form-label">Company *</label>
                  <input
                    id="edit-company"
                    name="company"
                    type="text"
                    className="input"
                    defaultValue={currentLead.company}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-status" className="form-label">Status *</label>
                  <select
                    id="edit-status"
                    name="status"
                    className="input"
                    defaultValue={currentLead.status}
                    required
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-source" className="form-label">Source *</label>
                  <select
                    id="edit-source"
                    name="source"
                    className="input"
                    defaultValue={currentLead.source}
                    required
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Event">Event</option>
                    <option value="Partner">Partner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-seatingCapacity" className="form-label">Seating Capacity</label>
                  <input
                    id="edit-seatingCapacity"
                    name="seatingCapacity"
                    type="number"
                    min="1"
                    className="input"
                    defaultValue={currentLead.requirements.seatingCapacity}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-budget" className="form-label">Budget ($)</label>
                  <input
                    id="edit-budget"
                    name="budget"
                    type="number"
                    min="0"
                    className="input"
                    defaultValue={currentLead.requirements.budget}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-moveInDate" className="form-label">Move-in Date</label>
                  <input
                    id="edit-moveInDate"
                    name="moveInDate"
                    type="date"
                    className="input"
                    defaultValue={currentLead.requirements.moveInDate || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-duration" className="form-label">Duration</label>
                  <input
                    id="edit-duration"
                    name="duration"
                    type="text"
                    className="input"
                    defaultValue={currentLead.requirements.duration}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-amenities" className="form-label">Amenities</label>
                  <input
                    id="edit-amenities"
                    name="amenities"
                    type="text"
                    className="input"
                    defaultValue={currentLead.requirements.amenities.join(', ')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="edit-nextFollowUp" className="form-label">Next Follow-up</label>
                  <input
                    id="edit-nextFollowUp"
                    name="nextFollowUp"
                    type="datetime-local"
                    className="input"
                    defaultValue={
                      currentLead.nextFollowUp 
                        ? new Date(currentLead.nextFollowUp).toISOString().slice(0, 16)
                        : ''
                    }
                  />
                </div>
                
                <div className="form-group sm:col-span-2">
                  <label htmlFor="edit-tags" className="form-label">Tags</label>
                  <input
                    id="edit-tags"
                    name="tags"
                    type="text"
                    className="input"
                    defaultValue={currentLead.tags.join(', ')}
                  />
                </div>
                
                <div className="form-group sm:col-span-2">
                  <label htmlFor="edit-notes" className="form-label">Notes</label>
                  <textarea
                    id="edit-notes"
                    name="notes"
                    rows={3}
                    className="input"
                    defaultValue={currentLead.notes}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  onClick={closeAllModals}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Lead Modal */}
      {isDeleteModalOpen && currentLead && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-md mx-auto" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="delete-lead-title"
          >
            <div className="modal-header">
              <h3 id="delete-lead-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 focus:outline-none" 
                onClick={closeAllModals}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to delete <strong>{currentLead.name}</strong> from <strong>{currentLead.company}</strong>? This action cannot be undone.
              </p>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                onClick={closeAllModals}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                onClick={deleteLead}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {isViewModalOpen && currentLead && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-2xl mx-auto" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="view-lead-title"
          >
            <div className="modal-header">
              <h3 id="view-lead-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Lead Details
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 focus:outline-none" 
                onClick={closeAllModals}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{currentLead.name}</h4>
                  <p className="text-gray-600 dark:text-gray-300">{currentLead.company}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentLead.status)}`}>
                  {currentLead.status}
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mt-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Information</h5>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Mail size={16} className="text-gray-400" /> {currentLead.email}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" /> {currentLead.phone}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Lead Information</h5>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" /> Source: {currentLead.source}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" /> Created: {formatDateTime(currentLead.createdAt)}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" /> Last Contacted: {formatDateTime(currentLead.lastContactedAt)}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" /> Next Follow-up: {formatDateTime(currentLead.nextFollowUp)}
                    </p>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Requirements</h5>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Seating Capacity:</span> {currentLead.requirements.seatingCapacity} people
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Budget:</span> ${currentLead.requirements.budget}/month
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Move-in Date:</span> {formatDate(currentLead.requirements.moveInDate)}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Duration:</span> {currentLead.requirements.duration}
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">Amenities:</span> {currentLead.requirements.amenities.join(', ')}
                    </p>
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</h5>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {currentLead.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h5>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-line">{currentLead.notes}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                onClick={closeAllModals}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  closeAllModals();
                  openEditModal(currentLead);
                }}
              >
                Edit Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-md mx-auto" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="filter-leads-title"
          >
            <div className="modal-header">
              <h3 id="filter-leads-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Filter Leads
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 focus:outline-none" 
                onClick={closeAllModals}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="filter-status" className="form-label">Status</label>
                <select
                  id="filter-status"
                  className="input"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as LeadStatus | '')}
                >
                  <option value="">All Statuses</option>
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal">Proposal</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed Won">Closed Won</option>
                  <option value="Closed Lost">Closed Lost</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="filter-source" className="form-label">Source</label>
                <select
                  id="filter-source"
                  className="input"
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value as LeadSource | '')}
                >
                  <option value="">All Sources</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Event">Event</option>
                  <option value="Partner">Partner</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="filter-date-from" className="form-label">Created From</label>
                <input
                  id="filter-date-from"
                  type="date"
                  className="input"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="filter-date-to" className="form-label">Created To</label>
                <input
                  id="filter-date-to"
                  type="date"
                  className="input"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                onClick={resetFilters}
              >
                Reset
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsFilterModalOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content w-full max-w-md mx-auto" 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="import-leads-title"
          >
            <div className="modal-header">
              <h3 id="import-leads-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Import Leads
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 focus:outline-none" 
                onClick={closeAllModals}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Upload a CSV file with lead information. Please make sure your file follows the correct format.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  className="btn btn-primary mb-2 flex items-center justify-center gap-2 w-full"
                >
                  <Upload size={16} />
                  Select CSV File
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Supported format: .csv
                </p>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Need a template?</p>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Download size={16} /> Download Template
                  </button>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                onClick={closeAllModals}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;