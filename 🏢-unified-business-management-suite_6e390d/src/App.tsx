import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import {
  User, UserPlus, Mail, DollarSign, Users, MessageCircle, Calendar, Package,
  BarChart3, FileText, Settings, Menu, X, Plus, Search, Filter, Edit, Trash2,
  Eye, Download, Upload, Bell, CheckCircle, Clock, AlertCircle, TrendingUp,
  TrendingDown, Home, CreditCard, Phone, MapPin, Building, Target, Award,
  Activity, Zap, Shield, Key, Moon, Sun, Globe, Database, Palette
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Employee';
  department: string;
  avatar?: string;
  status: 'Active' | 'Inactive';
  lastLogin?: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: 'Lead' | 'Prospect' | 'Customer' | 'Inactive';
  value: number;
  lastContact?: string;
  notes: string;
}

interface Email {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  status: 'Unread' | 'Read' | 'Replied' | 'Archived';
  priority: 'Low' | 'Medium' | 'High';
}

interface Transaction {
  id: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  salary: number;
  hireDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  performance: number;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  assignee: string;
  requester: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
  progress: number;
  startDate: string;
  endDate: string;
  teamMembers: string[];
  budget: number;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  supplier: string;
  lastRestocked: string;
  minStock: number;
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  createdAt: string;
  responses: number;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox';
  required: boolean;
  options?: string[];
}

interface Analytics {
  revenue: number;
  customers: number;
  projects: number;
  tickets: number;
  revenueGrowth: number;
  customerGrowth: number;
}

type ModuleType = 'dashboard' | 'crm' | 'email' | 'accounting' | 'hr' | 'helpdesk' | 'projects' | 'inventory' | 'analytics' | 'forms' | 'settings';

const App: React.FC = () => {
  // State Management
  const [currentModule, setCurrentModule] = useState<ModuleType>('dashboard');
  const [currentUser] = useState<User>({
    id: '1',
    name: 'John Admin',
    email: 'admin@company.com',
    role: 'Admin',
    department: 'Management',
    status: 'Active'
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Data States
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [forms, setForms] = useState<FormTemplate[]>([]);

  // Initialize demo data
  useEffect(() => {
    const initializeData = () => {
      // Initialize contacts
      const demoContacts: Contact[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@techcorp.com',
          phone: '+1-555-0123',
          company: 'TechCorp Inc',
          position: 'CEO',
          status: 'Customer',
          value: 50000,
          lastContact: '2024-01-15',
          notes: 'Key decision maker for enterprise solutions'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@startup.io',
          phone: '+1-555-0124',
          company: 'StartupIO',
          position: 'CTO',
          status: 'Lead',
          value: 25000,
          lastContact: '2024-01-12',
          notes: 'Interested in our SaaS platform'
        }
      ];

      // Initialize emails
      const demoEmails: Email[] = [
        {
          id: '1',
          from: 'alice@techcorp.com',
          to: 'admin@company.com',
          subject: 'Partnership Proposal',
          body: 'Hi, I would like to discuss a potential partnership...',
          timestamp: '2024-01-15T10:30:00Z',
          status: 'Unread',
          priority: 'High'
        },
        {
          id: '2',
          from: 'support@vendor.com',
          to: 'admin@company.com',
          subject: 'Monthly Invoice',
          body: 'Please find attached your monthly invoice...',
          timestamp: '2024-01-14T15:45:00Z',
          status: 'Read',
          priority: 'Medium'
        }
      ];

      // Initialize transactions
      const demoTransactions: Transaction[] = [
        {
          id: '1',
          type: 'Income',
          category: 'Sales',
          amount: 5000,
          description: 'Software license sale',
          date: '2024-01-15',
          status: 'Completed'
        },
        {
          id: '2',
          type: 'Expense',
          category: 'Office',
          amount: 1200,
          description: 'Monthly office rent',
          date: '2024-01-01',
          status: 'Completed'
        }
      ];

      // Initialize employees
      const demoEmployees: Employee[] = [
        {
          id: '1',
          name: 'Sarah Wilson',
          email: 'sarah@company.com',
          position: 'Software Engineer',
          department: 'Engineering',
          salary: 85000,
          hireDate: '2023-03-15',
          status: 'Active',
          performance: 4.5
        },
        {
          id: '2',
          name: 'Mike Davis',
          email: 'mike@company.com',
          position: 'Sales Manager',
          department: 'Sales',
          salary: 75000,
          hireDate: '2022-11-20',
          status: 'Active',
          performance: 4.2
        }
      ];

      // Initialize tickets
      const demoTickets: Ticket[] = [
        {
          id: '1',
          title: 'Login Issue',
          description: 'User cannot access their account',
          priority: 'High',
          status: 'Open',
          assignee: 'Sarah Wilson',
          requester: 'Alice Johnson',
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        },
        {
          id: '2',
          title: 'Feature Request',
          description: 'Add dark mode to dashboard',
          priority: 'Medium',
          status: 'In Progress',
          assignee: 'Mike Davis',
          requester: 'Bob Smith',
          createdAt: '2024-01-14T14:30:00Z',
          updatedAt: '2024-01-15T08:15:00Z'
        }
      ];

      // Initialize projects
      const demoProjects: Project[] = [
        {
          id: '1',
          name: 'Mobile App Development',
          description: 'Develop a mobile app for iOS and Android',
          status: 'In Progress',
          progress: 65,
          startDate: '2024-01-01',
          endDate: '2024-06-30',
          teamMembers: ['Sarah Wilson', 'Mike Davis'],
          budget: 150000
        },
        {
          id: '2',
          name: 'Website Redesign',
          description: 'Complete overhaul of company website',
          status: 'Planning',
          progress: 15,
          startDate: '2024-02-01',
          endDate: '2024-05-01',
          teamMembers: ['Sarah Wilson'],
          budget: 75000
        }
      ];

      // Initialize inventory
      const demoInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Laptop Computer',
          sku: 'LPT-001',
          category: 'Electronics',
          quantity: 25,
          unitPrice: 1200,
          supplier: 'TechSupplier Inc',
          lastRestocked: '2024-01-10',
          minStock: 10
        },
        {
          id: '2',
          name: 'Office Chair',
          sku: 'CHR-001',
          category: 'Furniture',
          quantity: 8,
          unitPrice: 300,
          supplier: 'Office Furniture Co',
          lastRestocked: '2024-01-05',
          minStock: 5
        }
      ];

      // Initialize forms
      const demoForms: FormTemplate[] = [
        {
          id: '1',
          name: 'Customer Feedback',
          description: 'Collect feedback from customers',
          fields: [
            { id: '1', label: 'Name', type: 'text', required: true },
            { id: '2', label: 'Email', type: 'email', required: true },
            { id: '3', label: 'Rating', type: 'select', required: true, options: ['1', '2', '3', '4', '5'] },
            { id: '4', label: 'Comments', type: 'textarea', required: false }
          ],
          createdAt: '2024-01-01',
          responses: 23
        }
      ];

      // Load from localStorage or use demo data
      setContacts(JSON.parse(localStorage.getItem('contacts') || JSON.stringify(demoContacts)));
      setEmails(JSON.parse(localStorage.getItem('emails') || JSON.stringify(demoEmails)));
      setTransactions(JSON.parse(localStorage.getItem('transactions') || JSON.stringify(demoTransactions)));
      setEmployees(JSON.parse(localStorage.getItem('employees') || JSON.stringify(demoEmployees)));
      setTickets(JSON.parse(localStorage.getItem('tickets') || JSON.stringify(demoTickets)));
      setProjects(JSON.parse(localStorage.getItem('projects') || JSON.stringify(demoProjects)));
      setInventory(JSON.parse(localStorage.getItem('inventory') || JSON.stringify(demoInventory)));
      setForms(JSON.parse(localStorage.getItem('forms') || JSON.stringify(demoForms)));
    };

    initializeData();
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('emails', JSON.stringify(emails));
  }, [emails]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  useEffect(() => {
    localStorage.setItem('projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('forms', JSON.stringify(forms));
  }, [forms]);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Modal handlers
  const openModal = useCallback((type: string, item?: any) => {
    setModalType(type);
    setSelectedItem(item || null);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setModalType('');
    setSelectedItem(null);
    document.body.classList.remove('modal-open');
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal]);

  // Analytics calculations
  const analytics = useMemo((): Analytics => {
    const totalRevenue = transactions
      .filter(t => t.type === 'Income' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalCustomers = contacts.filter(c => c.status === 'Customer').length;
    const totalProjects = projects.length;
    const totalTickets = tickets.filter(t => t.status === 'Open').length;

    return {
      revenue: totalRevenue,
      customers: totalCustomers,
      projects: totalProjects,
      tickets: totalTickets,
      revenueGrowth: 12.5,
      customerGrowth: 8.3
    };
  }, [transactions, contacts, projects, tickets]);

  // Chart data
  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 10000) + 5000,
      expenses: Math.floor(Math.random() * 5000) + 2000
    }));
  }, []);

  const statusData = useMemo(() => {
    const statusCounts = tickets.reduce((acc: Record<string, number>, ticket) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  // Module navigation
  const modules = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'text-blue-600' },
    { id: 'crm', name: 'CRM', icon: Users, color: 'text-green-600' },
    { id: 'email', name: 'Email', icon: Mail, color: 'text-purple-600' },
    { id: 'accounting', name: 'Accounting', icon: DollarSign, color: 'text-yellow-600' },
    { id: 'hr', name: 'HR', icon: User, color: 'text-red-600' },
    { id: 'helpdesk', name: 'Help Desk', icon: MessageCircle, color: 'text-indigo-600' },
    { id: 'projects', name: 'Projects', icon: Calendar, color: 'text-pink-600' },
    { id: 'inventory', name: 'Inventory', icon: Package, color: 'text-orange-600' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, color: 'text-teal-600' },
    { id: 'forms', name: 'Forms', icon: FileText, color: 'text-cyan-600' }
  ];

  // CRUD Operations
  const handleAddContact = (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: Date.now().toString() };
    setContacts(prev => [...prev, newContact]);
    closeModal();
  };

  const handleEditContact = (updatedContact: Contact) => {
    setContacts(prev => prev.map(c => c.id === updatedContact.id ? updatedContact : c));
    closeModal();
  };

  const handleDeleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Similar CRUD operations for other entities
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: Date.now().toString() };
    setTransactions(prev => [...prev, newTransaction]);
    closeModal();
  };

  const handleAddEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: Date.now().toString() };
    setEmployees(prev => [...prev, newEmployee]);
    closeModal();
  };

  const handleAddTicket = (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTicket = { ...ticket, id: Date.now().toString(), createdAt: now, updatedAt: now };
    setTickets(prev => [...prev, newTicket]);
    closeModal();
  };

  const handleAddProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: Date.now().toString() };
    setProjects(prev => [...prev, newProject]);
    closeModal();
  };

  const handleAddInventory = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: Date.now().toString() };
    setInventory(prev => [...prev, newItem]);
    closeModal();
  };

  // Export functions
  const exportData = (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(item => Object.values(item).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Settings handlers
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setContacts([]);
      setEmails([]);
      setTransactions([]);
      setEmployees([]);
      setTickets([]);
      setProjects([]);
      setInventory([]);
      setForms([]);
      localStorage.clear();
    }
  };

  const exportAllData = () => {
    const allData = {
      contacts,
      emails,
      transactions,
      employees,
      tickets,
      projects,
      inventory,
      forms
    };
    
    const jsonContent = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business_suite_data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render functions for each module
  const renderDashboard = () => (
    <div className="space-y-6" id="dashboard-main">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 p-2"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <Bell className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card" id="revenue-stat">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value">${analytics.revenue.toLocaleString()}</div>
              <div className="stat-desc flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{analytics.revenueGrowth}% from last month
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="stat-card" id="customers-stat">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Customers</div>
              <div className="stat-value">{analytics.customers}</div>
              <div className="stat-desc flex items-center text-blue-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                +{analytics.customerGrowth}% growth
              </div>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="stat-card" id="projects-stat">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Active Projects</div>
              <div className="stat-value">{analytics.projects}</div>
              <div className="stat-desc">2 due this week</div>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="stat-card" id="tickets-stat">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Open Tickets</div>
              <div className="stat-value">{analytics.tickets}</div>
              <div className="stat-desc">1 high priority</div>
            </div>
            <MessageCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Revenue & Expenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3B82F6" />
              <Bar dataKey="expenses" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Ticket Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm">New customer Alice Johnson added to CRM</span>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm">Project Mobile App Development updated</span>
            <span className="text-xs text-gray-500 ml-auto">4 hours ago</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm">High priority ticket Login Issue created</span>
            <span className="text-xs text-gray-500 ml-auto">6 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCRM = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">CRM</h1>
        <button
          onClick={() => openModal('add-contact')}
          className="btn btn-primary flex items-center gap-2"
          id="add-contact-btn"
        >
          <UserPlus className="h-5 w-5" />
          Add Contact
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filter
        </button>
        <button
          onClick={() => exportData(contacts, 'contacts')}
          className="btn bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      {/* Contacts Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Company</th>
              <th className="table-header">Status</th>
              <th className="table-header">Value</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {contacts
              .filter(contact => 
                contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                contact.company.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(contact => (
                <tr key={contact.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-gray-500 text-sm">{contact.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">{contact.company}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      contact.status === 'Customer' ? 'badge-success' :
                      contact.status === 'Lead' ? 'badge-info' :
                      contact.status === 'Prospect' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {contact.status}
                    </span>
                  </td>
                  <td className="table-cell">${contact.value.toLocaleString()}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal('edit-contact', contact)}
                        className="btn btn-sm bg-blue-100 hover:bg-blue-200 text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="btn btn-sm bg-red-100 hover:bg-red-200 text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEmail = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Email</h1>
        <button
          onClick={() => openModal('compose-email')}
          className="btn btn-primary flex items-center gap-2"
          id="compose-email-btn"
        >
          <Plus className="h-5 w-5" />
          Compose
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Email Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-medium">
            Inbox ({emails.filter(e => e.status === 'Unread').length})
          </button>
          <button className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            Sent
          </button>
          <button className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            Drafts
          </button>
          <button className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
            Archived
          </button>
        </div>

        {/* Email List */}
        <div className="lg:col-span-3">
          <div className="space-y-2">
            {emails.map(email => (
              <div
                key={email.id}
                className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  email.status === 'Unread' ? 'bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                }`}
                onClick={() => openModal('view-email', email)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-medium ${
                        email.status === 'Unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {email.from}
                      </span>
                      <span className={`badge ${
                        email.priority === 'High' ? 'badge-error' :
                        email.priority === 'Medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {email.priority}
                      </span>
                    </div>
                    <h3 className={`font-medium mb-1 ${
                      email.status === 'Unread' ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {email.subject}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                      {email.body}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(email.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAccounting = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Accounting</h1>
        <button
          onClick={() => openModal('add-transaction')}
          className="btn btn-primary flex items-center gap-2"
          id="add-transaction-btn"
        >
          <Plus className="h-5 w-5" />
          Add Transaction
        </button>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-title">Total Income</div>
          <div className="stat-value text-green-600">
            ${transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Expenses</div>
          <div className="stat-value text-red-600">
            ${transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Net Profit</div>
          <div className="stat-value text-blue-600">
            ${(transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0) - 
               transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Date</th>
              <th className="table-header">Type</th>
              <th className="table-header">Category</th>
              <th className="table-header">Description</th>
              <th className="table-header">Amount</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {transactions.map(transaction => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="table-cell">{transaction.date}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    transaction.type === 'Income' ? 'badge-success' : 'badge-error'
                  }`}>
                    {transaction.type}
                  </span>
                </td>
                <td className="table-cell">{transaction.category}</td>
                <td className="table-cell">{transaction.description}</td>
                <td className="table-cell">
                  <span className={transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'}>
                    ${transaction.amount.toLocaleString()}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    transaction.status === 'Completed' ? 'badge-success' :
                    transaction.status === 'Pending' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHR = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Human Resources</h1>
        <button
          onClick={() => openModal('add-employee')}
          className="btn btn-primary flex items-center gap-2"
          id="add-employee-btn"
        >
          <UserPlus className="h-5 w-5" />
          Add Employee
        </button>
      </div>

      {/* HR Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Total Employees</div>
          <div className="stat-value">{employees.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Active</div>
          <div className="stat-value text-green-600">{employees.filter(e => e.status === 'Active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">On Leave</div>
          <div className="stat-value text-yellow-600">{employees.filter(e => e.status === 'On Leave').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg Performance</div>
          <div className="stat-value text-blue-600">
            {employees.length > 0 ? (employees.reduce((sum, e) => sum + e.performance, 0) / employees.length).toFixed(1) : '0'}
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Position</th>
              <th className="table-header">Department</th>
              <th className="table-header">Salary</th>
              <th className="table-header">Performance</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {employees.map(employee => (
              <tr key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="table-cell">
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-gray-500 text-sm">{employee.email}</div>
                  </div>
                </td>
                <td className="table-cell">{employee.position}</td>
                <td className="table-cell">{employee.department}</td>
                <td className="table-cell">${employee.salary.toLocaleString()}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(employee.performance / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm">{employee.performance}/5</span>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    employee.status === 'Active' ? 'badge-success' :
                    employee.status === 'On Leave' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {employee.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHelpDesk = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Help Desk</h1>
        <button
          onClick={() => openModal('add-ticket')}
          className="btn btn-primary flex items-center gap-2"
          id="add-ticket-btn"
        >
          <Plus className="h-5 w-5" />
          Create Ticket
        </button>
      </div>

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Total Tickets</div>
          <div className="stat-value">{tickets.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Open</div>
          <div className="stat-value text-red-600">{tickets.filter(t => t.status === 'Open').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">In Progress</div>
          <div className="stat-value text-yellow-600">{tickets.filter(t => t.status === 'In Progress').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Resolved</div>
          <div className="stat-value text-green-600">{tickets.filter(t => t.status === 'Resolved').length}</div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Title</th>
              <th className="table-header">Priority</th>
              <th className="table-header">Status</th>
              <th className="table-header">Assignee</th>
              <th className="table-header">Created</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {tickets.map(ticket => (
              <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="table-cell">
                  <div>
                    <div className="font-medium">{ticket.title}</div>
                    <div className="text-gray-500 text-sm">{ticket.description}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    ticket.priority === 'Critical' ? 'badge-error' :
                    ticket.priority === 'High' ? 'badge-warning' :
                    ticket.priority === 'Medium' ? 'badge-info' : 'badge-success'
                  }`}>
                    {ticket.priority}
                  </span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    ticket.status === 'Open' ? 'badge-error' :
                    ticket.status === 'In Progress' ? 'badge-warning' :
                    ticket.status === 'Resolved' ? 'badge-success' : 'badge-info'
                  }`}>
                    {ticket.status}
                  </span>
                </td>
                <td className="table-cell">{ticket.assignee}</td>
                <td className="table-cell">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                <td className="table-cell">
                  <button
                    onClick={() => openModal('view-ticket', ticket)}
                    className="btn btn-sm bg-blue-100 hover:bg-blue-200 text-blue-700"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <button
          onClick={() => openModal('add-project')}
          className="btn btn-primary flex items-center gap-2"
          id="add-project-btn"
        >
          <Plus className="h-5 w-5" />
          New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{project.name}</h3>
              <span className={`badge ${
                project.status === 'Completed' ? 'badge-success' :
                project.status === 'In Progress' ? 'badge-info' :
                project.status === 'Review' ? 'badge-warning' : 'badge-error'
              }`}>
                {project.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{project.description}</p>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all" 
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Budget: ${project.budget.toLocaleString()}</span>
                <span>Due: {project.endDate}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {project.teamMembers.length} members
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Inventory</h1>
        <button
          onClick={() => openModal('add-inventory')}
          className="btn btn-primary flex items-center gap-2"
          id="add-inventory-btn"
        >
          <Plus className="h-5 w-5" />
          Add Item
        </button>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Total Items</div>
          <div className="stat-value">{inventory.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Value</div>
          <div className="stat-value">
            ${inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Low Stock</div>
          <div className="stat-value text-red-600">
            {inventory.filter(item => item.quantity <= item.minStock).length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Categories</div>
          <div className="stat-value">
            {new Set(inventory.map(item => item.category)).size}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Item</th>
              <th className="table-header">SKU</th>
              <th className="table-header">Category</th>
              <th className="table-header">Quantity</th>
              <th className="table-header">Unit Price</th>
              <th className="table-header">Total Value</th>
              <th className="table-header">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="table-cell">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-gray-500 text-sm">{item.supplier}</div>
                  </div>
                </td>
                <td className="table-cell">{item.sku}</td>
                <td className="table-cell">{item.category}</td>
                <td className="table-cell">{item.quantity}</td>
                <td className="table-cell">${item.unitPrice}</td>
                <td className="table-cell">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    item.quantity <= item.minStock ? 'badge-error' :
                    item.quantity <= item.minStock * 2 ? 'badge-warning' : 'badge-success'
                  }`}>
                    {item.quantity <= item.minStock ? 'Low Stock' :
                     item.quantity <= item.minStock * 2 ? 'Medium' : 'In Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Revenue Growth</div>
          <div className="stat-value text-green-600">+{analytics.revenueGrowth}%</div>
          <div className="stat-desc">vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Customer Growth</div>
          <div className="stat-value text-blue-600">+{analytics.customerGrowth}%</div>
          <div className="stat-desc">vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg. Deal Size</div>
          <div className="stat-value">
            ${contacts.length > 0 ? Math.round(contacts.reduce((sum, c) => sum + c.value, 0) / contacts.length).toLocaleString() : '0'}
          </div>
          <div className="stat-desc">per customer</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Project Success Rate</div>
          <div className="stat-value text-green-600">
            {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'Completed').length / projects.length) * 100) : 0}%
          </div>
          <div className="stat-desc">completion rate</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Department Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { department: 'Sales', performance: 85 },
              { department: 'Engineering', performance: 92 },
              { department: 'Marketing', performance: 78 },
              { department: 'Support', performance: 88 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="performance" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Customers</h3>
          <div className="space-y-3">
            {contacts
              .sort((a, b) => b.value - a.value)
              .slice(0, 5)
              .map(contact => (
                <div key={contact.id} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{contact.name}</span>
                  <span className="text-sm text-green-600">${contact.value.toLocaleString()}</span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center">
                  <span className="text-sm">{transaction.description}</span>
                  <span className={`text-sm ${
                    transaction.type === 'Income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${transaction.amount.toLocaleString()}
                  </span>
                </div>
              ))
            }
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Database</span>
              <span className="badge badge-success">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">API Response</span>
              <span className="badge badge-success">Good</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Server Load</span>
              <span className="badge badge-warning">Medium</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderForms = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Forms</h1>
        <button
          onClick={() => openModal('create-form')}
          className="btn btn-primary flex items-center gap-2"
          id="create-form-btn"
        >
          <Plus className="h-5 w-5" />
          Create Form
        </button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forms.map(form => (
          <div key={form.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold">{form.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('edit-form', form)}
                  className="btn btn-sm bg-blue-100 hover:bg-blue-200 text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{form.description}</p>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Fields:</span>
                <span>{form.fields.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Responses:</span>
                <span className="text-green-600">{form.responses}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>Created:</span>
                <span>{form.createdAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Builder Preview */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Form Builder</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Create custom forms with drag-and-drop fields, validation rules, and automated responses.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <FileText className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Text Field</span>
          </div>
          <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <Mail className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Email Field</span>
          </div>
          <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <CheckCircle className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Checkbox</span>
          </div>
          <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <Plus className="h-6 w-6 mx-auto mb-2 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">More Fields</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6" id="settings-main">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Language</label>
              <select className="input">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select className="input">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select className="input">
                <option>UTC-8 (Pacific)</option>
                <option>UTC-5 (Eastern)</option>
                <option>UTC+0 (GMT)</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Dark Mode</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={exportAllData}
              className="btn bg-blue-100 hover:bg-blue-200 text-blue-700 w-full flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Export All Data
            </button>
            <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 w-full flex items-center justify-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </button>
            <button
              onClick={clearAllData}
              className="btn bg-red-100 hover:bg-red-200 text-red-700 w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Security</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Two-Factor Authentication</label>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Enable 2FA for enhanced security</span>
                <button className="btn btn-sm btn-primary">Enable</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password Policy</label>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>✓ Minimum 8 characters</div>
                <div>✓ At least one uppercase letter</div>
                <div>✓ At least one number</div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Backup:</span>
              <span>2024-01-15</span>
            </div>
            <div className="flex justify-between">
              <span>Storage Used:</span>
              <span>2.4 MB</span>
            </div>
            <div className="flex justify-between">
              <span>Active Users:</span>
              <span>{employees.filter(e => e.status === 'Active').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Master Data Management */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Master Data</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-2">Departments</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Manage company departments</p>
            <button className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700">Manage</button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-2">Categories</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Product and expense categories</p>
            <button className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700">Manage</button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-2">Templates</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Document templates</p>
            <button className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700">Manage</button>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
            <h4 className="font-medium mb-2">Integrations</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Third-party connections</p>
            <button className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700">Manage</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Modal Content Renderer
  const renderModalContent = () => {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      
      switch (modalType) {
        case 'add-contact':
          handleAddContact({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            company: formData.get('company') as string,
            position: formData.get('position') as string,
            status: formData.get('status') as Contact['status'],
            value: Number(formData.get('value')),
            notes: formData.get('notes') as string
          });
          break;
        case 'add-transaction':
          handleAddTransaction({
            type: formData.get('type') as Transaction['type'],
            category: formData.get('category') as string,
            amount: Number(formData.get('amount')),
            description: formData.get('description') as string,
            date: formData.get('date') as string,
            status: 'Completed'
          });
          break;
        case 'add-employee':
          handleAddEmployee({
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            position: formData.get('position') as string,
            department: formData.get('department') as string,
            salary: Number(formData.get('salary')),
            hireDate: formData.get('hireDate') as string,
            status: 'Active',
            performance: 4.0
          });
          break;
        case 'add-ticket':
          handleAddTicket({
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            priority: formData.get('priority') as Ticket['priority'],
            status: 'Open',
            assignee: formData.get('assignee') as string,
            requester: currentUser.name
          });
          break;
        case 'add-project':
          handleAddProject({
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            status: 'Planning',
            progress: 0,
            startDate: formData.get('startDate') as string,
            endDate: formData.get('endDate') as string,
            teamMembers: [formData.get('teamLead') as string],
            budget: Number(formData.get('budget'))
          });
          break;
        case 'add-inventory':
          handleAddInventory({
            name: formData.get('name') as string,
            sku: formData.get('sku') as string,
            category: formData.get('category') as string,
            quantity: Number(formData.get('quantity')),
            unitPrice: Number(formData.get('unitPrice')),
            supplier: formData.get('supplier') as string,
            lastRestocked: new Date().toISOString().split('T')[0],
            minStock: Number(formData.get('minStock'))
          });
          break;
      }
    };

    const commonModalProps = {
      className: "space-y-4",
      onSubmit: handleSubmit
    };

    switch (modalType) {
      case 'add-contact':
      case 'edit-contact':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium">
                {modalType === 'add-contact' ? 'Add New Contact' : 'Edit Contact'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form {...commonModalProps}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    className="input"
                    defaultValue={selectedItem?.name || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="input"
                    defaultValue={selectedItem?.email || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="input"
                    defaultValue={selectedItem?.phone || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company</label>
                  <input
                    type="text"
                    name="company"
                    className="input"
                    defaultValue={selectedItem?.company || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input
                    type="text"
                    name="position"
                    className="input"
                    defaultValue={selectedItem?.position || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="input" defaultValue={selectedItem?.status || 'Lead'}>
                    <option value="Lead">Lead</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Customer">Customer</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Value</label>
                <input
                  type="number"
                  name="value"
                  className="input"
                  defaultValue={selectedItem?.value || ''}
                  min="0"
                  step="100"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="input"
                  rows={3}
                  defaultValue={selectedItem?.notes || ''}
                ></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalType === 'add-contact' ? 'Add Contact' : 'Update Contact'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'add-transaction':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Add New Transaction</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form {...commonModalProps}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select name="type" className="input" required>
                    <option value="Income">Income</option>
                    <option value="Expense">Expense</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" name="category" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input type="number" name="amount" className="input" min="0" step="0.01" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" name="date" className="input" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input type="text" name="description" className="input" required />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        );

      case 'add-employee':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Add New Employee</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form {...commonModalProps}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" name="name" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" name="email" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Position</label>
                  <input type="text" name="position" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select name="department" className="input" required>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Salary</label>
                  <input type="number" name="salary" className="input" min="0" step="1000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Hire Date</label>
                  <input type="date" name="hireDate" className="input" required />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Employee
                </button>
              </div>
            </form>
          </div>
        );

      case 'add-ticket':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Create New Ticket</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form {...commonModalProps}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" className="input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="input" rows={4} required></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select name="priority" className="input" required>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Assignee</label>
                  <select name="assignee" className="input" required>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        );

      case 'add-project':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Create New Project</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form {...commonModalProps}>
              <div className="form-group">
                <label className="form-label">Project Name</label>
                <input type="text" name="name" className="input" required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="input" rows={3} required></textarea>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Date</label>
                  <input type="date" name="startDate" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date</label>
                  <input type="date" name="endDate" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget</label>
                  <input type="number" name="budget" className="input" min="0" step="1000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Team Lead</label>
                  <select name="teamLead" className="input" required>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        );

      case 'add-inventory':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Add Inventory Item</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form {...commonModalProps}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input type="text" name="name" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input type="text" name="sku" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" name="category" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input type="text" name="supplier" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" name="quantity" className="input" min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price</label>
                  <input type="number" name="unitPrice" className="input" min="0" step="0.01" required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Minimum Stock Level</label>
                <input type="number" name="minStock" className="input" min="0" required />
              </div>
              <div className="modal-footer">
                <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Item
                </button>
              </div>
            </form>
          </div>
        );

      case 'view-email':
        return (
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Email Details</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{selectedItem?.subject}</h4>
                  <span className={`badge ${
                    selectedItem?.priority === 'High' ? 'badge-error' :
                    selectedItem?.priority === 'Medium' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {selectedItem?.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div><strong>From:</strong> {selectedItem?.from}</div>
                  <div><strong>To:</strong> {selectedItem?.to}</div>
                  <div><strong>Date:</strong> {selectedItem?.timestamp ? new Date(selectedItem.timestamp).toLocaleString() : ''}</div>
                </div>
              </div>
              <div className="whitespace-pre-wrap">{selectedItem?.body}</div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Close
              </button>
              <button className="btn btn-primary">
                Reply
              </button>
            </div>
          </div>
        );

      case 'view-ticket':
        return (
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium">Ticket Details</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-lg">{selectedItem?.title}</h4>
                  <div className="flex gap-2">
                    <span className={`badge ${
                      selectedItem?.priority === 'Critical' ? 'badge-error' :
                      selectedItem?.priority === 'High' ? 'badge-warning' :
                      selectedItem?.priority === 'Medium' ? 'badge-info' : 'badge-success'
                    }`}>
                      {selectedItem?.priority}
                    </span>
                    <span className={`badge ${
                      selectedItem?.status === 'Open' ? 'badge-error' :
                      selectedItem?.status === 'In Progress' ? 'badge-warning' :
                      selectedItem?.status === 'Resolved' ? 'badge-success' : 'badge-info'
                    }`}>
                      {selectedItem?.status}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <div><strong>Assignee:</strong> {selectedItem?.assignee}</div>
                  <div><strong>Requester:</strong> {selectedItem?.requester}</div>
                  <div><strong>Created:</strong> {selectedItem?.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : ''}</div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Description:</h5>
                <p className="whitespace-pre-wrap">{selectedItem?.description}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Close
              </button>
              <button className="btn btn-primary">
                Update
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex theme-transition" id="welcome_fallback">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-16'} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 border-r border-gray-200 dark:border-gray-700 fixed h-full z-50 lg:relative`}>
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="font-bold text-lg text-gray-900 dark:text-white">BusinessSuite</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unified Platform</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8 px-4" id="generation_issue_fallback">
          <div className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => setCurrentModule(module.id as ModuleType)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    currentModule === module.id
                      ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  title={!isSidebarOpen ? module.name : undefined}
                >
                  <Icon className={`h-5 w-5 ${module.color}`} />
                  {isSidebarOpen && <span className="font-medium">{module.name}</span>}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentModule('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentModule === 'settings'
                  ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              title={!isSidebarOpen ? 'Settings' : undefined}
            >
              <Settings className="h-5 w-5 text-gray-600" />
              {isSidebarOpen && <span className="font-medium">Settings</span>}
            </button>
          </div>
        </nav>

        {/* User Profile */}
        {isSidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden btn bg-white dark:bg-gray-800 shadow-lg p-2"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <main className="p-4 sm:p-6 lg:p-8">
          {currentModule === 'dashboard' && renderDashboard()}
          {currentModule === 'crm' && renderCRM()}
          {currentModule === 'email' && renderEmail()}
          {currentModule === 'accounting' && renderAccounting()}
          {currentModule === 'hr' && renderHR()}
          {currentModule === 'helpdesk' && renderHelpDesk()}
          {currentModule === 'projects' && renderProjects()}
          {currentModule === 'inventory' && renderInventory()}
          {currentModule === 'analytics' && renderAnalytics()}
          {currentModule === 'forms' && renderForms()}
          {currentModule === 'settings' && renderSettings()}
        </main>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div onClick={(e) => e.stopPropagation()}>
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;