import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format, parseISO } from 'date-fns';
import { 
  LayoutDashboard, Briefcase, Building, DollarSign, Plus, Edit, Trash2, 
  Search, Filter, ArrowUpDown, Sun, Moon, X, AlertCircle, CheckCircle, ChevronUp, ChevronDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
type FundStatus = 'Fundraising' | 'Investing' | 'Exiting' | 'Liquidated';
type InvestmentStatus = 'Active' | 'Exited';
type FundType = 'Buyout' | 'Venture Capital' | 'Growth' | 'Real Estate' | 'Debt' | 'Other';
type View = 'dashboard' | 'funds' | 'investments';
type SortDirection = 'asc' | 'desc';

interface Fund {
  id: string;
  name: string;
  type: FundType;
  size: number; // in millions
  vintageYear: number;
  status: FundStatus;
  createdAt: string; // ISO Date string
}

interface Investment {
  id: string;
  companyName: string;
  fundId: string; // Links to Fund
  investmentDate: string; // ISO Date string
  amountInvested: number; // in millions
  valuation: number; // in millions
  status: InvestmentStatus;
  createdAt: string; // ISO Date string
}

type FundFormData = Omit<Fund, 'id' | 'createdAt'>;
type InvestmentFormData = Omit<Investment, 'id' | 'createdAt'>;

interface SortConfig<T> {
  key: keyof T;
  direction: SortDirection;
}

// Constants
const FUND_STATUSES: FundStatus[] = ['Fundraising', 'Investing', 'Exiting', 'Liquidated'];
const INVESTMENT_STATUSES: InvestmentStatus[] = ['Active', 'Exited'];
const FUND_TYPES: FundType[] = ['Buyout', 'Venture Capital', 'Growth', 'Real Estate', 'Debt', 'Other'];
const LOCAL_STORAGE_KEYS = {
  FUNDS: 'pe_funds',
  INVESTMENTS: 'pe_investments',
  DARK_MODE: 'pe_darkMode',
};

// Utility Functions
const generateId = (): string => `_${Math.random().toString(36).substring(2, 11)}`;
const formatCurrency = (amount: number): string => `$${amount.toLocaleString()}M`;
const formatDate = (dateString: string): string => format(parseISO(dateString), 'MMM d, yyyy');

// Main App Component
const App: React.FC = () => {
  // --- State --- 
  const [funds, setFunds] = useState<Fund[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem(LOCAL_STORAGE_KEYS.DARK_MODE);
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // CRUD Modals State
  const [isFundModalOpen, setIsFundModalOpen] = useState<boolean>(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState<boolean>(false);
  const [editingFund, setEditingFund] = useState<Fund | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  // Search, Filter, Sort State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fundStatusFilter, setFundStatusFilter] = useState<FundStatus | ''>('');
  const [investmentStatusFilter, setInvestmentStatusFilter] = useState<InvestmentStatus | ''>('');
  const [fundSortConfig, setFundSortConfig] = useState<SortConfig<Fund> | null>({ key: 'createdAt', direction: 'desc'});
  const [investmentSortConfig, setInvestmentSortConfig] = useState<SortConfig<Investment> | null>({ key: 'createdAt', direction: 'desc'});

  // Loading/Error Simulation (though no real async ops here)
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Effects --- 

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedFunds = localStorage.getItem(LOCAL_STORAGE_KEYS.FUNDS);
      const storedInvestments = localStorage.getItem(LOCAL_STORAGE_KEYS.INVESTMENTS);
      if (storedFunds) setFunds(JSON.parse(storedFunds));
      if (storedInvestments) setInvestments(JSON.parse(storedInvestments));
    } catch (err) {
      console.error("Failed to load data from localStorage:", err);
      setError("Failed to load saved data. Please clear localStorage if the issue persists.");
    }
    // Simulate initial loading delay
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Save funds to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.FUNDS, JSON.stringify(funds));
    } catch (err) {
       console.error("Failed to save funds to localStorage:", err);
       setError("Failed to save fund data.");
    }
  }, [funds]);

  // Save investments to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.INVESTMENTS, JSON.stringify(investments));
    } catch (err) {
       console.error("Failed to save investments to localStorage:", err);
       setError("Failed to save investment data.");
    }
  }, [investments]);

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_KEYS.DARK_MODE, 'false');
    }
  }, [isDarkMode]);

  // --- Data Processing (Filtering & Sorting) --- 

  const filteredFunds = useMemo(() => {
    return funds
      .filter(fund => 
        fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(fund => 
        fundStatusFilter ? fund.status === fundStatusFilter : true
      );
  }, [funds, searchTerm, fundStatusFilter]);

  const sortedFunds = useMemo(() => {
    let sortableItems = [...filteredFunds];
    if (fundSortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[fundSortConfig.key];
        const bValue = b[fundSortConfig.key];
        
        if (aValue < bValue) {
          return fundSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return fundSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredFunds, fundSortConfig]);

  const filteredInvestments = useMemo(() => {
    const fundsMap = new Map(funds.map(f => [f.id, f.name]));
    return investments
      .filter(inv => 
        inv.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (fundsMap.get(inv.fundId) || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(inv => 
        investmentStatusFilter ? inv.status === investmentStatusFilter : true
      );
  }, [investments, funds, searchTerm, investmentStatusFilter]);

  const sortedInvestments = useMemo(() => {
    let sortableItems = [...filteredInvestments];
    if (investmentSortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[investmentSortConfig.key];
        const bValue = b[investmentSortConfig.key];
        if (aValue < bValue) {
          return investmentSortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return investmentSortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredInvestments, investmentSortConfig]);

  // --- Event Handlers --- 

  const handleSetView = (view: View) => {
    setCurrentView(view);
    setSearchTerm(''); // Reset search when changing views
    setFundStatusFilter('');
    setInvestmentStatusFilter('');
    setError(null); // Clear errors on view change
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const openFundModal = (fund: Fund | null = null) => {
    setEditingFund(fund);
    setIsFundModalOpen(true);
  };

  const closeFundModal = () => {
    setIsFundModalOpen(false);
    setEditingFund(null);
  };

  const openInvestmentModal = (investment: Investment | null = null) => {
    if (funds.length === 0) {
      setError("Please add a Fund before adding an Investment.");
      return;
    }
    setEditingInvestment(investment);
    setIsInvestmentModalOpen(true);
  };

  const closeInvestmentModal = () => {
    setIsInvestmentModalOpen(false);
    setEditingInvestment(null);
  };

  const handleFundSubmit: SubmitHandler<FundFormData> = (data) => {
    try {
      if (editingFund) {
        // Edit existing fund
        setFunds(funds.map(f => f.id === editingFund.id ? { ...editingFund, ...data } : f));
      } else {
        // Add new fund
        const newFund: Fund = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        setFunds([newFund, ...funds]);
      }
      closeFundModal();
    } catch (err) { 
      console.error("Error saving fund:", err);
      setError("Could not save the fund data.");
    }
  };

  const handleInvestmentSubmit: SubmitHandler<InvestmentFormData> = (data) => {
    try {
       if (editingInvestment) {
        // Edit existing investment
        setInvestments(investments.map(i => i.id === editingInvestment.id ? { ...editingInvestment, ...data } : i));
      } else {
        // Add new investment
        const newInvestment: Investment = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        setInvestments([newInvestment, ...investments]);
      }
      closeInvestmentModal();
    } catch (err) { 
      console.error("Error saving investment:", err);
      setError("Could not save the investment data.");
    }
  };

  const deleteFund = (id: string) => {
    if (window.confirm('Are you sure you want to delete this fund? This will also delete associated investments.')) {
      try {
        setFunds(funds.filter(f => f.id !== id));
        // Also delete associated investments
        setInvestments(investments.filter(i => i.fundId !== id));
      } catch (err) {
        console.error("Error deleting fund:", err);
        setError("Could not delete the fund.");
      }
    }
  };

  const deleteInvestment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
       try {
         setInvestments(investments.filter(i => i.id !== id));
       } catch (err) {
         console.error("Error deleting investment:", err);
         setError("Could not delete the investment.");
       }
    }
  };

  const requestSort = <T extends Fund | Investment>(key: keyof T, config: SortConfig<T> | null, setConfig: React.Dispatch<React.SetStateAction<SortConfig<T> | null>>) => {
    let direction: SortDirection = 'asc';
    if (config && config.key === key && config.direction === 'asc') {
      direction = 'desc';
    }
    setConfig({ key, direction });
  };

  const handleFundSort = (key: keyof Fund) => requestSort(key, fundSortConfig, setFundSortConfig);
  const handleInvestmentSort = (key: keyof Investment) => requestSort(key, investmentSortConfig, setInvestmentSortConfig);

  const getSortIcon = <T,>(key: keyof T, config: SortConfig<T> | null) => {
    if (!config || config.key !== key) {
      return <ArrowUpDown className="ml-1 h-3 w-3 text-gray-400" />;
    }
    return config.direction === 'asc' ? 
      <ChevronUp className="ml-1 h-3 w-3" /> : 
      <ChevronDown className="ml-1 h-3 w-3" />; 
  };

  // --- Render Helper Components --- 

  const ThemeToggle: React.FC = () => (
    <button 
      className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 bg-gray-200 dark:bg-gray-700"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDarkMode}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="sr-only">Toggle theme</span>
      <span 
        className={`${isDarkMode ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white dark:bg-gray-300 rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center`} 
      >
        {isDarkMode ? <Moon size={12} className="text-gray-700"/> : <Sun size={12} className="text-yellow-500"/>}
      </span>
    </button>
  );

  interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    change?: string;
    changeType?: 'increase' | 'decrease';
  }

  const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, change, changeType }) => (
    <div className="stat-card theme-transition-all">
      <div className="flex items-center justify-between">
        <div className="stat-title">{title}</div>
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </div>
      <div className="stat-value">{value}</div>
      {change && (
        <div className={`stat-desc ${changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {changeType === 'increase' ? '↗︎' : '↘︎'} {change}
        </div>
      )}
    </div>
  );

  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
  }

  const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-content theme-transition-all">
          <div className="modal-header">
            <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Close modal">
              <X size={20} />
            </button>
          </div>
          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // --- Forms --- 

  const FundForm: React.FC<{ onSubmit: SubmitHandler<FundFormData>; defaultValues?: FundFormData; onClose: () => void }> = 
    ({ onSubmit, defaultValues, onClose }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<FundFormData>({ defaultValues });

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label className="form-label" htmlFor="fund-name">Fund Name</label>
          <input id="fund-name" {...register('name', { required: 'Fund name is required' })} className="input" />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="fund-type">Fund Type</label>
            <select id="fund-type" {...register('type', { required: 'Fund type is required' })} className="input">
              {FUND_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            {errors.type && <p className="form-error">{errors.type.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="fund-status">Status</label>
            <select id="fund-status" {...register('status', { required: 'Status is required' })} className="input">
              {FUND_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
            </select>
            {errors.status && <p className="form-error">{errors.status.message}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="fund-size">Size (in Millions)</label>
            <input id="fund-size" type="number" {...register('size', { required: 'Size is required', valueAsNumber: true, min: { value: 0, message: 'Size must be positive' } })} className="input" />
            {errors.size && <p className="form-error">{errors.size.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="fund-vintageYear">Vintage Year</label>
            <input id="fund-vintageYear" type="number" {...register('vintageYear', { required: 'Vintage year is required', valueAsNumber: true, min: 1900, max: new Date().getFullYear() + 5 })} className="input" />
            {errors.vintageYear && <p className="form-error">{errors.vintageYear.message}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
          <button type="submit" className="btn btn-primary">{defaultValues ? 'Save Changes' : 'Add Fund'}</button>
        </div>
      </form>
    );
  };

  const InvestmentForm: React.FC<{ onSubmit: SubmitHandler<InvestmentFormData>; defaultValues?: InvestmentFormData; onClose: () => void; availableFunds: Fund[] }> = 
    ({ onSubmit, defaultValues, onClose, availableFunds }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<InvestmentFormData>({ defaultValues });

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="form-group">
          <label className="form-label" htmlFor="inv-companyName">Company Name</label>
          <input id="inv-companyName" {...register('companyName', { required: 'Company name is required' })} className="input" />
          {errors.companyName && <p className="form-error">{errors.companyName.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="inv-fundId">Fund</label>
              <select id="inv-fundId" {...register('fundId', { required: 'Fund is required' })} className="input">
                {availableFunds.map(fund => <option key={fund.id} value={fund.id}>{fund.name}</option>)}
              </select>
              {errors.fundId && <p className="form-error">{errors.fundId.message}</p>}
            </div>
            <div className="form-group">
                <label className="form-label" htmlFor="inv-status">Status</label>
                <select id="inv-status" {...register('status', { required: 'Status is required' })} className="input">
                {INVESTMENT_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                </select>
                {errors.status && <p className="form-error">{errors.status.message}</p>}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="inv-investmentDate">Investment Date</label>
            <input id="inv-investmentDate" type="date" {...register('investmentDate', { required: 'Investment date is required', valueAsDate: true })} className="input" />
            {errors.investmentDate && <p className="form-error">{errors.investmentDate.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="inv-amountInvested">Amount Invested (Millions)</label>
            <input id="inv-amountInvested" type="number" {...register('amountInvested', { required: 'Amount is required', valueAsNumber: true, min: { value: 0, message: 'Amount must be positive' } })} className="input" />
            {errors.amountInvested && <p className="form-error">{errors.amountInvested.message}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="inv-valuation">Valuation (Millions)</label>
            {errors.valuation && <p className="form-error">{errors.valuation.message}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">Cancel</button>
          <button type="submit" className="btn btn-primary">{defaultValues ? 'Save Changes' : 'Add Investment'}</button>
        </div>
      </form>
    );
  };

  // --- Views (Dashboard, Funds, Investments) --- 

  const DashboardView: React.FC = () => {
    const totalFundSize = funds.reduce((acc, fund) => acc + fund.size, 0);
    const totalInvested = investments.reduce((acc, inv) => acc + inv.amountInvested, 0);
    const totalValuation = investments.reduce((acc, inv) => acc + inv.valuation, 0);

    const activeFundsCount = funds.filter(fund => fund.status === 'Investing' || fund.status === 'Fundraising').length;
    const exitedInvestmentsCount = investments.filter(investment => investment.status === 'Exited').length;

    return (
      <div className="dashboard-view">
        <h2 className="view-title">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Fund Size" value={formatCurrency(totalFundSize)} icon={Briefcase} />
          <StatCard title="Total Invested" value={formatCurrency(totalInvested)} icon={DollarSign} />
          <StatCard title="Total Valuation" value={formatCurrency(totalValuation)} icon={Building} change={((totalValuation / totalInvested) - 1).toFixed(2) + '%'} changeType={totalValuation > totalInvested ? 'increase' : 'decrease'} />
          <StatCard title="Active Funds" value={activeFundsCount} icon={Briefcase} />
          <StatCard title="Exited Investments" value={exitedInvestmentsCount} icon={DollarSign} />
        </div>
        {investments.length > 0 ? (
          <>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Recent Investments</h3>
          <InvestmentTable investments={sortedInvestments.slice(0, 5)} onDelete={deleteInvestment} onEdit={openInvestmentModal} />
          </>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No investments yet. Add one!</p>
        )}
      </div>
    );
  };

  interface FundsViewProps {
    funds: Fund[];
    onAdd: () => void;
    onEdit: (fund: Fund) => void;
    onDelete: (id: string) => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    statusFilter: FundStatus | '';
    onStatusFilter: (status: FundStatus | '') => void;
    sortConfig: SortConfig<Fund> | null;
    onRequestSort: (key: keyof Fund) => void;
    getSortIcon: <T,>(key: keyof T, config: SortConfig<T> | null) => JSX.Element;
  }

  const FundsView: React.FC<FundsViewProps> = ({ 
    funds, onAdd, onEdit, onDelete, searchTerm, onSearch, 
    statusFilter, onStatusFilter, sortConfig, onRequestSort, getSortIcon 
  }) => (
    <div className="funds-view">
      <div className="flex items-center justify-between mb-4">
        <h2 className="view-title">Funds</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" /> Add Fund
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-4">
          <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input 
                  type="search" 
                  placeholder="Search funds..." 
                  className="input pl-10" 
                  value={searchTerm}
                  onChange={e => onSearch(e.target.value)}
              />
          </div>
          <div>
              <select 
                  className="input"
                  value={statusFilter}
                  onChange={e => onStatusFilter(e.target.value as FundStatus | '')}
              >
                  <option value="">All Statuses</option>
                  {FUND_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                  ))}
              </select>
          </div>
      </div>

      {funds.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => onRequestSort('name')} className="cursor-pointer">
                Name {getSortIcon('name', sortConfig)}
              </th>
              <th onClick={() => onRequestSort('type')} className="cursor-pointer">
                Type {getSortIcon('type', sortConfig)}
              </th>
              <th onClick={() => onRequestSort('size')} className="cursor-pointer text-right">
                Size {getSortIcon('size', sortConfig)}
              </th>
              <th onClick={() => onRequestSort('vintageYear')} className="cursor-pointer text-center">
                Vintage Year {getSortIcon('vintageYear', sortConfig)}
              </th>
              <th onClick={() => onRequestSort('status')} className="cursor-pointer text-center">
                Status {getSortIcon('status', sortConfig)}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {funds.map(fund => (
              <tr key={fund.id}>
                <td>{fund.name}</td>
                <td>{fund.type}</td>
                <td className="text-right">{formatCurrency(fund.size)}</td>
                <td className="text-center">{fund.vintageYear}</td>
                <td className="text-center">{fund.status}</td>
                <td className="text-right">
                  <button onClick={() => onEdit(fund)} className="table-action-btn" aria-label={`Edit ${fund.name}`}>
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(fund.id)} className="table-action-btn" aria-label={`Delete ${fund.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600 dark:text-gray-400">No funds yet. Add one!</p>
      )}
    </div>
  );

  interface InvestmentsViewProps {
    investments: Investment[];
    funds: Fund[];
    onAdd: () => void;
    onEdit: (investment: Investment) => void;
    onDelete: (id: string) => void;
    searchTerm: string;
    onSearch: (term: string) => void;
    statusFilter: InvestmentStatus | '';
    onStatusFilter: (status: InvestmentStatus | '') => void;
     sortConfig: SortConfig<Investment> | null;
    onRequestSort: (key: keyof Investment) => void;
     getSortIcon: <T,>(key: keyof T, config: SortConfig<T> | null) => JSX.Element;
  }

  const InvestmentsView: React.FC<InvestmentsViewProps> = ({ 
    investments, funds, onAdd, onEdit, onDelete, searchTerm, onSearch,
    statusFilter, onStatusFilter, sortConfig, onRequestSort, getSortIcon
  }) => {
    const fundsMap = useMemo(() => new Map(funds.map(f => [f.id, f.name])), [funds]);

    return (
      <div className="investments-view">
        <div className="flex items-center justify-between mb-4">
          <h2 className="view-title">Investments</h2>
          <button onClick={onAdd} className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" /> Add Investment
          </button>
        </div>

         <div className="flex items-center space-x-4 mb-4">
            <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input 
                    type="search" 
                    placeholder="Search investments..." 
                    className="input pl-10" 
                    value={searchTerm}
                    onChange={e => onSearch(e.target.value)}
                />
            </div>
            <div>
                <select 
                    className="input"
                    value={statusFilter}
                    onChange={e => onStatusFilter(e.target.value as InvestmentStatus | '')}
                >
                    <option value="">All Statuses</option>
                    {INVESTMENT_STATUSES.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>
        </div>

        {investments.length > 0 ? (
          <InvestmentTable 
            investments={investments} 
            fundsMap={fundsMap}
            onDelete={onDelete}
            onEdit={onEdit}
            sortConfig={sortConfig}
            onRequestSort={onRequestSort}
            getSortIcon={getSortIcon}
          />
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No investments yet. Add one!</p>
        )}
      </div>
    );
  };

  interface InvestmentTableProps {
    investments: Investment[];
    fundsMap?: Map<string, string>; // Optional, allows standalone usage in DashboardView
    onDelete: (id: string) => void;
    onEdit: (investment: Investment) => void;
    sortConfig?: SortConfig<Investment> | null;
    onRequestSort?: (key: keyof Investment) => void;
    getSortIcon?: <T,>(key: keyof T, config: SortConfig<T> | null) => JSX.Element;
  }

  const InvestmentTable: React.FC<InvestmentTableProps> = ({ investments, fundsMap, onDelete, onEdit, sortConfig, onRequestSort, getSortIcon }) => (
    <table className="table">
      <thead>
        <tr>
          <th onClick={onRequestSort ? () => onRequestSort('companyName') : undefined} className={onRequestSort ? "cursor-pointer" : ""}>
            Company {getSortIcon ? getSortIcon('companyName', sortConfig) : null}
          </th>
          <th>Fund</th>
          <th onClick={onRequestSort ? () => onRequestSort('investmentDate') : undefined} className={`text-center ${onRequestSort ? "cursor-pointer" : ""}`}>
            Date {getSortIcon ? getSortIcon('investmentDate', sortConfig) : null}
          </th>
          <th onClick={onRequestSort ? () => onRequestSort('amountInvested') : undefined} className={`text-right ${onRequestSort ? "cursor-pointer" : ""}`}>
            Invested {getSortIcon ? getSortIcon('amountInvested', sortConfig) : null}
          </th>
          <th onClick={onRequestSort ? () => onRequestSort('valuation') : undefined} className={`text-right ${onRequestSort ? "cursor-pointer" : ""}`}>
            Valuation {getSortIcon ? getSortIcon('valuation', sortConfig) : null}
          </th>
          <th onClick={onRequestSort ? () => onRequestSort('status') : undefined} className={`text-center ${onRequestSort ? "cursor-pointer" : ""}`}>
            Status {getSortIcon ? getSortIcon('status', sortConfig) : null}
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {investments.map(investment => (
          <tr key={investment.id}>
            <td>{investment.companyName}</td>
            <td>{fundsMap ? fundsMap.get(investment.fundId) : investment.fundId}</td>
            <td className="text-center">{formatDate(investment.investmentDate)}</td>
            <td className="text-right">{formatCurrency(investment.amountInvested)}</td>
            <td className="text-right">{formatCurrency(investment.valuation)}</td>
            <td className="text-center">{investment.status}</td>
            <td className="text-right">
              <button onClick={() => onEdit(investment)} className="table-action-btn" aria-label={`Edit ${investment.companyName}`}>
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => onDelete(investment.id)} className="table-action-btn" aria-label={`Delete ${investment.companyName}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  // --- Main Render --- 

  return (
    <div className={`${styles.app} ${isDarkMode ? styles.darkMode : ''} min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all`}>
      <div className="app-container">
        <header className="app-header">
          <h1 className="text-2xl font-bold">PE Manager</h1>
          <ThemeToggle />
        </header>

        <nav className="app-nav">
          <ul>
            <li className={currentView === 'dashboard' ? 'active' : ''}>
              <button onClick={() => handleSetView('dashboard')} aria-label="Go to Dashboard">
                <LayoutDashboard className="h-5 w-5 mr-2" /> Dashboard
              </button>
            </li>
            <li className={currentView === 'funds' ? 'active' : ''}>
              <button onClick={() => handleSetView('funds')} aria-label="Go to Funds">
                <Briefcase className="h-5 w-5 mr-2" /> Funds
              </button>
            </li>
            <li className={currentView === 'investments' ? 'active' : ''}>
              <button onClick={() => handleSetView('investments')} aria-label="Go to Investments">
                <DollarSign className="h-5 w-5 mr-2" /> Investments
              </button>
            </li>
          </ul>
        </nav>

        <main className="app-main">
          {isLoading ? (
            <div className="loading-state">Loading...</div>
          ) : error ? (
            <div className="error-state">
              <AlertCircle className="h-6 w-6 mr-2 text-red-500 inline-block align-middle" />
              {error}
            </div>
          ) : (
            <>
              {currentView === 'dashboard' && <DashboardView />}
              {currentView === 'funds' && (
                <FundsView
                  funds={sortedFunds}
                  onAdd={openFundModal}
                  onEdit={openFundModal}
                  onDelete={deleteFund}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  statusFilter={fundStatusFilter}
                  onStatusFilter={setFundStatusFilter}
                  sortConfig={fundSortConfig}
                  onRequestSort={handleFundSort}
                  getSortIcon={getSortIcon}
                />
              )}
              {currentView === 'investments' && (
                <InvestmentsView
                  investments={sortedInvestments}
                  funds={funds}
                  onAdd={openInvestmentModal}
                  onEdit={openInvestmentModal}
                  onDelete={deleteInvestment}
                  searchTerm={searchTerm}
                  onSearch={setSearchTerm}
                  statusFilter={investmentStatusFilter}
                  onStatusFilter={setInvestmentStatusFilter}
                  sortConfig={investmentSortConfig}
                  onRequestSort={handleInvestmentSort}
                  getSortIcon={getSortIcon}
                />
              )}
            </>
          )}
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.</p>
        </footer>

        <Modal isOpen={isFundModalOpen} onClose={closeFundModal} title={editingFund ? 'Edit Fund' : 'Add Fund'}>
          <FundForm 
            onSubmit={handleFundSubmit} 
            defaultValues={editingFund || undefined} 
            onClose={closeFundModal} 
          />
        </Modal>

        <Modal isOpen={isInvestmentModalOpen} onClose={closeInvestmentModal} title={editingInvestment ? 'Edit Investment' : 'Add Investment'}>
          <InvestmentForm 
            onSubmit={handleInvestmentSubmit} 
            defaultValues={editingInvestment || undefined} 
            onClose={closeInvestmentModal} 
            availableFunds={funds} 
          />
        </Modal>
      </div>
    </div>
  );
};

export default App;
