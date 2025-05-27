import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Target, 
  Plus, Edit, Trash2, Search, Filter, Download, 
  BarChart3, PieChart as LucidePieChart, Calendar, 
  Settings, Award, Lightbulb, CheckCircle, Circle,
  ArrowUp, ArrowDown, Eye, Moon, Sun
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

// Types and Interfaces
interface SalesData {
  id: string;
  month: string;
  revenue: number;
  units: number;
  leads: number;
  conversions: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  segment: 'high-value' | 'medium-value' | 'low-value';
  totalSpent: number;
  lastPurchase: string;
  lifetime: number;
}

interface SalesStrategy {
  id: string;
  title: string;
  description: string;
  category: 'pricing' | 'marketing' | 'product' | 'customer-service' | 'process';
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
  deadline: string;
  expectedIncrease: number;
}

interface SalesGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'revenue' | 'units' | 'customers' | 'conversion';
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  sales: number;
  target: number;
  deals: number;
  conversionRate: number;
}

type ActiveTab = 'dashboard' | 'analytics' | 'customers' | 'strategies' | 'goals' | 'team' | 'insights';

const App: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Data States
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [strategies, setStrategies] = useState<SalesStrategy[]>([]);
  const [goals, setGoals] = useState<SalesGoal[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Modal States
  const [showStrategyModal, setShowStrategyModal] = useState<boolean>(false);
  const [showGoalModal, setShowGoalModal] = useState<boolean>(false);
  const [showCustomerModal, setShowCustomerModal] = useState<boolean>(false);
  const [editingStrategy, setEditingStrategy] = useState<SalesStrategy | null>(null);
  const [editingGoal, setEditingGoal] = useState<SalesGoal | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Initialize sample data
  useEffect(() => {
    const initializeData = () => {
      // Sample sales data
      const sampleSalesData: SalesData[] = [
        { id: '1', month: 'Jan', revenue: 85000, units: 340, leads: 450, conversions: 76 },
        { id: '2', month: 'Feb', revenue: 92000, units: 368, leads: 480, conversions: 77 },
        { id: '3', month: 'Mar', revenue: 78000, units: 312, leads: 420, conversions: 74 },
        { id: '4', month: 'Apr', revenue: 105000, units: 420, leads: 520, conversions: 81 },
        { id: '5', month: 'May', revenue: 118000, units: 472, leads: 580, conversions: 81 },
        { id: '6', month: 'Jun', revenue: 134000, units: 536, leads: 640, conversions: 84 }
      ];

      // Sample customers
      const sampleCustomers: Customer[] = [
        { id: '1', name: 'Acme Corp', email: 'contact@acme.com', segment: 'high-value', totalSpent: 45000, lastPurchase: '2024-01-15', lifetime: 18 },
        { id: '2', name: 'TechStart Inc', email: 'hello@techstart.com', segment: 'medium-value', totalSpent: 15000, lastPurchase: '2024-01-10', lifetime: 8 },
        { id: '3', name: 'Global Solutions', email: 'info@global.com', segment: 'high-value', totalSpent: 67000, lastPurchase: '2024-01-20', lifetime: 24 },
        { id: '4', name: 'Local Business', email: 'owner@local.com', segment: 'low-value', totalSpent: 3500, lastPurchase: '2024-01-05', lifetime: 3 }
      ];

      // Sample strategies
      const sampleStrategies: SalesStrategy[] = [
        {
          id: '1',
          title: 'Implement Dynamic Pricing',
          description: 'Use data-driven pricing strategies to optimize revenue per customer',
          category: 'pricing',
          impact: 'high',
          effort: 'medium',
          status: 'in-progress',
          deadline: '2024-03-15',
          expectedIncrease: 15
        },
        {
          id: '2',
          title: 'Email Marketing Automation',
          description: 'Set up automated email sequences for lead nurturing and customer retention',
          category: 'marketing',
          impact: 'medium',
          effort: 'low',
          status: 'not-started',
          deadline: '2024-02-28',
          expectedIncrease: 8
        },
        {
          id: '3',
          title: 'Customer Loyalty Program',
          description: 'Launch a points-based loyalty program to increase repeat purchases',
          category: 'customer-service',
          impact: 'high',
          effort: 'high',
          status: 'not-started',
          deadline: '2024-04-30',
          expectedIncrease: 20
        }
      ];

      // Sample goals
      const sampleGoals: SalesGoal[] = [
        { id: '1', title: 'Q1 Revenue Target', targetAmount: 300000, currentAmount: 134000, deadline: '2024-03-31', category: 'revenue' },
        { id: '2', title: 'New Customers', targetAmount: 50, currentAmount: 23, deadline: '2024-02-29', category: 'customers' },
        { id: '3', title: 'Conversion Rate', targetAmount: 85, currentAmount: 81, deadline: '2024-06-30', category: 'conversion' }
      ];

      // Sample team members
      const sampleTeam: TeamMember[] = [
        { id: '1', name: 'Sarah Johnson', role: 'Senior Sales Rep', sales: 45000, target: 50000, deals: 12, conversionRate: 78 },
        { id: '2', name: 'Mike Chen', role: 'Sales Rep', sales: 38000, target: 40000, deals: 15, conversionRate: 72 },
        { id: '3', name: 'Emily Rodriguez', role: 'Account Manager', sales: 62000, target: 60000, deals: 8, conversionRate: 85 }
      ];

      // Load from localStorage or use sample data
      setSalesData(JSON.parse(localStorage.getItem('salesData') || JSON.stringify(sampleSalesData)));
      setCustomers(JSON.parse(localStorage.getItem('customers') || JSON.stringify(sampleCustomers)));
      setStrategies(JSON.parse(localStorage.getItem('strategies') || JSON.stringify(sampleStrategies)));
      setGoals(JSON.parse(localStorage.getItem('goals') || JSON.stringify(sampleGoals)));
      setTeamMembers(JSON.parse(localStorage.getItem('teamMembers') || JSON.stringify(sampleTeam)));
    };

    initializeData();
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('salesData', JSON.stringify(salesData));
  }, [salesData]);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('strategies', JSON.stringify(strategies));
  }, [strategies]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  }, [teamMembers]);

  // Strategy Management
  const handleSaveStrategy = (strategy: Omit<SalesStrategy, 'id'>) => {
    if (editingStrategy) {
      setStrategies(prev => prev.map(s => s.id === editingStrategy.id ? { ...strategy, id: editingStrategy.id } : s));
    } else {
      const newStrategy: SalesStrategy = {
        ...strategy,
        id: Date.now().toString()
      };
      setStrategies(prev => [...prev, newStrategy]);
    }
    setShowStrategyModal(false);
    setEditingStrategy(null);
  };

  const handleDeleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id));
  };

  // Goal Management
  const handleSaveGoal = (goal: Omit<SalesGoal, 'id'>) => {
    if (editingGoal) {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...goal, id: editingGoal.id } : g));
    } else {
      const newGoal: SalesGoal = {
        ...goal,
        id: Date.now().toString()
      };
      setGoals(prev => [...prev, newGoal]);
    }
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // Customer Management
  const handleSaveCustomer = (customer: Omit<Customer, 'id'>) => {
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...customer, id: editingCustomer.id } : c));
    } else {
      const newCustomer: Customer = {
        ...customer,
        id: Date.now().toString()
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    setShowCustomerModal(false);
    setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  // Calculations
  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
  const totalCustomers = customers.length;
  const avgConversionRate = salesData.length > 0 ? salesData.reduce((sum, data) => sum + data.conversions, 0) / salesData.length : 0;
  const totalGoalsProgress = goals.length > 0 ? goals.reduce((sum, goal) => sum + (goal.currentAmount / goal.targetAmount * 100), 0) / goals.length : 0;

  // Chart colors
  const chartColors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Filtered data
  const filteredStrategies = strategies.filter(strategy => {
    const matchesSearch = strategy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         strategy.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || strategy.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Customer segment data for pie chart
  const customerSegmentData = [
    { name: 'High Value', value: customers.filter(c => c.segment === 'high-value').length, color: '#10B981' },
    { name: 'Medium Value', value: customers.filter(c => c.segment === 'medium-value').length, color: '#F59E0B' },
    { name: 'Low Value', value: customers.filter(c => c.segment === 'low-value').length, color: '#EF4444' }
  ];

  // Download functions
  const downloadCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Modal close handler for ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowStrategyModal(false);
        setShowGoalModal(false);
        setShowCustomerModal(false);
        setEditingStrategy(null);
        setEditingGoal(null);
        setEditingCustomer(null);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Component JSX
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-3 text-xl font-bold text-gray-900 dark:text-white">Sales Booster</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200 transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
              { key: 'customers', label: 'Customers', icon: Users },
              { key: 'strategies', label: 'Strategies', icon: Lightbulb },
              { key: 'goals', label: 'Goals', icon: Target },
              { key: 'team', label: 'Team', icon: Award },
              { key: 'insights', label: 'Insights', icon: Eye }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as ActiveTab)}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="stat-title">Total Revenue</dt>
                      <dd className="stat-value">${totalRevenue.toLocaleString()}</dd>
                      <dd className="stat-desc flex items-center">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        12.5% from last month
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="stat-title">Total Customers</dt>
                      <dd className="stat-value">{totalCustomers}</dd>
                      <dd className="stat-desc flex items-center">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        8 new this month
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="stat-title">Conversion Rate</dt>
                      <dd className="stat-value">{avgConversionRate.toFixed(1)}%</dd>
                      <dd className="stat-desc flex items-center">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        2.1% from last month
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="stat-title">Goals Progress</dt>
                      <dd className="stat-value">{totalGoalsProgress.toFixed(0)}%</dd>
                      <dd className="stat-desc flex items-center">
                        <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                        On track
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Performance Chart */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales Performance Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('strategies')}>
                <div className="flex items-center">
                  <Lightbulb className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">View Strategies</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Explore sales improvement ideas</p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('goals')}>
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Track Goals</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your progress</p>
                  </div>
                </div>
              </div>

              <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab('customers')}>
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Manage Customers</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Analyze customer segments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Analytics</h2>
              <button
                onClick={() => downloadCSV(salesData, 'sales-analytics')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>

            {/* Revenue & Units Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue vs Units Sold</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-sm" />
                      <YAxis className="text-sm" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="revenue" fill="#3B82F6" name="Revenue ($)" />
                      <Bar dataKey="units" fill="#10B981" name="Units Sold" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Lead Conversion Funnel</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" className="text-sm" />
                      <YAxis className="text-sm" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="leads" stroke="#F59E0B" name="Leads" strokeWidth={2} />
                      <Line type="monotone" dataKey="conversions" stroke="#EF4444" name="Conversions (%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Customer Segments */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Customer Segments</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerSegmentData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {customerSegmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-4">
                  {customerSegmentData.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: segment.color }}
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-white">{segment.name}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">{segment.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Management</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => downloadCSV(customers, 'customers')}
                  className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
                <button
                  onClick={() => {
                    setEditingCustomer(null);
                    setShowCustomerModal(true);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Customer
                </button>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input w-full sm:w-48"
              >
                <option value="all">All Segments</option>
                <option value="high-value">High Value</option>
                <option value="medium-value">Medium Value</option>
                <option value="low-value">Low Value</option>
              </select>
            </div>

            {/* Customers Table */}
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header px-6 py-3">Name</th>
                    <th className="table-header px-6 py-3">Email</th>
                    <th className="table-header px-6 py-3">Segment</th>
                    <th className="table-header px-6 py-3">Total Spent</th>
                    <th className="table-header px-6 py-3">Last Purchase</th>
                    <th className="table-header px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {customers
                    .filter(customer => {
                      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           customer.email.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesSegment = filterCategory === 'all' || customer.segment === filterCategory;
                      return matchesSearch && matchesSegment;
                    })
                    .map(customer => (
                      <tr key={customer.id}>
                        <td className="table-cell px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{customer.name}</div>
                        </td>
                        <td className="table-cell px-6 py-4">{customer.email}</td>
                        <td className="table-cell px-6 py-4">
                          <span className={`badge ${
                            customer.segment === 'high-value' ? 'badge-success' :
                            customer.segment === 'medium-value' ? 'badge-warning' : 'badge-error'
                          }`}>
                            {customer.segment.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="table-cell px-6 py-4 font-medium">${customer.totalSpent.toLocaleString()}</td>
                        <td className="table-cell px-6 py-4">{customer.lastPurchase}</td>
                        <td className="table-cell px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingCustomer(customer);
                                setShowCustomerModal(true);
                              }}
                              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(customer.id)}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === 'strategies' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Strategies</h2>
              <button
                onClick={() => {
                  setEditingStrategy(null);
                  setShowStrategyModal(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Strategy
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search strategies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input w-full sm:w-48"
              >
                <option value="all">All Categories</option>
                <option value="pricing">Pricing</option>
                <option value="marketing">Marketing</option>
                <option value="product">Product</option>
                <option value="customer-service">Customer Service</option>
                <option value="process">Process</option>
              </select>
            </div>

            {/* Strategies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStrategies.map(strategy => (
                <div key={strategy.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{strategy.title}</h3>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingStrategy(strategy);
                          setShowStrategyModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{strategy.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Category:</span>
                      <span className="font-medium capitalize text-gray-900 dark:text-white">
                        {strategy.category.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Impact:</span>
                      <span className={`badge ${
                        strategy.impact === 'high' ? 'badge-success' :
                        strategy.impact === 'medium' ? 'badge-warning' : 'badge-info'
                      }`}>
                        {strategy.impact}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Effort:</span>
                      <span className={`badge ${
                        strategy.effort === 'low' ? 'badge-success' :
                        strategy.effort === 'medium' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {strategy.effort}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Expected Increase:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">+{strategy.expectedIncrease}%</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`badge ${
                      strategy.status === 'completed' ? 'badge-success' :
                      strategy.status === 'in-progress' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {strategy.status.replace('-', ' ')}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Due: {new Date(strategy.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Goals</h2>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  setShowGoalModal(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Goal
              </button>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isOverdue = new Date(goal.deadline) < new Date();
                
                return (
                  <div key={goal.id} className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                        <span className={`badge ${
                          goal.category === 'revenue' ? 'badge-success' :
                          goal.category === 'customers' ? 'badge-info' :
                          goal.category === 'conversion' ? 'badge-warning' : 'badge-error'
                        }`}>
                          {goal.category}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setEditingGoal(goal);
                            setShowGoalModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {goal.currentAmount.toLocaleString()} / {goal.targetAmount.toLocaleString()}
                          {goal.category === 'revenue' && ' $'}
                          {goal.category === 'conversion' && '%'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progress >= 100 ? 'bg-green-500' :
                            progress >= 75 ? 'bg-blue-500' :
                            progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className={`font-medium ${
                          progress >= 100 ? 'text-green-600 dark:text-green-400' :
                          progress >= 75 ? 'text-blue-600 dark:text-blue-400' :
                          progress >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {progress.toFixed(1)}% Complete
                        </span>
                        <span className={`text-sm ${
                          isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Performance</h2>
            
            {/* Team Overview Chart */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Sales Performance by Team Member</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamMembers}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="name" className="text-sm" />
                    <YAxis className="text-sm" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#3B82F6" name="Actual Sales ($)" />
                    <Bar dataKey="target" fill="#10B981" name="Target ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map(member => {
                const targetProgress = (member.sales / member.target) * 100;
                
                return (
                  <div key={member.id} className="card">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{member.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Sales Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${member.sales.toLocaleString()} / ${member.target.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            targetProgress >= 100 ? 'bg-green-500' :
                            targetProgress >= 80 ? 'bg-blue-500' :
                            targetProgress >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(targetProgress, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Deals Closed</span>
                          <p className="font-medium text-gray-900 dark:text-white">{member.deals}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Conversion Rate</span>
                          <p className="font-medium text-gray-900 dark:text-white">{member.conversionRate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sales Insights & Recommendations</h2>
            
            {/* Key Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900">
                <div className="flex items-center mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="ml-2 text-lg font-medium text-blue-900 dark:text-blue-100">Revenue Growth</h3>
                </div>
                <p className="text-blue-800 dark:text-blue-200 mb-3">
                  Your revenue has increased by 58% over the last 6 months. The strongest growth was in May and June.
                </p>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Recommendation:</strong> Focus on replicating the successful strategies from Q2.
                </div>
              </div>
              
              <div className="card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900">
                <div className="flex items-center mb-3">
                  <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <h3 className="ml-2 text-lg font-medium text-green-900 dark:text-green-100">Customer Segments</h3>
                </div>
                <p className="text-green-800 dark:text-green-200 mb-3">
                  High-value customers generate 65% of your revenue but represent only 25% of your customer base.
                </p>
                <div className="text-sm text-green-700 dark:text-green-300">
                  <strong>Recommendation:</strong> Implement a VIP program to retain and attract similar customers.
                </div>
              </div>
              
              <div className="card bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900 dark:to-orange-900">
                <div className="flex items-center mb-3">
                  <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <h3 className="ml-2 text-lg font-medium text-orange-900 dark:text-orange-100">Conversion Rates</h3>
                </div>
                <p className="text-orange-800 dark:text-orange-200 mb-3">
                  Your conversion rate has improved from 74% to 84% this quarter, beating industry average.
                </p>
                <div className="text-sm text-orange-700 dark:text-orange-300">
                  <strong>Recommendation:</strong> Document your process and train the team to maintain this performance.
                </div>
              </div>
              
              <div className="card bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900">
                <div className="flex items-center mb-3">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  <h3 className="ml-2 text-lg font-medium text-purple-900 dark:text-purple-100">Team Performance</h3>
                </div>
                <p className="text-purple-800 dark:text-purple-200 mb-3">
                  Emily Rodriguez is your top performer with 103% of target achieved and 85% conversion rate.
                </p>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Recommendation:</strong> Have Emily mentor other team members to share best practices.
                </div>
              </div>
            </div>
            
            {/* Action Items */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recommended Action Items</h3>
              <div className="space-y-4">
                {[
                  {
                    priority: 'High',
                    action: 'Implement customer segmentation-based pricing strategy',
                    impact: 'Potential 15-20% revenue increase',
                    timeline: '2-3 weeks'
                  },
                  {
                    priority: 'High',
                    action: 'Launch referral program for high-value customers',
                    impact: 'Potential 25% increase in customer acquisition',
                    timeline: '1-2 weeks'
                  },
                  {
                    priority: 'Medium',
                    action: 'Optimize email marketing automation sequences',
                    impact: 'Potential 8-12% improvement in lead conversion',
                    timeline: '1 week'
                  },
                  {
                    priority: 'Medium',
                    action: 'Implement cross-selling strategies for existing customers',
                    impact: 'Potential 10-15% increase in average order value',
                    timeline: '2-4 weeks'
                  },
                  {
                    priority: 'Low',
                    action: 'Develop social media marketing campaigns',
                    impact: 'Potential 5-8% increase in lead generation',
                    timeline: '3-4 weeks'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      item.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {item.priority}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">{item.action}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.impact}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Timeline: {item.timeline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Strategy Modal */}
      {showStrategyModal && (
        <div 
          className="modal-backdrop"
          onClick={() => {
            setShowStrategyModal(false);
            setEditingStrategy(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <StrategyModal
              strategy={editingStrategy}
              onSave={handleSaveStrategy}
              onClose={() => {
                setShowStrategyModal(false);
                setEditingStrategy(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div 
          className="modal-backdrop"
          onClick={() => {
            setShowGoalModal(false);
            setEditingGoal(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <GoalModal
              goal={editingGoal}
              onSave={handleSaveGoal}
              onClose={() => {
                setShowGoalModal(false);
                setEditingGoal(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div 
          className="modal-backdrop"
          onClick={() => {
            setShowCustomerModal(false);
            setEditingCustomer(null);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CustomerModal
              customer={editingCustomer}
              onSave={handleSaveCustomer}
              onClose={() => {
                setShowCustomerModal(false);
                setEditingCustomer(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 theme-transition">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Strategy Modal Component
interface StrategyModalProps {
  strategy: SalesStrategy | null;
  onSave: (strategy: Omit<SalesStrategy, 'id'>) => void;
  onClose: () => void;
}

const StrategyModal: React.FC<StrategyModalProps> = ({ strategy, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: strategy?.title || '',
    description: strategy?.description || '',
    category: strategy?.category || 'marketing',
    impact: strategy?.impact || 'medium',
    effort: strategy?.effort || 'medium',
    status: strategy?.status || 'not-started',
    deadline: strategy?.deadline || new Date().toISOString().split('T')[0],
    expectedIncrease: strategy?.expectedIncrease || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<SalesStrategy, 'id'>);
  };

  return (
    <div>
      <div className="modal-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {strategy ? 'Edit Strategy' : 'Add New Strategy'}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input h-24 resize-none"
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as SalesStrategy['category'] })}
              className="input"
            >
              <option value="pricing">Pricing</option>
              <option value="marketing">Marketing</option>
              <option value="product">Product</option>
              <option value="customer-service">Customer Service</option>
              <option value="process">Process</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Impact</label>
            <select
              value={formData.impact}
              onChange={(e) => setFormData({ ...formData, impact: e.target.value as SalesStrategy['impact'] })}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Effort Required</label>
            <select
              value={formData.effort}
              onChange={(e) => setFormData({ ...formData, effort: e.target.value as SalesStrategy['effort'] })}
              className="input"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as SalesStrategy['status'] })}
              className="input"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="input"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Expected Increase (%)</label>
            <input
              type="number"
              value={formData.expectedIncrease}
              onChange={(e) => setFormData({ ...formData, expectedIncrease: parseInt(e.target.value) || 0 })}
              className="input"
              min="0"
              max="100"
              required
            />
          </div>
        </div>
        
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {strategy ? 'Update' : 'Create'} Strategy
          </button>
        </div>
      </form>
    </div>
  );
};

// Goal Modal Component
interface GoalModalProps {
  goal: SalesGoal | null;
  onSave: (goal: Omit<SalesGoal, 'id'>) => void;
  onClose: () => void;
}

const GoalModal: React.FC<GoalModalProps> = ({ goal, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: goal?.title || '',
    targetAmount: goal?.targetAmount || 0,
    currentAmount: goal?.currentAmount || 0,
    deadline: goal?.deadline || new Date().toISOString().split('T')[0],
    category: goal?.category || 'revenue'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<SalesGoal, 'id'>);
  };

  return (
    <div>
      <div className="modal-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {goal ? 'Edit Goal' : 'Add New Goal'}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Goal Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as SalesGoal['category'] })}
            className="input"
          >
            <option value="revenue">Revenue</option>
            <option value="units">Units</option>
            <option value="customers">Customers</option>
            <option value="conversion">Conversion</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Target Amount</label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: parseInt(e.target.value) || 0 })}
              className="input"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Current Amount</label>
            <input
              type="number"
              value={formData.currentAmount}
              onChange={(e) => setFormData({ ...formData, currentAmount: parseInt(e.target.value) || 0 })}
              className="input"
              min="0"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Deadline</label>
          <input
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            className="input"
            required
          />
        </div>
        
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {goal ? 'Update' : 'Create'} Goal
          </button>
        </div>
      </form>
    </div>
  );
};

// Customer Modal Component
interface CustomerModalProps {
  customer: Customer | null;
  onSave: (customer: Omit<Customer, 'id'>) => void;
  onClose: () => void;
}

const CustomerModal: React.FC<CustomerModalProps> = ({ customer, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    segment: customer?.segment || 'medium-value',
    totalSpent: customer?.totalSpent || 0,
    lastPurchase: customer?.lastPurchase || new Date().toISOString().split('T')[0],
    lifetime: customer?.lifetime || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Omit<Customer, 'id'>);
  };

  return (
    <div>
      <div className="modal-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {customer ? 'Edit Customer' : 'Add New Customer'}
        </h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Customer Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="input"
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Segment</label>
          <select
            value={formData.segment}
            onChange={(e) => setFormData({ ...formData, segment: e.target.value as Customer['segment'] })}
            className="input"
          >
            <option value="high-value">High Value</option>
            <option value="medium-value">Medium Value</option>
            <option value="low-value">Low Value</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Total Spent ($)</label>
            <input
              type="number"
              value={formData.totalSpent}
              onChange={(e) => setFormData({ ...formData, totalSpent: parseInt(e.target.value) || 0 })}
              className="input"
              min="0"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Lifetime (months)</label>
            <input
              type="number"
              value={formData.lifetime}
              onChange={(e) => setFormData({ ...formData, lifetime: parseInt(e.target.value) || 0 })}
              className="input"
              min="0"
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Last Purchase Date</label>
          <input
            type="date"
            value={formData.lastPurchase}
            onChange={(e) => setFormData({ ...formData, lastPurchase: e.target.value })}
            className="input"
            required
          />
        </div>
        
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {customer ? 'Update' : 'Add'} Customer
          </button>
        </div>
      </form>
    </div>
  );
};

export default App;