import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  DollarSign, Plus, Search, Filter, Download, Upload, Settings, 
  BarChart3, Users, Tag, FileText, Eye, Edit, Trash2, X, 
  Calendar, Building, CreditCard, TrendingUp, TrendingDown,
  Home, LogOut, CheckCircle, AlertCircle, Clock, Zap, Camera,
  Save, UserPlus, PlusCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  employee: string;
  paymentMethod: string;
  vendor: string;
  date: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  spendingLimit: number;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  budget: number;
  color: string;
  isActive: boolean;
}

interface AppSettings {
  currency: string;
  language: string;
  theme: string;
  timezone: string;
  approvalRequired: boolean;
  defaultSpendingLimit: number;
}

type TabType = 'dashboard' | 'transactions' | 'employees' | 'categories' | 'reports' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    currency: 'USD',
    language: 'en',
    theme: 'light',
    timezone: 'UTC',
    approvalRequired: true,
    defaultSpendingLimit: 5000
  });

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showReceiptCapture, setShowReceiptCapture] = useState(false);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // Form State
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    amount: 0,
    description: '',
    category: '',
    employee: '',
    paymentMethod: 'credit-card',
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({
    name: '',
    email: '',
    department: '',
    role: '',
    spendingLimit: settings.defaultSpendingLimit,
    isActive: true
  });

  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    description: '',
    budget: 0,
    color: '#3B82F6',
    isActive: true
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    const savedEmployees = localStorage.getItem('employees');
    const savedCategories = localStorage.getItem('categories');
    const savedSettings = localStorage.getItem('appSettings');

    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Initialize with sample data
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          amount: 1250.50,
          description: 'Office supplies and equipment',
          category: 'Office Supplies',
          employee: 'John Doe',
          paymentMethod: 'company-card',
          vendor: 'Office Depot',
          date: '2025-06-08',
          status: 'approved',
          createdAt: '2025-06-08T10:30:00Z'
        },
        {
          id: '2',
          amount: 2800.00,
          description: 'Team lunch meeting with clients',
          category: 'Meals & Entertainment',
          employee: 'Sarah Wilson',
          paymentMethod: 'expense-account',
          vendor: 'The Executive Restaurant',
          date: '2025-06-07',
          status: 'pending',
          createdAt: '2025-06-07T14:15:00Z'
        },
        {
          id: '3',
          amount: 450.75,
          description: 'Taxi to airport for business trip',
          category: 'Travel',
          employee: 'Mike Johnson',
          paymentMethod: 'personal-reimbursement',
          vendor: 'City Cab Services',
          date: '2025-06-06',
          status: 'approved',
          createdAt: '2025-06-06T08:45:00Z'
        }
      ];
      setTransactions(sampleTransactions);
      localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
    }

    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    } else {
      const sampleEmployees: Employee[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@company.com',
          department: 'Engineering',
          role: 'Senior Developer',
          spendingLimit: 5000,
          isActive: true
        },
        {
          id: '2',
          name: 'Sarah Wilson',
          email: 'sarah.wilson@company.com',
          department: 'Sales',
          role: 'Account Manager',
          spendingLimit: 3000,
          isActive: true
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@company.com',
          department: 'Marketing',
          role: 'Marketing Specialist',
          spendingLimit: 2500,
          isActive: true
        }
      ];
      setEmployees(sampleEmployees);
      localStorage.setItem('employees', JSON.stringify(sampleEmployees));
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      const sampleCategories: Category[] = [
        {
          id: '1',
          name: 'Office Supplies',
          description: 'General office supplies and equipment',
          budget: 10000,
          color: '#3B82F6',
          isActive: true
        },
        {
          id: '2',
          name: 'Travel',
          description: 'Business travel expenses',
          budget: 25000,
          color: '#10B981',
          isActive: true
        },
        {
          id: '3',
          name: 'Meals & Entertainment',
          description: 'Client meetings and team meals',
          budget: 15000,
          color: '#F59E0B',
          isActive: true
        },
        {
          id: '4',
          name: 'Software & Subscriptions',
          description: 'Software licenses and subscriptions',
          budget: 20000,
          color: '#8B5CF6',
          isActive: true
        }
      ];
      setCategories(sampleCategories);
      localStorage.setItem('categories', JSON.stringify(sampleCategories));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  // AI Functions
  const handleReceiptUpload = (file: File) => {
    setSelectedFile(file);
    const prompt = `Analyze this receipt/invoice image and extract the transaction data. Return JSON with keys: "vendor", "amount", "date", "description", "items". For date, use YYYY-MM-DD format. For amount, use just the number without currency symbols.`;
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError("Failed to process receipt");
    }
  };

  const processAiResult = (result: string) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(result);
      if (parsed.vendor && parsed.amount) {
        setNewTransaction(prev => ({
          ...prev,
          vendor: parsed.vendor || '',
          amount: parseFloat(parsed.amount) || 0,
          date: parsed.date || new Date().toISOString().split('T')[0],
          description: parsed.description || parsed.items?.join(', ') || ''
        }));
        setShowReceiptCapture(false);
      }
    } catch {
      // If not JSON, extract data from markdown text
      const lines = result.split('\n');
      const extracted: any = {};
      
      lines.forEach(line => {
        if (line.toLowerCase().includes('vendor') || line.toLowerCase().includes('merchant')) {
          extracted.vendor = line.split(':')[1]?.trim();
        }
        if (line.toLowerCase().includes('amount') || line.toLowerCase().includes('total')) {
          const match = line.match(/[\d.,]+/);
          if (match) extracted.amount = parseFloat(match[0].replace(',', ''));
        }
        if (line.toLowerCase().includes('date')) {
          const dateMatch = line.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) extracted.date = dateMatch[0];
        }
        if (line.toLowerCase().includes('description') || line.toLowerCase().includes('item')) {
          extracted.description = line.split(':')[1]?.trim();
        }
      });

      if (extracted.vendor || extracted.amount) {
        setNewTransaction(prev => ({
          ...prev,
          vendor: extracted.vendor || prev.vendor,
          amount: extracted.amount || prev.amount,
          date: extracted.date || prev.date,
          description: extracted.description || prev.description
        }));
        setShowReceiptCapture(false);
      }
    }
  };

  useEffect(() => {
    if (aiResult) {
      processAiResult(aiResult);
    }
  }, [aiResult]);

  // CRUD Functions
  const addTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.employee) {
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      amount: Number(newTransaction.amount),
      description: newTransaction.description,
      category: newTransaction.category || '',
      employee: newTransaction.employee,
      paymentMethod: newTransaction.paymentMethod || 'credit-card',
      vendor: newTransaction.vendor || '',
      date: newTransaction.date || new Date().toISOString().split('T')[0],
      status: newTransaction.status || 'pending',
      createdAt: new Date().toISOString()
    };

    setTransactions(prev => [transaction, ...prev]);
    setNewTransaction({
      amount: 0,
      description: '',
      category: '',
      employee: '',
      paymentMethod: 'credit-card',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
    setShowAddModal(false);
  };

  const editTransaction = (transaction: Transaction) => {
    setEditingItem(transaction);
    setNewTransaction(transaction);
    setShowEditModal(true);
  };

  const updateTransaction = () => {
    if (!editingItem?.id) return;

    setTransactions(prev => prev.map(t => 
      t.id === editingItem.id 
        ? { ...t, ...newTransaction }
        : t
    ));
    setShowEditModal(false);
    setEditingItem(null);
    setNewTransaction({
      amount: 0,
      description: '',
      category: '',
      employee: '',
      paymentMethod: 'credit-card',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addEmployee = () => {
    if (!newEmployee.name || !newEmployee.email) return;

    const employee: Employee = {
      id: Date.now().toString(),
      name: newEmployee.name,
      email: newEmployee.email,
      department: newEmployee.department || '',
      role: newEmployee.role || '',
      spendingLimit: Number(newEmployee.spendingLimit) || settings.defaultSpendingLimit,
      isActive: newEmployee.isActive !== false
    };

    setEmployees(prev => [...prev, employee]);
    setNewEmployee({
      name: '',
      email: '',
      department: '',
      role: '',
      spendingLimit: settings.defaultSpendingLimit,
      isActive: true
    });
    setShowAddModal(false);
  };

  const addCategory = () => {
    if (!newCategory.name) return;

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description || '',
      budget: Number(newCategory.budget) || 0,
      color: newCategory.color || '#3B82F6',
      isActive: newCategory.isActive !== false
    };

    setCategories(prev => [...prev, category]);
    setNewCategory({
      name: '',
      description: '',
      budget: 0,
      color: '#3B82F6',
      isActive: true
    });
    setShowAddModal(false);
  };

  // Filter and Search Functions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || transaction.category === filterCategory;
    const matchesEmployee = !filterEmployee || transaction.employee === filterEmployee;
    const matchesDateRange = (!dateRange.start || transaction.date >= dateRange.start) &&
                            (!dateRange.end || transaction.date <= dateRange.end);
    
    return matchesSearch && matchesCategory && matchesEmployee && matchesDateRange;
  });

  // Analytics Functions
  const getTotalExpenses = () => {
    return transactions.reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(t => t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getPendingTransactions = () => {
    return transactions.filter(t => t.status === 'pending').length;
  };

  const getCategorySpending = () => {
    const spending: { [key: string]: number } = {};
    transactions.forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    });
    return spending;
  };

  // Export Functions
  const exportToCSV = () => {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Employee', 'Vendor', 'Payment Method', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        t.date,
        `"${t.description}"`,
        t.amount,
        `"${t.category}"`,
        `"${t.employee}"`,
        `"${t.vendor}"`,
        `"${t.paymentMethod}"`,
        t.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const headers = ['Date (YYYY-MM-DD)', 'Description', 'Amount', 'Category', 'Employee', 'Vendor', 'Payment Method', 'Status'];
    const sampleRow = ['2025-06-09', 'Sample expense description', '100.00', 'Office Supplies', 'John Doe', 'Sample Vendor', 'credit-card', 'pending'];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedTransactions: Transaction[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 8) {
          const transaction: Transaction = {
            id: Date.now().toString() + i,
            date: values[0]?.replace(/"/g, '') || new Date().toISOString().split('T')[0],
            description: values[1]?.replace(/"/g, '') || '',
            amount: parseFloat(values[2]) || 0,
            category: values[3]?.replace(/"/g, '') || '',
            employee: values[4]?.replace(/"/g, '') || '',
            vendor: values[5]?.replace(/"/g, '') || '',
            paymentMethod: values[6]?.replace(/"/g, '') || 'credit-card',
            status: (values[7]?.replace(/"/g, '') as 'pending' | 'approved' | 'rejected') || 'pending',
            createdAt: new Date().toISOString()
          };
          importedTransactions.push(transaction);
        }
      }
      
      setTransactions(prev => [...importedTransactions, ...prev]);
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    setTransactions([]);
    setEmployees([]);
    setCategories([]);
    localStorage.removeItem('transactions');
    localStorage.removeItem('employees');
    localStorage.removeItem('categories');
  };

  // Modal close handlers
  const closeModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowReceiptCapture(false);
    setEditingItem(null);
    setNewTransaction({
      amount: 0,
      description: '',
      category: '',
      employee: '',
      paymentMethod: 'credit-card',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
    setSelectedFile(null);
    setAiResult(null);
    setAiError(null);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Render Functions
  const renderDashboard = () => {
    const categorySpending = getCategorySpending();
    const monthlyTotal = getMonthlyExpenses();
    const totalExpenses = getTotalExpenses();
    const pendingCount = getPendingTransactions();
    
    return (
      <div className="space-y-6" id="dashboard-tab">
        <div className="flex-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
            id="add-transaction-btn"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Total Expenses</div>
                <div className="stat-value">${totalExpenses.toLocaleString()}</div>
                <div className="stat-desc">All time</div>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">This Month</div>
                <div className="stat-value">${monthlyTotal.toLocaleString()}</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  12% from last month
                </div>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Pending Approval</div>
                <div className="stat-value">{pendingCount}</div>
                <div className="stat-desc">Requires attention</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Active Employees</div>
                <div className="stat-value">{employees.filter(e => e.isActive).length}</div>
                <div className="stat-desc">Can submit expenses</div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {transactions.slice(0, 5).map(transaction => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.status === 'approved' ? 'bg-green-500' : 
                    transaction.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {transaction.employee} • {transaction.vendor}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    ${transaction.amount.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">{transaction.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Spending Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
          <div className="space-y-4">
            {Object.entries(categorySpending).map(([category, amount]) => {
              const categoryData = categories.find(c => c.name === category);
              const percentage = categoryData ? (amount / categoryData.budget) * 100 : 0;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{category}</span>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      ${amount.toLocaleString()} / ${categoryData?.budget.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: categoryData?.color || '#3B82F6'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderTransactions = () => (
    <div className="space-y-6" id="transactions-tab">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="form-group">
            <label className="form-label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Employee</label>
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="input"
            >
              <option value="">All Employees</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.name}>{employee.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input text-xs"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Category</th>
                <th className="table-header">Employee</th>
                <th className="table-header">Vendor</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="table-cell">{transaction.date}</td>
                  <td className="table-cell">
                    <div className="max-w-xs truncate">{transaction.description}</div>
                  </td>
                  <td className="table-cell font-semibold">${transaction.amount.toLocaleString()}</td>
                  <td className="table-cell">
                    <span className="badge badge-info">{transaction.category}</span>
                  </td>
                  <td className="table-cell">{transaction.employee}</td>
                  <td className="table-cell">{transaction.vendor}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      transaction.status === 'approved' ? 'badge-success' : 
                      transaction.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => editTransaction(transaction)}
                        className="text-blue-600 hover:text-blue-700"
                        aria-label="Edit transaction"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-600 hover:text-red-700"
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
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

  const renderEmployees = () => (
    <div className="space-y-6" id="employees-tab">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(employee => (
          <div key={employee.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{employee.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{employee.role}</p>
                </div>
              </div>
              <span className={`badge ${employee.isActive ? 'badge-success' : 'badge-error'}`}>
                {employee.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Email:</span>
                <span className="text-gray-900 dark:text-white">{employee.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Department:</span>
                <span className="text-gray-900 dark:text-white">{employee.department}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Spending Limit:</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ${employee.spendingLimit.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-slate-400">Total Spent:</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  ${transactions
                    .filter(t => t.employee === employee.name)
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6" id="categories-tab">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Tag className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const categorySpent = transactions
            .filter(t => t.category === category.name)
            .reduce((sum, t) => sum + t.amount, 0);
          const percentage = category.budget > 0 ? (categorySpent / category.budget) * 100 : 0;

          return (
            <div key={category.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-slate-400">{category.description}</p>
                  </div>
                </div>
                <span className={`badge ${category.isActive ? 'badge-success' : 'badge-error'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500 dark:text-slate-400">Budget Usage</span>
                  <span className="text-gray-900 dark:text-white">
                    ${categorySpent.toLocaleString()} / ${category.budget.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min(percentage, 100)}%`,
                      backgroundColor: category.color
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {percentage.toFixed(1)}% used
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  {transactions.filter(t => t.category === category.name).length} transactions
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6" id="reports-tab">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
        <button onClick={exportToCSV} className="btn btn-primary flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Total Expenses</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${getMonthlyExpenses().toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Transaction Count</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {transactions.filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7))).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Average Amount</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ${(getMonthlyExpenses() / Math.max(transactions.filter(t => t.date.startsWith(new Date().toISOString().slice(0, 7))).length, 1)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Overview</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Approved</span>
              <span className="font-semibold text-green-600">
                {transactions.filter(t => t.status === 'approved').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Pending</span>
              <span className="font-semibold text-yellow-600">
                {transactions.filter(t => t.status === 'pending').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-slate-400">Rejected</span>
              <span className="font-semibold text-red-600">
                {transactions.filter(t => t.status === 'rejected').length}
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Spenders</h3>
          <div className="space-y-3">
            {employees
              .map(emp => ({
                ...emp,
                totalSpent: transactions
                  .filter(t => t.employee === emp.name)
                  .reduce((sum, t) => sum + t.amount, 0)
              }))
              .sort((a, b) => b.totalSpent - a.totalSpent)
              .slice(0, 3)
              .map(emp => (
                <div key={emp.id} className="flex justify-between">
                  <span className="text-gray-500 dark:text-slate-400">{emp.name}</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${emp.totalSpent.toLocaleString()}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detailed Report</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Date</th>
                <th className="table-header">Employee</th>
                <th className="table-header">Category</th>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {transactions
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(transaction => (
                  <tr key={transaction.id}>
                    <td className="table-cell">{transaction.date}</td>
                    <td className="table-cell">{transaction.employee}</td>
                    <td className="table-cell">
                      <span className="badge badge-info">{transaction.category}</span>
                    </td>
                    <td className="table-cell">
                      <div className="max-w-xs truncate">{transaction.description}</div>
                    </td>
                    <td className="table-cell font-semibold">${transaction.amount.toLocaleString()}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        transaction.status === 'approved' ? 'badge-success' : 
                        transaction.status === 'rejected' ? 'badge-error' : 'badge-warning'
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
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6" id="settings-tab">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="input"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                className="input"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
          </div>
        </div>

        {/* Business Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Business Settings</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Default Spending Limit</label>
              <input
                type="number"
                value={settings.defaultSpendingLimit}
                onChange={(e) => setSettings(prev => ({ ...prev, defaultSpendingLimit: Number(e.target.value) }))}
                className="input"
                min="0"
                step="100"
              />
            </div>

            <div className="form-group">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.approvalRequired}
                  onChange={(e) => setSettings(prev => ({ ...prev, approvalRequired: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="form-label mb-0">Require approval for all transactions</span>
              </label>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Import Transactions</label>
              <div className="flex gap-2">
                <button onClick={downloadTemplate} className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
                <label className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="form-label">Export Data</label>
              <button onClick={exportToCSV} className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export All Data
              </button>
            </div>

            <div>
              <label className="form-label">Clear All Data</label>
              <button 
                onClick={clearAllData}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!showAddModal && !showEditModal && !showReceiptCapture) return null;

    const isEdit = showEditModal;
    const isReceiptCapture = showReceiptCapture;

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isReceiptCapture ? 'AI Receipt Scanner' :
               isEdit ? 'Edit Transaction' :
               activeTab === 'transactions' ? 'Add New Transaction' :
               activeTab === 'employees' ? 'Add New Employee' :
               'Add New Category'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            {isReceiptCapture ? (
              <div className="space-y-4">
                <div className="alert alert-info">
                  <Zap className="w-5 h-5" />
                  <p>Upload a receipt image and our AI will automatically extract transaction details for you!</p>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Upload Receipt Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReceiptUpload(file);
                    }}
                    className="input"
                  />
                </div>

                {isAiLoading && (
                  <div className="alert alert-info">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p>AI is analyzing your receipt...</p>
                  </div>
                )}

                {aiError && (
                  <div className="alert alert-error">
                    <AlertCircle className="w-5 h-5" />
                    <p>Error processing receipt: {aiError.message || 'Please try again'}</p>
                  </div>
                )}

                {aiResult && (
                  <div className="alert alert-success">
                    <CheckCircle className="w-5 h-5" />
                    <p>Receipt processed successfully! Transaction details have been filled automatically.</p>
                  </div>
                )}
              </div>
            ) : activeTab === 'transactions' || isEdit ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowReceiptCapture(true)}
                    className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Receipt with AI
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <input
                      type="text"
                      value={newTransaction.description || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
                      className="input"
                      placeholder="Enter transaction description"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Amount *</label>
                    <input
                      type="number"
                      value={newTransaction.amount || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className="input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      value={newTransaction.category || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Category</option>
                      {categories.filter(c => c.isActive).map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employee *</label>
                    <select
                      value={newTransaction.employee || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, employee: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Employee</option>
                      {employees.filter(e => e.isActive).map(employee => (
                        <option key={employee.id} value={employee.name}>{employee.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Vendor</label>
                    <input
                      type="text"
                      value={newTransaction.vendor || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, vendor: e.target.value }))}
                      className="input"
                      placeholder="Enter vendor name"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      value={newTransaction.paymentMethod || 'credit-card'}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, paymentMethod: e.target.value }))}
                      className="input"
                    >
                      <option value="credit-card">Credit Card</option>
                      <option value="debit-card">Debit Card</option>
                      <option value="company-card">Company Card</option>
                      <option value="cash">Cash</option>
                      <option value="expense-account">Expense Account</option>
                      <option value="personal-reimbursement">Personal (Reimbursement)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      value={newTransaction.date || ''}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, date: e.target.value }))}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      value={newTransaction.status || 'pending'}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, status: e.target.value as 'pending' | 'approved' | 'rejected' }))}
                      className="input"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : activeTab === 'employees' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    value={newEmployee.name || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter employee name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    value={newEmployee.email || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                    className="input"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    value={newEmployee.department || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, department: e.target.value }))}
                    className="input"
                    placeholder="Enter department"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input
                    type="text"
                    value={newEmployee.role || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                    className="input"
                    placeholder="Enter job role"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Spending Limit</label>
                  <input
                    type="number"
                    value={newEmployee.spendingLimit || ''}
                    onChange={(e) => setNewEmployee(prev => ({ ...prev, spendingLimit: Number(e.target.value) }))}
                    className="input"
                    placeholder="0.00"
                    min="0"
                    step="100"
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newEmployee.isActive !== false}
                      onChange={(e) => setNewEmployee(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="form-label mb-0">Active Employee</span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Category Name *</label>
                  <input
                    type="text"
                    value={newCategory.name || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    placeholder="Enter category name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Budget</label>
                  <input
                    type="number"
                    value={newCategory.budget || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="input"
                    placeholder="0.00"
                    min="0"
                    step="100"
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    value={newCategory.description || ''}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    className="input"
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    type="color"
                    value={newCategory.color || '#3B82F6'}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="input h-10"
                  />
                </div>

                <div className="form-group">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newCategory.isActive !== false}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="form-label mb-0">Active Category</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {!isReceiptCapture && (
            <div className="modal-footer">
              <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button
                onClick={
                  isEdit ? updateTransaction :
                  activeTab === 'transactions' ? addTransaction :
                  activeTab === 'employees' ? addEmployee :
                  addCategory
                }
                className="btn btn-primary flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isEdit ? 'Update' : 'Add'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="welcome_fallback">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Transaction Management System
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                Welcome, {currentUser.first_name}
              </span>
              <button
                onClick={logout}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition" id="generation_issue_fallback">
        <div className="container-wide">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'transactions', label: 'Transactions', icon: CreditCard },
              { id: 'employees', label: 'Employees', icon: Users },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as TabType)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
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
      <main className="container-wide py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'employees' && renderEmployees()}
        {activeTab === 'categories' && renderCategories()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modal */}
      {renderModal()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-wide">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;