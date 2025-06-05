import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  User,
  LogOut,
  BarChart3,
  Users,
  TrendingUp,
  Settings,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  FileText,
  Camera,
  Brain,
  Target,
  Package,
  ChartPie,
  Globe,
  Calendar,
  DollarSign,
  Percent,
  ArrowUp,
  ArrowDown,
  Menu,
  X,
  Eye,
  MousePointer
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface ConsumerProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  income: string;
  lifestyle: string;
  fitnessLevel: string;
  dietaryRestrictions: string[];
  preferredFlavors: string[];
  purchaseFrequency: string;
  priceRange: string;
  purchaseLocation: string[];
  motivations: string[];
  concerns: string[];
  brandLoyalty: string;
  socialMediaUsage: string[];
  lastSurveyDate: string;
}

interface MarketData {
  id: string;
  category: string;
  value: number;
  percentage: number;
  trend: string;
  period: string;
}

interface CompetitorProduct {
  id: string;
  brand: string;
  productName: string;
  price: number;
  protein: number;
  calories: number;
  flavors: string[];
  targetAudience: string;
  marketShare: number;
  rating: number;
  launchDate: string;
}

interface SurveyResponse {
  id: string;
  respondentId: string;
  question: string;
  answer: string;
  rating: number;
  date: string;
  category: string;
}

type ViewType = 'dashboard' | 'consumers' | 'competitors' | 'surveys' | 'ai-insights' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Navigation state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data states
  const [consumerProfiles, setConsumerProfiles] = useState<ConsumerProfile[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorProduct[]>([]);
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);
  
  // AI states
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  // UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'add-consumer' | 'add-competitor' | 'settings' | 'view-details'>('add-consumer');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form states
  const [newConsumer, setNewConsumer] = useState<Partial<ConsumerProfile>>({});
  const [newCompetitor, setNewCompetitor] = useState<Partial<CompetitorProduct>>({});
  
  // Settings states
  const [settings, setSettings] = useState({
    currency: 'USD',
    region: 'North America',
    dataSource: 'Primary Research',
    autoRefresh: true,
    notifications: true
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedConsumers = localStorage.getItem('proteinBarConsumers');
    const savedMarketData = localStorage.getItem('proteinBarMarketData');
    const savedCompetitors = localStorage.getItem('proteinBarCompetitors');
    const savedSurveys = localStorage.getItem('proteinBarSurveys');
    const savedSettings = localStorage.getItem('proteinBarSettings');
    
    if (savedConsumers) {
      setConsumerProfiles(JSON.parse(savedConsumers));
    } else {
      setConsumerProfiles(getInitialConsumerData());
    }
    
    if (savedMarketData) {
      setMarketData(JSON.parse(savedMarketData));
    } else {
      setMarketData(getInitialMarketData());
    }
    
    if (savedCompetitors) {
      setCompetitors(JSON.parse(savedCompetitors));
    } else {
      setCompetitors(getInitialCompetitorData());
    }
    
    if (savedSurveys) {
      setSurveyResponses(JSON.parse(savedSurveys));
    } else {
      setSurveyResponses(getInitialSurveyData());
    }
    
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('proteinBarConsumers', JSON.stringify(consumerProfiles));
  }, [consumerProfiles]);

  useEffect(() => {
    localStorage.setItem('proteinBarMarketData', JSON.stringify(marketData));
  }, [marketData]);

  useEffect(() => {
    localStorage.setItem('proteinBarCompetitors', JSON.stringify(competitors));
  }, [competitors]);

  useEffect(() => {
    localStorage.setItem('proteinBarSurveys', JSON.stringify(surveyResponses));
  }, [surveyResponses]);

  useEffect(() => {
    localStorage.setItem('proteinBarSettings', JSON.stringify(settings));
  }, [settings]);

  const getInitialConsumerData = (): ConsumerProfile[] => [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 28,
      gender: 'Female',
      income: '$50,000-$75,000',
      lifestyle: 'Active Professional',
      fitnessLevel: 'High',
      dietaryRestrictions: ['Gluten-Free'],
      preferredFlavors: ['Chocolate', 'Vanilla', 'Peanut Butter'],
      purchaseFrequency: 'Weekly',
      priceRange: '$2.50-$4.00',
      purchaseLocation: ['Gym', 'Online', 'Grocery Store'],
      motivations: ['Post-workout recovery', 'Convenient nutrition', 'Weight management'],
      concerns: ['Artificial ingredients', 'Sugar content', 'Price'],
      brandLoyalty: 'Medium',
      socialMediaUsage: ['Instagram', 'TikTok'],
      lastSurveyDate: '2025-05-15'
    },
    {
      id: '2',
      name: 'Mike Thompson',
      age: 35,
      gender: 'Male',
      income: '$75,000-$100,000',
      lifestyle: 'Fitness Enthusiast',
      fitnessLevel: 'Very High',
      dietaryRestrictions: ['Keto-Friendly'],
      preferredFlavors: ['Chocolate Brownie', 'Cookies & Cream', 'Caramel'],
      purchaseFrequency: 'Bi-weekly',
      priceRange: '$3.00-$5.00',
      purchaseLocation: ['Supplement Store', 'Online', 'Gym'],
      motivations: ['Muscle building', 'Meal replacement', 'Performance enhancement'],
      concerns: ['Protein quality', 'Taste', 'Digestibility'],
      brandLoyalty: 'High',
      socialMediaUsage: ['YouTube', 'Instagram', 'Reddit'],
      lastSurveyDate: '2025-05-20'
    },
    {
      id: '3',
      name: 'Emily Chen',
      age: 24,
      gender: 'Female',
      income: '$35,000-$50,000',
      lifestyle: 'College Student',
      fitnessLevel: 'Medium',
      dietaryRestrictions: ['Vegan'],
      preferredFlavors: ['Berry', 'Coconut', 'Mint Chocolate'],
      purchaseFrequency: 'Monthly',
      priceRange: '$1.50-$3.00',
      purchaseLocation: ['Online', 'Campus Store', 'Grocery Store'],
      motivations: ['Budget-friendly nutrition', 'Study fuel', 'Healthy snacking'],
      concerns: ['Price', 'Sustainability', 'Clean ingredients'],
      brandLoyalty: 'Low',
      socialMediaUsage: ['TikTok', 'Instagram', 'Snapchat'],
      lastSurveyDate: '2025-06-01'
    }
  ];

  const getInitialMarketData = (): MarketData[] => [
    { id: '1', category: 'Market Size', value: 4200, percentage: 100, trend: 'up', period: '2025' },
    { id: '2', category: 'YoY Growth', value: 8.5, percentage: 8.5, trend: 'up', period: '2024-2025' },
    { id: '3', category: 'Online Sales', value: 35, percentage: 35, trend: 'up', period: '2025' },
    { id: '4', category: 'Gym Channel', value: 28, percentage: 28, trend: 'down', period: '2025' },
    { id: '5', category: 'Retail Stores', value: 37, percentage: 37, trend: 'stable', period: '2025' },
    { id: '6', category: 'Female Consumers', value: 58, percentage: 58, trend: 'up', period: '2025' },
    { id: '7', category: 'Age 25-35', value: 42, percentage: 42, trend: 'up', period: '2025' },
    { id: '8', category: 'Premium Segment', value: 22, percentage: 22, trend: 'up', period: '2025' }
  ];

  const getInitialCompetitorData = (): CompetitorProduct[] => [
    {
      id: '1',
      brand: 'Quest Nutrition',
      productName: 'Quest Bar',
      price: 2.99,
      protein: 21,
      calories: 190,
      flavors: ['Chocolate Chip Cookie Dough', 'Birthday Cake', 'Cookies & Cream'],
      targetAudience: 'Fitness Enthusiasts',
      marketShare: 18.5,
      rating: 4.3,
      launchDate: '2010-03-15'
    },
    {
      id: '2',
      brand: 'RXBAR',
      productName: 'RX Protein Bar',
      price: 2.49,
      protein: 12,
      calories: 210,
      flavors: ['Chocolate Sea Salt', 'Blueberry', 'Peanut Butter'],
      targetAudience: 'Health-Conscious Consumers',
      marketShare: 12.3,
      rating: 4.1,
      launchDate: '2013-07-20'
    },
    {
      id: '3',
      brand: 'KIND',
      productName: 'KIND Protein Bar',
      price: 1.99,
      protein: 12,
      calories: 250,
      flavors: ['Dark Chocolate Nut', 'Crunchy Peanut Butter', 'Almond Butter'],
      targetAudience: 'Mainstream Health',
      marketShare: 15.7,
      rating: 4.0,
      launchDate: '2015-11-10'
    }
  ];

  const getInitialSurveyData = (): SurveyResponse[] => [
    {
      id: '1',
      respondentId: '1',
      question: 'What is your primary reason for consuming protein bars?',
      answer: 'Post-workout recovery and muscle building',
      rating: 5,
      date: '2025-05-15',
      category: 'motivation'
    },
    {
      id: '2',
      respondentId: '2',
      question: 'How important is taste in your protein bar selection?',
      answer: 'Extremely important - taste is the deciding factor',
      rating: 5,
      date: '2025-05-20',
      category: 'preferences'
    },
    {
      id: '3',
      respondentId: '3',
      question: 'What price range do you consider reasonable for a protein bar?',
      answer: '$2.00 - $3.50 per bar',
      rating: 4,
      date: '2025-06-01',
      category: 'pricing'
    }
  ];

  const handleAiAnalysis = () => {
    if (!promptText?.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file for AI analysis.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      if (selectedFile) {
        // For file analysis, enhance the prompt with context
        const enhancedPrompt = promptText || 'Analyze this document/image for protein bar market insights. Extract key consumer preferences, market trends, competitor information, and actionable insights for product development. Return insights in JSON format with keys: "summary", "key_insights", "consumer_preferences", "market_trends", "recommendations".';
        aiLayerRef.current?.sendToAI(enhancedPrompt, selectedFile);
      } else {
        aiLayerRef.current?.sendToAI(promptText);
      }
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const openModal = (type: typeof modalType, item?: any) => {
    setModalType(type);
    setSelectedItem(item);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setEditingId(null);
    setNewConsumer({});
    setNewCompetitor({});
    document.body.classList.remove('modal-open');
  };

  const handleAddConsumer = () => {
    if (!newConsumer.name || !newConsumer.age) {
      alert('Please fill in required fields (name and age)');
      return;
    }

    const consumer: ConsumerProfile = {
      id: Date.now().toString(),
      name: newConsumer.name || '',
      age: newConsumer.age || 0,
      gender: newConsumer.gender || '',
      income: newConsumer.income || '',
      lifestyle: newConsumer.lifestyle || '',
      fitnessLevel: newConsumer.fitnessLevel || '',
      dietaryRestrictions: newConsumer.dietaryRestrictions || [],
      preferredFlavors: newConsumer.preferredFlavors || [],
      purchaseFrequency: newConsumer.purchaseFrequency || '',
      priceRange: newConsumer.priceRange || '',
      purchaseLocation: newConsumer.purchaseLocation || [],
      motivations: newConsumer.motivations || [],
      concerns: newConsumer.concerns || [],
      brandLoyalty: newConsumer.brandLoyalty || '',
      socialMediaUsage: newConsumer.socialMediaUsage || [],
      lastSurveyDate: new Date().toISOString().split('T')[0]
    };

    setConsumerProfiles(prev => [...prev, consumer]);
    closeModal();
  };

  const handleDeleteConsumer = (id: string) => {
    setConsumerProfiles(prev => prev.filter(c => c.id !== id));
  };

  const handleExportData = () => {
    const data = {
      consumers: consumerProfiles,
      marketData,
      competitors,
      surveys: surveyResponses,
      exportDate: new Date().toISOString(),
      exportedBy: currentUser?.username
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protein-bar-research-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.consumers) setConsumerProfiles(data.consumers);
        if (data.marketData) setMarketData(data.marketData);
        if (data.competitors) setCompetitors(data.competitors);
        if (data.surveys) setSurveyResponses(data.surveys);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const filteredConsumers = consumerProfiles.filter(consumer => {
    const matchesSearch = consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consumer.lifestyle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterCategory === 'all' || 
                         consumer.fitnessLevel.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const renderDashboard = () => {
    const ageDistribution = [
      { name: '18-24', value: 22, consumers: consumerProfiles.filter(c => c.age >= 18 && c.age <= 24).length },
      { name: '25-34', value: 42, consumers: consumerProfiles.filter(c => c.age >= 25 && c.age <= 34).length },
      { name: '35-44', value: 25, consumers: consumerProfiles.filter(c => c.age >= 35 && c.age <= 44).length },
      { name: '45+', value: 11, consumers: consumerProfiles.filter(c => c.age >= 45).length }
    ];

    const purchaseFrequencyData = [
      { name: 'Daily', value: 8 },
      { name: 'Weekly', value: 35 },
      { name: 'Bi-weekly', value: 28 },
      { name: 'Monthly', value: 22 },
      { name: 'Rarely', value: 7 }
    ];

    const monthlyTrends = [
      { month: 'Jan', sales: 1200, consumers: 850 },
      { month: 'Feb', sales: 1350, consumers: 920 },
      { month: 'Mar', sales: 1480, consumers: 1050 },
      { month: 'Apr', sales: 1620, consumers: 1180 },
      { month: 'May', sales: 1750, consumers: 1290 },
      { month: 'Jun', sales: 1820, consumers: 1350 }
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

    return (
      <div className="space-y-6" id="dashboard-overview">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Protein Bar Consumer Research Dashboard
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-2">
              Market insights and consumer analysis for {new Date().getFullYear()}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportData}
              className="btn btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="key-metrics">
          <div className="stat-card">
            <div className="stat-title">Total Consumers</div>
            <div className="stat-value">{consumerProfiles.length}</div>
            <div className="stat-desc flex items-center gap-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              12% from last month
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Market Size</div>
            <div className="stat-value">$4.2B</div>
            <div className="stat-desc flex items-center gap-1">
              <ArrowUp className="w-4 h-4 text-green-500" />
              8.5% YoY growth
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Active Surveys</div>
            <div className="stat-value">{surveyResponses.length}</div>
            <div className="stat-desc">Latest: {surveyResponses[surveyResponses.length - 1]?.date || 'N/A'}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Competitors Tracked</div>
            <div className="stat-value">{competitors.length}</div>
            <div className="stat-desc">Avg Rating: {(competitors.reduce((acc, c) => acc + c.rating, 0) / competitors.length).toFixed(1)}</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Age Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={ageDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ageDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Purchase Frequency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={purchaseFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Market Trends - 2025</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="sales" stackId="1" stroke="#3B82F6" fill="#3B82F6" name="Sales (K)" />
              <Area type="monotone" dataKey="consumers" stackId="1" stroke="#10B981" fill="#10B981" name="Active Consumers" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderConsumers = () => (
    <div className="space-y-6" id="consumer-profiles">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consumer Profiles</h2>
        <button
          onClick={() => openModal('add-consumer')}
          className="btn btn-primary flex items-center gap-2"
          id="add-consumer-btn"
        >
          <Plus className="w-4 h-4" />
          Add Consumer
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search consumers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="input sm:w-48"
        >
          <option value="all">All Fitness Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="very high">Very High</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConsumers.map((consumer) => (
          <div key={consumer.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{consumer.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {consumer.age} years • {consumer.gender}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openModal('view-details', consumer)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded dark:hover:bg-blue-900"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteConsumer(consumer.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Income:</span>
                <span className="font-medium">{consumer.income}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Fitness:</span>
                <span className="badge badge-info">{consumer.fitnessLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Purchase:</span>
                <span className="font-medium">{consumer.purchaseFrequency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-slate-400">Price Range:</span>
                <span className="font-medium">{consumer.priceRange}</span>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Last Survey: {consumer.lastSurveyDate}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {consumer.preferredFlavors?.slice(0, 2).map((flavor, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
                    {flavor}
                  </span>
                ))}
                {consumer.preferredFlavors?.length > 2 && (
                  <span className="text-xs text-gray-500">+{consumer.preferredFlavors.length - 2} more</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompetitors = () => (
    <div className="space-y-6" id="competitor-analysis">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Competitor Analysis</h2>
        <button
          onClick={() => openModal('add-competitor')}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Competitor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Market Share Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPieChart>
              <Pie
                data={competitors.map(c => ({ name: c.brand, value: c.marketShare }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {competitors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Price vs Protein Content</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={competitors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="brand" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="price" fill="#3B82F6" name="Price ($)" />
              <Bar yAxisId="right" dataKey="protein" fill="#10B981" name="Protein (g)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">Brand</th>
              <th className="table-header">Product</th>
              <th className="table-header">Price</th>
              <th className="table-header">Protein</th>
              <th className="table-header">Market Share</th>
              <th className="table-header">Rating</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
            {competitors.map((competitor) => (
              <tr key={competitor.id}>
                <td className="table-cell font-medium">{competitor.brand}</td>
                <td className="table-cell">{competitor.productName}</td>
                <td className="table-cell">${competitor.price}</td>
                <td className="table-cell">{competitor.protein}g</td>
                <td className="table-cell">{competitor.marketShare}%</td>
                <td className="table-cell">
                  <div className="flex items-center gap-1">
                    <span>{competitor.rating}</span>
                    <span className="text-yellow-500">★</span>
                  </div>
                </td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal('view-details', competitor)}
                      className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      View
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

  const renderSurveys = () => (
    <div className="space-y-6" id="survey-insights">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Survey Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Recent Survey Responses</h3>
            <div className="space-y-4">
              {surveyResponses.slice(-5).map((response) => {
                const consumer = consumerProfiles.find(c => c.id === response.respondentId);
                return (
                  <div key={response.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium text-sm text-gray-900 dark:text-white">
                        {consumer?.name || 'Anonymous'}
                      </div>
                      <div className="text-xs text-gray-500">{response.date}</div>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-slate-300 mb-1">
                      <strong>Q:</strong> {response.question}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-slate-400">
                      <strong>A:</strong> {response.answer}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= response.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="badge badge-info text-xs">{response.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Response Categories</h3>
            <div className="space-y-3">
              {['motivation', 'preferences', 'pricing', 'quality'].map((category) => {
                const count = surveyResponses.filter(r => r.category === category).length;
                const percentage = (count / surveyResponses.length) * 100;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{category}</span>
                      <span>{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAiInsights = () => (
    <div className="space-y-6" id="ai-analysis">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Powered Insights</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI Analysis Input
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Analysis Prompt</label>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Ask AI to analyze market trends, consumer behavior, or upload documents/images for insights..."
                className="input min-h-[100px] resize-vertical"
                rows={4}
              />
            </div>
            
            <div>
              <label className="form-label">Upload Document/Image (Optional)</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif"
                className="input"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                  Selected: {selectedFile.name}
                </p>
              )}
            </div>
            
            <button
              onClick={handleAiAnalysis}
              disabled={isAiLoading}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              {isAiLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Generate AI Insights
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI Results</h3>
          
          {isAiLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {aiError && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <p>{typeof aiError === 'string' ? aiError : 'An error occurred during AI analysis'}</p>
            </div>
          )}
          
          {aiResult && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">AI Analysis Complete</h4>
                <div className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">
                  {aiResult}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult);
                    alert('Results copied to clipboard!');
                  }}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Copy Results
                </button>
                <button
                  onClick={() => setAiResult(null)}
                  className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
          
          {!aiResult && !isAiLoading && !aiError && (
            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>AI analysis results will appear here</p>
              <p className="text-sm mt-1">Upload documents, images, or ask questions about your protein bar market research</p>
            </div>
          )}
        </div>
      </div>
      
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6" id="app-settings">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Regional Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Market Region</label>
              <select
                value={settings.region}
                onChange={(e) => setSettings(prev => ({ ...prev, region: e.target.value }))}
                className="input"
              >
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="Global">Global</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Data Source</label>
              <select
                value={settings.dataSource}
                onChange={(e) => setSettings(prev => ({ ...prev, dataSource: e.target.value }))}
                className="input"
              >
                <option value="Primary Research">Primary Research</option>
                <option value="Secondary Research">Secondary Research</option>
                <option value="Mixed Sources">Mixed Sources</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Import Data</label>
              <input
                type="file"
                onChange={handleImportData}
                accept=".json"
                className="input"
              />
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Upload a JSON file with consumer and market data
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={handleExportData}
                className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export All Data
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
                    setConsumerProfiles([]);
                    setMarketData([]);
                    setCompetitors([]);
                    setSurveyResponses([]);
                    localStorage.clear();
                    alert('All data has been deleted.');
                  }
                }}
                className="btn bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete All Data
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Notifications</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.autoRefresh}
                onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                className="rounded"
              />
              <span>Auto-refresh data</span>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => setSettings(prev => ({ ...prev, notifications: e.target.checked }))}
                className="rounded"
              />
              <span>Enable notifications</span>
            </label>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Templates</h3>
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Download template files to help structure your data imports
            </p>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  const template = {
                    consumers: [{
                      name: "Example Consumer",
                      age: 30,
                      gender: "Female",
                      income: "$50,000-$75,000",
                      lifestyle: "Active Professional",
                      fitnessLevel: "High",
                      dietaryRestrictions: ["Gluten-Free"],
                      preferredFlavors: ["Chocolate", "Vanilla"],
                      purchaseFrequency: "Weekly",
                      priceRange: "$2.50-$4.00",
                      purchaseLocation: ["Gym", "Online"],
                      motivations: ["Post-workout recovery"],
                      concerns: ["Artificial ingredients"],
                      brandLoyalty: "Medium",
                      socialMediaUsage: ["Instagram"],
                      lastSurveyDate: "2025-06-05"
                    }]
                  };
                  
                  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'consumer-data-template.json';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Consumer Data Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!isModalOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    return (
      <div className="modal-backdrop" onClick={closeModal} onKeyDown={handleKeyDown} tabIndex={-1}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {modalType === 'add-consumer' && 'Add New Consumer'}
              {modalType === 'add-competitor' && 'Add New Competitor'}
              {modalType === 'view-details' && 'Details'}
              {modalType === 'settings' && 'Settings'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4">
            {modalType === 'add-consumer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Name *</label>
                    <input
                      type="text"
                      value={newConsumer.name || ''}
                      onChange={(e) => setNewConsumer(prev => ({ ...prev, name: e.target.value }))}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Age *</label>
                    <input
                      type="number"
                      value={newConsumer.age || ''}
                      onChange={(e) => setNewConsumer(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                      className="input"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Gender</label>
                    <select
                      value={newConsumer.gender || ''}
                      onChange={(e) => setNewConsumer(prev => ({ ...prev, gender: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Income Range</label>
                    <select
                      value={newConsumer.income || ''}
                      onChange={(e) => setNewConsumer(prev => ({ ...prev, income: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Income Range</option>
                      <option value="Under $35,000">Under $35,000</option>
                      <option value="$35,000-$50,000">$35,000-$50,000</option>
                      <option value="$50,000-$75,000">$50,000-$75,000</option>
                      <option value="$75,000-$100,000">$75,000-$100,000</option>
                      <option value="Over $100,000">Over $100,000</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Lifestyle</label>
                  <input
                    type="text"
                    value={newConsumer.lifestyle || ''}
                    onChange={(e) => setNewConsumer(prev => ({ ...prev, lifestyle: e.target.value }))}
                    placeholder="e.g., Active Professional, Student, Athlete"
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Fitness Level</label>
                  <select
                    value={newConsumer.fitnessLevel || ''}
                    onChange={(e) => setNewConsumer(prev => ({ ...prev, fitnessLevel: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select Fitness Level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Very High">Very High</option>
                  </select>
                </div>
              </div>
            )}

            {modalType === 'view-details' && selectedItem && (
              <div className="space-y-4">
                {selectedItem.name && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Name:</strong> {selectedItem.name}</div>
                        <div><strong>Age:</strong> {selectedItem.age}</div>
                        <div><strong>Gender:</strong> {selectedItem.gender}</div>
                        <div><strong>Income:</strong> {selectedItem.income}</div>
                        <div><strong>Lifestyle:</strong> {selectedItem.lifestyle}</div>
                        <div><strong>Fitness Level:</strong> {selectedItem.fitnessLevel}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Preferences & Behavior</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Purchase Frequency:</strong> {selectedItem.purchaseFrequency}</div>
                        <div><strong>Price Range:</strong> {selectedItem.priceRange}</div>
                        <div><strong>Brand Loyalty:</strong> {selectedItem.brandLoyalty}</div>
                        <div><strong>Last Survey:</strong> {selectedItem.lastSurveyDate}</div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h4 className="font-semibold mb-3">Additional Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <strong>Preferred Flavors:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedItem.preferredFlavors?.map((flavor: string, idx: number) => (
                              <span key={idx} className="badge badge-info text-xs">{flavor}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Purchase Locations:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedItem.purchaseLocation?.map((location: string, idx: number) => (
                              <span key={idx} className="badge badge-success text-xs">{location}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Motivations:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedItem.motivations?.map((motivation: string, idx: number) => (
                              <span key={idx} className="badge badge-warning text-xs">{motivation}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <strong>Concerns:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedItem.concerns?.map((concern: string, idx: number) => (
                              <span key={idx} className="badge badge-error text-xs">{concern}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedItem.brand && (
                  <div>
                    <h4 className="font-semibold mb-3">Competitor Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div><strong>Brand:</strong> {selectedItem.brand}</div>
                      <div><strong>Product:</strong> {selectedItem.productName}</div>
                      <div><strong>Price:</strong> ${selectedItem.price}</div>
                      <div><strong>Protein Content:</strong> {selectedItem.protein}g</div>
                      <div><strong>Calories:</strong> {selectedItem.calories}</div>
                      <div><strong>Market Share:</strong> {selectedItem.marketShare}%</div>
                      <div><strong>Rating:</strong> {selectedItem.rating}/5</div>
                      <div><strong>Target Audience:</strong> {selectedItem.targetAudience}</div>
                      <div className="sm:col-span-2">
                        <strong>Available Flavors:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedItem.flavors?.map((flavor: string, idx: number) => (
                            <span key={idx} className="badge badge-info text-xs">{flavor}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
              {modalType === 'view-details' ? 'Close' : 'Cancel'}
            </button>
            {modalType === 'add-consumer' && (
              <button onClick={handleAddConsumer} className="btn btn-primary">
                Add Consumer
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'consumers', label: 'Consumers', icon: Users },
    { id: 'competitors', label: 'Competitors', icon: Target },
    { id: 'surveys', label: 'Surveys', icon: FileText },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'consumers':
        return renderConsumers();
      case 'competitors':
        return renderCompetitors();
      case 'surveys':
        return renderSurveys();
      case 'ai-insights':
        return renderAiInsights();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" id="welcome_fallback">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container-fluid">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Protein Bar Research
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-slate-400 hidden sm:block">
                    Consumer Insights Dashboard
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <User className="w-4 h-4" />
                {currentUser?.first_name} {currentUser?.last_name}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className={`${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transform transition-transform duration-200 ease-in-out lg:transition-none`}>
          <div className="flex flex-col h-full pt-16 lg:pt-6">
            <div className="flex-1 px-4 pb-4">
              <ul className="space-y-2" id="generation_issue_fallback">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setCurrentView(item.id as ViewType);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-700'
                        }`}
                        id={`nav-${item.id}`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </nav>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="container-fluid py-6">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Modal */}
      {renderModal()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4">
        <div className="container-fluid">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;