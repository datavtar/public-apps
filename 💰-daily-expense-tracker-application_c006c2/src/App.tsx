import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Plus, Edit, Trash2, Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, Download, Upload, Sun, Moon, FileText, Target, Wallet } from 'lucide-react';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  paymentMethod: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
}

interface Budget {
  category: string;
  budgetAmount: number;
  spentAmount: number;
}

type ViewMode = 'list' | 'chart' | 'budget';
type ChartType = 'pie' | 'bar' | 'line';
type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Food & Dining', color: '#FF6B6B', budget: 500 },
    { id: '2', name: 'Transportation', color: '#4ECDC4', budget: 300 },
    { id: '3', name: 'Shopping', color: '#45B7D1', budget: 400 },
    { id: '4', name: 'Entertainment', color: '#96CEB4', budget: 200 },
    { id: '5', name: 'Bills & Utilities', color: '#FFEAA7', budget: 600 },
    { id: '6', name: 'Healthcare', color: '#DDA0DD', budget: 250 },
    { id: '7', name: 'Education', color: '#FFB347', budget: 150 },
    { id: '8', name: 'Others', color: '#C7CEEA', budget: 100 }
  ]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'title'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'];

  // Initialize data from localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedCategories = localStorage.getItem('categories');
    const savedDarkMode = localStorage.getItem('darkMode');

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (error) {
        console.error('Error parsing saved expenses:', error);
        // Add sample data if parsing fails
        const sampleExpenses: Expense[] = [
          { id: '1', title: 'Lunch at Restaurant', amount: 25.50, category: 'Food & Dining', date: '2024-12-15', description: 'Business lunch meeting', paymentMethod: 'Credit Card' },
          { id: '2', title: 'Gas Station', amount: 45.00, category: 'Transportation', date: '2024-12-14', description: 'Weekly fuel refill', paymentMethod: 'Debit Card' },
          { id: '3', title: 'Grocery Shopping', amount: 85.30, category: 'Shopping', date: '2024-12-13', description: 'Weekly grocery shopping', paymentMethod: 'Cash' },
          { id: '4', title: 'Movie Tickets', amount: 18.00, category: 'Entertainment', date: '2024-12-12', description: 'Weekend movie with friends', paymentMethod: 'UPI' },
          { id: '5', title: 'Electricity Bill', amount: 120.00, category: 'Bills & Utilities', date: '2024-12-11', description: 'Monthly electricity payment', paymentMethod: 'Net Banking' }
        ];
        setExpenses(sampleExpenses);
      }
    } else {
      // Add sample data if no saved data
      const sampleExpenses: Expense[] = [
        { id: '1', title: 'Lunch at Restaurant', amount: 25.50, category: 'Food & Dining', date: '2024-12-15', description: 'Business lunch meeting', paymentMethod: 'Credit Card' },
        { id: '2', title: 'Gas Station', amount: 45.00, category: 'Transportation', date: '2024-12-14', description: 'Weekly fuel refill', paymentMethod: 'Debit Card' },
        { id: '3', title: 'Grocery Shopping', amount: 85.30, category: 'Shopping', date: '2024-12-13', description: 'Weekly grocery shopping', paymentMethod: 'Cash' },
        { id: '4', title: 'Movie Tickets', amount: 18.00, category: 'Entertainment', date: '2024-12-12', description: 'Weekend movie with friends', paymentMethod: 'UPI' },
        { id: '5', title: 'Electricity Bill', amount: 120.00, category: 'Bills & Utilities', date: '2024-12-11', description: 'Monthly electricity payment', paymentMethod: 'Net Banking' }
      ];
      setExpenses(sampleExpenses);
    }

    if (savedCategories) {
      try {
        setCategories(JSON.parse(savedCategories));
      } catch (error) {
        console.error('Error parsing saved categories:', error);
      }
    }

    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString()
    };
    setExpenses(prev => [newExpense, ...prev]);
    closeModal();
  };

  const updateExpense = (id: string, expenseData: Omit<Expense, 'id'>) => {
    setExpenses(prev => prev.map(expense => 
      expense.id === id ? { ...expenseData, id } : expense
    ));
    closeModal();
  };

  const deleteExpense = (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    }
  };

  const editExpense = (expense: Expense) => {
    setEditingExpense(expense);
    openModal();
  };

  // Filter expenses based on search, category, payment method, and time
  const filteredExpenses = useMemo(() => {
    let filtered = expenses.filter(expense => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
      const matchesPaymentMethod = selectedPaymentMethod === 'all' || expense.paymentMethod === selectedPaymentMethod;
      
      let matchesTime = true;
      const expenseDate = new Date(expense.date);
      const now = new Date();
      
      switch (timeFilter) {
        case 'today':
          matchesTime = expenseDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTime = expenseDate >= weekAgo;
          break;
        case 'month':
          matchesTime = expenseDate.getMonth() === now.getMonth() && 
                       expenseDate.getFullYear() === now.getFullYear();
          break;
        case 'year':
          matchesTime = expenseDate.getFullYear() === now.getFullYear();
          break;
        default:
          matchesTime = true;
      }
      
      return matchesSearch && matchesCategory && matchesPaymentMethod && matchesTime;
    });

    // Sort expenses
    filtered.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'date':
          compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          compareValue = a.amount - b.amount;
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMethod, timeFilter, sortBy, sortOrder]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const categoryTotals = categories.map(category => {
      const categoryExpenses = filteredExpenses.filter(expense => expense.category === category.name);
      const spent = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        category: category.name,
        spent,
        budget: category.budget || 0,
        color: category.color,
        percentage: totalExpense > 0 ? (spent / totalExpense) * 100 : 0
      };
    }).filter(item => item.spent > 0);

    const paymentMethodTotals = paymentMethods.map(method => {
      const methodExpenses = filteredExpenses.filter(expense => expense.paymentMethod === method);
      const total = methodExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        name: method,
        value: total,
        count: methodExpenses.length
      };
    }).filter(item => item.value > 0);

    return { totalExpense, categoryTotals, paymentMethodTotals };
  }, [filteredExpenses, categories]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (chartType === 'pie') {
      return statistics.categoryTotals.map(item => ({
        name: item.category,
        value: item.spent,
        color: item.color
      }));
    }
    
    if (chartType === 'bar') {
      return statistics.categoryTotals.map(item => ({
        category: item.category,
        spent: item.spent,
        budget: item.budget,
        fill: item.color
      }));
    }
    
    // Line chart - daily expenses over time
    const dailyExpenses = filteredExpenses.reduce((acc, expense) => {
      const date = expense.date;
      acc[date] = (acc[date] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(dailyExpenses)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString(),
        amount
      }));
  }, [statistics, chartType, filteredExpenses]);

  const exportData = () => {
    const dataStr = JSON.stringify(filteredExpenses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `expenses_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedData)) {
          const validExpenses = importedData.filter(item => 
            item.id && item.title && typeof item.amount === 'number' && item.category && item.date
          );
          setExpenses(prev => [...validExpenses, ...prev]);
          alert(`Successfully imported ${validExpenses.length} expenses`);
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const downloadTemplate = () => {
    const template = [{
      id: 'sample_id',
      title: 'Sample Expense',
      amount: 50.00,
      category: 'Food & Dining',
      date: '2024-12-15',
      description: 'Sample description',
      paymentMethod: 'Cash'
    }];
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expense_template.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white theme-transition">Expense Tracker</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400 theme-transition">Track your daily expenses</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 theme-transition"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={openModal}
                className="btn btn-primary btn-responsive flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Expense</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card theme-transition">
            <div className="stat-title">Total Expenses</div>
            <div className="stat-value">${statistics.totalExpense.toFixed(2)}</div>
            <div className="stat-desc flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {filteredExpenses.length} transactions
            </div>
          </div>
          
          <div className="stat-card theme-transition">
            <div className="stat-title">Average per Transaction</div>
            <div className="stat-value">
              ${filteredExpenses.length > 0 ? (statistics.totalExpense / filteredExpenses.length).toFixed(2) : '0.00'}
            </div>
            <div className="stat-desc flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Based on filtered data
            </div>
          </div>
          
          <div className="stat-card theme-transition">
            <div className="stat-title">Top Category</div>
            <div className="stat-value text-lg">
              {statistics.categoryTotals.length > 0 
                ? statistics.categoryTotals.reduce((max, cat) => cat.spent > max.spent ? cat : max).category
                : 'N/A'
              }
            </div>
            <div className="stat-desc flex items-center gap-1">
              <Target className="w-4 h-4" />
              Highest spending
            </div>
          </div>
          
          <div className="stat-card theme-transition">
            <div className="stat-title">Budget Status</div>
            <div className="stat-value text-lg">
              {(() => {
                const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
                const totalSpent = statistics.totalExpense;
                const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
                return percentage <= 100 ? 'On Track' : 'Over Budget';
              })()} 
            </div>
            <div className="stat-desc flex items-center gap-1">
              {(() => {
                const totalBudget = categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
                const totalSpent = statistics.totalExpense;
                const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
                return percentage <= 100 
                  ? <><TrendingUp className="w-4 h-4 text-green-500" /> {percentage.toFixed(1)}% used</>
                  : <><TrendingDown className="w-4 h-4 text-red-500" /> {percentage.toFixed(1)}% over</>;
              })()} 
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card mb-6 theme-transition">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Mode Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
              {[{ key: 'list', label: 'List' }, { key: 'chart', label: 'Charts' }, { key: 'budget', label: 'Budget' }].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key as ViewMode)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === key
                      ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="input w-auto"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>

              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="input w-auto"
              >
                <option value="all">All Methods</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Export/Import */}
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              
              <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Import</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={downloadTemplate}
                className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'list' && (
          <div className="card theme-transition">
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'title')}
                className="input w-auto"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="title">Title</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="btn bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center gap-2"
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>

            {/* Expenses List */}
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expenses found</h3>
                <p className="text-gray-500 dark:text-slate-400">Start by adding your first expense or adjust your filters.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.map(expense => {
                  const category = categories.find(cat => cat.name === expense.category);
                  return (
                    <div
                      key={expense.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 theme-transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 sm:mb-0">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category?.color || '#gray' }}
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">{expense.title}</h4>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                              <span>{expense.category}</span>
                              <span>•</span>
                              <span>{expense.paymentMethod}</span>
                              <span>•</span>
                              <span>{new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                            {expense.description && (
                              <p className="text-sm text-gray-600 dark:text-slate-300 mt-1">{expense.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">
                          ${expense.amount.toFixed(2)}
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => editExpense(expense)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            aria-label="Edit expense"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            aria-label="Delete expense"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {viewMode === 'chart' && (
          <div className="space-y-6">
            {/* Chart Type Selector */}
            <div className="card theme-transition">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Chart Type:</span>
                {[{ key: 'pie', label: 'Pie Chart' }, { key: 'bar', label: 'Bar Chart' }, { key: 'line', label: 'Line Chart' }].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setChartType(key as ChartType)}
                    className={`px-3 py-1 rounded-md text-sm transition-colors ${
                      chartType === key
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'pie' && (
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: $${value.toFixed(2)} (${(percent * 100).toFixed(1)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                      <Legend />
                    </PieChart>
                  )}
                  
                  {chartType === 'bar' && (
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']} />
                      <Legend />
                      <Bar dataKey="spent" name="Spent" fill="#8884d8" />
                      <Bar dataKey="budget" name="Budget" fill="#82ca9d" />
                    </BarChart>
                  )}
                  
                  {chartType === 'line' && (
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Daily Total']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'budget' && (
          <div className="space-y-6">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map(category => {
                const spent = filteredExpenses
                  .filter(expense => expense.category === category.name)
                  .reduce((sum, expense) => sum + expense.amount, 0);
                const budget = category.budget || 0;
                const percentage = budget > 0 ? (spent / budget) * 100 : 0;
                const isOverBudget = percentage > 100;
                
                return (
                  <div key={category.id} className="card theme-transition">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-medium text-gray-900 dark:text-white">{category.name}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Spent</span>
                        <span className={`font-medium ${
                          isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                        }`}>
                          ${spent.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">Budget</span>
                        <span className="text-gray-900 dark:text-white font-medium">${budget.toFixed(2)}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isOverBudget ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className={`${
                          isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                        }`}>
                          {percentage.toFixed(1)}% used
                        </span>
                        {budget > 0 && (
                          <span className="text-gray-500 dark:text-slate-400">
                            ${Math.max(0, budget - spent).toFixed(2)} remaining
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ExpenseForm
              expense={editingExpense}
              categories={categories}
              paymentMethods={paymentMethods}
              onSubmit={editingExpense ? 
                (data) => updateExpense(editingExpense.id, data) : 
                addExpense
              }
              onCancel={closeModal}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 theme-transition">
        <div className="container-wide py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Expense Form Component
interface ExpenseFormProps {
  expense?: Expense | null;
  categories: Category[];
  paymentMethods: string[];
  onSubmit: (data: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  expense,
  categories,
  paymentMethods,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: expense?.title || '',
    amount: expense?.amount || 0,
    category: expense?.category || categories[0]?.name || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    paymentMethod: expense?.paymentMethod || paymentMethods[0]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="modal-header">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          {expense ? 'Edit Expense' : 'Add New Expense'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 text-2xl"
          aria-label="Close modal"
        >
          ×
        </button>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="title">Title *</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={`input ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Enter expense title"
        />
        {errors.title && <p className="form-error">{errors.title}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="amount">Amount *</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          value={formData.amount}
          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
          className={`input ${errors.amount ? 'border-red-500' : ''}`}
          placeholder="0.00"
        />
        {errors.amount && <p className="form-error">{errors.amount}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label" htmlFor="category">Category *</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className={`input ${errors.category ? 'border-red-500' : ''}`}
          >
            {categories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          {errors.category && <p className="form-error">{errors.category}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="paymentMethod">Payment Method</label>
          <select
            id="paymentMethod"
            value={formData.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
            className="input"
          >
            {paymentMethods.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">Date *</label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className={`input ${errors.date ? 'border-red-500' : ''}`}
        />
        {errors.date && <p className="form-error">{errors.date}</p>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="input resize-none"
          rows={3}
          placeholder="Optional description"
        />
      </div>

      <div className="modal-footer">
        <button
          type="button"
          onClick={onCancel}
          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {expense ? 'Update' : 'Add'} Expense
        </button>
      </div>
    </form>
  );
};

export default App;