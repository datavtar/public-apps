import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, LogOut, TrendingUp, TrendingDown, DollarSign, Users, Package,
  Calendar, Filter, Download, Upload, Settings, BarChart3, PieChart,
  Search, Plus, Edit, Trash2, Eye, FileText, Star, Target, Globe,
  Crown, Heart, Ring, Gem, ShoppingBag, Calculator, Clock, Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell } from 'recharts';
import styles from './styles/styles.module.css';

interface CustomerDemographic {
  id: string;
  ageGroup: string;
  gender: string;
  income: string;
  location: string;
  purchaseFrequency: string;
  preferredStyle: string;
  averageSpend: number;
  lastPurchase: string;
}

interface ProductPerformance {
  id: string;
  category: string;
  name: string;
  salesCount: number;
  revenue: number;
  averageRating: number;
  returnRate: number;
  profitMargin: number;
  seasonalTrend: string;
}

interface MarketTrend {
  id: string;
  period: string;
  category: string;
  demandIndex: number;
  pricePoint: number;
  competitorAnalysis: string;
  marketShare: number;
}

interface CustomerFeedback {
  id: string;
  customerId: string;
  rating: number;
  review: string;
  category: string;
  date: string;
  sentiment: string;
}

type ViewType = 'dashboard' | 'demographics' | 'products' | 'trends' | 'feedback' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // AI States
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  // App States
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30days');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<string>('');
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Data States
  const [demographics, setDemographics] = useState<CustomerDemographic[]>([]);
  const [products, setProducts] = useState<ProductPerformance[]>([]);
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [feedback, setFeedback] = useState<CustomerFeedback[]>([]);

  // Initialize data
  useEffect(() => {
    loadData();
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const loadData = () => {
    const savedDemographics = localStorage.getItem('jewelryDemographics');
    const savedProducts = localStorage.getItem('jewelryProducts');
    const savedTrends = localStorage.getItem('jewelryTrends');
    const savedFeedback = localStorage.getItem('jewelryFeedback');

    if (savedDemographics) {
      setDemographics(JSON.parse(savedDemographics));
    } else {
      setDemographics(generateDemoData().demographics);
    }

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      setProducts(generateDemoData().products);
    }

    if (savedTrends) {
      setTrends(JSON.parse(savedTrends));
    } else {
      setTrends(generateDemoData().trends);
    }

    if (savedFeedback) {
      setFeedback(JSON.parse(savedFeedback));
    } else {
      setFeedback(generateDemoData().feedback);
    }
  };

  const generateDemoData = () => {
    const demographics: CustomerDemographic[] = [
      {
        id: '1',
        ageGroup: '25-35',
        gender: 'Female',
        income: '$50,000-$75,000',
        location: 'Urban',
        purchaseFrequency: 'Quarterly',
        preferredStyle: 'Contemporary',
        averageSpend: 850,
        lastPurchase: '2025-05-15'
      },
      {
        id: '2',
        ageGroup: '35-45',
        gender: 'Female',
        income: '$75,000-$100,000',
        location: 'Suburban',
        purchaseFrequency: 'Bi-annually',
        preferredStyle: 'Classic',
        averageSpend: 1200,
        lastPurchase: '2025-04-20'
      },
      {
        id: '3',
        ageGroup: '45-55',
        gender: 'Male',
        income: '$100,000+',
        location: 'Urban',
        purchaseFrequency: 'Annually',
        preferredStyle: 'Luxury',
        averageSpend: 2500,
        lastPurchase: '2025-03-10'
      }
    ];

    const products: ProductPerformance[] = [
      {
        id: '1',
        category: 'Rings',
        name: '14K Gold Solitaire Ring',
        salesCount: 156,
        revenue: 124800,
        averageRating: 4.8,
        returnRate: 2.1,
        profitMargin: 45,
        seasonalTrend: 'Peak in Q4'
      },
      {
        id: '2',
        category: 'Necklaces',
        name: '14K Gold Chain Necklace',
        salesCount: 203,
        revenue: 89320,
        averageRating: 4.6,
        returnRate: 1.8,
        profitMargin: 38,
        seasonalTrend: 'Steady'
      },
      {
        id: '3',
        category: 'Earrings',
        name: '14K Gold Stud Earrings',
        salesCount: 298,
        revenue: 76480,
        averageRating: 4.9,
        returnRate: 0.9,
        profitMargin: 42,
        seasonalTrend: 'Peak in Q2'
      }
    ];

    const trends: MarketTrend[] = [
      {
        id: '1',
        period: '2025-Q1',
        category: 'Minimalist Jewelry',
        demandIndex: 87,
        pricePoint: 650,
        competitorAnalysis: 'Growing demand',
        marketShare: 23
      },
      {
        id: '2',
        period: '2025-Q1',
        category: 'Statement Pieces',
        demandIndex: 72,
        pricePoint: 1250,
        competitorAnalysis: 'Stable market',
        marketShare: 18
      },
      {
        id: '3',
        period: '2025-Q1',
        category: 'Vintage Style',
        demandIndex: 94,
        pricePoint: 980,
        competitorAnalysis: 'High demand',
        marketShare: 31
      }
    ];

    const feedback: CustomerFeedback[] = [
      {
        id: '1',
        customerId: 'CUST001',
        rating: 5,
        review: 'Beautiful craftsmanship and excellent quality. The 14k gold has perfect color and the design is elegant.',
        category: 'Quality',
        date: '2025-05-20',
        sentiment: 'Positive'
      },
      {
        id: '2',
        customerId: 'CUST002',
        rating: 4,
        review: 'Love the style but wish there were more size options available.',
        category: 'Product Range',
        date: '2025-05-18',
        sentiment: 'Neutral'
      },
      {
        id: '3',
        customerId: 'CUST003',
        rating: 5,
        review: 'Exceptional service and the jewelry exceeded my expectations. Will definitely return for more purchases.',
        category: 'Service',
        date: '2025-05-15',
        sentiment: 'Positive'
      }
    ];

    return { demographics, products, trends, feedback };
  };

  const saveData = () => {
    localStorage.setItem('jewelryDemographics', JSON.stringify(demographics));
    localStorage.setItem('jewelryProducts', JSON.stringify(products));
    localStorage.setItem('jewelryTrends', JSON.stringify(trends));
    localStorage.setItem('jewelryFeedback', JSON.stringify(feedback));
  };

  useEffect(() => {
    saveData();
  }, [demographics, products, trends, feedback]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  const handleAIAnalysis = (type: string, data?: any) => {
    let prompt = '';
    switch (type) {
      case 'feedback':
        prompt = `Analyze the following customer feedback for 14k gold jewelry and provide insights in JSON format with keys "overall_sentiment", "key_themes", "improvement_areas", "strengths": ${JSON.stringify(feedback)}`;
        break;
      case 'trends':
        prompt = `Analyze market trends for 14k gold jewelry and provide strategic recommendations in JSON format with keys "growth_opportunities", "risk_factors", "pricing_strategy", "market_positioning": ${JSON.stringify(trends)}`;
        break;
      case 'demographics':
        prompt = `Analyze customer demographics for 14k gold jewelry business and provide targeting insights in JSON format with keys "primary_segments", "growth_segments", "marketing_recommendations", "product_focus": ${JSON.stringify(demographics)}`;
        break;
      default:
        prompt = promptText;
    }

    if (!prompt.trim()) {
      setAiError('Please provide a prompt for AI analysis.');
      return;
    }

    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
  };

  const exportData = () => {
    const allData = {
      demographics,
      products,
      trends,
      feedback,
      exportDate: new Date().toISOString()
    };
    
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '14k-gold-jewelry-insights.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSVContent = () => {
    let csv = 'Type,Category,Details,Value,Date\n';
    
    demographics.forEach(d => {
      csv += `Demographics,${d.ageGroup},"${d.gender} - ${d.income}",${d.averageSpend},${d.lastPurchase}\n`;
    });
    
    products.forEach(p => {
      csv += `Product,${p.category},"${p.name}",${p.revenue},${new Date().toISOString().split('T')[0]}\n`;
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
        // Handle CSV parsing here
        console.log('Imported content:', content);
        // For demo, just show success message
        alert('Data imported successfully!');
      } catch (error) {
        setAiError('Failed to import data. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'Type,Category,Details,Value,Date\nProduct,Rings,"Sample Ring",1000,2025-06-05\nDemographics,25-35,"Female - $50000",800,2025-06-05';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jewelry-insights-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderDashboard = () => {
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const totalSales = products.reduce((sum, p) => sum + p.salesCount, 0);
    const avgRating = products.reduce((sum, p) => sum + p.averageRating, 0) / products.length;
    const activeCustomers = demographics.length;

    const chartData = products.map(p => ({
      name: p.name.substring(0, 15),
      sales: p.salesCount,
      revenue: p.revenue / 1000
    }));

    const trendData = trends.map(t => ({
      category: t.category,
      demand: t.demandIndex,
      price: t.pricePoint
    }));

    const pieData = [
      { name: 'Rings', value: 40, color: '#8884d8' },
      { name: 'Necklaces', value: 30, color: '#82ca9d' },
      { name: 'Earrings', value: 20, color: '#ffc658' },
      { name: 'Bracelets', value: 10, color: '#ff7300' }
    ];

    return (
      <div className="space-y-6" id="welcome_fallback">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Crown className="w-8 h-8 text-yellow-500" />
            14K Gold Jewelry Insights
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAIAnalysis('trends')}
              className="btn btn-primary flex items-center gap-2"
              id="ai_analysis_trigger"
            >
              <Target className="w-4 h-4" />
              AI Analysis
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card" id="revenue_stat">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Total Revenue</div>
                <div className="stat-value">${(totalRevenue / 1000).toFixed(0)}K</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  +12% from last month
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Total Sales</div>
                <div className="stat-value">{totalSales}</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  +8% from last month
                </div>
              </div>
              <Package className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Avg Rating</div>
                <div className="stat-value">{avgRating.toFixed(1)}</div>
                <div className="stat-desc flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Excellent quality
                </div>
              </div>
              <Award className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <div className="stat-title">Active Customers</div>
                <div className="stat-value">{activeCustomers}</div>
                <div className="stat-desc flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Growing base
                </div>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Product Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" name="Sales Count" />
                <Bar dataKey="revenue" fill="#82ca9d" name="Revenue (K)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Category Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Tooltip />
                <RechartsPieChart data={pieData}>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </RechartsPieChart>
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="demand" stroke="#8884d8" name="Demand Index" />
              <Line type="monotone" dataKey="price" stroke="#82ca9d" name="Price Point" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI Results */}
        {(aiResult || aiError || isLoading) && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              AI Insights
            </h3>
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>Analyzing data...</span>
              </div>
            )}
            {aiError && (
              <div className="alert alert-error">
                <span>Error: {aiError}</span>
              </div>
            )}
            {aiResult && (
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDemographics = () => {
    const filteredData = demographics.filter(d => 
      searchTerm === '' || 
      d.ageGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.gender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.preferredStyle.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Customer Demographics
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAIAnalysis('demographics')}
              className="btn btn-primary flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Analyze Demographics
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search demographics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        <div className="table-container" id="demographics_table">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Age Group</th>
                <th className="table-header">Gender</th>
                <th className="table-header">Income</th>
                <th className="table-header">Location</th>
                <th className="table-header">Style Preference</th>
                <th className="table-header">Avg Spend</th>
                <th className="table-header">Frequency</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredData.map((demo) => (
                <tr key={demo.id}>
                  <td className="table-cell font-medium">{demo.ageGroup}</td>
                  <td className="table-cell">{demo.gender}</td>
                  <td className="table-cell">{demo.income}</td>
                  <td className="table-cell">{demo.location}</td>
                  <td className="table-cell">{demo.preferredStyle}</td>
                  <td className="table-cell font-semibold">${demo.averageSpend}</td>
                  <td className="table-cell">{demo.purchaseFrequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(aiResult || aiError || isLoading) && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">AI Demographics Analysis</h3>
            {isLoading && <div className="animate-pulse bg-gray-200 dark:bg-slate-700 h-20 rounded"></div>}
            {aiError && <div className="alert alert-error">{aiError}</div>}
            {aiResult && (
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProducts = () => {
    const filteredProducts = products.filter(p => 
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      (searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            Product Performance
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input w-full sm:w-auto"
          >
            <option value="all">All Categories</option>
            <option value="Rings">Rings</option>
            <option value="Necklaces">Necklaces</option>
            <option value="Earrings">Earrings</option>
            <option value="Bracelets">Bracelets</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="products_grid">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                <span className="badge badge-info">{product.category}</span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Sales:</span>
                  <span className="font-medium">{product.salesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Revenue:</span>
                  <span className="font-medium">${product.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Rating:</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{product.averageRating}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Profit Margin:</span>
                  <span className="font-medium text-green-600">{product.profitMargin}%</span>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-gray-500 dark:text-slate-400">{product.seasonalTrend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Market Trends
          </h2>
          <button
            onClick={() => handleAIAnalysis('trends')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Analyze Trends
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trends.map((trend) => (
            <div key={trend.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{trend.category}</h3>
                <span className="badge badge-info">{trend.period}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Demand Index:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-slate-600 rounded-full">
                      <div 
                        className="h-2 bg-blue-500 rounded-full" 
                        style={{ width: `${trend.demandIndex}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{trend.demandIndex}</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Price Point:</span>
                  <span className="font-medium">${trend.pricePoint}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-slate-400">Market Share:</span>
                  <span className="font-medium text-green-600">{trend.marketShare}%</span>
                </div>
                
                <div className="pt-2 border-t border-gray-200 dark:border-slate-600">
                  <p className="text-sm text-gray-600 dark:text-slate-400">{trend.competitorAnalysis}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(aiResult || aiError || isLoading) && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">AI Trend Analysis</h3>
            {isLoading && <div className="animate-pulse bg-gray-200 dark:bg-slate-700 h-20 rounded"></div>}
            {aiError && <div className="alert alert-error">{aiError}</div>}
            {aiResult && (
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFeedback = () => {
    const filteredFeedback = feedback.filter(f => 
      searchTerm === '' || 
      f.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Customer Feedback
          </h2>
          <button
            onClick={() => handleAIAnalysis('feedback')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Analyze Feedback
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
        </div>

        <div className="space-y-4" id="feedback_list">
          {filteredFeedback.map((fb) => (
            <div key={fb.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < fb.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-slate-400">{fb.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge ${
                    fb.sentiment === 'Positive' ? 'badge-success' : 
                    fb.sentiment === 'Negative' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {fb.sentiment}
                  </span>
                  <span className="badge badge-info">{fb.category}</span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-slate-300 text-sm">{fb.review}</p>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-600">
                <span className="text-xs text-gray-500 dark:text-slate-400">Customer ID: {fb.customerId}</span>
              </div>
            </div>
          ))}
        </div>

        {(aiResult || aiError || isLoading) && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">AI Feedback Analysis</h3>
            {isLoading && <div className="animate-pulse bg-gray-200 dark:bg-slate-700 h-20 rounded"></div>}
            {aiError && <div className="alert alert-error">{aiError}</div>}
            {aiResult && (
              <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Settings
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Theme Settings */}
          <div className="card" id="theme_settings">
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-slate-300">Dark Mode</span>
                <button
                  className="theme-toggle"
                  onClick={toggleDarkMode}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  <span className="theme-toggle-thumb"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Data Management</h3>
            <div className="space-y-3">
              <button
                onClick={exportData}
                className="btn bg-green-600 text-white hover:bg-green-700 w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".csv"
                  onChange={importData}
                  className="hidden"
                  id="importFile"
                />
                <label
                  htmlFor="importFile"
                  className="btn bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Import Data
                </label>
              </div>
              
              <button
                onClick={downloadTemplate}
                className="btn bg-gray-600 text-white hover:bg-gray-700 w-full flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download Template
              </button>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">AI Analysis</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Custom Analysis Prompt</label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter your custom analysis prompt..."
                  className="input h-24 resize-none"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Upload Document for Analysis</label>
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="input"
                  accept=".pdf,.doc,.docx,.txt,.csv"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <button
                onClick={() => handleAIAnalysis('custom')}
                disabled={isLoading || (!promptText.trim() && !selectedFile)}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
              >
                <Target className="w-4 h-4" />
                {isLoading ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    localStorage.removeItem('jewelryDemographics');
                    localStorage.removeItem('jewelryProducts');
                    localStorage.removeItem('jewelryTrends');
                    localStorage.removeItem('jewelryFeedback');
                    window.location.reload();
                  }
                }}
                className="btn bg-red-600 text-white hover:bg-red-700 w-full flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
              
              <button
                onClick={() => {
                  const data = generateDemoData();
                  setDemographics(data.demographics);
                  setProducts(data.products);
                  setTrends(data.trends);
                  setFeedback(data.feedback);
                }}
                className="btn bg-gray-600 text-white hover:bg-gray-700 w-full flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                Reset Demo Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'demographics':
        return renderDemographics();
      case 'products':
        return renderProducts();
      case 'trends':
        return renderTrends();
      case 'feedback':
        return renderFeedback();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <Crown className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            14K Gold Jewelry Insights
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            Please log in to access your jewelry business insights.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="generation_issue_fallback">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Crown className="w-8 h-8 text-yellow-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                Jewelry Insights
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400 hidden sm:block">
                Welcome, {currentUser.first_name}
              </span>
              <button
                onClick={logout}
                className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white dark:bg-slate-800 shadow-sm border-r border-gray-200 dark:border-slate-700 min-h-[calc(100vh-4rem)] hidden lg:block">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            
            <button
              onClick={() => setCurrentView('demographics')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                currentView === 'demographics'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4" />
              Demographics
            </button>
            
            <button
              onClick={() => setCurrentView('products')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                currentView === 'products'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Package className="w-4 h-4" />
              Products
            </button>
            
            <button
              onClick={() => setCurrentView('trends')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                currentView === 'trends'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Trends
            </button>
            
            <button
              onClick={() => setCurrentView('feedback')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                currentView === 'feedback'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Heart className="w-4 h-4" />
              Feedback
            </button>
            
            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                currentView === 'settings'
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </nav>
        </aside>

        {/* Mobile Menu */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 z-50">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`p-2 rounded-md ${
                currentView === 'dashboard'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentView('demographics')}
              className={`p-2 rounded-md ${
                currentView === 'demographics'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              <Users className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentView('products')}
              className={`p-2 rounded-md ${
                currentView === 'products'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              <Package className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentView('trends')}
              className={`p-2 rounded-md ${
                currentView === 'trends'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              <TrendingUp className="w-6 h-6" />
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className={`p-2 rounded-md ${
                currentView === 'settings'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-slate-400'
              }`}
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 pb-16 lg:pb-0">
          <div className="container-fluid py-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 lg:ml-64">
        <div className="container-fluid">
          <p className="text-center text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsLoading(loading)}
      />
    </div>
  );
};

export default App;