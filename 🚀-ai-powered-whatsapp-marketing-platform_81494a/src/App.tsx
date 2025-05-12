import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import {
  ChevronDown,
  UserRound,
  MessageCircle,
  Settings,
  LogOut,
  ChartBar,
  Users,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  Smartphone,
  Database,
  BarChart3,
  Trophy,
  DollarSign,
  CreditCard,
  UserPlus,
  ShieldCheck,
  Repeat,
  ArrowRight,
  Home,
  Upload,
  X,
  Zap,
  ChevronRight,
  Menu,
  Moon,
  Sun,
  FileText,
  HelpCircle,
  Star,
  Package,
  Check // Added Check icon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Define types
type UserRole = 'admin' | 'company' | 'reseller';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
  companyName?: string;
  brandName?: string;
  plan?: string;
  balance?: number;
  whatsappNumber?: string;
  isActive: boolean;
}

interface Company {
  id: string;
  name: string;
  owner: string; // User ID of company owner
  wabaId: string;
  phoneNumber: string;
  plan: string;
  messagesLimit: number;
  messagesUsed: number;
  active: boolean;
  createdAt: string;
  resellerId?: string; // If created by a reseller
}

interface Template {
  id: string;
  name: string;
  content: string;
  variables: string[];
  companyId: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  language: string;
}

interface Campaign {
  id: string;
  name: string;
  companyId: string;
  templateId: string;
  audienceSize: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  responseCount: number;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';
  createdAt: string;
  scheduledFor?: string;
}

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  companyId: string;
  createdAt: string;
  tags: string[];
}

interface ContactGroup {
  id: string;
  name: string;
  companyId: string;
  contactIds: string[];
  createdAt: string;
  count: number;
}

interface ChatSession {
  id: string;
  contactId: string;
  companyId: string;
  startedAt: string;
  lastMessageAt: string;
  unreadCount: number;
  status: 'active' | 'closed';
}

interface Message {
  id: string;
  sessionId: string;
  content: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read';
  direction: 'incoming' | 'outgoing';
  type: 'text' | 'image' | 'file' | 'audio' | 'video';
  mediaUrl?: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  messagesLimit: number;
  features: string[];
  isDefault: boolean;
}

interface ResellerPackage {
  id: string;
  name: string;
  price: number;
  messagesLimit: number;
  maxCompanies: number;
  features: string[];
}

interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: string;
}

interface DashboardStats {
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  responseRate: number;
  activeContacts: number;
  campaignsActive: number;
}

interface AppState {
  users: User[];
  companies: Company[];
  templates: Template[];
  campaigns: Campaign[];
  contacts: Contact[];
  contactGroups: ContactGroup[];
  chatSessions: ChatSession[];
  messages: Message[];
  plans: Plan[];
  resellerPackages: ResellerPackage[];
  transactions: Transaction[];
}

type MenuItem = {
  id: string;
  title: string;
  icon: React.ReactNode;
  link: string;
  role: UserRole[];
  subitems?: {
    id: string;
    title: string;
    link: string;
  }[];
};

const App: React.FC = () => {
  // State
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [activeSidebar, setActiveSidebar] = useState<boolean>(true);
  const [appState, setAppState] = useState<AppState>({
    users: [],
    companies: [],
    templates: [],
    campaigns: [],
    contacts: [],
    contactGroups: [],
    chatSessions: [],
    messages: [],
    plans: [],
    resellerPackages: [],
    transactions: []
  });
  
  // Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [newCompanyForm, setNewCompanyForm] = useState({
    name: '',
    wabaId: '',
    phoneNumber: '',
    plan: ''
  });
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'company' as UserRole,
    companyName: '',
    brandName: ''
  });
  const [showUserDeleteConfirm, setShowUserDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Menu Configuration
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <Home size={20} />,
      link: 'dashboard',
      role: ['admin', 'company', 'reseller']
    },
    {
      id: 'messaging',
      title: 'Messaging',
      icon: <MessageCircle size={20} />,
      link: 'messaging',
      role: ['company', 'reseller'],
      subitems: [
        { id: 'templates', title: 'Templates', link: 'templates' },
        { id: 'campaigns', title: 'Campaigns', link: 'campaigns' },
        { id: 'broadcasts', title: 'Broadcasts', link: 'broadcasts' }
      ]
    },
    {
      id: 'contacts',
      title: 'Contacts',
      icon: <UserRound size={20} />,
      link: 'contacts',
      role: ['company', 'reseller'],
      subitems: [
        { id: 'all-contacts', title: 'All Contacts', link: 'all-contacts' },
        { id: 'groups', title: 'Contact Groups', link: 'contact-groups' }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics',
      icon: <BarChart3 size={20} />,
      link: 'analytics',
      role: ['admin', 'company', 'reseller']
    },
    {
      id: 'users',
      title: 'User Management',
      icon: <Users size={20} />,
      link: 'users',
      role: ['admin', 'reseller']
    },
    {
      id: 'companies',
      title: 'Companies',
      icon: <Database size={20} />,
      link: 'companies',
      role: ['admin', 'reseller']
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: <CreditCard size={20} />,
      link: 'billing',
      role: ['admin', 'company', 'reseller']
    },
    {
      id: 'reselling',
      title: 'Reseller Hub',
      icon: <Package size={20} />,
      link: 'reselling',
      role: ['reseller']
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings size={20} />,
      link: 'settings',
      role: ['admin', 'company', 'reseller']
    }
  ];

  // Random data for charts
  const messageStats = [
    { name: 'Mon', sent: 120, delivered: 115, read: 98 },
    { name: 'Tue', sent: 200, delivered: 190, read: 152 },
    { name: 'Wed', sent: 180, delivered: 175, read: 145 },
    { name: 'Thu', sent: 250, delivered: 245, read: 205 },
    { name: 'Fri', sent: 300, delivered: 290, read: 260 },
    { name: 'Sat', sent: 150, delivered: 145, read: 125 },
    { name: 'Sun', sent: 100, delivered: 95, read: 82 }
  ];

  const responseRateData = [
    { name: 'Responded', value: 65 },
    { name: 'Not Responded', value: 35 }
  ];

  const COLORS = ['#0088FE', '#BBBBBB'];

  // Load initial data
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    
    // Apply dark mode
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Load app state from localStorage
    const savedState = localStorage.getItem('appState');
    if (savedState) {
      setAppState(JSON.parse(savedState));
    } else {
      // Initialize with some dummy data if no saved state
      const initialState: AppState = {
        users: [
          {
            id: '1',
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString(),
            isActive: true
          },
          {
            id: '2',
            name: 'Company User',
            email: 'company@example.com',
            password: 'company123',
            role: 'company',
            createdAt: new Date().toISOString(),
            companyName: 'Example Company',
            plan: 'Pro',
            balance: 1000,
            whatsappNumber: '+1234567890',
            isActive: true
          },
          {
            id: '3',
            name: 'Reseller User',
            email: 'reseller@example.com',
            password: 'reseller123',
            role: 'reseller',
            createdAt: new Date().toISOString(),
            brandName: 'Example Reseller',
            balance: 5000,
            isActive: true
          }
        ],
        companies: [
          {
            id: '1',
            name: 'Example Company',
            owner: '2',
            wabaId: 'waba123456',
            phoneNumber: '+1234567890',
            plan: 'Pro',
            messagesLimit: 10000,
            messagesUsed: 2500,
            active: true,
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Reseller Client',
            owner: '4', // Assuming a user with ID 4 exists for this company if it's not the reseller themselves
            wabaId: 'waba654321',
            phoneNumber: '+9876543210',
            plan: 'Basic',
            messagesLimit: 5000,
            messagesUsed: 1200,
            active: true,
            createdAt: new Date().toISOString(),
            resellerId: '3'
          }
        ],
        templates: [
          {
            id: '1',
            name: 'Welcome Message',
            content: 'Hello {{1}}, welcome to our service! How can we help you today?',
            variables: ['name'],
            companyId: '1',
            createdAt: new Date().toISOString(),
            status: 'approved',
            language: 'en'
          },
          {
            id: '2',
            name: 'Order Confirmation',
            content: 'Hi {{1}}! Your order #{{2}} has been confirmed and will be shipped within {{3}} business days.',
            variables: ['name', 'order_id', 'days'],
            companyId: '1',
            createdAt: new Date().toISOString(),
            status: 'approved',
            language: 'en'
          }
        ],
        campaigns: [
          {
            id: '1',
            name: 'Summer Sale Campaign',
            companyId: '1',
            templateId: '1',
            audienceSize: 1000,
            sentCount: 950,
            deliveredCount: 920,
            readCount: 800,
            responseCount: 150,
            status: 'completed',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            name: 'New Product Launch',
            companyId: '1',
            templateId: '2',
            audienceSize: 2000,
            sentCount: 1500,
            deliveredCount: 1450,
            readCount: 1200,
            responseCount: 300,
            status: 'running',
            createdAt: new Date().toISOString()
          }
        ],
        contacts: [
          {
            id: '1',
            name: 'John Doe',
            phoneNumber: '+11234567890',
            companyId: '1',
            createdAt: new Date().toISOString(),
            tags: ['customer', 'premium']
          },
          {
            id: '2',
            name: 'Jane Smith',
            phoneNumber: '+10987654321',
            companyId: '1',
            createdAt: new Date().toISOString(),
            tags: ['prospect']
          }
        ],
        contactGroups: [
          {
            id: '1',
            name: 'Premium Customers',
            companyId: '1',
            contactIds: ['1'],
            createdAt: new Date().toISOString(),
            count: 1
          },
          {
            id: '2',
            name: 'Prospects',
            companyId: '1',
            contactIds: ['2'],
            createdAt: new Date().toISOString(),
            count: 1
          }
        ],
        chatSessions: [
          {
            id: '1',
            contactId: '1',
            companyId: '1',
            startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            lastMessageAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            unreadCount: 0,
            status: 'active'
          }
        ],
        messages: [
          {
            id: '1',
            sessionId: '1',
            content: 'Hello! I have a question about your service.',
            sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'read',
            direction: 'incoming',
            type: 'text'
          },
          {
            id: '2',
            sessionId: '1',
            content: 'Hi John! Thanks for reaching out. How can I help you today?',
            sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000).toISOString(),
            status: 'read',
            direction: 'outgoing',
            type: 'text'
          },
          {
            id: '3',
            sessionId: '1',
            content: 'I want to know more about your premium plan features.',
            sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'read',
            direction: 'incoming',
            type: 'text'
          }
        ],
        plans: [
          {
            id: '1',
            name: 'Basic',
            price: 50,
            messagesLimit: 5000,
            features: ['WhatsApp API Access', 'Template Creation', 'Basic Analytics'],
            isDefault: true
          },
          {
            id: '2',
            name: 'Pro',
            price: 100,
            messagesLimit: 10000,
            features: ['All Basic Features', 'Advanced Analytics', 'Priority Support', 'Campaign Automation'],
            isDefault: false
          },
          {
            id: '3',
            name: 'Enterprise',
            price: 200,
            messagesLimit: 30000,
            features: ['All Pro Features', 'Dedicated Support', 'Custom Integrations', 'Multiple Users'],
            isDefault: false
          }
        ],
        resellerPackages: [
          {
            id: '1',
            name: 'Reseller Starter',
            price: 500,
            messagesLimit: 50000,
            maxCompanies: 5,
            features: ['White Labeling', 'Custom Domain', 'Billing Management', 'Basic Support']
          },
          {
            id: '2',
            name: 'Reseller Pro',
            price: 1000,
            messagesLimit: 150000,
            maxCompanies: 15,
            features: ['All Starter Features', 'Advanced Reporting', 'Priority Support', 'API Access']
          }
        ],
        transactions: [
          {
            id: '1',
            userId: '2',
            amount: 100,
            type: 'debit',
            description: 'Monthly subscription - Pro Plan',
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: '2',
            userId: '2',
            amount: 500,
            type: 'credit',
            description: 'Account recharge',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      };
      
      setAppState(initialState);
      localStorage.setItem('appState', JSON.stringify(initialState));
    }
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);
  
  // Save app state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('appState', JSON.stringify(appState));
  }, [appState]);
  
  // Dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Handle login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const user = appState.users.find(
      (u) => u.email === loginForm.email && u.password === loginForm.password
    );
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      alert('Invalid email or password!');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
    setCurrentPage('dashboard');
  };
  
  // Handle search
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    let results: any[] = [];
    
    if (currentUser?.role === 'admin') {
      // Admin can search users and companies
      const userResults = appState.users.filter(
        (user) => user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
      );
      const companyResults = appState.companies.filter(
        (company) => company.name.toLowerCase().includes(term) || company.phoneNumber.includes(term)
      );
      
      results = [...userResults.map(u => ({ ...u, type: 'user' })), ...companyResults.map(c => ({ ...c, type: 'company' }))];
    } else if (currentUser?.role === 'company') {
      // Company can search contacts and templates
      const contactResults = appState.contacts.filter(
        (contact) => contact.companyId === getCompanyIdForCurrentUser() && 
                     (contact.name.toLowerCase().includes(term) || contact.phoneNumber.includes(term))
      );
      const templateResults = appState.templates.filter(
        (template) => template.companyId === getCompanyIdForCurrentUser() && 
                      template.name.toLowerCase().includes(term)
      );
      
      results = [...contactResults.map(c => ({ ...c, type: 'contact' })), ...templateResults.map(t => ({ ...t, type: 'template' }))];
    } else if (currentUser?.role === 'reseller') {
      // Reseller can search their companies
      const companyResults = appState.companies.filter(
        (company) => company.resellerId === currentUser.id && 
                     (company.name.toLowerCase().includes(term) || company.phoneNumber.includes(term))
      );
      
      results = companyResults.map(c => ({ ...c, type: 'company' }));
    }
    
    setSearchResults(results);
  };
  
  // Handle creating a new company
  const handleCreateCompany = () => {
    if (!newCompanyForm.name || !newCompanyForm.wabaId || !newCompanyForm.phoneNumber || !newCompanyForm.plan) {
      alert('Please fill all required fields!');
      return;
    }
    
    const newCompany: Company = {
      id: `company_${Date.now()}`,
      name: newCompanyForm.name,
      owner: '', // Will be updated when we create the user
      wabaId: newCompanyForm.wabaId,
      phoneNumber: newCompanyForm.phoneNumber,
      plan: newCompanyForm.plan,
      messagesLimit: getMessageLimitForPlan(newCompanyForm.plan),
      messagesUsed: 0,
      active: true,
      createdAt: new Date().toISOString(),
      resellerId: currentUser?.role === 'reseller' ? currentUser.id : undefined
    };
    
    // Create the company
    setAppState(prev => ({
      ...prev,
      companies: [...prev.companies, newCompany]
    }));
    
    // Reset form and close modal
    setNewCompanyForm({
      name: '',
      wabaId: '',
      phoneNumber: '',
      plan: ''
    });
    setShowNewCompanyModal(false);
  };
  
  // Handle creating a new user
  const handleCreateUser = () => {
    const { name, email, password, role, companyName, brandName } = newUserForm;
    
    if (!name || !email || !password || !role) {
      alert('Please fill all required fields!');
      return;
    }
    
    // Check if email already exists
    if (appState.users.some(u => u.email === email)) {
      alert('A user with this email already exists!');
      return;
    }
    
    // Create the user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    
    if (role === 'company' && companyName) {
      newUser.companyName = companyName;
    }
    
    if (role === 'reseller' && brandName) {
      newUser.brandName = brandName;
    }
    
    // Update app state
    setAppState(prev => ({
      ...prev,
      users: [...prev.users, newUser]
    }));
    
    // Reset form and close modal
    setNewUserForm({
      name: '',
      email: '',
      password: '',
      role: 'company',
      companyName: '',
      brandName: ''
    });
    setShowNewUserModal(false);
  };
  
  // Handle deleting a user
  const handleDeleteUser = () => {
    if (!userToDelete) return;
    
    // Remove the user
    setAppState(prev => ({
      ...prev,
      users: prev.users.filter(u => u.id !== userToDelete)
    }));
    
    // Close confirmation dialog
    setShowUserDeleteConfirm(false);
    setUserToDelete(null);
  };
  
  // Get message limit for a plan
  const getMessageLimitForPlan = (planName: string): number => {
    const plan = appState.plans.find(p => p.name === planName);
    return plan?.messagesLimit || 5000; // Default to 5000 if plan not found
  };
  
  // Get company ID for current user
  const getCompanyIdForCurrentUser = (): string => {
    if (!currentUser) return '';
    
    if (currentUser.role === 'company') {
      // First, try to find a company where the current user is the owner
      let company = appState.companies.find(c => c.owner === currentUser.id);
      // If not found by owner ID, try to find by companyName matching user's companyName (for initial setup)
      if (!company && currentUser.companyName) {
        company = appState.companies.find(c => c.name === currentUser.companyName);
      }
      return company?.id || '';
    }
    
    return '';
  };
  
  // Helper to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Helper to handle ESC key press
  const handleEscapeKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setShowNewCompanyModal(false);
      setShowNewUserModal(false);
      setShowUserDeleteConfirm(false);
    }
  };
  
  // Outside click handler for modals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowNewCompanyModal(false);
        setShowNewUserModal(false);
        setShowUserDeleteConfirm(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filtered menu based on user role
  const filteredMenu = menuItems.filter(item => {
    return currentUser && item.role.includes(currentUser.role);
  });
  
  // Don't render if not logged in
  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              WhatsApp Business Platform
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-slate-400">
              Log in to your account to access the platform
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">Email address</label>
                <input 
                  id="email-address" 
                  name="email" 
                  type="email" 
                  autoComplete="email" 
                  required 
                  className="input"
                  placeholder="Email address"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                />
              </div>
              <div className="mt-4">
                <label htmlFor="password" className="sr-only">Password</label>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  autoComplete="current-password" 
                  required 
                  className="input"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-slate-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn btn-primary w-full flex justify-center"
              >
                Sign in
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Demo Credentials:<br />
                Admin: admin@example.com / admin123<br />
                Company: company@example.com / company123<br />
                Reseller: reseller@example.com / reseller123
              </p>
            </div>
            
            <div className="flex justify-end">
              <button 
                type="button" 
                className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"
                onClick={toggleDarkMode}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  // Get dashboard stats
  const getDashboardStats = (): DashboardStats => {
    // For company user, show their stats
    if (currentUser?.role === 'company') {
      const companyId = getCompanyIdForCurrentUser();
      const campaigns = appState.campaigns.filter(c => c.companyId === companyId);
      
      const messagesSent = campaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0);
      const messagesDelivered = campaigns.reduce((sum, campaign) => sum + campaign.deliveredCount, 0);
      const messagesRead = campaigns.reduce((sum, campaign) => sum + campaign.readCount, 0);
      const responseRate = messagesSent > 0 
        ? Math.round((campaigns.reduce((sum, campaign) => sum + campaign.responseCount, 0) / messagesSent) * 100) 
        : 0;
      
      return {
        messagesSent,
        messagesDelivered,
        messagesRead,
        responseRate,
        activeContacts: appState.contacts.filter(c => c.companyId === companyId).length,
        campaignsActive: campaigns.filter(c => c.status === 'running').length
      };
    }
    
    // For admin user, show platform-wide stats
    if (currentUser?.role === 'admin') {
      const messagesSent = appState.campaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0);
      const messagesDelivered = appState.campaigns.reduce((sum, campaign) => sum + campaign.deliveredCount, 0);
      const messagesRead = appState.campaigns.reduce((sum, campaign) => sum + campaign.readCount, 0);
      const responseRate = messagesSent > 0 
        ? Math.round((appState.campaigns.reduce((sum, campaign) => sum + campaign.responseCount, 0) / messagesSent) * 100) 
        : 0;
      
      return {
        messagesSent,
        messagesDelivered,
        messagesRead,
        responseRate,
        activeContacts: appState.contacts.length,
        campaignsActive: appState.campaigns.filter(c => c.status === 'running').length
      };
    }
    
    // For reseller user, show stats from their companies
    if (currentUser?.role === 'reseller') {
      const resellerCompanies = appState.companies.filter(c => c.resellerId === currentUser.id);
      const resellerCompanyIds = resellerCompanies.map(c => c.id);
      const campaigns = appState.campaigns.filter(c => resellerCompanyIds.includes(c.companyId));
      
      const messagesSent = campaigns.reduce((sum, campaign) => sum + campaign.sentCount, 0);
      const messagesDelivered = campaigns.reduce((sum, campaign) => sum + campaign.deliveredCount, 0);
      const messagesRead = campaigns.reduce((sum, campaign) => sum + campaign.readCount, 0);
      const responseRate = messagesSent > 0 
        ? Math.round((campaigns.reduce((sum, campaign) => sum + campaign.responseCount, 0) / messagesSent) * 100) 
        : 0;
      
      return {
        messagesSent,
        messagesDelivered,
        messagesRead,
        responseRate,
        activeContacts: appState.contacts.filter(c => resellerCompanyIds.includes(c.companyId)).length,
        campaignsActive: campaigns.filter(c => c.status === 'running').length
      };
    }
    
    // Default empty stats
    return {
      messagesSent: 0,
      messagesDelivered: 0,
      messagesRead: 0,
      responseRate: 0,
      activeContacts: 0,
      campaignsActive: 0
    };
  };
  
  // Determine content based on current page
  const renderContent = () => {
    const stats = getDashboardStats();
    
    switch(currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            
            {/* Stats overview */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="stat-card">
                <div className="stat-title">Messages Sent</div>
                <div className="stat-value">{stats.messagesSent.toLocaleString()}</div>
                <div className="stat-desc">{stats.messagesDelivered.toLocaleString()} delivered</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Message Read Rate</div>
                <div className="stat-value">
                  {stats.messagesDelivered > 0 
                    ? Math.round((stats.messagesRead / stats.messagesDelivered) * 100)
                    : 0}%
                </div>
                <div className="stat-desc">{stats.messagesRead.toLocaleString()} messages read</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Response Rate</div>
                <div className="stat-value">{stats.responseRate}%</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Active Contacts</div>
                <div className="stat-value">{stats.activeContacts.toLocaleString()}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Active Campaigns</div>
                <div className="stat-value">{stats.campaignsActive}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Company Status</div>
                <div className="stat-value flex items-center">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                  Active
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card overflow-hidden">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Message Statistics (Last 7 Days)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={messageStats}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sent" name="Sent" fill="#8884d8" />
                      <Bar dataKey="delivered" name="Delivered" fill="#82ca9d" />
                      <Bar dataKey="read" name="Read" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card overflow-hidden">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Response Rate Overview</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={responseRateData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {responseRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Recent Activity</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Campaign Started</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">New Product Launch campaign started</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Today</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Template Approved</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Order Confirmation template approved</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">Yesterday</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">New Contacts</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">50 new contacts imported</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">3 days ago</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">User Management</h1>
              <button 
                className="btn btn-primary inline-flex items-center gap-2"
                onClick={() => setShowNewUserModal(true)}
              >
                <UserPlus size={18} />
                Add User
              </button>
            </div>
            
            <div className="card">
              <div className="flex items-center pb-4 justify-between">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyUp={handleSearch}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="btn inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                    <Filter size={18} />
                    Filter
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {appState.users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          <div className="flex space-x-2">
                            <button 
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              aria-label="Edit user"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => {
                                setUserToDelete(user.id);
                                setShowUserDeleteConfirm(true);
                              }}
                              aria-label="Delete user"
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
            </div>
          </div>
        );
        
      case 'companies':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {currentUser?.role === 'reseller' ? 'My Companies' : 'Companies'}
              </h1>
              <button 
                className="btn btn-primary inline-flex items-center gap-2"
                onClick={() => setShowNewCompanyModal(true)}
              >
                <Plus size={18} />
                Add Company
              </button>
            </div>
            
            <div className="card">
              <div className="flex items-center pb-4 justify-between">
                <div className="relative w-64">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyUp={handleSearch}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={18} />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="btn inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                    <Filter size={18} />
                    Filter
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usage</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {appState.companies
                      .filter(company => currentUser?.role === 'reseller' ? company.resellerId === currentUser.id : true)
                      .map((company) => (
                        <tr key={company.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{company.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{company.phoneNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{company.plan}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <div className="w-32 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                              <div 
                                className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" 
                                style={{ width: `${Math.min(100, (company.messagesUsed / company.messagesLimit) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs mt-1 block">
                              {company.messagesUsed.toLocaleString()} / {company.messagesLimit.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${company.active ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100'}`}>
                              {company.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <div className="flex space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                aria-label="Edit company"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                aria-label="Delete company"
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
            </div>
          </div>
        );
        
      case 'templates':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Message Templates</h1>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button className="btn btn-primary inline-flex items-center gap-2">
                  <Plus size={18} />
                  Create Template
                </button>
                <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 inline-flex items-center gap-2">
                  <Upload size={18} />
                  Import
                </button>
              </div>
              
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="input pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {appState.templates
                .filter(template => {
                  if (currentUser?.role === 'company') {
                    const companyId = getCompanyIdForCurrentUser();
                    return template.companyId === companyId;
                  }
                  return true;
                })
                .map((template) => (
                  <div key={template.id} className="card">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{template.name}</h3>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${template.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : template.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100'}`}>
                        {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{template.content}</p>
                    <div className="mt-3">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Variables:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.variables.map((variable, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">
                        <Edit size={18} />
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        );
        
      case 'campaigns':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Campaigns</h1>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button className="btn btn-primary inline-flex items-center gap-2">
                  <Plus size={18} />
                  Create Campaign
                </button>
              </div>
              
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  className="input pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Campaign</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Audience</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Sent</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Delivered</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Read</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Response Rate</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {appState.campaigns
                      .filter(campaign => {
                        if (currentUser?.role === 'company') {
                          const companyId = getCompanyIdForCurrentUser();
                          return campaign.companyId === companyId;
                        }
                        return true;
                      })
                      .map((campaign) => {
                        const responseRate = campaign.sentCount > 0 
                          ? Math.round((campaign.responseCount / campaign.sentCount) * 100) 
                          : 0;
                        
                        return (
                          <tr key={campaign.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{campaign.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100' : campaign.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100' : campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100'}`}>
                                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.audienceSize.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.sentCount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.deliveredCount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{campaign.readCount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{responseRate}%</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(campaign.createdAt)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                              <div className="flex space-x-2">
                                <button 
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                  aria-label="View campaign"
                                >
                                  <ChartBar size={18} />
                                </button>
                                <button 
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  aria-label="Delete campaign"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      case 'all-contacts':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Contacts</h1>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex space-x-2">
                <button className="btn btn-primary inline-flex items-center gap-2">
                  <Plus size={18} />
                  Add Contact
                </button>
                <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600 inline-flex items-center gap-2">
                  <Upload size={18} />
                  Import
                </button>
              </div>
              
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search contacts..."
                  className="input pl-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone Number</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Added On</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {appState.contacts
                      .filter(contact => {
                        if (currentUser?.role === 'company') {
                          const companyId = getCompanyIdForCurrentUser();
                          return contact.companyId === companyId;
                        }
                        return true;
                      })
                      .map((contact) => (
                        <tr key={contact.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{contact.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{contact.phoneNumber}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <div className="flex flex-wrap gap-1">
                              {contact.tags.map((tag, idx) => (
                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(contact.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            <div className="flex space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                aria-label="Edit contact"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                aria-label="Message contact"
                              >
                                <MessageCircle size={18} />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                aria-label="Delete contact"
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
            </div>
          </div>
        );
        
      case 'reselling':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Reseller Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="stat-card">
                <div className="stat-title">Your Brand</div>
                <div className="stat-value">{currentUser?.brandName || 'Not Set'}</div>
                <div className="stat-desc">
                  <button className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm inline-flex items-center gap-1">
                    <Edit size={14} /> Configure
                  </button>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Client Companies</div>
                <div className="stat-value">
                  {appState.companies.filter(c => c.resellerId === currentUser?.id).length}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Credits Balance</div>
                <div className="stat-value">${currentUser?.balance?.toLocaleString() || 0}</div>
                <div className="stat-desc">
                  <button className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm inline-flex items-center gap-1">
                    <CreditCard size={14} /> Add Credits
                  </button>
                </div>
              </div>
            </div>
            
            {/* Reseller Packages */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Your Reseller Packages</h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {appState.resellerPackages.map(pkg => (
                  <div key={pkg.id} className="border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{pkg.name}</h3>
                    <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">${pkg.price}</div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">per month</p>
                    
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                          <Check size={18} />
                        </span>
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {pkg.messagesLimit.toLocaleString()} messages
                        </span>
                      </li>
                      <li className="flex items-start">
                        <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                          <Check size={18} />
                        </span>
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          Up to {pkg.maxCompanies} companies
                        </span>
                      </li>
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                            <Check size={18} />
                          </span>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-6">
                      <button className="btn btn-primary w-full">Edit Package</button>
                    </div>
                  </div>
                ))}
                
                <div className="border border-dashed rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 flex flex-col items-center justify-center text-center">
                  <Plus size={24} className="text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">Create New Package</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Design custom offering for your clients</p>
                  <button className="mt-4 btn btn-primary">Create Package</button>
                </div>
              </div>
            </div>
            
            {/* White Labeling */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">White Label Settings</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label" htmlFor="brand-name">Brand Name</label>
                    <input id="brand-name" type="text" className="input" defaultValue={currentUser?.brandName || ''} />
                  </div>
                  
                  <div>
                    <label className="form-label" htmlFor="brand-domain">Custom Domain</label>
                    <input id="brand-domain" type="text" className="input" placeholder="app.yourbrand.com" />
                  </div>
                </div>
                
                <div>
                  <label className="form-label" htmlFor="brand-logo">Brand Logo</label>
                  <div className="mt-1 flex items-center">
                    <span className="h-12 w-12 overflow-hidden rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <Upload size={24} className="text-gray-400" />
                    </span>
                    <button className="ml-5 btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                      Change
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Brand Colors</label>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    <div>
                      <label className="form-label text-xs">Primary</label>
                      <input type="color" className="h-10 w-full" defaultValue="#4f46e5" />
                    </div>
                    <div>
                      <label className="form-label text-xs">Secondary</label>
                      <input type="color" className="h-10 w-full" defaultValue="#0891b2" />
                    </div>
                    <div>
                      <label className="form-label text-xs">Accent</label>
                      <input type="color" className="h-10 w-full" defaultValue="#f97316" />
                    </div>
                    <div>
                      <label className="form-label text-xs">Background</label>
                      <input type="color" className="h-10 w-full" defaultValue="#ffffff" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="btn btn-primary">
                    Save Brand Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'settings':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Account Settings</h1>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Information</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="form-label" htmlFor="name">Name</label>
                    <input id="name" type="text" className="input" defaultValue={currentUser?.name || ''} />
                  </div>
                  
                  <div>
                    <label className="form-label" htmlFor="email">Email</label>
                    <input id="email" type="email" className="input" defaultValue={currentUser?.email || ''} />
                  </div>
                </div>
                
                {currentUser?.role === 'company' && (
                  <div>
                    <label className="form-label" htmlFor="company-name">Company Name</label>
                    <input id="company-name" type="text" className="input" defaultValue={currentUser?.companyName || ''} />
                  </div>
                )}
                
                {currentUser?.role === 'reseller' && (
                  <div>
                    <label className="form-label" htmlFor="brand-name">Brand Name</label>
                    <input id="brand-name" type="text" className="input" defaultValue={currentUser?.brandName || ''} />
                  </div>
                )}
                
                <div>
                  <label className="form-label" htmlFor="password">Change Password</label>
                  <input id="password" type="password" className="input" />
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appearance</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Theme</label>
                  <div className="mt-1 flex items-center space-x-4">
                    <button 
                      className={`p-2 rounded-lg border ${!darkMode ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' : 'border-gray-300 dark:border-gray-700'}`}
                      onClick={() => setDarkMode(false)}
                    >
                      <div className="w-16 h-16 rounded bg-white border border-gray-200 flex items-center justify-center text-gray-900">
                        <Sun size={24} />
                      </div>
                      <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Light</div>
                    </button>
                    
                    <button 
                      className={`p-2 rounded-lg border ${darkMode ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' : 'border-gray-300 dark:border-gray-700'}`}
                      onClick={() => setDarkMode(true)}
                    >
                      <div className="w-16 h-16 rounded bg-gray-900 border border-gray-700 flex items-center justify-center text-white">
                        <Moon size={24} />
                      </div>
                      <div className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Dark</div>
                    </button>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="btn btn-primary" onClick={toggleDarkMode}>
                    Apply Theme
                  </button>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notifications</h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive email notifications for important events</p>
                    </div>
                    <label className="theme-toggle relative inline-flex h-6 w-11">
                      <input type="checkbox" className="sr-only" defaultChecked />
                      <span className="theme-toggle-thumb absolute h-4 w-4 rounded-full bg-white" />
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-gray-900 dark:text-white">Browser Notifications</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get browser notifications for messages and alerts</p>
                    </div>
                    <label className="theme-toggle relative inline-flex h-6 w-11">
                      <input type="checkbox" className="sr-only" />
                      <span className="theme-toggle-thumb absolute h-4 w-4 rounded-full bg-white" />
                    </label>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button className="btn btn-primary">
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="stat-card">
                <div className="stat-title">Delivery Rate</div>
                <div className="stat-value">
                  {stats.messagesSent > 0 
                    ? Math.round((stats.messagesDelivered / stats.messagesSent) * 100)
                    : 0}%
                </div>
                <div className="stat-desc">{stats.messagesDelivered.toLocaleString()} of {stats.messagesSent.toLocaleString()} messages</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Read Rate</div>
                <div className="stat-value">
                  {stats.messagesDelivered > 0 
                    ? Math.round((stats.messagesRead / stats.messagesDelivered) * 100)
                    : 0}%
                </div>
                <div className="stat-desc">{stats.messagesRead.toLocaleString()} messages read</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Response Rate</div>
                <div className="stat-value">{stats.responseRate}%</div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Message Metrics (Last 7 Days)</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={messageStats}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sent" name="Sent" fill="#8884d8" />
                    <Bar dataKey="delivered" name="Delivered" fill="#82ca9d" />
                    <Bar dataKey="read" name="Read" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Response Rate by Template</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[
                        { name: 'Welcome Message', rate: 65 },
                        { name: 'Order Confirmation', rate: 82 },
                        { name: 'Shipping Update', rate: 45 },
                        { name: 'Feedback Request', rate: 28 },
                        { name: 'Promotion', rate: 15 }
                      ]}
                      margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} unit="%" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="rate" fill="#8884d8" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Campaign Performance</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Summer Sale', sent: 2000, delivered: 1950, read: 1750, responded: 450 },
                        { name: 'New Product', sent: 1500, delivered: 1480, read: 1320, responded: 380 },
                        { name: 'Customer Survey', sent: 1000, delivered: 980, read: 820, responded: 150 }
                      ]}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="sent" name="Sent" fill="#8884d8" />
                      <Bar dataKey="read" name="Read" fill="#82ca9d" />
                      <Bar dataKey="responded" name="Responded" fill="#ffc658" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'messaging':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Messaging Hub</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentPage('templates')}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Templates</h3>
                  <div className="p-2 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                    <FileText size={24} />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Create and manage message templates for your WhatsApp Business account.</p>
                <div className="mt-4 flex justify-end">
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                    View Templates <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentPage('campaigns')}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Campaigns</h3>
                  <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                    <ChartBar size={24} />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Run targeted messaging campaigns to engage your audience.</p>
                <div className="mt-4 flex justify-end">
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                    View Campaigns <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
              
              <div className="card hover:shadow-md transition-shadow cursor-pointer" onClick={() => setCurrentPage('broadcasts')}>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Broadcasts</h3>
                  <div className="p-2 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                    <Zap size={24} />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Send one-time messages to multiple contacts or groups.</p>
                <div className="mt-4 flex justify-end">
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                    Create Broadcast <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Recent Conversations</h2>
              
              <div className="space-y-4">
                {appState.chatSessions
                  .filter(session => {
                    if (currentUser?.role === 'company') {
                      const companyId = getCompanyIdForCurrentUser();
                      return session.companyId === companyId;
                    }
                    return false; // Admin and resellers don't see individual chats
                  })
                  .map(session => {
                    const contact = appState.contacts.find(c => c.id === session.contactId);
                    const lastMessage = appState.messages
                      .filter(m => m.sessionId === session.id)
                      .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
                      
                    return (
                      <div key={session.id} className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                          <UserRound size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {contact?.name || 'Unknown Contact'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {lastMessage?.content || 'No messages'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {lastMessage ? formatDate(lastMessage.sentAt) : ''}
                          </p>
                          {session.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                              {session.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                
                {appState.chatSessions.filter(session => {
                  if (currentUser?.role === 'company') {
                    const companyId = getCompanyIdForCurrentUser();
                    return session.companyId === companyId;
                  }
                  return false;
                }).length === 0 && (
                  <div className="text-center py-8">
                    <MessageCircle size={48} className="mx-auto text-gray-400 dark:text-gray-600" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No active conversations</p>
                    <button className="mt-4 btn btn-primary inline-flex items-center gap-2">
                      <UserPlus size={18} />
                      Start New Chat
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
        
      case 'billing':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Billing & Subscription</h1>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="stat-card">
                <div className="stat-title">Current Plan</div>
                <div className="stat-value">
                  {currentUser?.role === 'company' ? currentUser.plan || 'Free' : 'N/A'}
                </div>
                <div className="stat-desc">
                  {currentUser?.role === 'company' && (
                    <button className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm inline-flex items-center gap-1">
                      <Edit size={14} /> Change Plan
                    </button>
                  )}
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Account Balance</div>
                <div className="stat-value">
                  ${currentUser?.balance?.toLocaleString() || 0}
                </div>
                <div className="stat-desc">
                  <button className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm inline-flex items-center gap-1">
                    <CreditCard size={14} /> Add Funds
                  </button>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Message Quota</div>
                <div>
                  {currentUser?.role === 'company' && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                      <div 
                        className="bg-indigo-600 h-2.5 rounded-full dark:bg-indigo-500" 
                        style={{ width: '45%' }} // Example, should be dynamic
                      ></div>
                    </div>
                  )}
                  <div className="stat-value mt-1">45%</div>
                </div>
                <div className="stat-desc">4,500 / 10,000 messages used</div>
              </div>
            </div>
            
            {/* Available Plans */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Plans</h2>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {appState.plans.map(plan => (
                  <div key={plan.id} className={`border rounded-lg p-6 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm ${plan.isDefault ? 'border-indigo-500 ring-2 ring-indigo-500 ring-opacity-50' : ''}`}>
                    {plan.isDefault && (
                      <div className="absolute top-0 right-0 -mt-2 -mr-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{plan.name}</h3>
                    <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">per month</p>
                    
                    <ul className="mt-6 space-y-3">
                      <li className="flex items-start">
                        <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                          <Check size={18} />
                        </span>
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {plan.messagesLimit.toLocaleString()} messages
                        </span>
                      </li>
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="flex-shrink-0 text-green-500 dark:text-green-400">
                            <Check size={18} />
                          </span>
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-6">
                      <button className="btn btn-primary w-full">
                        {currentUser?.plan === plan.name ? 'Current Plan' : 'Select Plan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Transaction History */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Transaction History</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Transaction ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {appState.transactions
                      .filter(transaction => transaction.userId === currentUser?.id)
                      .map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{transaction.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(transaction.createdAt)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className={transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                              {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 capitalize">{transaction.type}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{transaction.description}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Page Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400">The page you are looking for does not exist or is under construction.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setCurrentPage('dashboard')}
            >
              Return to Dashboard
            </button>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Mobile Navigation */}
      <div className="lg:hidden z-10 sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              aria-label="Toggle mobile menu"
            >
              <Menu size={20} />
            </button>
            <h1 className="ml-2 text-lg font-medium text-gray-900 dark:text-white">
              {currentUser?.role === 'reseller' && currentUser.brandName ? currentUser.brandName : 'WhatsApp Platform'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="relative">
              <button 
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <UserRound size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Sidebar */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="absolute inset-0 bg-gray-600 bg-opacity-75 dark:bg-opacity-90"
            onClick={() => setShowMobileMenu(false)}
          ></div>
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-slate-800 z-50">
            <div className="absolute top-0 right-0 -mr-12 pt-3">
              <button 
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:focus:ring-gray-600"
                onClick={() => setShowMobileMenu(false)}
              >
                <span className="sr-only">Close sidebar</span>
                <X size={24} className="text-white" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4">
                <div className="font-bold text-xl text-indigo-600 dark:text-indigo-400">
                  {currentUser?.role === 'reseller' && currentUser.brandName ? currentUser.brandName : 'WhatsApp Platform'}
                </div>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {filteredMenu.map((item) => (
                  <div key={item.id}>
                    <button
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md w-full ${currentPage === item.link ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                      onClick={() => {
                        setCurrentPage(item.link);
                        setShowMobileMenu(false);
                      }}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.title}
                    </button>
                    
                    {item.subitems && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subitems.map((subitem) => (
                          <button
                            key={subitem.id}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${currentPage === subitem.link ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                            onClick={() => {
                              setCurrentPage(subitem.link);
                              setShowMobileMenu(false);
                            }}
                          >
                            {subitem.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex-shrink-0 group block">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                      {currentUser?.name}
                    </p>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 capitalize">
                      {currentUser?.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 ${activeSidebar ? 'lg:w-64' : 'lg:w-20'} transition-all duration-300 ease-in-out`}>
          <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4 space-x-2">
                <div className={`font-bold text-xl text-indigo-600 dark:text-indigo-400 ${!activeSidebar && 'lg:hidden'}`}>
                  {currentUser?.role === 'reseller' && currentUser.brandName ? currentUser.brandName : 'WhatsApp Platform'}
                </div>
                <button 
                  className="p-1 rounded-md ml-auto text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setActiveSidebar(!activeSidebar)}
                  aria-label="Toggle sidebar"
                >
                  <ChevronRight size={20} className={`transform transition-transform ${!activeSidebar && 'rotate-180'}`} />
                </button>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {filteredMenu.map((item) => (
                  <div key={item.id}>
                    <button
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${currentPage === item.link ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} ${!activeSidebar && 'justify-center'}`}
                      onClick={() => setCurrentPage(item.link)}
                    >
                      <span>{item.icon}</span>
                      <span className={`ml-3 ${!activeSidebar && 'lg:hidden'}`}>{item.title}</span>
                    </button>
                    
                    {activeSidebar && item.subitems && (
                      <div className="ml-8 mt-1 space-y-1">
                        {item.subitems.map((subitem) => (
                          <button
                            key={subitem.id}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full ${currentPage === subitem.link ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
                            onClick={() => setCurrentPage(subitem.link)}
                          >
                            {subitem.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex-shrink-0 w-full group block">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                    <UserRound size={20} />
                  </div>
                  {activeSidebar && (
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                        {currentUser?.name}
                      </p>
                      <div className="flex items-center">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 capitalize">
                          {currentUser?.role}
                        </p>
                        <button 
                          className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-300"
                          onClick={handleLogout}
                          aria-label="Log out"
                        >
                          <LogOut size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className={`flex-1 ${activeSidebar ? 'lg:pl-64' : 'lg:pl-20'} transition-all duration-300 ease-in-out`}>
          {/* Desktop Header */}
          <div className="hidden lg:flex lg:sticky lg:top-0 lg:z-10 lg:bg-white lg:dark:bg-slate-800 lg:border-b lg:border-gray-200 lg:dark:border-gray-700 lg:py-4 lg:px-6">
            <div className="flex-1 flex">
              <div className="relative w-full max-w-md">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyUp={handleSearch}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </div>
              </div>
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-6 mt-2 w-full max-w-md bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                  <ul className="py-2 max-h-96 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <li 
                        key={index} 
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                        onClick={() => {
                          // Handle click on search result
                          setSearchResults([]);
                          setSearchTerm('');
                        }}
                      >
                        <div className="flex items-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 mr-3">
                            {result.type === 'user' && <UserRound size={16} />}
                            {result.type === 'company' && <Database size={16} />}
                            {result.type === 'contact' && <UserRound size={16} />}
                            {result.type === 'template' && <FileText size={16} />}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {result.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                              {result.type} {result.email && `• ${result.email}`}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="flex items-center ml-4 space-x-3">
              <button 
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                aria-label="Notifications"
              >
                <AlertTriangle size={20} />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">2</span>
              </button>
              
              <button 
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <button 
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="Help"
              >
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
          
          {/* Page content */}
          <main className="p-6">
            {renderContent()}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
            {currentUser?.role === 'reseller' && currentUser.brandName 
              ? `Copyright © ${new Date().getFullYear()} ${currentUser.brandName}. All rights reserved.`
              : `Copyright © ${new Date().getFullYear()} Datavtar Private Limited. All rights reserved.`
            }
          </footer>
        </div>
      </div>
      
      {/* Modals */}
      {showNewCompanyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onKeyDown={handleEscapeKey}>
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Company</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowNewCompanyModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="form-label" htmlFor="company-name">Company Name</label>
                <input 
                  id="company-name" 
                  type="text" 
                  className="input" 
                  value={newCompanyForm.name}
                  onChange={(e) => setNewCompanyForm({...newCompanyForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="waba-id">WhatsApp Business Account ID</label>
                <input 
                  id="waba-id" 
                  type="text" 
                  className="input" 
                  value={newCompanyForm.wabaId}
                  onChange={(e) => setNewCompanyForm({...newCompanyForm, wabaId: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="phone-number">Phone Number</label>
                <input 
                  id="phone-number" 
                  type="text" 
                  className="input" 
                  value={newCompanyForm.phoneNumber}
                  onChange={(e) => setNewCompanyForm({...newCompanyForm, phoneNumber: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="plan">Plan</label>
                <select 
                  id="plan" 
                  className="input" 
                  value={newCompanyForm.plan}
                  onChange={(e) => setNewCompanyForm({...newCompanyForm, plan: e.target.value})}
                >
                  <option value="">Select a plan</option>
                  {appState.plans.map(plan => (
                    <option key={plan.id} value={plan.name}>{plan.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => setShowNewCompanyModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateCompany}
              >
                Create Company
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showNewUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onKeyDown={handleEscapeKey}>
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New User</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowNewUserModal(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div>
                <label className="form-label" htmlFor="user-name">Full Name</label>
                <input 
                  id="user-name" 
                  type="text" 
                  className="input" 
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({...newUserForm, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="user-email">Email</label>
                <input 
                  id="user-email" 
                  type="email" 
                  className="input" 
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="user-password">Password</label>
                <input 
                  id="user-password" 
                  type="password" 
                  className="input" 
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="user-role">Role</label>
                <select 
                  id="user-role" 
                  className="input" 
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as UserRole})}
                >
                  <option value="company">Company User</option>
                  <option value="reseller">Reseller</option>
                  {currentUser?.role === 'admin' && <option value="admin">Administrator</option>}
                </select>
              </div>
              
              {newUserForm.role === 'company' && (
                <div>
                  <label className="form-label" htmlFor="company-name">Company Name</label>
                  <input 
                    id="company-name" 
                    type="text" 
                    className="input" 
                    value={newUserForm.companyName}
                    onChange={(e) => setNewUserForm({...newUserForm, companyName: e.target.value})}
                  />
                </div>
              )}
              
              {newUserForm.role === 'reseller' && (
                <div>
                  <label className="form-label" htmlFor="brand-name">Brand Name</label>
                  <input 
                    id="brand-name" 
                    type="text" 
                    className="input" 
                    value={newUserForm.brandName}
                    onChange={(e) => setNewUserForm({...newUserForm, brandName: e.target.value})}
                  />
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => setShowNewUserModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateUser}
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showUserDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onKeyDown={handleEscapeKey}>
          <div className="modal-content" ref={modalRef}>
            <div className="modal-header">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Deletion</h2>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowUserDeleteConfirm(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-700 dark:text-gray-300">Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => setShowUserDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
