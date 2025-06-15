import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  MessageCircle, 
  Users, 
  FileText, 
  ChartBar, 
  Settings, 
  Plus, 
  Upload, 
  Download, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Moon,
  Sun,
  Eye,
  Copy,
  Calendar,
  Target,
  TrendingUp,
  User,
  Mail,
  Phone,
  Building,
  Tag,
  Zap,
  Globe,
  Heart,
  Star,
  Smile,
  Gift,
  Percent,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  Activity,
  Users2,
  MessageSquare,
  Clock3,
  Calendar as CalendarIcon,
  Sparkles, LogOut, X
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types
interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company?: string;
  tags: string[];
  addedDate: string;
  lastContacted?: string;
  status: 'active' | 'inactive' | 'blocked';
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  variables: string[];
  category: string;
  createdDate: string;
  usageCount: number;
}

interface Campaign {
  id: string;
  name: string;
  templateId: string;
  contactIds: string[];
  scheduledDate: string;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  createdDate: string;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  totalContacts: number;
  message: string;
}

interface CampaignAnalytics {
  totalCampaigns: number;
  totalMessagesSent: number;
  deliveryRate: number;
  readRate: number;
  activeContacts: number;
  monthlyGrowth: number;
}

type TabType = 'campaigns' | 'contacts' | 'templates' | 'analytics' | 'settings';

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

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State management
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // AI Layer states
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Modal states
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{show: boolean, type: string, id: string}>({show: false, type: '', id: ''});
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    tags: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    content: '',
    category: 'promotion'
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    templateId: '',
    contactIds: [] as string[],
    scheduledDate: '',
    customMessage: ''
  });

  // Load data from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('whatsapp_contacts');
    const savedTemplates = localStorage.getItem('whatsapp_templates');
    const savedCampaigns = localStorage.getItem('whatsapp_campaigns');

    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      // Sample data
      const sampleContacts: Contact[] = [
        {
          id: '1',
          name: 'John Smith',
          phone: '+1234567890',
          email: 'john@example.com',
          company: 'ABC Corp',
          tags: ['premium', 'customer'],
          addedDate: '2025-06-10',
          lastContacted: '2025-06-14',
          status: 'active'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          phone: '+1234567891',
          email: 'sarah@example.com',
          company: 'XYZ Ltd',
          tags: ['lead', 'interested'],
          addedDate: '2025-06-11',
          status: 'active'
        }
      ];
      setContacts(sampleContacts);
      localStorage.setItem('whatsapp_contacts', JSON.stringify(sampleContacts));
    }

    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    } else {
      // Sample templates
      const sampleTemplates: MessageTemplate[] = [
        {
          id: '1',
          name: 'Welcome Message',
          content: 'Hi {name}! Welcome to our service. We\'re excited to have you onboard! 🎉',
          variables: ['name'],
          category: 'welcome',
          createdDate: '2025-06-10',
          usageCount: 15
        },
        {
          id: '2',
          name: 'Promotion Alert',
          content: 'Hey {name}! 🔥 Special offer just for you! Get 20% off on all products. Use code: SAVE20. Valid till {date}!',
          variables: ['name', 'date'],
          category: 'promotion',
          createdDate: '2025-06-12',
          usageCount: 8
        }
      ];
      setTemplates(sampleTemplates);
      localStorage.setItem('whatsapp_templates', JSON.stringify(sampleTemplates));
    }

    if (savedCampaigns) {
      setCampaigns(JSON.parse(savedCampaigns));
    } else {
      // Sample campaigns
      const sampleCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Summer Sale Campaign',
          templateId: '2',
          contactIds: ['1', '2'],
          scheduledDate: '2025-06-16T10:00',
          status: 'completed',
          createdDate: '2025-06-15',
          sentCount: 2,
          deliveredCount: 2,
          readCount: 1,
          failedCount: 0,
          totalContacts: 2,
          message: 'Summer sale promotion message'
        }
      ];
      setCampaigns(sampleCampaigns);
      localStorage.setItem('whatsapp_campaigns', JSON.stringify(sampleCampaigns));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('whatsapp_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('whatsapp_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('whatsapp_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  // Utility functions
  const generateId = () => Date.now().toString();

  const showMessage = (message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccess(message);
      setError(null);
    } else {
      setError(message);
      setSuccess(null);
    }
    setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 5000);
  };

  // Contact management
  const handleAddContact = () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      showMessage('Name and phone are required', 'error');
      return;
    }

    const newContact: Contact = {
      id: generateId(),
      name: contactForm.name.trim(),
      phone: contactForm.phone.trim(),
      email: contactForm.email.trim(),
      company: contactForm.company.trim(),
      tags: contactForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      addedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    if (editingItem) {
      setContacts(contacts.map(c => c.id === editingItem.id ? {...newContact, id: editingItem.id} : c));
      showMessage('Contact updated successfully', 'success');
    } else {
      setContacts([...contacts, newContact]);
      showMessage('Contact added successfully', 'success');
    }

    resetContactForm();
    setShowContactModal(false);
  };

  const resetContactForm = () => {
    setContactForm({
      name: '',
      phone: '',
      email: '',
      company: '',
      tags: ''
    });
    setEditingItem(null);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingItem(contact);
    setContactForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      company: contact.company || '',
      tags: contact.tags.join(', ')
    });
    setShowContactModal(true);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
    showMessage('Contact deleted successfully', 'success');
    setShowDeleteConfirm({show: false, type: '', id: ''});
  };

  // Template management
  const handleAddTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      showMessage('Name and content are required', 'error');
      return;
    }

    const variables = extractVariables(templateForm.content);
    const newTemplate: MessageTemplate = {
      id: generateId(),
      name: templateForm.name.trim(),
      content: templateForm.content.trim(),
      variables,
      category: templateForm.category,
      createdDate: new Date().toISOString().split('T')[0],
      usageCount: 0
    };

    if (editingItem) {
      setTemplates(templates.map(t => t.id === editingItem.id ? {...newTemplate, id: editingItem.id, usageCount: editingItem.usageCount} : t));
      showMessage('Template updated successfully', 'success');
    } else {
      setTemplates([...templates, newTemplate]);
      showMessage('Template added successfully', 'success');
    }

    resetTemplateForm();
    setShowTemplateModal(false);
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      content: '',
      category: 'promotion'
    });
    setEditingItem(null);
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{(\w+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingItem(template);
    setTemplateForm({
      name: template.name,
      content: template.content,
      category: template.category
    });
    setShowTemplateModal(true);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    showMessage('Template deleted successfully', 'success');
    setShowDeleteConfirm({show: false, type: '', id: ''});
  };

  // Campaign management
  const handleAddCampaign = () => {
    if (!campaignForm.name.trim() || !campaignForm.templateId || campaignForm.contactIds.length === 0) {
      showMessage('Name, template, and contacts are required', 'error');
      return;
    }

    const template = templates.find(t => t.id === campaignForm.templateId);
    const selectedContacts = contacts.filter(c => campaignForm.contactIds.includes(c.id));

    const newCampaign: Campaign = {
      id: generateId(),
      name: campaignForm.name.trim(),
      templateId: campaignForm.templateId,
      contactIds: campaignForm.contactIds,
      scheduledDate: campaignForm.scheduledDate || new Date().toISOString(),
      status: campaignForm.scheduledDate ? 'scheduled' : 'draft',
      createdDate: new Date().toISOString().split('T')[0],
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      totalContacts: selectedContacts.length,
      message: campaignForm.customMessage || template?.content || ''
    };

    setCampaigns([...campaigns, newCampaign]);
    
    // Update template usage count
    if (template) {
      setTemplates(templates.map(t => 
        t.id === template.id ? {...t, usageCount: t.usageCount + 1} : t
      ));
    }

    showMessage('Campaign created successfully', 'success');
    resetCampaignForm();
    setShowCampaignModal(false);
  };

  const resetCampaignForm = () => {
    setCampaignForm({
      name: '',
      templateId: '',
      contactIds: [],
      scheduledDate: '',
      customMessage: ''
    });
    setEditingItem(null);
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    showMessage('Campaign deleted successfully', 'success');
    setShowDeleteConfirm({show: false, type: '', id: ''});
  };

  // AI Integration
  const handleOptimizeMessage = async (content: string) => {
    const prompt = `Please optimize this WhatsApp marketing message for better engagement. Make it more compelling, add appropriate emojis, and ensure it's concise but effective. Keep any variables like {name} intact. 

Original message: ${content}

Please provide an optimized version that:
1. Is engaging and professional
2. Uses appropriate emojis
3. Has a clear call-to-action
4. Maintains the original variables
5. Is suitable for WhatsApp marketing

Return the response in this JSON format:
{
  "optimized_message": "the optimized message here",
  "improvements": ["list of improvements made"],
  "engagement_tips": ["tips for better engagement"]
}`;

    try {
      setAiResult(null);
      setAiError(null);
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      showMessage('Failed to optimize message', 'error');
    }
  };

  const handleAnalyzeContacts = async (file: File) => {
    const prompt = `Analyze this contact file and extract contact information. Return the data in JSON format with the following structure:
{
  "contacts": [
    {
      "name": "contact name",
      "phone": "phone number",
      "email": "email address",
      "company": "company name",
      "tags": ["relevant", "tags"]
    }
  ],
  "summary": {
    "total_contacts": "number",
    "data_quality": "assessment of data quality",
    "suggestions": ["suggestions for improvement"]
  }
}`;

    try {
      setAiResult(null);
      setAiError(null);
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      showMessage('Failed to analyze contacts', 'error');
    }
  };

  // File handling
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        handleAnalyzeContacts(file);
      }
    }
  };

  const downloadContactsTemplate = () => {
    const csvContent = 'name,phone,email,company,tags\nJohn Doe,+1234567890,john@example.com,ABC Corp,"customer,premium"\nJane Smith,+1234567891,jane@example.com,XYZ Ltd,"lead,interested"';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportContacts = () => {
    const csvHeaders = 'name,phone,email,company,tags,status,addedDate\n';
    const csvData = contacts.map(contact => 
      `"${contact.name}","${contact.phone}","${contact.email || ''}","${contact.company || ''}","${contact.tags.join(';')}","${contact.status}","${contact.addedDate}"`
    ).join('\n');
    
    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportCampaigns = () => {
    const csvHeaders = 'name,status,totalContacts,sentCount,deliveredCount,readCount,createdDate,scheduledDate\n';
    const csvData = campaigns.map(campaign => 
      `"${campaign.name}","${campaign.status}","${campaign.totalContacts}","${campaign.sentCount}","${campaign.deliveredCount}","${campaign.readCount}","${campaign.createdDate}","${campaign.scheduledDate}"`
    ).join('\n');
    
    const blob = new Blob([csvHeaders + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Analytics calculations
  const getAnalytics = (): CampaignAnalytics => {
    const totalMessagesSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
    const totalRead = campaigns.reduce((sum, c) => sum + c.readCount, 0);
    const activeContacts = contacts.filter(c => c.status === 'active').length;

    return {
      totalCampaigns: campaigns.length,
      totalMessagesSent,
      deliveryRate: totalMessagesSent > 0 ? (totalDelivered / totalMessagesSent) * 100 : 0,
      readRate: totalDelivered > 0 ? (totalRead / totalDelivered) * 100 : 0,
      activeContacts,
      monthlyGrowth: 12.5 // Mock data
    };
  };

  // Filter functions
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm) ||
                         contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || campaign.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Render functions
  const renderCampaigns = () => (
    <div className="space-y-6" id="campaigns-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-3">Campaigns</h2>
          <p className="text-caption">Manage your WhatsApp marketing campaigns</p>
        </div>
        <button 
          onClick={() => setShowCampaignModal(true)}
          className="btn btn-primary"
          id="create-campaign-btn"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select w-full sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredCampaigns.length === 0 ? (
          <div className="card card-padding text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-5 mb-2">No campaigns found</h3>
            <p className="text-caption mb-4">Create your first campaign to start sending messages</p>
            <button onClick={() => setShowCampaignModal(true)} className="btn btn-primary">
              Create Campaign
            </button>
          </div>
        ) : (
          filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="card card-padding">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="heading-5">{campaign.name}</h3>
                    <span className={`badge ${
                      campaign.status === 'completed' ? 'badge-success' :
                      campaign.status === 'scheduled' ? 'badge-primary' :
                      campaign.status === 'sending' ? 'badge-warning' :
                      campaign.status === 'failed' ? 'badge-error' :
                      'badge-gray'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Contacts:</span>
                      <span className="ml-1 font-medium">{campaign.totalContacts}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Sent:</span>
                      <span className="ml-1 font-medium">{campaign.sentCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Delivered:</span>
                      <span className="ml-1 font-medium">{campaign.deliveredCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Read:</span>
                      <span className="ml-1 font-medium">{campaign.readCount}</span>
                    </div>
                  </div>
                  <p className="text-caption mt-2">
                    Created: {new Date(campaign.createdDate).toLocaleDateString()}
                    {campaign.scheduledDate && (
                      <span className="ml-4">
                        Scheduled: {new Date(campaign.scheduledDate).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderContacts = () => (
    <div className="space-y-6" id="contacts-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-3">Contacts</h2>
          <p className="text-caption">Manage your customer contact list</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={downloadContactsTemplate}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Template
          </button>
          <button 
            onClick={exportContacts}
            className="btn btn-secondary btn-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <label className="btn btn-secondary btn-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button 
            onClick={() => setShowContactModal(true)}
            className="btn btn-primary btn-sm"
            id="add-contact-btn"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="select w-full sm:w-48"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredContacts.length === 0 ? (
          <div className="card card-padding text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-5 mb-2">No contacts found</h3>
            <p className="text-caption mb-4">Add contacts to start building your audience</p>
            <button onClick={() => setShowContactModal(true)} className="btn btn-primary">
              Add Contact
            </button>
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div key={contact.id} className="card card-padding">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="avatar avatar-sm bg-primary-100 text-primary-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="heading-6">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <span className={`badge ${
                      contact.status === 'active' ? 'badge-success' :
                      contact.status === 'inactive' ? 'badge-warning' :
                      'badge-error'
                    }`}>
                      {contact.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {contact.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.company && (
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-gray-400" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>Added: {new Date(contact.addedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {contact.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contact.tags.map((tag, index) => (
                        <span key={index} className="badge badge-gray text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditContact(contact)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm({show: true, type: 'contact', id: contact.id})}
                    className="btn btn-secondary btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTemplates = () => (
    <div className="space-y-6" id="templates-tab">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="heading-3">Message Templates</h2>
          <p className="text-caption">Create reusable message templates</p>
        </div>
        <button 
          onClick={() => setShowTemplateModal(true)}
          className="btn btn-primary"
          id="create-template-btn"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredTemplates.length === 0 ? (
          <div className="card card-padding text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="heading-5 mb-2">No templates found</h3>
            <p className="text-caption mb-4">Create templates to streamline your messaging</p>
            <button onClick={() => setShowTemplateModal(true)} className="btn btn-primary">
              Create Template
            </button>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <div key={template.id} className="card card-padding">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="heading-5">{template.name}</h3>
                    <span className="badge badge-primary">{template.category}</span>
                    <span className="text-sm text-gray-500">
                      Used {template.usageCount} times
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                    <p className="text-sm">{template.content}</p>
                  </div>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="text-sm text-gray-500">Variables:</span>
                      {template.variables.map((variable, index) => (
                        <span key={index} className="badge badge-secondary text-xs">
                          {`{${variable}}`}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-caption">
                    Created: {new Date(template.createdDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOptimizeMessage(template.content)}
                    className="btn btn-secondary btn-sm"
                    disabled={aiLoading}
                  >
                    <Sparkles className="w-4 h-4" />
                    {aiLoading ? 'Optimizing...' : 'AI Optimize'}
                  </button>
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="btn btn-secondary btn-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm({show: true, type: 'template', id: template.id})}
                    className="btn btn-secondary btn-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const analytics = getAnalytics();
    
    return (
      <div className="space-y-6" id="analytics-tab">
        <div>
          <h2 className="heading-3">Analytics & Reports</h2>
          <p className="text-caption">Track your campaign performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-title">Total Campaigns</p>
                <p className="stat-value">{analytics.totalCampaigns}</p>
              </div>
              <Target className="w-8 h-8 text-primary-600" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-title">Messages Sent</p>
                <p className="stat-value">{analytics.totalMessagesSent}</p>
              </div>
              <Send className="w-8 h-8 text-success-600" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-title">Delivery Rate</p>
                <p className="stat-value">{analytics.deliveryRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success-600" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-title">Read Rate</p>
                <p className="stat-value">{analytics.readRate.toFixed(1)}%</p>
              </div>
              <Eye className="w-8 h-8 text-info-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card card-padding">
            <h3 className="heading-5 mb-4">Campaign Status Overview</h3>
            <div className="space-y-3">
              {['completed', 'scheduled', 'draft', 'failed'].map(status => {
                const count = campaigns.filter(c => c.status === status).length;
                const percentage = campaigns.length > 0 ? (count / campaigns.length) * 100 : 0;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        status === 'completed' ? 'bg-success-500' :
                        status === 'scheduled' ? 'bg-primary-500' :
                        status === 'draft' ? 'bg-gray-400' :
                        'bg-error-500'
                      }`}></div>
                      <span className="text-sm font-medium capitalize">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{count}</span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            status === 'completed' ? 'bg-success-500' :
                            status === 'scheduled' ? 'bg-primary-500' :
                            status === 'draft' ? 'bg-gray-400' :
                            'bg-error-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card card-padding">
            <h3 className="heading-5 mb-4">Contact Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users2 className="w-5 h-5 text-success-600" />
                  <span className="font-medium">Active Contacts</span>
                </div>
                <span className="text-lg font-bold text-success-600">
                  {contacts.filter(c => c.status === 'active').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-medium">Total Contacts</span>
                </div>
                <span className="text-lg font-bold">{contacts.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Monthly Growth</span>
                </div>
                <span className="text-lg font-bold text-primary-600">+{analytics.monthlyGrowth}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card card-padding">
            <div className="flex items-center justify-between mb-4">
              <h3 className="heading-5">Recent Campaigns</h3>
              <button 
                onClick={exportCampaigns}
                className="btn btn-secondary btn-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="space-y-3">
              {campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(campaign.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{campaign.sentCount} sent</p>
                    <span className={`badge ${
                      campaign.status === 'completed' ? 'badge-success' :
                      campaign.status === 'scheduled' ? 'badge-primary' :
                      campaign.status === 'sending' ? 'badge-warning' :
                      campaign.status === 'failed' ? 'badge-error' :
                      'badge-gray'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card card-padding">
            <h3 className="heading-5 mb-4">Template Usage</h3>
            <div className="space-y-3">
              {templates.sort((a, b) => b.usageCount - a.usageCount).slice(0, 5).map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{template.name}</p>
                    <p className="text-sm text-gray-500">{template.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{template.usageCount} uses</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6" id="settings-tab">
      <div>
        <h2 className="heading-3">Settings</h2>
        <p className="text-caption">Manage your app preferences and data</p>
      </div>

      <div className="grid gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-2 btn btn-secondary"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Export All Data</p>
                <p className="text-sm text-gray-500">Download all your contacts and campaigns</p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportContacts} className="btn btn-secondary btn-sm">
                  <Download className="w-4 h-4" />
                  Contacts
                </button>
                <button onClick={exportCampaigns} className="btn btn-secondary btn-sm">
                  <Download className="w-4 h-4" />
                  Campaigns
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Import Contacts</p>
                <p className="text-sm text-gray-500">Upload contacts from CSV file</p>
              </div>
              <div className="flex gap-2">
                <button onClick={downloadContactsTemplate} className="btn btn-secondary btn-sm">
                  <Download className="w-4 h-4" />
                  Template
                </button>
                <label className="btn btn-primary btn-sm cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-error-600">Clear All Data</p>
                  <p className="text-sm text-gray-500">This will delete all contacts, templates, and campaigns</p>
                </div>
                <button 
                  onClick={() => setShowDeleteConfirm({show: true, type: 'all', id: 'all'})}
                  className="btn btn-error btn-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">AI Features</h3>
          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">Message Optimization</p>
              <p className="text-sm text-gray-500 mb-4">
                Use AI to optimize your message templates for better engagement
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ AI-generated content may not always be accurate. Please review and edit as needed before sending to customers.
                </p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Contact Data Extraction</p>
              <p className="text-sm text-gray-500">
                AI can help extract and organize contact information from uploaded files
              </p>
            </div>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Account</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Signed in as {currentUser?.first_name} {currentUser?.last_name}</p>
              <p className="text-sm text-gray-500">{currentUser?.email}</p>
            </div>
            <button onClick={logout} className="btn btn-secondary">
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Handle AI results
  useEffect(() => {
    if (aiResult) {
      try {
        const parsed = JSON.parse(aiResult);
        if (parsed.contacts) {
          // Handle contact import
          const newContacts = parsed.contacts.map((contact: any) => ({
            id: generateId(),
            name: contact.name || '',
            phone: contact.phone || '',
            email: contact.email || '',
            company: contact.company || '',
            tags: Array.isArray(contact.tags) ? contact.tags : [],
            addedDate: new Date().toISOString().split('T')[0],
            status: 'active' as const
          }));
          setContacts(prev => [...prev, ...newContacts]);
          showMessage(`Imported ${newContacts.length} contacts successfully`, 'success');
        } else if (parsed.optimized_message) {
          // Handle message optimization
          setTemplateForm(prev => ({
            ...prev,
            content: parsed.optimized_message
          }));
          showMessage('Message optimized successfully', 'success');
        }
      } catch (error) {
        // Handle non-JSON AI responses (markdown)
        console.log('AI Response:', aiResult);
      }
    }
  }, [aiResult]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition" id="welcome_fallback">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container container-lg">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3" id="generation_issue_fallback">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">WhatsApp Bulk Messenger Pro</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Professional messaging platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2">
                <div className="avatar avatar-sm bg-primary-100 text-primary-600">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser?.first_name}
                </span>
              </div>
              <button onClick={logout} className="btn btn-secondary btn-sm">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container container-lg">
          <div className="flex overflow-x-auto">
            {[
              { id: 'campaigns', label: 'Campaigns', icon: Target },
              { id: 'contacts', label: 'Contacts', icon: Users },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: ChartBar },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id as TabType);
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                id={`${id}-tab`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container container-lg py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="alert alert-success mb-6 animate-slide-in-down">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error mb-6 animate-slide-in-down">
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'campaigns' && renderCampaigns()}
          {activeTab === 'contacts' && renderContacts()}
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal-backdrop" onClick={() => {
          setShowContactModal(false);
          resetContactForm();
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">{editingItem ? 'Edit Contact' : 'Add Contact'}</h3>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  resetContactForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label form-label-required">Name</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="input"
                  placeholder="Enter contact name"
                />
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Phone</label>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                  className="input"
                  placeholder="+1234567890"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="input"
                  placeholder="contact@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                  className="input"
                  placeholder="Company name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <input
                  type="text"
                  value={contactForm.tags}
                  onChange={(e) => setContactForm({...contactForm, tags: e.target.value})}
                  className="input"
                  placeholder="customer, premium, interested (comma separated)"
                />
                <p className="form-help">Separate tags with commas</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowContactModal(false);
                  resetContactForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleAddContact} className="btn btn-primary">
                {editingItem ? 'Update' : 'Add'} Contact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="modal-backdrop" onClick={() => {
          setShowTemplateModal(false);
          resetTemplateForm();
        }}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">{editingItem ? 'Edit Template' : 'Create Template'}</h3>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  resetTemplateForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="form-group">
                <label className="form-label form-label-required">Template Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                  className="input"
                  placeholder="Enter template name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                  className="select"
                >
                  <option value="promotion">Promotion</option>
                  <option value="welcome">Welcome</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="notification">Notification</option>
                  <option value="reminder">Reminder</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label form-label-required">Message Content</label>
                <textarea
                  value={templateForm.content}
                  onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                  className="textarea"
                  rows={6}
                  placeholder="Enter your message template. Use {name}, {company}, {date} etc. for variables"
                />
                <p className="form-help">
                  Use curly braces for variables: {`{name}`}, {`{company}`}, {`{date}`}, etc.
                </p>
              </div>
              {templateForm.content && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Variables detected:</p>
                  <div className="flex flex-wrap gap-1">
                    {extractVariables(templateForm.content).map((variable, index) => (
                      <span key={index} className="badge badge-primary text-xs">
                        {`{${variable}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => handleOptimizeMessage(templateForm.content)}
                className="btn btn-secondary"
                disabled={!templateForm.content.trim() || aiLoading}
              >
                <Sparkles className="w-4 h-4" />
                {aiLoading ? 'Optimizing...' : 'AI Optimize'}
              </button>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  resetTemplateForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleAddTemplate} className="btn btn-primary">
                {editingItem ? 'Update' : 'Create'} Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="modal-backdrop" onClick={() => {
          setShowCampaignModal(false);
          resetCampaignForm();
        }}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Create Campaign</h3>
              <button
                onClick={() => {
                  setShowCampaignModal(false);
                  resetCampaignForm();
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    className="input"
                    placeholder="Enter campaign name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Schedule Date</label>
                  <input
                    type="datetime-local"
                    value={campaignForm.scheduledDate}
                    onChange={(e) => setCampaignForm({...campaignForm, scheduledDate: e.target.value})}
                    className="input"
                  />
                  <p className="form-help">Leave empty to save as draft</p>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Message Template</label>
                <select
                  value={campaignForm.templateId}
                  onChange={(e) => setCampaignForm({...campaignForm, templateId: e.target.value})}
                  className="select"
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.category}
                    </option>
                  ))}
                </select>
              </div>

              {campaignForm.templateId && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">Template Preview:</p>
                  <p className="text-sm">
                    {templates.find(t => t.id === campaignForm.templateId)?.content}
                  </p>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Custom Message (Optional)</label>
                <textarea
                  value={campaignForm.customMessage}
                  onChange={(e) => setCampaignForm({...campaignForm, customMessage: e.target.value})}
                  className="textarea"
                  rows={4}
                  placeholder="Override template with custom message"
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Select Contacts</label>
                <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                  {contacts.filter(c => c.status === 'active').map((contact) => (
                    <label key={contact.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={campaignForm.contactIds.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCampaignForm({
                              ...campaignForm,
                              contactIds: [...campaignForm.contactIds, contact.id]
                            });
                          } else {
                            setCampaignForm({
                              ...campaignForm,
                              contactIds: campaignForm.contactIds.filter(id => id !== contact.id)
                            });
                          }
                        }}
                        className="checkbox"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-gray-500">{contact.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <p className="form-help">
                  Selected: {campaignForm.contactIds.length} contacts
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => {
                  setShowCampaignModal(false);
                  resetCampaignForm();
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleAddCampaign} className="btn btn-primary">
                Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="modal-backdrop">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="heading-5">Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>
                {showDeleteConfirm.type === 'all' 
                  ? 'Are you sure you want to delete all data? This action cannot be undone.'
                  : `Are you sure you want to delete this ${showDeleteConfirm.type}?`
                }
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm({show: false, type: '', id: ''})}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (showDeleteConfirm.type === 'contact') {
                    handleDeleteContact(showDeleteConfirm.id);
                  } else if (showDeleteConfirm.type === 'template') {
                    handleDeleteTemplate(showDeleteConfirm.id);
                  } else if (showDeleteConfirm.type === 'campaign') {
                    handleDeleteCampaign(showDeleteConfirm.id);
                  } else if (showDeleteConfirm.type === 'all') {
                    setContacts([]);
                    setTemplates([]);
                    setCampaigns([]);
                    localStorage.removeItem('whatsapp_contacts');
                    localStorage.removeItem('whatsapp_templates');
                    localStorage.removeItem('whatsapp_campaigns');
                    showMessage('All data cleared successfully', 'success');
                    setShowDeleteConfirm({show: false, type: '', id: ''});
                  }
                }}
                className="btn btn-error"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Result Display */}
      {aiResult && !aiError && (
        <div className="fixed bottom-4 right-4 max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-medium">AI Response</h4>
            <button
              onClick={() => setAiResult(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm dark:prose-invert">
              {aiResult}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 theme-transition">
        <div className="container container-lg">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;