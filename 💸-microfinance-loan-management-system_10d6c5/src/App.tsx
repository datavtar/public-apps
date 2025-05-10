import React, { useState, useEffect } from 'react';
import {
  User,
  DollarSign,
  Percent,
  CreditCard,
  TrendingUp,
  Calendar,
  Filter,
  Search,
  Plus,
  Moon,
  Sun,
  X,
  Edit,
  Trash2,
  ArrowUpDown,
  Check,
  FileText,
  PieChart as PieChartLucideIcon, // Aliased to avoid conflict
  BarChart as BarChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Define types
interface Loan {
  id: string;
  customerId: string;
  amount: number;
  interestRate: number;
  term: number; // in months
  status: 'pending' | 'active' | 'paid' | 'defaulted';
  startDate: string;
  endDate: string;
  paymentsMade: number;
  totalPayments: number;
  nextPaymentDate: string;
  createdAt: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedDate: string;
  creditScore: number;
  incomeLevel: 'low' | 'medium' | 'high';
  activeLoans: number;
  completedLoans: number;
  totalBorrowed: number;
}

interface Payment {
  id: string;
  loanId: string;
  customerId: string;
  amount: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  method: 'cash' | 'bank_transfer' | 'mobile_money';
}

type TabType = 'dashboard' | 'loans' | 'customers' | 'payments' | 'reports';

interface LoanStats {
  totalActiveLoans: number;
  totalAmountLent: number;
  totalPendingRepayments: number;
  loanDefaultRate: number;
}

interface DashboardStats {
  totalCustomers: number;
  totalLoans: number;
  totalPayments: number;
  activeLoans: number;
  completedLoans: number;
  pendingLoans: number;
  defaultedLoans: number;
  totalAmountLent: number;
  totalAmountCollected: number;
  averageInterestRate: number;
}

interface SortConfig {
  key: string;
  direction: 'ascending' | 'descending';
}

interface FilterConfig {
  loans: {
    status?: 'pending' | 'active' | 'paid' | 'defaulted';
    amountMin?: number;
    amountMax?: number;
  };
  customers: {
    incomeLevel?: 'low' | 'medium' | 'high';
    creditScoreMin?: number;
    creditScoreMax?: number;
  };
  payments: {
    status?: 'pending' | 'completed' | 'failed';
    method?: 'cash' | 'bank_transfer' | 'mobile_money';
  };
}

const App: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalLoans: 0,
    totalPayments: 0,
    activeLoans: 0,
    completedLoans: 0,
    pendingLoans: 0,
    defaultedLoans: 0,
    totalAmountLent: 0,
    totalAmountCollected: 0,
    averageInterestRate: 0
  });
  const [isAddingLoan, setIsAddingLoan] = useState<boolean>(false);
  const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(false);
  const [isAddingPayment, setIsAddingPayment] = useState<boolean>(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [search, setSearch] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'createdAt', direction: 'descending' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    loans: {},
    customers: {},
    payments: {}
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [newLoan, setNewLoan] = useState<Partial<Loan>>({
    amount: 0,
    interestRate: 5,
    term: 12,
    status: 'pending',
    paymentsMade: 0
  });
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    email: '',
    phone: '',
    address: '',
    creditScore: 650,
    incomeLevel: 'medium',
    activeLoans: 0,
    completedLoans: 0,
    totalBorrowed: 0
  });
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({
    amount: 0,
    status: 'pending',
    method: 'cash'
  });
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedLoans = localStorage.getItem('loans');
        const savedCustomers = localStorage.getItem('customers');
        const savedPayments = localStorage.getItem('payments');
        
        if (savedLoans) setLoans(JSON.parse(savedLoans));
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        if (savedPayments) setPayments(JSON.parse(savedPayments));
        
        // Generate sample data if none exists
        if (!savedLoans && !savedCustomers && !savedPayments) {
          generateSampleData();
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        // Fallback to sample data if there's an error
        generateSampleData();
      }
    };
    
    loadData();
  }, []);
  
  // Update dashboard stats whenever data changes
  useEffect(() => {
    calculateDashboardStats();
  }, [loans, customers, payments]);
  
  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  // Generate sample data for demo purposes
  const generateSampleData = () => {
    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        address: '123 Main St, City',
        joinedDate: '2023-01-15',
        creditScore: 720,
        incomeLevel: 'medium',
        activeLoans: 1,
        completedLoans: 2,
        totalBorrowed: 5000
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+9876543210',
        address: '456 Oak Ave, Town',
        joinedDate: '2023-02-20',
        creditScore: 680,
        incomeLevel: 'high',
        activeLoans: 1,
        completedLoans: 0,
        totalBorrowed: 3000
      },
      {
        id: '3',
        name: 'Michael Johnson',
        email: 'michael@example.com',
        phone: '+2345678901',
        address: '789 Pine Rd, Village',
        joinedDate: '2023-03-10',
        creditScore: 620,
        incomeLevel: 'low',
        activeLoans: 1,
        completedLoans: 1,
        totalBorrowed: 2000
      }
    ];
    
    const sampleLoans: Loan[] = [
      {
        id: '1',
        customerId: '1',
        amount: 2000,
        interestRate: 5,
        term: 12,
        status: 'active',
        startDate: '2023-05-10',
        endDate: '2024-05-10',
        paymentsMade: 3,
        totalPayments: 12,
        nextPaymentDate: '2023-08-10',
        createdAt: '2023-05-01'
      },
      {
        id: '2',
        customerId: '2',
        amount: 3000,
        interestRate: 7.5,
        term: 24,
        status: 'active',
        startDate: '2023-06-15',
        endDate: '2025-06-15',
        paymentsMade: 2,
        totalPayments: 24,
        nextPaymentDate: '2023-08-15',
        createdAt: '2023-06-01'
      },
      {
        id: '3',
        customerId: '3',
        amount: 1000,
        interestRate: 10,
        term: 6,
        status: 'active',
        startDate: '2023-07-01',
        endDate: '2024-01-01',
        paymentsMade: 1,
        totalPayments: 6,
        nextPaymentDate: '2023-08-01',
        createdAt: '2023-06-25'
      },
      {
        id: '4',
        customerId: '1',
        amount: 1500,
        interestRate: 6,
        term: 12,
        status: 'paid',
        startDate: '2022-01-10',
        endDate: '2023-01-10',
        paymentsMade: 12,
        totalPayments: 12,
        nextPaymentDate: '2023-01-10',
        createdAt: '2022-01-01'
      },
      {
        id: '5',
        customerId: '1',
        amount: 1000,
        interestRate: 8,
        term: 6,
        status: 'paid',
        startDate: '2022-08-15',
        endDate: '2023-02-15',
        paymentsMade: 6,
        totalPayments: 6,
        nextPaymentDate: '2023-02-15',
        createdAt: '2022-08-01'
      },
      {
        id: '6',
        customerId: '3',
        amount: 500,
        interestRate: 12,
        term: 3,
        status: 'paid',
        startDate: '2022-10-01',
        endDate: '2023-01-01',
        paymentsMade: 3,
        totalPayments: 3,
        nextPaymentDate: '2023-01-01',
        createdAt: '2022-09-15'
      }
    ];
    
    const samplePayments: Payment[] = [
      {
        id: '1',
        loanId: '1',
        customerId: '1',
        amount: 175,
        date: '2023-06-10',
        status: 'completed',
        method: 'bank_transfer'
      },
      {
        id: '2',
        loanId: '1',
        customerId: '1',
        amount: 175,
        date: '2023-07-10',
        status: 'completed',
        method: 'mobile_money'
      },
      {
        id: '3',
        loanId: '1',
        customerId: '1',
        amount: 175,
        date: '2023-08-10',
        status: 'pending',
        method: 'cash'
      },
      {
        id: '4',
        loanId: '2',
        customerId: '2',
        amount: 134,
        date: '2023-07-15',
        status: 'completed',
        method: 'bank_transfer'
      },
      {
        id: '5',
        loanId: '2',
        customerId: '2',
        amount: 134,
        date: '2023-08-15',
        status: 'pending',
        method: 'bank_transfer'
      },
      {
        id: '6',
        loanId: '3',
        customerId: '3',
        amount: 177,
        date: '2023-08-01',
        status: 'completed',
        method: 'cash'
      },
      {
        id: '7',
        loanId: '3',
        customerId: '3',
        amount: 177,
        date: '2023-09-01',
        status: 'pending',
        method: 'cash'
      }
    ];
    
    setCustomers(sampleCustomers);
    setLoans(sampleLoans);
    setPayments(samplePayments);
    
    localStorage.setItem('customers', JSON.stringify(sampleCustomers));
    localStorage.setItem('loans', JSON.stringify(sampleLoans));
    localStorage.setItem('payments', JSON.stringify(samplePayments));
  };
  
  // Calculate dashboard statistics
  const calculateDashboardStats = () => {
    const stats: DashboardStats = {
      totalCustomers: customers.length,
      totalLoans: loans.length,
      totalPayments: payments.length,
      activeLoans: loans.filter(loan => loan.status === 'active').length,
      completedLoans: loans.filter(loan => loan.status === 'paid').length,
      pendingLoans: loans.filter(loan => loan.status === 'pending').length,
      defaultedLoans: loans.filter(loan => loan.status === 'defaulted').length,
      totalAmountLent: loans.reduce((sum, loan) => sum + loan.amount, 0),
      totalAmountCollected: payments.filter(payment => payment.status === 'completed')
        .reduce((sum, payment) => sum + payment.amount, 0),
      averageInterestRate: loans.length > 0
        ? loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length
        : 0
    };
    
    setDashboardStats(stats);
  };
  
  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem('loans', JSON.stringify(loans));
    localStorage.setItem('customers', JSON.stringify(customers));
    localStorage.setItem('payments', JSON.stringify(payments));
  };
  
  // Generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };
  
  // Add new loan
  const handleAddLoan = () => {
    const customer = customers.find(c => c.id === newLoan.customerId);
    if (!customer) return;
    
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (newLoan.term || 12));
    
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    
    const loan: Loan = {
      id: generateId(),
      customerId: newLoan.customerId || '',
      amount: newLoan.amount || 0,
      interestRate: newLoan.interestRate || 5,
      term: newLoan.term || 12,
      status: 'active',
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      paymentsMade: 0,
      totalPayments: newLoan.term || 12,
      nextPaymentDate: nextPaymentDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedCustomer = {
      ...customer,
      activeLoans: customer.activeLoans + 1,
      totalBorrowed: customer.totalBorrowed + (newLoan.amount || 0)
    };
    
    setLoans([...loans, loan]);
    setCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c));
    setIsAddingLoan(false);
    setNewLoan({
      amount: 0,
      interestRate: 5,
      term: 12,
      status: 'pending',
      paymentsMade: 0
    });
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Update loan
  const handleUpdateLoan = () => {
    if (!editingLoan) return;
    
    setLoans(loans.map(loan => loan.id === editingLoan.id ? editingLoan : loan));
    setEditingLoan(null);
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Delete loan
  const handleDeleteLoan = (id: string) => {
    const loanToDelete = loans.find(loan => loan.id === id);
    if (!loanToDelete) return;
    
    const customer = customers.find(c => c.id === loanToDelete.customerId);
    if (!customer) return;
    
    const updatedCustomer = {
      ...customer,
      activeLoans: loanToDelete.status === 'active' ? customer.activeLoans - 1 : customer.activeLoans,
      completedLoans: loanToDelete.status === 'paid' ? customer.completedLoans - 1 : customer.completedLoans
    };
    
    setLoans(loans.filter(loan => loan.id !== id));
    setPayments(payments.filter(payment => payment.loanId !== id));
    setCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c));
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Add new customer
  const handleAddCustomer = () => {
    const customer: Customer = {
      id: generateId(),
      name: newCustomer.name || '',
      email: newCustomer.email || '',
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      joinedDate: new Date().toISOString().split('T')[0],
      creditScore: newCustomer.creditScore || 650,
      incomeLevel: newCustomer.incomeLevel || 'medium',
      activeLoans: 0,
      completedLoans: 0,
      totalBorrowed: 0
    };
    
    setCustomers([...customers, customer]);
    setIsAddingCustomer(false);
    setNewCustomer({
      name: '',
      email: '',
      phone: '',
      address: '',
      creditScore: 650,
      incomeLevel: 'medium',
      activeLoans: 0,
      completedLoans: 0,
      totalBorrowed: 0
    });
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Update customer
  const handleUpdateCustomer = () => {
    if (!editingCustomer) return;
    
    setCustomers(customers.map(customer => customer.id === editingCustomer.id ? editingCustomer : customer));
    setEditingCustomer(null);
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Delete customer
  const handleDeleteCustomer = (id: string) => {
    // Check if customer has active loans
    const hasActiveLoans = loans.some(loan => 
      loan.customerId === id && loan.status === 'active'
    );
    
    if (hasActiveLoans) {
      alert('Cannot delete customer with active loans.');
      return;
    }
    
    setCustomers(customers.filter(customer => customer.id !== id));
    setLoans(loans.filter(loan => loan.customerId !== id));
    setPayments(payments.filter(payment => payment.customerId !== id));
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Add new payment
  const handleAddPayment = () => {
    const loan = loans.find(l => l.id === newPayment.loanId);
    if (!loan) return;
    
    const payment: Payment = {
      id: generateId(),
      loanId: newPayment.loanId || '',
      customerId: loan.customerId,
      amount: newPayment.amount || 0,
      date: new Date().toISOString().split('T')[0],
      status: 'completed',
      method: newPayment.method || 'cash'
    };
    
    // Update loan with payment
    const updatedLoan = {
      ...loan,
      paymentsMade: loan.paymentsMade + 1,
      status: loan.paymentsMade + 1 >= loan.totalPayments ? 'paid' : loan.status,
      nextPaymentDate: loan.paymentsMade + 1 >= loan.totalPayments 
        ? loan.endDate 
        : new Date(loan.nextPaymentDate).setMonth(new Date(loan.nextPaymentDate).getMonth() + 1).toString()
    };
    
    const customer = customers.find(c => c.id === loan.customerId);
    if (!customer) return;
    
    const updatedCustomer = {
      ...customer,
      activeLoans: updatedLoan.status === 'paid' ? customer.activeLoans - 1 : customer.activeLoans,
      completedLoans: updatedLoan.status === 'paid' ? customer.completedLoans + 1 : customer.completedLoans
    };
    
    setPayments([...payments, payment]);
    setLoans(loans.map(l => l.id === loan.id ? updatedLoan : l));
    setCustomers(customers.map(c => c.id === customer.id ? updatedCustomer : c));
    setIsAddingPayment(false);
    setNewPayment({
      amount: 0,
      status: 'pending',
      method: 'cash'
    });
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Update payment
  const handleUpdatePayment = () => {
    if (!editingPayment) return;
    
    setPayments(payments.map(payment => payment.id === editingPayment.id ? editingPayment : payment));
    setEditingPayment(null);
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Delete payment
  const handleDeletePayment = (id: string) => {
    const paymentToDelete = payments.find(payment => payment.id === id);
    if (!paymentToDelete || paymentToDelete.status === 'completed') {
      alert('Cannot delete completed payments.');
      return;
    }
    
    setPayments(payments.filter(payment => payment.id !== id));
    
    // Update localStorage
    setTimeout(saveData, 0);
  };
  
  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
    });
  };
  
  // Filter data based on search and filter config
  const getFilteredData = (data: any[], type: 'loans' | 'customers' | 'payments') => {
    return data.filter(item => {
      // Apply search filter
      const searchFields = {
        loans: ['id', 'customerId'],
        customers: ['name', 'email', 'phone'],
        payments: ['id', 'loanId', 'customerId']
      };
      
      const searchMatch = search === '' || searchFields[type].some(field => 
        item[field]?.toLowerCase().includes(search.toLowerCase())
      );
      
      if (!searchMatch) return false;
      
      // Apply specific filters based on type
      switch (type) {
        case 'loans':
          const loanFilters = filterConfig.loans;
          return (
            (loanFilters.status === undefined || item.status === loanFilters.status) &&
            (loanFilters.amountMin === undefined || item.amount >= loanFilters.amountMin) &&
            (loanFilters.amountMax === undefined || item.amount <= loanFilters.amountMax)
          );
        
        case 'customers':
          const customerFilters = filterConfig.customers;
          return (
            (customerFilters.incomeLevel === undefined || item.incomeLevel === customerFilters.incomeLevel) &&
            (customerFilters.creditScoreMin === undefined || item.creditScore >= customerFilters.creditScoreMin) &&
            (customerFilters.creditScoreMax === undefined || item.creditScore <= customerFilters.creditScoreMax)
          );
        
        case 'payments':
          const paymentFilters = filterConfig.payments;
          return (
            (paymentFilters.status === undefined || item.status === paymentFilters.status) &&
            (paymentFilters.method === undefined || item.method === paymentFilters.method)
          );
        
        default:
          return true;
      }
    });
  };
  
  // Sort data
  const getSortedData = (data: any[]) => {
    return [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilterConfig({
      loans: {},
      customers: {},
      payments: {}
    });
    setShowFilters(false);
  };
  
  // Get customer name by ID
  const getCustomerName = (id: string): string => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown';
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Calculate monthly payment for a loan
  const calculateMonthlyPayment = (loan: Loan): number => {
    const principal = loan.amount;
    const monthlyRate = loan.interestRate / 100 / 12;
    const numberOfPayments = loan.term;
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(payment * 100) / 100;
  };
  
  // Prepare chart data
  const getLoanStatusChartData = () => {
    return [
      { name: 'Active', value: dashboardStats.activeLoans, color: '#3B82F6' },
      { name: 'Completed', value: dashboardStats.completedLoans, color: '#10B981' },
      { name: 'Pending', value: dashboardStats.pendingLoans, color: '#F59E0B' },
      { name: 'Defaulted', value: dashboardStats.defaultedLoans, color: '#EF4444' }
    ];
  };
  
  const getMonthlyPaymentsData = () => {
    const monthlyData: { [key: string]: number } = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' });
      monthlyData[monthName] = 0;
    }
    
    // Populate with actual data
    payments.filter(payment => {
      const paymentYear = new Date(payment.date).getFullYear();
      return paymentYear === currentYear && payment.status === 'completed';
    }).forEach(payment => {
      const monthName = new Date(payment.date).toLocaleString('default', { month: 'short' });
      monthlyData[monthName] += payment.amount;
    });
    
    // Convert to array format for chart
    return Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }));
  };
  
  const getLoanGrowthData = () => {
    const monthlyData: { [key: string]: { count: number, amount: number } } = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const monthName = new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' });
      monthlyData[monthName] = { count: 0, amount: 0 };
    }
    
    // Populate with actual data
    loans.filter(loan => {
      const loanYear = new Date(loan.startDate).getFullYear();
      return loanYear === currentYear;
    }).forEach(loan => {
      const monthName = new Date(loan.startDate).toLocaleString('default', { month: 'short' });
      monthlyData[monthName].count += 1;
      monthlyData[monthName].amount += loan.amount;
    });
    
    // Convert to array format for chart
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      count: data.count,
      amount: data.amount
    }));
  };
  
  // Calculate loan repayment schedule
  const calculateRepaymentSchedule = (loan: Loan) => {
    const monthlyPayment = calculateMonthlyPayment(loan);
    const schedule = [];
    
    let remainingBalance = loan.amount;
    let startDate = new Date(loan.startDate);
    
    for (let i = 1; i <= loan.term; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setMonth(startDate.getMonth() + i);
      
      const interestPayment = remainingBalance * (loan.interestRate / 100 / 12);
      const principalPayment = monthlyPayment - interestPayment;
      
      remainingBalance -= principalPayment;
      
      schedule.push({
        paymentNumber: i,
        paymentDate: paymentDate.toISOString().split('T')[0],
        paymentAmount: monthlyPayment,
        principalPayment,
        interestPayment,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
    
    return schedule;
  };
  
  // Render loan status badge
  const renderLoanStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-info">Active</span>;
      case 'paid':
        return <span className="badge badge-success">Paid</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'defaulted':
        return <span className="badge badge-error">Defaulted</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  // Render payment status badge
  const renderPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'pending':
        return <span className="badge badge-warning">Pending</span>;
      case 'failed':
        return <span className="badge badge-error">Failed</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };
  
  // Render payment method badge
  const renderPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Cash</span>;
      case 'bank_transfer':
        return <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Bank Transfer</span>;
      case 'mobile_money':
        return <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Mobile Money</span>;
      default:
        return <span className="badge">{method}</span>;
    }
  };
  
  // Render credit score indicator
  const renderCreditScoreIndicator = (score: number) => {
    let colorClass = '';
    let label = '';
    
    if (score >= 750) {
      colorClass = 'bg-green-500';
      label = 'Excellent';
    } else if (score >= 700) {
      colorClass = 'bg-green-400';
      label = 'Very Good';
    } else if (score >= 650) {
      colorClass = 'bg-yellow-400';
      label = 'Good';
    } else if (score >= 600) {
      colorClass = 'bg-orange-400';
      label = 'Fair';
    } else {
      colorClass = 'bg-red-500';
      label = 'Poor';
    }
    
    return (
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${(score / 850) * 100}%` }}></div>
          </div>
          <span className="text-sm font-medium">{score}</span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      </div>
    );
  };
  
  // Render income level badge
  const renderIncomeLevelBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Low</span>;
      case 'medium':
        return <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Medium</span>;
      case 'high':
        return <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">High</span>;
      default:
        return <span className="badge">{level}</span>;
    }
  };
  
  // Handle key press in modals
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAddingLoan(false);
        setIsAddingCustomer(false);
        setIsAddingPayment(false);
        setEditingLoan(null);
        setEditingCustomer(null);
        setEditingPayment(null);
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center">
              <CreditCard className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">MicroFinance Manager</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container-fluid">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-4 text-sm font-medium ${activeTab === 'dashboard' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-4 py-4 text-sm font-medium ${activeTab === 'loans' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
              aria-current={activeTab === 'loans' ? 'page' : undefined}
            >
              Loans
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-4 text-sm font-medium ${activeTab === 'customers' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
              aria-current={activeTab === 'customers' ? 'page' : undefined}
            >
              Customers
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-4 text-sm font-medium ${activeTab === 'payments' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
              aria-current={activeTab === 'payments' ? 'page' : undefined}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-4 text-sm font-medium ${activeTab === 'reports' ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400'}`}
              aria-current={activeTab === 'reports' ? 'page' : undefined}
            >
              Reports
            </button>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Total Customers</p>
                    <p className="stat-value">{dashboardStats.totalCustomers}</p>
                  </div>
                  <User className="h-10 w-10 text-primary-500 bg-primary-100 p-2 rounded-full dark:bg-primary-900" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Active Loans</p>
                    <p className="stat-value">{dashboardStats.activeLoans}</p>
                  </div>
                  <CreditCard className="h-10 w-10 text-green-500 bg-green-100 p-2 rounded-full dark:bg-green-900" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Total Disbursed</p>
                    <p className="stat-value">{formatCurrency(dashboardStats.totalAmountLent)}</p>
                  </div>
                  <DollarSign className="h-10 w-10 text-blue-500 bg-blue-100 p-2 rounded-full dark:bg-blue-900" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Avg. Interest Rate</p>
                    <p className="stat-value">{dashboardStats.averageInterestRate.toFixed(2)}%</p>
                  </div>
                  <Percent className="h-10 w-10 text-purple-500 bg-purple-100 p-2 rounded-full dark:bg-purple-900" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Loan Status Chart */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Loan Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getLoanStatusChartData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getLoanStatusChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} loans`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Monthly Payments Chart */}
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Monthly Payments Collected</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMonthlyPaymentsData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                      <Bar dataKey="amount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Loan Growth Chart */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Loan Growth Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={getLoanGrowthData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'amount') return [formatCurrency(value as number), 'Amount'];
                      return [value, 'Count'];
                    }} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="count" name="Number of Loans" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="amount" name="Amount Disbursed" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Recent Activities */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Recent Loan Activities</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3">Customer</th>
                      <th className="table-header px-6 py-3">Loan ID</th>
                      <th className="table-header px-6 py-3">Amount</th>
                      <th className="table-header px-6 py-3">Date</th>
                      <th className="table-header px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {loans.slice(0, 5).map(loan => (
                      <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="table-cell">{getCustomerName(loan.customerId)}</td>
                        <td className="table-cell">#{loan.id}</td>
                        <td className="table-cell">{formatCurrency(loan.amount)}</td>
                        <td className="table-cell">{formatDate(loan.createdAt)}</td>
                        <td className="table-cell">{renderLoanStatusBadge(loan.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Loans</h2>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search loans..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                <button 
                  className="btn btn-primary flex items-center justify-center gap-2"
                  onClick={() => setIsAddingLoan(true)}
                >
                  <Plus className="h-5 w-5" /> New Loan
                </button>
                
                <button 
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white flex items-center justify-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" /> Filter
                </button>
              </div>
            </div>
            
            {/* Filters */}
            {showFilters && (
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Filter Loans</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="input"
                      value={filterConfig.loans.status || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        loans: {
                          ...filterConfig.loans,
                          status: e.target.value ? e.target.value as 'pending' | 'active' | 'paid' | 'defaulted' : undefined
                        }
                      })}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="paid">Paid</option>
                      <option value="defaulted">Defaulted</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Min Amount</label>
                    <input 
                      type="number" 
                      className="input"
                      value={filterConfig.loans.amountMin || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        loans: {
                          ...filterConfig.loans,
                          amountMin: e.target.value ? Number(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Max Amount</label>
                    <input 
                      type="number" 
                      className="input"
                      value={filterConfig.loans.amountMax || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        loans: {
                          ...filterConfig.loans,
                          amountMax: e.target.value ? Number(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white mr-2" onClick={resetFilters}>Reset</button>
                </div>
              </div>
            )}
            
            {/* Loans Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('id')}>
                        <div className="flex items-center">
                          ID
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3">Customer</th>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('amount')}>
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('interestRate')}>
                        <div className="flex items-center">
                          Interest Rate
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3">Term (Months)</th>
                      <th className="table-header px-6 py-3">Start Date</th>
                      <th className="table-header px-6 py-3">Progress</th>
                      <th className="table-header px-6 py-3">Status</th>
                      <th className="table-header px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {getSortedData(getFilteredData(loans, 'loans')).map(loan => (
                      <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="table-cell">#{loan.id}</td>
                        <td className="table-cell">{getCustomerName(loan.customerId)}</td>
                        <td className="table-cell">{formatCurrency(loan.amount)}</td>
                        <td className="table-cell">{loan.interestRate}%</td>
                        <td className="table-cell">{loan.term}</td>
                        <td className="table-cell">{formatDate(loan.startDate)}</td>
                        <td className="table-cell">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
                            <div 
                              className={`h-2.5 rounded-full ${loan.status === 'paid' ? 'bg-green-500' : 'bg-blue-500'}`} 
                              style={{ width: `${(loan.paymentsMade / loan.totalPayments) * 100}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {loan.paymentsMade} of {loan.totalPayments} payments
                          </div>
                        </td>
                        <td className="table-cell">{renderLoanStatusBadge(loan.status)}</td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => setEditingLoan(loan)}
                              aria-label="Edit loan"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteLoan(loan.id)}
                              aria-label="Delete loan"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {getFilteredData(loans, 'loans').length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No loans found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Customers</h2>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search customers..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                <button 
                  className="btn btn-primary flex items-center justify-center gap-2"
                  onClick={() => setIsAddingCustomer(true)}
                >
                  <Plus className="h-5 w-5" /> New Customer
                </button>
                
                <button 
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white flex items-center justify-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" /> Filter
                </button>
              </div>
            </div>
            
            {/* Filters */}
            {showFilters && (
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Filter Customers</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label">Income Level</label>
                    <select 
                      className="input"
                      value={filterConfig.customers.incomeLevel || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        customers: {
                          ...filterConfig.customers,
                          incomeLevel: e.target.value ? e.target.value as 'low' | 'medium' | 'high' : undefined
                        }
                      })}
                    >
                      <option value="">All Levels</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Min Credit Score</label>
                    <input 
                      type="number" 
                      className="input"
                      value={filterConfig.customers.creditScoreMin || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        customers: {
                          ...filterConfig.customers,
                          creditScoreMin: e.target.value ? Number(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Max Credit Score</label>
                    <input 
                      type="number" 
                      className="input"
                      value={filterConfig.customers.creditScoreMax || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        customers: {
                          ...filterConfig.customers,
                          creditScoreMax: e.target.value ? Number(e.target.value) : undefined
                        }
                      })}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white mr-2" onClick={resetFilters}>Reset</button>
                </div>
              </div>
            )}
            
            {/* Customers Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('id')}>
                        <div className="flex items-center">
                          ID
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                        <div className="flex items-center">
                          Name
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3">Contact</th>
                      <th className="table-header px-6 py-3">Joined Date</th>
                      <th className="table-header px-6 py-3">Credit Score</th>
                      <th className="table-header px-6 py-3">Income Level</th>
                      <th className="table-header px-6 py-3">Loans</th>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('totalBorrowed')}>
                        <div className="flex items-center">
                          Total Borrowed
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {getSortedData(getFilteredData(customers, 'customers')).map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="table-cell">#{customer.id}</td>
                        <td className="table-cell">{customer.name}</td>
                        <td className="table-cell">
                          <div className="text-sm">{customer.email}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                        </td>
                        <td className="table-cell">{formatDate(customer.joinedDate)}</td>
                        <td className="table-cell">{renderCreditScoreIndicator(customer.creditScore)}</td>
                        <td className="table-cell">{renderIncomeLevelBadge(customer.incomeLevel)}</td>
                        <td className="table-cell">
                          <div className="flex flex-col">
                            <span>{customer.activeLoans} active</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{customer.completedLoans} completed</span>
                          </div>
                        </td>
                        <td className="table-cell">{formatCurrency(customer.totalBorrowed)}</td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => setEditingCustomer(customer)}
                              aria-label="Edit customer"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              aria-label="Delete customer"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {getFilteredData(customers, 'customers').length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No customers found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Payments</h2>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search payments..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                
                <button 
                  className="btn btn-primary flex items-center justify-center gap-2"
                  onClick={() => setIsAddingPayment(true)}
                >
                  <Plus className="h-5 w-5" /> Record Payment
                </button>
                
                <button 
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white flex items-center justify-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" /> Filter
                </button>
              </div>
            </div>
            
            {/* Filters */}
            {showFilters && (
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Filter Payments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select 
                      className="input"
                      value={filterConfig.payments.status || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        payments: {
                          ...filterConfig.payments,
                          status: e.target.value ? e.target.value as 'pending' | 'completed' | 'failed' : undefined
                        }
                      })}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select 
                      className="input"
                      value={filterConfig.payments.method || ''}
                      onChange={(e) => setFilterConfig({
                        ...filterConfig,
                        payments: {
                          ...filterConfig.payments,
                          method: e.target.value ? e.target.value as 'cash' | 'bank_transfer' | 'mobile_money' : undefined
                        }
                      })}
                    >
                      <option value="">All Methods</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end mt-4">
                  <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white mr-2" onClick={resetFilters}>Reset</button>
                </div>
              </div>
            )}
            
            {/* Payments Table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('id')}>
                        <div className="flex items-center">
                          ID
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3">Customer</th>
                      <th className="table-header px-6 py-3">Loan ID</th>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('amount')}>
                        <div className="flex items-center">
                          Amount
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('date')}>
                        <div className="flex items-center">
                          Date
                          <ArrowUpDown className="h-4 w-4 ml-1" />
                        </div>
                      </th>
                      <th className="table-header px-6 py-3">Method</th>
                      <th className="table-header px-6 py-3">Status</th>
                      <th className="table-header px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {getSortedData(getFilteredData(payments, 'payments')).map(payment => (
                      <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="table-cell">#{payment.id}</td>
                        <td className="table-cell">{getCustomerName(payment.customerId)}</td>
                        <td className="table-cell">#{payment.loanId}</td>
                        <td className="table-cell">{formatCurrency(payment.amount)}</td>
                        <td className="table-cell">{formatDate(payment.date)}</td>
                        <td className="table-cell">{renderPaymentMethodBadge(payment.method)}</td>
                        <td className="table-cell">{renderPaymentStatusBadge(payment.status)}</td>
                        <td className="table-cell">
                          <div className="flex items-center space-x-2">
                            <button 
                              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={() => setEditingPayment(payment)}
                              aria-label="Edit payment"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeletePayment(payment.id)}
                              aria-label="Delete payment"
                              disabled={payment.status === 'completed'}
                            >
                              <Trash2 className={`h-5 w-5 ${payment.status === 'completed' ? 'opacity-50 cursor-not-allowed' : ''}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {getFilteredData(payments, 'payments').length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No payments found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
              
              <div className="flex items-center space-x-2">
                <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white flex items-center justify-center gap-2">
                  <Calendar className="h-5 w-5" /> 
                  <span className="hidden sm:inline">This Month</span>
                </button>
                
                <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5" /> 
                  <span className="hidden sm:inline">Export</span>
                </button>
              </div>
            </div>
            
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Loan Disbursement</p>
                    <p className="stat-value">{formatCurrency(dashboardStats.totalAmountLent)}</p>
                    <p className="stat-desc">{dashboardStats.totalLoans} total loans</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Repayments Collected</p>
                    <p className="stat-value">{formatCurrency(dashboardStats.totalAmountCollected)}</p>
                    <p className="stat-desc">{payments.filter(p => p.status === 'completed').length} payments</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Loan Completion Rate</p>
                    <p className="stat-value">
                      {dashboardStats.totalLoans > 0 ?
                        `${((dashboardStats.completedLoans / dashboardStats.totalLoans) * 100).toFixed(1)}%` :
                        '0%'}
                    </p>
                    <p className="stat-desc">{dashboardStats.completedLoans} completed loans</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    <Check className="h-6 w-6" />
                  </div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="stat-title">Default Rate</p>
                    <p className="stat-value">
                      {dashboardStats.totalLoans > 0 ?
                        `${((dashboardStats.defaultedLoans / dashboardStats.totalLoans) * 100).toFixed(1)}%` :
                        '0%'}
                    </p>
                    <p className="stat-desc">{dashboardStats.defaultedLoans} defaulted loans</p>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    <X className="h-6 w-6" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Chart Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Monthly Loan Disbursements</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-1 rounded text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700">
                      <LineChartIcon className="h-5 w-5" />
                    </button>
                    <button className="p-1 rounded text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/30">
                      <BarChartIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getLoanGrowthData()}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value as number), 'Amount']} 
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="amount" fill="#3B82F6" name="Loan Amount" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-medium mb-4">Loan Status Distribution</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getLoanStatusChartData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {getLoanStatusChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [ // Adjusted Tooltip formatter for PieChart
                        `${value} loans`, 
                        props?.payload?.name
                      ]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Top Customers */}
            <div className="card">
              <h3 className="text-lg font-medium mb-4">Top Customers by Loan Volume</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="table-header px-6 py-3">Customer</th>
                      <th className="table-header px-6 py-3">Total Borrowed</th>
                      <th className="table-header px-6 py-3">Active Loans</th>
                      <th className="table-header px-6 py-3">Completed Loans</th>
                      <th className="table-header px-6 py-3">Credit Score</th>
                      <th className="table-header px-6 py-3">Income Level</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {customers
                      .sort((a, b) => b.totalBorrowed - a.totalBorrowed)
                      .slice(0, 5)
                      .map(customer => (
                        <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="table-cell">
                            <div className="font-medium">{customer.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</div>
                          </td>
                          <td className="table-cell">{formatCurrency(customer.totalBorrowed)}</td>
                          <td className="table-cell">{customer.activeLoans}</td>
                          <td className="table-cell">{customer.completedLoans}</td>
                          <td className="table-cell">{renderCreditScoreIndicator(customer.creditScore)}</td>
                          <td className="table-cell">{renderIncomeLevelBadge(customer.incomeLevel)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
      
      {/* Add New Loan Modal */}
      {isAddingLoan && (
        <div className="modal-backdrop" onClick={() => setIsAddingLoan(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="loan-modal-title">Create New Loan</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setIsAddingLoan(false)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="loan-customer">Customer</label>
                <select 
                  id="loan-customer"
                  className="input"
                  value={newLoan.customerId || ''}
                  onChange={(e) => setNewLoan({ ...newLoan, customerId: e.target.value })}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="loan-amount">Loan Amount</label>
                <input 
                  id="loan-amount"
                  type="number" 
                  className="input"
                  value={newLoan.amount || ''}
                  onChange={(e) => setNewLoan({ ...newLoan, amount: Number(e.target.value) })}
                  required
                  min="0"
                  step="100"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="loan-interest">Interest Rate (%)</label>
                <input 
                  id="loan-interest"
                  type="number" 
                  className="input"
                  value={newLoan.interestRate || ''}
                  onChange={(e) => setNewLoan({ ...newLoan, interestRate: Number(e.target.value) })}
                  required
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="loan-term">Term (Months)</label>
                <input 
                  id="loan-term"
                  type="number" 
                  className="input"
                  value={newLoan.term || ''}
                  onChange={(e) => setNewLoan({ ...newLoan, term: Number(e.target.value) })}
                  required
                  min="1"
                  step="1"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onClick={() => setIsAddingLoan(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddLoan}
                disabled={!newLoan.customerId || !newLoan.amount || !newLoan.interestRate || !newLoan.term}
              >
                Create Loan
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Loan Modal */}
      {editingLoan && (
        <div className="modal-backdrop" onClick={() => setEditingLoan(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="edit-loan-modal-title">Edit Loan Details</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setEditingLoan(null)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-loan-status">Status</label>
                <select 
                  id="edit-loan-status"
                  className="input"
                  value={editingLoan.status}
                  onChange={(e) => setEditingLoan({ 
                    ...editingLoan, 
                    status: e.target.value as 'pending' | 'active' | 'paid' | 'defaulted' 
                  })}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="paid">Paid</option>
                  <option value="defaulted">Defaulted</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-loan-interest">Interest Rate (%)</label>
                <input 
                  id="edit-loan-interest"
                  type="number" 
                  className="input"
                  value={editingLoan.interestRate}
                  onChange={(e) => setEditingLoan({ ...editingLoan, interestRate: Number(e.target.value) })}
                  min="0"
                  step="0.1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-loan-payments">Payments Made</label>
                <input 
                  id="edit-loan-payments"
                  type="number" 
                  className="input"
                  value={editingLoan.paymentsMade}
                  onChange={(e) => setEditingLoan({ 
                    ...editingLoan, 
                    paymentsMade: Number(e.target.value),
                    status: Number(e.target.value) >= editingLoan.totalPayments ? 'paid' : editingLoan.status
                  })}
                  min="0"
                  max={editingLoan.totalPayments}
                  step="1"
                />
                <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                  {editingLoan.paymentsMade} of {editingLoan.totalPayments} payments
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-loan-next-date">Next Payment Date</label>
                <input 
                  id="edit-loan-next-date"
                  type="date" 
                  className="input"
                  value={editingLoan.nextPaymentDate}
                  onChange={(e) => setEditingLoan({ ...editingLoan, nextPaymentDate: e.target.value })}
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onClick={() => setEditingLoan(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateLoan}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Customer Modal */}
      {isAddingCustomer && (
        <div className="modal-backdrop" onClick={() => setIsAddingCustomer(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="customer-modal-title">Add New Customer</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setIsAddingCustomer(false)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="customer-name">Full Name</label>
                <input 
                  id="customer-name"
                  type="text" 
                  className="input"
                  value={newCustomer.name || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="customer-email">Email</label>
                <input 
                  id="customer-email"
                  type="email" 
                  className="input"
                  value={newCustomer.email || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="customer-phone">Phone Number</label>
                <input 
                  id="customer-phone"
                  type="tel" 
                  className="input"
                  value={newCustomer.phone || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="customer-address">Address</label>
                <input 
                  id="customer-address"
                  type="text" 
                  className="input"
                  value={newCustomer.address || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="customer-credit-score">Credit Score</label>
                  <input 
                    id="customer-credit-score"
                    type="number" 
                    className="input"
                    value={newCustomer.creditScore || ''}
                    onChange={(e) => setNewCustomer({ ...newCustomer, creditScore: Number(e.target.value) })}
                    min="300"
                    max="850"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="customer-income">Income Level</label>
                  <select 
                    id="customer-income"
                    className="input"
                    value={newCustomer.incomeLevel || ''}
                    onChange={(e) => setNewCustomer({ 
                      ...newCustomer, 
                      incomeLevel: e.target.value as 'low' | 'medium' | 'high' 
                    })}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onClick={() => setIsAddingCustomer(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddCustomer}
                disabled={!newCustomer.name || !newCustomer.email || !newCustomer.phone}
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="modal-backdrop" onClick={() => setEditingCustomer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="edit-customer-modal-title">Edit Customer Details</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setEditingCustomer(null)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-customer-name">Full Name</label>
                <input 
                  id="edit-customer-name"
                  type="text" 
                  className="input"
                  value={editingCustomer.name}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-customer-email">Email</label>
                <input 
                  id="edit-customer-email"
                  type="email" 
                  className="input"
                  value={editingCustomer.email}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-customer-phone">Phone Number</label>
                <input 
                  id="edit-customer-phone"
                  type="tel" 
                  className="input"
                  value={editingCustomer.phone}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-customer-address">Address</label>
                <input 
                  id="edit-customer-address"
                  type="text" 
                  className="input"
                  value={editingCustomer.address}
                  onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-customer-credit-score">Credit Score</label>
                  <input 
                    id="edit-customer-credit-score"
                    type="number" 
                    className="input"
                    value={editingCustomer.creditScore}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, creditScore: Number(e.target.value) })}
                    min="300"
                    max="850"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-customer-income">Income Level</label>
                  <select 
                    id="edit-customer-income"
                    className="input"
                    value={editingCustomer.incomeLevel}
                    onChange={(e) => setEditingCustomer({ 
                      ...editingCustomer, 
                      incomeLevel: e.target.value as 'low' | 'medium' | 'high' 
                    })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onClick={() => setEditingCustomer(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdateCustomer}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add New Payment Modal */}
      {isAddingPayment && (
        <div className="modal-backdrop" onClick={() => setIsAddingPayment(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="payment-modal-title">Record New Payment</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setIsAddingPayment(false)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="payment-loan">Loan</label>
                <select 
                  id="payment-loan"
                  className="input"
                  value={newPayment.loanId || ''}
                  onChange={(e) => {
                    const selectedLoan = loans.find(loan => loan.id === e.target.value);
                    if (selectedLoan) {
                      const monthlyPayment = calculateMonthlyPayment(selectedLoan);
                      setNewPayment({ 
                        ...newPayment, 
                        loanId: e.target.value,
                        amount: monthlyPayment
                      });
                    }
                  }}
                  required
                >
                  <option value="">Select a loan</option>
                  {loans
                    .filter(loan => loan.status === 'active' && loan.paymentsMade < loan.totalPayments)
                    .map(loan => (
                      <option key={loan.id} value={loan.id}>
                        #{loan.id} - {getCustomerName(loan.customerId)} (${loan.amount})
                      </option>
                    ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="payment-amount">Payment Amount</label>
                <input 
                  id="payment-amount"
                  type="number" 
                  className="input"
                  value={newPayment.amount || ''}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: Number(e.target.value) })}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="payment-method">Payment Method</label>
                <select 
                  id="payment-method"
                  className="input"
                  value={newPayment.method || ''}
                  onChange={(e) => setNewPayment({ 
                    ...newPayment, 
                    method: e.target.value as 'cash' | 'bank_transfer' | 'mobile_money' 
                  })}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onClick={() => setIsAddingPayment(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddPayment}
                disabled={!newPayment.loanId || !newPayment.amount}
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Payment Modal */}
      {editingPayment && (
        <div className="modal-backdrop" onClick={() => setEditingPayment(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="edit-payment-modal-title">Edit Payment Details</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                onClick={() => setEditingPayment(null)}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="edit-payment-amount">Payment Amount</label>
                <input 
                  id="edit-payment-amount"
                  type="number" 
                  className="input"
                  value={editingPayment.amount}
                  onChange={(e) => setEditingPayment({ ...editingPayment, amount: Number(e.target.value) })}
                  disabled={editingPayment.status === 'completed'}
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-payment-date">Payment Date</label>
                <input 
                  id="edit-payment-date"
                  type="date" 
                  className="input"
                  value={editingPayment.date}
                  onChange={(e) => setEditingPayment({ ...editingPayment, date: e.target.value })}
                  disabled={editingPayment.status === 'completed'}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-payment-method">Payment Method</label>
                <select 
                  id="edit-payment-method"
                  className="input"
                  value={editingPayment.method}
                  onChange={(e) => setEditingPayment({ 
                    ...editingPayment, 
                    method: e.target.value as 'cash' | 'bank_transfer' | 'mobile_money' 
                  })}
                  disabled={editingPayment.status === 'completed'}
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="edit-payment-status">Status</label>
                <select 
                  id="edit-payment-status"
                  className="input"
                  value={editingPayment.status}
                  onChange={(e) => setEditingPayment({ 
                    ...editingPayment, 
                    status: e.target.value as 'pending' | 'completed' | 'failed' 
                  })}
                  disabled={editingPayment.status === 'completed'}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
                {editingPayment.status === 'completed' && (
                  <p className="text-sm text-amber-600 mt-1 dark:text-amber-400">
                    Completed payments cannot be modified.
                  </p>
                )}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                onClick={() => setEditingPayment(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleUpdatePayment}
                disabled={editingPayment.status === 'completed'}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
