import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart as LucidePieChart, 
  Calculator, Target, Shield, Calendar, Download, Upload, Settings, 
  Plus, Edit, Trash2, Search, Filter, Eye, EyeOff, Menu, X, 
  Building, Wallet, CreditCard, Receipt, FileText, ChevronDown,
  Sun, Moon, Home, Users, Package, Globe, AlertTriangle, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import styles from './styles/styles.module.css';

interface BudgetItem {
  id: string;
  category: string;
  planned: number;
  actual: number;
  variance: number;
  variancePercent: number;
  department: string;
  quarter: string;
}

interface CashFlowItem {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  cumulativeFlow: number;
}

interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  category: 'profitability' | 'liquidity' | 'efficiency' | 'leverage';
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: string;
  department: string;
}

interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'bonds' | 'real-estate' | 'commodities';
  amount: number;
  currentValue: number;
  roi: number;
  riskLevel: 'low' | 'medium' | 'high';
  purchaseDate: string;
}

interface RiskAssessment {
  id: string;
  riskType: string;
  probability: number;
  impact: number;
  riskScore: number;
  mitigation: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored';
  owner: string;
}

type TabType = 'dashboard' | 'budget' | 'cashflow' | 'expenses' | 'investments' | 'risks' | 'reports' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [cashFlowData, setCashFlowData] = useState<CashFlowItem[]>([]);
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetric[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currency, setCurrency] = useState('USD');
  const [fiscalYear, setFiscalYear] = useState('2024');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load data from localStorage
    const savedBudget = localStorage.getItem('cfo_budget_items');
    const savedCashFlow = localStorage.getItem('cfo_cashflow_data');
    const savedKPIs = localStorage.getItem('cfo_kpi_metrics');
    const savedExpenses = localStorage.getItem('cfo_expenses');
    const savedInvestments = localStorage.getItem('cfo_investments');
    const savedRisks = localStorage.getItem('cfo_risk_assessments');
    const savedSettings = localStorage.getItem('cfo_settings');
    const savedDarkMode = localStorage.getItem('cfo_dark_mode');

    if (savedBudget) setBudgetItems(JSON.parse(savedBudget));
    if (savedCashFlow) setCashFlowData(JSON.parse(savedCashFlow));
    if (savedKPIs) setKpiMetrics(JSON.parse(savedKPIs));
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedInvestments) setInvestments(JSON.parse(savedInvestments));
    if (savedRisks) setRiskAssessments(JSON.parse(savedRisks));
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setCurrency(settings.currency || 'USD');
      setFiscalYear(settings.fiscalYear || '2024');
    }
    if (savedDarkMode) {
      const darkMode = JSON.parse(savedDarkMode);
      setIsDarkMode(darkMode);
      if (darkMode) document.documentElement.classList.add('dark');
    }

    // Initialize with sample data if empty
    initializeSampleData();
  }, []);

  useEffect(() => {
    // Save data to localStorage whenever state changes
    localStorage.setItem('cfo_budget_items', JSON.stringify(budgetItems));
    localStorage.setItem('cfo_cashflow_data', JSON.stringify(cashFlowData));
    localStorage.setItem('cfo_kpi_metrics', JSON.stringify(kpiMetrics));
    localStorage.setItem('cfo_expenses', JSON.stringify(expenses));
    localStorage.setItem('cfo_investments', JSON.stringify(investments));
    localStorage.setItem('cfo_risk_assessments', JSON.stringify(riskAssessments));
    localStorage.setItem('cfo_settings', JSON.stringify({ currency, fiscalYear }));
    localStorage.setItem('cfo_dark_mode', JSON.stringify(isDarkMode));
  }, [budgetItems, cashFlowData, kpiMetrics, expenses, investments, riskAssessments, currency, fiscalYear, isDarkMode]);

  const initializeSampleData = () => {
    if (budgetItems.length === 0) {
      const sampleBudget: BudgetItem[] = [
        { id: '1', category: 'Marketing', planned: 500000, actual: 475000, variance: -25000, variancePercent: -5, department: 'Marketing', quarter: 'Q1' },
        { id: '2', category: 'Operations', planned: 1200000, actual: 1250000, variance: 50000, variancePercent: 4.2, department: 'Operations', quarter: 'Q1' },
        { id: '3', category: 'Technology', planned: 800000, actual: 820000, variance: 20000, variancePercent: 2.5, department: 'IT', quarter: 'Q1' },
        { id: '4', category: 'Human Resources', planned: 300000, actual: 285000, variance: -15000, variancePercent: -5, department: 'HR', quarter: 'Q1' }
      ];
      setBudgetItems(sampleBudget);
    }

    if (cashFlowData.length === 0) {
      const sampleCashFlow: CashFlowItem[] = [
        { month: 'Jan', inflow: 2500000, outflow: 2200000, netFlow: 300000, cumulativeFlow: 300000 },
        { month: 'Feb', inflow: 2600000, outflow: 2300000, netFlow: 300000, cumulativeFlow: 600000 },
        { month: 'Mar', inflow: 2800000, outflow: 2400000, netFlow: 400000, cumulativeFlow: 1000000 },
        { month: 'Apr', inflow: 2700000, outflow: 2350000, netFlow: 350000, cumulativeFlow: 1350000 },
        { month: 'May', inflow: 2900000, outflow: 2500000, netFlow: 400000, cumulativeFlow: 1750000 },
        { month: 'Jun', inflow: 3100000, outflow: 2600000, netFlow: 500000, cumulativeFlow: 2250000 }
      ];
      setCashFlowData(sampleCashFlow);
    }

    if (kpiMetrics.length === 0) {
      const sampleKPIs: KPIMetric[] = [
        { id: '1', name: 'Revenue Growth', value: 15.2, target: 12, unit: '%', trend: 'up', change: 3.2, category: 'profitability' },
        { id: '2', name: 'Profit Margin', value: 22.5, target: 20, unit: '%', trend: 'up', change: 2.5, category: 'profitability' },
        { id: '3', name: 'Current Ratio', value: 2.1, target: 2.0, unit: '', trend: 'stable', change: 0.1, category: 'liquidity' },
        { id: '4', name: 'ROI', value: 18.7, target: 15, unit: '%', trend: 'up', change: 3.7, category: 'efficiency' },
        { id: '5', name: 'Debt-to-Equity', value: 0.35, target: 0.4, unit: '', trend: 'down', change: -0.05, category: 'leverage' }
      ];
      setKpiMetrics(sampleKPIs);
    }

    if (expenses.length === 0) {
      const sampleExpenses: Expense[] = [
        { id: '1', description: 'Office Supplies', amount: 2500, category: 'Operations', date: '2024-01-15', status: 'approved', submittedBy: 'John Smith', department: 'Operations' },
        { id: '2', description: 'Marketing Campaign', amount: 15000, category: 'Marketing', date: '2024-01-20', status: 'pending', submittedBy: 'Sarah Johnson', department: 'Marketing' },
        { id: '3', description: 'Software Licenses', amount: 8500, category: 'Technology', date: '2024-01-18', status: 'approved', submittedBy: 'Mike Davis', department: 'IT' }
      ];
      setExpenses(sampleExpenses);
    }

    if (investments.length === 0) {
      const sampleInvestments: Investment[] = [
        { id: '1', name: 'Tech Growth Fund', type: 'stocks', amount: 500000, currentValue: 575000, roi: 15, riskLevel: 'medium', purchaseDate: '2023-06-15' },
        { id: '2', name: 'Corporate Bonds', type: 'bonds', amount: 1000000, currentValue: 1050000, roi: 5, riskLevel: 'low', purchaseDate: '2023-08-20' },
        { id: '3', name: 'Commercial Real Estate', type: 'real-estate', amount: 2000000, currentValue: 2200000, roi: 10, riskLevel: 'medium', purchaseDate: '2023-03-10' }
      ];
      setInvestments(sampleInvestments);
    }

    if (riskAssessments.length === 0) {
      const sampleRisks: RiskAssessment[] = [
        { id: '1', riskType: 'Market Volatility', probability: 70, impact: 80, riskScore: 56, mitigation: 'Diversify investment portfolio', status: 'assessed', owner: 'Investment Team' },
        { id: '2', riskType: 'Currency Fluctuation', probability: 60, impact: 60, riskScore: 36, mitigation: 'Implement hedging strategies', status: 'mitigated', owner: 'Treasury Team' },
        { id: '3', riskType: 'Interest Rate Changes', probability: 80, impact: 70, riskScore: 56, mitigation: 'Review debt structure', status: 'monitored', owner: 'Finance Team' }
      ];
      setRiskAssessments(sampleRisks);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formatCurrency = (amount: number): string => {
    const symbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CAD: 'C$'
    };
    return `${symbols[currency] || '$'}${amount.toLocaleString()}`;
  };

  const handleAddBudgetItem = (item: Partial<BudgetItem>) => {
    const newItem: BudgetItem = {
      id: Date.now().toString(),
      category: item.category || '',
      planned: item.planned || 0,
      actual: item.actual || 0,
      variance: (item.actual || 0) - (item.planned || 0),
      variancePercent: ((item.actual || 0) - (item.planned || 0)) / (item.planned || 1) * 100,
      department: item.department || '',
      quarter: item.quarter || 'Q1'
    };
    setBudgetItems([...budgetItems, newItem]);
    setShowBudgetModal(false);
  };

  const handleEditBudgetItem = (item: BudgetItem) => {
    const updatedItems = budgetItems.map(budget => 
      budget.id === item.id ? {
        ...item,
        variance: item.actual - item.planned,
        variancePercent: (item.actual - item.planned) / item.planned * 100
      } : budget
    );
    setBudgetItems(updatedItems);
    setShowBudgetModal(false);
    setEditingItem(null);
  };

  const handleDeleteBudgetItem = (id: string) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const handleAddExpense = (expense: Partial<Expense>) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      description: expense.description || '',
      amount: expense.amount || 0,
      category: expense.category || '',
      date: expense.date || new Date().toISOString().split('T')[0],
      status: expense.status || 'pending',
      submittedBy: expense.submittedBy || '',
      department: expense.department || ''
    };
    setExpenses([...expenses, newExpense]);
    setShowExpenseModal(false);
  };

  const handleApproveExpense = (id: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, status: 'approved' as const } : expense
    ));
  };

  const handleRejectExpense = (id: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, status: 'rejected' as const } : expense
    ));
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setBudgetItems([]);
      setCashFlowData([]);
      setKpiMetrics([]);
      setExpenses([]);
      setInvestments([]);
      setRiskAssessments([]);
      localStorage.clear();
    }
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0080'];

  const NavItem: React.FC<{ id: string; icon: React.ReactNode; label: string; tab: TabType; count?: number }> = ({ id, icon, label, tab, count }) => (
    <button
      id={id}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg ${
        activeTab === tab 
          ? 'bg-blue-600 text-white' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={() => setActiveTab(tab)}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="badge badge-info text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </button>
  );

  const DashboardView: React.FC = () => {
    const totalBudget = budgetItems.reduce((sum, item) => sum + item.planned, 0);
    const totalActual = budgetItems.reduce((sum, item) => sum + item.actual, 0);
    const totalVariance = totalActual - totalBudget;
    const pendingExpenses = expenses.filter(e => e.status === 'pending').length;
    const totalInvestmentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const highRisks = riskAssessments.filter(r => r.riskScore > 50).length;

    return (
      <div className="space-y-6" id="dashboard-overview">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h1>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => exportToCSV(kpiMetrics, 'financial_summary')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-overview">
          <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="stat-title text-blue-100">Total Budget</div>
            <div className="stat-value">{formatCurrency(totalBudget)}</div>
            <div className="stat-desc text-blue-100">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Planned for {fiscalYear}
            </div>
          </div>
          
          <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="stat-title text-green-100">Actual Spend</div>
            <div className="stat-value">{formatCurrency(totalActual)}</div>
            <div className="stat-desc text-green-100">
              {totalVariance >= 0 ? (
                <TrendingUp className="w-4 h-4 inline mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 inline mr-1" />
              )}
              {formatCurrency(Math.abs(totalVariance))} variance
            </div>
          </div>
          
          <div className="stat-card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="stat-title text-purple-100">Investment Value</div>
            <div className="stat-value">{formatCurrency(totalInvestmentValue)}</div>
            <div className="stat-desc text-purple-100">
              <Target className="w-4 h-4 inline mr-1" />
              Portfolio total
            </div>
          </div>
          
          <div className="stat-card bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="stat-title text-orange-100">Pending Items</div>
            <div className="stat-value">{pendingExpenses + highRisks}</div>
            <div className="stat-desc text-orange-100">
              <AlertTriangle className="w-4 h-4 inline mr-1" />
              Require attention
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card" id="budget-variance-chart">
            <h3 className="text-lg font-semibold mb-4">Budget vs Actual</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={budgetItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="planned" fill="#8884d8" name="Planned" />
                <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card" id="cashflow-trend-chart">
            <h3 className="text-lg font-semibold mb-4">Cash Flow Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="netFlow" stroke="#8884d8" strokeWidth={2} name="Net Flow" />
                <Line type="monotone" dataKey="cumulativeFlow" stroke="#82ca9d" strokeWidth={2} name="Cumulative" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card" id="recent-activity">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    expense.status === 'approved' ? 'bg-green-500' :
                    expense.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {expense.submittedBy} • {expense.department}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(expense.amount)}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{expense.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const BudgetView: React.FC = () => {
    const filteredBudget = budgetItems.filter(item => 
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6" id="budget-management">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => setShowBudgetModal(true)}
              id="add-budget-item"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Budget Item
            </button>
            <button 
              className="btn bg-gray-500 text-white hover:bg-gray-600"
              onClick={() => exportToCSV(budgetItems, 'budget_report')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search budget items..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container" id="budget-table">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Category</th>
                <th className="table-header">Department</th>
                <th className="table-header">Planned</th>
                <th className="table-header">Actual</th>
                <th className="table-header">Variance</th>
                <th className="table-header">Variance %</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredBudget.map((item) => (
                <tr key={item.id}>
                  <td className="table-cell font-medium">{item.category}</td>
                  <td className="table-cell">{item.department}</td>
                  <td className="table-cell">{formatCurrency(item.planned)}</td>
                  <td className="table-cell">{formatCurrency(item.actual)}</td>
                  <td className={`table-cell font-medium ${
                    item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(item.variance)}
                  </td>
                  <td className={`table-cell font-medium ${
                    item.variancePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {item.variancePercent.toFixed(1)}%
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                        onClick={() => {
                          setEditingItem(item);
                          setShowBudgetModal(true);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                        onClick={() => handleDeleteBudgetItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const CashFlowView: React.FC = () => {
    return (
      <div className="space-y-6" id="cashflow-analysis">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cash Flow Analysis</h1>
          <button 
            className="btn btn-primary"
            onClick={() => exportToCSV(cashFlowData, 'cashflow_report')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Area type="monotone" dataKey="inflow" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Inflow" />
                <Area type="monotone" dataKey="outflow" stackId="1" stroke="#ff7300" fill="#ff7300" name="Outflow" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Net Cash Flow Trend</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line type="monotone" dataKey="netFlow" stroke="#8884d8" strokeWidth={3} name="Net Flow" />
                <Line type="monotone" dataKey="cumulativeFlow" stroke="#82ca9d" strokeWidth={2} name="Cumulative" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Cash Flow Summary</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Month</th>
                  <th className="table-header">Inflow</th>
                  <th className="table-header">Outflow</th>
                  <th className="table-header">Net Flow</th>
                  <th className="table-header">Cumulative</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {cashFlowData.map((item) => (
                  <tr key={item.month}>
                    <td className="table-cell font-medium">{item.month}</td>
                    <td className="table-cell text-green-600">{formatCurrency(item.inflow)}</td>
                    <td className="table-cell text-red-600">{formatCurrency(item.outflow)}</td>
                    <td className={`table-cell font-medium ${
                      item.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.netFlow)}
                    </td>
                    <td className="table-cell font-semibold">{formatCurrency(item.cumulativeFlow)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const ExpensesView: React.FC = () => {
    const filteredExpenses = expenses.filter(expense => 
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.submittedBy.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = expenses.filter(e => e.status === 'pending').length;
    const approvedCount = expenses.filter(e => e.status === 'approved').length;
    const rejectedCount = expenses.filter(e => e.status === 'rejected').length;

    return (
      <div className="space-y-6" id="expense-management">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Management</h1>
          <div className="flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => setShowExpenseModal(true)}
              id="add-expense"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </button>
            <button 
              className="btn bg-gray-500 text-white hover:bg-gray-600"
              onClick={() => exportToCSV(expenses, 'expenses_report')}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="stat-card bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
            <div className="stat-title text-yellow-100">Pending</div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-desc text-yellow-100">Awaiting approval</div>
          </div>
          <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
            <div className="stat-title text-green-100">Approved</div>
            <div className="stat-value">{approvedCount}</div>
            <div className="stat-desc text-green-100">Ready for payment</div>
          </div>
          <div className="stat-card bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="stat-title text-red-100">Rejected</div>
            <div className="stat-value">{rejectedCount}</div>
            <div className="stat-desc text-red-100">Require revision</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container" id="expense-table">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Description</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Category</th>
                <th className="table-header">Submitted By</th>
                <th className="table-header">Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="table-cell font-medium">{expense.description}</td>
                  <td className="table-cell">{formatCurrency(expense.amount)}</td>
                  <td className="table-cell">{expense.category}</td>
                  <td className="table-cell">{expense.submittedBy}</td>
                  <td className="table-cell">{expense.date}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      expense.status === 'approved' ? 'badge-success' :
                      expense.status === 'rejected' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {expense.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {expense.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm badge-success text-white hover:bg-green-600"
                          onClick={() => handleApproveExpense(expense.id)}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                          onClick={() => handleRejectExpense(expense.id)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const SettingsView: React.FC = () => {
    return (
      <div className="space-y-6" id="settings-page">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select 
                  className="input"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Fiscal Year</label>
                <select 
                  className="input"
                  value={fiscalYear}
                  onChange={(e) => setFiscalYear(e.target.value)}
                >
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Theme</label>
                <div className="flex items-center gap-3">
                  <Sun className="w-4 h-4" />
                  <button 
                    className="theme-toggle"
                    onClick={toggleDarkMode}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    id="theme-toggle"
                  >
                    <span className="theme-toggle-thumb"></span>
                  </button>
                  <Moon className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Import Data</label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    className="input"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Handle file import logic here
                        console.log('Importing file:', file.name);
                      }
                    }}
                  />
                  <button className="btn bg-blue-500 text-white hover:bg-blue-600">
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div>
                <label className="form-label">Export All Data</label>
                <button 
                  className="btn bg-green-500 text-white hover:bg-green-600 w-full"
                  onClick={() => {
                    const allData = {
                      budgetItems,
                      cashFlowData,
                      kpiMetrics,
                      expenses,
                      investments,
                      riskAssessments,
                      settings: { currency, fiscalYear }
                    };
                    exportToCSV([allData], 'complete_financial_data');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Complete Dataset
                </button>
              </div>
              
              <div>
                <label className="form-label">Clear All Data</label>
                <button 
                  className="btn bg-red-500 text-white hover:bg-red-600 w-full"
                  onClick={clearAllData}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const BudgetModal: React.FC = () => {
    const [formData, setFormData] = useState({
      category: editingItem?.category || '',
      planned: editingItem?.planned || '',
      actual: editingItem?.actual || '',
      department: editingItem?.department || '',
      quarter: editingItem?.quarter || 'Q1'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const budgetData = {
        ...formData,
        planned: Number(formData.planned),
        actual: Number(formData.actual)
      };
      
      if (editingItem) {
        handleEditBudgetItem({ ...editingItem, ...budgetData });
      } else {
        handleAddBudgetItem(budgetData);
      }
    };

    return (
      <div className="modal-backdrop" onClick={() => { setShowBudgetModal(false); setEditingItem(null); }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingItem ? 'Edit Budget Item' : 'Add Budget Item'}
            </h3>
            <button 
              className="text-gray-400 hover:text-gray-500"
              onClick={() => { setShowBudgetModal(false); setEditingItem(null); }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Planned Amount</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.planned}
                    onChange={(e) => setFormData({ ...formData, planned: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Actual Amount</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.actual}
                    onChange={(e) => setFormData({ ...formData, actual: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Quarter</label>
                <select
                  className="input"
                  value={formData.quarter}
                  onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                >
                  <option value="Q1">Q1</option>
                  <option value="Q2">Q2</option>
                  <option value="Q3">Q3</option>
                  <option value="Q4">Q4</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => { setShowBudgetModal(false); setEditingItem(null); }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update' : 'Add'} Budget Item
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ExpenseModal: React.FC = () => {
    const [formData, setFormData] = useState({
      description: '',
      amount: '',
      category: '',
      submittedBy: '',
      department: '',
      date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddExpense({
        ...formData,
        amount: Number(formData.amount)
      });
      setFormData({
        description: '',
        amount: '',
        category: '',
        submittedBy: '',
        department: '',
        date: new Date().toISOString().split('T')[0]
      });
    };

    return (
      <div className="modal-backdrop" onClick={() => setShowExpenseModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Expense</h3>
            <button 
              className="text-gray-400 hover:text-gray-500"
              onClick={() => setShowExpenseModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="mt-4">
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="input"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Operations">Operations</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Technology">Technology</option>
                    <option value="HR">Human Resources</option>
                    <option value="Travel">Travel</option>
                    <option value="Office">Office Supplies</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Submitted By</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.submittedBy}
                    onChange={(e) => setFormData({ ...formData, submittedBy: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                onClick={() => setShowExpenseModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'budget':
        return <BudgetView />;
      case 'cashflow':
        return <CashFlowView />;
      case 'expenses':
        return <ExpensesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  // Handle ESC key for modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowBudgetModal(false);
        setShowExpenseModal(false);
        setShowInvestmentModal(false);
        setShowRiskModal(false);
        setEditingItem(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition" id="welcome_fallback">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2" id="generation_issue_fallback">
            <Building className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">CFO Dashboard</h1>
          </div>
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavItem 
            id="nav-dashboard"
            icon={<Home className="w-5 h-5" />} 
            label="Dashboard" 
            tab="dashboard" 
          />
          <NavItem 
            id="nav-budget"
            icon={<Calculator className="w-5 h-5" />} 
            label="Budget" 
            tab="budget" 
            count={budgetItems.length}
          />
          <NavItem 
            id="nav-cashflow"
            icon={<TrendingUp className="w-5 h-5" />} 
            label="Cash Flow" 
            tab="cashflow" 
          />
          <NavItem 
            id="nav-expenses"
            icon={<Receipt className="w-5 h-5" />} 
            label="Expenses" 
            tab="expenses" 
            count={expenses.filter(e => e.status === 'pending').length}
          />
          <NavItem 
            id="nav-settings"
            icon={<Settings className="w-5 h-5" />} 
            label="Settings" 
            tab="settings" 
          />
        </nav>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Fiscal Year: {fiscalYear} | Currency: {currency}
              </div>
              
              <button 
                className="theme-toggle"
                onClick={toggleDarkMode}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      {showBudgetModal && <BudgetModal />}
      {showExpenseModal && <ExpenseModal />}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 lg:ml-64">
        <div className="px-4 lg:px-8">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;