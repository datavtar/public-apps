import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format } from 'date-fns';
import { 
  Home, 
  Building2, 
  BarChart3, 
  Users, 
  Briefcase, 
  FileText, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  MoreHorizontal,
  Filter,
  LogOut,
  Moon,
  Sun,
  AlertCircle,
  ChevronLeft,
  ArrowUpDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  return (
    <Router>
      <MainApp />
    </Router>
  );
};

const MainApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out z-30`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">EquityPro</span>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={toggleSidebar}
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-4 px-2">
          <SidebarLink to="/" icon={<Home />} text="Dashboard" />
          <SidebarLink to="/portfolio" icon={<Briefcase />} text="Portfolio" />
          <SidebarLink to="/investments" icon={<BarChart3 />} text="Investments" />
          <SidebarLink to="/investors" icon={<Users />} text="Investors" />
          <SidebarLink to="/documents" icon={<FileText />} text="Documents" />
          <SidebarLink to="/settings" icon={<SettingsIcon />} text="Settings" />
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm dark:text-slate-300">Theme</span>
            <button 
              className="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="User" className="h-10 w-10 rounded-full" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Founder</p>
            </div>
            <button className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-20">
        <div className="flex items-center justify-between p-4">
          <button 
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={toggleSidebar}
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <Building2 className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <span className="ml-2 text-lg font-bold text-gray-900 dark:text-white">EquityPro</span>
          </div>
          <div className="w-6"></div> {/* Empty div for flex alignment */}
        </div>
      </div>

      {/* Main content */}
      <div className="md:ml-64 pt-16 md:pt-0 min-h-screen flex flex-col">
        <div className="flex-grow p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/investors" element={<Investors />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/portfolio/add" element={<AddFund />} />
            <Route path="/portfolio/:id" element={<FundDetails />} />
            <Route path="/portfolio/:id/edit" element={<EditFund />} />
          </Routes>
        </div>
        <footer className="md:ml-0 py-4 px-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
          Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-20"
          onClick={toggleSidebar}
          aria-label="Close sidebar backdrop"
        ></div>
      )}
    </div>
  );
};

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, text }) => {
  const location = useLocation();
  const isActive = location.pathname === to || 
                   (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link 
      to={to} 
      className={`flex items-center px-4 py-3 mb-1 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'}`}
    >
      <span className={`mr-3 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {icon}
      </span>
      {text}
    </Link>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const portfolioStats = {
    totalValue: '$24,750,000',
    committed: '$15,500,000',
    available: '$9,250,000',
    returns: '+12.8%',
  };

  const activityData = [
    { id: 1, action: 'New investment', details: 'Tech Innovations Fund', amount: '$2,500,000', date: '2025-06-15', status: 'Completed' },
    { id: 2, action: 'Capital call', details: 'Growth Equity III', amount: '$1,000,000', date: '2025-06-12', status: 'Pending' },
    { id: 3, action: 'Distribution', details: 'Infrastructure Fund', amount: '$350,000', date: '2025-06-10', status: 'Completed' },
    { id: 4, action: 'Commitment', details: 'Healthcare Ventures', amount: '$3,000,000', date: '2025-06-05', status: 'Completed' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..." 
              className="input pl-10 pr-4 py-2 w-full" 
              aria-label="Search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button className="btn btn-primary flex items-center gap-1">
            <Plus className="h-4 w-4" /> New
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="stat-title">Total Portfolio Value</div>
          <div className="stat-value">{portfolioStats.totalValue}</div>
          <div className="stat-desc text-green-600 dark:text-green-400">↗︎ 8.2% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Committed Capital</div>
          <div className="stat-value">{portfolioStats.committed}</div>
          <div className="stat-desc">62% of total portfolio</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Available Capital</div>
          <div className="stat-value">{portfolioStats.available}</div>
          <div className="stat-desc">38% of total portfolio</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Overall Returns</div>
          <div className="stat-value text-green-600 dark:text-green-400">{portfolioStats.returns}</div>
          <div className="stat-desc">YTD performance</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activityData.map((activity) => (
                  <tr key={activity.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{activity.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{activity.details}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{activity.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{format(new Date(activity.date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{activity.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 text-right sm:px-6">
            <button className="btn btn-secondary">View All</button>
          </div>
        </div>

        {/* Performance Chart (Placeholder) */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Portfolio Performance</h3>
          </div>
          <div className="p-4">
            {/* Placeholder for chart */}
            <div className="text-center text-gray-500 dark:text-gray-400">[Chart Placeholder]</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder components - replace with actual implementations
const Portfolio: React.FC = () => <div>Portfolio Component</div>;
const Investments: React.FC = () => <div>Investments Component</div>;
const Investors: React.FC = () => <div>Investors Component</div>;
const Documents: React.FC = () => <div>Documents Component</div>;

const Settings: React.FC = () => {
  return (
    <div className="card-responsive p-8 flex flex-col items-center justify-center">
      <SettingsIcon className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
      Settings Component
    </div>
  );
};

const AddFund: React.FC = () => <div>Add Fund Component</div>;
const FundDetails: React.FC = () => <div>Fund Details Component</div>;
const EditFund: React.FC = () => <div>Edit Fund Component</div>;

export default App;
