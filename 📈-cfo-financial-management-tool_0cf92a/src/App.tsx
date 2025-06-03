import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Download, Upload, Settings, 
  User, Eye, EyeOff, Plus, Edit, Trash2, Search, Filter, FileText, 
  BarChart as ChartIcon, PieChart as PieChartIcon, Calculator, Target,
  Building, CreditCard, Wallet, Receipt, AlertTriangle, CheckCircle,
  ArrowUp, ArrowDown, Menu, X, Sun, Moon, Globe, Database
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface FinancialMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  target?: number;
}

interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: string;
  approved: boolean;
  department: string;
}

interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  department: string;
}

interface CashFlowData {
  month: string;
  inflow: number;
  outflow: number;
  net: number;
}

interface ProfitLossItem {
  category: string;
  amount: number;
  percentage: number;
}

interface ScenarioAnalysis {
  id: string;
  name: string;
  description: string;
  revenue: number;
  expenses: number;
  profit: number;
  probability: number;
}

type ViewMode = 'dashboard' | 'expenses' | 'budget' | 'cashflow' | 'reports' | 'scenarios' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cfo-dark-mode');
    return saved ? JSON.parse(saved) : false;
  });
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current-month');
  const [showAddExpense, setShowAddExpense] = useState<boolean>(false);
  const [showAddScenario, setShowAddScenario] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Sample data with realistic financial figures
  const [metrics, setMetrics] = useState<FinancialMetric[]>([
    { id: '1', name: 'Total Revenue', value: 2450000, change: 12.5, trend: 'up', target: 2500000 },
    { id: '2', name: 'Total Expenses', value: 1890000, change: -3.2, trend: 'down', target: 1800000 },
    { id: '3', name: 'Net Profit', value: 560000, change: 18.7, trend: 'up', target: 600000 },
    { id: '4', name: 'Cash Flow', value: 340000, change: 8.4, trend: 'up', target: 400000 },
    { id: '5', name: 'EBITDA', value: 680000, change: 15.2, trend: 'up', target: 700000 },
    { id: '6', name: 'Working Capital', value: 890000, change: 5.8, trend: 'up', target: 950000 }
  ]);

  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', category: 'Marketing', amount: 45000, description: 'Digital advertising campaign', date: '2024-01-15', approved: true, department: 'Marketing' },
    { id: '2', category: 'Operations', amount: 78000, description: 'Server infrastructure upgrade', date: '2024-01-20', approved: true, department: 'IT' },
    { id: '3', category: 'HR', amount: 32000, description: 'Recruitment agency fees', date: '2024-01-22', approved: false, department: 'HR' },
    { id: '4', category: 'Travel', amount: 12500, description: 'Client meeting in New York', date: '2024-01-25', approved: true, department: 'Sales' },
    { id: '5', category: 'Office', amount: 8900, description: 'Office supplies and equipment', date: '2024-01-28', approved: true, department: 'Operations' }
  ]);

  const [budgets, setBudgets] = useState<BudgetItem[]>([
    { id: '1', category: 'Marketing', allocated: 150000, spent: 89000, remaining: 61000, department: 'Marketing' },
    { id: '2', category: 'Operations', allocated: 200000, spent: 145000, remaining: 55000, department: 'Operations' },
    { id: '3', category: 'HR', allocated: 80000, spent: 56000, remaining: 24000, department: 'HR' },
    { id: '4', category: 'Travel', allocated: 45000, spent: 32000, remaining: 13000, department: 'Sales' },
    { id: '5', category: 'R&D', allocated: 300000, spent: 198000, remaining: 102000, department: 'Engineering' }
  ]);

  const cashFlowData: CashFlowData[] = [
    { month: 'Jan', inflow: 420000, outflow: 380000, net: 40000 },
    { month: 'Feb', inflow: 390000, outflow: 350000, net: 40000 },
    { month: 'Mar', inflow: 450000, outflow: 390000, net: 60000 },
    { month: 'Apr', inflow: 480000, outflow: 420000, net: 60000 },
    { month: 'May', inflow: 520000, outflow: 450000, net: 70000 },
    { month: 'Jun', inflow: 490000, outflow: 430000, net: 60000 }
  ];

  const profitLossData: ProfitLossItem[] = [
    { category: 'Revenue', amount: 2450000, percentage: 100 },
    { category: 'Cost of Goods Sold', amount: -980000, percentage: -40 },
    { category: 'Gross Profit', amount: 1470000, percentage: 60 },
    { category: 'Operating Expenses', amount: -890000, percentage: -36.3 },
    { category: 'EBITDA', amount: 580000, percentage: 23.7 },
    { category: 'Interest & Tax', amount: -120000, percentage: -4.9 },
    { category: 'Net Income', amount: 460000, percentage: 18.8 }
  ];

  const [scenarios, setScenarios] = useState<ScenarioAnalysis[]>([
    { id: '1', name: 'Best Case', description: 'Optimistic growth scenario', revenue: 2800000, expenses: 2100000, profit: 700000, probability: 25 },
    { id: '2', name: 'Most Likely', description: 'Conservative growth projection', revenue: 2500000, expenses: 1900000, profit: 600000, probability: 50 },
    { id: '3', name: 'Worst Case', description: 'Market downturn scenario', revenue: 2200000, expenses: 1800000, profit: 400000, probability: 25 }
  ]);

  const departments = ['Marketing', 'Operations', 'HR', 'Sales', 'Engineering', 'Finance', 'IT'];
  const expenseCategories = ['Marketing', 'Operations', 'HR', 'Travel', 'Office', 'R&D', 'Legal', 'Consulting'];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('cfo-expenses');
    const savedBudgets = localStorage.getItem('cfo-budgets');
    const savedMetrics = localStorage.getItem('cfo-metrics');
    const savedScenarios = localStorage.getItem('cfo-scenarios');

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (error) {
        console.error('Error loading expenses:', error);
      }
    }
    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch (error) {
        console.error('Error loading budgets:', error);
      }
    }
    if (savedMetrics) {
      try {
        setMetrics(JSON.parse(savedMetrics));
      } catch (error) {
        console.error('Error loading metrics:', error);
      }
    }
    if (savedScenarios) {
      try {
        setScenarios(JSON.parse(savedScenarios));
      } catch (error) {
        console.error('Error loading scenarios:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('cfo-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('cfo-budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('cfo-metrics', JSON.stringify(metrics));
  }, [metrics]);

  useEffect(() => {
    localStorage.setItem('cfo-scenarios', JSON.stringify(scenarios));
  }, [scenarios]);

  useEffect(() => {
    localStorage.setItem('cfo-dark-mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Handle escape key for modal closes
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddExpense(false);
        setShowAddScenario(false);
        setEditingExpense(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    setShowAddExpense(false);
  };

  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => prev.map(exp => exp.id === updatedExpense.id ? updatedExpense : exp));
    setEditingExpense(null);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id));
  };

  const addScenario = (scenario: Omit<ScenarioAnalysis, 'id'>) => {
    const newScenario: ScenarioAnalysis = {
      ...scenario,
      id: Date.now().toString()
    };
    setScenarios(prev => [newScenario, ...prev]);
    setShowAddScenario(false);
  };

  const deleteScenario = (id: string) => {
    setScenarios(prev => prev.filter(scenario => scenario.id !== id));
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = selectedDepartment === 'all' || expense.department === selectedDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [expenses, searchTerm, selectedDepartment]);

  const exportData = (type: 'expenses' | 'budgets' | 'metrics') => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'expenses':
        data = expenses;
        filename = 'expenses.csv';
        break;
      case 'budgets':
        data = budgets;
        filename = 'budgets.csv';
        break;
      case 'metrics':
        data = metrics;
        filename = 'metrics.csv';
        break;
    }

    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setExpenses([]);
      setBudgets([]);
      setScenarios([]);
      localStorage.removeItem('cfo-expenses');
      localStorage.removeItem('cfo-budgets');
      localStorage.removeItem('cfo-metrics');
      localStorage.removeItem('cfo-scenarios');
    }
  };

  const MenuItem: React.FC<{ 
    icon: React.ComponentType<{ className?: string }>; 
    label: string; 
    view: ViewMode; 
    id?: string;
  }> = ({ icon: Icon, label, view, id }) => (
    <button
      id={id}
      onClick={() => {
        setCurrentView(view);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
        currentView === view
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const MetricCard: React.FC<{ metric: FinancialMetric; id?: string }> = ({ metric, id }) => (
    <div id={id} className="card bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{metric.name}</h3>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
          metric.trend === 'up' ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900' : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900'
        }`}>
          {metric.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {formatPercentage(metric.change)}
        </div>
      </div>
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(metric.value)}</div>
        {metric.target && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Target: {formatCurrency(metric.target)}
          </div>
        )}
      </div>
      {metric.target && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{((metric.value / metric.target) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  const ExpenseForm: React.FC<{ 
    expense?: Expense | null; 
    onSubmit: (expense: Omit<Expense, 'id'>) => void; 
    onCancel: () => void 
  }> = ({ expense, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      category: expense?.category || '',
      amount: expense?.amount || 0,
      description: expense?.description || '',
      date: expense?.date || new Date().toISOString().split('T')[0],
      approved: expense?.approved || false,
      department: expense?.department || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.category && formData.amount > 0 && formData.description && formData.department) {
        onSubmit(formData);
      }
    };

    return (
      <div className="modal-backdrop" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {expense ? 'Edit Expense' : 'Add New Expense'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Category</label>
                <select 
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                >
                  <option value="">Select category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Department</label>
                <select 
                  className="input"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  required
                >
                  <option value="">Select department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Amount</label>
              <input 
                type="number" 
                className="input"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <input 
                type="text" 
                className="input"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Enter expense description"
              />
            </div>
            <div>
              <label className="form-label">Date</label>
              <input 
                type="date" 
                className="input"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="approved"
                checked={formData.approved}
                onChange={(e) => setFormData(prev => ({ ...prev, approved: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="approved" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Approved
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onCancel} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {expense ? 'Update' : 'Add'} Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ScenarioForm: React.FC<{ 
    onSubmit: (scenario: Omit<ScenarioAnalysis, 'id'>) => void; 
    onCancel: () => void 
  }> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
      name: '',
      description: '',
      revenue: 0,
      expenses: 0,
      profit: 0,
      probability: 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name && formData.description) {
        const profit = formData.revenue - formData.expenses;
        onSubmit({ ...formData, profit });
      }
    };

    return (
      <div className="modal-backdrop" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Scenario</h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Scenario Name</label>
              <input 
                type="text" 
                className="input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                placeholder="e.g., Aggressive Growth"
              />
            </div>
            <div>
              <label className="form-label">Description</label>
              <textarea 
                className="input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                placeholder="Describe this scenario..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Projected Revenue</label>
                <input 
                  type="number" 
                  className="input"
                  value={formData.revenue}
                  onChange={(e) => setFormData(prev => ({ ...prev, revenue: parseFloat(e.target.value) || 0 }))}
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div>
                <label className="form-label">Projected Expenses</label>
                <input 
                  type="number" 
                  className="input"
                  value={formData.expenses}
                  onChange={(e) => setFormData(prev => ({ ...prev, expenses: parseFloat(e.target.value) || 0 }))}
                  required
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            <div>
              <label className="form-label">Probability (%)</label>
              <input 
                type="number" 
                className="input"
                value={formData.probability}
                onChange={(e) => setFormData(prev => ({ ...prev, probability: parseFloat(e.target.value) || 0 }))}
                required
                min="0"
                max="100"
                step="5"
              />
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Projected Profit:</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(formData.revenue - formData.expenses)}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onCancel} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Scenario
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 id="welcome_fallback" className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Real-time overview of your financial performance</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select 
            className="input input-sm"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={() => exportData('metrics')}
            className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard 
            key={metric.id} 
            metric={metric} 
            id={index === 0 ? 'key-metrics' : undefined}
          />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="cash-flow-chart" className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cash Flow Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelStyle={{ color: '#374151' }}
              />
              <Area type="monotone" dataKey="net" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Budget vs Actual</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={budgets}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="category" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="allocated" fill="#E5E7EB" name="Allocated" />
              <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Expenses</h3>
          <button 
            onClick={() => setCurrentView('expenses')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {expenses.slice(0, 5).map(expense => (
            <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  expense.approved ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{expense.description}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {expense.category} • {expense.department}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{expense.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExpenses = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage company expenses</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            id="add-expense-btn"
            onClick={() => setShowAddExpense(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
          <button 
            onClick={() => exportData('expenses')}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search expenses..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="input"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <select className="input">
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="table-header text-left">Description</th>
                <th className="table-header text-left">Category</th>
                <th className="table-header text-left">Department</th>
                <th className="table-header text-right">Amount</th>
                <th className="table-header text-center">Status</th>
                <th className="table-header text-center">Date</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell">
                    <div className="font-medium text-gray-900 dark:text-white">{expense.description}</div>
                  </td>
                  <td className="table-cell text-gray-600 dark:text-gray-300">{expense.category}</td>
                  <td className="table-cell text-gray-600 dark:text-gray-300">{expense.department}</td>
                  <td className="table-cell text-right font-medium">{formatCurrency(expense.amount)}</td>
                  <td className="table-cell text-center">
                    <span className={`badge ${
                      expense.approved ? 'badge-success' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {expense.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="table-cell text-center text-gray-600 dark:text-gray-300">{expense.date}</td>
                  <td className="table-cell text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setEditingExpense(expense)}
                        className="p-1 text-blue-600 hover:text-blue-700"
                        title="Edit expense"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1 text-red-600 hover:text-red-700"
                        title="Delete expense"
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
        {filteredExpenses.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No expenses found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );

  const renderBudget = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Budget Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor budget allocation and spending</p>
        </div>
        <button 
          onClick={() => exportData('budgets')}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Allocated</h3>
            <Wallet className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(budgets.reduce((sum, budget) => sum + budget.allocated, 0))}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Spent</h3>
            <CreditCard className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(budgets.reduce((sum, budget) => sum + budget.spent, 0))}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Remaining</h3>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(budgets.reduce((sum, budget) => sum + budget.remaining, 0))}
          </div>
        </div>
      </div>

      {/* Budget Details */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Budget Breakdown</h3>
        <div className="space-y-6">
          {budgets.map(budget => {
            const percentage = (budget.spent / budget.allocated) * 100;
            const isOverBudget = percentage > 100;
            
            return (
              <div key={budget.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{budget.category}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{budget.department}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.allocated)}
                    </div>
                    <div className={`text-sm ${
                      isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {formatCurrency(budget.remaining)} remaining
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
                    <span>Spent: {percentage.toFixed(1)}%</span>
                    {isOverBudget && (
                      <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Over budget
                      </span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                    {isOverBudget && (
                      <div 
                        className="h-3 bg-red-300 rounded-r-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(percentage - 100, 100)}%`,
                          marginTop: '-12px',
                          marginLeft: '100%'
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderCashFlow = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Cash Flow Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor cash inflows and outflows</p>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Cash Flow</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="month" className="text-sm" />
            <YAxis className="text-sm" />
            <Tooltip 
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              labelStyle={{ color: '#374151' }}
            />
            <Line type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={3} name="Inflow" />
            <Line type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={3} name="Outflow" />
            <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={3} name="Net Cash Flow" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cash Flow Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Inflow</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(cashFlowData.reduce((sum, data) => sum + data.inflow, 0))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 6 months
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Outflow</h3>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(cashFlowData.reduce((sum, data) => sum + data.outflow, 0))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 6 months
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Cash Flow</h3>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(cashFlowData.reduce((sum, data) => sum + data.net, 0))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 6 months
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive financial analysis and reports</p>
        </div>
      </div>

      {/* Profit & Loss Statement */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Profit & Loss Statement</h3>
        <div className="space-y-4">
          {profitLossData.map((item, index) => (
            <div key={index} className={`flex items-center justify-between py-3 px-4 rounded-lg ${
              item.category === 'Revenue' || item.category === 'Gross Profit' || item.category === 'EBITDA' || item.category === 'Net Income'
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-gray-50 dark:bg-gray-700'
            }`}>
              <div className="font-medium text-gray-900 dark:text-white">{item.category}</div>
              <div className="flex items-center gap-4">
                <div className={`font-medium ${
                  item.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(Math.abs(item.amount))}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400 w-16 text-right">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={budgets.map(budget => ({
                  name: budget.category,
                  value: budget.spent
                }))}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {budgets.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Department Spending</h3>
          <div className="space-y-3">
            {departments.map(dept => {
              const deptExpenses = expenses.filter(exp => exp.department === dept);
              const total = deptExpenses.reduce((sum, exp) => sum + exp.amount, 0);
              const maxSpending = Math.max(...departments.map(d => 
                expenses.filter(exp => exp.department === d).reduce((sum, exp) => sum + exp.amount, 0)
              ));
              const percentage = maxSpending > 0 ? (total / maxSpending) * 100 : 0;
              
              return (
                <div key={dept} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{dept}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(total)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderScenarios = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Scenario Analysis</h1>
          <p className="text-gray-600 dark:text-gray-400">Plan and analyze different business scenarios</p>
        </div>
        <button 
          onClick={() => setShowAddScenario(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Scenario
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map(scenario => (
          <div key={scenario.id} className="card border-l-4 border-blue-500">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{scenario.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{scenario.description}</p>
              </div>
              <button 
                onClick={() => deleteScenario(scenario.id)}
                className="text-gray-400 hover:text-red-600"
                title="Delete scenario"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue:</span>
                <span className="font-medium text-green-600">{formatCurrency(scenario.revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Expenses:</span>
                <span className="font-medium text-red-600">{formatCurrency(scenario.expenses)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Profit:</span>
                <span className={`font-bold ${
                  scenario.profit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(scenario.profit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Probability:</span>
                <span className="font-medium text-blue-600">{scenario.probability}%</span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Confidence Level</div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scenario.probability}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {scenarios.length === 0 && (
        <div className="card text-center py-12">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Scenarios Created</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Create your first financial scenario to start planning and analysis.
          </p>
          <button 
            onClick={() => setShowAddScenario(true)}
            className="btn btn-primary"
          >
            Add Your First Scenario
          </button>
        </div>
      )}

      {/* Scenario Comparison Chart */}
      {scenarios.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Scenario Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={scenarios}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
              <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your application preferences and data</p>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Dark Mode</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</div>
            </div>
            <button 
              id="theme-toggle"
              onClick={() => setDarkMode(!darkMode)}
              className="theme-toggle"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb" />
              {darkMode ? (
                <Moon className="absolute left-1 top-1 w-3 h-3 text-white" />
              ) : (
                <Sun className="absolute right-1 top-1 w-3 h-3 text-yellow-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5" />
          Data Management
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => exportData('expenses')}
              className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Expenses
            </button>
            <button 
              onClick={() => exportData('budgets')}
              className="btn bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Budgets
            </button>
            <button 
              onClick={() => exportData('metrics')}
              className="btn bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Metrics
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="mb-3">
              <div className="font-medium text-gray-900 dark:text-white">Danger Zone</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Irreversible actions</div>
            </div>
            <button 
              onClick={clearAllData}
              className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Usage Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{expenses.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{budgets.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Budget Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{scenarios.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Scenarios</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{departments.length}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Departments</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return renderDashboard();
      case 'expenses': return renderExpenses();
      case 'budget': return renderBudget();
      case 'cashflow': return renderCashFlow();
      case 'reports': return renderReports();
      case 'scenarios': return renderScenarios();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">CFO Dashboard</h1>
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">CFO Dashboard</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Financial Control Center</div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <MenuItem icon={ChartIcon} label="Dashboard" view="dashboard" id="dashboard-nav" />
              <MenuItem icon={Receipt} label="Expenses" view="expenses" />
              <MenuItem icon={Wallet} label="Budget" view="budget" />
              <MenuItem icon={TrendingUp} label="Cash Flow" view="cashflow" />
              <MenuItem icon={FileText} label="Reports" view="reports" />
              <MenuItem icon={Target} label="Scenarios" view="scenarios" />
              <MenuItem icon={Settings} label="Settings" view="settings" />
            </nav>

            {/* User Profile */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">CFO User</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">Chief Financial Officer</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <main className="p-4 lg:p-8">
            {renderContent()}
          </main>

          {/* Footer */}
          <footer className="border-t border-gray-200 dark:border-gray-700 px-4 lg:px-8 py-4">
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </div>
          </footer>
        </div>
      </div>

      {/* Modals */}
      {showAddExpense && (
        <ExpenseForm 
          onSubmit={addExpense}
          onCancel={() => setShowAddExpense(false)}
        />
      )}

      {editingExpense && (
        <ExpenseForm 
          expense={editingExpense}
          onSubmit={updateExpense}
          onCancel={() => setEditingExpense(null)}
        />
      )}

      {showAddScenario && (
        <ScenarioForm 
          onSubmit={addScenario}
          onCancel={() => setShowAddScenario(false)}
        />
      )}
    </div>
  );
};

export default App;