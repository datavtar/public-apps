import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, DollarSign, TrendingUp, TrendingDown, BarChart3, FileText, 
  Settings, PieChart, Calculator, Building, Users, Calendar,
  Plus, Edit, Trash2, Download, Upload, Search, Filter,
  Eye, AlertTriangle, CheckCircle, Clock, Target,
  Briefcase, CreditCard, Receipt, Globe, Sun, Moon,
  ChartLine, Database, Shield, Key, LogOut
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart as RechartsChart, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Types and Interfaces
interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  initialInvestment: number;
  currentValue: number;
  ownership: number;
  status: 'Active' | 'Exited' | 'Under Review';
  ebitda: number;
  revenue: number;
  lastUpdated: string;
}

interface Deal {
  id: string;
  companyName: string;
  sector: string;
  dealSize: number;
  stage: 'Sourcing' | 'Due Diligence' | 'Investment Committee' | 'Closed' | 'Passed';
  probability: number;
  expectedClose: string;
  leadPartner: string;
  notes: string;
}

interface CashFlow {
  id: string;
  date: string;
  type: 'Capital Call' | 'Distribution' | 'Management Fee' | 'Other';
  amount: number;
  description: string;
  fundId: string;
}

interface InvestorUpdate {
  id: string;
  quarter: string;
  year: number;
  totalValue: number;
  netIRR: number;
  cashFlows: number;
  portfolioHighlights: string;
  marketOutlook: string;
  createdDate: string;
}

interface Fund {
  id: string;
  name: string;
  vintage: number;
  size: number;
  committed: number;
  called: number;
  distributed: number;
  nav: number;
  irr: number;
  multiple: number;
}

// Hook for dark mode
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

function App() {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Navigation state
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data states
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [cashFlows, setCashFlows] = useState<CashFlow[]>([]);
  const [investorUpdates, setInvestorUpdates] = useState<InvestorUpdate[]>([]);
  const [funds, setFunds] = useState<Fund[]>([]);

  // UI states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // AI states
  const [promptText, setPromptText] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState<any>({});

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedPortfolio = localStorage.getItem('pe-portfolio');
    const savedDeals = localStorage.getItem('pe-deals');
    const savedCashFlows = localStorage.getItem('pe-cashflows');
    const savedUpdates = localStorage.getItem('pe-updates');
    const savedFunds = localStorage.getItem('pe-funds');

    if (savedPortfolio) setPortfolioCompanies(JSON.parse(savedPortfolio));
    if (savedDeals) setDeals(JSON.parse(savedDeals));
    if (savedCashFlows) setCashFlows(JSON.parse(savedCashFlows));
    if (savedUpdates) setInvestorUpdates(JSON.parse(savedUpdates));
    if (savedFunds) setFunds(JSON.parse(savedFunds));

    // Initialize with sample data if empty
    if (!savedPortfolio) initializeSampleData();
  };

  const initializeSampleData = () => {
    const samplePortfolio: PortfolioCompany[] = [
      {
        id: '1',
        name: 'TechCorp Solutions',
        sector: 'Technology',
        investmentDate: '2023-03-15',
        initialInvestment: 25000000,
        currentValue: 32000000,
        ownership: 45,
        status: 'Active',
        ebitda: 8500000,
        revenue: 45000000,
        lastUpdated: '2025-06-01'
      },
      {
        id: '2',
        name: 'HealthTech Innovations',
        sector: 'Healthcare',
        investmentDate: '2022-09-20',
        initialInvestment: 15000000,
        currentValue: 22000000,
        ownership: 35,
        status: 'Active',
        ebitda: 5200000,
        revenue: 28000000,
        lastUpdated: '2025-05-28'
      },
      {
        id: '3',
        name: 'GreenEnergy Ltd',
        sector: 'Energy',
        investmentDate: '2021-06-10',
        initialInvestment: 40000000,
        currentValue: 58000000,
        ownership: 60,
        status: 'Active',
        ebitda: 12000000,
        revenue: 65000000,
        lastUpdated: '2025-06-05'
      }
    ];

    const sampleDeals: Deal[] = [
      {
        id: '1',
        companyName: 'FinTech Startup',
        sector: 'Financial Services',
        dealSize: 20000000,
        stage: 'Due Diligence',
        probability: 75,
        expectedClose: '2025-08-15',
        leadPartner: 'John Smith',
        notes: 'Strong management team, growing market'
      },
      {
        id: '2',
        companyName: 'Manufacturing Co',
        sector: 'Manufacturing',
        dealSize: 35000000,
        stage: 'Investment Committee',
        probability: 60,
        expectedClose: '2025-09-30',
        leadPartner: 'Sarah Johnson',
        notes: 'Operational improvements needed'
      }
    ];

    const sampleFunds: Fund[] = [
      {
        id: '1',
        name: 'UK Growth Fund III',
        vintage: 2022,
        size: 500000000,
        committed: 450000000,
        called: 280000000,
        distributed: 125000000,
        nav: 320000000,
        irr: 18.5,
        multiple: 1.6
      }
    ];

    setPortfolioCompanies(samplePortfolio);
    setDeals(sampleDeals);
    setFunds(sampleFunds);
    
    localStorage.setItem('pe-portfolio', JSON.stringify(samplePortfolio));
    localStorage.setItem('pe-deals', JSON.stringify(sampleDeals));
    localStorage.setItem('pe-funds', JSON.stringify(sampleFunds));
  };

  // Save data to localStorage
  const saveData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // AI Integration
  const handleAIAnalysis = () => {
    if (!promptText.trim() && !selectedFile) {
      setAiError("Please provide input or select a file to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const contextPrompt = selectedFile 
      ? `Analyze this financial document and extract key metrics. Return JSON with keys: "companyName", "revenue", "ebitda", "sector", "keyInsights", "recommendations". ${promptText}`
      : promptText;

    aiLayerRef.current?.sendToAI(contextPrompt, selectedFile || undefined);
  };

  const handleAIResult = (result: string) => {
    setAiResult(result);
    
    // Try to parse JSON for auto-population
    try {
      const parsed = JSON.parse(result);
      if (parsed.companyName && activeTab === 'portfolio') {
        setFormData(prev => ({
          ...prev,
          name: parsed.companyName || '',
          revenue: parsed.revenue || 0,
          ebitda: parsed.ebitda || 0,
          sector: parsed.sector || '',
          keyInsights: parsed.keyInsights || '',
          recommendations: parsed.recommendations || ''
        }));
      }
    } catch {
      // If not JSON, treat as markdown text
    }
  };

  // CRUD Operations
  const addPortfolioCompany = (data: Omit<PortfolioCompany, 'id'>) => {
    const newCompany: PortfolioCompany = {
      ...data,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    const updated = [...portfolioCompanies, newCompany];
    setPortfolioCompanies(updated);
    saveData('pe-portfolio', updated);
  };

  const updatePortfolioCompany = (id: string, data: Partial<PortfolioCompany>) => {
    const updated = portfolioCompanies.map(company => 
      company.id === id ? { ...company, ...data, lastUpdated: new Date().toISOString().split('T')[0] } : company
    );
    setPortfolioCompanies(updated);
    saveData('pe-portfolio', updated);
  };

  const deletePortfolioCompany = (id: string) => {
    const updated = portfolioCompanies.filter(company => company.id !== id);
    setPortfolioCompanies(updated);
    saveData('pe-portfolio', updated);
  };

  const addDeal = (data: Omit<Deal, 'id'>) => {
    const newDeal: Deal = { ...data, id: Date.now().toString() };
    const updated = [...deals, newDeal];
    setDeals(updated);
    saveData('pe-deals', updated);
  };

  const updateDeal = (id: string, data: Partial<Deal>) => {
    const updated = deals.map(deal => deal.id === id ? { ...deal, ...data } : deal);
    setDeals(updated);
    saveData('pe-deals', updated);
  };

  const deleteDeal = (id: string) => {
    const updated = deals.filter(deal => deal.id !== id);
    setDeals(updated);
    saveData('pe-deals', updated);
  };

  // Data Processing Functions
  const calculateTotalPortfolioValue = () => {
    return portfolioCompanies.reduce((sum, company) => sum + company.currentValue, 0);
  };

  const calculateTotalInvestment = () => {
    return portfolioCompanies.reduce((sum, company) => sum + company.initialInvestment, 0);
  };

  const calculatePortfolioReturn = () => {
    const totalValue = calculateTotalPortfolioValue();
    const totalInvestment = calculateTotalInvestment();
    return totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;
  };

  // Chart Data
  const portfolioPerformanceData = portfolioCompanies.map(company => ({
    name: company.name,
    investment: company.initialInvestment / 1000000,
    currentValue: company.currentValue / 1000000,
    return: ((company.currentValue - company.initialInvestment) / company.initialInvestment) * 100
  }));

  const sectorAllocationData = portfolioCompanies.reduce((acc, company) => {
    const sector = acc.find(item => item.name === company.sector);
    if (sector) {
      sector.value += company.currentValue;
    } else {
      acc.push({ name: company.sector, value: company.currentValue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const dealPipelineData = deals.reduce((acc, deal) => {
    const stage = acc.find(item => item.name === deal.stage);
    if (stage) {
      stage.value += deal.dealSize;
      stage.count += 1;
    } else {
      acc.push({ name: deal.stage, value: deal.dealSize, count: 1 });
    }
    return acc;
  }, [] as { name: string; value: number; count: number }[]);

  const monthlyPerformanceData = [
    { month: 'Jan', portfolio: 95, benchmark: 92 },
    { month: 'Feb', portfolio: 98, benchmark: 94 },
    { month: 'Mar', portfolio: 102, benchmark: 97 },
    { month: 'Apr', portfolio: 105, benchmark: 99 },
    { month: 'May', portfolio: 108, benchmark: 101 },
    { month: 'Jun', portfolio: 112, benchmark: 103 }
  ];

  // Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Modal Component
  const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    );
  };

  // Form Components
  const PortfolioForm = () => {
    const [localData, setLocalData] = useState({
      name: editingItem?.name || '',
      sector: editingItem?.sector || '',
      investmentDate: editingItem?.investmentDate || '',
      initialInvestment: editingItem?.initialInvestment || 0,
      currentValue: editingItem?.currentValue || 0,
      ownership: editingItem?.ownership || 0,
      status: editingItem?.status || 'Active',
      ebitda: editingItem?.ebitda || 0,
      revenue: editingItem?.revenue || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingItem) {
        updatePortfolioCompany(editingItem.id, localData);
      } else {
        addPortfolioCompany(localData);
      }
      setShowAddModal(false);
      setEditingItem(null);
      setLocalData({
        name: '',
        sector: '',
        investmentDate: '',
        initialInvestment: 0,
        currentValue: 0,
        ownership: 0,
        status: 'Active',
        ebitda: 0,
        revenue: 0
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <input
            type="text"
            className="input"
            value={localData.name}
            onChange={(e) => setLocalData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Sector</label>
            <select
              className="select"
              value={localData.sector}
              onChange={(e) => setLocalData(prev => ({ ...prev, sector: e.target.value }))}
              required
            >
              <option value="">Select Sector</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Energy">Energy</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Consumer">Consumer</option>
              <option value="Real Estate">Real Estate</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Investment Date</label>
            <input
              type="date"
              className="input"
              value={localData.investmentDate}
              onChange={(e) => setLocalData(prev => ({ ...prev, investmentDate: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Initial Investment (£)</label>
            <input
              type="number"
              className="input"
              value={localData.initialInvestment}
              onChange={(e) => setLocalData(prev => ({ ...prev, initialInvestment: Number(e.target.value) }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Current Value (£)</label>
            <input
              type="number"
              className="input"
              value={localData.currentValue}
              onChange={(e) => setLocalData(prev => ({ ...prev, currentValue: Number(e.target.value) }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="form-group">
            <label className="form-label">Ownership (%)</label>
            <input
              type="number"
              className="input"
              min="0"
              max="100"
              value={localData.ownership}
              onChange={(e) => setLocalData(prev => ({ ...prev, ownership: Number(e.target.value) }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">EBITDA (£)</label>
            <input
              type="number"
              className="input"
              value={localData.ebitda}
              onChange={(e) => setLocalData(prev => ({ ...prev, ebitda: Number(e.target.value) }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Revenue (£)</label>
            <input
              type="number"
              className="input"
              value={localData.revenue}
              onChange={(e) => setLocalData(prev => ({ ...prev, revenue: Number(e.target.value) }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="select"
            value={localData.status}
            onChange={(e) => setLocalData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Exited' | 'Under Review' }))}
          >
            <option value="Active">Active</option>
            <option value="Exited">Exited</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editingItem ? 'Update' : 'Add'} Company
          </button>
        </div>
      </form>
    );
  };

  const DealForm = () => {
    const [localData, setLocalData] = useState({
      companyName: editingItem?.companyName || '',
      sector: editingItem?.sector || '',
      dealSize: editingItem?.dealSize || 0,
      stage: editingItem?.stage || 'Sourcing',
      probability: editingItem?.probability || 0,
      expectedClose: editingItem?.expectedClose || '',
      leadPartner: editingItem?.leadPartner || '',
      notes: editingItem?.notes || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingItem) {
        updateDeal(editingItem.id, localData);
      } else {
        addDeal(localData);
      }
      setShowAddModal(false);
      setEditingItem(null);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              className="input"
              value={localData.companyName}
              onChange={(e) => setLocalData(prev => ({ ...prev, companyName: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Sector</label>
            <select
              className="select"
              value={localData.sector}
              onChange={(e) => setLocalData(prev => ({ ...prev, sector: e.target.value }))}
              required
            >
              <option value="">Select Sector</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Energy">Energy</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Consumer">Consumer</option>
              <option value="Real Estate">Real Estate</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Deal Size (£)</label>
            <input
              type="number"
              className="input"
              value={localData.dealSize}
              onChange={(e) => setLocalData(prev => ({ ...prev, dealSize: Number(e.target.value) }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Stage</label>
            <select
              className="select"
              value={localData.stage}
              onChange={(e) => setLocalData(prev => ({ ...prev, stage: e.target.value as Deal['stage'] }))}
            >
              <option value="Sourcing">Sourcing</option>
              <option value="Due Diligence">Due Diligence</option>
              <option value="Investment Committee">Investment Committee</option>
              <option value="Closed">Closed</option>
              <option value="Passed">Passed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Probability (%)</label>
            <input
              type="number"
              className="input"
              min="0"
              max="100"
              value={localData.probability}
              onChange={(e) => setLocalData(prev => ({ ...prev, probability: Number(e.target.value) }))}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Expected Close</label>
            <input
              type="date"
              className="input"
              value={localData.expectedClose}
              onChange={(e) => setLocalData(prev => ({ ...prev, expectedClose: e.target.value }))}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Lead Partner</label>
          <input
            type="text"
            className="input"
            value={localData.leadPartner}
            onChange={(e) => setLocalData(prev => ({ ...prev, leadPartner: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="textarea"
            rows={3}
            value={localData.notes}
            onChange={(e) => setLocalData(prev => ({ ...prev, notes: e.target.value }))}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddModal(false)}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editingItem ? 'Update' : 'Add'} Deal
          </button>
        </div>
      </form>
    );
  };

  // Filtered data
  const filteredPortfolio = portfolioCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !filterSector || company.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = !filterSector || deal.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'Active': return 'badge-success';
        case 'Exited': return 'badge-gray';
        case 'Under Review': return 'badge-warning';
        case 'Closed': return 'badge-success';
        case 'Passed': return 'badge-error';
        default: return 'badge-primary';
      }
    };

    return <span className={`badge ${getStatusColor(status)}`}>{status}</span>;
  };

  if (!currentUser) {
    return (
      <div className="flex-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* AILayer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={handleAIResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="navbar bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-3">
          <Briefcase className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">PE CFO Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, {currentUser.first_name} {currentUser.last_name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'portfolio', label: 'Portfolio', icon: Building },
              { id: 'deals', label: 'Deal Pipeline', icon: Target },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: ChartLine },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab ${activeTab === tab.id ? 'tab-active' : ''} flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div id="generation_issue_fallback" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Portfolio Value</div>
                <div className="stat-value">£{(calculateTotalPortfolioValue() / 1000000).toFixed(1)}M</div>
                <div className="stat-change stat-increase">
                  <TrendingUp className="h-4 w-4" />
                  +{calculatePortfolioReturn().toFixed(1)}%
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Active Companies</div>
                <div className="stat-value">{portfolioCompanies.filter(c => c.status === 'Active').length}</div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Building className="h-4 w-4" />
                  Portfolio companies
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Pipeline Value</div>
                <div className="stat-value">£{(deals.reduce((sum, deal) => sum + deal.dealSize, 0) / 1000000).toFixed(1)}M</div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Target className="h-4 w-4" />
                  {deals.length} deals
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Fund IRR</div>
                <div className="stat-value">{funds[0]?.irr?.toFixed(1) || '0.0'}%</div>
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Calculator className="h-4 w-4" />
                  Multiple: {funds[0]?.multiple?.toFixed(1) || '0.0'}x
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Portfolio Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={portfolioPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="investment" fill="#3b82f6" name="Investment (£M)" />
                    <Bar dataKey="currentValue" fill="#10b981" name="Current Value (£M)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Sector Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsChart>
                    <Tooltip />
                    {sectorAllocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                    ))}
                  </RechartsChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="card-header">
                <h3 className="heading-5">Recent Activity</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  {portfolioCompanies.slice(0, 5).map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Updated {company.lastUpdated}</p>
                        </div>
                      </div>
                      <StatusBadge status={company.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="heading-4">Portfolio Companies</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your portfolio investments</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Company
                </button>
                <button
                  onClick={() => exportToCSV(portfolioCompanies, 'portfolio-companies')}
                  className="btn btn-secondary"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* AI Analysis Section */}
            <div className="card">
              <div className="card-header">
                <h3 className="heading-6">AI Document Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Upload financial documents to extract key metrics automatically
                </p>
              </div>
              <div className="card-body space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Analysis Prompt (Optional)</label>
                    <textarea
                      className="textarea"
                      placeholder="Additional context for analysis..."
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Upload Document</label>
                    <input
                      type="file"
                      className="input"
                      accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleAIAnalysis}
                    disabled={isAiLoading || (!promptText.trim() && !selectedFile)}
                    className="btn btn-primary"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4" />
                        Analyze Document
                      </>
                    )}
                  </button>
                </div>

                {aiResult && (
                  <div className="alert alert-success">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Analysis Complete</p>
                      <div className="mt-2 text-sm whitespace-pre-wrap">{aiResult}</div>
                    </div>
                  </div>
                )}

                {aiError && (
                  <div className="alert alert-error">
                    <AlertTriangle className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Analysis Failed</p>
                      <p className="text-sm">{String(aiError)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <select
                className="select w-full sm:w-48"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
              >
                <option value="">All Sectors</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Energy">Energy</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Consumer">Consumer</option>
                <option value="Real Estate">Real Estate</option>
              </select>
            </div>

            {/* Portfolio Table */}
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Company</th>
                    <th className="table-header-cell">Sector</th>
                    <th className="table-header-cell">Investment</th>
                    <th className="table-header-cell">Current Value</th>
                    <th className="table-header-cell">Return</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredPortfolio.map((company) => {
                    const returnPct = ((company.currentValue - company.initialInvestment) / company.initialInvestment) * 100;
                    return (
                      <tr key={company.id} className="table-row">
                        <td className="table-cell">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{company.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{company.ownership}% ownership</p>
                          </div>
                        </td>
                        <td className="table-cell">{company.sector}</td>
                        <td className="table-cell">£{(company.initialInvestment / 1000000).toFixed(1)}M</td>
                        <td className="table-cell">£{(company.currentValue / 1000000).toFixed(1)}M</td>
                        <td className="table-cell">
                          <span className={`font-medium ${returnPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="table-cell">
                          <StatusBadge status={company.status} />
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(company);
                                setShowAddModal(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deletePortfolioCompany(company.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="heading-4">Deal Pipeline</h2>
                <p className="text-gray-600 dark:text-gray-400">Track potential investments</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowAddModal(true);
                  }}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Deal
                </button>
                <button
                  onClick={() => exportToCSV(deals, 'deal-pipeline')}
                  className="btn btn-secondary"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>

            {/* Pipeline Overview */}
            <div className="card card-padding">
              <h3 className="heading-5 mb-4">Pipeline by Stage</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dealPipelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" name="Deal Value (£)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Deals Table */}
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Company</th>
                    <th className="table-header-cell">Sector</th>
                    <th className="table-header-cell">Deal Size</th>
                    <th className="table-header-cell">Stage</th>
                    <th className="table-header-cell">Probability</th>
                    <th className="table-header-cell">Expected Close</th>
                    <th className="table-header-cell">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredDeals.map((deal) => (
                    <tr key={deal.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{deal.companyName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{deal.leadPartner}</p>
                        </div>
                      </td>
                      <td className="table-cell">{deal.sector}</td>
                      <td className="table-cell">£{(deal.dealSize / 1000000).toFixed(1)}M</td>
                      <td className="table-cell">
                        <StatusBadge status={deal.stage} />
                      </td>
                      <td className="table-cell">{deal.probability}%</td>
                      <td className="table-cell">{deal.expectedClose}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingItem(deal);
                              setShowAddModal(true);
                            }}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteDeal(deal.id)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
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
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="heading-4">Reports & Analytics</h2>
                <p className="text-gray-600 dark:text-gray-400">Generate comprehensive reports</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="card card-padding hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="heading-6">Portfolio Report</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive portfolio overview</p>
                  </div>
                </div>
                <button
                  onClick={() => exportToCSV(portfolioCompanies, 'portfolio-report')}
                  className="btn btn-primary btn-sm w-full"
                >
                  <Download className="h-4 w-4" />
                  Generate Report
                </button>
              </div>

              <div className="card card-padding hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="heading-6">Performance Report</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fund and portfolio performance</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const performanceData = portfolioCompanies.map(company => ({
                      company: company.name,
                      sector: company.sector,
                      investment: company.initialInvestment,
                      currentValue: company.currentValue,
                      return: ((company.currentValue - company.initialInvestment) / company.initialInvestment * 100).toFixed(2) + '%',
                      irr: '15.5%', // Mock IRR
                      multiple: (company.currentValue / company.initialInvestment).toFixed(2) + 'x'
                    }));
                    exportToCSV(performanceData, 'performance-report');
                  }}
                  className="btn btn-primary btn-sm w-full"
                >
                  <Download className="h-4 w-4" />
                  Generate Report
                </button>
              </div>

              <div className="card card-padding hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-3">
                  <Target className="h-8 w-8 text-purple-600" />
                  <div>
                    <h3 className="heading-6">Pipeline Report</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Deal pipeline analysis</p>
                  </div>
                </div>
                <button
                  onClick={() => exportToCSV(deals, 'pipeline-report')}
                  className="btn btn-primary btn-sm w-full"
                >
                  <Download className="h-4 w-4" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Report Templates */}
            <div className="card">
              <div className="card-header">
                <h3 className="heading-5">Report Templates</h3>
              </div>
              <div className="card-body">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Quarterly LP Report</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comprehensive quarterly update for limited partners</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      <Download className="h-4 w-4" />
                      Download Template
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Investment Committee Memo</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Template for IC investment recommendations</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      <Download className="h-4 w-4" />
                      Download Template
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">Portfolio Company Review</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Monthly/quarterly portfolio company assessment</p>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      <Download className="h-4 w-4" />
                      Download Template
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="heading-4">Advanced Analytics</h2>
              <p className="text-gray-600 dark:text-gray-400">Deep dive into fund and portfolio performance</p>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Fund Performance vs Benchmark</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="portfolio" stroke="#3b82f6" name="Portfolio" strokeWidth={2} />
                    <Line type="monotone" dataKey="benchmark" stroke="#6b7280" name="Benchmark" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="card card-padding">
                <h3 className="heading-5 mb-4">Portfolio Risk Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Beta</span>
                    <span className="font-semibold">1.15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sharpe Ratio</span>
                    <span className="font-semibold">1.42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Max Drawdown</span>
                    <span className="font-semibold text-red-600">-8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Volatility</span>
                    <span className="font-semibold">12.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Information Ratio</span>
                    <span className="font-semibold">0.85</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="card card-padding">
                <h4 className="heading-6 mb-3">Top Performers</h4>
                <div className="space-y-3">
                  {portfolioCompanies
                    .sort((a, b) => ((b.currentValue - b.initialInvestment) / b.initialInvestment) - ((a.currentValue - a.initialInvestment) / a.initialInvestment))
                    .slice(0, 3)
                    .map((company) => (
                      <div key={company.id} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{company.name}</span>
                        <span className="text-sm text-green-600 font-semibold">
                          +{(((company.currentValue - company.initialInvestment) / company.initialInvestment) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="card card-padding">
                <h4 className="heading-6 mb-3">Sector Concentration</h4>
                <div className="space-y-2">
                  {sectorAllocationData.map((sector, index) => {
                    const percentage = (sector.value / calculateTotalPortfolioValue()) * 100;
                    return (
                      <div key={sector.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{sector.name}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card card-padding">
                <h4 className="heading-6 mb-3">Deal Flow Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Deals Reviewed (YTD)</span>
                    <span className="font-semibold">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Deal Size</span>
                    <span className="font-semibold">£{(deals.reduce((sum, deal) => sum + deal.dealSize, 0) / deals.length / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Conversion Rate</span>
                    <span className="font-semibold">8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Due Diligence Time</span>
                    <span className="font-semibold">45 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="heading-4">Settings & Configuration</h2>
              <p className="text-gray-600 dark:text-gray-400">Manage your dashboard preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5">General Settings</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select className="select">
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Date Format</label>
                    <select className="select">
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Default Report Period</label>
                    <select className="select">
                      <option value="quarterly">Quarterly</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Use dark theme</p>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`toggle ${isDark ? 'toggle-checked' : ''}`}
                    >
                      <span className="toggle-thumb" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card">
                <div className="card-header">
                  <h3 className="heading-5">Data Management</h3>
                </div>
                <div className="card-body space-y-4">
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        const allData = {
                          portfolio: portfolioCompanies,
                          deals: deals,
                          cashFlows: cashFlows,
                          funds: funds,
                          investorUpdates: investorUpdates
                        };
                        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = 'pe-dashboard-backup.json';
                        link.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="btn btn-secondary w-full"
                    >
                      <Download className="h-4 w-4" />
                      Download Full Backup
                    </button>
                    
                    <div className="form-group">
                      <label className="form-label">Import Data</label>
                      <input
                        type="file"
                        className="input"
                        accept=".json,.csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file && file.type === 'application/json') {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              try {
                                const data = JSON.parse(event.target?.result as string);
                                if (data.portfolio) setPortfolioCompanies(data.portfolio);
                                if (data.deals) setDeals(data.deals);
                                if (data.cashFlows) setCashFlows(data.cashFlows);
                                if (data.funds) setFunds(data.funds);
                                alert('Data imported successfully!');
                              } catch (error) {
                                alert('Error importing data. Please check file format.');
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </div>
                    
                    <button
                      onClick={() => {
                        const confirmDelete = window.confirm('Are you sure you want to delete all data? This action cannot be undone.');
                        if (confirmDelete) {
                          localStorage.removeItem('pe-portfolio');
                          localStorage.removeItem('pe-deals');
                          localStorage.removeItem('pe-cashflows');
                          localStorage.removeItem('pe-funds');
                          localStorage.removeItem('pe-updates');
                          setPortfolioCompanies([]);
                          setDeals([]);
                          setCashFlows([]);
                          setFunds([]);
                          setInvestorUpdates([]);
                          alert('All data has been deleted.');
                        }
                      }}
                      className="btn btn-error w-full"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Template Downloads */}
            <div className="card">
              <div className="card-header">
                <h3 className="heading-5">Import Templates</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Download templates to properly format your data for import
                </p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => {
                      const template = [
                        {
                          name: "Example Company",
                          sector: "Technology",
                          investmentDate: "2023-01-01",
                          initialInvestment: 10000000,
                          currentValue: 12000000,
                          ownership: 25,
                          status: "Active",
                          ebitda: 2000000,
                          revenue: 15000000
                        }
                      ];
                      exportToCSV(template, 'portfolio-template');
                    }}
                    className="btn btn-secondary"
                  >
                    <Download className="h-4 w-4" />
                    Portfolio Template
                  </button>
                  
                  <button
                    onClick={() => {
                      const template = [
                        {
                          companyName: "Example Deal",
                          sector: "Technology",
                          dealSize: 20000000,
                          stage: "Due Diligence",
                          probability: 75,
                          expectedClose: "2025-12-31",
                          leadPartner: "Partner Name",
                          notes: "Investment opportunity notes"
                        }
                      ];
                      exportToCSV(template, 'deals-template');
                    }}
                    className="btn btn-secondary"
                  >
                    <Download className="h-4 w-4" />
                    Deals Template
                  </button>
                  
                  <button
                    onClick={() => {
                      const template = [
                        {
                          name: "Fund Name",
                          vintage: 2023,
                          size: 500000000,
                          committed: 400000000,
                          called: 200000000,
                          distributed: 50000000,
                          nav: 220000000,
                          irr: 15.5,
                          multiple: 1.35
                        }
                      ];
                      exportToCSV(template, 'funds-template');
                    }}
                    className="btn btn-secondary"
                  >
                    <Download className="h-4 w-4" />
                    Funds Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <div className="modal-header">
            <h3 className="heading-5">
              {editingItem ? 'Edit' : 'Add'} {activeTab === 'portfolio' ? 'Portfolio Company' : 'Deal'}
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ×
            </button>
          </div>
          <div className="modal-body">
            {activeTab === 'portfolio' ? <PortfolioForm /> : <DealForm />}
          </div>
        </Modal>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;