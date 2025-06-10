import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Building2, TrendingUp, DollarSign, Users, FileText, Settings,
  Plus, Search, Filter, Download, Upload, Edit, Trash2, Eye,
  BarChart3, PieChart, Calendar, Clock, CheckCircle, AlertCircle,
  Target, Briefcase, ArrowUp, ArrowDown, Menu, X, Bell, Globe,
  Calculator, Percent, Star, Award, Shield, Database, Brain,
  ChevronDown, ChevronRight, ExternalLink, Mail, Phone
} from 'lucide-react';

// Types and Interfaces
interface Deal {
  id: string;
  companyName: string;
  sector: string;
  stage: 'sourcing' | 'due_diligence' | 'term_sheet' | 'closing' | 'closed';
  dealSize: number;
  valuation: number;
  ownership: number;
  dateAdded: string;
  closeDate?: string;
  leadPartner: string;
  status: 'active' | 'passed' | 'closed';
  description: string;
  geographicLocation: string;
  fundSource: string;
}

interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  investmentDate: string;
  initialInvestment: number;
  currentValuation: number;
  ownership: number;
  ebitda: number;
  revenue: number;
  employees: number;
  boardSeats: number;
  status: 'performing' | 'monitoring' | 'concern';
  lastUpdate: string;
  keyMetrics: {
    revenueGrowth: number;
    ebitdaMargin: number;
    debtToEquity: number;
    customerCount: number;
  };
}

interface Investor {
  id: string;
  name: string;
  type: 'institutional' | 'family_office' | 'sovereign' | 'pension' | 'endowment';
  commitment: number;
  invested: number;
  distributions: number;
  since: string;
  geography: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface FundMetrics {
  totalAUM: number;
  deployedCapital: number;
  unrealizedValue: number;
  realizedValue: number;
  irr: number;
  multiple: number;
  portfolioCount: number;
  avgHoldingPeriod: number;
}

interface Document {
  id: string;
  name: string;
  type: 'term_sheet' | 'financial_statement' | 'due_diligence' | 'legal' | 'board_material' | 'investor_report';
  companyId?: string;
  dealId?: string;
  uploadDate: string;
  size: string;
  status: 'pending' | 'reviewed' | 'approved';
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [deals, setDeals] = useState<Deal[]>([]);
  const [portfolioCompanies, setPortfolioCompanies] = useState<PortfolioCompany[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fundMetrics, setFundMetrics] = useState<FundMetrics>({
    totalAUM: 500000000,
    deployedCapital: 320000000,
    unrealizedValue: 680000000,
    realizedValue: 240000000,
    irr: 18.5,
    multiple: 2.1,
    portfolioCount: 12,
    avgHoldingPeriod: 4.2
  });

  // UI State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSector, setFilterSector] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // AI State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState<any>({});

  // Load data from localStorage on mount
  useEffect(() => {
    const savedDeals = localStorage.getItem('pe_deals');
    const savedPortfolio = localStorage.getItem('pe_portfolio');
    const savedInvestors = localStorage.getItem('pe_investors');
    const savedDocuments = localStorage.getItem('pe_documents');
    const savedMetrics = localStorage.getItem('pe_metrics');

    if (savedDeals) setDeals(JSON.parse(savedDeals));
    if (savedPortfolio) setPortfolioCompanies(JSON.parse(savedPortfolio));
    if (savedInvestors) setInvestors(JSON.parse(savedInvestors));
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments));
    if (savedMetrics) setFundMetrics(JSON.parse(savedMetrics));

    // Initialize with sample data if empty
    if (!savedDeals) {
      const sampleDeals: Deal[] = [
        {
          id: '1',
          companyName: 'TechCorp Solutions',
          sector: 'Technology',
          stage: 'due_diligence',
          dealSize: 50000000,
          valuation: 200000000,
          ownership: 25,
          dateAdded: '2024-05-15',
          leadPartner: 'Sarah Johnson',
          status: 'active',
          description: 'SaaS platform for enterprise automation',
          geographicLocation: 'San Francisco, CA',
          fundSource: 'Fund III'
        },
        {
          id: '2',
          companyName: 'GreenEnergy Inc',
          sector: 'Energy',
          stage: 'term_sheet',
          dealSize: 75000000,
          valuation: 300000000,
          ownership: 20,
          dateAdded: '2024-05-01',
          leadPartner: 'Michael Chen',
          status: 'active',
          description: 'Renewable energy storage solutions',
          geographicLocation: 'Austin, TX',
          fundSource: 'Fund III'
        }
      ];
      setDeals(sampleDeals);
      localStorage.setItem('pe_deals', JSON.stringify(sampleDeals));
    }

    if (!savedPortfolio) {
      const samplePortfolio: PortfolioCompany[] = [
        {
          id: '1',
          name: 'MedDevice Pro',
          sector: 'Healthcare',
          investmentDate: '2022-03-15',
          initialInvestment: 40000000,
          currentValuation: 95000000,
          ownership: 30,
          ebitda: 18000000,
          revenue: 85000000,
          employees: 245,
          boardSeats: 2,
          status: 'performing',
          lastUpdate: '2024-05-30',
          keyMetrics: {
            revenueGrowth: 35,
            ebitdaMargin: 21,
            debtToEquity: 0.45,
            customerCount: 150
          }
        },
        {
          id: '2',
          name: 'FinTech Solutions',
          sector: 'Financial Services',
          investmentDate: '2021-08-20',
          initialInvestment: 60000000,
          currentValuation: 140000000,
          ownership: 25,
          ebitda: 25000000,
          revenue: 120000000,
          employees: 180,
          boardSeats: 2,
          status: 'performing',
          lastUpdate: '2024-05-28',
          keyMetrics: {
            revenueGrowth: 42,
            ebitdaMargin: 21,
            debtToEquity: 0.32,
            customerCount: 5000
          }
        }
      ];
      setPortfolioCompanies(samplePortfolio);
      localStorage.setItem('pe_portfolio', JSON.stringify(samplePortfolio));
    }

    if (!savedInvestors) {
      const sampleInvestors: Investor[] = [
        {
          id: '1',
          name: 'CalPERS',
          type: 'pension',
          commitment: 100000000,
          invested: 75000000,
          distributions: 45000000,
          since: '2019',
          geography: 'United States',
          contactPerson: 'David Wilson',
          email: 'dwilson@calpers.ca.gov',
          phone: '+1-916-555-0123'
        },
        {
          id: '2',
          name: 'Singapore Sovereign Fund',
          type: 'sovereign',
          commitment: 150000000,
          invested: 120000000,
          distributions: 80000000,
          since: '2018',
          geography: 'Asia Pacific',
          contactPerson: 'Li Wei Chen',
          email: 'lchen@sgfund.sg',
          phone: '+65-6555-0123'
        }
      ];
      setInvestors(sampleInvestors);
      localStorage.setItem('pe_investors', JSON.stringify(sampleInvestors));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('pe_deals', JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem('pe_portfolio', JSON.stringify(portfolioCompanies));
  }, [portfolioCompanies]);

  useEffect(() => {
    localStorage.setItem('pe_investors', JSON.stringify(investors));
  }, [investors]);

  useEffect(() => {
    localStorage.setItem('pe_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('pe_metrics', JSON.stringify(fundMetrics));
  }, [fundMetrics]);

  // AI Functions
  const handleAiAnalysis = (type: string, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setShowAiModal(true);
    setAiResult(null);
    setAiError(null);
    
    let prompt = '';
    if (type === 'term_sheet') {
      prompt = 'Analyze this term sheet and extract key deal terms. Provide a comprehensive analysis of valuation, ownership structure, governance rights, and key provisions.';
    } else if (type === 'financial_analysis') {
      prompt = 'Analyze these financial statements and provide insights on revenue trends, profitability, cash flow, and key financial ratios. Highlight any red flags or positive indicators.';
    } else if (type === 'due_diligence') {
      prompt = 'Review this due diligence document and summarize key findings, risks, and opportunities. Focus on market position, competitive advantages, and potential concerns.';
    } else if (type === 'investment_memo') {
      prompt = `Generate an investment memo for ${item?.companyName || 'the target company'}. Include executive summary, market analysis, competitive positioning, financial overview, investment thesis, and risk factors.`;
    }
    
    setAiPrompt(prompt);
  };

  const handleSendToAi = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError("Please provide a prompt or select a file to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(aiPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  // CRUD Functions
  const handleAddItem = () => {
    if (modalType === 'deal') {
      const newDeal: Deal = {
        id: Date.now().toString(),
        companyName: formData.companyName || '',
        sector: formData.sector || '',
        stage: formData.stage || 'sourcing',
        dealSize: parseFloat(formData.dealSize) || 0,
        valuation: parseFloat(formData.valuation) || 0,
        ownership: parseFloat(formData.ownership) || 0,
        dateAdded: new Date().toISOString().split('T')[0],
        leadPartner: formData.leadPartner || '',
        status: 'active',
        description: formData.description || '',
        geographicLocation: formData.geographicLocation || '',
        fundSource: formData.fundSource || ''
      };
      setDeals([...deals, newDeal]);
    } else if (modalType === 'portfolio') {
      const newCompany: PortfolioCompany = {
        id: Date.now().toString(),
        name: formData.name || '',
        sector: formData.sector || '',
        investmentDate: formData.investmentDate || '',
        initialInvestment: parseFloat(formData.initialInvestment) || 0,
        currentValuation: parseFloat(formData.currentValuation) || 0,
        ownership: parseFloat(formData.ownership) || 0,
        ebitda: parseFloat(formData.ebitda) || 0,
        revenue: parseFloat(formData.revenue) || 0,
        employees: parseInt(formData.employees) || 0,
        boardSeats: parseInt(formData.boardSeats) || 0,
        status: formData.status || 'performing',
        lastUpdate: new Date().toISOString().split('T')[0],
        keyMetrics: {
          revenueGrowth: parseFloat(formData.revenueGrowth) || 0,
          ebitdaMargin: parseFloat(formData.ebitdaMargin) || 0,
          debtToEquity: parseFloat(formData.debtToEquity) || 0,
          customerCount: parseInt(formData.customerCount) || 0
        }
      };
      setPortfolioCompanies([...portfolioCompanies, newCompany]);
    } else if (modalType === 'investor') {
      const newInvestor: Investor = {
        id: Date.now().toString(),
        name: formData.name || '',
        type: formData.type || 'institutional',
        commitment: parseFloat(formData.commitment) || 0,
        invested: parseFloat(formData.invested) || 0,
        distributions: parseFloat(formData.distributions) || 0,
        since: formData.since || '',
        geography: formData.geography || '',
        contactPerson: formData.contactPerson || '',
        email: formData.email || '',
        phone: formData.phone || ''
      };
      setInvestors([...investors, newInvestor]);
    }

    setShowAddModal(false);
    setFormData({});
  };

  const handleEditItem = (item: any, type: string) => {
    setSelectedItem(item);
    setModalType(type);
    setFormData(item);
    setShowAddModal(true);
  };

  const handleUpdateItem = () => {
    if (modalType === 'deal') {
      setDeals(deals.map(deal => 
        deal.id === selectedItem.id ? { ...deal, ...formData } : deal
      ));
    } else if (modalType === 'portfolio') {
      setPortfolioCompanies(portfolioCompanies.map(company => 
        company.id === selectedItem.id ? { ...company, ...formData } : company
      ));
    } else if (modalType === 'investor') {
      setInvestors(investors.map(investor => 
        investor.id === selectedItem.id ? { ...investor, ...formData } : investor
      ));
    }

    setShowAddModal(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleDeleteItem = (id: string, type: string) => {
    if (type === 'deal') {
      setDeals(deals.filter(deal => deal.id !== id));
    } else if (type === 'portfolio') {
      setPortfolioCompanies(portfolioCompanies.filter(company => company.id !== id));
    } else if (type === 'investor') {
      setInvestors(investors.filter(investor => investor.id !== id));
    }
  };

  // Export Functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'object' ? JSON.stringify(value) : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    if (type === 'deals') {
      exportToCSV(deals, `deals_${timestamp}.csv`);
    } else if (type === 'portfolio') {
      exportToCSV(portfolioCompanies, `portfolio_${timestamp}.csv`);
    } else if (type === 'investors') {
      exportToCSV(investors, `investors_${timestamp}.csv`);
    }
  };

  // Import Functions
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim();
          });
          return obj;
        }).filter(obj => Object.values(obj).some(val => val));

        if (type === 'deals') {
          setDeals([...deals, ...data.map((item: any) => ({
            ...item,
            id: Date.now().toString() + Math.random(),
            dealSize: parseFloat(item.dealSize) || 0,
            valuation: parseFloat(item.valuation) || 0,
            ownership: parseFloat(item.ownership) || 0
          }))]);
        } else if (type === 'portfolio') {
          setPortfolioCompanies([...portfolioCompanies, ...data.map((item: any) => ({
            ...item,
            id: Date.now().toString() + Math.random(),
            initialInvestment: parseFloat(item.initialInvestment) || 0,
            currentValuation: parseFloat(item.currentValuation) || 0,
            ownership: parseFloat(item.ownership) || 0,
            keyMetrics: typeof item.keyMetrics === 'string' ? JSON.parse(item.keyMetrics) : {}
          }))]);
        }
      } catch (error) {
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);
  };

  // Download template
  const downloadTemplate = (type: string) => {
    let template = '';
    if (type === 'deals') {
      template = 'companyName,sector,stage,dealSize,valuation,ownership,leadPartner,description,geographicLocation,fundSource\n"Example Corp","Technology","sourcing","50000000","200000000","25","John Doe","AI-powered analytics platform","New York, NY","Fund III"';
    } else if (type === 'portfolio') {
      template = 'name,sector,investmentDate,initialInvestment,currentValuation,ownership,ebitda,revenue,employees,boardSeats,status\n"Sample Company","Healthcare","2023-01-15","40000000","95000000","30","18000000","85000000","245","2","performing"';
    }

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and search functions
  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'all' || deal.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  const filteredPortfolio = portfolioCompanies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = filterSector === 'all' || company.sector === filterSector;
    return matchesSearch && matchesSector;
  });

  const sectors = ['all', 'Technology', 'Healthcare', 'Financial Services', 'Energy', 'Consumer', 'Industrial'];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div id="welcome_fallback" className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card card-padding bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total AUM</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(fundMetrics.totalAUM)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="card card-padding bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Portfolio IRR</p>
              <p className="text-2xl font-bold text-green-900">{formatPercentage(fundMetrics.irr)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="card card-padding bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Portfolio Count</p>
              <p className="text-2xl font-bold text-purple-900">{fundMetrics.portfolioCount}</p>
            </div>
            <Building2 className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="card card-padding bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">TVPI Multiple</p>
              <p className="text-2xl font-bold text-orange-900">{fundMetrics.multiple}x</p>
            </div>
            <Target className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Portfolio Performance</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Portfolio performance chart would display here</p>
          </div>
        </div>

        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Sector Allocation</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Sector allocation chart would display here</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card card-padding">
        <h3 className="heading-5 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-blue-500" />
            <div>
              <p className="font-medium">Deal closed: TechCorp Solutions</p>
              <p className="text-sm text-gray-600">$50M investment completed</p>
            </div>
            <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <div>
              <p className="font-medium">Portfolio update: MedDevice Pro</p>
              <p className="text-sm text-gray-600">Q2 results exceeded expectations</p>
            </div>
            <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
          </div>
          
          <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <div>
              <p className="font-medium">Due diligence started: GreenEnergy Inc</p>
              <p className="text-sm text-gray-600">Financial and legal review initiated</p>
            </div>
            <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Deal Pipeline
  const renderDeals = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 id="deals-tab" className="heading-3">Deal Pipeline</h2>
          <p className="text-caption">Track and manage investment opportunities</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadTemplate('deals')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="h-4 w-4" />
            Template
          </button>
          
          <label className="btn btn-secondary btn-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            Import
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleImport(e, 'deals')}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => handleExport('deals')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          
          <button
            onClick={() => {
              setModalType('deal');
              setSelectedItem(null);
              setFormData({});
              setShowAddModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4" />
            Add Deal
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        
        <select
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          className="select w-full sm:w-48"
        >
          {sectors.map(sector => (
            <option key={sector} value={sector}>
              {sector === 'all' ? 'All Sectors' : sector}
            </option>
          ))}
        </select>
      </div>

      {/* Deals Table */}
      <div className="table-container">
        <table className="table">
          <thead className="table-header">
            <tr>
              <th className="table-header-cell">Company</th>
              <th className="table-header-cell">Sector</th>
              <th className="table-header-cell">Stage</th>
              <th className="table-header-cell">Deal Size</th>
              <th className="table-header-cell">Valuation</th>
              <th className="table-header-cell">Ownership</th>
              <th className="table-header-cell">Lead Partner</th>
              <th className="table-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredDeals.map((deal) => (
              <tr key={deal.id} className="table-row">
                <td className="table-cell">
                  <div>
                    <div className="font-medium">{deal.companyName}</div>
                    <div className="text-sm text-gray-500">{deal.geographicLocation}</div>
                  </div>
                </td>
                <td className="table-cell">
                  <span className="badge badge-gray">{deal.sector}</span>
                </td>
                <td className="table-cell">
                  <span className={`badge ${
                    deal.stage === 'sourcing' ? 'badge-gray' :
                    deal.stage === 'due_diligence' ? 'badge-warning' :
                    deal.stage === 'term_sheet' ? 'badge-primary' :
                    'badge-success'
                  }`}>
                    {deal.stage.replace('_', ' ')}
                  </span>
                </td>
                <td className="table-cell">{formatCurrency(deal.dealSize)}</td>
                <td className="table-cell">{formatCurrency(deal.valuation)}</td>
                <td className="table-cell">{deal.ownership}%</td>
                <td className="table-cell">{deal.leadPartner}</td>
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditItem(deal, 'deal')}
                      className="btn btn-ghost btn-xs"
                    >
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleAiAnalysis('investment_memo', deal)}
                      className="btn btn-ghost btn-xs"
                    >
                      <Brain className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(deal.id, 'deal')}
                      className="btn btn-ghost btn-xs text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render Portfolio
  const renderPortfolio = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 id="portfolio-tab" className="heading-3">Portfolio Companies</h2>
          <p className="text-caption">Monitor and manage portfolio performance</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadTemplate('portfolio')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="h-4 w-4" />
            Template
          </button>
          
          <label className="btn btn-secondary btn-sm cursor-pointer">
            <Upload className="h-4 w-4" />
            Import
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleImport(e, 'portfolio')}
              className="hidden"
            />
          </label>
          
          <button
            onClick={() => handleExport('portfolio')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          
          <button
            onClick={() => {
              setModalType('portfolio');
              setSelectedItem(null);
              setFormData({});
              setShowAddModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4" />
            Add Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search portfolio companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        
        <select
          value={filterSector}
          onChange={(e) => setFilterSector(e.target.value)}
          className="select w-full sm:w-48"
        >
          {sectors.map(sector => (
            <option key={sector} value={sector}>
              {sector === 'all' ? 'All Sectors' : sector}
            </option>
          ))}
        </select>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPortfolio.map((company) => (
          <div key={company.id} className="card card-padding">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="heading-5">{company.name}</h3>
                <span className="badge badge-gray mt-1">{company.sector}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge ${
                  company.status === 'performing' ? 'badge-success' :
                  company.status === 'monitoring' ? 'badge-warning' :
                  'badge-error'
                }`}>
                  {company.status}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEditItem(company, 'portfolio')}
                    className="btn btn-ghost btn-xs"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(company.id, 'portfolio')}
                    className="btn btn-ghost btn-xs text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Valuation</p>
                <p className="text-lg font-semibold">{formatCurrency(company.currentValuation)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ownership</p>
                <p className="text-lg font-semibold">{company.ownership}%</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-lg font-semibold">{formatCurrency(company.revenue)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">EBITDA</p>
                <p className="text-lg font-semibold">{formatCurrency(company.ebitda)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Revenue Growth</span>
                <span className={`font-medium ${company.keyMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {company.keyMetrics.revenueGrowth >= 0 ? '+' : ''}{company.keyMetrics.revenueGrowth}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">EBITDA Margin</span>
                <span className="font-medium">{company.keyMetrics.ebitdaMargin}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Employees</span>
                <span className="font-medium">{company.employees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Board Seats</span>
                <span className="font-medium">{company.boardSeats}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Investors
  const renderInvestors = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 id="investors-tab" className="heading-3">Limited Partners</h2>
          <p className="text-caption">Manage investor relationships and commitments</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleExport('investors')}
            className="btn btn-secondary btn-sm"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          
          <button
            onClick={() => {
              setModalType('investor');
              setSelectedItem(null);
              setFormData({});
              setShowAddModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Plus className="h-4 w-4" />
            Add Investor
          </button>
        </div>
      </div>

      {/* Investors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {investors.map((investor) => (
          <div key={investor.id} className="card card-padding">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="heading-5">{investor.name}</h3>
                <span className="badge badge-primary mt-1">{investor.type.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEditItem(investor, 'investor')}
                  className="btn btn-ghost btn-xs"
                >
                  <Edit className="h-3 w-3" />
                </button>
                <button
                  onClick={() => handleDeleteItem(investor.id, 'investor')}
                  className="btn btn-ghost btn-xs text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Commitment</span>
                <span className="font-semibold">{formatCurrency(investor.commitment)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Invested</span>
                <span className="font-semibold">{formatCurrency(investor.invested)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Distributions</span>
                <span className="font-semibold">{formatCurrency(investor.distributions)}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Users className="h-4 w-4" />
                <span>{investor.contactPerson}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Mail className="h-4 w-4" />
                <span>{investor.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Globe className="h-4 w-4" />
                <span>{investor.geography}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Documents
  const renderDocuments = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 id="documents-tab" className="heading-3">Document Management</h2>
          <p className="text-caption">AI-powered document analysis and storage</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAiAnalysis('term_sheet')}
            className="btn btn-secondary btn-sm"
          >
            <Brain className="h-4 w-4" />
            Analyze Term Sheet
          </button>
          
          <button
            onClick={() => handleAiAnalysis('financial_analysis')}
            className="btn btn-secondary btn-sm"
          >
            <Brain className="h-4 w-4" />
            Financial Analysis
          </button>
          
          <button
            onClick={() => handleAiAnalysis('due_diligence')}
            className="btn btn-primary btn-sm"
          >
            <Brain className="h-4 w-4" />
            DD Review
          </button>
        </div>
      </div>

      {/* Document Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card card-padding">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="h-6 w-6 text-blue-500" />
            <h3 className="heading-6">Term Sheets</h3>
          </div>
          <p className="text-caption mb-4">Investment term sheets and deal documents</p>
          <button
            onClick={() => handleAiAnalysis('term_sheet')}
            className="btn btn-primary btn-sm w-full"
          >
            <Brain className="h-4 w-4" />
            Upload & Analyze
          </button>
        </div>

        <div className="card card-padding">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-6 w-6 text-green-500" />
            <h3 className="heading-6">Financial Statements</h3>
          </div>
          <p className="text-caption mb-4">Company financials and performance reports</p>
          <button
            onClick={() => handleAiAnalysis('financial_analysis')}
            className="btn btn-primary btn-sm w-full"
          >
            <Brain className="h-4 w-4" />
            Upload & Analyze
          </button>
        </div>

        <div className="card card-padding">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-purple-500" />
            <h3 className="heading-6">Due Diligence</h3>
          </div>
          <p className="text-caption mb-4">DD reports and compliance documents</p>
          <button
            onClick={() => handleAiAnalysis('due_diligence')}
            className="btn btn-primary btn-sm w-full"
          >
            <Brain className="h-4 w-4" />
            Upload & Analyze
          </button>
        </div>
      </div>

      {/* AI Analysis Results */}
      {aiResult && (
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">AI Analysis Results</h3>
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-sm">{aiResult}</div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Settings
  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <div>
        <h2 className="heading-3">Settings</h2>
        <p className="text-caption">Manage system preferences and data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Management */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Data Management</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Fund Currency</label>
              <select className="select">
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Reporting Period</label>
              <select className="select">
                <option>Quarterly</option>
                <option>Monthly</option>
                <option>Annual</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (window.confirm('This will delete all data. Are you sure?')) {
                  localStorage.removeItem('pe_deals');
                  localStorage.removeItem('pe_portfolio');
                  localStorage.removeItem('pe_investors');
                  localStorage.removeItem('pe_documents');
                  setDeals([]);
                  setPortfolioCompanies([]);
                  setInvestors([]);
                  setDocuments([]);
                }
              }}
              className="btn btn-error w-full"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div className="card card-padding">
          <h3 className="heading-5 mb-4">Export Options</h3>
          <div className="space-y-4">
            <button
              onClick={() => handleExport('deals')}
              className="btn btn-secondary w-full"
            >
              <Download className="h-4 w-4" />
              Export All Deals
            </button>
            
            <button
              onClick={() => handleExport('portfolio')}
              className="btn btn-secondary w-full"
            >
              <Download className="h-4 w-4" />
              Export Portfolio Data
            </button>
            
            <button
              onClick={() => handleExport('investors')}
              className="btn btn-secondary w-full"
            >
              <Download className="h-4 w-4" />
              Export Investor Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Add/Edit Modal
  const renderModal = () => {
    if (!showAddModal) return null;

    const isEdit = !!selectedItem;
    const title = isEdit ? `Edit ${modalType}` : `Add ${modalType}`;

    return (
      <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="heading-5">{title}</h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="btn btn-ghost btn-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="modal-body">
            {modalType === 'deal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Sector</label>
                  <select
                    value={formData.sector || ''}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    className="select"
                  >
                    <option value="">Select sector</option>
                    {sectors.slice(1).map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Stage</label>
                  <select
                    value={formData.stage || 'sourcing'}
                    onChange={(e) => setFormData({...formData, stage: e.target.value})}
                    className="select"
                  >
                    <option value="sourcing">Sourcing</option>
                    <option value="due_diligence">Due Diligence</option>
                    <option value="term_sheet">Term Sheet</option>
                    <option value="closing">Closing</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Deal Size ($)</label>
                  <input
                    type="number"
                    value={formData.dealSize || ''}
                    onChange={(e) => setFormData({...formData, dealSize: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Valuation ($)</label>
                  <input
                    type="number"
                    value={formData.valuation || ''}
                    onChange={(e) => setFormData({...formData, valuation: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ownership (%)</label>
                  <input
                    type="number"
                    value={formData.ownership || ''}
                    onChange={(e) => setFormData({...formData, ownership: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Lead Partner</label>
                  <input
                    type="text"
                    value={formData.leadPartner || ''}
                    onChange={(e) => setFormData({...formData, leadPartner: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Geographic Location</label>
                  <input
                    type="text"
                    value={formData.geographicLocation || ''}
                    onChange={(e) => setFormData({...formData, geographicLocation: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="textarea"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {modalType === 'portfolio' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Sector</label>
                  <select
                    value={formData.sector || ''}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    className="select"
                  >
                    <option value="">Select sector</option>
                    {sectors.slice(1).map(sector => (
                      <option key={sector} value={sector}>{sector}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Investment Date</label>
                  <input
                    type="date"
                    value={formData.investmentDate || ''}
                    onChange={(e) => setFormData({...formData, investmentDate: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Initial Investment ($)</label>
                  <input
                    type="number"
                    value={formData.initialInvestment || ''}
                    onChange={(e) => setFormData({...formData, initialInvestment: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Current Valuation ($)</label>
                  <input
                    type="number"
                    value={formData.currentValuation || ''}
                    onChange={(e) => setFormData({...formData, currentValuation: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ownership (%)</label>
                  <input
                    type="number"
                    value={formData.ownership || ''}
                    onChange={(e) => setFormData({...formData, ownership: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Revenue ($)</label>
                  <input
                    type="number"
                    value={formData.revenue || ''}
                    onChange={(e) => setFormData({...formData, revenue: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">EBITDA ($)</label>
                  <input
                    type="number"
                    value={formData.ebitda || ''}
                    onChange={(e) => setFormData({...formData, ebitda: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Employees</label>
                  <input
                    type="number"
                    value={formData.employees || ''}
                    onChange={(e) => setFormData({...formData, employees: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'performing'}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="select"
                  >
                    <option value="performing">Performing</option>
                    <option value="monitoring">Monitoring</option>
                    <option value="concern">Concern</option>
                  </select>
                </div>
              </div>
            )}

            {modalType === 'investor' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Investor Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={formData.type || 'institutional'}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="select"
                  >
                    <option value="institutional">Institutional</option>
                    <option value="family_office">Family Office</option>
                    <option value="sovereign">Sovereign Fund</option>
                    <option value="pension">Pension Fund</option>
                    <option value="endowment">Endowment</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Commitment ($)</label>
                  <input
                    type="number"
                    value={formData.commitment || ''}
                    onChange={(e) => setFormData({...formData, commitment: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Invested ($)</label>
                  <input
                    type="number"
                    value={formData.invested || ''}
                    onChange={(e) => setFormData({...formData, invested: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Geography</label>
                  <input
                    type="text"
                    value={formData.geography || ''}
                    onChange={(e) => setFormData({...formData, geography: e.target.value})}
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowAddModal(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={isEdit ? handleUpdateItem : handleAddItem}
              className="btn btn-primary"
            >
              {isEdit ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render AI Modal
  const renderAiModal = () => {
    if (!showAiModal) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
        <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="heading-5">AI Document Analysis</h3>
            <button
              onClick={() => setShowAiModal(false)}
              className="btn btn-ghost btn-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="modal-body space-y-4">
            {/* File Upload */}
            <div className="form-group">
              <label className="form-label">Upload Document</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="input"
                accept=".pdf,.doc,.docx,.xlsx,.xls"
              />
              <p className="form-help">
                Upload term sheets, financial statements, or due diligence documents for AI analysis
              </p>
            </div>

            {/* Custom Prompt */}
            <div className="form-group">
              <label className="form-label">Analysis Instructions</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="textarea"
                rows={4}
                placeholder="Describe what you want the AI to analyze or extract from the document..."
              />
            </div>

            {/* AI Results */}
            {aiLoading && (
              <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Analyzing document...</span>
              </div>
            )}

            {aiError && (
              <div className="alert alert-error">
                <AlertCircle className="h-4 w-4" />
                <span>{aiError.message || 'An error occurred during analysis'}</span>
              </div>
            )}

            {aiResult && (
              <div className="card card-padding">
                <h4 className="heading-6 mb-2">Analysis Results</h4>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-sm">{aiResult}</div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowAiModal(false)}
              className="btn btn-secondary"
            >
              Close
            </button>
            <button
              onClick={handleSendToAi}
              disabled={aiLoading || (!aiPrompt?.trim() && !selectedFile)}
              className="btn btn-primary"
            >
              <Brain className="h-4 w-4" />
              Analyze with AI
            </button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'deals', name: 'Deal Pipeline', icon: Briefcase },
    { id: 'portfolio', name: 'Portfolio', icon: Building2 },
    { id: 'investors', name: 'Investors', icon: Users },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-ghost btn-sm lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <h1 className="heading-5">PE Portfolio Manager</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {currentUser?.first_name}
              </span>
              <button
                onClick={logout}
                className="btn btn-ghost btn-sm"
              >
                <ExternalLink className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full pt-16 lg:pt-0">
            <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
              <nav className="flex-1 px-4 py-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                        setSearchTerm('');
                        setFilterSector('all');
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'deals' && renderDeals()}
              {activeTab === 'portfolio' && renderPortfolio()}
              {activeTab === 'investors' && renderInvestors()}
              {activeTab === 'documents' && renderDocuments()}
              {activeTab === 'settings' && renderSettings()}
            </div>
          </main>
        </div>
      </div>

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Modals */}
      {renderModal()}
      {renderAiModal()}

      {/* Footer */}
      <footer className="bg-white border-t py-4">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-600">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;