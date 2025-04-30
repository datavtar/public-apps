import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Edit, Trash2, DollarSign, ShoppingBag, Lightbulb, Package, ArrowLeftRight } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define our expense categories
type ExpenseCategory = 'groceries' | 'utilities' | 'miscellaneous';

// Define the Expense interface
interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
}

// Define the Budget interface
interface Budget {
  groceries: number;
  utilities: number;
  miscellaneous: number;
}

// Category display config
interface CategoryConfig {
  label: string;
  icon: JSX.Element;
  color: string;
}

const App: React.FC = () => {
  // State for expenses, budgets, and UI controls
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget>({ groceries: 0, utilities: 0, miscellaneous: 0 });
  const [currentTab, setCurrentTab] = useState<'add' | 'view' | 'budgets' | 'reports'>('add');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('groceries');
  const [date, setDate] = useState<string>(new Date().toISOString().substr(0, 10));
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudgets, setEditingBudgets] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Category configuration
  const categoryConfig: Record<ExpenseCategory, CategoryConfig> = {
    groceries: {
      label: 'Groceries',
      icon: <ShoppingBag size={18} />,
      color: '#4CAF50' // green
    },
    utilities: {
      label: 'Utilities',
      icon: <Lightbulb size={18} />,
      color: '#2196F3' // blue
    },
    miscellaneous: {
      label: 'Miscellaneous',
      icon: <Package size={18} />,
      color: '#FF9800' // orange
    }
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedBudgets = localStorage.getItem('budgets');

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (e) {
        console.error('Error parsing expenses from localStorage:', e);
        setExpenses([]);
      }
    }

    if (savedBudgets) {
      try {
        setBudgets(JSON.parse(savedBudgets));
      } catch (e) {
        console.error('Error parsing budgets from localStorage:', e);
        setBudgets({ groceries: 0, utilities: 0, miscellaneous: 0 });
      }
    }
  }, []);

  // Save expenses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Save budgets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Add or edit an expense
  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setError('');
    
    const expenseData: Expense = {
      id: editingExpense ? editingExpense.id : Date.now().toString(),
      category,
      description: description.trim(),
      amount: parseFloat(amount),
      date
    };

    if (editingExpense) {
      // Update existing expense
      setExpenses(expenses.map(exp => 
        exp.id === editingExpense.id ? expenseData : exp
      ));
      setEditingExpense(null);
    } else {
      // Add new expense
      setExpenses([...expenses, expenseData]);
    }

    // Reset form
    setDescription('');
    setAmount('');
    setCategory('groceries');
    setDate(new Date().toISOString().substr(0, 10));
  };

  // Set up expense for editing
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setDescription(expense.description);
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDate(expense.date);
    setCurrentTab('add');
  };

  // Delete an expense
  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Update budgets
  const handleUpdateBudgets = (e: React.FormEvent) => {
    e.preventDefault();
    setEditingBudgets(false);
  };

  // Calculate total spent in each category
  const calculateTotalByCategory = () => {
    const totals = {
      groceries: 0,
      utilities: 0,
      miscellaneous: 0
    };

    expenses.forEach(expense => {
      totals[expense.category] += expense.amount;
    });

    return totals;
  };

  // For chart data
  const getChartData = () => {
    const totals = calculateTotalByCategory();
    
    return [
      { name: 'Groceries', value: totals.groceries, color: categoryConfig.groceries.color },
      { name: 'Utilities', value: totals.utilities, color: categoryConfig.utilities.color },
      { name: 'Miscellaneous', value: totals.miscellaneous, color: categoryConfig.miscellaneous.color }
    ];
  };

  // For budget comparison chart
  const getBudgetComparisonData = () => {
    const totals = calculateTotalByCategory();
    
    return [
      { 
        name: 'Groceries', 
        Spent: totals.groceries, 
        Budget: budgets.groceries,
        OverUnder: budgets.groceries - totals.groceries
      },
      { 
        name: 'Utilities', 
        Spent: totals.utilities, 
        Budget: budgets.utilities,
        OverUnder: budgets.utilities - totals.utilities
      },
      { 
        name: 'Miscellaneous', 
        Spent: totals.miscellaneous, 
        Budget: budgets.miscellaneous,
        OverUnder: budgets.miscellaneous - totals.miscellaneous
      }
    ];
  };

  // Grouping expenses by month for reports
  const getMonthlyData = () => {
    const monthlyTotals: Record<string, Record<ExpenseCategory, number>> = {};
    
    expenses.forEach(expense => {
      const monthYear = expense.date.substr(0, 7); // Format: YYYY-MM
      
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = { groceries: 0, utilities: 0, miscellaneous: 0 };
      }
      
      monthlyTotals[monthYear][expense.category] += expense.amount;
    });
    
    return Object.entries(monthlyTotals)
      .map(([monthYear, totals]) => ({
        name: formatMonthYear(monthYear),
        Groceries: totals.groceries,
        Utilities: totals.utilities,
        Miscellaneous: totals.miscellaneous
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  
  // Format YYYY-MM to Month Year
  const formatMonthYear = (dateStr: string) => {
    const [year, month] = dateStr.split('-');
    return `${getMonthName(parseInt(month))} ${year}`;
  };
  
  // Get month name from month number
  const getMonthName = (monthNum: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  };

  // Calculate total expenses
  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  // Calculate total budget
  const calculateTotalBudget = () => {
    return budgets.groceries + budgets.utilities + budgets.miscellaneous;
  };

  const renderAddExpenseTab = () => (
    <div className="card p-6">
      <h2 className="text-xl font-semibold mb-4">
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
      </h2>
      
      {error && (
        <div className="alert alert-error mb-4">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmitExpense}>
        <div className="form-group">
          <label htmlFor="category" className="form-label">Category</label>
          <select 
            id="category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          >
            <option value="groceries">Groceries</option>
            <option value="utilities">Utilities</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <input
            type="text"
            id="description"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you spend on?"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="amount" className="form-label">Amount</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign size={16} className="text-gray-500" />
            </div>
            <input
              type="number"
              id="amount"
              className="input pl-10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="date" className="form-label">Date</label>
          <input
            type="date"
            id="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end mt-6">
          {editingExpense && (
            <button 
              type="button" 
              className="btn bg-gray-500 text-white hover:bg-gray-600 mr-2"
              onClick={() => {
                setEditingExpense(null);
                setDescription('');
                setAmount('');
                setCategory('groceries');
                setDate(new Date().toISOString().substr(0, 10));
              }}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderViewExpensesTab = () => {
    // Group expenses by date (most recent first)
    const groupedExpenses = expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .reduce<Record<string, Expense[]>>((groups, expense) => {
        if (!groups[expense.date]) {
          groups[expense.date] = [];
        }
        groups[expense.date].push(expense);
        return groups;
      }, {});

    if (expenses.length === 0) {
      return (
        <div className="card p-6 text-center">
          <p className="text-lg text-gray-500">No expenses added yet.</p>
          <button 
            className="btn btn-primary mt-4"
            onClick={() => setCurrentTab('add')}
          >
            Add Your First Expense
          </button>
        </div>
      );
    }

    return (
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Your Expenses</h2>
        
        {Object.entries(groupedExpenses).map(([date, expenseList]) => (
          <div key={date} className="mb-6">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {expenseList.map(expense => (
                <div key={expense.id} className="py-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className={`${styles.categoryIcon} mr-3`} style={{ backgroundColor: categoryConfig[expense.category].color }}>
                      {categoryConfig[expense.category].icon}
                    </div>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{categoryConfig[expense.category].label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <p className="font-semibold mr-4">${expense.amount.toFixed(2)}</p>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleEditExpense(expense)}
                        className="p-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        aria-label="Edit expense"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="p-1 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBudgetsTab = () => (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Budgets</h2>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setEditingBudgets(!editingBudgets)}
        >
          {editingBudgets ? 'Cancel' : 'Edit Budgets'}
        </button>
      </div>
      
      {editingBudgets ? (
        <form onSubmit={handleUpdateBudgets}>
          {Object.entries(categoryConfig).map(([cat, config]) => (
            <div key={cat} className="form-group">
              <label htmlFor={`budget-${cat}`} className="form-label flex items-center gap-2">
                {config.icon}
                {config.label} Budget
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={16} className="text-gray-500" />
                </div>
                <input
                  type="number"
                  id={`budget-${cat}`}
                  className="input pl-10"
                  value={budgets[cat as ExpenseCategory] || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : 0;
                    setBudgets({ ...budgets, [cat]: value });
                  }}
                  placeholder="0.00"
                  min="0"
                  step="1"
                />
              </div>
            </div>
          ))}
          
          <div className="flex justify-end mt-6">
            <button type="submit" className="btn btn-primary">
              Save Budgets
            </button>
          </div>
        </form>
      ) : (
        <div>
          {Object.entries(categoryConfig).map(([cat, config]) => {
            const category = cat as ExpenseCategory;
            const total = expenses
              .filter(e => e.category === category)
              .reduce((sum, e) => sum + e.amount, 0);
            const budget = budgets[category];
            const percentage = budget > 0 ? (total / budget) * 100 : 0;
            const isOverBudget = percentage > 100;
            
            return (
              <div key={cat} className="mb-6 last:mb-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${total.toFixed(2)} / ${budget.toFixed(2)}</p>
                    <p className={`text-sm ${isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {isOverBudget ? 'Over budget' : budget > 0 ? `${percentage.toFixed(0)}% used` : 'No budget set'}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                  <div 
                    className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-600' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
          
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Total</h3>
              <div className="text-right">
                <p className="font-semibold">
                  ${calculateTotalExpenses().toFixed(2)} / ${calculateTotalBudget().toFixed(2)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {calculateTotalBudget() > 0
                    ? `${Math.round((calculateTotalExpenses() / calculateTotalBudget()) * 100)}% of total budget used`
                    : 'No budgets set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Spending by Category</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={getChartData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {getChartData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">Budget vs. Actual</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getBudgetComparisonData()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, '']} />
              <Legend />
              <Bar dataKey="Budget" fill="#8884d8" />
              <Bar dataKey="Spent" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {getMonthlyData().length > 0 && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={getMonthlyData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, '']} />
                <Legend />
                <Bar dataKey="Groceries" fill={categoryConfig.groceries.color} />
                <Bar dataKey="Utilities" fill={categoryConfig.utilities.color} />
                <Bar dataKey="Miscellaneous" fill={categoryConfig.miscellaneous.color} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="container-fluid">
          <div className="flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
              Household Budget Tracker
            </h1>
            
            <ThemeToggle />
          </div>
        </div>
      </header>
      
      <main className="container-fluid my-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Hello!</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage your household expenses with ease.</p>
          </div>
          
          {currentTab !== 'add' && (
            <button 
              className="btn btn-primary flex items-center gap-2"
              onClick={() => {
                setCurrentTab('add');
                setEditingExpense(null);
                setDescription('');
                setAmount('');
                setCategory('groceries');
                setDate(new Date().toISOString().substr(0, 10));
              }}
            >
              <Plus size={18} />
              <span>Add Expense</span>
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="flex overflow-x-auto">
              <button
                className={`px-4 py-3 font-medium whitespace-nowrap ${currentTab === 'add' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setCurrentTab('add')}
              >
                Add Expense
              </button>
              <button
                className={`px-4 py-3 font-medium whitespace-nowrap ${currentTab === 'view' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setCurrentTab('view')}
              >
                View Expenses
              </button>
              <button
                className={`px-4 py-3 font-medium whitespace-nowrap ${currentTab === 'budgets' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setCurrentTab('budgets')}
              >
                Budgets
              </button>
              <button
                className={`px-4 py-3 font-medium whitespace-nowrap ${currentTab === 'reports' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-600 dark:text-gray-400'}`}
                onClick={() => setCurrentTab('reports')}
              >
                Reports
              </button>
            </div>
          </div>
          
          <div>
            {currentTab === 'add' && renderAddExpenseTab()}
            {currentTab === 'view' && renderViewExpensesTab()}
            {currentTab === 'budgets' && renderBudgetsTab()}
            {currentTab === 'reports' && renderReportsTab()}
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 mt-12">
        <div className="container-fluid text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Theme toggle component
const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  return (
    <button 
      className="theme-toggle"
      onClick={() => setIsDarkMode(!isDarkMode)}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="theme-toggle-thumb"></span>
      <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
    </button>
  );
};

export default App;
