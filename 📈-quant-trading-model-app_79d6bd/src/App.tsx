import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  TrendingUp, TrendingDown, DollarSign, BarChart3, Settings, Plus, 
  Download, Upload, Trash2, Edit, Play, Pause, Target, Brain,
  Calendar, Clock, Percent, ArrowUp, ArrowDown, AlertTriangle,
  PieChart, Activity, Zap, Shield, Database, FileText, Search,
  Filter, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, X,
  CheckCircle, XCircle, Info, Menu, LogOut, User, Moon, Sun
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, ComposedChart
} from 'recharts';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface TradingModel {
  id: string;
  name: string;
  type: 'momentum' | 'mean_reversion' | 'arbitrage' | 'ml' | 'custom';
  status: 'active' | 'inactive' | 'backtesting';
  returns: number;
  sharpe: number;
  maxDrawdown: number;
  winRate: number;
  createdAt: string;
  parameters: Record<string, any>;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface BacktestResult {
  id: string;
  modelId: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  equity: Array<{ date: string; value: number }>;
  trades: Array<{
    date: string;
    type: 'buy' | 'sell';
    symbol: string;
    price: number;
    quantity: number;
    pnl: number;
  }>;
}

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  cash: number;
  positions: Array<{
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    marketValue: number;
    pnl: number;
    pnlPercent: number;
  }>;
  performance: Array<{ date: string; value: number }>;
}

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  marketCap: number;
}

type AppPage = 'dashboard' | 'models' | 'backtesting' | 'portfolio' | 'analytics' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Core State
  const [currentPage, setCurrentPage] = useState<AppPage>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Trading State
  const [tradingModels, setTradingModels] = useState<TradingModel[]>([]);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  
  // UI State
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const [showBacktestForm, setShowBacktestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiAnalysis, setShowAiAnalysis] = useState(false);
  
  // Form State
  const [modelForm, setModelForm] = useState({
    name: '',
    type: 'momentum' as TradingModel['type'],
    description: '',
    riskLevel: 'medium' as TradingModel['riskLevel'],
    parameters: '{}'
  });
  
  const [backtestForm, setBacktestForm] = useState({
    modelId: '',
    startDate: '2023-01-01',
    endDate: '2024-12-31',
    initialCapital: 100000,
    commission: 0.001
  });

  // Initialize data
  useEffect(() => {
    loadData();
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const loadData = () => {
    const storedModels = localStorage.getItem('tradingModels');
    const storedBacktests = localStorage.getItem('backtestResults');
    const storedPortfolios = localStorage.getItem('portfolios');
    
    if (storedModels) {
      setTradingModels(JSON.parse(storedModels));
    } else {
      const defaultModels = generateDefaultModels();
      setTradingModels(defaultModels);
      localStorage.setItem('tradingModels', JSON.stringify(defaultModels));
    }
    
    if (storedBacktests) {
      setBacktestResults(JSON.parse(storedBacktests));
    } else {
      const defaultBacktests = generateDefaultBacktests();
      setBacktestResults(defaultBacktests);
      localStorage.setItem('backtestResults', JSON.stringify(defaultBacktests));
    }
    
    if (storedPortfolios) {
      setPortfolios(JSON.parse(storedPortfolios));
    } else {
      const defaultPortfolios = generateDefaultPortfolios();
      setPortfolios(defaultPortfolios);
      localStorage.setItem('portfolios', JSON.stringify(defaultPortfolios));
    }
    
    setMarketData(generateMarketData());
  };

  const generateDefaultModels = (): TradingModel[] => [
    {
      id: '1',
      name: 'Momentum RSI Strategy',
      type: 'momentum',
      status: 'active',
      returns: 23.4,
      sharpe: 1.85,
      maxDrawdown: -8.2,
      winRate: 68.5,
      createdAt: '2024-01-15',
      parameters: { rsi_period: 14, rsi_overbought: 70, rsi_oversold: 30 },
      description: 'RSI-based momentum strategy with trend following',
      riskLevel: 'medium'
    },
    {
      id: '2',
      name: 'Mean Reversion MACD',
      type: 'mean_reversion',
      status: 'active',
      returns: 18.7,
      sharpe: 1.42,
      maxDrawdown: -12.1,
      winRate: 72.3,
      createdAt: '2024-02-01',
      parameters: { fast_ema: 12, slow_ema: 26, signal: 9 },
      description: 'MACD-based mean reversion with volume confirmation',
      riskLevel: 'low'
    },
    {
      id: '3',
      name: 'ML Random Forest',
      type: 'ml',
      status: 'backtesting',
      returns: 31.2,
      sharpe: 2.1,
      maxDrawdown: -15.8,
      winRate: 65.4,
      createdAt: '2024-03-10',
      parameters: { n_estimators: 100, max_depth: 10, features: 20 },
      description: 'Machine learning model using technical indicators',
      riskLevel: 'high'
    }
  ];

  const generateDefaultBacktests = (): BacktestResult[] => [
    {
      id: '1',
      modelId: '1',
      startDate: '2023-01-01',
      endDate: '2024-06-05',
      totalReturn: 23.4,
      annualizedReturn: 18.2,
      volatility: 12.5,
      sharpeRatio: 1.85,
      maxDrawdown: -8.2,
      winRate: 68.5,
      totalTrades: 156,
      profitFactor: 1.92,
      equity: Array.from({ length: 365 }, (_, i) => ({
        date: new Date(2023, 0, i + 1).toISOString().split('T')[0],
        value: 100000 * (1 + (Math.random() * 0.4 - 0.1) + (i / 365) * 0.234)
      })),
      trades: []
    }
  ];

  const generateDefaultPortfolios = (): Portfolio[] => [
    {
      id: '1',
      name: 'Main Portfolio',
      totalValue: 1250000,
      cash: 150000,
      positions: [
        {
          symbol: 'AAPL',
          quantity: 500,
          avgPrice: 150.25,
          currentPrice: 185.30,
          marketValue: 92650,
          pnl: 17525,
          pnlPercent: 23.3
        },
        {
          symbol: 'TSLA',
          quantity: 200,
          avgPrice: 220.50,
          currentPrice: 198.75,
          marketValue: 39750,
          pnl: -4350,
          pnlPercent: -9.9
        },
        {
          symbol: 'NVDA',
          quantity: 100,
          avgPrice: 425.80,
          currentPrice: 892.15,
          marketValue: 89215,
          pnl: 46635,
          pnlPercent: 109.5
        }
      ],
      performance: Array.from({ length: 90 }, (_, i) => ({
        date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: 1000000 + Math.random() * 300000 + i * 2500
      }))
    }
  ];

  const generateMarketData = (): MarketData[] => [
    { symbol: 'SPY', price: 521.30, change: 2.45, changePercent: 0.47, volume: 45623000, high: 522.15, low: 518.20, marketCap: 0 },
    { symbol: 'QQQ', price: 431.85, change: -1.25, changePercent: -0.29, volume: 32156000, high: 433.50, low: 430.10, marketCap: 0 },
    { symbol: 'AAPL', price: 185.30, change: 3.25, changePercent: 1.78, volume: 52341000, high: 186.20, low: 182.15, marketCap: 2890000000000 },
    { symbol: 'TSLA', price: 198.75, change: -5.60, changePercent: -2.74, volume: 89456000, high: 205.30, low: 197.85, marketCap: 635000000000 }
  ];

  const saveData = () => {
    localStorage.setItem('tradingModels', JSON.stringify(tradingModels));
    localStorage.setItem('backtestResults', JSON.stringify(backtestResults));
    localStorage.setItem('portfolios', JSON.stringify(portfolios));
  };

  const createModel = () => {
    try {
      const parameters = JSON.parse(modelForm.parameters || '{}');
      const newModel: TradingModel = {
        id: Date.now().toString(),
        name: modelForm.name,
        type: modelForm.type,
        status: 'inactive',
        returns: 0,
        sharpe: 0,
        maxDrawdown: 0,
        winRate: 0,
        createdAt: new Date().toISOString().split('T')[0],
        parameters,
        description: modelForm.description,
        riskLevel: modelForm.riskLevel
      };
      
      const updatedModels = [...tradingModels, newModel];
      setTradingModels(updatedModels);
      localStorage.setItem('tradingModels', JSON.stringify(updatedModels));
      
      setShowModelForm(false);
      setModelForm({ name: '', type: 'momentum', description: '', riskLevel: 'medium', parameters: '{}' });
    } catch (error) {
      console.error('Error creating model:', error);
    }
  };

  const runBacktest = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const model = tradingModels.find(m => m.id === backtestForm.modelId);
      if (!model) return;
      
      const result: BacktestResult = {
        id: Date.now().toString(),
        modelId: backtestForm.modelId,
        startDate: backtestForm.startDate,
        endDate: backtestForm.endDate,
        totalReturn: Math.random() * 40 - 10,
        annualizedReturn: Math.random() * 30 - 5,
        volatility: Math.random() * 20 + 5,
        sharpeRatio: Math.random() * 3,
        maxDrawdown: -(Math.random() * 25 + 5),
        winRate: Math.random() * 40 + 50,
        totalTrades: Math.floor(Math.random() * 200 + 50),
        profitFactor: Math.random() * 2 + 0.5,
        equity: Array.from({ length: 252 }, (_, i) => ({
          date: new Date(new Date(backtestForm.startDate).getTime() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          value: backtestForm.initialCapital * (1 + (Math.random() * 0.4 - 0.1) + (i / 252) * 0.15)
        })),
        trades: []
      };
      
      const updatedResults = [...backtestResults, result];
      setBacktestResults(updatedResults);
      localStorage.setItem('backtestResults', JSON.stringify(updatedResults));
      
      setShowBacktestForm(false);
      setIsLoading(false);
    }, 3000);
  };

  const handleAIAnalysis = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please enter a prompt for market analysis');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    const enhancedPrompt = `As a quantitative trading expert, analyze the following market scenario and provide insights in JSON format with keys "analysis", "risk_assessment", "recommendations", "key_metrics": ${aiPrompt}`;
    
    try {
      aiLayerRef.current?.sendToAI(enhancedPrompt);
    } catch (error) {
      setAiError('Failed to process AI analysis request');
    }
  };

  const exportData = () => {
    const data = {
      models: tradingModels,
      backtests: backtestResults,
      portfolios: portfolios,
      exportDate: new Date().toISOString()
    };
    
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any): string => {
    const headers = ['Type', 'Name', 'Value', 'Date', 'Status'];
    let csv = headers.join(',') + '\n';
    
    data.models.forEach((model: TradingModel) => {
      csv += `Model,${model.name},${model.returns}%,${model.createdAt},${model.status}\n`;
    });
    
    data.backtests.forEach((backtest: BacktestResult) => {
      csv += `Backtest,${backtest.modelId},${backtest.totalReturn}%,${backtest.startDate},Completed\n`;
    });
    
    return csv;
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Simple CSV parsing - in production, use a proper CSV parser
        console.log('Imported data:', content);
      } catch (error) {
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    localStorage.removeItem('tradingModels');
    localStorage.removeItem('backtestResults');
    localStorage.removeItem('portfolios');
    setTradingModels([]);
    setBacktestResults([]);
    setPortfolios([]);
  };

  const filteredModels = tradingModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || model.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + p.totalValue, 0);
  const totalPnL = portfolios.reduce((sum, p) => 
    sum + p.positions.reduce((posSum, pos) => posSum + pos.pnl, 0), 0
  );
  const totalPnLPercent = totalPortfolioValue > 0 ? (totalPnL / (totalPortfolioValue - totalPnL)) * 100 : 0;

  const pieData = [
    { name: 'Active Models', value: tradingModels.filter(m => m.status === 'active').length, color: '#10b981' },
    { name: 'Inactive Models', value: tradingModels.filter(m => m.status === 'inactive').length, color: '#6b7280' },
    { name: 'Backtesting', value: tradingModels.filter(m => m.status === 'backtesting').length, color: '#f59e0b' }
  ];

  const performanceData = portfolios[0]?.performance?.slice(-30) || [];

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className={`min-h-screen bg-slate-900 text-white ${styles.app}`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700 transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">QuantTrader</h1>
                <p className="text-xs text-slate-400">Trading Analytics</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {[
            { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
            { id: 'models', icon: Brain, label: 'Models' },
            { id: 'backtesting', icon: Activity, label: 'Backtesting' },
            { id: 'portfolio', icon: PieChart, label: 'Portfolio' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              id={id === 'dashboard' ? 'generation_issue_fallback' : undefined}
              onClick={() => setCurrentPage(id as AppPage)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                currentPage === id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {!sidebarCollapsed && <span>{label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-slate-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold capitalize">{currentPage}</h2>
              <p className="text-slate-400 text-sm">Welcome back, {currentUser.first_name}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{currentUser.username}</span>
              </div>
              
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="p-6">
          {currentPage === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Portfolio Value</p>
                      <p className="text-2xl font-bold">${totalPortfolioValue.toLocaleString()}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total P&L</p>
                      <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        ${totalPnL.toLocaleString()}
                      </p>
                      <p className={`text-sm ${totalPnLPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%
                      </p>
                    </div>
                    {totalPnL >= 0 ? <TrendingUp className="w-8 h-8 text-green-500" /> : <TrendingDown className="w-8 h-8 text-red-500" />}
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Models</p>
                      <p className="text-2xl font-bold">{tradingModels.filter(m => m.status === 'active').length}</p>
                    </div>
                    <Brain className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Avg Sharpe Ratio</p>
                      <p className="text-2xl font-bold">
                        {(tradingModels.reduce((sum, m) => sum + m.sharpe, 0) / tradingModels.length || 0).toFixed(2)}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
              
              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Portfolio Performance (30D)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h3 className="text-lg font-semibold mb-4">Model Status Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Market Data */}
              <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left p-3">Symbol</th>
                        <th className="text-left p-3">Price</th>
                        <th className="text-left p-3">Change</th>
                        <th className="text-left p-3">Volume</th>
                        <th className="text-left p-3">High/Low</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketData.map((stock, index) => (
                        <tr key={index} className="border-b border-slate-700">
                          <td className="p-3 font-semibold">{stock.symbol}</td>
                          <td className="p-3">${stock.price.toFixed(2)}</td>
                          <td className={`p-3 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                          </td>
                          <td className="p-3">{stock.volume.toLocaleString()}</td>
                          <td className="p-3">${stock.high.toFixed(2)} / ${stock.low.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {currentPage === 'models' && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Trading Models</h3>
                <button
                  id="create-model-btn"
                  onClick={() => setShowModelForm(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Model
                </button>
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2"
                >
                  <option value="all">All Types</option>
                  <option value="momentum">Momentum</option>
                  <option value="mean_reversion">Mean Reversion</option>
                  <option value="arbitrage">Arbitrage</option>
                  <option value="ml">Machine Learning</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              {/* Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModels.map((model) => (
                  <div key={model.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{model.name}</h4>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          model.status === 'active' ? 'bg-green-600' :
                          model.status === 'inactive' ? 'bg-gray-600' : 'bg-yellow-600'
                        }`}>
                          {model.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-1 text-slate-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-slate-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-4">{model.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Returns</p>
                        <p className={`font-semibold ${model.returns >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {model.returns >= 0 ? '+' : ''}{model.returns.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Sharpe</p>
                        <p className="font-semibold">{model.sharpe.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Max DD</p>
                        <p className="font-semibold text-red-500">{model.maxDrawdown.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Win Rate</p>
                        <p className="font-semibold">{model.winRate.toFixed(1)}%</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded text-sm transition-colors">
                        Backtest
                      </button>
                      <button className={`flex-1 py-2 rounded text-sm transition-colors ${
                        model.status === 'active' 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}>
                        {model.status === 'active' ? 'Stop' : 'Start'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {currentPage === 'backtesting' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Backtesting Results</h3>
                <button
                  id="run-backtest-btn"
                  onClick={() => setShowBacktestForm(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Play className="w-4 h-4" />
                  Run Backtest
                </button>
              </div>
              
              {backtestResults.map((result) => {
                const model = tradingModels.find(m => m.id === result.modelId);
                return (
                  <div key={result.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{model?.name || 'Unknown Model'}</h4>
                        <p className="text-slate-400">{result.startDate} to {result.endDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                      <div>
                        <p className="text-slate-400 text-sm">Total Return</p>
                        <p className={`font-semibold ${result.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Annual Return</p>
                        <p className="font-semibold">{result.annualizedReturn.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Sharpe Ratio</p>
                        <p className="font-semibold">{result.sharpeRatio.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Max Drawdown</p>
                        <p className="font-semibold text-red-500">{result.maxDrawdown.toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Win Rate</p>
                        <p className="font-semibold">{result.winRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Trades</p>
                        <p className="font-semibold">{result.totalTrades}</p>
                      </div>
                    </div>
                    
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={result.equity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                            labelStyle={{ color: '#f3f4f6' }}
                          />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {currentPage === 'portfolio' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Portfolio Management</h3>
              
              {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h4 className="font-semibold text-lg">{portfolio.name}</h4>
                      <p className="text-slate-400">Total Value: ${portfolio.totalValue.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Cash</p>
                      <p className="font-semibold">${portfolio.cash.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-700">
                          <th className="text-left p-3">Symbol</th>
                          <th className="text-left p-3">Quantity</th>
                          <th className="text-left p-3">Avg Price</th>
                          <th className="text-left p-3">Current Price</th>
                          <th className="text-left p-3">Market Value</th>
                          <th className="text-left p-3">P&L</th>
                          <th className="text-left p-3">P&L %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.positions.map((position, index) => (
                          <tr key={index} className="border-b border-slate-700">
                            <td className="p-3 font-semibold">{position.symbol}</td>
                            <td className="p-3">{position.quantity}</td>
                            <td className="p-3">${position.avgPrice.toFixed(2)}</td>
                            <td className="p-3">${position.currentPrice.toFixed(2)}</td>
                            <td className="p-3">${position.marketValue.toLocaleString()}</td>
                            <td className={`p-3 ${position.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                            </td>
                            <td className={`p-3 ${position.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {currentPage === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">AI Market Analysis</h3>
                <button
                  id="ai-analysis-btn"
                  onClick={() => setShowAiAnalysis(true)}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  AI Analysis
                </button>
              </div>
              
              {/* AI Analysis Section */}
              {showAiAnalysis && (
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="font-semibold mb-4">AI Market Analysis</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Analysis Prompt</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Enter your market analysis question (e.g., 'Analyze current market conditions for tech stocks')"
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 h-24 resize-none"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleAIAnalysis}
                        disabled={aiLoading}
                        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 px-4 py-2 rounded-lg transition-colors"
                      >
                        {aiLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4" />
                        )}
                        {aiLoading ? 'Analyzing...' : 'Analyze'}
                      </button>
                      
                      <button
                        onClick={() => {
                          setShowAiAnalysis(false);
                          setAiPrompt('');
                          setAiResult(null);
                          setAiError(null);
                        }}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        Close
                      </button>
                    </div>
                    
                    {aiError && (
                      <div className="bg-red-900 border border-red-700 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-500" />
                          <p className="text-red-200">Error: {aiError.toString()}</p>
                        </div>
                      </div>
                    )}
                    
                    {aiResult && (
                      <div className="bg-slate-900 border border-slate-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <h5 className="font-medium">AI Analysis Result</h5>
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <pre className="whitespace-pre-wrap text-sm bg-slate-800 p-4 rounded border">
                            {aiResult}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Performance Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="font-semibold mb-4">Model Performance Comparison</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tradingModels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Legend />
                      <Bar dataKey="returns" fill="#3b82f6" name="Returns (%)" />
                      <Bar dataKey="sharpe" fill="#10b981" name="Sharpe Ratio" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="font-semibold mb-4">Risk Analysis</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={tradingModels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                        labelStyle={{ color: '#f3f4f6' }}
                      />
                      <Legend />
                      <Bar dataKey="maxDrawdown" fill="#ef4444" name="Max Drawdown (%)" />
                      <Bar dataKey="winRate" fill="#f59e0b" name="Win Rate (%)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
          
          {currentPage === 'settings' && (
            <div className="space-y-6">
              <h3 id="settings-page" className="text-xl font-semibold">Settings</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Data Management */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="font-semibold mb-4">Data Management</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Export Data</label>
                      <button
                        onClick={exportData}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export to CSV
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Import Data</label>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={importData}
                        className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Clear All Data</label>
                      <button
                        onClick={clearAllData}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear All Data
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* App Preferences */}
                <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                  <h4 className="font-semibold mb-4">Preferences</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Theme</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            isDarkMode ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                          {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Auto-refresh Data</label>
                      <select className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
                        <option>Every 5 minutes</option>
                        <option>Every 15 minutes</option>
                        <option>Every 30 minutes</option>
                        <option>Never</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Default Risk Level</label>
                      <select className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Model Form Modal */}
      {showModelForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Trading Model</h3>
              <button
                onClick={() => setShowModelForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Model Name</label>
                <input
                  type="text"
                  value={modelForm.name}
                  onChange={(e) => setModelForm({...modelForm, name: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                  placeholder="Enter model name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Model Type</label>
                <select
                  value={modelForm.type}
                  onChange={(e) => setModelForm({...modelForm, type: e.target.value as TradingModel['type']})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                >
                  <option value="momentum">Momentum</option>
                  <option value="mean_reversion">Mean Reversion</option>
                  <option value="arbitrage">Arbitrage</option>
                  <option value="ml">Machine Learning</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={modelForm.description}
                  onChange={(e) => setModelForm({...modelForm, description: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 h-20 resize-none"
                  placeholder="Model description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Risk Level</label>
                <select
                  value={modelForm.riskLevel}
                  onChange={(e) => setModelForm({...modelForm, riskLevel: e.target.value as TradingModel['riskLevel']})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Parameters (JSON)</label>
                <textarea
                  value={modelForm.parameters}
                  onChange={(e) => setModelForm({...modelForm, parameters: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 h-20 resize-none font-mono text-sm"
                  placeholder='{"param1": "value1", "param2": "value2"}'
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={createModel}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors"
              >
                Create Model
              </button>
              <button
                onClick={() => setShowModelForm(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Backtest Form Modal */}
      {showBacktestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Run Backtest</h3>
              <button
                onClick={() => setShowBacktestForm(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Select Model</label>
                <select
                  value={backtestForm.modelId}
                  onChange={(e) => setBacktestForm({...backtestForm, modelId: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                >
                  <option value="">Select a model</option>
                  {tradingModels.map((model) => (
                    <option key={model.id} value={model.id}>{model.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    value={backtestForm.startDate}
                    onChange={(e) => setBacktestForm({...backtestForm, startDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    value={backtestForm.endDate}
                    onChange={(e) => setBacktestForm({...backtestForm, endDate: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Initial Capital</label>
                <input
                  type="number"
                  value={backtestForm.initialCapital}
                  onChange={(e) => setBacktestForm({...backtestForm, initialCapital: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                  placeholder="100000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Commission Rate</label>
                <input
                  type="number"
                  step="0.0001"
                  value={backtestForm.commission}
                  onChange={(e) => setBacktestForm({...backtestForm, commission: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2"
                  placeholder="0.001"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={runBacktest}
                disabled={isLoading || !backtestForm.modelId}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Backtest
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBacktestForm(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 p-4 text-center text-slate-400 text-sm">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;