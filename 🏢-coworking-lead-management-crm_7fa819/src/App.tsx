import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './styles/styles.module.css';
import {
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  Tag,
  Clock,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Moon,
  Sun,
  X,
  ChevronDown,
  Check,
  ChartLine,
  PieChart,
  BarChart,
  ArrowUpDown,
  Download,
  MessageCircle,
  MapPin,
  DollarSign,
  CheckCircle2
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ResponsiveContainer } from 'recharts';

// Type definitions
type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
type LeadPriority = 'Low' | 'Medium' | 'High';
type LeadSource = 'Website' | 'Referral' | 'Social Media' | 'Walk-in' | 'Phone Inquiry' | 'Email' | 'Event' | 'Other';
type SpaceType = 'Hot Desk' | 'Dedicated Desk' | 'Private Office' | 'Meeting Room' | 'Virtual Office' | 'Event Space';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  spaceInterest: SpaceType[];
  teamSize: number;
  budget: number;
  notes: string;
  lastContacted: string | null;
  nextFollowUp: string | null;
  createdAt: string;
  tags: string[];
  location: string;
  isStarred: boolean;
}

type SortField = keyof Lead;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface FilterState {
  status: LeadStatus | 'All';
  priority: LeadPriority | 'All';
  source: LeadSource | 'All';
  spaceInterest: SpaceType | 'All';
  searchTerm: string;
  dateRange: {
    from: string | null;
    to: string | null;
  };
}

interface Task {
  id: string;
  leadId: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
}

interface Note {
  id: string;
  leadId: string;
  content: string;
  createdAt: string;
}

interface Activity {
  id: string;
  leadId: string;
  type: 'Note' | 'Task' | 'StatusChange' | 'Email' | 'Call';
  description: string;
  createdAt: string;
}

const App: React.FC = () => {
  // State management
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState<boolean>(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isLeadDetailView, setIsLeadDetailView] = useState<boolean>(false);
  const [isAnalyticsView, setIsAnalyticsView] = useState<boolean>(false);
  const [leadForm, setLeadForm] = useState<Partial<Lead>>({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: 'New',
    priority: 'Medium',
    source: 'Website',
    spaceInterest: [],
    teamSize: 1,
    budget: 0,
    notes: '',
    location: '',
    tags: [],
    isStarred: false
  });
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: '',
    status: 'Pending'
  });
  const [noteForm, setNoteForm] = useState<Partial<Note>>({
    content: ''
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'createdAt', direction: 'desc' });
  const [filters, setFilters] = useState<FilterState>({
    status: 'All',
    priority: 'All',
    source: 'All',
    spaceInterest: 'All',
    searchTerm: '',
    dateRange: {
      from: null,
      to: null
    }
  });
  const [activeTab, setActiveTab] = useState<'profile' | 'tasks' | 'notes' | 'activities'>('profile');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [currentTag, setCurrentTag] = useState<string>('');

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const filterModalRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedLeads = localStorage.getItem('coworkingLeads');
    const savedTasks = localStorage.getItem('coworkingTasks');
    const savedNotes = localStorage.getItem('coworkingNotes');
    const savedActivities = localStorage.getItem('coworkingActivities');

    if (savedLeads) setLeads(JSON.parse(savedLeads));
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedActivities) setActivities(JSON.parse(savedActivities));

    // Initialize with sample data if no data exists
    if (!savedLeads) {
      const sampleLeads = generateSampleLeads();
      setLeads(sampleLeads);
      localStorage.setItem('coworkingLeads', JSON.stringify(sampleLeads));

      // Generate sample activities for each lead
      const sampleActivities = sampleLeads.flatMap(lead => {
        return [
          {
            id: crypto.randomUUID(),
            leadId: lead.id,
            type: 'StatusChange' as const,
            description: `Lead status changed to ${lead.status}`,
            createdAt: new Date(new Date(lead.createdAt).getTime() + 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: crypto.randomUUID(),
            leadId: lead.id,
            type: 'Note' as const,
            description: 'Initial contact note added',
            createdAt: new Date(new Date(lead.createdAt).getTime() + 4 * 60 * 60 * 1000).toISOString()
          }
        ];
      });
      setActivities(sampleActivities);
      localStorage.setItem('coworkingActivities', JSON.stringify(sampleActivities));

      // Generate sample tasks for some leads
      const sampleTasks = sampleLeads.slice(0, 5).map(lead => ({
        id: crypto.randomUUID(),
        leadId: lead.id,
        title: `Follow up with ${lead.name}`,
        description: `Discuss ${lead.spaceInterest.join(', ')} options and pricing`,
        dueDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'Pending' as const,
        createdAt: new Date().toISOString()
      }));
      setTasks(sampleTasks);
      localStorage.setItem('coworkingTasks', JSON.stringify(sampleTasks));

      // Generate sample notes for some leads
      const sampleNotes = sampleLeads.slice(0, 8).map(lead => ({
        id: crypto.randomUUID(),
        leadId: lead.id,
        content: `Initial contact: ${lead.name} is interested in ${lead.spaceInterest.join(', ')} for a team of ${lead.teamSize}. Budget expectation: $${lead.budget}.`,
        createdAt: new Date().toISOString()
      }));
      setNotes(sampleNotes);
      localStorage.setItem('coworkingNotes', JSON.stringify(sampleNotes));
    }
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddLeadModalOpen(false);
        setIsTaskModalOpen(false);
        setIsNoteModalOpen(false);
        setIsFilterModalOpen(false);
        document.body.classList.remove('modal-open');
      }
    };

    window.addEventListener('keydown', handleEscKeyPress);
    return () => window.removeEventListener('keydown', handleEscKeyPress);
  }, []);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsAddLeadModalOpen(false);
        setIsTaskModalOpen(false);
        setIsNoteModalOpen(false);
        document.body.classList.remove('modal-open');
      }

      if (filterModalRef.current && !filterModalRef.current.contains(event.target as Node) && isFilterModalOpen) {
        setIsFilterModalOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isFilterModalOpen]);

  // Generate sample leads for initial data
  const generateSampleLeads = (): Lead[] => {
    const statuses: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
    const priorities: LeadPriority[] = ['Low', 'Medium', 'High'];
    const sources: LeadSource[] = ['Website', 'Referral', 'Social Media', 'Walk-in', 'Phone Inquiry', 'Email', 'Event', 'Other'];
    const spaceTypes: SpaceType[] = ['Hot Desk', 'Dedicated Desk', 'Private Office', 'Meeting Room', 'Virtual Office', 'Event Space'];
    const locations = ['Downtown', 'Midtown', 'Uptown', 'Tech District', 'Financial District', 'Innovation Hub'];
    const companies = [
      'TechStart Solutions',
      'Innovate Design Co',
      'Digital Nomads LLC',
      'Creative Minds Agency',
      'Remote Workers United',
      'Startup Incubator',
      'Freelance Collective',
      'Agile Development',
      'Growth Hackers Inc',
      'Cloud Services Pro'
    ];

    return Array.from({ length: 15 }, (_, i) => {
      const daysAgo = Math.floor(Math.random() * 30);
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - daysAgo);

      const randomSpaceInterests: SpaceType[] = [];
      const numInterests = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numInterests; j++) {
        const randomSpace = spaceTypes[Math.floor(Math.random() * spaceTypes.length)];
        if (!randomSpaceInterests.includes(randomSpace)) {
          randomSpaceInterests.push(randomSpace);
        }
      }

      const randomTags: string[] = [];
      const potentialTags = ['Urgent', 'VIP', 'Price Sensitive', 'Long-term', 'Short-term', 'Flex Space', 'Enterprise', 'Startup'];
      const numTags = Math.floor(Math.random() * 3);
      for (let j = 0; j < numTags; j++) {
        const randomTag = potentialTags[Math.floor(Math.random() * potentialTags.length)];
        if (!randomTags.includes(randomTag)) {
          randomTags.push(randomTag);
        }
      }

      const lastContacted = Math.random() > 0.3 ? new Date(createdDate.getTime() + Math.random() * 86400000 * 5).toISOString() : null;
      const nextFollowUp = Math.random() > 0.5 ? new Date(new Date().getTime() + Math.random() * 86400000 * 10).toISOString() : null;

      return {
        id: crypto.randomUUID(),
        name: `Lead ${i + 1}`,
        company: companies[Math.floor(Math.random() * companies.length)],
        email: `lead${i + 1}@example.com`,
        phone: `+1 ${Math.floor(100 + Math.random() * 900)}-${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        spaceInterest: randomSpaceInterests,
        teamSize: Math.floor(Math.random() * 20) + 1,
        budget: Math.floor(Math.random() * 5000) + 500,
        notes: `Initial inquiry for ${randomSpaceInterests.join(', ')}`,
        lastContacted: lastContacted,
        nextFollowUp: nextFollowUp,
        createdAt: createdDate.toISOString(),
        tags: randomTags,
        location: locations[Math.floor(Math.random() * locations.length)],
        isStarred: Math.random() > 0.8
      };
    });
  };

  // Save leads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('coworkingLeads', JSON.stringify(leads));
  }, [leads]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('coworkingTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('coworkingNotes', JSON.stringify(notes));
  }, [notes]);

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('coworkingActivities', JSON.stringify(activities));
  }, [activities]);

  // Apply body class when a modal is open
  useEffect(() => {
    if (isAddLeadModalOpen || isTaskModalOpen || isNoteModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isAddLeadModalOpen, isTaskModalOpen, isNoteModalOpen]);

  // Get sorted and filtered leads
  const getSortedAndFilteredLeads = useCallback(() => {
    let filteredLeads = [...leads];

    // Apply status filter
    if (filters.status !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.priority === filters.priority);
    }

    // Apply source filter
    if (filters.source !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.source === filters.source);
    }

    // Apply space interest filter
    if (filters.spaceInterest !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.spaceInterest.includes(filters.spaceInterest as SpaceType));
    }

    // Apply search term filter
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      filteredLeads = filteredLeads.filter(
        lead =>
          lead.name.toLowerCase().includes(searchTermLower) ||
          lead.company.toLowerCase().includes(searchTermLower) ||
          lead.email.toLowerCase().includes(searchTermLower) ||
          lead.phone.toLowerCase().includes(searchTermLower) ||
          lead.notes.toLowerCase().includes(searchTermLower) ||
          lead.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      );
    }

    // Apply date range filter
    if (filters.dateRange.from) {
      filteredLeads = filteredLeads.filter(lead => new Date(lead.createdAt) >= new Date(filters.dateRange.from as string));
    }
    if (filters.dateRange.to) {
      filteredLeads = filteredLeads.filter(lead => new Date(lead.createdAt) <= new Date(filters.dateRange.to as string));
    }

    // Apply sorting
    filteredLeads.sort((a, b) => {
      const fieldA = a[sortConfig.field];
      const fieldB = b[sortConfig.field];

      // Handle comparison of different types
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        if (sortConfig.field === 'createdAt' || sortConfig.field === 'lastContacted' || sortConfig.field === 'nextFollowUp') {
          // Date comparison
          const dateA = fieldA ? new Date(fieldA).getTime() : 0;
          const dateB = fieldB ? new Date(fieldB).getTime() : 0;
          return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
        }
        return sortConfig.direction === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortConfig.direction === 'asc' ? fieldA - fieldB : fieldB - fieldA;
      } else if (fieldA === null && fieldB !== null) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      } else if (fieldA !== null && fieldB === null) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      } else if (Array.isArray(fieldA) && Array.isArray(fieldB)) {
        // For array fields like spaceInterest or tags
        const strA = fieldA.join(',');
        const strB = fieldB.join(',');
        return sortConfig.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
      return 0;
    });

    return filteredLeads;
  }, [leads, filters, sortConfig]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Open lead detail view
  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead);
    setLeadForm(lead);
    setIsLeadDetailView(true);
    setActiveTab('profile');
    setIsEditing(false);
  };

  // Close lead detail view
  const closeLeadDetail = () => {
    setIsLeadDetailView(false);
    setSelectedLead(null);
    setLeadForm({});
  };

  // Handle lead form input change
  const handleLeadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'spaceInterest') {
      const select = e.target as HTMLSelectElement;
      const selectedOptions = Array.from(select.selectedOptions).map(option => option.value as SpaceType);
      setLeadForm(prev => ({ ...prev, spaceInterest: selectedOptions }));
    } else if (type === 'number') {
      setLeadForm(prev => ({ ...prev, [name]: parseFloat(value) }));
    } else {
      setLeadForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle checkbox change for boolean values
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setLeadForm(prev => ({ ...prev, [name]: checked }));
  };

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentTag.trim() && !leadForm.tags?.includes(currentTag.trim())) {
      e.preventDefault();
      setLeadForm(prev => ({
        ...prev,
        tags: [...(prev.tags || []), currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setLeadForm(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  // Handle lead form submission
  const handleLeadFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leadForm.name || !leadForm.email) {
      alert('Name and email are required');
      return;
    }

    const now = new Date().toISOString();

    if (isEditing && selectedLead) {
      // Update existing lead
      const updatedLead = {
        ...selectedLead,
        ...leadForm,
      };

      // Check if status changed, if so add an activity
      if (selectedLead.status !== leadForm.status) {
        const newActivity: Activity = {
          id: crypto.randomUUID(),
          leadId: selectedLead.id,
          type: 'StatusChange',
          description: `Lead status changed from ${selectedLead.status} to ${leadForm.status}`,
          createdAt: now
        };
        setActivities(prev => [newActivity, ...prev]);
      }

      setLeads(prevLeads =>
        prevLeads.map(lead => (lead.id === selectedLead.id ? updatedLead as Lead : lead))
      );
      setSelectedLead(updatedLead as Lead);
      setIsEditing(false);
    } else {
      // Create new lead
      const newLead: Lead = {
        ...leadForm,
        id: crypto.randomUUID(),
        createdAt: now,
        lastContacted: null,
        nextFollowUp: null,
        status: leadForm.status || 'New',
        priority: leadForm.priority || 'Medium',
        source: leadForm.source || 'Website',
        spaceInterest: leadForm.spaceInterest || [],
        teamSize: leadForm.teamSize || 1,
        budget: leadForm.budget || 0,
        notes: leadForm.notes || '',
        location: leadForm.location || '',
        tags: leadForm.tags || [],
        isStarred: leadForm.isStarred || false,
        name: leadForm.name || '',
        company: leadForm.company || '',
        email: leadForm.email || '',
        phone: leadForm.phone || ''
      };

      setLeads(prev => [newLead, ...prev]);

      // Add lead creation activity
      const newActivity: Activity = {
        id: crypto.randomUUID(),
        leadId: newLead.id,
        type: 'StatusChange',
        description: `New lead created with status ${newLead.status}`,
        createdAt: now
      };
      setActivities(prev => [newActivity, ...prev]);

      // Reset form and close modal
      setLeadForm({
        name: '',
        company: '',
        email: '',
        phone: '',
        status: 'New',
        priority: 'Medium',
        source: 'Website',
        spaceInterest: [],
        teamSize: 1,
        budget: 0,
        notes: '',
        location: '',
        tags: [],
        isStarred: false
      });
      setIsAddLeadModalOpen(false);
    }
  };

  // Handle task form input change
  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle task form submission
  const handleTaskFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskForm.title || !selectedLead) {
      alert('Task title is required');
      return;
    }

    const now = new Date().toISOString();
    const newTask: Task = {
      id: crypto.randomUUID(),
      leadId: selectedLead.id,
      title: taskForm.title || '',
      description: taskForm.description || '',
      dueDate: taskForm.dueDate || now,
      status: 'Pending',
      createdAt: now
    };

    setTasks(prev => [newTask, ...prev]);

    // Add task creation activity
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      leadId: selectedLead.id,
      type: 'Task',
      description: `New task created: ${newTask.title}`,
      createdAt: now
    };
    setActivities(prev => [newActivity, ...prev]);

    // Reset form and close modal
    setTaskForm({
      title: '',
      description: '',
      dueDate: '',
      status: 'Pending'
    });
    setIsTaskModalOpen(false);
  };

  // Handle note form input change
  const handleNoteFormChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNoteForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle note form submission
  const handleNoteFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!noteForm.content || !selectedLead) {
      alert('Note content is required');
      return;
    }

    const now = new Date().toISOString();
    const newNote: Note = {
      id: crypto.randomUUID(),
      leadId: selectedLead.id,
      content: noteForm.content || '',
      createdAt: now
    };

    setNotes(prev => [newNote, ...prev]);

    // Add note creation activity
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      leadId: selectedLead.id,
      type: 'Note',
      description: 'New note added',
      createdAt: now
    };
    setActivities(prev => [newActivity, ...prev]);

    // Reset form and close modal
    setNoteForm({ content: '' });
    setIsNoteModalOpen(false);
  };

  // Handle task status toggle
  const toggleTaskStatus = (taskId: string) => {
    setTasks(prev =>
      prev.map(task => {
        if (task.id === taskId) {
          const newStatus = task.status === 'Pending' ? 'Completed' : 'Pending';
          
          // Add task status change activity
          const newActivity: Activity = {
            id: crypto.randomUUID(),
            leadId: task.leadId,
            type: 'Task',
            description: `Task "${task.title}" marked as ${newStatus}`,
            createdAt: new Date().toISOString()
          };
          setActivities(prevActivities => [newActivity, ...prevActivities]);
          
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
  };

  // Delete a lead
  const deleteLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      setTasks(prev => prev.filter(task => task.leadId !== leadId));
      setNotes(prev => prev.filter(note => note.leadId !== leadId));
      setActivities(prev => prev.filter(activity => activity.leadId !== leadId));
      
      if (selectedLead?.id === leadId) {
        closeLeadDetail();
      }
    }
  };

  // Toggle lead starred status
  const toggleLeadStarred = (leadId: string) => {
    setLeads(prev =>
      prev.map(lead => {
        if (lead.id === leadId) {
          return { ...lead, isStarred: !lead.isStarred };
        }
        return lead;
      })
    );
    
    if (selectedLead?.id === leadId) {
      setSelectedLead(prev => prev ? { ...prev, isStarred: !prev.isStarred } : null);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: 'All',
      priority: 'All',
      source: 'All',
      spaceInterest: 'All',
      searchTerm: '',
      dateRange: {
        from: null,
        to: null
      }
    });
  };

  // Get filtered tasks for the selected lead
  const getLeadTasks = useCallback(() => {
    if (!selectedLead) return [];
    return tasks.filter(task => task.leadId === selectedLead.id).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [selectedLead, tasks]);

  // Get filtered notes for the selected lead
  const getLeadNotes = useCallback(() => {
    if (!selectedLead) return [];
    return notes.filter(note => note.leadId === selectedLead.id).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [selectedLead, notes]);

  // Get filtered activities for the selected lead
  const getLeadActivities = useCallback(() => {
    if (!selectedLead) return [];
    return activities.filter(activity => activity.leadId === selectedLead.id).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [selectedLead, activities]);

  // Get status counts for analytics
  const getStatusCounts = useCallback(() => {
    const statusCounts: Record<LeadStatus, number> = {
      'New': 0,
      'Contacted': 0,
      'Qualified': 0,
      'Proposal': 0,
      'Negotiation': 0,
      'Closed Won': 0,
      'Closed Lost': 0
    };
    
    leads.forEach(lead => {
      statusCounts[lead.status]++;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Get source counts for analytics
  const getSourceCounts = useCallback(() => {
    const sourceCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      sourceCounts[lead.source] = (sourceCounts[lead.source] || 0) + 1;
    });
    
    return Object.entries(sourceCounts).map(([name, value]) => ({ name, value }));
  }, [leads]);

  // Get space interest counts for analytics
  const getSpaceInterestCounts = useCallback(() => {
    const interestCounts: Record<string, number> = {};
    
    leads.forEach(lead => {
      lead.spaceInterest.forEach(space => {
        interestCounts[space] = (interestCounts[space] || 0) + 1;
      });
    });
    
    return Object.entries(interestCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  // Get monthly lead count data for trend chart
  const getMonthlyLeadData = useCallback(() => {
    const monthlyData: Record<string, number> = {};
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 5);
    
    // Initialize all months with zero
    for (let i = 0; i < 6; i++) {
      const d = new Date(sixMonthsAgo);
      d.setMonth(sixMonthsAgo.getMonth() + i);
      const monthYear = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
      monthlyData[monthYear] = 0;
    }
    
    // Count leads by month
    leads.forEach(lead => {
      const leadDate = new Date(lead.createdAt);
      if (leadDate >= sixMonthsAgo) {
        const monthYear = `${leadDate.toLocaleString('default', { month: 'short' })} ${leadDate.getFullYear()}`;
        if (monthlyData[monthYear] !== undefined) {
          monthlyData[monthYear]++;
        }
      }
    });
    
    return Object.entries(monthlyData).map(([name, count]) => ({ name, count }));
  }, [leads]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add contact record
  const addContactRecord = (type: 'Call' | 'Email') => {
    if (!selectedLead) return;

    const now = new Date().toISOString();
    
    // Update lead's lastContacted date
    setLeads(prev =>
      prev.map(lead => {
        if (lead.id === selectedLead.id) {
          return { ...lead, lastContacted: now };
        }
        return lead;
      })
    );
    
    // Update selected lead if in detail view
    setSelectedLead(prev => prev ? { ...prev, lastContacted: now } : null);
    
    // Add activity
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      leadId: selectedLead.id,
      type,
      description: `${type} contact made with lead`,
      createdAt: now
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  // Get color class for status badge
  const getStatusColorClass = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Contacted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Qualified': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Proposal': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Negotiation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Closed Won': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Closed Lost': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get color class for priority badge
  const getPriorityColorClass = (priority: LeadPriority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Define chart colors
  const CHART_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Get the next 5 upcoming tasks across all leads
  const getUpcomingTasks = useCallback(() => {
    const pendingTasks = tasks.filter(task => task.status === 'Pending');
    return pendingTasks
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [tasks]);

  // Get the filtered and sorted leads
  const filteredLeads = getSortedAndFilteredLeads();
  
  // Calculate conversion rate
  const conversionRate = leads.length ? Math.round((leads.filter(lead => lead.status === 'Closed Won').length / leads.length) * 100) : 0;
  
  // Get tasks for the dashboard
  const upcomingTasks = getUpcomingTasks();

  // Filter pending tasks for task count
  const pendingTasksCount = tasks.filter(task => task.status === 'Pending').length;

  // Get lead counts by status for analytics
  const leadsByStatus = getStatusCounts();
  
  // Get lead counts by source for analytics
  const leadsBySource = getSourceCounts();
  
  // Get lead counts by space interest for analytics
  const leadsBySpace = getSpaceInterestCounts();
  
  // Get monthly lead data for trend chart
  const monthlyLeadData = getMonthlyLeadData();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-sm py-4">
        <div className="container-fluid flex-between">
          <div className="flex items-center gap-2">
            <Building className="text-primary-600 dark:text-primary-400" />
            <h1 className="text-lg sm:text-xl font-bold text-primary-600 dark:text-primary-400">CoworkingCRM</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm ${isAnalyticsView ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
              onClick={() => setIsAnalyticsView(!isAnalyticsView)}
              aria-label="Toggle Analytics View"
            >
              <ChartLine size={16} />
              <span className="hidden sm:inline">Analytics</span>
            </button>
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(prev => !prev)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
              <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="container-fluid">
          {isLeadDetailView && selectedLead ? (
            // Lead Detail View
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                  <button
                    onClick={closeLeadDetail}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700"
                    aria-label="Go back"
                  >
                    <X size={20} />
                  </button>
                  <h2 className="text-xl font-bold">{selectedLead.name}</h2>
                  <span className={`badge ${getStatusColorClass(selectedLead.status)}`}>{selectedLead.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => addContactRecord('Call')}
                    className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                    aria-label="Log call"
                  >
                    <Phone size={14} />
                    <span>Log Call</span>
                  </button>
                  <button
                    onClick={() => addContactRecord('Email')}
                    className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                    aria-label="Log email"
                  >
                    <Mail size={14} />
                    <span>Log Email</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-sm bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-1"
                    aria-label="Edit lead"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                <nav className="flex -mb-px space-x-8">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    aria-label="View profile"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'tasks' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    aria-label="View tasks"
                  >
                    Tasks
                    <span className="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
                      {getLeadTasks().filter(task => task.status === 'Pending').length}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'notes' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    aria-label="View notes"
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setActiveTab('activities')}
                    className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'activities' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    aria-label="View activities"
                  >
                    Activity
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="animate-fade-in">
                {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Lead Information */}
                    <div className="md:col-span-2">
                      {isEditing ? (
                        <form onSubmit={handleLeadFormSubmit} className="card">
                          <h3 className="text-lg font-medium mb-4">Edit Lead Information</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div className="form-group">
                              <label htmlFor="name" className="form-label">Name *</label>
                              <input
                                type="text"
                                id="name"
                                name="name"
                                value={leadForm.name || ''}
                                onChange={handleLeadFormChange}
                                className="input"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="company" className="form-label">Company</label>
                              <input
                                type="text"
                                id="company"
                                name="company"
                                value={leadForm.company || ''}
                                onChange={handleLeadFormChange}
                                className="input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="email" className="form-label">Email *</label>
                              <input
                                type="email"
                                id="email"
                                name="email"
                                value={leadForm.email || ''}
                                onChange={handleLeadFormChange}
                                className="input"
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="phone" className="form-label">Phone</label>
                              <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={leadForm.phone || ''}
                                onChange={handleLeadFormChange}
                                className="input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="status" className="form-label">Status</label>
                              <select
                                id="status"
                                name="status"
                                value={leadForm.status || 'New'}
                                onChange={handleLeadFormChange}
                                className="input"
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
                              <label htmlFor="priority" className="form-label">Priority</label>
                              <select
                                id="priority"
                                name="priority"
                                value={leadForm.priority || 'Medium'}
                                onChange={handleLeadFormChange}
                                className="input"
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label htmlFor="source" className="form-label">Source</label>
                              <select
                                id="source"
                                name="source"
                                value={leadForm.source || 'Website'}
                                onChange={handleLeadFormChange}
                                className="input"
                              >
                                <option value="Website">Website</option>
                                <option value="Referral">Referral</option>
                                <option value="Social Media">Social Media</option>
                                <option value="Walk-in">Walk-in</option>
                                <option value="Phone Inquiry">Phone Inquiry</option>
                                <option value="Email">Email</option>
                                <option value="Event">Event</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label htmlFor="location" className="form-label">Location</label>
                              <input
                                type="text"
                                id="location"
                                name="location"
                                value={leadForm.location || ''}
                                onChange={handleLeadFormChange}
                                className="input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="teamSize" className="form-label">Team Size</label>
                              <input
                                type="number"
                                id="teamSize"
                                name="teamSize"
                                value={leadForm.teamSize || 1}
                                onChange={handleLeadFormChange}
                                min="1"
                                className="input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor="budget" className="form-label">Budget ($)</label>
                              <input
                                type="number"
                                id="budget"
                                name="budget"
                                value={leadForm.budget || 0}
                                onChange={handleLeadFormChange}
                                min="0"
                                className="input"
                              />
                            </div>
                            <div className="form-group sm:col-span-2">
                              <label htmlFor="spaceInterest" className="form-label">Space Interest</label>
                              <select
                                id="spaceInterest"
                                name="spaceInterest"
                                value={leadForm.spaceInterest || []}
                                onChange={handleLeadFormChange}
                                className="input"
                                multiple
                              >
                                <option value="Hot Desk">Hot Desk</option>
                                <option value="Dedicated Desk">Dedicated Desk</option>
                                <option value="Private Office">Private Office</option>
                                <option value="Meeting Room">Meeting Room</option>
                                <option value="Virtual Office">Virtual Office</option>
                                <option value="Event Space">Event Space</option>
                              </select>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple options</p>
                            </div>
                            <div className="form-group sm:col-span-2">
                              <label htmlFor="tags" className="form-label">Tags</label>
                              <div className="mb-2 flex flex-wrap gap-2">
                                {leadForm.tags?.map(tag => (
                                  <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm">
                                    {tag}
                                    <button 
                                      type="button" 
                                      onClick={() => removeTag(tag)}
                                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                      aria-label={`Remove tag ${tag}`}
                                    >
                                      <X size={14} />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <input
                                type="text"
                                id="currentTag"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                className="input"
                                placeholder="Type and press Enter to add tags"
                              />
                            </div>
                            <div className="form-group sm:col-span-2">
                              <label htmlFor="notes" className="form-label">Notes</label>
                              <textarea
                                id="notes"
                                name="notes"
                                value={leadForm.notes || ''}
                                onChange={handleLeadFormChange}
                                className="input h-24"
                              ></textarea>
                            </div>
                            <div className="form-group flex items-center">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="isStarred"
                                  checked={leadForm.isStarred || false}
                                  onChange={handleCheckboxChange}
                                  className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <span>Mark as Important</span>
                              </label>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setIsEditing(false)}
                              className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary"
                            >
                              Save Changes
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="card">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-lg font-medium">Lead Information</h3>
                            <button
                              onClick={() => toggleLeadStarred(selectedLead.id)}
                              className={`text-yellow-400 hover:text-yellow-500 ${selectedLead.isStarred ? 'opacity-100' : 'opacity-50'}`}
                              aria-label={selectedLead.isStarred ? 'Unmark as important' : 'Mark as important'}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                              <p className="font-medium">{selectedLead.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Company</p>
                              <p className="font-medium">{selectedLead.company || '-'}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <Mail size={16} className="text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                <p className="font-medium">{selectedLead.email}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone size={16} className="text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                <p className="font-medium">{selectedLead.phone || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                              <p>
                                <span className={`inline-block mt-1 badge ${getStatusColorClass(selectedLead.status)}`}>
                                  {selectedLead.status}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                              <p>
                                <span className={`inline-block mt-1 badge ${getPriorityColorClass(selectedLead.priority)}`}>
                                  {selectedLead.priority}
                                </span>
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Source</p>
                              <p className="font-medium">{selectedLead.source}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin size={16} className="text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                                <p className="font-medium">{selectedLead.location || '-'}</p>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Team Size</p>
                              <p className="font-medium">{selectedLead.teamSize} people</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <DollarSign size={16} className="text-gray-400 mt-0.5" />
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                                <p className="font-medium">${selectedLead.budget.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Space Interest</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedLead.spaceInterest.map(space => (
                                  <span key={space} className="badge badge-info">{space}</span>
                                ))}
                                {selectedLead.spaceInterest.length === 0 && <p className="text-gray-500">No space interests specified</p>}
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Tags</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedLead.tags.map(tag => (
                                  <span key={tag} className="badge bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">{tag}</span>
                                ))}
                                {selectedLead.tags.length === 0 && <p className="text-gray-500">No tags</p>}
                              </div>
                            </div>
                            <div className="sm:col-span-2">
                              <p className="text-sm text-gray-500 dark:text-gray-400">Notes</p>
                              <p className="mt-1">{selectedLead.notes || 'No notes'}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timeline */}
                      <div className="card mt-6">
                        <h3 className="text-lg font-medium mb-4">Important Dates</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                              <p className="font-medium flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                {formatDate(selectedLead.createdAt)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Last Contacted</p>
                              <p className="font-medium flex items-center gap-2">
                                <Clock size={16} className="text-gray-400" />
                                {formatDate(selectedLead.lastContacted)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Next Follow-up</p>
                              <p className="font-medium flex items-center gap-2">
                                <Calendar size={16} className="text-gray-400" />
                                {formatDate(selectedLead.nextFollowUp)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Panel */}
                    <div>
                      <div className="card">
                        <h3 className="text-lg font-medium mb-4">Actions</h3>
                        <div className="space-y-3">
                          <button
                            onClick={() => setIsTaskModalOpen(true)}
                            className="btn w-full flex items-center justify-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
                            aria-label="Add task"
                          >
                            <Plus size={16} />
                            <span>Add Task</span>
                          </button>
                          <button
                            onClick={() => setIsNoteModalOpen(true)}
                            className="btn w-full flex items-center justify-center gap-2 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
                            aria-label="Add note"
                          >
                            <MessageCircle size={16} />
                            <span>Add Note</span>
                          </button>
                          <button
                            onClick={() => deleteLead(selectedLead.id)}
                            className="btn w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            aria-label="Delete lead"
                          >
                            <Trash2 size={16} />
                            <span>Delete Lead</span>
                          </button>
                        </div>
                      </div>

                      {/* Upcoming Tasks Panel */}
                      <div className="card mt-6">
                        <h3 className="text-lg font-medium mb-4">Upcoming Tasks</h3>
                        <div className="space-y-3">
                          {getLeadTasks().filter(task => task.status === 'Pending').slice(0, 3).map(task => (
                            <div key={task.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-800">
                              <input
                                type="checkbox"
                                checked={task.status === 'Completed'}
                                onChange={() => toggleTaskStatus(task.id)}
                                className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                aria-label={`Mark ${task.title} as complete`}
                              />
                              <div>
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                  <Calendar size={14} />
                                  {formatDate(task.dueDate)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {getLeadTasks().filter(task => task.status === 'Pending').length === 0 && (
                            <p className="text-gray-500 text-center py-2">No pending tasks</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Tasks</h3>
                      <button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="btn btn-sm btn-primary flex items-center gap-1"
                        aria-label="Add new task"
                      >
                        <Plus size={14} />
                        <span>Add Task</span>
                      </button>
                    </div>
                    <div className="card">
                      {getLeadTasks().length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {getLeadTasks().map(task => (
                            <div key={task.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0">
                              <input
                                type="checkbox"
                                checked={task.status === 'Completed'}
                                onChange={() => toggleTaskStatus(task.id)}
                                className="mt-1 h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                aria-label={`Mark ${task.title} as ${task.status === 'Completed' ? 'incomplete' : 'complete'}`}
                              />
                              <div className="flex-1">
                                <div className="flex items-start justify-between">
                                  <h4 className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                                    {task.title}
                                  </h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar size={14} />
                                    {formatDate(task.dueDate)}
                                  </p>
                                </div>
                                {task.description && (
                                  <p className="mt-1 text-gray-600 dark:text-gray-400">{task.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-6 text-gray-500">No tasks yet. Add a task to get started.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Notes</h3>
                      <button
                        onClick={() => setIsNoteModalOpen(true)}
                        className="btn btn-sm btn-primary flex items-center gap-1"
                        aria-label="Add new note"
                      >
                        <Plus size={14} />
                        <span>Add Note</span>
                      </button>
                    </div>
                    <div className="card">
                      {getLeadNotes().length > 0 ? (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                          {getLeadNotes().map(note => (
                            <div key={note.id} className="py-4 first:pt-0 last:pb-0">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {new Date(note.createdAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              <p className="whitespace-pre-line">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-6 text-gray-500">No notes yet. Add a note to get started.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'activities' && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Activity History</h3>
                    <div className="card">
                      {getLeadActivities().length > 0 ? (
                        <div className="relative">
                          <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                          <div className="space-y-6">
                            {getLeadActivities().map(activity => (
                              <div key={activity.id} className="relative pl-8">
                                <div className="absolute left-0 top-1.5 w-8 flex justify-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 ring-4 ring-white dark:ring-slate-800"></div>
                                </div>
                                <div>
                                  <p className="font-medium">{activity.description}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(activity.createdAt).toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-center py-6 text-gray-500">No activity recorded yet.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : isAnalyticsView ? (
            // Analytics View
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Lead Analytics Dashboard</h2>
                <button
                  onClick={() => setIsAnalyticsView(false)}
                  className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
                  aria-label="Back to leads"
                >
                  Back to Leads
                </button>
              </div>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="stat-card">
                  <div className="stat-title">Total Leads</div>
                  <div className="stat-value">{leads.length}</div>
                  <div className="stat-desc">All time</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Open Opportunities</div>
                  <div className="stat-value">{leads.filter(lead => !['Closed Won', 'Closed Lost'].includes(lead.status)).length}</div>
                  <div className="stat-desc">Active leads</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Conversion Rate</div>
                  <div className="stat-value">{conversionRate}%</div>
                  <div className="stat-desc">Closed won / total</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Pending Tasks</div>
                  <div className="stat-value">{pendingTasksCount}</div>
                  <div className="stat-desc">Across all leads</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Leads by Status</h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={leadsByStatus}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {leadsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                        <Legend />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Lead Sources</h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={leadsBySource}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                        <Bar dataKey="value" fill="#8884d8" name="Leads" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Lead Trend (Last 6 Months)</h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyLeadData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                        <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Leads" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Space Interest Distribution</h3>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={leadsBySpace} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip formatter={(value) => [`${value} leads`, 'Count']} />
                        <Bar dataKey="value" fill="#82ca9d" name="Leads" />
                      </ReBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Upcoming Tasks */}
              <div className="card mb-6">
                <h3 className="text-lg font-medium mb-4">Upcoming Tasks</h3>
                {upcomingTasks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Task</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Lead</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Due Date</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {upcomingTasks.map(task => {
                          const taskLead = leads.find(lead => lead.id === task.leadId);
                          return (
                            <tr key={task.id}>
                              <td className="px-4 py-3 whitespace-nowrap">{task.title}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{taskLead?.name || 'Unknown'}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{formatDate(task.dueDate)}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <span className="badge badge-warning">{task.status}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-6 text-gray-500">No upcoming tasks.</p>
                )}
              </div>
            </div>
          ) : (
            // Main Lead List View
            <div className="animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-bold">Lead Management</h2>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))} 
                      className="input pl-10"
                      aria-label="Search leads"
                    />
                  </div>
                  <button
                    onClick={() => setIsFilterModalOpen(!isFilterModalOpen)}
                    className={`btn flex items-center justify-center gap-2 ${isFilterModalOpen ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'bg-white dark:bg-slate-800'}`}
                    aria-label="Filter leads"
                  >
                    <Filter size={16} />
                    <span>Filters</span>
                    {Object.values(filters).some(value => {
                      if (typeof value === 'string') return value !== '' && value !== 'All';
                      if (typeof value === 'object') {
                        if ('from' in value || 'to' in value) {
                          return value.from !== null || value.to !== null;
                        }
                      }
                      return false;
                    }) && (
                      <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsAddLeadModalOpen(true);
                      setLeadForm({
                        name: '',
                        company: '',
                        email: '',
                        phone: '',
                        status: 'New',
                        priority: 'Medium',
                        source: 'Website',
                        spaceInterest: [],
                        teamSize: 1,
                        budget: 0,
                        notes: '',
                        location: '',
                        tags: [],
                        isStarred: false
                      });
                      setIsEditing(false);
                    }}
                    className="btn btn-primary flex items-center justify-center gap-2"
                    aria-label="Add new lead"
                  >
                    <Plus size={16} />
                    <span>Add Lead</span>
                  </button>
                </div>
              </div>

              {/* Filter Dropdown */}
              {isFilterModalOpen && (
                <div className="relative z-10">
                  <div className="absolute right-0 mt-2 w-full sm:w-96 bg-white dark:bg-slate-800 rounded-md shadow-lg p-4 border border-gray-200 dark:border-slate-700" ref={filterModalRef}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium">Filter Leads</h3>
                      <button
                        onClick={() => setIsFilterModalOpen(false)}
                        className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                        aria-label="Close filter panel"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                          <select
                            id="status-filter"
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as LeadStatus | 'All' }))}
                            className="input"
                          >
                            <option value="All">All Statuses</option>
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Closed Won">Closed Won</option>
                            <option value="Closed Lost">Closed Lost</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                          <select
                            id="priority-filter"
                            value={filters.priority}
                            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as LeadPriority | 'All' }))}
                            className="input"
                          >
                            <option value="All">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="source-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                          <select
                            id="source-filter"
                            value={filters.source}
                            onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value as LeadSource | 'All' }))}
                            className="input"
                          >
                            <option value="All">All Sources</option>
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                            <option value="Social Media">Social Media</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Phone Inquiry">Phone Inquiry</option>
                            <option value="Email">Email</option>
                            <option value="Event">Event</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="space-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Space Interest</label>
                          <select
                            id="space-filter"
                            value={filters.spaceInterest}
                            onChange={(e) => setFilters(prev => ({ ...prev, spaceInterest: e.target.value as SpaceType | 'All' }))}
                            className="input"
                          >
                            <option value="All">All Spaces</option>
                            <option value="Hot Desk">Hot Desk</option>
                            <option value="Dedicated Desk">Dedicated Desk</option>
                            <option value="Private Office">Private Office</option>
                            <option value="Meeting Room">Meeting Room</option>
                            <option value="Virtual Office">Virtual Office</option>
                            <option value="Event Space">Event Space</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
                          <input
                            type="date"
                            id="date-from"
                            value={filters.dateRange.from || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, from: e.target.value || null } }))}
                            className="input"
                          />
                        </div>
                        <div>
                          <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
                          <input
                            type="date"
                            id="date-to"
                            value={filters.dateRange.to || ''}
                            onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, to: e.target.value || null } }))}
                            className="input"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          onClick={resetFilters}
                          className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                          aria-label="Reset filters"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setIsFilterModalOpen(false)}
                          className="btn btn-primary"
                          aria-label="Apply filters"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Leads Table */}
              {filteredLeads.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-slate-700">
                        <tr>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                            onClick={() => handleSort('name')}
                          >
                            <div className="flex items-center gap-1">
                              <span>Name</span>
                              <ArrowUpDown size={14} className={`${sortConfig.field === 'name' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 hidden sm:table-cell"
                            onClick={() => handleSort('company')}
                          >
                            <div className="flex items-center gap-1">
                              <span>Company</span>
                              <ArrowUpDown size={14} className={`${sortConfig.field === 'company' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 hidden md:table-cell"
                            onClick={() => handleSort('email')}
                          >
                            <div className="flex items-center gap-1">
                              <span>Email</span>
                              <ArrowUpDown size={14} className={`${sortConfig.field === 'email' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600"
                            onClick={() => handleSort('status')}
                          >
                            <div className="flex items-center gap-1">
                              <span>Status</span>
                              <ArrowUpDown size={14} className={`${sortConfig.field === 'status' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 hidden md:table-cell"
                            onClick={() => handleSort('priority')}
                          >
                            <div className="flex items-center gap-1">
                              <span>Priority</span>
                              <ArrowUpDown size={14} className={`${sortConfig.field === 'priority' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                          </th>
                          <th 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600 hidden lg:table-cell"
                            onClick={() => handleSort('createdAt')}
                          >
                            <div className="flex items-center gap-1">
                              <span>Created</span>
                              <ArrowUpDown size={14} className={`${sortConfig.field === 'createdAt' ? 'opacity-100' : 'opacity-40'}`} />
                            </div>
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredLeads.map(lead => (
                          <tr 
                            key={lead.id} 
                            className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer group"
                            onClick={() => openLeadDetail(lead)}
                          >
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                {lead.isStarred && (
                                  <span className="mr-2 text-yellow-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  </span>
                                )}
                                <div className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-sm text-gray-700 dark:text-gray-300">{lead.company || '-'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <div className="text-sm text-gray-700 dark:text-gray-300">{lead.email}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`badge ${getStatusColorClass(lead.status)}`}>
                                {lead.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                              <span className={`badge ${getPriorityColorClass(lead.priority)}`}>
                                {lead.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 hidden lg:table-cell">
                              {formatDate(lead.createdAt)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-right">
                              <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLeadStarred(lead.id);
                                  }}
                                  className={`p-1 rounded-full ${lead.isStarred ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400'}`}
                                  aria-label={lead.isStarred ? 'Unmark as important' : 'Mark as important'}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLead(lead);
                                    setLeadForm(lead);
                                    setIsEditing(true);
                                    setIsAddLeadModalOpen(true);
                                  }}
                                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                                  aria-label={`Edit ${lead.name}`}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteLead(lead.id);
                                  }}
                                  className="p-1 rounded-full text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-500"
                                  aria-label={`Delete ${lead.name}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400">No leads found matching your criteria.</p>
                  {(filters.status !== 'All' || filters.priority !== 'All' || filters.source !== 'All' || filters.spaceInterest !== 'All' || filters.searchTerm || filters.dateRange.from || filters.dateRange.to) && (
                    <button
                      onClick={resetFilters}
                      className="btn btn-primary mt-4"
                      aria-label="Reset filters"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      {/* Add/Edit Lead Modal */}
      {isAddLeadModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl" ref={modalRef}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {isEditing ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              <button
                onClick={() => setIsAddLeadModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleLeadFormSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label htmlFor="modal-name" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="modal-name"
                    name="name"
                    value={leadForm.name || ''}
                    onChange={handleLeadFormChange}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-company" className="form-label">Company</label>
                  <input
                    type="text"
                    id="modal-company"
                    name="company"
                    value={leadForm.company || ''}
                    onChange={handleLeadFormChange}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-email" className="form-label">Email *</label>
                  <input
                    type="email"
                    id="modal-email"
                    name="email"
                    value={leadForm.email || ''}
                    onChange={handleLeadFormChange}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-phone" className="form-label">Phone</label>
                  <input
                    type="tel"
                    id="modal-phone"
                    name="phone"
                    value={leadForm.phone || ''}
                    onChange={handleLeadFormChange}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-status" className="form-label">Status</label>
                  <select
                    id="modal-status"
                    name="status"
                    value={leadForm.status || 'New'}
                    onChange={handleLeadFormChange}
                    className="input"
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
                  <label htmlFor="modal-priority" className="form-label">Priority</label>
                  <select
                    id="modal-priority"
                    name="priority"
                    value={leadForm.priority || 'Medium'}
                    onChange={handleLeadFormChange}
                    className="input"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="modal-source" className="form-label">Source</label>
                  <select
                    id="modal-source"
                    name="source"
                    value={leadForm.source || 'Website'}
                    onChange={handleLeadFormChange}
                    className="input"
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Phone Inquiry">Phone Inquiry</option>
                    <option value="Email">Email</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="modal-location" className="form-label">Location</label>
                  <input
                    type="text"
                    id="modal-location"
                    name="location"
                    value={leadForm.location || ''}
                    onChange={handleLeadFormChange}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-teamSize" className="form-label">Team Size</label>
                  <input
                    type="number"
                    id="modal-teamSize"
                    name="teamSize"
                    value={leadForm.teamSize || 1}
                    onChange={handleLeadFormChange}
                    min="1"
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="modal-budget" className="form-label">Budget ($)</label>
                  <input
                    type="number"
                    id="modal-budget"
                    name="budget"
                    value={leadForm.budget || 0}
                    onChange={handleLeadFormChange}
                    min="0"
                    className="input"
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label htmlFor="modal-spaceInterest" className="form-label">Space Interest</label>
                  <select
                    id="modal-spaceInterest"
                    name="spaceInterest"
                    value={leadForm.spaceInterest || []}
                    onChange={handleLeadFormChange}
                    className="input"
                    multiple
                  >
                    <option value="Hot Desk">Hot Desk</option>
                    <option value="Dedicated Desk">Dedicated Desk</option>
                    <option value="Private Office">Private Office</option>
                    <option value="Meeting Room">Meeting Room</option>
                    <option value="Virtual Office">Virtual Office</option>
                    <option value="Event Space">Event Space</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple options</p>
                </div>
                <div className="form-group sm:col-span-2">
                  <label htmlFor="modal-tags" className="form-label">Tags</label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    {leadForm.tags?.map(tag => (
                      <span key={tag} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-sm">
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => removeTag(tag)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          aria-label={`Remove tag ${tag}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    id="modal-currentTag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    className="input"
                    placeholder="Type and press Enter to add tags"
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label htmlFor="modal-notes" className="form-label">Notes</label>
                  <textarea
                    id="modal-notes"
                    name="notes"
                    value={leadForm.notes || ''}
                    onChange={handleLeadFormChange}
                    className="input h-24"
                  ></textarea>
                </div>
                <div className="form-group flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="isStarred"
                      checked={leadForm.isStarred || false}
                      onChange={handleCheckboxChange}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span>Mark as Important</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditing ? 'Save Changes' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {isTaskModalOpen && selectedLead && (
        <div className="modal-backdrop">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">Add Task for {selectedLead.name}</h2>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleTaskFormSubmit}>
              <div className="space-y-4 mb-4">
                <div className="form-group">
                  <label htmlFor="task-title" className="form-label">Task Title *</label>
                  <input
                    type="text"
                    id="task-title"
                    name="title"
                    value={taskForm.title || ''}
                    onChange={handleTaskFormChange}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="task-description" className="form-label">Description</label>
                  <textarea
                    id="task-description"
                    name="description"
                    value={taskForm.description || ''}
                    onChange={handleTaskFormChange}
                    className="input h-24"
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="task-dueDate" className="form-label">Due Date</label>
                  <input
                    type="datetime-local"
                    id="task-dueDate"
                    name="dueDate"
                    value={taskForm.dueDate ? new Date(taskForm.dueDate).toISOString().slice(0, 16) : ''}
                    onChange={handleTaskFormChange}
                    className="input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {isNoteModalOpen && selectedLead && (
        <div className="modal-backdrop">
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">Add Note for {selectedLead.name}</h2>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleNoteFormSubmit}>
              <div className="space-y-4 mb-4">
                <div className="form-group">
                  <label htmlFor="note-content" className="form-label">Note Content *</label>
                  <textarea
                    id="note-content"
                    name="content"
                    value={noteForm.content || ''}
                    onChange={handleNoteFormChange}
                    className="input h-32"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 py-4 border-t border-gray-200 dark:border-slate-700">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
