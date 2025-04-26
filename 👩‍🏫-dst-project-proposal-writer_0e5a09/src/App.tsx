import React, { useState, useEffect } from 'react';
import {
  Save,
  FilePlus,
  Trash2,
  Edit,
  Search,
  Filter,
  Download,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Moon,
  Sun,
  Check,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Define types for our application
type ProposalStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';

interface Proposal {
  id: string;
  title: string;
  objective: string;
  methodology: string;
  budget: number;
  timeline: string;
  status: ProposalStatus;
  category: string;
  teamMembers: TeamMember[];
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  expertise: string;
}

interface Milestone {
  id: string;
  title: string;
  deliverables: string;
  dueDate: string;
  status: 'pending' | 'completed';
}

interface FilterOptions {
  status: ProposalStatus | 'all';
  category: string;
  search: string;
  sortBy: keyof Proposal | '';
  sortDirection: 'asc' | 'desc';
}

interface FormErrors {
  title?: string;
  objective?: string;
  methodology?: string;
  budget?: string;
  timeline?: string;
  category?: string;
}

const CATEGORIES = [
  'Technology Innovation',
  'Science Education',
  'Environmental Research',
  'Healthcare Solutions',
  'Energy Efficiency',
  'Climate Change',
  'Agriculture',
  'Water Resources',
  'Biotechnology',
  'Material Science',
];

const STATUS_COLORS: Record<ProposalStatus, string> = {
  draft: 'bg-gray-200 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-purple-100 text-purple-800'
};

const SAMPLE_PROPOSALS: Proposal[] = [
  {
    id: '1',
    title: 'Climate Change Mitigation Through Innovative Agricultural Practices',
    objective: 'Develop sustainable farming methods to reduce carbon emissions and improve soil health.',
    methodology: 'Implement controlled field experiments across different climatic zones, measure carbon sequestration, and analyze soil quality improvements.',
    budget: 450000,
    timeline: '24 months',
    status: 'approved',
    category: 'Agriculture',
    teamMembers: [
      { id: '1', name: 'Dr. Ananya Sharma', role: 'Principal Investigator', expertise: 'Agricultural Science' },
      { id: '2', name: 'Dr. Rajiv Mehta', role: 'Co-Investigator', expertise: 'Soil Science' },
    ],
    milestones: [
      { id: '1', title: 'Field preparation and methodology finalization', deliverables: 'Detailed protocol document', dueDate: '2025-04-15', status: 'completed' },
      { id: '2', title: 'First season cultivation and data collection', deliverables: 'Preliminary data report', dueDate: '2025-10-30', status: 'pending' },
    ],
    createdAt: '2024-01-15T10:30:00.000Z',
    updatedAt: '2024-02-20T14:45:00.000Z',
  },
  {
    id: '2',
    title: 'Development of Low-Cost Water Purification Technology',
    objective: 'Create affordable and scalable water purification solutions for rural communities.',
    methodology: 'Design prototype systems, test in laboratory conditions, and pilot in selected villages with water quality monitoring.',
    budget: 320000,
    timeline: '18 months',
    status: 'submitted',
    category: 'Water Resources',
    teamMembers: [
      { id: '1', name: 'Dr. Priya Singh', role: 'Principal Investigator', expertise: 'Environmental Engineering' },
      { id: '2', name: 'Dr. Suresh Kumar', role: 'Co-Investigator', expertise: 'Chemical Engineering' },
    ],
    milestones: [
      { id: '1', title: 'Prototype development', deliverables: 'Working prototype with technical documentation', dueDate: '2025-06-30', status: 'pending' },
      { id: '2', title: 'Lab testing phase', deliverables: 'Test results and efficiency report', dueDate: '2025-12-15', status: 'pending' },
    ],
    createdAt: '2024-02-05T09:15:00.000Z',
    updatedAt: '2024-03-10T11:20:00.000Z',
  },
  {
    id: '3',
    title: 'Integrated STEM Education Framework for Secondary Schools',
    objective: 'Develop a comprehensive framework for implementing STEM education in Indian secondary schools.',
    methodology: 'Conduct needs assessment, design curriculum modules, train teachers, and evaluate implementation in 20 schools.',
    budget: 280000,
    timeline: '30 months',
    status: 'draft',
    category: 'Science Education',
    teamMembers: [
      { id: '1', name: 'Dr. Meera Patel', role: 'Principal Investigator', expertise: 'Education Technology' },
      { id: '2', name: 'Prof. Vikram Desai', role: 'Co-Investigator', expertise: 'Curriculum Development' },
    ],
    milestones: [
      { id: '1', title: 'Needs assessment completion', deliverables: 'Assessment report', dueDate: '2025-05-30', status: 'pending' },
      { id: '2', title: 'Curriculum module development', deliverables: 'STEM curriculum modules', dueDate: '2025-11-30', status: 'pending' },
    ],
    createdAt: '2024-03-20T13:45:00.000Z',
    updatedAt: '2024-03-20T13:45:00.000Z',
  },
];

const App: React.FC = () => {
  // State management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('darkMode') === 'true' || 
      (localStorage.getItem('darkMode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const savedProposals = localStorage.getItem('proposals');
    return savedProposals ? JSON.parse(savedProposals) : SAMPLE_PROPOSALS;
  });
  
  const [currentProposal, setCurrentProposal] = useState<Partial<Proposal> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isAddingTeamMember, setIsAddingTeamMember] = useState<boolean>(false);
  const [isAddingMilestone, setIsAddingMilestone] = useState<boolean>(false);
  const [currentTeamMember, setCurrentTeamMember] = useState<Partial<TeamMember>>({});
  const [currentMilestone, setCurrentMilestone] = useState<Partial<Milestone>>({});
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [filter, setFilter] = useState<FilterOptions>({
    status: 'all',
    category: '',
    search: '',
    sortBy: '',
    sortDirection: 'desc'
  });
  const [activeTab, setActiveTab] = useState<'list' | 'dashboard'>('list');
  
  // Effect to save proposals to localStorage when they change
  useEffect(() => {
    localStorage.setItem('proposals', JSON.stringify(proposals));
  }, [proposals]);
  
  // Effect to handle dark mode toggling
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Effect to handle escape key press for modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModalOpen) setIsModalOpen(false);
        if (isDeleteModalOpen) setIsDeleteModalOpen(false);
        if (isAddingTeamMember) setIsAddingTeamMember(false);
        if (isAddingMilestone) setIsAddingMilestone(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isModalOpen, isDeleteModalOpen, isAddingTeamMember, isAddingMilestone]);
  
  // Filtered and sorted proposals
  const filteredProposals = proposals.filter(proposal => {
    return (
      (filter.status === 'all' || proposal.status === filter.status) &&
      (filter.category === '' || proposal.category === filter.category) &&
      (filter.search === '' || 
        proposal.title.toLowerCase().includes(filter.search.toLowerCase()) ||
        proposal.objective.toLowerCase().includes(filter.search.toLowerCase()))
    );
  }).sort((a, b) => {
    if (!filter.sortBy) return 0;
    
    const aValue = a[filter.sortBy];
    const bValue = b[filter.sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return filter.sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return filter.sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }
    
    return 0;
  });
  
  // Dashboard stats calculation
  const statusCounts = proposals.reduce((acc: Record<ProposalStatus, number>, proposal) => {
    acc[proposal.status] = (acc[proposal.status] || 0) + 1;
    return acc;
  }, {} as Record<ProposalStatus, number>);
  
  const statusData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));
  
  const categoryCounts = proposals.reduce((acc: Record<string, number>, proposal) => {
    acc[proposal.category] = (acc[proposal.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categoryData = Object.entries(categoryCounts)
    .map(([category, count]) => ({
      name: category,
      count: count
    }));
  
  const budgetData = CATEGORIES.map(category => {
    const total = proposals
      .filter(p => p.category === category)
      .reduce((sum, p) => sum + p.budget, 0);
    return {
      name: category,
      budget: total
    };
  }).filter(item => item.budget > 0);
  
  // Utils for form validation
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!currentProposal?.title?.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!currentProposal?.objective?.trim()) {
      errors.objective = 'Objective is required';
    }
    
    if (!currentProposal?.methodology?.trim()) {
      errors.methodology = 'Methodology is required';
    }
    
    if (!currentProposal?.budget || currentProposal.budget <= 0) {
      errors.budget = 'Valid budget amount is required';
    }
    
    if (!currentProposal?.timeline?.trim()) {
      errors.timeline = 'Timeline is required';
    }
    
    if (!currentProposal?.category) {
      errors.category = 'Category is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Event handlers
  const handleAddNewProposal = () => {
    setCurrentProposal({
      id: '',
      title: '',
      objective: '',
      methodology: '',
      budget: 0,
      timeline: '',
      status: 'draft',
      category: '',
      teamMembers: [],
      milestones: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleEditProposal = (proposal: Proposal) => {
    setCurrentProposal({...proposal});
    setFormErrors({});
    setIsModalOpen(true);
  };
  
  const handleDeleteConfirmation = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteProposal = () => {
    if (currentProposal?.id) {
      setProposals(proposals.filter(p => p.id !== currentProposal.id));
      setIsDeleteModalOpen(false);
      setCurrentProposal(null);
    }
  };
  
  const handleSaveProposal = () => {
    if (validateForm()) {
      const now = new Date().toISOString();
      
      if (currentProposal?.id) {
        // Update existing proposal
        setProposals(proposals.map(p => 
          p.id === currentProposal.id ? 
            {...currentProposal as Proposal, updatedAt: now} : p
        ));
      } else {
        // Add new proposal
        const newProposal: Proposal = {
          ...currentProposal as Proposal,
          id: Date.now().toString(),
          createdAt: now,
          updatedAt: now,
          teamMembers: currentProposal?.teamMembers || [],
          milestones: currentProposal?.milestones || []
        };
        setProposals([...proposals, newProposal]);
      }
      
      setIsModalOpen(false);
      setCurrentProposal(null);
    }
  };
  
  const handleAddTeamMember = () => {
    setCurrentTeamMember({
      id: '',
      name: '',
      role: '',
      expertise: ''
    });
    setIsAddingTeamMember(true);
  };
  
  const handleSaveTeamMember = () => {
    if (currentTeamMember?.name?.trim() && currentTeamMember?.role?.trim() && currentTeamMember?.expertise?.trim()) {
      const member: TeamMember = {
        id: currentTeamMember.id || Date.now().toString(),
        name: currentTeamMember.name,
        role: currentTeamMember.role,
        expertise: currentTeamMember.expertise
      };
      
      const updatedTeamMembers = currentTeamMember.id ?
        (currentProposal?.teamMembers || []).map(m => m.id === member.id ? member : m) :
        [...(currentProposal?.teamMembers || []), member];
      
      setCurrentProposal(prev => ({
        ...prev as Proposal,
        teamMembers: updatedTeamMembers
      }));
      
      setIsAddingTeamMember(false);
      setCurrentTeamMember({});
    }
  };
  
  const handleEditTeamMember = (member: TeamMember) => {
    setCurrentTeamMember({...member});
    setIsAddingTeamMember(true);
  };
  
  const handleDeleteTeamMember = (id: string) => {
    if (currentProposal) {
      const updatedTeamMembers = (currentProposal.teamMembers || []).filter(m => m.id !== id);
      setCurrentProposal({
        ...currentProposal,
        teamMembers: updatedTeamMembers
      });
    }
  };
  
  const handleAddMilestone = () => {
    setCurrentMilestone({
      id: '',
      title: '',
      deliverables: '',
      dueDate: '',
      status: 'pending'
    });
    setIsAddingMilestone(true);
  };
  
  const handleSaveMilestone = () => {
    if (currentMilestone?.title?.trim() && currentMilestone?.deliverables?.trim() && currentMilestone?.dueDate) {
      const milestone: Milestone = {
        id: currentMilestone.id || Date.now().toString(),
        title: currentMilestone.title,
        deliverables: currentMilestone.deliverables,
        dueDate: currentMilestone.dueDate,
        status: currentMilestone.status || 'pending'
      };
      
      const updatedMilestones = currentMilestone.id ?
        (currentProposal?.milestones || []).map(m => m.id === milestone.id ? milestone : m) :
        [...(currentProposal?.milestones || []), milestone];
      
      setCurrentProposal(prev => ({
        ...prev as Proposal,
        milestones: updatedMilestones
      }));
      
      setIsAddingMilestone(false);
      setCurrentMilestone({});
    }
  };
  
  const handleEditMilestone = (milestone: Milestone) => {
    setCurrentMilestone({...milestone});
    setIsAddingMilestone(true);
  };
  
  const handleDeleteMilestone = (id: string) => {
    if (currentProposal) {
      const updatedMilestones = (currentProposal.milestones || []).filter(m => m.id !== id);
      setCurrentProposal({
        ...currentProposal,
        milestones: updatedMilestones
      });
    }
  };
  
  const handleSortChange = (key: keyof Proposal) => {
    setFilter(prev => ({
      ...prev,
      sortBy: key,
      sortDirection: prev.sortBy === key && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };
  
  const handleDownloadTemplate = () => {
    // Create template for download
    const template = {
      title: 'Your Proposal Title',
      objective: 'Detailed objectives of your project',
      methodology: 'Research methodology and approach',
      budget: 100000,
      timeline: '12 months',
      category: 'Technology Innovation',
      teamMembers: [
        { name: 'Team Member Name', role: 'Principal Investigator', expertise: 'Area of expertise' }
      ],
      milestones: [
        { title: 'Milestone Title', deliverables: 'Expected deliverables', dueDate: '2025-12-31', status: 'pending' }
      ]
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dst_proposal_template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Validate required fields
        if (!parsedData.title || !parsedData.objective || !parsedData.methodology) {
          alert('The uploaded file is missing required fields.');
          return;
        }
        
        // Prepare new proposal from uploaded data
        const now = new Date().toISOString();
        const newProposal: Proposal = {
          id: Date.now().toString(),
          title: parsedData.title,
          objective: parsedData.objective,
          methodology: parsedData.methodology,
          budget: Number(parsedData.budget) || 0,
          timeline: parsedData.timeline || '',
          status: 'draft',
          category: parsedData.category || '',
          teamMembers: (parsedData.teamMembers || []).map((m: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: m.name || '',
            role: m.role || '',
            expertise: m.expertise || ''
          })),
          milestones: (parsedData.milestones || []).map((m: any) => ({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            title: m.title || '',
            deliverables: m.deliverables || '',
            dueDate: m.dueDate || '',
            status: m.status === 'completed' ? 'completed' : 'pending'
          })),
          createdAt: now,
          updatedAt: now
        };
        
        setProposals([...proposals, newProposal]);
        alert('Proposal imported successfully!');
      } catch (error) {
        alert('Error parsing the uploaded file. Please ensure it is a valid JSON file.');
        console.error('Error parsing uploaded file:', error);
      }
    };
    reader.readAsText(file);
  };

  // Render helpers
  const renderStatusBadge = (status: ProposalStatus) => {
    const statusClass = STATUS_COLORS[status] || 'bg-gray-200 text-gray-800';
    return (
      <span className={`badge ${statusClass}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DST Proposal Manager</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Streamline your project proposal writing process</p>
            </div>
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="theme-toggle-thumb"></span>
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-yellow-400 ml-6" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700 ml-1" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-6">
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
              <button 
                className={`tab-button ${activeTab === 'list' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('list')}
              >
                <FileText className="w-4 h-4 mr-1" />
                Proposals
              </button>
              <button 
                className={`tab-button ${activeTab === 'dashboard' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <ChartBarIcon className="w-4 h-4 mr-1" />
                Dashboard
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                className="btn btn-primary btn-sm flex-center gap-1"
                onClick={handleAddNewProposal}
              >
                <Plus className="w-4 h-4" />
                New Proposal
              </button>
              <button 
                className="btn bg-green-500 hover:bg-green-600 text-white btn-sm flex-center gap-1"
                onClick={handleDownloadTemplate}
              >
                <Download className="w-4 h-4" />
                Download Template
              </button>
              <div className="relative">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept=".json"
                  onChange={handleFileUpload}
                />
                <label 
                  htmlFor="file-upload"
                  className="btn bg-blue-500 hover:bg-blue-600 text-white btn-sm flex-center gap-1 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Import Proposal
                </label>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            {/* Filters */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search proposals..."
                    value={filter.search}
                    onChange={(e) => setFilter({...filter, search: e.target.value})}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="w-full sm:w-auto">
                    <select
                      className="input"
                      value={filter.status}
                      onChange={(e) => setFilter({...filter, status: e.target.value as any})}
                    >
                      <option value="all">All Statuses</option>
                      <option value="draft">Draft</option>
                      <option value="submitted">Submitted</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    <select
                      className="input"
                      value={filter.category}
                      onChange={(e) => setFilter({...filter, category: e.target.value})}
                    >
                      <option value="">All Categories</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button 
                    className="btn bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white flex-center gap-1"
                    onClick={() => setFilter({
                      status: 'all',
                      category: '',
                      search: '',
                      sortBy: '',
                      sortDirection: 'desc'
                    })}
                  >
                    <Filter className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
            
            {/* Proposals list */}
            <div className="space-y-6 mb-6">
              {filteredProposals.length > 0 ? (
                filteredProposals.map(proposal => (
                  <div key={proposal.id} className="card">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{proposal.title}</h3>
                          {renderStatusBadge(proposal.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">{proposal.objective}</p>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Budget:</span> ₹{proposal.budget.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Timeline:</span> {proposal.timeline}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Category:</span> {proposal.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Updated:</span> {formatDate(proposal.updatedAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 flex-center gap-1"
                          onClick={() => handleEditProposal(proposal)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button 
                          className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex-center gap-1"
                          onClick={() => handleDeleteConfirmation(proposal)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-12">
                  <div className="flex flex-col items-center">
                    <FileText className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No proposals found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Create a new proposal or adjust your filters</p>
                    <button 
                      className="btn btn-primary flex-center gap-1"
                      onClick={handleAddNewProposal}
                    >
                      <Plus className="w-4 h-4" />
                      Create New Proposal
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {/* Dashboard stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="stat-card">
                <div className="stat-title">Total Proposals</div>
                <div className="stat-value">{proposals.length}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Approved Proposals</div>
                <div className="stat-value">{statusCounts.approved || 0}</div>
                <div className="stat-desc">
                  {proposals.length > 0 
                    ? `${(((statusCounts.approved || 0) / proposals.length) * 100).toFixed(1)}% approval rate` 
                    : 'No proposals yet'}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Budget</div>
                <div className="stat-value">₹{proposals.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}</div>
                <div className="stat-desc">
                  Avg: ₹{proposals.length > 0 
                    ? (proposals.reduce((sum, p) => sum + p.budget, 0) / proposals.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : 0}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Categories</div>
                <div className="stat-value">{Object.keys(categoryCounts).length}</div>
                <div className="stat-desc">
                  Most common: {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'}
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Proposal Status Distribution</h3>
                <div className="h-64">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => {
                            const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
                            return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                          })}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex-center h-full text-gray-500">No data available</div>
                  )}
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Proposals by Category</h3>
                <div className="h-64">
                  {categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} height={60} tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" name="Proposals" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex-center h-full text-gray-500">No data available</div>
                  )}
                </div>
              </div>
              
              <div className="card lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Budget Allocation by Category</h3>
                <div className="h-64">
                  {budgetData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} height={60} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Budget']} />
                        <Legend />
                        <Bar dataKey="budget" fill="#82ca9d" name="Budget (₹)" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex-center h-full text-gray-500">No data available</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-auto theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Proposal modal */}
      {isModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="proposal-modal-title"
        >
          <div 
            className="modal-content max-w-4xl w-full overflow-y-auto max-h-[90vh]" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="proposal-modal-title" className="text-xl font-semibold">
                {currentProposal?.id ? 'Edit Proposal' : 'Create New Proposal'}
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  className={`input ${formErrors.title ? 'border-red-500' : ''}`}
                  value={currentProposal?.title || ''}
                  onChange={(e) => setCurrentProposal({...currentProposal as Proposal, title: e.target.value})}
                  placeholder="Enter proposal title"
                />
                {formErrors.title && <p className="form-error">{formErrors.title}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="objective">Objective</label>
                <textarea
                  id="objective"
                  rows={3}
                  className={`input ${formErrors.objective ? 'border-red-500' : ''}`}
                  value={currentProposal?.objective || ''}
                  onChange={(e) => setCurrentProposal({...currentProposal as Proposal, objective: e.target.value})}
                  placeholder="Enter proposal objectives"
                ></textarea>
                {formErrors.objective && <p className="form-error">{formErrors.objective}</p>}
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="methodology">Methodology</label>
                <textarea
                  id="methodology"
                  rows={4}
                  className={`input ${formErrors.methodology ? 'border-red-500' : ''}`}
                  value={currentProposal?.methodology || ''}
                  onChange={(e) => setCurrentProposal({...currentProposal as Proposal, methodology: e.target.value})}
                  placeholder="Describe your research methodology"
                ></textarea>
                {formErrors.methodology && <p className="form-error">{formErrors.methodology}</p>}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="budget">Budget (₹)</label>
                  <input
                    id="budget"
                    type="number"
                    min="0"
                    className={`input ${formErrors.budget ? 'border-red-500' : ''}`}
                    value={currentProposal?.budget || ''}
                    onChange={(e) => setCurrentProposal({...currentProposal as Proposal, budget: Number(e.target.value)})}
                    placeholder="Enter budget amount"
                  />
                  {formErrors.budget && <p className="form-error">{formErrors.budget}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="timeline">Timeline</label>
                  <input
                    id="timeline"
                    type="text"
                    className={`input ${formErrors.timeline ? 'border-red-500' : ''}`}
                    value={currentProposal?.timeline || ''}
                    onChange={(e) => setCurrentProposal({...currentProposal as Proposal, timeline: e.target.value})}
                    placeholder="e.g., 24 months"
                  />
                  {formErrors.timeline && <p className="form-error">{formErrors.timeline}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    className={`input ${formErrors.category ? 'border-red-500' : ''}`}
                    value={currentProposal?.category || ''}
                    onChange={(e) => setCurrentProposal({...currentProposal as Proposal, category: e.target.value})}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {formErrors.category && <p className="form-error">{formErrors.category}</p>}
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    value={currentProposal?.status || 'draft'}
                    onChange={(e) => setCurrentProposal({...currentProposal as Proposal, status: e.target.value as ProposalStatus})}
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              {/* Team Members Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Team Members</h3>
                  <button 
                    className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white flex-center gap-1"
                    onClick={handleAddTeamMember}
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </button>
                </div>
                
                {(currentProposal?.teamMembers?.length || 0) > 0 ? (
                  <div className="space-y-2">
                    {currentProposal?.teamMembers?.map((member, index) => (
                      <div key={member.id || index} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{member.role} • {member.expertise}</div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 flex-center gap-1"
                            onClick={() => handleEditTeamMember(member)}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex-center gap-1"
                            onClick={() => handleDeleteTeamMember(member.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md text-center">
                    <p className="text-gray-500 dark:text-gray-400">No team members added yet. Add team members to strengthen your proposal.</p>
                  </div>
                )}
              </div>
              
              {/* Milestones Section */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Milestones</h3>
                  <button 
                    className="btn btn-sm bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white flex-center gap-1"
                    onClick={handleAddMilestone}
                  >
                    <Plus className="w-4 h-4" />
                    Add Milestone
                  </button>
                </div>
                
                {(currentProposal?.milestones?.length || 0) > 0 ? (
                  <div className="space-y-2">
                    {currentProposal?.milestones?.map((milestone, index) => (
                      <div key={milestone.id || index} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex-grow">
                          <div className="font-medium flex items-center gap-2">
                            {milestone.title}
                            <span className={`badge ${milestone.status === 'completed' ? 'badge-success' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                              {milestone.status === 'completed' ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span>Deliverables: {milestone.deliverables}</span>
                            <span className="ml-2 inline-flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              Due: {milestone.dueDate ? formatDate(milestone.dueDate) : 'Not set'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn btn-sm bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 flex-center gap-1"
                            onClick={() => handleEditMilestone(milestone)}
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex-center gap-1"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-md text-center">
                    <p className="text-gray-500 dark:text-gray-400">No milestones added yet. Milestones help track project progress and deliverables.</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-center gap-1"
                onClick={handleSaveProposal}
              >
                <Save className="w-4 h-4" />
                Save Proposal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Team member modal */}
      {isAddingTeamMember && (
        <div 
          className="modal-backdrop" 
          onClick={() => setIsAddingTeamMember(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="team-member-modal-title"
        >
          <div 
            className="modal-content max-w-lg w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="team-member-modal-title" className="text-lg font-semibold">
                {currentTeamMember.id ? 'Edit Team Member' : 'Add Team Member'}
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={() => setIsAddingTeamMember(false)}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="member-name">Name</label>
                <input
                  id="member-name"
                  type="text"
                  className="input"
                  value={currentTeamMember.name || ''}
                  onChange={(e) => setCurrentTeamMember({...currentTeamMember, name: e.target.value})}
                  placeholder="Enter member name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="member-role">Role</label>
                <input
                  id="member-role"
                  type="text"
                  className="input"
                  value={currentTeamMember.role || ''}
                  onChange={(e) => setCurrentTeamMember({...currentTeamMember, role: e.target.value})}
                  placeholder="e.g., Principal Investigator"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="member-expertise">Expertise</label>
                <input
                  id="member-expertise"
                  type="text"
                  className="input"
                  value={currentTeamMember.expertise || ''}
                  onChange={(e) => setCurrentTeamMember({...currentTeamMember, expertise: e.target.value})}
                  placeholder="e.g., Environmental Science"
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                onClick={() => setIsAddingTeamMember(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-center gap-1"
                onClick={handleSaveTeamMember}
              >
                <Save className="w-4 h-4" />
                Save Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone modal */}
      {isAddingMilestone && (
        <div 
          className="modal-backdrop" 
          onClick={() => setIsAddingMilestone(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="milestone-modal-title"
        >
          <div 
            className="modal-content max-w-lg w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="milestone-modal-title" className="text-lg font-semibold">
                {currentMilestone.id ? 'Edit Milestone' : 'Add Milestone'}
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={() => setIsAddingMilestone(false)}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="milestone-title">Title</label>
                <input
                  id="milestone-title"
                  type="text"
                  className="input"
                  value={currentMilestone.title || ''}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, title: e.target.value})}
                  placeholder="Enter milestone title"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="milestone-deliverables">Deliverables</label>
                <textarea
                  id="milestone-deliverables"
                  rows={3}
                  className="input"
                  value={currentMilestone.deliverables || ''}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, deliverables: e.target.value})}
                  placeholder="Describe the expected deliverables"
                ></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="milestone-due-date">Due Date</label>
                <input
                  id="milestone-due-date"
                  type="date"
                  className="input"
                  value={currentMilestone.dueDate || ''}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, dueDate: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="milestone-status">Status</label>
                <select
                  id="milestone-status"
                  className="input"
                  value={currentMilestone.status || 'pending'}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, status: e.target.value as 'pending' | 'completed'})}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                onClick={() => setIsAddingMilestone(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary flex-center gap-1"
                onClick={handleSaveMilestone}
              >
                <Save className="w-4 h-4" />
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={() => setIsDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div 
            className="modal-content max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="delete-modal-title" className="text-lg font-semibold text-red-600 dark:text-red-500">
                Confirm Deletion
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="my-4">
              <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete this proposal?</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium mt-2">"{currentProposal?.title}"</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-3">This action cannot be undone.</p>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn bg-red-600 text-white hover:bg-red-700 flex-center gap-1"
                onClick={handleDeleteProposal}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Custom BarChart icon component to avoid naming conflict with recharts
const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

export default App;