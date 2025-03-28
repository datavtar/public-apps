import React, { useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  Users, Home, PieChart, BarChart, Briefcase, Settings, LogOut, Menu, X, Search, 
  Plus, Edit, Trash2, ChevronDown, Eye, ExternalLink, Download, Upload, Filter, SortAsc, SortDesc,
  Sun, Moon, Bell, Info, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight, Layers,
  HelpCircle, Coffee, DollarSign, Percent, Calendar, FileText, Maximize, Minimize
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  dateJoined: string;
};

type Fund = {
  id: number;
  name: string;
  type: 'Venture Capital' | 'Private Equity' | 'Hedge Fund' | 'Real Estate';
  totalAmount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  startDate: string;
  endDate?: string;
  status: 'active' | 'closed' | 'fundraising';
  manager: string;
  annualReturn?: number;
  investorCount: number;
};

type Investment = {
  id: number;
  companyName: string;
  industry: string;
  investmentDate: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  fundId: number;
  equityStake: number;
  status: 'active' | 'exited' | 'written-off';
  valuation?: number;
  exitDate?: string;
  exitValue?: number;
  fundManager: string;
};

type Investor = {
  id: number;
  name: string;
  type: 'Individual' | 'Institutional' | 'Corporate';
  email: string;
  totalInvested: number;
  currency: 'USD' | 'EUR' | 'GBP';
  status: 'active' | 'inactive';
  joinDate: string;
  commitments: number;
  distributions: number;
};

type PortfolioCompany = {
  id: number;
  name: string;
  industry: string;
  foundedYear: number;
  acquiredDate: string;
  status: 'pre-revenue' | 'growth' | 'profitable' | 'exited';
  latestValuation?: number;
  currency: 'USD' | 'EUR' | 'GBP';
  website: string;
  revenueGrowth?: number;
};

type Document = {
  id: number;
  name: string;
  type: 'legal' | 'financial' | 'investor' | 'portfolio';
  uploadDate: string;
  size: string;
  relatedEntity?: string;
  uploadedBy: string;
};

type Transaction = {
  id: number;
  date: string;
  type: 'capital call' | 'distribution' | 'expense' | 'fee';
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP';
  fundId: number;
  investorId?: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
};

type DashboardStats = {
  totalAUM: number;
  fundCount: number;
  investorCount: number;
  portfolioCount: number;
  totalCommitted: number;
  totalDeployed: number;
  returns: number;
  currency: 'USD' | 'EUR' | 'GBP';
};

type PerformanceData = {
  fundId: number;
  fundName: string;
  IRR: number;
  MOIC: number;
  DPI: number;
  RVPI: number;
  TVPI: number;
};

type FundReturn = {
  fundId: number;
  fundName: string;
  year: number;
  quarter: string;
  returnPercentage: number;
};

type NavItem = {
  title: string;
  icon: React.ReactNode;
  path: string;
  subItems?: Array<{
    title: string;
    path: string;
  }>;
};

type GlobalFilterState = {
  searchTerm: string;
  dateRange: string;
  status: string;
};

type FormMode = 'create' | 'edit' | 'view';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
};

const App: React.FC = () => {
  return (
    <Router>
      <MainApp />
    </Router>
  );
};

const MainApp: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [globalFilter, setGlobalFilter] = useState<GlobalFilterState>({
    searchTerm: '',
    dateRange: '',
    status: '',
  });
  
  // Mock data for the application
  const users: User[] = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active', dateJoined: '2023-01-15' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'active', dateJoined: '2023-03-10' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', role: 'viewer', status: 'pending', dateJoined: '2023-05-22' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', role: 'user', status: 'inactive', dateJoined: '2022-11-08' },
  ];

  const funds: Fund[] = [
    { id: 1, name: 'Growth Fund I', type: 'Private Equity', totalAmount: 25000000, currency: 'USD', startDate: '2022-01-15', endDate: '2032-01-15', status: 'active', manager: 'John Doe', annualReturn: 12.5, investorCount: 18 },
    { id: 2, name: 'Tech Ventures III', type: 'Venture Capital', totalAmount: 15000000, currency: 'USD', startDate: '2021-06-10', status: 'fundraising', manager: 'Jane Smith', investorCount: 12 },
    { id: 3, name: 'Real Estate Opportunities', type: 'Real Estate', totalAmount: 40000000, currency: 'EUR', startDate: '2020-03-22', endDate: '2028-03-22', status: 'active', manager: 'Robert Johnson', annualReturn: 8.7, investorCount: 25 },
    { id: 4, name: 'Global Macro Fund', type: 'Hedge Fund', totalAmount: 75000000, currency: 'USD', startDate: '2019-11-08', endDate: '2029-11-08', status: 'active', manager: 'Emily Davis', annualReturn: 15.2, investorCount: 32 },
  ];

  const investments: Investment[] = [
    { id: 1, companyName: 'TechStart Inc', industry: 'Software', investmentDate: '2022-04-12', amount: 3500000, currency: 'USD', fundId: 1, equityStake: 15, status: 'active', valuation: 28000000, fundManager: 'John Doe' },
    { id: 2, companyName: 'GreenEnergy Solutions', industry: 'Renewable Energy', investmentDate: '2022-07-23', amount: 5000000, currency: 'USD', fundId: 1, equityStake: 20, status: 'active', valuation: 32000000, fundManager: 'John Doe' },
    { id: 3, companyName: 'MedTech Innovations', industry: 'Healthcare', investmentDate: '2022-01-30', amount: 2800000, currency: 'EUR', fundId: 3, equityStake: 12, status: 'active', valuation: 21000000, fundManager: 'Robert Johnson' },
    { id: 4, companyName: 'Quantum Computing Ltd', industry: 'Technology', investmentDate: '2021-09-15', amount: 4200000, currency: 'USD', fundId: 2, equityStake: 18, status: 'active', valuation: 26500000, fundManager: 'Jane Smith' },
  ];

  const investors: Investor[] = [
    { id: 1, name: 'Global Investments Ltd', type: 'Institutional', email: 'contact@globalinv.com', totalInvested: 8500000, currency: 'USD', status: 'active', joinDate: '2021-02-12', commitments: 10000000, distributions: 1500000 },
    { id: 2, name: 'Michael Anderson', type: 'Individual', email: 'michael@example.com', totalInvested: 1200000, currency: 'USD', status: 'active', joinDate: '2021-05-08', commitments: 1500000, distributions: 300000 },
    { id: 3, name: 'European Pension Fund', type: 'Institutional', email: 'contact@europension.eu', totalInvested: 12500000, currency: 'EUR', status: 'active', joinDate: '2020-11-20', commitments: 15000000, distributions: 2500000 },
    { id: 4, name: 'TechGroup Holdings', type: 'Corporate', email: 'invest@techgroup.com', totalInvested: 6300000, currency: 'USD', status: 'inactive', joinDate: '2019-08-15', commitments: 7500000, distributions: 1200000 },
  ];

  const portfolioCompanies: PortfolioCompany[] = [
    { id: 1, name: 'TechStart Inc', industry: 'Software', foundedYear: 2018, acquiredDate: '2022-04-12', status: 'growth', latestValuation: 28000000, currency: 'USD', website: 'https://techstart.example.com', revenueGrowth: 35 },
    { id: 2, name: 'GreenEnergy Solutions', industry: 'Renewable Energy', foundedYear: 2015, acquiredDate: '2022-07-23', status: 'growth', latestValuation: 32000000, currency: 'USD', website: 'https://greenenergy.example.com', revenueGrowth: 28 },
    { id: 3, name: 'MedTech Innovations', industry: 'Healthcare', foundedYear: 2017, acquiredDate: '2022-01-30', status: 'pre-revenue', latestValuation: 21000000, currency: 'EUR', website: 'https://medtech.example.com' },
    { id: 4, name: 'Quantum Computing Ltd', industry: 'Technology', foundedYear: 2019, acquiredDate: '2021-09-15', status: 'profitable', latestValuation: 26500000, currency: 'USD', website: 'https://quantumcomputing.example.com', revenueGrowth: 45 },
  ];

  const documents: Document[] = [
    { id: 1, name: 'Growth Fund I - LPA', type: 'legal', uploadDate: '2022-01-10', size: '3.2MB', relatedEntity: 'Growth Fund I', uploadedBy: 'John Doe' },
    { id: 2, name: 'Investor Report Q1 2023', type: 'investor', uploadDate: '2023-04-15', size: '1.8MB', relatedEntity: 'Growth Fund I', uploadedBy: 'Jane Smith' },
    { id: 3, name: 'TechStart Inc Due Diligence', type: 'portfolio', uploadDate: '2022-03-25', size: '5.6MB', relatedEntity: 'TechStart Inc', uploadedBy: 'Robert Johnson' },
    { id: 4, name: 'Financial Statements 2022', type: 'financial', uploadDate: '2023-02-20', size: '2.4MB', relatedEntity: 'Tech Ventures III', uploadedBy: 'Emily Davis' },
  ];

  const transactions: Transaction[] = [
    { id: 1, date: '2023-03-15', type: 'capital call', amount: 1500000, currency: 'USD', fundId: 1, investorId: 1, description: 'Capital Call #3 for Growth Fund I', status: 'completed' },
    { id: 2, date: '2023-02-28', type: 'distribution', amount: 500000, currency: 'USD', fundId: 1, investorId: 2, description: 'Q1 2023 Distribution', status: 'completed' },
    { id: 3, date: '2023-04-05', type: 'expense', amount: 75000, currency: 'EUR', fundId: 3, description: 'Legal and accounting fees', status: 'pending' },
    { id: 4, date: '2023-01-20', type: 'fee', amount: 125000, currency: 'USD', fundId: 2, description: 'Management fee Q1 2023', status: 'completed' },
  ];

  const dashboardStats: DashboardStats = {
    totalAUM: 155000000,
    fundCount: 4,
    investorCount: 87,
    portfolioCount: 28,
    totalCommitted: 175000000,
    totalDeployed: 132000000,
    returns: 15.8,
    currency: 'USD',
  };

  const performanceData: PerformanceData[] = [
    { fundId: 1, fundName: 'Growth Fund I', IRR: 18.5, MOIC: 1.8, DPI: 0.3, RVPI: 1.5, TVPI: 1.8 },
    { fundId: 2, fundName: 'Tech Ventures III', IRR: 22.3, MOIC: 1.5, DPI: 0.1, RVPI: 1.4, TVPI: 1.5 },
    { fundId: 3, fundName: 'Real Estate Opportunities', IRR: 12.8, MOIC: 1.4, DPI: 0.4, RVPI: 1.0, TVPI: 1.4 },
    { fundId: 4, fundName: 'Global Macro Fund', IRR: 25.1, MOIC: 2.1, DPI: 0.6, RVPI: 1.5, TVPI: 2.1 },
  ];

  const fundReturns: FundReturn[] = [
    { fundId: 1, fundName: 'Growth Fund I', year: 2022, quarter: 'Q4', returnPercentage: 3.2 },
    { fundId: 1, fundName: 'Growth Fund I', year: 2023, quarter: 'Q1', returnPercentage: 2.8 },
    { fundId: 2, fundName: 'Tech Ventures III', year: 2022, quarter: 'Q4', returnPercentage: 4.1 },
    { fundId: 2, fundName: 'Tech Ventures III', year: 2023, quarter: 'Q1', returnPercentage: 3.7 },
    { fundId: 3, fundName: 'Real Estate Opportunities', year: 2022, quarter: 'Q4', returnPercentage: 2.2 },
    { fundId: 3, fundName: 'Real Estate Opportunities', year: 2023, quarter: 'Q1', returnPercentage: 2.5 },
    { fundId: 4, fundName: 'Global Macro Fund', year: 2022, quarter: 'Q4', returnPercentage: 5.3 },
    { fundId: 4, fundName: 'Global Macro Fund', year: 2023, quarter: 'Q1', returnPercentage: 4.8 },
  ];

  useEffect(() => {
    // Apply or remove dark class on document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Add a toast notification
  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Automatically remove toast after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  // Navigation items
  const navItems: NavItem[] = [
    { title: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/' },
    { title: 'Funds', icon: <Briefcase className="w-5 h-5" />, path: '/funds' },
    { title: 'Investments', icon: <BarChart className="w-5 h-5" />, path: '/investments' },
    { title: 'Investors', icon: <Users className="w-5 h-5" />, path: '/investors' },
    { title: 'Portfolio', icon: <PieChart className="w-5 h-5" />, path: '/portfolio' },
    { title: 'Documents', icon: <FileText className="w-5 h-5" />, path: '/documents' },
    { title: 'Transactions', icon: <DollarSign className="w-5 h-5" />, path: '/transactions' },
    { title: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings' },
  ];

  return (
    <div className={`app-container min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Main app layout */}
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition">
        {/* Sidebar */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} theme-transition bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex flex-col z-20`}>
          {/* Logo */}
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              {isSidebarOpen && (
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">EquityPro</h1>
              )}
            </div>
            <button
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isSidebarOpen ? (
                <Minimize className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              ) : (
                <Maximize className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink item={item} isSidebarOpen={isSidebarOpen} />
                </li>
              ))}
            </ul>
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center text-primary-600 dark:text-primary-200 font-semibold">
              JD
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            )}
            {isSidebarOpen && (
              <button 
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-4">
                <button
                  className="block md:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="input pl-10 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-md w-64"
                    value={globalFilter.searchTerm}
                    onChange={(e) => setGlobalFilter({...globalFilter, searchTerm: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button className="theme-toggle p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition" onClick={() => setIsDarkMode(!isDarkMode)} aria-label="Toggle dark mode">
                  {isDarkMode ? (
                    <Sun className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition relative" aria-label="Notifications">
                  <Bell className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 theme-transition" aria-label="Help">
                  <HelpCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<Dashboard stats={dashboardStats} performanceData={performanceData} fundReturns={fundReturns} funds={funds} investments={investments} addToast={addToast} />} />
              <Route path="/funds" element={<FundsPage funds={funds} addToast={addToast} />} />
              <Route path="/investments" element={<InvestmentsPage investments={investments} funds={funds} addToast={addToast} />} />
              <Route path="/investors" element={<InvestorsPage investors={investors} addToast={addToast} />} />
              <Route path="/portfolio" element={<PortfolioPage portfolioCompanies={portfolioCompanies} investments={investments} addToast={addToast} />} />
              <Route path="/documents" element={<DocumentsPage documents={documents} addToast={addToast} />} />
              <Route path="/transactions" element={<TransactionsPage transactions={transactions} funds={funds} investors={investors} addToast={addToast} />} />
              <Route path="/settings" element={<SettingsPage users={users} addToast={addToast} />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
          </footer>
        </div>
      </div>

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className={`alert ${toast.type === 'success' ? 'alert-success' : toast.type === 'error' ? 'alert-error' : toast.type === 'warning' ? 'alert-warning' : 'alert-info'} shadow-lg`}
          >
            {toast.type === 'success' && <CheckCircle className="h-5 w-5" />}
            {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
            {toast.type === 'warning' && <AlertCircle className="h-5 w-5" />}
            {toast.type === 'info' && <Info className="h-5 w-5" />}
            <p>{toast.message}</p>
            <button 
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-auto"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Navigation Link Component
const NavLink: React.FC<{ item: NavItem; isSidebarOpen: boolean }> = ({ item, isSidebarOpen }) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  
  return (
    <Link
      to={item.path}
      className={`flex items-center py-2 px-3 rounded-md ${isActive ? 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-200' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'} theme-transition ${isSidebarOpen ? '' : 'justify-center'}`}
    >
      <span className="text-center">{item.icon}</span>
      {isSidebarOpen && <span className="ml-3 text-sm font-medium">{item.title}</span>}
    </Link>
  );
};

// Dashboard Page
const Dashboard: React.FC<{ 
  stats: DashboardStats;
  performanceData: PerformanceData[];
  fundReturns: FundReturn[];
  funds: Fund[];
  investments: Investment[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ stats, performanceData, fundReturns, funds, investments, addToast }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex space-x-2">
          <button className="btn btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            <Calendar className="h-4 w-4 mr-2" />
            Q2 2023
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Assets Under Management</div>
          <div className="stat-value">${(stats.totalAUM / 1000000).toFixed(1)}M</div>
          <div className="stat-desc flex items-center text-green-500">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>8.2% from last month</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Active Funds</div>
          <div className="stat-value">{stats.fundCount}</div>
          <div className="stat-desc flex items-center text-green-500">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>1 new this quarter</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Portfolio Companies</div>
          <div className="stat-value">{stats.portfolioCount}</div>
          <div className="stat-desc flex items-center text-green-500">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>3 new this quarter</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Overall Returns</div>
          <div className="stat-value">{stats.returns}%</div>
          <div className="stat-desc flex items-center text-green-500">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            <span>2.3% from last quarter</span>
          </div>
        </div>
      </div>

      {/* Fund Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Fund Performance</h2>
              <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm p-1.5">
                <Filter className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Fund Name</th>
                    <th className="table-header">IRR</th>
                    <th className="table-header">MOIC</th>
                    <th className="table-header">DPI</th>
                    <th className="table-header">TVPI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {performanceData.map((item) => (
                    <tr key={item.fundId} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="table-cell font-medium">{item.fundName}</td>
                      <td className="table-cell">{item.IRR}%</td>
                      <td className="table-cell">{item.MOIC}x</td>
                      <td className="table-cell">{item.DPI}x</td>
                      <td className="table-cell">{item.TVPI}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Capital Deployment</h2>
          <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center">
            {/* Placeholder for Chart */}
            <div className={styles.pieChart}>
              <div className={styles.pieSegment1}></div>
              <div className={styles.pieSegment2}></div>
              <div className={styles.pieSegment3}></div>
              <div className={styles.pieSegment4}></div>
              <div className={styles.pieCenter}></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
                <span className="text-sm">Deployed</span>
              </div>
              <span className="text-sm font-medium">${(stats.totalDeployed / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-sm">Reserved</span>
              </div>
              <span className="text-sm font-medium">$25.5M</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm">Committed</span>
              </div>
              <span className="text-sm font-medium">${(stats.totalCommitted / 1000000).toFixed(1)}M</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full mr-2"></div>
                <span className="text-sm">Uncalled</span>
              </div>
              <span className="text-sm font-medium">$17.5M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Funds & Investments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Funds</h2>
            <Link to="/funds" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 dark:hover:text-primary-300 flex items-center">
              View All
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Fund Name</th>
                  <th className="table-header">Type</th>
                  <th className="table-header">AUM</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {funds.slice(0, 3).map((fund) => (
                  <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="table-cell font-medium">{fund.name}</td>
                    <td className="table-cell">{fund.type}</td>
                    <td className="table-cell">${(fund.totalAmount / 1000000).toFixed(1)}M</td>
                    <td className="table-cell">
                      <span className={`badge ${fund.status === 'active' ? 'badge-success' : fund.status === 'fundraising' ? 'badge-warning' : 'badge-info'}`}>
                        {fund.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Investments</h2>
            <Link to="/investments" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-700 dark:hover:text-primary-300 flex items-center">
              View All
              <ExternalLink className="h-4 w-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Company</th>
                  <th className="table-header">Fund</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {investments.slice(0, 3).map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="table-cell font-medium">{investment.companyName}</td>
                    <td className="table-cell">{funds.find(f => f.id === investment.fundId)?.name || ''}</td>
                    <td className="table-cell">${(investment.amount / 1000000).toFixed(1)}M</td>
                    <td className="table-cell">{format(new Date(investment.investmentDate), 'MMM d, yyyy')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funds Page
const FundsPage: React.FC<{ 
  funds: Fund[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ funds, addToast }) => {
  const [fundsList, setFundsList] = useState<Fund[]>(funds);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentFund, setCurrentFund] = useState<Fund | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { register, handleSubmit, reset, control, setValue } = useForm<Fund>();

  const filteredFunds = useMemo(() => {
    let filtered = [...fundsList];
    if (filterStatus !== 'all') {
      filtered = filtered.filter(fund => fund.status === filterStatus);
    }
    
    // Sort funds
    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Fund];
      const bValue = b[sortConfig.key as keyof Fund];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      return 0;
    });
  }, [fundsList, sortConfig, filterStatus]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openForm = (mode: FormMode, fund?: Fund) => {
    setFormMode(mode);
    if (fund && (mode === 'edit' || mode === 'view')) {
      setCurrentFund(fund);
      // Set form values
      Object.entries(fund).forEach(([key, value]) => {
        setValue(key as keyof Fund, value);
      });
    } else {
      setCurrentFund(null);
      reset({
        id: fundsList.length + 1,
        name: '',
        type: 'Private Equity',
        totalAmount: 0,
        currency: 'USD',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'fundraising',
        manager: '',
        investorCount: 0
      });
    }
    setShowForm(true);
  };

  const onSubmit = (data: Fund) => {
    if (formMode === 'create') {
      const newFund = { ...data, id: fundsList.length + 1 };
      setFundsList([...fundsList, newFund]);
      addToast('Fund created successfully', 'success');
    } else if (formMode === 'edit' && currentFund) {
      setFundsList(fundsList.map(fund => fund.id === currentFund.id ? { ...data } : fund));
      addToast('Fund updated successfully', 'success');
    }
    setShowForm(false);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this fund?')) {
      setFundsList(fundsList.filter(fund => fund.id !== id));
      addToast('Fund deleted successfully', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Funds</h1>
        <button
          className="btn btn-primary"
          onClick={() => openForm('create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Fund
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="status-filter" className="text-sm font-medium">Status:</label>
            <select
              id="status-filter"
              className="input text-sm py-1"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="fundraising">Fundraising</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Funds Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Fund Name
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Type</th>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center">
                    Size
                    {sortConfig.key === 'totalAmount' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Manager</th>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('startDate')}
                >
                  <div className="flex items-center">
                    Start Date
                    {sortConfig.key === 'startDate' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredFunds.map((fund) => (
                <tr key={fund.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="table-cell font-medium">{fund.name}</td>
                  <td className="table-cell">{fund.type}</td>
                  <td className="table-cell">
                    {fund.currency} {(fund.totalAmount / 1000000).toFixed(1)}M
                  </td>
                  <td className="table-cell">{fund.manager}</td>
                  <td className="table-cell">{format(new Date(fund.startDate), 'MMM d, yyyy')}</td>
                  <td className="table-cell">
                    <span className={`badge ${fund.status === 'active' ? 'badge-success' : fund.status === 'fundraising' ? 'badge-warning' : 'badge-info'}`}>
                      {fund.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => openForm('view', fund)}
                        aria-label="View fund"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => openForm('edit', fund)}
                        aria-label="Edit fund"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(fund.id)}
                        aria-label="Delete fund"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredFunds.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No funds found. Try adjusting your filters or create a new fund.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Create New Fund' : formMode === 'edit' ? 'Edit Fund' : 'Fund Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Fund Name</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('name', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Fund Type</label>
                  <select
                    id="type"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('type')}
                  >
                    <option value="Private Equity">Private Equity</option>
                    <option value="Venture Capital">Venture Capital</option>
                    <option value="Hedge Fund">Hedge Fund</option>
                    <option value="Real Estate">Real Estate</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="manager">Fund Manager</label>
                  <input
                    id="manager"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('manager', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="totalAmount">Fund Size</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="totalAmount"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('totalAmount', { 
                        valueAsNumber: true,
                        required: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('currency')}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('status')}
                  >
                    <option value="fundraising">Fundraising</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">Start Date</label>
                  <input
                    id="startDate"
                    type="date"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('startDate', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="endDate">End Date (Optional)</label>
                  <input
                    id="endDate"
                    type="date"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('endDate')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="investorCount">Number of Investors</label>
                  <input
                    id="investorCount"
                    type="number"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('investorCount', { 
                      valueAsNumber: true,
                      required: true,
                      min: 0
                    })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="annualReturn">Target Annual Return (%)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="annualReturn"
                      type="number"
                      step="0.1"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('annualReturn', { 
                        valueAsNumber: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowForm(false)}
                >
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode !== 'view' && (
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Create Fund' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Investments Page
const InvestmentsPage: React.FC<{ 
  investments: Investment[];
  funds: Fund[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ investments, funds, addToast }) => {
  const [investmentsList, setInvestmentsList] = useState<Investment[]>(investments);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'investmentDate', direction: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentInvestment, setCurrentInvestment] = useState<Investment | null>(null);
  const [filterFund, setFilterFund] = useState<number | 'all'>('all');
  
  const { register, handleSubmit, reset, setValue } = useForm<Investment>();

  const filteredInvestments = useMemo(() => {
    let filtered = [...investmentsList];
    if (filterFund !== 'all') {
      filtered = filtered.filter(investment => investment.fundId === filterFund);
    }
    
    return filtered.sort((a, b) => {
      if (sortConfig.key === 'investmentDate') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.investmentDate).getTime() - new Date(b.investmentDate).getTime()
          : new Date(b.investmentDate).getTime() - new Date(a.investmentDate).getTime();
      }
      
      const aValue = a[sortConfig.key as keyof Investment];
      const bValue = b[sortConfig.key as keyof Investment];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      return 0;
    });
  }, [investmentsList, sortConfig, filterFund]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openForm = (mode: FormMode, investment?: Investment) => {
    setFormMode(mode);
    if (investment && (mode === 'edit' || mode === 'view')) {
      setCurrentInvestment(investment);
      // Set form values
      Object.entries(investment).forEach(([key, value]) => {
        setValue(key as keyof Investment, value);
      });
    } else {
      setCurrentInvestment(null);
      reset({
        id: investmentsList.length + 1,
        companyName: '',
        industry: '',
        investmentDate: format(new Date(), 'yyyy-MM-dd'),
        amount: 0,
        currency: 'USD',
        fundId: funds[0]?.id || 0,
        equityStake: 0,
        status: 'active',
        fundManager: funds[0]?.manager || ''
      });
    }
    setShowForm(true);
  };

  const onSubmit = (data: Investment) => {
    if (formMode === 'create') {
      const newInvestment = { ...data, id: investmentsList.length + 1 };
      setInvestmentsList([...investmentsList, newInvestment]);
      addToast('Investment created successfully', 'success');
    } else if (formMode === 'edit' && currentInvestment) {
      setInvestmentsList(investmentsList.map(investment => 
        investment.id === currentInvestment.id ? { ...data } : investment
      ));
      addToast('Investment updated successfully', 'success');
    }
    setShowForm(false);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      setInvestmentsList(investmentsList.filter(investment => investment.id !== id));
      addToast('Investment deleted successfully', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investments</h1>
        <button
          className="btn btn-primary"
          onClick={() => openForm('create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Investment
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="fund-filter" className="text-sm font-medium">Fund:</label>
            <select
              id="fund-filter"
              className="input text-sm py-1"
              value={filterFund === 'all' ? 'all' : filterFund.toString()}
              onChange={(e) => setFilterFund(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            >
              <option value="all">All Funds</option>
              {funds.map(fund => (
                <option key={fund.id} value={fund.id.toString()}>{fund.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Investments Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('companyName')}
                >
                  <div className="flex items-center">
                    Company
                    {sortConfig.key === 'companyName' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Fund</th>
                <th className="table-header">Industry</th>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('investmentDate')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'investmentDate' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredInvestments.map((investment) => (
                <tr key={investment.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="table-cell font-medium">{investment.companyName}</td>
                  <td className="table-cell">{funds.find(f => f.id === investment.fundId)?.name || 'Unknown Fund'}</td>
                  <td className="table-cell">{investment.industry}</td>
                  <td className="table-cell">
                    {investment.currency} {(investment.amount / 1000000).toFixed(1)}M
                  </td>
                  <td className="table-cell">{format(new Date(investment.investmentDate), 'MMM d, yyyy')}</td>
                  <td className="table-cell">
                    <span className={`badge ${investment.status === 'active' ? 'badge-success' : investment.status === 'exited' ? 'badge-info' : 'badge-error'}`}>
                      {investment.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => openForm('view', investment)}
                        aria-label="View investment"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => openForm('edit', investment)}
                        aria-label="Edit investment"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(investment.id)}
                        aria-label="Delete investment"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvestments.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No investments found. Try adjusting your filters or create a new investment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Create New Investment' : formMode === 'edit' ? 'Edit Investment' : 'Investment Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="companyName">Company Name</label>
                  <input
                    id="companyName"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('companyName', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="industry">Industry</label>
                  <input
                    id="industry"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('industry', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="fundId">Fund</label>
                  <select
                    id="fundId"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('fundId', { 
                      valueAsNumber: true,
                      required: true 
                    })}
                  >
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>{fund.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="fundManager">Fund Manager</label>
                  <input
                    id="fundManager"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('fundManager', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">Investment Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="amount"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('amount', { 
                        valueAsNumber: true,
                        required: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('currency')}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="investmentDate">Investment Date</label>
                  <input
                    id="investmentDate"
                    type="date"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('investmentDate', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="equityStake">Equity Stake (%)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="equityStake"
                      type="number"
                      step="0.1"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('equityStake', { 
                        valueAsNumber: true,
                        required: true,
                        min: 0,
                        max: 100
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('status')}
                  >
                    <option value="active">Active</option>
                    <option value="exited">Exited</option>
                    <option value="written-off">Written Off</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="valuation">Current Valuation</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="valuation"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('valuation', { 
                        valueAsNumber: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
                
                {/* Conditionally show exit fields if status is exited */}
                {formMode !== 'create' && currentInvestment?.status === 'exited' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="exitDate">Exit Date</label>
                      <input
                        id="exitDate"
                        type="date"
                        className="input"
                        disabled={formMode === 'view'}
                        {...register('exitDate')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="exitValue">Exit Value</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          id="exitValue"
                          type="number"
                          className="input pl-10"
                          disabled={formMode === 'view'}
                          {...register('exitValue', { 
                            valueAsNumber: true,
                            min: 0
                          })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowForm(false)}
                >
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode !== 'view' && (
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Create Investment' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Investors Page
const InvestorsPage: React.FC<{ 
  investors: Investor[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ investors, addToast }) => {
  const [investorsList, setInvestorsList] = useState<Investor[]>(investors);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'totalInvested', direction: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentInvestor, setCurrentInvestor] = useState<Investor | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  const { register, handleSubmit, reset, setValue } = useForm<Investor>();

  const filteredInvestors = useMemo(() => {
    let filtered = [...investorsList];
    if (filterType !== 'all') {
      filtered = filtered.filter(investor => investor.type === filterType);
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Investor];
      const bValue = b[sortConfig.key as keyof Investor];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      return 0;
    });
  }, [investorsList, sortConfig, filterType]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openForm = (mode: FormMode, investor?: Investor) => {
    setFormMode(mode);
    if (investor && (mode === 'edit' || mode === 'view')) {
      setCurrentInvestor(investor);
      // Set form values
      Object.entries(investor).forEach(([key, value]) => {
        setValue(key as keyof Investor, value);
      });
    } else {
      setCurrentInvestor(null);
      reset({
        id: investorsList.length + 1,
        name: '',
        type: 'Individual',
        email: '',
        totalInvested: 0,
        currency: 'USD',
        status: 'active',
        joinDate: format(new Date(), 'yyyy-MM-dd'),
        commitments: 0,
        distributions: 0
      });
    }
    setShowForm(true);
  };

  const onSubmit = (data: Investor) => {
    if (formMode === 'create') {
      const newInvestor = { ...data, id: investorsList.length + 1 };
      setInvestorsList([...investorsList, newInvestor]);
      addToast('Investor created successfully', 'success');
    } else if (formMode === 'edit' && currentInvestor) {
      setInvestorsList(investorsList.map(investor => 
        investor.id === currentInvestor.id ? { ...data } : investor
      ));
      addToast('Investor updated successfully', 'success');
    }
    setShowForm(false);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this investor?')) {
      setInvestorsList(investorsList.filter(investor => investor.id !== id));
      addToast('Investor deleted successfully', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Investors</h1>
        <button
          className="btn btn-primary"
          onClick={() => openForm('create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Investor
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="type-filter" className="text-sm font-medium">Type:</label>
            <select
              id="type-filter"
              className="input text-sm py-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="Individual">Individual</option>
              <option value="Institutional">Institutional</option>
              <option value="Corporate">Corporate</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Investors Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Investor Name
                    {sortConfig.key === 'name' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Type</th>
                <th className="table-header">Email</th>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('totalInvested')}
                >
                  <div className="flex items-center">
                    Total Invested
                    {sortConfig.key === 'totalInvested' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredInvestors.map((investor) => (
                <tr key={investor.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="table-cell font-medium">{investor.name}</td>
                  <td className="table-cell">{investor.type}</td>
                  <td className="table-cell">{investor.email}</td>
                  <td className="table-cell">
                    {investor.currency} {(investor.totalInvested / 1000000).toFixed(1)}M
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${investor.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                      {investor.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => openForm('view', investor)}
                        aria-label="View investor"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => openForm('edit', investor)}
                        aria-label="Edit investor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(investor.id)}
                        aria-label="Delete investor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvestors.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No investors found. Try adjusting your filters or create a new investor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investor Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Create New Investor' : formMode === 'edit' ? 'Edit Investor' : 'Investor Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Investor Name</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('name', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Investor Type</label>
                  <select
                    id="type"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('type')}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Institutional">Institutional</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('email', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('status')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="totalInvested">Total Invested</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="totalInvested"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('totalInvested', { 
                        valueAsNumber: true,
                        required: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('currency')}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="joinDate">Join Date</label>
                  <input
                    id="joinDate"
                    type="date"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('joinDate', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="commitments">Total Commitments</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="commitments"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('commitments', { 
                        valueAsNumber: true,
                        required: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="distributions">Total Distributions</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="distributions"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('distributions', { 
                        valueAsNumber: true,
                        required: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowForm(false)}
                >
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode !== 'view' && (
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Create Investor' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Portfolio Page
const PortfolioPage: React.FC<{ 
  portfolioCompanies: PortfolioCompany[];
  investments: Investment[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ portfolioCompanies, investments, addToast }) => {
  const [companies, setCompanies] = useState<PortfolioCompany[]>(portfolioCompanies);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'latestValuation', direction: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentCompany, setCurrentCompany] = useState<PortfolioCompany | null>(null);
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  
  const { register, handleSubmit, reset, setValue } = useForm<PortfolioCompany>();

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = Array.from(new Set(companies.map(company => company.industry)));
    return uniqueIndustries.sort();
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let filtered = [...companies];
    if (filterIndustry !== 'all') {
      filtered = filtered.filter(company => company.industry === filterIndustry);
    }
    
    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof PortfolioCompany];
      const bValue = b[sortConfig.key as keyof PortfolioCompany];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      return 0;
    });
  }, [companies, sortConfig, filterIndustry]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openForm = (mode: FormMode, company?: PortfolioCompany) => {
    setFormMode(mode);
    if (company && (mode === 'edit' || mode === 'view')) {
      setCurrentCompany(company);
      // Set form values
      Object.entries(company).forEach(([key, value]) => {
        setValue(key as keyof PortfolioCompany, value);
      });
    } else {
      setCurrentCompany(null);
      reset({
        id: companies.length + 1,
        name: '',
        industry: '',
        foundedYear: new Date().getFullYear() - 5,
        acquiredDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'pre-revenue',
        currency: 'USD',
        website: '',
      });
    }
    setShowForm(true);
  };

  const onSubmit = (data: PortfolioCompany) => {
    if (formMode === 'create') {
      const newCompany = { ...data, id: companies.length + 1 };
      setCompanies([...companies, newCompany]);
      addToast('Company added successfully', 'success');
    } else if (formMode === 'edit' && currentCompany) {
      setCompanies(companies.map(company => 
        company.id === currentCompany.id ? { ...data } : company
      ));
      addToast('Company updated successfully', 'success');
    }
    setShowForm(false);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(companies.filter(company => company.id !== id));
      addToast('Company deleted successfully', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Portfolio Companies</h1>
        <button
          className="btn btn-primary"
          onClick={() => openForm('create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Company
        </button>
      </div>

      {/* Grid/Card View of Portfolio Companies */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="industry-filter" className="text-sm font-medium">Industry:</label>
            <select
              id="industry-filter"
              className="input text-sm py-1"
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Layers className="h-4 w-4 mr-2" />
            Grid View
          </button>
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Portfolio Company Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <div key={company.id} className="card hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</p>
              </div>
              <span className={`badge ${company.status === 'profitable' ? 'badge-success' : company.status === 'growth' ? 'badge-info' : company.status === 'exited' ? 'badge-warning' : 'badge-error'}`}>
                {company.status}
              </span>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Founded:</span>
                <span className="font-medium">{company.foundedYear}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Acquired:</span>
                <span className="font-medium">{format(new Date(company.acquiredDate), 'MMM d, yyyy')}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Valuation:</span>
                <span className="font-medium">
                  {company.latestValuation 
                    ? `${company.currency} ${(company.latestValuation / 1000000).toFixed(1)}M` 
                    : 'N/A'}
                </span>
              </div>
              
              {company.revenueGrowth !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Revenue Growth:</span>
                  <span className={`font-medium ${company.revenueGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {company.revenueGrowth > 0 ? '+' : ''}{company.revenueGrowth}%
                  </span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Website:</span>
                <a 
                  href={company.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
                >
                  Visit
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button 
                className="btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex-1"
                onClick={() => openForm('view', company)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </button>
              <button 
                className="btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex-1"
                onClick={() => openForm('edit', company)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button 
                className="btn-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                onClick={() => handleDelete(company.id)}
                aria-label="Delete company"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredCompanies.length === 0 && (
          <div className="lg:col-span-3 text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400">
              <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No portfolio companies found.</p>
              <p>Try adjusting your filters or add a new company.</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => openForm('create')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Company Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Add Portfolio Company' : formMode === 'edit' ? 'Edit Company' : 'Company Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Company Name</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('name', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="industry">Industry</label>
                  <input
                    id="industry"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('industry', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="foundedYear">Founded Year</label>
                  <input
                    id="foundedYear"
                    type="number"
                    className="input"
                    disabled={formMode === 'view'}
                    min="1900"
                    max={new Date().getFullYear()}
                    {...register('foundedYear', { 
                      valueAsNumber: true,
                      required: true,
                      min: 1900,
                      max: new Date().getFullYear()
                    })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="acquiredDate">Acquisition Date</label>
                  <input
                    id="acquiredDate"
                    type="date"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('acquiredDate', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('status')}
                  >
                    <option value="pre-revenue">Pre-Revenue</option>
                    <option value="growth">Growth</option>
                    <option value="profitable">Profitable</option>
                    <option value="exited">Exited</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="latestValuation">Latest Valuation</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="latestValuation"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('latestValuation', { 
                        valueAsNumber: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('currency')}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="website">Website</label>
                  <input
                    id="website"
                    type="url"
                    className="input"
                    disabled={formMode === 'view'}
                    placeholder="https://example.com"
                    {...register('website', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="revenueGrowth">Revenue Growth (%)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Percent className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="revenueGrowth"
                      type="number"
                      step="0.1"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('revenueGrowth', { 
                        valueAsNumber: true
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowForm(false)}
                >
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode !== 'view' && (
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Add Company' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Documents Page
const DocumentsPage: React.FC<{ 
  documents: Document[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ documents, addToast }) => {
  const [documentsList, setDocumentsList] = useState<Document[]>(documents);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'uploadDate', direction: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  const { register, handleSubmit, reset, setValue } = useForm<Document>();

  const filteredDocuments = useMemo(() => {
    let filtered = [...documentsList];
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }
    
    return filtered.sort((a, b) => {
      if (sortConfig.key === 'uploadDate') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
          : new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
      
      const aValue = a[sortConfig.key as keyof Document];
      const bValue = b[sortConfig.key as keyof Document];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [documentsList, sortConfig, filterType]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openForm = (mode: FormMode, document?: Document) => {
    setFormMode(mode);
    if (document && (mode === 'edit' || mode === 'view')) {
      setCurrentDocument(document);
      // Set form values
      Object.entries(document).forEach(([key, value]) => {
        setValue(key as keyof Document, value);
      });
    } else {
      setCurrentDocument(null);
      reset({
        id: documentsList.length + 1,
        name: '',
        type: 'legal',
        uploadDate: format(new Date(), 'yyyy-MM-dd'),
        size: '0KB',
        uploadedBy: 'John Doe'
      });
    }
    setShowForm(true);
  };

  const onSubmit = (data: Document) => {
    if (formMode === 'create') {
      const newDocument = { ...data, id: documentsList.length + 1 };
      setDocumentsList([...documentsList, newDocument]);
      addToast('Document uploaded successfully', 'success');
    } else if (formMode === 'edit' && currentDocument) {
      setDocumentsList(documentsList.map(doc => 
        doc.id === currentDocument.id ? { ...data } : doc
      ));
      addToast('Document updated successfully', 'success');
    }
    setShowForm(false);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocumentsList(documentsList.filter(doc => doc.id !== id));
      addToast('Document deleted successfully', 'success');
    }
  };

  const getDocumentIcon = (type: Document['type']) => {
    switch (type) {
      case 'legal':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'financial':
        return <DollarSign className="h-8 w-8 text-green-500" />;
      case 'investor':
        return <Users className="h-8 w-8 text-purple-500" />;
      case 'portfolio':
        return <Briefcase className="h-8 w-8 text-orange-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Documents</h1>
        <button
          className="btn btn-primary"
          onClick={() => openForm('create')}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="type-filter" className="text-sm font-medium">Document Type:</label>
            <select
              id="type-filter"
              className="input text-sm py-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="legal">Legal</option>
              <option value="financial">Financial</option>
              <option value="investor">Investor</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              {getDocumentIcon(doc.type)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{doc.name}</h3>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>Uploaded {format(new Date(doc.uploadDate), 'MMM d, yyyy')}</span>
                  <span>•</span>
                  <span>{doc.size}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Type:</span>
                <span className="font-medium capitalize">{doc.type}</span>
              </div>
              
              {doc.relatedEntity && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Related to:</span>
                  <span className="font-medium">{doc.relatedEntity}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Uploaded by:</span>
                <span className="font-medium">{doc.uploadedBy}</span>
              </div>
            </div>
            
            <div className="flex space-x-2 mt-4">
              <button 
                className="btn-sm bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800 flex-1"
                onClick={() => addToast('Document download started', 'info')}
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </button>
              <button 
                className="btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex-1"
                onClick={() => openForm('edit', doc)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button 
                className="btn-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                onClick={() => handleDelete(doc.id)}
                aria-label="Delete document"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        
        {filteredDocuments.length === 0 && (
          <div className="lg:col-span-3 text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-gray-500 dark:text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No documents found.</p>
              <p>Try adjusting your filters or upload a new document.</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => openForm('create')}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Document Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Upload Document' : formMode === 'edit' ? 'Edit Document' : 'Document Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Document Name</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('name', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Document Type</label>
                  <select
                    id="type"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('type')}
                  >
                    <option value="legal">Legal</option>
                    <option value="financial">Financial</option>
                    <option value="investor">Investor</option>
                    <option value="portfolio">Portfolio</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="relatedEntity">Related Entity (Optional)</label>
                  <input
                    id="relatedEntity"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('relatedEntity')}
                  />
                </div>
                
                {formMode === 'create' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="file">Select File</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600 dark:text-gray-400">
                          <label
                            htmlFor="file"
                            className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 dark:focus-within:ring-offset-gray-900"
                          >
                            <span>Upload a file</span>
                            <input id="file" name="file" type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          PDF, DOC, DOCX, XLS up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {formMode !== 'create' && (
                  <>
                    <div className="form-group">
                      <label className="form-label" htmlFor="uploadDate">Upload Date</label>
                      <input
                        id="uploadDate"
                        type="date"
                        className="input"
                        disabled={formMode === 'view'}
                        {...register('uploadDate', { required: true })}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="size">File Size</label>
                      <input
                        id="size"
                        type="text"
                        className="input"
                        disabled={formMode === 'view'}
                        {...register('size', { required: true })}
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label className="form-label" htmlFor="uploadedBy">Uploaded By</label>
                  <input
                    id="uploadedBy"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('uploadedBy', { required: true })}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowForm(false)}
                >
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode !== 'view' && (
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Upload' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Transactions Page
const TransactionsPage: React.FC<{ 
  transactions: Transaction[];
  funds: Fund[];
  investors: Investor[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ transactions, funds, investors, addToast }) => {
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(transactions);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFund, setFilterFund] = useState<number | 'all'>('all');
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<Transaction>();
  const transactionType = watch('type');

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactionsList];
    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }
    if (filterFund !== 'all') {
      filtered = filtered.filter(transaction => transaction.fundId === filterFund);
    }
    
    return filtered.sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc' 
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      
      const aValue = a[sortConfig.key as keyof Transaction];
      const bValue = b[sortConfig.key as keyof Transaction];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      return 0;
    });
  }, [transactionsList, sortConfig, filterType, filterFund]);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const openForm = (mode: FormMode, transaction?: Transaction) => {
    setFormMode(mode);
    if (transaction && (mode === 'edit' || mode === 'view')) {
      setCurrentTransaction(transaction);
      // Set form values
      Object.entries(transaction).forEach(([key, value]) => {
        setValue(key as keyof Transaction, value);
      });
    } else {
      setCurrentTransaction(null);
      reset({
        id: transactionsList.length + 1,
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'capital call',
        amount: 0,
        currency: 'USD',
        fundId: funds[0]?.id || 0,
        description: '',
        status: 'pending'
      });
    }
    setShowForm(true);
  };

  const onSubmit = (data: Transaction) => {
    if (formMode === 'create') {
      const newTransaction = { ...data, id: transactionsList.length + 1 };
      setTransactionsList([...transactionsList, newTransaction]);
      addToast('Transaction created successfully', 'success');
    } else if (formMode === 'edit' && currentTransaction) {
      setTransactionsList(transactionsList.map(transaction => 
        transaction.id === currentTransaction.id ? { ...data } : transaction
      ));
      addToast('Transaction updated successfully', 'success');
    }
    setShowForm(false);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      setTransactionsList(transactionsList.filter(transaction => transaction.id !== id));
      addToast('Transaction deleted successfully', 'success');
    }
  };

  const getStatusBadgeClass = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'failed':
        return 'badge-error';
      default:
        return 'badge-info';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        <button
          className="btn btn-primary"
          onClick={() => openForm('create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="type-filter" className="text-sm font-medium">Type:</label>
            <select
              id="type-filter"
              className="input text-sm py-1"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="capital call">Capital Call</option>
              <option value="distribution">Distribution</option>
              <option value="expense">Expense</option>
              <option value="fee">Fee</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label htmlFor="fund-filter" className="text-sm font-medium">Fund:</label>
            <select
              id="fund-filter"
              className="input text-sm py-1"
              value={filterFund === 'all' ? 'all' : filterFund.toString()}
              onChange={(e) => setFilterFund(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            >
              <option value="all">All Funds</option>
              {funds.map(fund => (
                <option key={fund.id} value={fund.id.toString()}>{fund.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="btn bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date
                    {sortConfig.key === 'date' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Type</th>
                <th className="table-header">Fund</th>
                <th 
                  className="table-header cursor-pointer"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Amount
                    {sortConfig.key === 'amount' && (
                      sortConfig.direction === 'asc' ? <SortAsc className="h-4 w-4 ml-1" /> : <SortDesc className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="table-header">Description</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="table-cell">{format(new Date(transaction.date), 'MMM d, yyyy')}</td>
                  <td className="table-cell capitalize">{transaction.type}</td>
                  <td className="table-cell">{funds.find(f => f.id === transaction.fundId)?.name || 'Unknown Fund'}</td>
                  <td className="table-cell">
                    {transaction.currency} {transaction.amount.toLocaleString()}
                  </td>
                  <td className="table-cell truncate max-w-xs">{transaction.description}</td>
                  <td className="table-cell">
                    <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        onClick={() => openForm('view', transaction)}
                        aria-label="View transaction"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => openForm('edit', transaction)}
                        aria-label="Edit transaction"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(transaction.id)}
                        aria-label="Delete transaction"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No transactions found. Try adjusting your filters or create a new transaction.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Create New Transaction' : formMode === 'edit' ? 'Edit Transaction' : 'Transaction Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Transaction Date</label>
                  <input
                    id="date"
                    type="date"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('date', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Transaction Type</label>
                  <select
                    id="type"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('type')}
                  >
                    <option value="capital call">Capital Call</option>
                    <option value="distribution">Distribution</option>
                    <option value="expense">Expense</option>
                    <option value="fee">Fee</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="fundId">Fund</label>
                  <select
                    id="fundId"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('fundId', { 
                      valueAsNumber: true,
                      required: true 
                    })}
                  >
                    {funds.map(fund => (
                      <option key={fund.id} value={fund.id}>{fund.name}</option>
                    ))}
                  </select>
                </div>
                
                {(transactionType === 'capital call' || transactionType === 'distribution') && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="investorId">Investor</label>
                    <select
                      id="investorId"
                      className="input"
                      disabled={formMode === 'view'}
                      {...register('investorId', { 
                        valueAsNumber: true
                      })}
                    >
                      <option value="">Select Investor</option>
                      {investors.map(investor => (
                        <option key={investor.id} value={investor.id}>{investor.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="amount"
                      type="number"
                      className="input pl-10"
                      disabled={formMode === 'view'}
                      {...register('amount', { 
                        valueAsNumber: true,
                        required: true,
                        min: 0
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="currency">Currency</label>
                  <select
                    id="currency"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('currency')}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    rows={3}
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('description', { required: true })}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('status')}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowForm(false)}
                >
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode !== 'view' && (
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Create Transaction' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Settings Page
const SettingsPage: React.FC<{ 
  users: User[];
  addToast: (message: string, type: Toast['type']) => void;
}> = ({ users, addToast }) => {
  const [usersList, setUsersList] = useState<User[]>(users);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const { register, handleSubmit, reset, setValue } = useForm<User>();

  const openForm = (mode: FormMode, user?: User) => {
    setFormMode(mode);
    if (user && (mode === 'edit' || mode === 'view')) {
      setCurrentUser(user);
      // Set form values
      Object.entries(user).forEach(([key, value]) => {
        setValue(key as keyof User, value);
      });
    } else {
      setCurrentUser(null);
      reset({
        id: usersList.length + 1,
        name: '',
        email: '',
        role: 'user',
        status: 'pending',
        dateJoined: format(new Date(), 'yyyy-MM-dd')
      });
    }
    setShowForm(true);
  };

  const onSubmit = (data: User) => {
    if (formMode === 'create') {
      const newUser = { ...data, id: usersList.length + 1 };
      setUsersList([...usersList, newUser]);
      addToast('User created successfully', 'success');
    } else if (formMode === 'edit' && currentUser) {
      setUsersList(usersList.map(user => 
        user.id === currentUser.id ? { ...data } : user
      ));
      addToast('User updated successfully', 'success');
    }
    setShowForm(false);
    reset();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsersList(usersList.filter(user => user.id !== id));
      addToast('User deleted successfully', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-6 px-4">
            <button className="whitespace-nowrap py-4 px-1 border-b-2 border-primary-500 font-medium text-primary-600 dark:text-primary-400">
              Users & Permissions
            </button>
            <button className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600">
              General
            </button>
            <button className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600">
              Notifications
            </button>
            <button className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600">
              Security
            </button>
          </nav>
        </div>

        <div className="p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">User Management</h2>
            <button
              className="btn btn-primary"
              onClick={() => openForm('create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date Joined</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {usersList.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td className="table-cell font-medium">{user.name}</td>
                    <td className="table-cell">{user.email}</td>
                    <td className="table-cell capitalize">{user.role}</td>
                    <td className="table-cell">
                      <span className={`badge ${user.status === 'active' ? 'badge-success' : user.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="table-cell">{format(new Date(user.dateJoined), 'MMM d, yyyy')}</td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button 
                          className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          onClick={() => openForm('view', user)}
                          aria-label="View user"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          onClick={() => openForm('edit', user)}
                          aria-label="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleDelete(user.id)}
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* User Form Modal */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {formMode === 'create' ? 'Add User' : formMode === 'edit' ? 'Edit User' : 'User Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowForm(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('name', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('email', { required: true })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="role">Role</label>
                  <select
                    id="role"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('role')}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    disabled={formMode === 'view'}
                    {...register('status')}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                {formMode !== 'create' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="dateJoined">Date Joined</label>
                    <input
                      id="dateJoined"
                      type="date"
                      className="input"
                      disabled={formMode === 'view'}
                      {...register('dateJoined')}
                    />
                  </div>
                )}

                {formMode === 'create' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="password">Password</label>
                    <input
                      id="password"
                      type="password"
                      className="input"
                      placeholder="••••••••"
                    />
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setShowForm(false)}
                >
                  {formMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {formMode !== 'view' && (
                  <button type="submit" className="btn btn-primary">
                    {formMode === 'create' ? 'Create User' : 'Save Changes'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;