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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  TrendingUp,
  Filter,
  Search,
  Download,
  Upload,
  Settings,
  ChartBar,
  Target,
  Dumbbell,
  Heart,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Eye,
  Plus,
  X,
  Edit,
  Trash2,
  LogOut,
  FileText,
  Brain
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface ConsumerProfile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  location: string;
  income: string;
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  dietaryRestrictions: string[];
  purchaseFrequency: 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Occasionally';
  preferredFlavors: string[];
  priceRange: string;
  purchaseChannels: string[];
  motivations: string[];
  brandLoyalty: 'High' | 'Medium' | 'Low';
  feedback: string;
  createdAt: string;
}

interface MarketTrend {
  month: string;
  sales: number;
  growth: number;
  topFlavor: string;
}

interface FlavorPreference {
  flavor: string;
  percentage: number;
  ageGroup: string;
}

interface DemographicData {
  segment: string;
  count: number;
  percentage: number;
}

type ViewType = 'dashboard' | 'consumers' | 'analytics' | 'trends' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Core state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [consumers, setConsumers] = useState<ConsumerProfile[]>([]);
  const [selectedConsumer, setSelectedConsumer] = useState<ConsumerProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAge, setFilterAge] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterFitnessLevel, setFilterFitnessLevel] = useState('');
  
  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<ConsumerProfile>>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Sample data
  const generateSampleData = (): ConsumerProfile[] => {
    const sampleConsumers: ConsumerProfile[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        age: 28,
        gender: 'Female',
        location: 'San Francisco, CA',
        income: '$75,000 - $100,000',
        fitnessLevel: 'Intermediate',
        dietaryRestrictions: ['Gluten-Free'],
        purchaseFrequency: 'Weekly',
        preferredFlavors: ['Chocolate Chip', 'Vanilla'],
        priceRange: '$2.50 - $3.50',
        purchaseChannels: ['Online', 'Gym'],
        motivations: ['Weight Management', 'Convenience'],
        brandLoyalty: 'Medium',
        feedback: 'Love the texture but would prefer less sugar content',
        createdAt: '2025-05-15'
      },
      {
        id: '2',
        name: 'Mike Rodriguez',
        age: 35,
        gender: 'Male',
        location: 'Austin, TX',
        income: '$100,000+',
        fitnessLevel: 'Advanced',
        dietaryRestrictions: ['Keto'],
        purchaseFrequency: 'Daily',
        preferredFlavors: ['Peanut Butter', 'Cookies & Cream'],
        priceRange: '$3.00 - $4.00',
        purchaseChannels: ['Retail Store', 'Online'],
        motivations: ['Muscle Building', 'Post-Workout Recovery'],
        brandLoyalty: 'High',
        feedback: 'Great protein content, perfect for my workout routine',
        createdAt: '2025-04-20'
      },
      {
        id: '3',
        name: 'Emma Chen',
        age: 24,
        gender: 'Female',
        location: 'New York, NY',
        income: '$50,000 - $75,000',
        fitnessLevel: 'Beginner',
        dietaryRestrictions: ['Vegan'],
        purchaseFrequency: 'Bi-weekly',
        preferredFlavors: ['Berry', 'Coconut'],
        priceRange: '$2.00 - $3.00',
        purchaseChannels: ['Online'],
        motivations: ['Healthy Snacking', 'Energy Boost'],
        brandLoyalty: 'Low',
        feedback: 'Good taste but looking for more plant-based options',
        createdAt: '2025-05-01'
      },
      {
        id: '4',
        name: 'David Wilson',
        age: 42,
        gender: 'Male',
        location: 'Chicago, IL',
        income: '$100,000+',
        fitnessLevel: 'Professional',
        dietaryRestrictions: [],
        purchaseFrequency: 'Daily',
        preferredFlavors: ['Chocolate', 'Caramel'],
        priceRange: '$3.50 - $5.00',
        purchaseChannels: ['Specialty Store', 'Online'],
        motivations: ['Performance Enhancement', 'Recovery'],
        brandLoyalty: 'High',
        feedback: 'Excellent quality, helps with training goals',
        createdAt: '2025-03-10'
      },
      {
        id: '5',
        name: 'Lisa Thompson',
        age: 31,
        gender: 'Female',
        location: 'Denver, CO',
        income: '$75,000 - $100,000',
        fitnessLevel: 'Intermediate',
        dietaryRestrictions: ['Lactose-Free'],
        purchaseFrequency: 'Weekly',
        preferredFlavors: ['Almond', 'Dark Chocolate'],
        priceRange: '$2.50 - $3.50',
        purchaseChannels: ['Retail Store'],
        motivations: ['Meal Replacement', 'Weight Management'],
        brandLoyalty: 'Medium',
        feedback: 'Good nutritional profile, convenient for busy days',
        createdAt: '2025-04-05'
      }
    ];
    return sampleConsumers;
  };

  const marketTrends: MarketTrend[] = [
    { month: 'Jan 2025', sales: 12500, growth: 8.2, topFlavor: 'Chocolate Chip' },
    { month: 'Feb 2025', sales: 13200, growth: 5.6, topFlavor: 'Peanut Butter' },
    { month: 'Mar 2025', sales: 14100, growth: 6.8, topFlavor: 'Vanilla' },
    { month: 'Apr 2025', sales: 15300, growth: 8.5, topFlavor: 'Cookies & Cream' },
    { month: 'May 2025', sales: 16800, growth: 9.8, topFlavor: 'Berry' },
    { month: 'Jun 2025', sales: 17500, growth: 4.2, topFlavor: 'Chocolate' }
  ];

  const flavorData: FlavorPreference[] = [
    { flavor: 'Chocolate Chip', percentage: 22, ageGroup: '25-35' },
    { flavor: 'Peanut Butter', percentage: 18, ageGroup: '30-40' },
    { flavor: 'Vanilla', percentage: 15, ageGroup: '20-30' },
    { flavor: 'Cookies & Cream', percentage: 12, ageGroup: '25-35' },
    { flavor: 'Berry', percentage: 10, ageGroup: '20-30' },
    { flavor: 'Coconut', percentage: 8, ageGroup: '25-35' },
    { flavor: 'Caramel', percentage: 7, ageGroup: '35-45' },
    { flavor: 'Dark Chocolate', percentage: 8, ageGroup: '30-40' }
  ];

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  // Load data from localStorage
  useEffect(() => {
    const savedConsumers = localStorage.getItem('proteinBarConsumers');
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedConsumers) {
      setConsumers(JSON.parse(savedConsumers));
    } else {
      const sampleData = generateSampleData();
      setConsumers(sampleData);
      localStorage.setItem('proteinBarConsumers', JSON.stringify(sampleData));
    }
    
    if (savedTheme) {
      const isDark = JSON.parse(savedTheme);
      setIsDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('proteinBarConsumers', JSON.stringify(consumers));
  }, [consumers]);

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('darkMode', JSON.stringify(newTheme));
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Filter consumers
  const filteredConsumers = consumers.filter(consumer => {
    const matchesSearch = consumer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consumer.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = !filterAge || 
                      (filterAge === '18-25' && consumer.age >= 18 && consumer.age <= 25) ||
                      (filterAge === '26-35' && consumer.age >= 26 && consumer.age <= 35) ||
                      (filterAge === '36-45' && consumer.age >= 36 && consumer.age <= 45) ||
                      (filterAge === '46+' && consumer.age >= 46);
    const matchesGender = !filterGender || consumer.gender === filterGender;
    const matchesFitness = !filterFitnessLevel || consumer.fitnessLevel === filterFitnessLevel;
    
    return matchesSearch && matchesAge && matchesGender && matchesFitness;
  });

  // Calculate demographics
  const getDemographics = (): DemographicData[] => {
    const total = consumers.length;
    if (total === 0) return [];
    
    const ageGroups = consumers.reduce((acc, consumer) => {
      let group = '';
      if (consumer.age >= 18 && consumer.age <= 25) group = '18-25';
      else if (consumer.age >= 26 && consumer.age <= 35) group = '26-35';
      else if (consumer.age >= 36 && consumer.age <= 45) group = '36-45';
      else group = '46+';
      
      acc[group] = (acc[group] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(ageGroups).map(([segment, count]) => ({
      segment,
      count,
      percentage: Math.round((count / total) * 100)
    }));
  };

  // Handle AI analysis
  const handleAiAnalysis = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file to analyze.');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    const prompt = selectedFile 
      ? `Analyze this consumer research data and provide insights for protein bar development. Focus on consumer preferences, market opportunities, and product development recommendations. Return structured insights in JSON format with keys: "key_insights", "recommendations", "market_opportunities", "target_segments".`
      : aiPrompt;
    
    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  // Modal handlers
  const openModal = (consumer: ConsumerProfile) => {
    setSelectedConsumer(consumer);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedConsumer(null);
    document.body.classList.remove('modal-open');
  };

  const openAddModal = () => {
    setFormData({});
    setIsAddModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setFormData({});
    document.body.classList.remove('modal-open');
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.age || !formData.gender) {
      alert('Please fill in required fields');
      return;
    }
    
    const newConsumer: ConsumerProfile = {
      id: Date.now().toString(),
      name: formData.name || '',
      age: formData.age || 0,
      gender: formData.gender || 'Other',
      location: formData.location || '',
      income: formData.income || '',
      fitnessLevel: formData.fitnessLevel || 'Beginner',
      dietaryRestrictions: formData.dietaryRestrictions || [],
      purchaseFrequency: formData.purchaseFrequency || 'Monthly',
      preferredFlavors: formData.preferredFlavors || [],
      priceRange: formData.priceRange || '',
      purchaseChannels: formData.purchaseChannels || [],
      motivations: formData.motivations || [],
      brandLoyalty: formData.brandLoyalty || 'Medium',
      feedback: formData.feedback || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setConsumers([...consumers, newConsumer]);
    closeAddModal();
  };

  // Delete consumer
  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setShowConfirmDialog(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setConsumers(consumers.filter(c => c.id !== itemToDelete));
      setItemToDelete(null);
      setShowConfirmDialog(false);
    }
  };

  // Export data
  const exportToCSV = () => {
    const headers = [
      'Name', 'Age', 'Gender', 'Location', 'Income', 'Fitness Level',
      'Dietary Restrictions', 'Purchase Frequency', 'Preferred Flavors',
      'Price Range', 'Purchase Channels', 'Motivations', 'Brand Loyalty', 'Feedback'
    ];
    
    const csvContent = [
      headers.join(','),
      ...consumers.map(consumer => [
        consumer.name,
        consumer.age,
        consumer.gender,
        consumer.location,
        consumer.income,
        consumer.fitnessLevel,
        consumer.dietaryRestrictions.join('; '),
        consumer.purchaseFrequency,
        consumer.preferredFlavors.join('; '),
        consumer.priceRange,
        consumer.purchaseChannels.join('; '),
        consumer.motivations.join('; '),
        consumer.brandLoyalty,
        consumer.feedback
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'protein-bar-consumer-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        const importedConsumers: ConsumerProfile[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const consumer: ConsumerProfile = {
              id: Date.now().toString() + i,
              name: values[0] || '',
              age: parseInt(values[1]) || 0,
              gender: (values[2] as 'Male' | 'Female' | 'Other') || 'Other',
              location: values[3] || '',
              income: values[4] || '',
              fitnessLevel: (values[5] as 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional') || 'Beginner',
              dietaryRestrictions: values[6] ? values[6].split('; ') : [],
              purchaseFrequency: (values[7] as 'Daily' | 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Occasionally') || 'Monthly',
              preferredFlavors: values[8] ? values[8].split('; ') : [],
              priceRange: values[9] || '',
              purchaseChannels: values[10] ? values[10].split('; ') : [],
              motivations: values[11] ? values[11].split('; ') : [],
              brandLoyalty: (values[12] as 'High' | 'Medium' | 'Low') || 'Medium',
              feedback: values[13] || '',
              createdAt: new Date().toISOString().split('T')[0]
            };
            importedConsumers.push(consumer);
          }
        }
        
        setConsumers([...consumers, ...importedConsumers]);
        alert(`Successfully imported ${importedConsumers.length} consumer records`);
      } catch (error) {
        alert('Error importing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Download template
  const downloadTemplate = () => {
    const templateHeaders = [
      'Name', 'Age', 'Gender', 'Location', 'Income', 'Fitness Level',
      'Dietary Restrictions', 'Purchase Frequency', 'Preferred Flavors',
      'Price Range', 'Purchase Channels', 'Motivations', 'Brand Loyalty', 'Feedback'
    ];
    
    const sampleRow = [
      'John Doe', '30', 'Male', 'Los Angeles, CA', '$50,000 - $75,000', 'Intermediate',
      'None', 'Weekly', 'Chocolate; Vanilla', '$2.50 - $3.50', 'Online; Retail Store',
      'Weight Management; Convenience', 'Medium', 'Great taste and texture'
    ];
    
    const csvContent = [templateHeaders.join(','), sampleRow.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'consumer-data-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Clear all data
  const clearAllData = () => {
    setConsumers([]);
    localStorage.removeItem('proteinBarConsumers');
    alert('All consumer data has been cleared.');
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isModalOpen) closeModal();
        if (isAddModalOpen) closeAddModal();
        if (showConfirmDialog) setShowConfirmDialog(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isAddModalOpen, showConfirmDialog]);

  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Overview</h2>
        <div className="flex items-center gap-4">
          <div className="badge badge-success">Live Data</div>
          <span className="text-sm text-gray-500 dark:text-slate-400">Last updated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card" id="total-consumers-stat">
          <div className="stat-title">Total Consumers</div>
          <div className="stat-value">{consumers.length.toLocaleString()}</div>
          <div className="stat-desc">↗︎ 12% from last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg Age</div>
          <div className="stat-value">{consumers.length > 0 ? Math.round(consumers.reduce((sum, c) => sum + c.age, 0) / consumers.length) : 0}</div>
          <div className="stat-desc">Primary demographic</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Weekly Buyers</div>
          <div className="stat-value">{consumers.filter(c => c.purchaseFrequency === 'Weekly').length}</div>
          <div className="stat-desc">High frequency segment</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Brand Loyalty</div>
          <div className="stat-value">{Math.round((consumers.filter(c => c.brandLoyalty === 'High').length / consumers.length) * 100)}%</div>
          <div className="stat-desc">High loyalty rate</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Market Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={marketTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Age Demographics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getDemographics()}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ segment, percentage }) => `${segment}: ${percentage}%`}
              >
                {getDemographics().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Flavor Preferences by Age Group</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={flavorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="flavor" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="percentage" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderConsumers = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Consumer Profiles</h2>
        <button 
          onClick={openAddModal}
          className="btn btn-primary flex items-center gap-2"
          id="add-consumer-btn"
        >
          <Plus className="w-4 h-4" />
          Add Consumer
        </button>
      </div>
      
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search consumers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              id="search-consumers"
            />
          </div>
          <select
            value={filterAge}
            onChange={(e) => setFilterAge(e.target.value)}
            className="input"
          >
            <option value="">All Ages</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-45">36-45</option>
            <option value="46+">46+</option>
          </select>
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="input"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={filterFitnessLevel}
            onChange={(e) => setFilterFitnessLevel(e.target.value)}
            className="input"
          >
            <option value="">All Fitness Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="Professional">Professional</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterAge('');
              setFilterGender('');
              setFilterFitnessLevel('');
            }}
            className="btn bg-gray-500 text-white hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Age</th>
                <th className="table-header">Location</th>
                <th className="table-header">Fitness Level</th>
                <th className="table-header">Purchase Frequency</th>
                <th className="table-header">Brand Loyalty</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {filteredConsumers.map((consumer) => (
                <tr key={consumer.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="table-cell font-medium">{consumer.name}</td>
                  <td className="table-cell">{consumer.age}</td>
                  <td className="table-cell">{consumer.location}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      consumer.fitnessLevel === 'Professional' ? 'badge-success' :
                      consumer.fitnessLevel === 'Advanced' ? 'badge-info' :
                      consumer.fitnessLevel === 'Intermediate' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {consumer.fitnessLevel}
                    </span>
                  </td>
                  <td className="table-cell">{consumer.purchaseFrequency}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      consumer.brandLoyalty === 'High' ? 'badge-success' :
                      consumer.brandLoyalty === 'Medium' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {consumer.brandLoyalty}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal(consumer)}
                        className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button
                        onClick={() => confirmDelete(consumer.id)}
                        className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredConsumers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-slate-400">
            No consumers found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI-Powered Analytics</h2>
        <div className="badge badge-info">AI Enhanced</div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Consumer Insights Analysis
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Analysis Prompt</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask about consumer preferences, market trends, or product opportunities..."
              className="input h-24 resize-none"
              id="ai-prompt-input"
            />
          </div>
          
          <div>
            <label className="form-label">Upload Consumer Data File (Optional)</label>
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
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
            className="btn btn-primary flex items-center gap-2"
            id="analyze-data-btn"
          >
            <Brain className="w-4 h-4" />
            {isAiLoading ? 'Analyzing...' : 'Analyze Data'}
          </button>
        </div>
        
        {isAiLoading && (
          <div className="mt-6 flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600 dark:text-slate-400">AI is analyzing your data...</span>
          </div>
        )}
        
        {aiError && (
          <div className="alert alert-error mt-6">
            <X className="w-5 h-5" />
            <p>Error: {aiError}</p>
          </div>
        )}
        
        {aiResult && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Analysis Results
            </h4>
            <div className="text-green-700 dark:text-green-300 whitespace-pre-wrap text-sm">
              {aiResult}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Purchase Frequency Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { frequency: 'Daily', count: consumers.filter(c => c.purchaseFrequency === 'Daily').length },
              { frequency: 'Weekly', count: consumers.filter(c => c.purchaseFrequency === 'Weekly').length },
              { frequency: 'Bi-weekly', count: consumers.filter(c => c.purchaseFrequency === 'Bi-weekly').length },
              { frequency: 'Monthly', count: consumers.filter(c => c.purchaseFrequency === 'Monthly').length },
              { frequency: 'Occasionally', count: consumers.filter(c => c.purchaseFrequency === 'Occasionally').length }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="frequency" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Fitness Level Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { level: 'Beginner', count: consumers.filter(c => c.fitnessLevel === 'Beginner').length },
                  { level: 'Intermediate', count: consumers.filter(c => c.fitnessLevel === 'Intermediate').length },
                  { level: 'Advanced', count: consumers.filter(c => c.fitnessLevel === 'Advanced').length },
                  { level: 'Professional', count: consumers.filter(c => c.fitnessLevel === 'Professional').length }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
                label={({ level, count }) => `${level}: ${count}`}
              >
                {Array.from({ length: 4 }).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Trends & Insights</h2>
        <div className="badge badge-success">Updated Daily</div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="stat-card">
          <div className="stat-title">Market Growth</div>
          <div className="stat-value text-green-600">+12.5%</div>
          <div className="stat-desc">Year over year</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Top Flavor</div>
          <div className="stat-value">Chocolate Chip</div>
          <div className="stat-desc">22% market share</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Avg Price Point</div>
          <div className="stat-value">$3.25</div>
          <div className="stat-desc">Sweet spot pricing</div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Sales Trends (2025)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={marketTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} name="Sales ($)" />
            <Line yAxisId="right" type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={2} name="Growth (%)" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Consumer Motivations</h3>
          <div className="space-y-3">
            {[
              { motivation: 'Weight Management', percentage: 35 },
              { motivation: 'Muscle Building', percentage: 28 },
              { motivation: 'Convenience', percentage: 22 },
              { motivation: 'Energy Boost', percentage: 18 },
              { motivation: 'Meal Replacement', percentage: 15 },
              { motivation: 'Post-Workout Recovery', percentage: 12 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{item.motivation}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Purchase Channels</h3>
          <div className="space-y-3">
            {[
              { channel: 'Online', percentage: 42 },
              { channel: 'Retail Store', percentage: 31 },
              { channel: 'Gym', percentage: 18 },
              { channel: 'Specialty Store', percentage: 9 }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{item.channel}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-slate-400">Dark Mode</span>
            <button 
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              id="theme-toggle"
            >
              <span className="theme-toggle-thumb"></span>
            </button>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-4">Data Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">Export Data</span>
              <button 
                onClick={exportToCSV}
                className="btn btn-sm btn-primary flex items-center gap-1"
                id="export-data-btn"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">Import Data</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={downloadTemplate}
                  className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" />
                  Template
                </button>
                <label className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1 cursor-pointer">
                  <Upload className="w-3 h-3" />
                  Import
                  <input type="file" accept=".csv" onChange={handleFileImport} className="hidden" />
                </label>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">Clear All Data</span>
              <button 
                onClick={clearAllData}
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium mb-4">Application Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-slate-400">
          <div>
            <strong>Version:</strong> 1.0.0
          </div>
          <div>
            <strong>Last Updated:</strong> June 5, 2025
          </div>
          <div>
            <strong>Data Points:</strong> {consumers.length} consumers
          </div>
          <div>
            <strong>Storage:</strong> Local Browser Storage
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${styles.appContainer}`} id="generation_issue_fallback">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container-wide py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <Dumbbell className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Protein Bar Analytics</h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">Consumer Market Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                  <User className="w-4 h-4" />
                  <span>Welcome, {currentUser.first_name}</span>
                </div>
              )}
              <button 
                onClick={logout}
                className="btn bg-red-500 text-white hover:bg-red-600 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
        <div className="container-wide">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ChartBar },
              { id: 'consumers', label: 'Consumers', icon: Users },
              { id: 'analytics', label: 'AI Analytics', icon: Brain },
              { id: 'trends', label: 'Market Trends', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as ViewType)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  currentView === id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
                id={`nav-${id}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container-wide py-8">
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'consumers' && renderConsumers()}
        {currentView === 'analytics' && renderAnalytics()}
        {currentView === 'trends' && renderTrends()}
        {currentView === 'settings' && renderSettings()}
      </main>
      
      {/* Consumer Detail Modal */}
      {isModalOpen && selectedConsumer && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Consumer Profile: {selectedConsumer.name}
              </h3>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Basic Info</label>
                  <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-slate-400">
                    <p><strong>Age:</strong> {selectedConsumer.age}</p>
                    <p><strong>Gender:</strong> {selectedConsumer.gender}</p>
                    <p><strong>Location:</strong> {selectedConsumer.location}</p>
                    <p><strong>Income:</strong> {selectedConsumer.income}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Fitness & Preferences</label>
                  <div className="mt-1 space-y-1 text-sm text-gray-600 dark:text-slate-400">
                    <p><strong>Fitness Level:</strong> {selectedConsumer.fitnessLevel}</p>
                    <p><strong>Purchase Frequency:</strong> {selectedConsumer.purchaseFrequency}</p>
                    <p><strong>Brand Loyalty:</strong> {selectedConsumer.brandLoyalty}</p>
                    <p><strong>Price Range:</strong> {selectedConsumer.priceRange}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Dietary Restrictions</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedConsumer.dietaryRestrictions.length > 0 ? 
                    selectedConsumer.dietaryRestrictions.map((restriction, index) => (
                      <span key={index} className="badge badge-warning">{restriction}</span>
                    )) : 
                    <span className="text-sm text-gray-500 dark:text-slate-400">None</span>
                  }
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Preferred Flavors</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedConsumer.preferredFlavors.map((flavor, index) => (
                    <span key={index} className="badge badge-info">{flavor}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Purchase Channels</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedConsumer.purchaseChannels.map((channel, index) => (
                    <span key={index} className="badge badge-success">{channel}</span>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Motivations</label>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedConsumer.motivations.map((motivation, index) => (
                    <span key={index} className="badge badge-info">{motivation}</span>
                  ))}
                </div>
              </div>
              
              {selectedConsumer.feedback && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Feedback</label>
                  <p className="mt-1 text-sm text-gray-600 dark:text-slate-400 p-3 bg-gray-50 dark:bg-slate-700 rounded">
                    "{selectedConsumer.feedback}"
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button 
                onClick={closeModal}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Consumer Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={closeAddModal}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Consumer</h3>
              <button 
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-slate-300"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Age *</label>
                  <input
                    type="number"
                    required
                    min="18"
                    max="100"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    className="input"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Gender *</label>
                  <select
                    required
                    value={formData.gender || ''}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as 'Male' | 'Female' | 'Other'})}
                    className="input"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="input"
                    placeholder="City, State"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Income Range</label>
                  <select
                    value={formData.income || ''}
                    onChange={(e) => setFormData({...formData, income: e.target.value})}
                    className="input"
                  >
                    <option value="">Select Income Range</option>
                    <option value="Under $25,000">Under $25,000</option>
                    <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                    <option value="$50,000 - $75,000">$50,000 - $75,000</option>
                    <option value="$75,000 - $100,000">$75,000 - $100,000</option>
                    <option value="$100,000+">$100,000+</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Fitness Level</label>
                  <select
                    value={formData.fitnessLevel || ''}
                    onChange={(e) => setFormData({...formData, fitnessLevel: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional'})}
                    className="input"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Feedback</label>
                <textarea
                  value={formData.feedback || ''}
                  onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                  className="input h-20 resize-none"
                  placeholder="Consumer feedback or notes..."
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button"
                  onClick={closeAddModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Consumer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <div className="mt-4">
              <p className="text-gray-600 dark:text-slate-400">Are you sure you want to delete this consumer profile? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 mt-12">
        <div className="container-wide py-6">
          <div className="text-center text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;