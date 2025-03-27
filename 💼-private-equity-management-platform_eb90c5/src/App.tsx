import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import styles from './styles/styles.module.css';
import {
  Home,
  Briefcase,
  Users,
  BarChart3,
  PieChart,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Info,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  UserPlus,
  FileText,
  Eye,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Menu,
  LogOut,
  Settings
} from 'lucide-react';

// Define the types for our application
type Fund = {
  id: string;
  name: string;
  amount: number;
  type: FundType;
  status: FundStatus;
  investors: number;
  returnRate: number;
  aum: number;
  startDate: string;
  endDate: string;
  description: string;
};

type Investment = {
  id: string;
  fundId: string;
  amount: number;
  date: string;
  status: InvestmentStatus;
  investor: Investor;
  notes: string;
};

type Investor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  investmentTotal: number;
  joinDate: string;
  status: InvestorStatus;
  type: InvestorType;
  profileImage?: string;
};

type Performance = {
  id: string;
  fundId: string;
  period: string;
  returnRate: number;
  benchmark: number;
  aum: number;
};

type Document = {
  id: string;
  name: string;
  fundId: string;
  type: DocumentType;
  uploadDate: string;
  size: string;
};

enum FundType {
  VENTURE_CAPITAL = 'Venture Capital',
  PRIVATE_EQUITY = 'Private Equity',
  HEDGE_FUND = 'Hedge Fund',
  REAL_ESTATE = 'Real Estate',
  DEBT = 'Debt'
}

enum FundStatus {
  ACTIVE = 'Active',
  CLOSED = 'Closed',
  RAISING = 'Raising',
  LIQUIDATED = 'Liquidated'
}

enum InvestmentStatus {
  COMMITTED = 'Committed',
  CALLED = 'Called',
  DISTRIBUTED = 'Distributed',
  EXITED = 'Exited'
}

enum InvestorStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending'
}

enum InvestorType {
  INDIVIDUAL = 'Individual',
  INSTITUTIONAL = 'Institutional',
  FAMILY_OFFICE = 'Family Office'
}

enum DocumentType {
  LEGAL = 'Legal',
  FINANCIAL = 'Financial',
  MARKETING = 'Marketing',
  REPORT = 'Report'
}

// Context for theme management
type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {}
});

// Mock data for our application
const generateMockData = () => {
  // Mock funds
  const mockFunds: Fund[] = [
    {
      id: '1',
      name: 'Growth Equity Fund I',
      amount: 100000000,
      type: FundType.PRIVATE_EQUITY,
      status: FundStatus.ACTIVE,
      investors: 45,
      returnRate: 12.5,
      aum: 85000000,
      startDate: '2021-01-01',
      endDate: '2031-01-01',
      description: 'A growth equity fund focused on technology companies in expansion stage.'
    },
    {
      id: '2',
      name: 'Venture Capital Fund II',
      amount: 50000000,
      type: FundType.VENTURE_CAPITAL,
      status: FundStatus.RAISING,
      investors: 30,
      returnRate: 18.7,
      aum: 35000000,
      startDate: '2022-03-15',
      endDate: '2030-03-15',
      description: 'Early-stage venture capital fund investing in AI and blockchain startups.'
    },
    {
      id: '3',
      name: 'Real Estate Opportunity Fund',
      amount: 150000000,
      type: FundType.REAL_ESTATE,
      status: FundStatus.ACTIVE,
      investors: 60,
      returnRate: 8.2,
      aum: 140000000,
      startDate: '2020-06-01',
      endDate: '2035-06-01',
      description: 'Fund focused on commercial real estate opportunities in metropolitan areas.'
    },
    {
      id: '4',
      name: 'Credit Opportunities Fund',
      amount: 75000000,
      type: FundType.DEBT,
      status: FundStatus.CLOSED,
      investors: 25,
      returnRate: 7.5,
      aum: 75000000,
      startDate: '2019-11-01',
      endDate: '2029-11-01',
      description: 'Fund providing debt financing to mid-market companies with strong fundamentals.'
    },
    {
      id: '5',
      name: 'Long/Short Equity Fund',
      amount: 200000000,
      type: FundType.HEDGE_FUND,
      status: FundStatus.ACTIVE,
      investors: 80,
      returnRate: 15.3,
      aum: 190000000,
      startDate: '2020-01-15',
      endDate: '2030-01-15',
      description: 'Hedge fund employing long/short equity strategies across global markets.'
    }
  ];

  // Mock investors
  const mockInvestors: Investor[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      investmentTotal: 5000000,
      joinDate: '2021-02-15',
      status: InvestorStatus.ACTIVE,
      type: InvestorType.INDIVIDUAL
    },
    {
      id: '2',
      name: 'Acme Capital',
      email: 'investments@acmecapital.com',
      phone: '+1 (555) 987-6543',
      investmentTotal: 25000000,
      joinDate: '2020-11-03',
      status: InvestorStatus.ACTIVE,
      type: InvestorType.INSTITUTIONAL
    },
    {
      id: '3',
      name: 'Thompson Family Office',
      email: 'info@thompsonfamily.com',
      phone: '+1 (555) 456-7890',
      investmentTotal: 15000000,
      joinDate: '2021-04-22',
      status: InvestorStatus.ACTIVE,
      type: InvestorType.FAMILY_OFFICE
    },
    {
      id: '4',
      name: 'Jane Williams',
      email: 'jane.williams@example.com',
      phone: '+1 (555) 222-3333',
      investmentTotal: 3000000,
      joinDate: '2022-01-10',
      status: InvestorStatus.PENDING,
      type: InvestorType.INDIVIDUAL
    },
    {
      id: '5',
      name: 'Global Ventures LLC',
      email: 'contact@globalventures.com',
      phone: '+1 (555) 888-9999',
      investmentTotal: 30000000,
      joinDate: '2020-09-01',
      status: InvestorStatus.ACTIVE,
      type: InvestorType.INSTITUTIONAL
    }
  ];

  // Mock investments
  const mockInvestments: Investment[] = [
    {
      id: '1',
      fundId: '1',
      amount: 5000000,
      date: '2021-03-10',
      status: InvestmentStatus.CALLED,
      investor: mockInvestors[0],
      notes: 'Initial investment in Fund I'
    },
    {
      id: '2',
      fundId: '1',
      amount: 15000000,
      date: '2021-02-20',
      status: InvestmentStatus.CALLED,
      investor: mockInvestors[1],
      notes: 'Strategic investment with potential follow-on'
    },
    {
      id: '3',
      fundId: '2',
      amount: 10000000,
      date: '2022-04-15',
      status: InvestmentStatus.COMMITTED,
      investor: mockInvestors[2],
      notes: 'Commitment to Venture Fund with staged capital calls'
    },
    {
      id: '4',
      fundId: '3',
      amount: 8000000,
      date: '2020-07-11',
      status: InvestmentStatus.DISTRIBUTED,
      investor: mockInvestors[4],
      notes: 'Partial distribution following property sale'
    },
    {
      id: '5',
      fundId: '5',
      amount: 12000000,
      date: '2020-03-01',
      status: InvestmentStatus.CALLED,
      investor: mockInvestors[1],
      notes: 'Investment in long/short strategy'
    }
  ];

  // Mock performance data
  const mockPerformance: Performance[] = [
    {
      id: '1',
      fundId: '1',
      period: 'Q1 2023',
      returnRate: 3.2,
      benchmark: 2.8,
      aum: 83000000
    },
    {
      id: '2',
      fundId: '1',
      period: 'Q2 2023',
      returnRate: 2.9,
      benchmark: 2.5,
      aum: 85000000
    },
    {
      id: '3',
      fundId: '2',
      period: 'Q1 2023',
      returnRate: 4.5,
      benchmark: 3.2,
      aum: 32000000
    },
    {
      id: '4',
      fundId: '2',
      period: 'Q2 2023',
      returnRate: 5.1,
      benchmark: 3.5,
      aum: 35000000
    },
    {
      id: '5',
      fundId: '3',
      period: 'Q1 2023',
      returnRate: 2.1,
      benchmark: 1.9,
      aum: 138000000
    }
  ];

  // Mock documents
  const mockDocuments: Document[] = [
    {
      id: '1',
      name: 'Fund I LPA.pdf',
      fundId: '1',
      type: DocumentType.LEGAL,
      uploadDate: '2021-01-05',
      size: '2.3 MB'
    },
    {
      id: '2',
      name: 'Q1 2023 Investor Report.pdf',
      fundId: '1',
      type: DocumentType.REPORT,
      uploadDate: '2023-04-15',
      size: '4.1 MB'
    },
    {
      id: '3',
      name: 'Venture Fund II PPM.pdf',
      fundId: '2',
      type: DocumentType.MARKETING,
      uploadDate: '2022-02-28',
      size: '3.7 MB'
    },
    {
      id: '4',
      name: 'Real Estate Fund Financial Statements.xlsx',
      fundId: '3',
      type: DocumentType.FINANCIAL,
      uploadDate: '2023-03-10',
      size: '1.8 MB'
    },
    {
      id: '5',
      name: 'Hedge Fund Subscription Agreement.pdf',
      fundId: '5',
      type: DocumentType.LEGAL,
      uploadDate: '2020-01-10',
      size: '1.2 MB'
    }
  ];

  return { mockFunds, mockInvestors, mockInvestments, mockPerformance, mockDocuments };
};

// Dashboard component
const Dashboard = () => {
  const { mockFunds, mockInvestments } = generateMockData();
  
  // Calculate summary stats
  const totalAUM = mockFunds.reduce((sum, fund) => sum + fund.aum, 0);
  const activeFunds = mockFunds.filter(fund => fund.status === FundStatus.ACTIVE).length;
  const avgReturn = mockFunds.reduce((sum, fund) => sum + fund.returnRate, 0) / mockFunds.length;
  const totalInvestments = mockInvestments.length;

  return (
    <div className="container-fluid p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Private Equity Dashboard</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-title">Total AUM</div>
          <div className="stat-value">${(totalAUM / 1000000).toFixed(1)}M</div>
          <div className="stat-desc">↗︎ 8% from last month</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Active Funds</div>
          <div className="stat-value">{activeFunds}</div>
          <div className="stat-desc">{activeFunds} Funds</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Average Return</div>
          <div className="stat-value">{avgReturn.toFixed(2)}%</div>
          <div className="stat-desc">Avg. Return Rate</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Investments</div>
          <div className="stat-value">{totalInvestments}</div>
          <div className="stat-desc">All Investments</div>
        </div>
      </div>
      
      {/* Recent Investments Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-md overflow-hidden">
        <div className="p-4">
          <h2 className="text-lg font-semibold dark:text-white">Recent Investments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300">
                  Fund
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300">
                  Investor
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300">
                  Amount
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300">
                  Date
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider dark:bg-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {mockInvestments.map(investment => (
                <tr key={investment.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-800 dark:text-gray-300">
                    <p className="text-gray-900 whitespace-no-wrap dark:text-gray-300">Fund {investment.fundId}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-800 dark:text-gray-300">
                    <p className="text-gray-900 whitespace-no-wrap dark:text-gray-300">{investment.investor.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-800 dark:text-gray-300">
                    <p className="text-gray-900 whitespace-no-wrap dark:text-gray-300">${investment.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-800 dark:text-gray-300">
                    <p className="text-gray-900 whitespace-no-wrap dark:text-gray-300">{investment.date}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm dark:bg-gray-800 dark:text-gray-300">
                    <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                      <span aria-hidden className="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span>
                      <span className="relative">{investment.status}</span>
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
};

// Settings component
const SettingsComponent = () => {
  return (
    <div className="container-fluid p-6">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Platform Settings</h1>
      <p className="dark:text-white">Here you can manage your platform settings.</p>
    </div>
  );
};

// App component
const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const themeContextValue = useMemo(() => ({
    isDarkMode,
    toggleTheme
  }), [isDarkMode]);

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <Router>
        <div className={`App ${isDarkMode ? 'dark' : ''}`}>
          <nav className="bg-white border-gray-200 dark:bg-gray-900">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
              <Link to="/" className="flex items-center">
                <img src="https://flowbite.com/docs/images/logo.svg" className="h-8 mr-3" alt="Flowbite Logo" />
                <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">Flowbite</span>
              </Link>
              <div className="flex items-center md:order-2">
                <button type="button" onClick={toggleTheme} className="flex mr-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" id="user-menu-button" aria-expanded="false" data-dropdown-toggle="user-dropdown" data-dropdown-placement="bottom">
                  <span className="sr-only">Open user menu</span>
                  {isDarkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-gray-800" />}
                </button>
                {/* Dropdown menu */}
                <div className="z-50 hidden my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600" id="user-dropdown">
                  <div className="px-4 py-3">
                    <span className="block text-sm  dark:text-white">Bonnie Green</span>
                    <span className="block text-sm font-medium text-gray-500 truncate dark:text-gray-400">name@flowbite.com</span>
                  </div>
                  <ul className="py-2">
                    <li>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Settings</Link>
                    </li>
                    <li>
                      <Link to="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Sign out</Link>
                    </li>
                  </ul>
                </div>
                <button data-collapse-toggle="navbar-user" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-user" aria-expanded="false">
                  <span className="sr-only">Open main menu</span>
                  <Menu className="h-5 w-5" />
                </button>
              </div>
              <div className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-user">
                <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
                  <li>
                    <Link to="/" className="block py-2 pl-3 pr-4 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0 md:dark:text-blue-500" aria-current="page">Home</Link>
                  </li>
                  <li>
                    <Link to="/funds" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent border-0">Funds</Link>
                  </li>
                  <li>
                    <Link to="/investors" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent border-0">Investors</Link>
                  </li>
                  <li>
                    <Link to="/documents" className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent border-0">Documents</Link>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsComponent />} />
          </Routes>
        </div>
      </Router>
    </ThemeContext.Provider>
  );
};

export default App;
