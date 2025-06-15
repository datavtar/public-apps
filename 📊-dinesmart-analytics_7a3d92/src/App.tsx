import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Users, TrendingUp, Calendar, ShoppingBag, Download, Upload, Filter, Search,
  Settings, BarChart3, PieChart, User, Clock, DollarSign, Target, Star,
  FileText, Plus, Edit, Trash2, Eye, ChevronDown, ArrowUp, ArrowDown,
  Sun, Moon, RefreshCw, AlertCircle, CheckCircle, XCircle, LogOut, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
         PieChart as RechartsPieChart, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and Interfaces
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  firstVisit: string;
  lastVisit: string;
  avgOrderValue: number;
  favoriteItems: string[];
  visitFrequency: 'New' | 'Occasional' | 'Regular' | 'VIP';
  status: 'Active' | 'Lapsed 3M' | 'Lapsed 6M' | 'Lapsed 9M+';
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  date: string;
  paymentMethod: string;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category: string;
}

interface Analytics {
  totalCustomers: number;
  repeatCustomers: number;
  newCustomers: number;
  totalRevenue: number;
  avgOrderValue: number;
  lapsedCustomers: {
    threeMonths: number;
    sixMonths: number;
    nineMonths: number;
  };
}

interface ItemAnalysis {
  item: string;
  category: string;
  totalOrders: number;
  revenue: number;
  customers: string[];
}

interface CustomerSegment {
  name: string;
  customers: Customer[];
  description: string;
  color: string;
}

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

export default function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'customer' | 'order' | 'analysis' | 'confirm'>('customer');

  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Analysis States
  const [itemAnalysis, setItemAnalysis] = useState<ItemAnalysis[]>([]);
  const [customerSegments, setCustomerSegments] = useState<CustomerSegment[]>([]);
  const [targetItem, setTargetItem] = useState('');
  const [excludeItem, setExcludeItem] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCustomers = localStorage.getItem('restaurant_customers');
    const savedOrders = localStorage.getItem('restaurant_orders');
    
    if (savedCustomers) {
      const parsedCustomers = JSON.parse(savedCustomers);
      setCustomers(parsedCustomers);
      calculateAnalytics(parsedCustomers, JSON.parse(savedOrders || '[]'));
    } else {
      // Initialize with sample data
      initializeSampleData();
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const initializeSampleData = () => {
    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Smith',
        phone: '+1-555-0101',
        email: 'john.smith@email.com',
        totalOrders: 15,
        totalSpent: 450.75,
        firstVisit: '2024-01-15',
        lastVisit: '2025-06-10',
        avgOrderValue: 30.05,
        favoriteItems: ['Margherita Pizza', 'Caesar Salad'],
        visitFrequency: 'Regular',
        status: 'Active'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        phone: '+1-555-0102',
        email: 'sarah.j@email.com',
        totalOrders: 8,
        totalSpent: 245.50,
        firstVisit: '2024-03-20',
        lastVisit: '2025-02-28',
        avgOrderValue: 30.69,
        favoriteItems: ['Chicken Alfredo', 'Garlic Bread'],
        visitFrequency: 'Occasional',
        status: 'Lapsed 3M'
      },
      {
        id: '3',
        name: 'Mike Davis',
        phone: '+1-555-0103',
        email: 'mike.davis@email.com',
        totalOrders: 25,
        totalSpent: 875.25,
        firstVisit: '2023-11-10',
        lastVisit: '2025-06-12',
        avgOrderValue: 35.01,
        favoriteItems: ['Ribeye Steak', 'Loaded Nachos', 'Craft Beer'],
        visitFrequency: 'VIP',
        status: 'Active'
      },
      {
        id: '4',
        name: 'Lisa Chen',
        phone: '+1-555-0104',
        email: 'lisa.chen@email.com',
        totalOrders: 3,
        totalSpent: 85.50,
        firstVisit: '2024-12-01',
        lastVisit: '2024-12-15',
        avgOrderValue: 28.50,
        favoriteItems: ['Vegetable Stir Fry'],
        visitFrequency: 'New',
        status: 'Lapsed 6M'
      },
      {
        id: '5',
        name: 'Robert Wilson',
        phone: '+1-555-0105',
        email: 'robert.w@email.com',
        totalOrders: 45,
        totalSpent: 1450.80,
        firstVisit: '2023-08-05',
        lastVisit: '2025-06-14',
        avgOrderValue: 32.24,
        favoriteItems: ['BBQ Ribs', 'Coleslaw', 'Craft Beer', 'Apple Pie'],
        visitFrequency: 'VIP',
        status: 'Active'
      }
    ];

    const sampleOrders: Order[] = [
      {
        id: '1',
        customerId: '1',
        customerName: 'John Smith',
        items: [
          { name: 'Margherita Pizza', quantity: 1, price: 18.99, category: 'Pizza' },
          { name: 'Caesar Salad', quantity: 1, price: 12.99, category: 'Salad' }
        ],
        total: 31.98,
        date: '2025-06-10',
        paymentMethod: 'Credit Card'
      },
      {
        id: '2',
        customerId: '3',
        customerName: 'Mike Davis',
        items: [
          { name: 'Ribeye Steak', quantity: 1, price: 28.99, category: 'Main Course' },
          { name: 'Loaded Nachos', quantity: 1, price: 14.99, category: 'Appetizer' },
          { name: 'Craft Beer', quantity: 2, price: 6.99, category: 'Beverage' }
        ],
        total: 57.96,
        date: '2025-06-12',
        paymentMethod: 'Credit Card'
      }
    ];

    setCustomers(sampleCustomers);
    setOrders(sampleOrders);
    localStorage.setItem('restaurant_customers', JSON.stringify(sampleCustomers));
    localStorage.setItem('restaurant_orders', JSON.stringify(sampleOrders));
    calculateAnalytics(sampleCustomers, sampleOrders);
  };

  const calculateAnalytics = (customerData: Customer[], orderData: Order[]) => {
    const now = new Date();
    const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));
    const nineMonthsAgo = new Date(now.setMonth(now.getMonth() - 3));

    const analyticsData: Analytics = {
      totalCustomers: customerData.length,
      repeatCustomers: customerData.filter(c => c.totalOrders > 1).length,
      newCustomers: customerData.filter(c => c.visitFrequency === 'New').length,
      totalRevenue: customerData.reduce((sum, c) => sum + c.totalSpent, 0),
      avgOrderValue: customerData.reduce((sum, c) => sum + c.avgOrderValue, 0) / customerData.length,
      lapsedCustomers: {
        threeMonths: customerData.filter(c => c.status === 'Lapsed 3M').length,
        sixMonths: customerData.filter(c => c.status === 'Lapsed 6M').length,
        nineMonths: customerData.filter(c => c.status === 'Lapsed 9M+').length,
      }
    };

    setAnalytics(analyticsData);
    generateItemAnalysis(orderData);
    generateCustomerSegments(customerData);
  };

  const generateItemAnalysis = (orderData: Order[]) => {
    const itemMap = new Map<string, ItemAnalysis>();

    orderData.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            item: item.name,
            category: item.category,
            totalOrders: 0,
            revenue: 0,
            customers: []
          });
        }

        const analysis = itemMap.get(key)!;
        analysis.totalOrders += item.quantity;
        analysis.revenue += item.price * item.quantity;
        if (!analysis.customers.includes(order.customerName)) {
          analysis.customers.push(order.customerName);
        }
      });
    });

    setItemAnalysis(Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue));
  };

  const generateCustomerSegments = (customerData: Customer[]) => {
    const segments: CustomerSegment[] = [
      {
        name: 'VIP Customers',
        customers: customerData.filter(c => c.visitFrequency === 'VIP'),
        description: 'High-value customers with frequent visits',
        color: '#10B981'
      },
      {
        name: 'Regular Customers',
        customers: customerData.filter(c => c.visitFrequency === 'Regular'),
        description: 'Loyal customers with consistent visits',
        color: '#3B82F6'
      },
      {
        name: 'Lapsed Customers (3M)',
        customers: customerData.filter(c => c.status === 'Lapsed 3M'),
        description: 'Customers who haven\'t visited in 3 months',
        color: '#F59E0B'
      },
      {
        name: 'Lapsed Customers (6M+)',
        customers: customerData.filter(c => c.status === 'Lapsed 6M' || c.status === 'Lapsed 9M+'),
        description: 'Customers who haven\'t visited in 6+ months',
        color: '#EF4444'
      }
    ];

    setCustomerSegments(segments);
  };

  const handleAIAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file for AI analysis.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const contextPrompt = selectedFile 
      ? `Analyze this restaurant billing data file and provide insights about customer behavior, frequency patterns, popular items, and recommendations for customer retention and targeting. Focus on actionable insights for restaurant management.`
      : `${aiPrompt}\n\nContext: This is for a restaurant analytics dashboard. Provide actionable insights about customer behavior, repeat visits, popular items, and marketing recommendations based on the query.`;

    try {
      aiLayerRef.current?.sendToAI(contextPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-process CSV files for customer data
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        processCSVFile(file);
      }
    }
  };

  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const newCustomers: Customer[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= headers.length && values[0].trim()) {
          const customer: Customer = {
            id: Date.now().toString() + i,
            name: values[0]?.trim() || '',
            phone: values[1]?.trim() || '',
            email: values[2]?.trim() || '',
            totalOrders: parseInt(values[3]) || 0,
            totalSpent: parseFloat(values[4]) || 0,
            firstVisit: values[5]?.trim() || new Date().toISOString().split('T')[0],
            lastVisit: values[6]?.trim() || new Date().toISOString().split('T')[0],
            avgOrderValue: parseFloat(values[7]) || 0,
            favoriteItems: values[8]?.split(';').map(item => item.trim()) || [],
            visitFrequency: (values[9]?.trim() as any) || 'New',
            status: (values[10]?.trim() as any) || 'Active'
          };
          newCustomers.push(customer);
        }
      }

      if (newCustomers.length > 0) {
        const updatedCustomers = [...customers, ...newCustomers];
        setCustomers(updatedCustomers);
        localStorage.setItem('restaurant_customers', JSON.stringify(updatedCustomers));
        calculateAnalytics(updatedCustomers, orders);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const csvContent = `Name,Phone,Email,Total Orders,Total Spent,First Visit,Last Visit,Avg Order Value,Favorite Items,Visit Frequency,Status
John Doe,+1-555-0123,john@example.com,5,150.75,2024-01-01,2025-06-01,30.15,Pizza;Salad,Regular,Active
Jane Smith,+1-555-0124,jane@example.com,2,85.50,2024-02-01,2025-02-01,42.75,Pasta;Wine,Occasional,Lapsed 3M`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_data_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportCustomers = () => {
    const csvContent = [
      'Name,Phone,Email,Total Orders,Total Spent,First Visit,Last Visit,Avg Order Value,Favorite Items,Visit Frequency,Status',
      ...customers.map(c => 
        `${c.name},${c.phone},${c.email},${c.totalOrders},${c.totalSpent},${c.firstVisit},${c.lastVisit},${c.avgOrderValue},"${c.favoriteItems.join(';')}",${c.visitFrequency},${c.status}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer_analytics_export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const analyzeItemPreference = () => {
    if (!targetItem) return;

    const customersWithTarget = customers.filter(c => 
      c.favoriteItems.some(item => item.toLowerCase().includes(targetItem.toLowerCase()))
    );

    const customersWithoutExclude = excludeItem 
      ? customersWithTarget.filter(c => 
          !c.favoriteItems.some(item => item.toLowerCase().includes(excludeItem.toLowerCase()))
        )
      : customersWithTarget;

    const segment: CustomerSegment = {
      name: `Customers who ordered ${targetItem}${excludeItem ? ` but not ${excludeItem}` : ''}`,
      customers: customersWithoutExclude,
      description: `${customersWithoutExclude.length} customers match this criteria`,
      color: '#8B5CF6'
    };

    setCustomerSegments(prev => [segment, ...prev.slice(0, 4)]);
  };

  const clearAllData = () => {
    setCustomers([]);
    setOrders([]);
    setAnalytics(null);
    setItemAnalysis([]);
    setCustomerSegments([]);
    localStorage.removeItem('restaurant_customers');
    localStorage.removeItem('restaurant_orders');
    setShowModal(false);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const matchesFilter = filterStatus === 'All' || customer.status === filterStatus || customer.visitFrequency === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Restaurant Analytics Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Restaurant Analytics</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Customer Intelligence Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser.first_name}</span>
              </div>
              
              <button
                onClick={logout}
                className="btn btn-secondary btn-sm"
              >
                <LogOut className="w-4 h-4" />
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
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'customers', label: 'Customer Analysis', icon: Users },
              { id: 'items', label: 'Item Analysis', icon: ShoppingBag },
              { id: 'ai-insights', label: 'AI Insights', icon: Star },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="generation_issue_fallback">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="flex-between">
                <div>
                  <h2 className="heading-2">Analytics Dashboard</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Overview of your restaurant's customer analytics</p>
                </div>
                <button
                  onClick={() => calculateAnalytics(customers, orders)}
                  className="btn btn-primary"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh Data
                </button>
              </div>

              {/* Key Metrics Cards */}
              {analytics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card card-padding">
                    <div className="flex-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.totalCustomers}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex-center">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card card-padding">
                    <div className="flex-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Repeat Customers</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.repeatCustomers}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {((analytics.repeatCustomers / analytics.totalCustomers) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex-center">
                        <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card card-padding">
                    <div className="flex-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">${analytics.totalRevenue.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex-center">
                        <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                    </div>
                  </div>

                  <div className="card card-padding">
                    <div className="flex-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Order Value</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">${analytics.avgOrderValue.toFixed(2)}</p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex-center">
                        <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Customer Frequency Distribution */}
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Customer Frequency Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <RechartsPieChart.Pie
                        data={[
                          { name: 'VIP', value: customers.filter(c => c.visitFrequency === 'VIP').length },
                          { name: 'Regular', value: customers.filter(c => c.visitFrequency === 'Regular').length },
                          { name: 'Occasional', value: customers.filter(c => c.visitFrequency === 'Occasional').length },
                          { name: 'New', value: customers.filter(c => c.visitFrequency === 'New').length }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {chartColors.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </RechartsPieChart.Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Lapsed Customers Analysis */}
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Lapsed Customers by Period</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={analytics ? [
                        { period: '3 Months', count: analytics.lapsedCustomers.threeMonths },
                        { period: '6 Months', count: analytics.lapsedCustomers.sixMonths },
                        { period: '9+ Months', count: analytics.lapsedCustomers.nineMonths }
                      ] : []}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#EF4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Customer Segments */}
              {customerSegments.length > 0 && (
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4">Customer Segments</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {customerSegments.map((segment, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          ></div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{segment.name}</h4>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {segment.customers.length}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{segment.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Analysis Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex-between">
                <div>
                  <h2 className="heading-2">Customer Analysis</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Detailed customer behavior and segmentation</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={downloadTemplate}
                    className="btn btn-secondary"
                  >
                    <Download className="w-4 h-4" />
                    Template
                  </button>
                  <button
                    onClick={exportCustomers}
                    className="btn btn-primary"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="card card-padding">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search customers by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="select"
                    >
                      <option value="All">All Customers</option>
                      <option value="Active">Active</option>
                      <option value="Lapsed 3M">Lapsed 3M</option>
                      <option value="Lapsed 6M">Lapsed 6M</option>
                      <option value="Lapsed 9M+">Lapsed 9M+</option>
                      <option value="VIP">VIP</option>
                      <option value="Regular">Regular</option>
                      <option value="Occasional">Occasional</option>
                      <option value="New">New</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Item Preference Analysis */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Item Preference Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="form-group">
                    <label className="form-label">Customers who ordered:</label>
                    <input
                      type="text"
                      placeholder="e.g., Pizza"
                      value={targetItem}
                      onChange={(e) => setTargetItem(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">But not:</label>
                    <input
                      type="text"
                      placeholder="e.g., Salad (optional)"
                      value={excludeItem}
                      onChange={(e) => setExcludeItem(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">&nbsp;</label>
                    <button
                      onClick={analyzeItemPreference}
                      className="btn btn-primary w-full"
                      disabled={!targetItem}
                    >
                      <Target className="w-4 h-4" />
                      Analyze
                    </button>
                  </div>
                </div>
              </div>

              {/* Customer List */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5">Customer List ({filteredCustomers.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Customer</th>
                        <th className="table-header-cell">Contact</th>
                        <th className="table-header-cell">Orders</th>
                        <th className="table-header-cell">Total Spent</th>
                        <th className="table-header-cell">Last Visit</th>
                        <th className="table-header-cell">Status</th>
                        <th className="table-header-cell">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="table-row">
                          <td className="table-cell">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{customer.visitFrequency}</div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="text-sm">
                              <div>{customer.email}</div>
                              <div className="text-gray-500 dark:text-gray-400">{customer.phone}</div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="text-center">
                              <div className="font-medium">{customer.totalOrders}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">orders</div>
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="font-medium">${customer.totalSpent.toFixed(2)}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Avg: ${customer.avgOrderValue.toFixed(2)}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="text-sm">{customer.lastVisit}</div>
                          </td>
                          <td className="table-cell">
                            <span className={`badge ${
                              customer.status === 'Active' ? 'badge-success' :
                              customer.status === 'Lapsed 3M' ? 'badge-warning' :
                              'badge-error'
                            }`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setModalType('customer');
                                setShowModal(true);
                              }}
                              className="btn btn-sm btn-secondary"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Item Analysis Tab */}
          {activeTab === 'items' && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-2">Item Analysis</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Menu item performance and customer preferences</p>
              </div>

              {/* Top Items Chart */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Top Items by Revenue</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={itemAnalysis.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="item" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        name === 'revenue' ? `$${value.toFixed(2)}` : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" name="revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Item Performance Table */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5">Item Performance Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Item</th>
                        <th className="table-header-cell">Category</th>
                        <th className="table-header-cell">Total Orders</th>
                        <th className="table-header-cell">Revenue</th>
                        <th className="table-header-cell">Unique Customers</th>
                        <th className="table-header-cell">Avg per Customer</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {itemAnalysis.map((item, index) => (
                        <tr key={index} className="table-row">
                          <td className="table-cell">
                            <div className="font-medium text-gray-900 dark:text-white">{item.item}</div>
                          </td>
                          <td className="table-cell">
                            <span className="badge badge-gray">{item.category}</span>
                          </td>
                          <td className="table-cell">
                            <div className="text-center font-medium">{item.totalOrders}</div>
                          </td>
                          <td className="table-cell">
                            <div className="font-medium">${item.revenue.toFixed(2)}</div>
                          </td>
                          <td className="table-cell">
                            <div className="text-center">{item.customers.length}</div>
                          </td>
                          <td className="table-cell">
                            <div className="text-center">
                              ${(item.revenue / item.customers.length).toFixed(2)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AI Insights Tab */}
          {activeTab === 'ai-insights' && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-2">AI-Powered Insights</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Get intelligent analysis of your customer data</p>
              </div>

              {/* AI Analysis Form */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Ask AI About Your Data</h3>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Your Question</label>
                    <textarea
                      placeholder="Ask about customer patterns, preferences, or get marketing recommendations..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="textarea"
                      rows={3}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Data File (Optional)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="input"
                      />
                      {selectedFile && (
                        <span className="text-sm text-green-600 dark:text-green-400">
                          {selectedFile.name} selected
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleAIAnalysis}
                    disabled={aiLoading || (!aiPrompt.trim() && !selectedFile)}
                    className="btn btn-primary"
                  >
                    {aiLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4" />
                        Get AI Insights
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Results */}
              {aiResult && (
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    AI Analysis Results
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiResult}
                    </ReactMarkdown>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      AI analysis is based on available data and should be used as guidance alongside your business expertise.
                    </p>
                  </div>
                </div>
              )}

              {/* AI Error */}
              {aiError && (
                <div className="alert alert-error">
                  <XCircle className="w-5 h-5" />
                  <div>
                    <h4 className="font-medium">AI Analysis Error</h4>
                    <p>{aiError.message || 'Failed to process AI request. Please try again.'}</p>
                  </div>
                </div>
              )}

              {/* Sample Questions */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Sample Questions to Ask</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    "What are the key characteristics of my most valuable customers?",
                    "Which customers are at risk of churning and why?",
                    "What menu items should I promote to increase average order value?",
                    "How can I re-engage customers who haven't visited in 6 months?",
                    "What patterns do you see in customer ordering behavior?",
                    "Which customer segments should I target for a new promotion?"
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setAiPrompt(question)}
                      className="p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 theme-transition"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">{question}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="heading-2">Settings</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your data and preferences</p>
              </div>

              {/* Data Management */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Data Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Import Customer Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Upload CSV file with customer information</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={downloadTemplate}
                        className="btn btn-secondary btn-sm"
                      >
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

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Export All Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download complete customer analytics data</p>
                    </div>
                    <button
                      onClick={exportCustomers}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download className="w-4 h-4" />
                      Export CSV
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-200">Clear All Data</h4>
                      <p className="text-sm text-red-600 dark:text-red-400">Permanently delete all customer and order data</p>
                    </div>
                    <button
                      onClick={() => {
                        setModalType('confirm');
                        setShowModal(true);
                      }}
                      className="btn btn-error btn-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear Data
                    </button>
                  </div>
                </div>
              </div>

              {/* App Information */}
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Application Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Customers:</span>
                    <span className="font-medium">{customers.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Orders:</span>
                    <span className="font-medium">{orders.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Data Storage:</span>
                    <span className="font-medium">Local Browser Storage</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {modalType === 'customer' && selectedCustomer && (
              <>
                <div className="modal-header">
                  <h3 className="heading-5">Customer Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="modal-body space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Name</label>
                      <p className="font-medium">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="form-label">Status</label>
                      <span className={`badge ${
                        selectedCustomer.status === 'Active' ? 'badge-success' :
                        selectedCustomer.status === 'Lapsed 3M' ? 'badge-warning' :
                        'badge-error'
                      }`}>
                        {selectedCustomer.status}
                      </span>
                    </div>
                    <div>
                      <label className="form-label">Email</label>
                      <p>{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <label className="form-label">Phone</label>
                      <p>{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <label className="form-label">Total Orders</label>
                      <p className="font-medium">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <label className="form-label">Total Spent</label>
                      <p className="font-medium">${selectedCustomer.totalSpent.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="form-label">First Visit</label>
                      <p>{selectedCustomer.firstVisit}</p>
                    </div>
                    <div>
                      <label className="form-label">Last Visit</label>
                      <p>{selectedCustomer.lastVisit}</p>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Favorite Items</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {selectedCustomer.favoriteItems.map((item, index) => (
                        <span key={index} className="badge badge-primary">{item}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Close
                  </button>
                </div>
              </>
            )}

            {modalType === 'confirm' && (
              <>
                <div className="modal-header">
                  <h3 className="heading-5 text-red-600 dark:text-red-400">Confirm Data Deletion</h3>
                </div>
                <div className="modal-body">
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-200">Are you sure?</p>
                      <p className="text-sm text-red-600 dark:text-red-400">
                        This will permanently delete all customer data, orders, and analytics. This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={clearAllData}
                    className="btn btn-error"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All Data
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}