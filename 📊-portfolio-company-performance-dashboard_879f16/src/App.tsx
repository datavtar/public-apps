import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  Building,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  Filter,
  Search,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Settings,
  Download,
  Upload,
  Moon,
  Sun,
  Eye,
  BarChart as BarChartIcon,
  PieChart,
  LineChart as LineChartIcon,
  FileText,
  Target,
  Briefcase,
  Globe,
  Users,
  ChevronDown,
  X,
  Plus,
  Edit,
  Trash2,
  Save
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Company {
  id: string;
  name: string;
  sector: string;
  investmentAmount: number;
  currentValuation: number;
  investmentDate: string;
  lastUpdated: string;
  logo: string;
  description: string;
  stage: 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'IPO';
  employees: number;
  location: string;
  website: string;
  ceo: string;
}

interface FinancialData {
  companyId: string;
  revenue: Array<{ month: string; value: number; year: number }>;
  profit: Array<{ month: string; value: number; year: number }>;
  cashFlow: Array<{ month: string; value: number; year: number }>;
  expenses: Array<{ category: string; value: number; percentage: number }>;
  kpis: {
    revenueGrowth: number;
    profitMargin: number;
    burnRate: number;
    runwayMonths: number;
    customerCount: number;
    arr: number;
  };
  valuation: Array<{ date: string; value: number }>;
}

interface Settings {
  currency: string;
  theme: 'light' | 'dark';
  dateFormat: string;
  language: string;
  defaultView: 'grid' | 'list';
  autoRefresh: boolean;
}

type ViewType = 'overview' | 'company-detail' | 'settings';
type ChartType = 'revenue' | 'profit' | 'cashflow' | 'expenses' | 'valuation';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [financialData, setFinancialData] = useState<Record<string, FinancialData>>({});
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    theme: 'light',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    defaultView: 'grid',
    autoRefresh: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'investment' | 'valuation' | 'roi'>('roi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedChart, setSelectedChart] = useState<ChartType>('revenue');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default data
  useEffect(() => {
    const initializeData = () => {
      setIsLoading(true);
      
      // Load from localStorage or set defaults
      const savedCompanies = localStorage.getItem('portfolio-companies');
      const savedFinancialData = localStorage.getItem('portfolio-financial-data');
      const savedSettings = localStorage.getItem('portfolio-settings');

      if (savedCompanies) {
        setCompanies(JSON.parse(savedCompanies));
      } else {
        // Default companies data
        const defaultCompanies: Company[] = [
          {
            id: '1',
            name: 'TechFlow Solutions',
            sector: 'Technology',
            investmentAmount: 2500000,
            currentValuation: 8500000,
            investmentDate: '2022-03-15',
            lastUpdated: '2024-12-20',
            logo: '🚀',
            description: 'AI-powered workflow automation platform',
            stage: 'Series A',
            employees: 45,
            location: 'San Francisco, CA',
            website: 'techflow.com',
            ceo: 'Sarah Chen'
          },
          {
            id: '2',
            name: 'GreenEnergy Corp',
            sector: 'Energy',
            investmentAmount: 5000000,
            currentValuation: 15000000,
            investmentDate: '2021-08-22',
            lastUpdated: '2024-12-19',
            logo: '🌱',
            description: 'Renewable energy storage solutions',
            stage: 'Series B',
            employees: 120,
            location: 'Austin, TX',
            website: 'greenenergy.com',
            ceo: 'Michael Rodriguez'
          },
          {
            id: '3',
            name: 'HealthFirst Analytics',
            sector: 'Healthcare',
            investmentAmount: 1800000,
            currentValuation: 4200000,
            investmentDate: '2023-01-10',
            lastUpdated: '2024-12-21',
            logo: '🏥',
            description: 'Healthcare data analytics and insights',
            stage: 'Seed',
            employees: 28,
            location: 'Boston, MA',
            website: 'healthfirst.com',
            ceo: 'Dr. Emily Watson'
          },
          {
            id: '4',
            name: 'FinTech Innovations',
            sector: 'Financial',
            investmentAmount: 3200000,
            currentValuation: 12000000,
            investmentDate: '2022-11-05',
            lastUpdated: '2024-12-18',
            logo: '💳',
            description: 'Next-generation payment processing',
            stage: 'Series A',
            employees: 67,
            location: 'New York, NY',
            website: 'fintech-innovations.com',
            ceo: 'David Park'
          },
          {
            id: '5',
            name: 'EduTech Platform',
            sector: 'Education',
            investmentAmount: 1500000,
            currentValuation: 3800000,
            investmentDate: '2023-06-18',
            lastUpdated: '2024-12-17',
            logo: '📚',
            description: 'Personalized learning management system',
            stage: 'Seed',
            employees: 22,
            location: 'Seattle, WA',
            website: 'edutech.com',
            ceo: 'Lisa Johnson'
          }
        ];
        setCompanies(defaultCompanies);
        localStorage.setItem('portfolio-companies', JSON.stringify(defaultCompanies));
      }

      if (savedFinancialData) {
        setFinancialData(JSON.parse(savedFinancialData));
      } else {
        // Generate default financial data
        const defaultFinancialData: Record<string, FinancialData> = {};
        const generateMonthlyData = (baseValue: number, growth: number, months: number = 12) => {
          return Array.from({ length: months }, (_, i) => {
            const month = new Date(2024, i).toLocaleDateString('en-US', { month: 'short' });
            const value = baseValue * (1 + (growth / 100) * (i / 12)) + (Math.random() - 0.5) * baseValue * 0.1;
            return { month, value: Math.round(value), year: 2024 };
          });
        };

        ['1', '2', '3', '4', '5'].forEach(id => {
          const baseRevenue = 100000 + Math.random() * 500000;
          defaultFinancialData[id] = {
            companyId: id,
            revenue: generateMonthlyData(baseRevenue, 25),
            profit: generateMonthlyData(baseRevenue * 0.2, 15),
            cashFlow: generateMonthlyData(baseRevenue * 0.15, 10),
            expenses: [
              { category: 'R&D', value: 45, percentage: 45 },
              { category: 'Sales & Marketing', value: 30, percentage: 30 },
              { category: 'Operations', value: 15, percentage: 15 },
              { category: 'General & Admin', value: 10, percentage: 10 }
            ],
            kpis: {
              revenueGrowth: 25 + Math.random() * 50,
              profitMargin: 15 + Math.random() * 25,
              burnRate: 50000 + Math.random() * 100000,
              runwayMonths: 12 + Math.random() * 24,
              customerCount: 100 + Math.random() * 1000,
              arr: baseRevenue * 12
            },
            valuation: Array.from({ length: 8 }, (_, i) => ({
              date: new Date(2024, i * 1.5).toISOString().split('T')[0],
              value: 1000000 + i * 500000 + Math.random() * 1000000
            }))
          };
        });
        setFinancialData(defaultFinancialData);
        localStorage.setItem('portfolio-financial-data', JSON.stringify(defaultFinancialData));
      }

      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
        // Apply theme
        if (parsedSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      }

      setTimeout(() => setIsLoading(false), 1000);
    };

    initializeData();
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (companies.length > 0) {
      localStorage.setItem('portfolio-companies', JSON.stringify(companies));
    }
  }, [companies]);

  useEffect(() => {
    if (Object.keys(financialData).length > 0) {
      localStorage.setItem('portfolio-financial-data', JSON.stringify(financialData));
    }
  }, [financialData]);

  useEffect(() => {
    localStorage.setItem('portfolio-settings', JSON.stringify(settings));
  }, [settings]);

  // Handle ESC key for modal closing
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setEditingCompany(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Filtered and sorted companies
  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          company.sector.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSector = sectorFilter === 'All' || company.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });

    return filtered.sort((a, b) => {
      let aValue: number, bValue: number;
      switch (sortBy) {
        case 'name':
          return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'investment':
          aValue = a.investmentAmount;
          bValue = b.investmentAmount;
          break;
        case 'valuation':
          aValue = a.currentValuation;
          bValue = b.currentValuation;
          break;
        case 'roi':
        default:
          aValue = ((a.currentValuation - a.investmentAmount) / a.investmentAmount) * 100;
          bValue = ((b.currentValuation - b.investmentAmount) / b.investmentAmount) * 100;
          break;
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [companies, searchTerm, sectorFilter, sortBy, sortOrder]);

  const sectors = useMemo(() => {
    return ['All', ...Array.from(new Set(companies.map(c => c.sector)))];
  }, [companies]);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light';
    setSettings(prev => ({ ...prev, theme: newTheme }));
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateROI = (company: Company) => {
    return ((company.currentValuation - company.investmentAmount) / company.investmentAmount) * 100;
  };

  const handleAddCompany = (formData: FormData) => {
    const newCompany: Company = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      sector: formData.get('sector') as string,
      investmentAmount: Number(formData.get('investmentAmount')),
      currentValuation: Number(formData.get('currentValuation')),
      investmentDate: formData.get('investmentDate') as string,
      lastUpdated: new Date().toISOString().split('T')[0],
      logo: formData.get('logo') as string || '🏢',
      description: formData.get('description') as string,
      stage: formData.get('stage') as Company['stage'],
      employees: Number(formData.get('employees')),
      location: formData.get('location') as string,
      website: formData.get('website') as string,
      ceo: formData.get('ceo') as string
    };
    setCompanies(prev => [...prev, newCompany]);
    setShowAddModal(false);
  };

  const handleEditCompany = (formData: FormData) => {
    if (!editingCompany) return;
    
    const updatedCompany: Company = {
      ...editingCompany,
      name: formData.get('name') as string,
      sector: formData.get('sector') as string,
      investmentAmount: Number(formData.get('investmentAmount')),
      currentValuation: Number(formData.get('currentValuation')),
      description: formData.get('description') as string,
      stage: formData.get('stage') as Company['stage'],
      employees: Number(formData.get('employees')),
      location: formData.get('location') as string,
      website: formData.get('website') as string,
      ceo: formData.get('ceo') as string,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setCompanies(prev => prev.map(c => c.id === editingCompany.id ? updatedCompany : c));
    setEditingCompany(null);
  };

  const handleDeleteCompany = (companyId: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setCompanies(prev => prev.filter(c => c.id !== companyId));
      const newFinancialData = { ...financialData };
      delete newFinancialData[companyId];
      setFinancialData(newFinancialData);
    }
  };

  const exportData = () => {
    const csvData = companies.map(company => ({
      Name: company.name,
      Sector: company.sector,
      'Investment Amount': company.investmentAmount,
      'Current Valuation': company.currentValuation,
      'ROI %': calculateROI(company).toFixed(2),
      'Investment Date': company.investmentDate,
      Stage: company.stage,
      Employees: company.employees,
      Location: company.location,
      CEO: company.ceo
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-companies.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      setCompanies([]);
      setFinancialData({});
      localStorage.removeItem('portfolio-companies');
      localStorage.removeItem('portfolio-financial-data');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-300">Loading portfolio data...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div className="flex items-center gap-4">
              {currentView !== 'overview' && (
                <button
                  onClick={() => {
                    setCurrentView('overview');
                    setSelectedCompany(null);
                  }}
                  className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                  aria-label="Back to overview"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentView === 'overview' ? 'Investment Portfolio' : 
                   currentView === 'settings' ? 'Settings' : selectedCompany?.name}
                </h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {currentView === 'overview' ? 'Monitor your investment performance' :
                   currentView === 'settings' ? 'Manage your preferences' : 'Financial dashboard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                aria-label="Toggle theme"
              >
                {settings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setCurrentView('settings')}
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6">
        {currentView === 'overview' && (
          <div id="generation_issue_fallback">
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Invested</div>
                    <div className="stat-value">
                      {formatCurrency(companies.reduce((sum, c) => sum + c.investmentAmount, 0))}
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Current Value</div>
                    <div className="stat-value">
                      {formatCurrency(companies.reduce((sum, c) => sum + c.currentValuation, 0))}
                    </div>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Return</div>
                    <div className="stat-value">
                      {formatCurrency(
                        companies.reduce((sum, c) => sum + c.currentValuation, 0) -
                        companies.reduce((sum, c) => sum + c.investmentAmount, 0)
                      )}
                    </div>
                  </div>
                  <Percent className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Companies</div>
                    <div className="stat-value">{companies.length}</div>
                  </div>
                  <Building className="w-8 h-8 text-orange-500" />
                </div>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6 theme-transition">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                    id="search-companies"
                  />
                </div>
                
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="input"
                  id="filter-sector"
                >
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="input"
                >
                  <option value="roi">Sort by ROI</option>
                  <option value="name">Sort by Name</option>
                  <option value="investment">Sort by Investment</option>
                  <option value="valuation">Sort by Valuation</option>
                </select>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600 flex-1"
                  >
                    {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary flex-1"
                    id="add-company-btn"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Companies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => {
                const roi = calculateROI(company);
                return (
                  <div
                    key={company.id}
                    className="card hover:shadow-lg transition-all duration-200 cursor-pointer group"
                    onClick={() => {
                      setSelectedCompany(company);
                      setCurrentView('company-detail');
                    }}
                    id={`company-card-${company.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{company.logo}</div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {company.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-slate-400">{company.sector}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCompany(company);
                          }}
                          className="btn btn-sm bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCompany(company.id);
                          }}
                          className="btn btn-sm bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Invested:</span>
                        <span className="font-medium">{formatCurrency(company.investmentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Current Value:</span>
                        <span className="font-medium">{formatCurrency(company.currentValuation)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-slate-400">ROI:</span>
                        <span className={`font-medium ${roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500 dark:text-slate-400">Stage:</span>
                        <span className="badge badge-info">{company.stage}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                      <p className="text-xs text-gray-500 dark:text-slate-400">{company.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No companies found</h3>
                <p className="text-gray-500 dark:text-slate-400 mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn btn-primary"
                >
                  Add Your First Company
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'company-detail' && selectedCompany && (
          <div>
            {/* Company Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6 theme-transition">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-3xl">{selectedCompany.logo}</div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h2>
                      <p className="text-gray-500 dark:text-slate-400">{selectedCompany.description}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">CEO:</span>
                      <p className="font-medium">{selectedCompany.ceo}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">Employees:</span>
                      <p className="font-medium">{selectedCompany.employees}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">Location:</span>
                      <p className="font-medium">{selectedCompany.location}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-slate-400">Stage:</span>
                      <span className="badge badge-info">{selectedCompany.stage}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card">
                    <div className="stat-title">Investment</div>
                    <div className="stat-value text-lg">{formatCurrency(selectedCompany.investmentAmount)}</div>
                    <div className="stat-desc">{selectedCompany.investmentDate}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Current Value</div>
                    <div className="stat-value text-lg">{formatCurrency(selectedCompany.currentValuation)}</div>
                    <div className={`stat-desc ${
                      calculateROI(selectedCompany) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {calculateROI(selectedCompany) >= 0 ? '+' : ''}{calculateROI(selectedCompany).toFixed(1)}% ROI
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 mb-6 theme-transition">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'revenue', label: 'Revenue', icon: LineChartIcon },
                  { key: 'profit', label: 'Profit', icon: BarChartIcon },
                  { key: 'cashflow', label: 'Cash Flow', icon: TrendingUp },
                  { key: 'expenses', label: 'Expenses', icon: PieChart },
                  { key: 'valuation', label: 'Valuation', icon: TrendingUp }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedChart(key as ChartType)}
                    className={`btn flex items-center gap-2 ${
                      selectedChart === key
                        ? 'btn-primary'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                    id={`chart-${key}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Charts */}
              <div className="h-80">
                {financialData[selectedCompany.id] && (
                  <ResponsiveContainer width="100%" height="100%">
                    {selectedChart === 'revenue' && (
                      <LineChart data={financialData[selectedCompany.id].revenue}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: settings.theme === 'dark' ? '#1E293B' : '#FFFFFF',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          name="Revenue"
                        />
                      </LineChart>
                    )}
                    
                    {selectedChart === 'profit' && (
                      <BarChart data={financialData[selectedCompany.id].profit}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: settings.theme === 'dark' ? '#1E293B' : '#FFFFFF',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Bar dataKey="value" fill="#10B981" name="Profit" />
                      </BarChart>
                    )}
                    
                    {selectedChart === 'cashflow' && (
                      <AreaChart data={financialData[selectedCompany.id].cashFlow}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: settings.theme === 'dark' ? '#1E293B' : '#FFFFFF',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8B5CF6"
                          fill="#8B5CF6"
                          fillOpacity={0.6}
                          name="Cash Flow"
                        />
                      </AreaChart>
                    )}
                    
                    {selectedChart === 'expenses' && (
                      <RechartsPieChart>
                        <Pie
                          data={financialData[selectedCompany.id].expenses}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percentage }) => `${category} (${percentage}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {financialData[selectedCompany.id].expenses.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RechartsPieChart>
                    )}
                    
                    {selectedChart === 'valuation' && (
                      <LineChart data={financialData[selectedCompany.id].valuation}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="date" stroke="#6B7280" />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: settings.theme === 'dark' ? '#1E293B' : '#FFFFFF',
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#F59E0B"
                          strokeWidth={2}
                          name="Valuation"
                        />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* KPIs */}
            {financialData[selectedCompany.id] && (
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 theme-transition">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Performance Indicators</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <div className="stat-title">Revenue Growth</div>
                    <div className="stat-value text-green-600 dark:text-green-400">
                      +{financialData[selectedCompany.id].kpis.revenueGrowth.toFixed(1)}%
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Profit Margin</div>
                    <div className="stat-value">
                      {financialData[selectedCompany.id].kpis.profitMargin.toFixed(1)}%
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Monthly Burn Rate</div>
                    <div className="stat-value text-red-600 dark:text-red-400">
                      -{formatCurrency(financialData[selectedCompany.id].kpis.burnRate)}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Runway</div>
                    <div className="stat-value">
                      {Math.round(financialData[selectedCompany.id].kpis.runwayMonths)} months
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Customers</div>
                    <div className="stat-value">
                      {Math.round(financialData[selectedCompany.id].kpis.customerCount).toLocaleString()}
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">ARR</div>
                    <div className="stat-value">
                      {formatCurrency(financialData[selectedCompany.id].kpis.arr)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentView === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 theme-transition">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Settings</h2>
              
              <div className="space-y-6">
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="input"
                    id="settings-currency"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSettings(prev => ({ ...prev, theme: 'light' }));
                        document.documentElement.classList.remove('dark');
                      }}
                      className={`btn flex-1 ${
                        settings.theme === 'light'
                          ? 'btn-primary'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200'
                      }`}
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Light
                    </button>
                    <button
                      onClick={() => {
                        setSettings(prev => ({ ...prev, theme: 'dark' }));
                        document.documentElement.classList.add('dark');
                      }}
                      className={`btn flex-1 ${
                        settings.theme === 'dark'
                          ? 'btn-primary'
                          : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200'
                      }`}
                    >
                      <Moon className="w-4 h-4 mr-2" />
                      Dark
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Default View</label>
                  <select
                    value={settings.defaultView}
                    onChange={(e) => setSettings(prev => ({ ...prev, defaultView: e.target.value as 'grid' | 'list' }))}
                    className="input"
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Auto Refresh</label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.autoRefresh}
                      onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-slate-300">Enable auto refresh</span>
                  </label>
                </div>
                
                <div className="border-t border-gray-200 dark:border-slate-600 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                  <div className="flex gap-4">
                    <button
                      onClick={exportData}
                      className="btn bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                      id="export-data-btn"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </button>
                    <button
                      onClick={clearAllData}
                      className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Company Modal */}
      {(showAddModal || editingCompany) && (
        <div className="modal-backdrop" onClick={() => { setShowAddModal(false); setEditingCompany(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingCompany(null); }}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                if (editingCompany) {
                  handleEditCompany(formData);
                } else {
                  handleAddCompany(formData);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    defaultValue={editingCompany?.name || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Sector</label>
                  <input
                    type="text"
                    name="sector"
                    required
                    defaultValue={editingCompany?.sector || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Investment Amount</label>
                  <input
                    type="number"
                    name="investmentAmount"
                    required
                    defaultValue={editingCompany?.investmentAmount || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Current Valuation</label>
                  <input
                    type="number"
                    name="currentValuation"
                    required
                    defaultValue={editingCompany?.currentValuation || ''}
                    className="input"
                  />
                </div>
                
                {!editingCompany && (
                  <div className="form-group">
                    <label className="form-label">Investment Date</label>
                    <input
                      type="date"
                      name="investmentDate"
                      required
                      className="input"
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Stage</label>
                  <select name="stage" required defaultValue={editingCompany?.stage || 'Seed'} className="input">
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C">Series C</option>
                    <option value="IPO">IPO</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">CEO</label>
                  <input
                    type="text"
                    name="ceo"
                    required
                    defaultValue={editingCompany?.ceo || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Employees</label>
                  <input
                    type="number"
                    name="employees"
                    required
                    defaultValue={editingCompany?.employees || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    required
                    defaultValue={editingCompany?.location || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input
                    type="text"
                    name="website"
                    required
                    defaultValue={editingCompany?.website || ''}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  required
                  defaultValue={editingCompany?.description || ''}
                  className="input"
                  rows={3}
                />
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingCompany(null); }}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4 mr-2" />
                  {editingCompany ? 'Update' : 'Add'} Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;