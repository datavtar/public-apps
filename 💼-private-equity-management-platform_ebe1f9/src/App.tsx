import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Home,
  PieChart,
  TrendingUp,
  Users,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  Eye,
  Moon,
  Sun,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  RefreshCw,
  DollarSign,
  Briefcase,
  BarChart,
  FileText,
  HelpCircle,
  Settings as SettingsIcon,
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript types
type Investment = {
  id: string;
  name: string;
  company: string;
  amount: number;
  date: string;
  stage: 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Pre-IPO';
  roi: number;
  status: 'Active' | 'Exited' | 'Pending';
};

type Fund = {
  id: string;
  name: string;
  totalCapital: number;
  committed: number;
  available: number;
  investors: number;
  investments: number;
  performance: number;
  inceptionDate: string;
};

type Investor = {
  id: string;
  name: string;
  email: string;
  commitment: number;
  contributed: number;
  remaining: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
};

type Transaction = {
  id: string;
  type: 'Capital Call' | 'Distribution' | 'Management Fee' | 'Investment' | 'Exit';
  amount: number;
  date: string;
  fund: string;
  description: string;
};

type Document = {
  id: string;
  name: string;
  type: 'Legal' | 'Financial' | 'Report' | 'Other';
  uploadDate: string;
  size: string;
};

type Report = {
  id: string;
  name: string;
  period: string;
  generatedDate: string;
  type: 'Quarterly' | 'Annual' | 'Portfolio' | 'Performance';
};

type ChartData = {
  label: string;
  value: number;
  color: string;
};

type InvestmentFormInputs = {
  name: string;
  company: string;
  amount: number;
  date: string;
  stage: 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Pre-IPO';
  status: 'Active' | 'Exited' | 'Pending';
};

type InvestorFormInputs = {
  name: string;
  email: string;
  commitment: number;
  joinDate: string;
  status: 'Active' | 'Inactive';
};

type FundFormInputs = {
  name: string;
  totalCapital: number;
  inceptionDate: string;
};

type TransactionFormInputs = {
  type: 'Capital Call' | 'Distribution' | 'Management Fee' | 'Investment' | 'Exit';
  amount: number;
  date: string;
  fund: string;
  description: string;
};

type DocumentFormInputs = {
  name: string;
  type: 'Legal' | 'Financial' | 'Report' | 'Other';
};

type TabType = 'overview' | 'investors' | 'investments' | 'performance' | 'documents';

// Mock data generation
const generateMockInvestments = (): Investment[] => {
  const stages: Array<'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Pre-IPO'> = [
    'Seed', 'Series A', 'Series B', 'Series C', 'Pre-IPO'
  ];
  const statuses: Array<'Active' | 'Exited' | 'Pending'> = ['Active', 'Exited', 'Pending'];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `inv-${i + 1}`,
    name: `Investment ${i + 1}`,
    company: `Company ${String.fromCharCode(65 + i % 26)}`,
    amount: Math.floor(Math.random() * 10000000) / 100,
    date: format(new Date(2022, i % 12, (i % 28) + 1), 'yyyy-MM-dd'),
    stage: stages[i % stages.length],
    roi: Math.floor(Math.random() * 5000) / 100 - 20,
    status: statuses[i % statuses.length]
  }));
};

const generateMockFunds = (): Fund[] => {
  return Array.from({ length: 5 }, (_, i) => {
    const totalCapital = Math.floor(Math.random() * 100000000) / 100;
    const committed = Math.floor(Math.random() * totalCapital) / 100;
    return {
      id: `fund-${i + 1}`,
      name: `Fund ${i + 1}`,
      totalCapital,
      committed,
      available: totalCapital - committed,
      investors: Math.floor(Math.random() * 50) + 10,
      investments: Math.floor(Math.random() * 20) + 5,
      performance: Math.floor(Math.random() * 3000) / 100 - 10,
      inceptionDate: format(new Date(2020 + i, i % 12, (i % 28) + 1), 'yyyy-MM-dd')
    };
  });
};

const generateMockInvestors = (): Investor[] => {
  const statuses: Array<'Active' | 'Inactive'> = ['Active', 'Inactive'];
  
  return Array.from({ length: 15 }, (_, i) => {
    const commitment = Math.floor(Math.random() * 10000000) / 100;
    const contributed = Math.floor(Math.random() * commitment) / 100;
    return {
      id: `inv-${i + 1}`,
      name: `Investor ${i + 1}`,
      email: `investor${i + 1}@example.com`,
      commitment,
      contributed,
      remaining: commitment - contributed,
      joinDate: format(new Date(2021, i % 12, (i % 28) + 1), 'yyyy-MM-dd'),
      status: statuses[i % statuses.length]
    };
  });
};

const generateMockTransactions = (): Transaction[] => {
  const types: Array<'Capital Call' | 'Distribution' | 'Management Fee' | 'Investment' | 'Exit'> = [
    'Capital Call', 'Distribution', 'Management Fee', 'Investment', 'Exit'
  ];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: `txn-${i + 1}`,
    type: types[i % types.length],
    amount: Math.floor(Math.random() * 1000000) / 100 * (types[i % types.length] === 'Distribution' || types[i % types.length] === 'Exit' ? 1 : -1),
    date: format(new Date(2023, i % 12, (i % 28) + 1), 'yyyy-MM-dd'),
    fund: `Fund ${(i % 5) + 1}`,
    description: `${types[i % types.length]} for ${types[i % types.length] === 'Investment' ? 'Company ' + String.fromCharCode(65 + i % 26) : `Fund ${(i % 5) + 1}`}`
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const generateMockDocuments = (): Document[] => {
  const types: Array<'Legal' | 'Financial' | 'Report' | 'Other'> = [
    'Legal', 'Financial', 'Report', 'Other'
  ];
  const fileNames = [
    'Limited Partnership Agreement',
    'Quarterly Report',
    'Annual Financial Statement',
    'Subscription Agreement',
    'Due Diligence Report',
    'Investment Memorandum',
    'Tax Documentation',
    'Investor Update',
    'Portfolio Overview',
    'Capital Account Statement'
  ];
  
  return Array.from({ length: 10 }, (_, i) => ({
    id: `doc-${i + 1}`,
    name: fileNames[i % fileNames.length],
    type: types[i % types.length],
    uploadDate: format(new Date(2023, i % 12, (i % 28) + 1), 'yyyy-MM-dd'),
    size: `${Math.floor(Math.random() * 10) + 1}.${Math.floor(Math.random() * 90) + 10} MB`
  }));
};

const generateMockReports = (): Report[] => {
  const types: Array<'Quarterly' | 'Annual' | 'Portfolio' | 'Performance'> = [
    'Quarterly', 'Annual', 'Portfolio', 'Performance'
  ];
  
  return Array.from({ length: 8 }, (_, i) => {
    const year = 2023 - Math.floor(i / 4);
    const quarter = i % 4 + 1;
    return {
      id: `report-${i + 1}`,
      name: `${types[i % types.length]} Report - ${year} ${types[i % types.length] === 'Quarterly' ? `Q${quarter}` : ''}`,
      period: `${year}-${types[i % types.length] === 'Quarterly' ? `Q${quarter}` : 'Annual'}`,
      generatedDate: format(new Date(year, (quarter * 3) % 12, 15), 'yyyy-MM-dd'),
      type: types[i % types.length]
    };
  });
};

// Main App Component
const App: React.FC = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'funds', element: <Funds /> },
        { path: 'funds/:fundId', element: <FundDetail /> },
        { path: 'investors', element: <Investors /> },
        { path: 'investments', element: <Investments /> },
        { path: 'transactions', element: <Transactions /> },
        { path: 'documents', element: <Documents /> },
        { path: 'reports', element: <Reports /> },
        { path: 'settings', element: <Settings /> },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

// Layout Component
const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    // Apply or remove dark class on body
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden theme-transition-all">
      {/* Mobile sidebar */}
      <div
        className={`${sidebarOpen ? 'block' : 'hidden'} fixed inset-0 z-20 transition-opacity bg-gray-500 bg-opacity-75 lg:hidden`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'translate-x-0 ease-out' : '-translate-x-full ease-in'} fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-white dark:bg-gray-800 transition duration-300 transform lg:translate-x-0 lg:static lg:inset-0 theme-transition`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <PieChart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <span className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">EquityManage</span>
          </div>
          <button
            className="p-1 text-gray-500 rounded-md lg:hidden hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar content */}
        <nav className="py-6">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Home className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/funds"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Briefcase className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Funds</span>
              </Link>
            </li>
            <li>
              <Link
                to="/investors"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Users className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Investors</span>
              </Link>
            </li>
            <li>
              <Link
                to="/investments"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <TrendingUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Investments</span>
              </Link>
            </li>
            <li>
              <Link
                to="/transactions"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <DollarSign className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Transactions</span>
              </Link>
            </li>
            <li>
              <Link
                to="/documents"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Documents</span>
              </Link>
            </li>
            <li>
              <Link
                to="/reports"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <BarChart className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Reports</span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className="flex items-center p-2 space-x-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <SettingsIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 w-full overflow-x-hidden">
        <header className="z-10 py-4 bg-white shadow-md dark:bg-gray-800">
          <div className="container flex items-center justify-between h-full px-6 mx-auto text-gray-600 dark:text-gray-300">
            {/* Mobile hamburger */}
            <button
              className="p-1 mr-5 -ml-1 rounded-md lg:hidden focus:outline-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search input */}
            <div className="flex justify-center flex-1 lg:mr-32">
              <div className="relative w-full max-w-xl mr-6 focus-within:text-primary-500">
                <div className="absolute inset-y-0 flex items-center pl-2 pointer-events-none">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  className="w-full pl-8 pr-2 text-sm text-gray-700 placeholder-gray-600 bg-gray-100 border-0 rounded-md dark:placeholder-gray-500 dark:focus:shadow-outline-gray dark:focus:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 focus:placeholder-gray-500 focus:bg-white focus:outline-none form-input"
                  type="text"
                  placeholder="Search"
                  aria-label="Search"
                />
              </div>
            </div>

            <ul className="flex items-center flex-shrink-0 space-x-6">
              {/* Theme toggler */}
              <li className="relative">
                <button
                    className="rounded-full focus:shadow-outline-primary focus:outline-none"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label="Toggle color mode"
                  >
                    {isDarkMode ? (
                      <Sun className="w-5 h-5" aria-hidden="true" />
                    ) : (
                      <Moon className="w-5 h-5" aria-hidden="true" />
                    )}
                </button>
              </li>
              {/* Notifications menu */}
              <li className="relative">
                <button
                  className="relative align-middle rounded-md focus:outline-none"
                  aria-label="Notifications"
                  aria-haspopup="true"
                >
                  <Bell className="w-5 h-5" aria-hidden="true" />
                  <span className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1/2 -translate-y-1/2 bg-red-600 border-2 border-white rounded-full dark:border-gray-800"></span>
                </button>
              </li>
              {/* Profile menu */}
              <li className="relative">
                <button
                  className="align-middle rounded-full focus:shadow-outline-primary focus:outline-none"
                  aria-label="Account"
                  aria-haspopup="true"
                >
                  <img
                    className="object-cover w-8 h-8 rounded-full"
                    src="https://images.unsplash.com/photo-1502378735452-bc7d86632805?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=bce7183540a397290ad665702d069bc2"
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </li>
            </ul>
          </div>
        </header>

        {/* Main content */}
        <main className="h-full overflow-y-auto">
          <div className="container px-6 mx-auto grid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

// Dashboard Page
const Dashboard: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Dashboard</h2>
      {/* Add dashboard content here */}
      <p className="text-gray-600 dark:text-gray-400">Welcome to the dashboard!</p>
    </div>
  );
};

// Funds Page
const Funds: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Funds</h2>
      {/* Add funds page content here */}
      <p className="text-gray-600 dark:text-gray-400">List of funds.</p>
    </div>
  );
};

// Fund Detail Page
const FundDetail: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Fund Detail</h2>
      {/* Add fund detail content here */}
      <p className="text-gray-600 dark:text-gray-400">Details of a specific fund.</p>
    </div>
  );
};

// Investors Page
const Investors: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Investors</h2>
      {/* Add investors page content here */}
      <p className="text-gray-600 dark:text-gray-400">List of investors.</p>
    </div>
  );
};

// Investments Page
const Investments: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Investments</h2>
      {/* Add investments page content here */}
      <p className="text-gray-600 dark:text-gray-400">List of investments.</p>
    </div>
  );
};

// Transactions Page
const Transactions: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Transactions</h2>
      {/* Add transactions page content here */}
      <p className="text-gray-600 dark:text-gray-400">List of transactions.</p>
    </div>
  );
};

// Documents Page
const Documents: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Documents</h2>
      {/* Add documents page content here */}
      <p className="text-gray-600 dark:text-gray-400">List of documents.</p>
    </div>
  );
};

// Reports Page
const Reports: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">Reports</h2>
      {/* Add reports page content here */}
      <p className="text-gray-600 dark:text-gray-400">List of reports.</p>
    </div>
  );
};

// Settings Page
const Settings: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your account settings.</p>
      </div>
      {/* Add settings content here */}
    </div>
  );
};

export default App;