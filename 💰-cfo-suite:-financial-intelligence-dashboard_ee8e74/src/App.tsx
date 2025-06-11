import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  DollarSign, TrendingUp, TrendingDown, FileText, Receipt, 
  Calculator, BarChart3, PieChart, Target, Clock, Upload,
  Download, Settings, Plus, Edit, Trash2, Search, Filter,
  Calendar, AlertTriangle, CheckCircle, XCircle, Eye,
  RefreshCw, Moon, Sun, Building, CreditCard, Wallet,
  ArrowUp, ArrowDown, ChevronRight, CircleGauge, Brain, Shield, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and Interfaces
interface FinancialData {
  revenue: number;
  expenses: number;
  netIncome: number;
  cashFlow: number;
  monthlyData: MonthlyData[];
  budgetData: BudgetData[];
  expenseCategories: ExpenseCategory[];
  invoices: Invoice[];
  kpis: KPI[];
}

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  cashFlow: number;
}

interface BudgetData {
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercent: number;
}

interface ExpenseCategory {
  name: string;
  amount: number;
  color: string;
  percentage: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  category: string;
}

interface KPI {
  name: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: string;
}

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  receipt?: string;
}

interface TaxItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  quarter: string;
  deductible: boolean;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  amount?: number;
}

function App() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [taxItems, setTaxItems] = useState<TaxItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // AI Integration State
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);

  // Dark Mode Hook
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

  const { isDark, toggleDarkMode } = useDarkMode();

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    const savedData = localStorage.getItem('cfo_financial_data');
    const savedExpenses = localStorage.getItem('cfo_expenses');
    const savedTaxItems = localStorage.getItem('cfo_tax_items');
    const savedAuditLogs = localStorage.getItem('cfo_audit_logs');

    if (savedData) {
      setFinancialData(JSON.parse(savedData));
    } else {
      const defaultData: FinancialData = {
        revenue: 1250000,
        expenses: 980000,
        netIncome: 270000,
        cashFlow: 180000,
        monthlyData: [
          { month: 'Jan', revenue: 95000, expenses: 78000, netIncome: 17000, cashFlow: 12000 },
          { month: 'Feb', revenue: 102000, expenses: 81000, netIncome: 21000, cashFlow: 15000 },
          { month: 'Mar', revenue: 108000, expenses: 85000, netIncome: 23000, cashFlow: 18000 },
          { month: 'Apr', revenue: 115000, expenses: 88000, netIncome: 27000, cashFlow: 20000 },
          { month: 'May', revenue: 125000, expenses: 92000, netIncome: 33000, cashFlow: 25000 },
          { month: 'Jun', revenue: 118000, expenses: 89000, netIncome: 29000, cashFlow: 22000 }
        ],
        budgetData: [
          { category: 'Marketing', budgeted: 50000, actual: 48500, variance: 1500, variancePercent: 3.0 },
          { category: 'Operations', budgeted: 120000, actual: 125000, variance: -5000, variancePercent: -4.2 },
          { category: 'Personnel', budgeted: 180000, actual: 175000, variance: 5000, variancePercent: 2.8 },
          { category: 'Technology', budgeted: 30000, actual: 32000, variance: -2000, variancePercent: -6.7 },
          { category: 'Facilities', budgeted: 25000, actual: 24000, variance: 1000, variancePercent: 4.0 }
        ],
        expenseCategories: [
          { name: 'Personnel', amount: 175000, color: '#3b82f6', percentage: 35.7 },
          { name: 'Operations', amount: 125000, color: '#10b981', percentage: 25.5 },
          { name: 'Marketing', amount: 48500, color: '#f59e0b', percentage: 9.9 },
          { name: 'Technology', amount: 32000, color: '#ef4444', percentage: 6.5 },
          { name: 'Facilities', amount: 24000, color: '#8b5cf6', percentage: 4.9 },
          { name: 'Other', amount: 85500, color: '#6b7280', percentage: 17.5 }
        ],
        invoices: [
          { id: '1', invoiceNumber: 'INV-2025-001', vendor: 'AWS Services', amount: 12500, dueDate: '2025-06-25', status: 'pending', description: 'Cloud infrastructure', category: 'Technology' },
          { id: '2', invoiceNumber: 'INV-2025-002', vendor: 'Office Supplies Co', amount: 890, dueDate: '2025-06-15', status: 'overdue', description: 'Office materials', category: 'Operations' },
          { id: '3', invoiceNumber: 'INV-2025-003', vendor: 'Marketing Agency', amount: 8500, dueDate: '2025-06-30', status: 'paid', description: 'Digital marketing campaign', category: 'Marketing' }
        ],
        kpis: [
          { name: 'Gross Margin', value: '21.6%', change: 2.3, trend: 'up', target: '22%' },
          { name: 'Current Ratio', value: '2.1', change: 0.1, trend: 'up', target: '2.0' },
          { name: 'Debt-to-Equity', value: '0.65', change: -0.05, trend: 'down', target: '0.7' },
          { name: 'ROE', value: '18.5%', change: 1.2, trend: 'up', target: '18%' }
        ]
      };
      setFinancialData(defaultData);
      localStorage.setItem('cfo_financial_data', JSON.stringify(defaultData));
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    } else {
      const defaultExpenses: Expense[] = [
        { id: '1', date: '2025-06-10', description: 'Team lunch meeting', amount: 125, category: 'Operations' },
        { id: '2', date: '2025-06-09', description: 'Software licenses', amount: 1200, category: 'Technology' },
        { id: '3', date: '2025-06-08', description: 'Travel expenses', amount: 450, category: 'Operations' }
      ];
      setExpenses(defaultExpenses);
      localStorage.setItem('cfo_expenses', JSON.stringify(defaultExpenses));
    }

    if (savedTaxItems) {
      setTaxItems(JSON.parse(savedTaxItems));
    } else {
      const defaultTaxItems: TaxItem[] = [
        { id: '1', description: 'Office rent', amount: 24000, category: 'Facilities', quarter: 'Q2', deductible: true },
        { id: '2', description: 'Equipment purchase', amount: 15000, category: 'Technology', quarter: 'Q2', deductible: true },
        { id: '3', description: 'Marketing expenses', amount: 8500, category: 'Marketing', quarter: 'Q2', deductible: true }
      ];
      setTaxItems(defaultTaxItems);
      localStorage.setItem('cfo_tax_items', JSON.stringify(defaultTaxItems));
    }

    if (savedAuditLogs) {
      setAuditLogs(JSON.parse(savedAuditLogs));
    } else {
      const defaultAuditLogs: AuditLog[] = [
        { id: '1', timestamp: '2025-06-11 10:30:00', user: 'admin@company.com', action: 'Created Invoice', details: 'INV-2025-001 - AWS Services', amount: 12500 },
        { id: '2', timestamp: '2025-06-11 09:15:00', user: 'admin@company.com', action: 'Updated Budget', details: 'Marketing budget increased', amount: 2000 },
        { id: '3', timestamp: '2025-06-10 16:45:00', user: 'admin@company.com', action: 'Paid Invoice', details: 'INV-2025-003 - Marketing Agency', amount: 8500 }
      ];
      setAuditLogs(defaultAuditLogs);
      localStorage.setItem('cfo_audit_logs', JSON.stringify(defaultAuditLogs));
    }
  };

  const saveFinancialData = (data: FinancialData) => {
    setFinancialData(data);
    localStorage.setItem('cfo_financial_data', JSON.stringify(data));
    addAuditLog('Updated Financial Data', 'Financial records modified');
  };

  const saveExpenses = (data: Expense[]) => {
    setExpenses(data);
    localStorage.setItem('cfo_expenses', JSON.stringify(data));
  };

  const addAuditLog = (action: string, details: string, amount?: number) => {
    const newLog: AuditLog = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      user: currentUser?.email || 'Unknown',
      action,
      details,
      amount
    };
    const updatedLogs = [newLog, ...auditLogs].slice(0, 100); // Keep last 100 logs
    setAuditLogs(updatedLogs);
    localStorage.setItem('cfo_audit_logs', JSON.stringify(updatedLogs));
  };

  // AI Integration Functions
  const handleAIAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError("Please provide a question or upload a document for analysis.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    let prompt = aiPrompt;
    if (selectedFile && !prompt.trim()) {
      prompt = "Analyze this financial document and extract key information. Provide insights about the financial data including amounts, dates, categories, and any recommendations.";
    }

    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const handleInvoiceAIExtraction = () => {
    if (!selectedFile) {
      setAiError("Please upload an invoice document first.");
      return;
    }

    const extractionPrompt = `Analyze this invoice document and extract the following information in JSON format:
    {
      "vendor": "vendor name",
      "amount": "invoice amount (number only)",
      "dueDate": "due date (YYYY-MM-DD format)",
      "invoiceNumber": "invoice number",
      "description": "brief description of services/products",
      "category": "category (Technology, Marketing, Operations, Personnel, Facilities, or Other)"
    }`;

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(extractionPrompt, selectedFile);
    } catch (error) {
      setAiError("Failed to extract invoice data");
    }
  };

  const processAIInvoiceResult = (result: string) => {
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[0]);
        
        const newInvoice: Invoice = {
          id: Date.now().toString(),
          invoiceNumber: extractedData.invoiceNumber || `INV-${Date.now()}`,
          vendor: extractedData.vendor || 'Unknown Vendor',
          amount: Number(extractedData.amount) || 0,
          dueDate: extractedData.dueDate || new Date().toISOString().split('T')[0],
          status: 'pending' as const,
          description: extractedData.description || 'AI Extracted Invoice',
          category: extractedData.category || 'Other'
        };

        if (financialData) {
          const updatedData = {
            ...financialData,
            invoices: [...financialData.invoices, newInvoice]
          };
          saveFinancialData(updatedData);
          addAuditLog('AI Invoice Extraction', `Created invoice: ${newInvoice.invoiceNumber}`, newInvoice.amount);
          setShowInvoiceModal(false);
          setSelectedFile(null);
        }
      }
    } catch (error) {
      console.error('Error processing AI result:', error);
    }
  };

  // Invoice Management
  const handleSaveInvoice = (invoiceData: Partial<Invoice>) => {
    if (!financialData) return;

    if (editingInvoice) {
      const updatedInvoices = financialData.invoices.map(inv => 
        inv.id === editingInvoice.id ? { ...editingInvoice, ...invoiceData } : inv
      );
      const updatedData = { ...financialData, invoices: updatedInvoices };
      saveFinancialData(updatedData);
      addAuditLog('Updated Invoice', `Modified ${editingInvoice.invoiceNumber}`, editingInvoice.amount);
    } else {
      const newInvoice: Invoice = {
        id: Date.now().toString(),
        invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
        vendor: invoiceData.vendor || '',
        amount: invoiceData.amount || 0,
        dueDate: invoiceData.dueDate || '',
        status: invoiceData.status || 'pending',
        description: invoiceData.description || '',
        category: invoiceData.category || 'Other'
      };
      const updatedData = { ...financialData, invoices: [...financialData.invoices, newInvoice] };
      saveFinancialData(updatedData);
      addAuditLog('Created Invoice', `New invoice: ${newInvoice.invoiceNumber}`, newInvoice.amount);
    }

    setShowInvoiceModal(false);
    setEditingInvoice(null);
  };

  const handleDeleteInvoice = (id: string) => {
    if (!financialData) return;
    
    const invoiceToDelete = financialData.invoices.find(inv => inv.id === id);
    const updatedInvoices = financialData.invoices.filter(inv => inv.id !== id);
    const updatedData = { ...financialData, invoices: updatedInvoices };
    saveFinancialData(updatedData);
    
    if (invoiceToDelete) {
      addAuditLog('Deleted Invoice', `Removed ${invoiceToDelete.invoiceNumber}`, invoiceToDelete.amount);
    }
  };

  // Expense Management
  const handleSaveExpense = (expenseData: Partial<Expense>) => {
    if (editingExpense) {
      const updatedExpenses = expenses.map(exp => 
        exp.id === editingExpense.id ? { ...editingExpense, ...expenseData } : exp
      );
      saveExpenses(updatedExpenses);
      addAuditLog('Updated Expense', `Modified expense: ${editingExpense.description}`, editingExpense.amount);
    } else {
      const newExpense: Expense = {
        id: Date.now().toString(),
        date: expenseData.date || new Date().toISOString().split('T')[0],
        description: expenseData.description || '',
        amount: expenseData.amount || 0,
        category: expenseData.category || 'Other',
        receipt: expenseData.receipt
      };
      saveExpenses([...expenses, newExpense]);
      addAuditLog('Created Expense', `New expense: ${newExpense.description}`, newExpense.amount);
    }

    setShowExpenseModal(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    const expenseToDelete = expenses.find(exp => exp.id === id);
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    saveExpenses(updatedExpenses);
    
    if (expenseToDelete) {
      addAuditLog('Deleted Expense', `Removed expense: ${expenseToDelete.description}`, expenseToDelete.amount);
    }
  };

  // Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [headers, ...data.map(row => Object.values(row).join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    // Simplified PDF export - in a real app, you'd use a library like jsPDF
    const content = `
CFO Financial Report - ${new Date().toLocaleDateString()}

Financial Summary:
Revenue: $${financialData?.revenue.toLocaleString()}
Expenses: $${financialData?.expenses.toLocaleString()}
Net Income: $${financialData?.netIncome.toLocaleString()}
Cash Flow: $${financialData?.cashFlow.toLocaleString()}

Budget Analysis:
${financialData?.budgetData.map(item => 
  `${item.category}: Budgeted $${item.budgeted.toLocaleString()}, Actual $${item.actual.toLocaleString()}, Variance ${item.variancePercent}%`
).join('\n')}

Recent Invoices:
${financialData?.invoices.slice(0, 10).map(inv => 
  `${inv.invoiceNumber} - ${inv.vendor}: $${inv.amount.toLocaleString()} (${inv.status})`
).join('\n')}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'financial-report.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Filter and Search Functions
  const getFilteredInvoices = () => {
    if (!financialData) return [];
    
    return financialData.invoices.filter(invoice => {
      const matchesSearch = searchTerm === '' || 
        invoice.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterCategory === 'all' || invoice.category === filterCategory;
      
      return matchesSearch && matchesFilter;
    });
  };

  const getFilteredExpenses = () => {
    return expenses.filter(expense => {
      const matchesSearch = searchTerm === '' || 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterCategory === 'all' || expense.category === filterCategory;
      
      return matchesSearch && matchesFilter;
    });
  };

  if (!currentUser) {
    return <div className="flex-center min-h-screen">Loading...</div>;
  }

  if (!financialData) {
    return <div className="flex-center min-h-screen">Initializing financial data...</div>;
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          if (showInvoiceModal && selectedFile) {
            processAIInvoiceResult(result);
          }
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-lg mx-auto px-6 py-4">
          <div className="flex-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">CFO Suite</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Financial Management Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowAiPanel(!showAiPanel)}
                className="btn btn-secondary btn-sm"
                title="AI Financial Assistant"
              >
                <Brain className="w-4 h-4" />
                AI Assistant
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, {currentUser.first_name}
                </span>
                <button onClick={logout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* AI Panel */}
      {showAiPanel && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
          <div className="container-lg mx-auto px-6 py-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-medium text-blue-900 dark:text-blue-100">AI Financial Assistant</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask about financial analysis, forecasting, insights, or upload documents for processing..."
                    className="input resize-none h-24"
                  />
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      accept=".pdf,.png,.jpg,.jpeg,.xlsx,.csv"
                      className="hidden"
                      id="ai-file-upload"
                    />
                    <label htmlFor="ai-file-upload" className="btn btn-secondary btn-sm cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Upload Document
                    </label>
                    
                    {selectedFile && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedFile.name}
                      </span>
                    )}
                    
                    <button
                      onClick={handleAIAnalysis}
                      disabled={isAiLoading}
                      className="btn btn-primary btn-sm"
                    >
                      {isAiLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4" />
                          Analyze
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {aiError && (
                    <div className="alert alert-error">
                      <XCircle className="w-5 h-5" />
                      <span>{aiError.message || aiError}</span>
                    </div>
                  )}
                  
                  {aiResult && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-sm dark:prose-invert max-w-none">
                        {aiResult}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container-lg mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: CircleGauge },
              { id: 'reports', label: 'Reports', icon: BarChart3 },
              { id: 'budget', label: 'Budget', icon: Target },
              { id: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
              { id: 'expenses', label: 'Expenses', icon: Receipt },
              { id: 'invoices', label: 'Invoices', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
              { id: 'tax', label: 'Tax Planning', icon: Calculator },
              { id: 'audit', label: 'Audit Trail', icon: Eye },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                onClick={() => setActiveTab(tab.id)}
                className={`tab ${activeTab === tab.id ? 'tab-active' : ''} flex items-center gap-2 whitespace-nowrap`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-lg mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card card-padding bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold">${financialData.revenue.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+12.5% vs last month</span>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-200" />
                </div>
              </div>

              <div className="card card-padding bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Net Income</p>
                    <p className="text-2xl font-bold">${financialData.netIncome.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+8.3% vs last month</span>
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </div>

              <div className="card card-padding bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Cash Flow</p>
                    <p className="text-2xl font-bold">${financialData.cashFlow.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+15.2% vs last month</span>
                    </div>
                  </div>
                  <CreditCard className="w-8 h-8 text-purple-200" />
                </div>
              </div>

              <div className="card card-padding bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <div className="flex-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold">${financialData.expenses.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-2">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm">-3.1% vs last month</span>
                    </div>
                  </div>
                  <Receipt className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* KPI Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {financialData.kpis.map((kpi, index) => (
                <div key={index} className="card card-padding">
                  <div className="space-y-2">
                    <div className="flex-between">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.name}</p>
                      {kpi.trend === 'up' ? (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      ) : kpi.trend === 'down' ? (
                        <ArrowDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <div className="w-4 h-4 bg-gray-400 rounded-full" />
                      )}
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                    <div className="flex-between">
                      <span className={`text-sm ${kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                        {kpi.change > 0 ? '+' : ''}{kpi.change}%
                      </span>
                      {kpi.target && (
                        <span className="text-xs text-gray-500">Target: {kpi.target}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Monthly Financial Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={financialData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="netIncome" stroke="#10b981" strokeWidth={2} name="Net Income" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Expense Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                    <Cell fill="#8b5cf6" />
                    <Cell fill="#6b7280" />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Financial Reports</h2>
              <div className="flex gap-3">
                <button onClick={exportToPDF} className="btn btn-secondary">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
                <button onClick={() => exportToCSV(financialData.monthlyData, 'monthly-data')} className="btn btn-secondary">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Revenue vs Expenses</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={financialData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Cash Flow Analysis</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={financialData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="cashFlow" stroke="#10b981" strokeWidth={3} name="Cash Flow" />
                    <Line type="monotone" dataKey="netIncome" stroke="#8b5cf6" strokeWidth={2} name="Net Income" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Detailed Financial Summary</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Period</th>
                      <th className="table-header-cell">Revenue</th>
                      <th className="table-header-cell">Expenses</th>
                      <th className="table-header-cell">Net Income</th>
                      <th className="table-header-cell">Cash Flow</th>
                      <th className="table-header-cell">Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {financialData.monthlyData.map((month, index) => (
                      <tr key={index} className="table-row">
                        <td className="table-cell font-medium">{month.month} 2025</td>
                        <td className="table-cell">${month.revenue.toLocaleString()}</td>
                        <td className="table-cell">${month.expenses.toLocaleString()}</td>
                        <td className="table-cell text-green-600">${month.netIncome.toLocaleString()}</td>
                        <td className="table-cell">${month.cashFlow.toLocaleString()}</td>
                        <td className="table-cell">{((month.netIncome / month.revenue) * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Budget Management</h2>
              <button onClick={() => setShowBudgetModal(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Budget Item
              </button>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Budget vs Actual Performance</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={financialData.budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="budgeted" fill="#94a3b8" name="Budgeted" />
                  <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Budget Variance Analysis</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Category</th>
                      <th className="table-header-cell">Budgeted</th>
                      <th className="table-header-cell">Actual</th>
                      <th className="table-header-cell">Variance</th>
                      <th className="table-header-cell">Variance %</th>
                      <th className="table-header-cell">Status</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {financialData.budgetData.map((item, index) => (
                      <tr key={index} className="table-row">
                        <td className="table-cell font-medium">{item.category}</td>
                        <td className="table-cell">${item.budgeted.toLocaleString()}</td>
                        <td className="table-cell">${item.actual.toLocaleString()}</td>
                        <td className={`table-cell ${item.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(item.variance).toLocaleString()}
                        </td>
                        <td className={`table-cell ${item.variancePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.variancePercent >= 0 ? '+' : ''}{item.variancePercent}%
                        </td>
                        <td className="table-cell">
                          {Math.abs(item.variancePercent) <= 5 ? (
                            <span className="badge badge-success">On Track</span>
                          ) : item.variancePercent > 0 ? (
                            <span className="badge badge-success">Under Budget</span>
                          ) : (
                            <span className="badge badge-error">Over Budget</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cashflow' && (
          <div className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Cash Flow Management</h2>
              <div className="flex gap-3">
                <button className="btn btn-secondary">
                  <Calendar className="w-4 h-4" />
                  Forecast
                </button>
                <button className="btn btn-primary">
                  <Plus className="w-4 h-4" />
                  Add Transaction
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card card-padding bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="space-y-2">
                  <p className="text-green-100 text-sm">Cash Inflow</p>
                  <p className="text-3xl font-bold">$425,000</p>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">+18.5% this month</span>
                  </div>
                </div>
              </div>

              <div className="card card-padding bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="space-y-2">
                  <p className="text-red-100 text-sm">Cash Outflow</p>
                  <p className="text-3xl font-bold">$245,000</p>
                  <div className="flex items-center gap-1">
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-sm">-5.2% this month</span>
                  </div>
                </div>
              </div>

              <div className="card card-padding bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="space-y-2">
                  <p className="text-blue-100 text-sm">Net Cash Flow</p>
                  <p className="text-3xl font-bold">$180,000</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">+32.1% this month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">12-Month Cash Flow Projection</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={financialData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="cashFlow" stroke="#10b981" strokeWidth={3} name="Actual Cash Flow" />
                  <Line type="monotone" dataKey="netIncome" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Projected" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Upcoming Receivables</h3>
                <div className="space-y-3">
                  <div className="flex-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Enterprise Client A</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: June 15, 2025</p>
                    </div>
                    <span className="text-green-600 font-semibold">$85,000</span>
                  </div>
                  <div className="flex-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Monthly Subscription</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: June 20, 2025</p>
                    </div>
                    <span className="text-green-600 font-semibold">$25,000</span>
                  </div>
                  <div className="flex-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Project Milestone</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: June 25, 2025</p>
                    </div>
                    <span className="text-green-600 font-semibold">$45,000</span>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Upcoming Payables</h3>
                <div className="space-y-3">
                  <div className="flex-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Payroll</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: June 15, 2025</p>
                    </div>
                    <span className="text-red-600 font-semibold">$65,000</span>
                  </div>
                  <div className="flex-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">Office Rent</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: June 30, 2025</p>
                    </div>
                    <span className="text-red-600 font-semibold">$12,000</span>
                  </div>
                  <div className="flex-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium">AWS Services</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: June 25, 2025</p>
                    </div>
                    <span className="text-red-600 font-semibold">$8,500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Expense Management</h2>
              <button onClick={() => setShowExpenseModal(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Expense
              </button>
            </div>

            <div className="card card-padding">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search expenses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="select"
                >
                  <option value="all">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Personnel">Personnel</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Other">Other</option>
                </select>
                <button onClick={() => exportToCSV(getFilteredExpenses(), 'expenses')} className="btn btn-secondary">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Date</th>
                      <th className="table-header-cell">Description</th>
                      <th className="table-header-cell">Category</th>
                      <th className="table-header-cell">Amount</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {getFilteredExpenses().map((expense) => (
                      <tr key={expense.id} className="table-row">
                        <td className="table-cell">{expense.date}</td>
                        <td className="table-cell">{expense.description}</td>
                        <td className="table-cell">
                          <span className="badge badge-gray">{expense.category}</span>
                        </td>
                        <td className="table-cell font-semibold">${expense.amount.toLocaleString()}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingExpense(expense);
                                setShowExpenseModal(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Invoice Management</h2>
              <button onClick={() => setShowInvoiceModal(true)} className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Invoice
              </button>
            </div>

            <div className="card card-padding">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="select"
                >
                  <option value="all">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Personnel">Personnel</option>
                  <option value="Facilities">Facilities</option>
                  <option value="Other">Other</option>
                </select>
                <button onClick={() => exportToCSV(getFilteredInvoices(), 'invoices')} className="btn btn-secondary">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Invoice #</th>
                      <th className="table-header-cell">Vendor</th>
                      <th className="table-header-cell">Description</th>
                      <th className="table-header-cell">Amount</th>
                      <th className="table-header-cell">Due Date</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {getFilteredInvoices().map((invoice) => (
                      <tr key={invoice.id} className="table-row">
                        <td className="table-cell font-medium">{invoice.invoiceNumber}</td>
                        <td className="table-cell">{invoice.vendor}</td>
                        <td className="table-cell">{invoice.description}</td>
                        <td className="table-cell font-semibold">${invoice.amount.toLocaleString()}</td>
                        <td className="table-cell">{invoice.dueDate}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            invoice.status === 'paid' ? 'badge-success' :
                            invoice.status === 'overdue' ? 'badge-error' : 'badge-warning'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingInvoice(invoice);
                                setShowInvoiceModal(true);
                              }}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
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
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <h2 className="heading-3">Financial Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Expense Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                    <Legend />
                    {financialData.expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {financialData.expenseCategories.map((category, index) => (
                    <div key={index} className="flex-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">${category.amount.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 ml-2">{category.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Profitability Analysis</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-between mb-2">
                      <span className="text-sm font-medium">Gross Margin</span>
                      <span className="text-lg font-bold text-green-600">21.6%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '21.6%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-between mb-2">
                      <span className="text-sm font-medium">Operating Margin</span>
                      <span className="text-lg font-bold text-blue-600">18.2%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '18.2%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-between mb-2">
                      <span className="text-sm font-medium">Net Margin</span>
                      <span className="text-lg font-bold text-purple-600">14.4%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '14.4%' }}></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-between mb-2">
                      <span className="text-sm font-medium">EBITDA Margin</span>
                      <span className="text-lg font-bold text-orange-600">22.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '22.8%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Financial Ratios Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Current Ratio</h4>
                  <p className="text-3xl font-bold text-blue-600">2.1</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Good liquidity</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Ratio</h4>
                  <p className="text-3xl font-bold text-green-600">1.8</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Strong position</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Debt-to-Equity</h4>
                  <p className="text-3xl font-bold text-purple-600">0.65</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Conservative</p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">ROE</h4>
                  <p className="text-3xl font-bold text-orange-600">18.5%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Excellent</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tax' && (
          <div className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Tax Planning & Management</h2>
              <button className="btn btn-primary">
                <Plus className="w-4 h-4" />
                Add Tax Item
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card card-padding">
                <h3 className="heading-6 mb-3">Q2 2025 Summary</h3>
                <div className="space-y-3">
                  <div className="flex-between">
                    <span className="text-sm">Total Deductible</span>
                    <span className="font-semibold text-green-600">$47,500</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-sm">Estimated Tax</span>
                    <span className="font-semibold text-red-600">$24,000</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-sm">Net Tax Benefit</span>
                    <span className="font-semibold text-blue-600">$23,500</span>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-6 mb-3">Upcoming Deadlines</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Q2 Estimated Tax</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Due: June 15, 2025</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Annual Filing</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Due: April 15, 2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-6 mb-3">Tax Planning Tips</h3>
                <div className="space-y-2 text-sm">
                  <p>• Maximize equipment depreciation</p>
                  <p>• Review quarterly estimates</p>
                  <p>• Document business expenses</p>
                  <p>• Consider timing of income</p>
                </div>
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Tax Deductible Items</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Description</th>
                      <th className="table-header-cell">Category</th>
                      <th className="table-header-cell">Amount</th>
                      <th className="table-header-cell">Quarter</th>
                      <th className="table-header-cell">Deductible</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {taxItems.map((item) => (
                      <tr key={item.id} className="table-row">
                        <td className="table-cell">{item.description}</td>
                        <td className="table-cell">
                          <span className="badge badge-gray">{item.category}</span>
                        </td>
                        <td className="table-cell font-semibold">${item.amount.toLocaleString()}</td>
                        <td className="table-cell">{item.quarter}</td>
                        <td className="table-cell">
                          {item.deductible ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-50 rounded">
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
        )}

        {activeTab === 'audit' && (
          <div className="space-y-8">
            <div className="flex-between">
              <h2 className="heading-3">Audit Trail</h2>
              <div className="flex gap-3">
                <button onClick={() => exportToCSV(auditLogs, 'audit-trail')} className="btn btn-secondary">
                  <Download className="w-4 h-4" />
                  Export Logs
                </button>
                <button className="btn btn-primary">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="card card-padding">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex-center">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{auditLogs.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {auditLogs.filter(log => log.action.includes('Created') || log.action.includes('Updated')).length}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Modifications</p>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex-center">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Today</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Last Activity</p>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex-center">
                    <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">Secure</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-padding">
              <div className="flex items-center gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input flex-1"
                />
                <select className="select">
                  <option value="all">All Actions</option>
                  <option value="Created">Created</option>
                  <option value="Updated">Updated</option>
                  <option value="Deleted">Deleted</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Timestamp</th>
                      <th className="table-header-cell">User</th>
                      <th className="table-header-cell">Action</th>
                      <th className="table-header-cell">Details</th>
                      <th className="table-header-cell">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {auditLogs
                      .filter(log => 
                        searchTerm === '' || 
                        log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.user.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((log) => (
                        <tr key={log.id} className="table-row">
                          <td className="table-cell text-sm">{log.timestamp}</td>
                          <td className="table-cell">{log.user}</td>
                          <td className="table-cell">
                            <span className={`badge ${
                              log.action.includes('Created') ? 'badge-success' :
                              log.action.includes('Updated') ? 'badge-primary' :
                              log.action.includes('Deleted') ? 'badge-error' : 'badge-gray'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="table-cell">{log.details}</td>
                          <td className="table-cell">
                            {log.amount ? `$${log.amount.toLocaleString()}` : '-'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            <h2 className="heading-3">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input type="text" defaultValue="Your Company Name" className="input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Fiscal Year Start</label>
                    <select className="select">
                      <option>January</option>
                      <option>April</option>
                      <option>July</option>
                      <option>October</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select className="select">
                      <option>USD - US Dollar</option>
                      <option>EUR - Euro</option>
                      <option>GBP - British Pound</option>
                      <option>CAD - Canadian Dollar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <select className="select">
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex-between">
                    <div>
                      <p className="font-medium">Invoice Reminders</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Get notified about upcoming payments</p>
                    </div>
                    <div className="toggle toggle-checked">
                      <div className="toggle-thumb"></div>
                    </div>
                  </div>
                  <div className="flex-between">
                    <div>
                      <p className="font-medium">Budget Alerts</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Alert when approaching budget limits</p>
                    </div>
                    <div className="toggle toggle-checked">
                      <div className="toggle-thumb"></div>
                    </div>
                  </div>
                  <div className="flex-between">
                    <div>
                      <p className="font-medium">Cash Flow Warnings</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Notify about cash flow issues</p>
                    </div>
                    <div className="toggle">
                      <div className="toggle-thumb"></div>
                    </div>
                  </div>
                  <div className="flex-between">
                    <div>
                      <p className="font-medium">Weekly Reports</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Receive weekly financial summaries</p>
                    </div>
                    <div className="toggle toggle-checked">
                      <div className="toggle-thumb"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Data Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="btn btn-secondary">
                  <Upload className="w-4 h-4" />
                  Import Data
                </button>
                <button onClick={() => exportToCSV(financialData.monthlyData, 'all-financial-data')} className="btn btn-secondary">
                  <Download className="w-4 h-4" />
                  Export All Data
                </button>
                <button className="btn btn-secondary">
                  <RefreshCw className="w-4 h-4" />
                  Backup Data
                </button>
                <button 
                  onClick={() => {
                    if (window.confirm && window.confirm('Are you sure? This will delete all data.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="btn btn-error"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
            </div>

            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Account & Security</h3>
              <div className="space-y-4">
                <div className="flex-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
                  </div>
                  <button className="btn btn-primary btn-sm">Enable</button>
                </div>
                <div className="flex-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Auto-logout after inactivity</p>
                  </div>
                  <select className="select w-32">
                    <option>30 minutes</option>
                    <option>1 hour</option>
                    <option>4 hours</option>
                    <option>Never</option>
                  </select>
                </div>
                <div className="flex-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light theme</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`toggle ${isDark ? 'toggle-checked' : ''}`}
                  >
                    <div className="toggle-thumb"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="modal-backdrop" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvoiceModal(false);
              setEditingInvoice(null);
              setSelectedFile(null);
            }
          }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="heading-5">{editingInvoice ? 'Edit Invoice' : 'Add New Invoice'}</h3>
                <button 
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setEditingInvoice(null);
                    setSelectedFile(null);
                  }}
                  className="btn btn-ghost p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="modal-body space-y-4">
                {!editingInvoice && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">AI Invoice Extraction</h4>
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      Upload an invoice document and let AI extract the information automatically.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        id="invoice-file-upload"
                      />
                      <label htmlFor="invoice-file-upload" className="btn btn-secondary btn-sm cursor-pointer">
                        <Upload className="w-4 h-4" />
                        Upload Invoice
                      </label>
                      
                      {selectedFile && (
                        <>
                          <span className="text-sm text-blue-700 dark:text-blue-300">
                            {selectedFile.name}
                          </span>
                          <button
                            onClick={handleInvoiceAIExtraction}
                            disabled={isAiLoading}
                            className="btn btn-primary btn-sm"
                          >
                            {isAiLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Extracting...
                              </>
                            ) : (
                              <>
                                <Brain className="w-4 h-4" />
                                Extract Data
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <InvoiceForm 
                  invoice={editingInvoice}
                  onSave={handleSaveInvoice}
                  onCancel={() => {
                    setShowInvoiceModal(false);
                    setEditingInvoice(null);
                    setSelectedFile(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Expense Modal */}
        {showExpenseModal && (
          <div className="modal-backdrop" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExpenseModal(false);
              setEditingExpense(null);
            }
          }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="heading-5">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
                <button 
                  onClick={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                  }}
                  className="btn btn-ghost p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="modal-body">
                <ExpenseForm 
                  expense={editingExpense}
                  onSave={handleSaveExpense}
                  onCancel={() => {
                    setShowExpenseModal(false);
                    setEditingExpense(null);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Budget Modal */}
        {showBudgetModal && (
          <div className="modal-backdrop" onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowBudgetModal(false);
            }
          }}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="heading-5">Add Budget Item</h3>
                <button 
                  onClick={() => setShowBudgetModal(false)}
                  className="btn btn-ghost p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="modal-body">
                <BudgetForm 
                  onSave={(budgetData) => {
                    if (financialData) {
                      const newBudgetItem: BudgetData = {
                        category: budgetData.category || '',
                        budgeted: budgetData.budgeted || 0,
                        actual: budgetData.actual || 0,
                        variance: (budgetData.actual || 0) - (budgetData.budgeted || 0),
                        variancePercent: budgetData.budgeted ? (((budgetData.actual || 0) - (budgetData.budgeted || 0)) / (budgetData.budgeted || 1)) * 100 : 0
                      };
                      const updatedData = {
                        ...financialData,
                        budgetData: [...financialData.budgetData, newBudgetItem]
                      };
                      saveFinancialData(updatedData);
                      addAuditLog('Created Budget Item', `New budget: ${newBudgetItem.category}`, newBudgetItem.budgeted);
                    }
                    setShowBudgetModal(false);
                  }}
                  onCancel={() => setShowBudgetModal(false)}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
        <div className="container-lg mx-auto px-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Invoice Form Component
function InvoiceForm({ invoice, onSave, onCancel }: {
  invoice: Invoice | null;
  onSave: (data: Partial<Invoice>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    invoiceNumber: invoice?.invoiceNumber || '',
    vendor: invoice?.vendor || '',
    amount: invoice?.amount || 0,
    dueDate: invoice?.dueDate || '',
    description: invoice?.description || '',
    category: invoice?.category || 'Other',
    status: invoice?.status || 'pending' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label">Invoice Number</label>
        <input
          type="text"
          value={formData.invoiceNumber}
          onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Vendor</label>
        <input
          type="text"
          value={formData.vendor}
          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Amount</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Due Date</label>
        <input
          type="date"
          value={formData.dueDate}
          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="textarea"
          rows={3}
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="select"
        >
          <option value="Technology">Technology</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
          <option value="Personnel">Personnel</option>
          <option value="Facilities">Facilities</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'paid' | 'pending' | 'overdue' })}
          className="select"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {invoice ? 'Update' : 'Save'} Invoice
        </button>
      </div>
    </form>
  );
}

// Expense Form Component
function ExpenseForm({ expense, onSave, onCancel }: {
  expense: Expense | null;
  onSave: (data: Partial<Expense>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    amount: expense?.amount || 0,
    category: expense?.category || 'Other'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Amount</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="select"
        >
          <option value="Technology">Technology</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
          <option value="Personnel">Personnel</option>
          <option value="Facilities">Facilities</option>
          <option value="Other">Other</option>
        </select>
      </div>
      
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {expense ? 'Update' : 'Save'} Expense
        </button>
      </div>
    </form>
  );
}

// Budget Form Component
function BudgetForm({ onSave, onCancel }: {
  onSave: (data: Partial<BudgetData>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    category: '',
    budgeted: 0,
    actual: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label">Category</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Budgeted Amount</label>
        <input
          type="number"
          value={formData.budgeted}
          onChange={(e) => setFormData({ ...formData, budgeted: Number(e.target.value) })}
          className="input"
          required
        />
      </div>
      
      <div className="form-group">
        <label className="form-label">Actual Amount</label>
        <input
          type="number"
          value={formData.actual}
          onChange={(e) => setFormData({ ...formData, actual: Number(e.target.value) })}
          className="input"
          required
        />
      </div>
      
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          Add Budget Item
        </button>
      </div>
    </form>
  );
}

export default App;