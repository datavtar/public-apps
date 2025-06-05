import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Coffee, Star, TrendingUp, Users, MessageCircle, Plus, Edit, Trash2,
  Filter, Download, Upload, Settings, BarChart, PieChart as LucidePieChart,
  Calendar, Search, Eye, X, ChevronDown, ChevronUp, Heart,
  ThumbsUp, Award, Target, Zap, Clock, CheckCircle, LogOut
} from 'lucide-react';
import { PieChart, Pie, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import styles from './styles/styles.module.css';

interface Drink {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  image?: string;
  isActive: boolean;
}

interface Feedback {
  id: string;
  drinkId: string;
  drinkName: string;
  customerName: string;
  email?: string;
  rating: number;
  comment: string;
  category: string;
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  aiInsights?: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

type ViewMode = 'dashboard' | 'feedback-form' | 'drinks' | 'analytics' | 'settings';

const DRINK_CATEGORIES: Category[] = [
  { id: '1', name: 'Coffee', color: '#8B4513', icon: '☕' },
  { id: '2', name: 'Tea', color: '#228B22', icon: '🍵' },
  { id: '3', name: 'Smoothies', color: '#FF69B4', icon: '🥤' },
  { id: '4', name: 'Cold Drinks', color: '#1E90FF', icon: '🧊' },
  { id: '5', name: 'Hot Chocolate', color: '#8B4513', icon: '🍫' },
  { id: '6', name: 'Specialty', color: '#FF4500', icon: '⭐' }
];

const SAMPLE_DRINKS: Drink[] = [
  { id: '1', name: 'Espresso', category: 'Coffee', description: 'Rich and bold espresso shot', price: 2.50, isActive: true },
  { id: '2', name: 'Cappuccino', category: 'Coffee', description: 'Creamy espresso with steamed milk', price: 4.00, isActive: true },
  { id: '3', name: 'Green Tea Latte', category: 'Tea', description: 'Smooth green tea with milk', price: 3.50, isActive: true },
  { id: '4', name: 'Berry Smoothie', category: 'Smoothies', description: 'Fresh berries with yogurt', price: 5.50, isActive: true },
  { id: '5', name: 'Iced Coffee', category: 'Cold Drinks', description: 'Refreshing cold brew coffee', price: 3.00, isActive: true },
  { id: '6', name: 'Hot Chocolate Deluxe', category: 'Hot Chocolate', description: 'Rich chocolate with whipped cream', price: 4.50, isActive: true }
];

const SAMPLE_FEEDBACK: Feedback[] = [
  {
    id: '1',
    drinkId: '1',
    drinkName: 'Espresso',
    customerName: 'John Doe',
    email: 'john@example.com',
    rating: 5,
    comment: 'Perfect espresso! Rich flavor and great aroma.',
    category: 'Coffee',
    timestamp: '2025-06-04T10:30:00Z',
    sentiment: 'positive'
  },
  {
    id: '2',
    drinkId: '2',
    drinkName: 'Cappuccino',
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    rating: 4,
    comment: 'Good cappuccino, could use a bit more foam.',
    category: 'Coffee',
    timestamp: '2025-06-04T11:15:00Z',
    sentiment: 'positive'
  },
  {
    id: '3',
    drinkId: '4',
    drinkName: 'Berry Smoothie',
    customerName: 'Mike Johnson',
    rating: 5,
    comment: 'Amazing smoothie! Fresh berries and perfect consistency.',
    category: 'Smoothies',
    timestamp: '2025-06-05T09:20:00Z',
    sentiment: 'positive'
  }
];

function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Core state
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [categories, setCategories] = useState<Category[]>(DRINK_CATEGORIES);
  
  // Feedback form state
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Drink management state
  const [isAddingDrink, setIsAddingDrink] = useState(false);
  const [editingDrink, setEditingDrink] = useState<Drink | null>(null);
  const [drinkForm, setDrinkForm] = useState({
    name: '',
    category: '',
    description: '',
    price: 0
  });
  
  // Filter and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // UI state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  
  // Load data from localStorage
  useEffect(() => {
    const savedDrinks = localStorage.getItem('cafe-drinks');
    const savedFeedback = localStorage.getItem('cafe-feedback');
    const savedCategories = localStorage.getItem('cafe-categories');
    
    if (savedDrinks) {
      setDrinks(JSON.parse(savedDrinks));
    } else {
      setDrinks(SAMPLE_DRINKS);
      localStorage.setItem('cafe-drinks', JSON.stringify(SAMPLE_DRINKS));
    }
    
    if (savedFeedback) {
      setFeedback(JSON.parse(savedFeedback));
    } else {
      setFeedback(SAMPLE_FEEDBACK);
      localStorage.setItem('cafe-feedback', JSON.stringify(SAMPLE_FEEDBACK));
    }
    
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cafe-drinks', JSON.stringify(drinks));
  }, [drinks]);
  
  useEffect(() => {
    localStorage.setItem('cafe-feedback', JSON.stringify(feedback));
  }, [feedback]);
  
  useEffect(() => {
    localStorage.setItem('cafe-categories', JSON.stringify(categories));
  }, [categories]);
  
  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // Confirmation dialog
  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };
  
  // Feedback submission
  const handleSubmitFeedback = async () => {
    if (!selectedDrink || !customerName || rating === 0) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    const newFeedback: Feedback = {
      id: Date.now().toString(),
      drinkId: selectedDrink.id,
      drinkName: selectedDrink.name,
      customerName,
      email: customerEmail,
      rating,
      comment,
      category: selectedDrink.category,
      timestamp: new Date().toISOString()
    };
    
    // AI sentiment analysis
    if (comment.trim()) {
      const sentimentPrompt = `Analyze the sentiment of this customer feedback and provide insights: "${comment}". Also determine if the sentiment is positive, negative, or neutral. Return a JSON with keys: "sentiment" (positive/negative/neutral), "insights" (brief analysis), "keywords" (array of key themes)`;
      
      try {
        setIsAiLoading(true);
        aiLayerRef.current?.sendToAI(sentimentPrompt);
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }
    
    setFeedback(prev => [...prev, newFeedback]);
    
    // Reset form
    setSelectedDrink(null);
    setCustomerName('');
    setCustomerEmail('');
    setRating(0);
    setComment('');
    
    showNotification('Thank you for your feedback!', 'success');
  };
  
  // AI result handler
  const handleAiResult = (result: string) => {
    setIsAiLoading(false);
    try {
      const analysis = JSON.parse(result);
      // Update the last feedback with AI insights
      setFeedback(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          const lastIndex = updated.length - 1;
          updated[lastIndex] = {
            ...updated[lastIndex],
            sentiment: analysis.sentiment || 'neutral',
            aiInsights: analysis.insights || result
          };
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to parse AI result:', error);
    }
  };
  
  // Drink management
  const handleAddDrink = () => {
    if (!drinkForm.name || !drinkForm.category) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    const newDrink: Drink = {
      id: Date.now().toString(),
      name: drinkForm.name,
      category: drinkForm.category,
      description: drinkForm.description,
      price: drinkForm.price,
      isActive: true
    };
    
    setDrinks(prev => [...prev, newDrink]);
    setDrinkForm({ name: '', category: '', description: '', price: 0 });
    setIsAddingDrink(false);
    showNotification('Drink added successfully!', 'success');
  };
  
  const handleEditDrink = (drink: Drink) => {
    setEditingDrink(drink);
    setDrinkForm({
      name: drink.name,
      category: drink.category,
      description: drink.description,
      price: drink.price
    });
  };
  
  const handleUpdateDrink = () => {
    if (!editingDrink || !drinkForm.name || !drinkForm.category) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    setDrinks(prev => prev.map(drink => 
      drink.id === editingDrink.id 
        ? { ...drink, ...drinkForm }
        : drink
    ));
    
    setEditingDrink(null);
    setDrinkForm({ name: '', category: '', description: '', price: 0 });
    showNotification('Drink updated successfully!', 'success');
  };
  
  const handleDeleteDrink = (drinkId: string) => {
    showConfirmation('Are you sure you want to delete this drink?', () => {
      setDrinks(prev => prev.filter(drink => drink.id !== drinkId));
      showNotification('Drink deleted successfully!', 'success');
    });
  };
  
  // Data export
  const handleExportData = () => {
    const exportData = {
      drinks,
      feedback,
      categories,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cafe-feedback-data-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Data exported successfully!', 'success');
  };
  
  // Data import
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        if (importedData.drinks) setDrinks(importedData.drinks);
        if (importedData.feedback) setFeedback(importedData.feedback);
        if (importedData.categories) setCategories(importedData.categories);
        
        showNotification('Data imported successfully!', 'success');
      } catch (error) {
        showNotification('Failed to import data. Please check the file format.', 'error');
      }
    };
    reader.readAsText(file);
  };
  
  // Clear all data
  const handleClearAllData = () => {
    showConfirmation('Are you sure you want to clear all data? This action cannot be undone.', () => {
      setDrinks([]);
      setFeedback([]);
      localStorage.removeItem('cafe-drinks');
      localStorage.removeItem('cafe-feedback');
      showNotification('All data cleared successfully!', 'success');
    });
  };
  
  // Analytics calculations
  const getAnalyticsData = () => {
    const totalFeedback = feedback.length;
    const averageRating = feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0;
    
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating: `${rating} Star${rating > 1 ? 's' : ''}`,
      count: feedback.filter(f => f.rating === rating).length
    }));
    
    const categoryStats = categories.map(cat => {
      const categoryFeedback = feedback.filter(f => f.category === cat.name);
      const avgRating = categoryFeedback.length > 0
        ? categoryFeedback.reduce((sum, f) => sum + f.rating, 0) / categoryFeedback.length
        : 0;
      
      return {
        name: cat.name,
        count: categoryFeedback.length,
        avgRating: parseFloat(avgRating.toFixed(1)),
        color: cat.color
      };
    });
    
    const recentTrends = feedback
      .slice(-10)
      .map((f, index) => ({
        index: index + 1,
        rating: f.rating,
        date: new Date(f.timestamp).toLocaleDateString()
      }));
    
    const sentimentStats = {
      positive: feedback.filter(f => f.sentiment === 'positive').length,
      negative: feedback.filter(f => f.sentiment === 'negative').length,
      neutral: feedback.filter(f => f.sentiment === 'neutral').length
    };
    
    return {
      totalFeedback,
      averageRating,
      ratingDistribution,
      categoryStats,
      recentTrends,
      sentimentStats
    };
  };
  
  // Filter feedback
  const getFilteredFeedback = () => {
    return feedback.filter(f => {
      const matchesSearch = !searchTerm || 
        f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.drinkName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.comment.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = !filterCategory || f.category === filterCategory;
      const matchesRating = !filterRating || f.rating.toString() === filterRating;
      
      const matchesDate = !dateFilter || 
        new Date(f.timestamp).toDateString() === new Date(dateFilter).toDateString();
      
      return matchesSearch && matchesCategory && matchesRating && matchesDate;
    });
  };
  
  const analytics = getAnalyticsData();
  const filteredFeedback = getFilteredFeedback();
  const activeDrinks = drinks.filter(d => d.isActive);
  
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Coffee className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Cafe Feedback System</h1>
            <p className="text-gray-600 mt-2">Please log in to access the feedback management system</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100" id="welcome_fallback">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={handleAiResult}
        onError={(error) => {
          setAiError(error);
          setIsAiLoading(false);
        }}
        onLoading={setIsAiLoading}
      />
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-red-600">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3" id="generation_issue_fallback">
              <Coffee className="w-8 h-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-900">Cafe Feedback Hub</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Welcome, {currentUser.first_name}!
              </span>
              <button
                onClick={logout}
                className="btn bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-red-600 text-white shadow-lg">
        <div className="container-fluid">
          <div className="flex flex-wrap gap-1 py-3">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart },
              { id: 'feedback-form', label: 'Feedback Form', icon: MessageCircle },
              { id: 'drinks', label: 'Manage Drinks', icon: Coffee },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as ViewMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm sm:text-base ${
                  currentView === id
                    ? 'bg-red-700 bg-opacity-80 shadow-lg'
                    : 'hover:bg-red-700 hover:bg-opacity-50'
                }`}
                id={`nav-${id}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats">
              <div className="stat-card bg-gradient-to-r from-red-500 to-red-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-red-100">Total Feedback</div>
                    <div className="stat-value">{analytics.totalFeedback}</div>
                  </div>
                  <MessageCircle className="w-8 h-8 text-red-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-green-100">Average Rating</div>
                    <div className="stat-value">{analytics.averageRating.toFixed(1)}</div>
                  </div>
                  <Star className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-blue-100">Active Drinks</div>
                    <div className="stat-value">{activeDrinks.length}</div>
                  </div>
                  <Coffee className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="stat-card bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title text-purple-100">Categories</div>
                    <div className="stat-value">{categories.length}</div>
                  </div>
                  <Target className="w-8 h-8 text-purple-200" />
                </div>
              </div>
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <LucidePieChart className="w-5 h-5 text-red-600" />
                  Rating Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analytics.ratingDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#DC2626" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Category Performance */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  Category Performance
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.categoryStats}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Area type="monotone" dataKey="avgRating" stroke="#DC2626" fill="#FEE2E2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recent Feedback */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Recent Feedback
              </h3>
              <div className="space-y-3">
                {feedback.slice(-5).reverse().map((f) => (
                  <div key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < f.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{f.customerName}</span>
                        <span className="text-sm text-gray-500">•</span>
                        <span className="text-sm text-gray-500">{f.drinkName}</span>
                        {f.sentiment && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            f.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                            f.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {f.sentiment}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{f.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Feedback Form View */}
        {currentView === 'feedback-form' && (
          <div className="max-w-2xl mx-auto">
            <div className="card" id="feedback-form-card">
              <div className="text-center mb-6">
                <Heart className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
                <p className="text-gray-600 mt-2">Your feedback helps us serve you better!</p>
              </div>
              
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-name">Name *</label>
                    <input
                      id="customer-name"
                      type="text"
                      className="input"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="customer-email">Email (Optional)</label>
                    <input
                      id="customer-email"
                      type="email"
                      className="input"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                
                {/* Category Selection */}
                <div className="form-group">
                  <label className="form-label">Select Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                          selectedCategory === cat.name
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <div className="text-sm font-medium">{cat.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Drink Selection */}
                {selectedCategory && (
                  <div className="form-group">
                    <label className="form-label">Select Drink *</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                      {activeDrinks
                        .filter(drink => drink.category === selectedCategory)
                        .map((drink) => (
                        <button
                          key={drink.id}
                          onClick={() => setSelectedDrink(drink)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                            selectedDrink?.id === drink.id
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{drink.name}</div>
                          <div className="text-sm text-gray-600 mt-1">{drink.description}</div>
                          <div className="text-sm font-semibold text-red-600 mt-2">${drink.price}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Rating */}
                {selectedDrink && (
                  <div className="form-group">
                    <label className="form-label">Rating *</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300 hover:text-yellow-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {rating > 0 && (
                          rating === 5 ? 'Excellent!' :
                          rating === 4 ? 'Very Good!' :
                          rating === 3 ? 'Good' :
                          rating === 2 ? 'Fair' : 'Needs Improvement'
                        )}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Comment */}
                {selectedDrink && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="feedback-comment">Comments</label>
                    <textarea
                      id="feedback-comment"
                      className="input h-24 resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience..."
                    />
                  </div>
                )}
                
                {/* Submit Button */}
                <button
                  onClick={handleSubmitFeedback}
                  disabled={!selectedDrink || !customerName || rating === 0}
                  className="w-full btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  id="submit-feedback-btn"
                >
                  <ThumbsUp className="w-5 h-5" />
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Drinks Management View */}
        {currentView === 'drinks' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900">Manage Drinks</h2>
              <button
                onClick={() => setIsAddingDrink(true)}
                className="btn btn-primary flex items-center gap-2"
                id="add-drink-btn"
              >
                <Plus className="w-4 h-4" />
                Add Drink
              </button>
            </div>
            
            {/* Add/Edit Drink Form */}
            {(isAddingDrink || editingDrink) && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">
                  {editingDrink ? 'Edit Drink' : 'Add New Drink'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="drink-name">Name *</label>
                    <input
                      id="drink-name"
                      type="text"
                      className="input"
                      value={drinkForm.name}
                      onChange={(e) => setDrinkForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Drink name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="drink-category">Category *</label>
                    <select
                      id="drink-category"
                      className="input"
                      value={drinkForm.category}
                      onChange={(e) => setDrinkForm(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="drink-price">Price *</label>
                    <input
                      id="drink-price"
                      type="number"
                      step="0.01"
                      min="0"
                      className="input"
                      value={drinkForm.price}
                      onChange={(e) => setDrinkForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="form-group md:col-span-1">
                    <label className="form-label" htmlFor="drink-description">Description</label>
                    <textarea
                      id="drink-description"
                      className="input h-20 resize-none"
                      value={drinkForm.description}
                      onChange={(e) => setDrinkForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={editingDrink ? handleUpdateDrink : handleAddDrink}
                    className="btn btn-primary"
                  >
                    {editingDrink ? 'Update' : 'Add'} Drink
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingDrink(false);
                      setEditingDrink(null);
                      setDrinkForm({ name: '', category: '', description: '', price: 0 });
                    }}
                    className="btn bg-gray-500 text-white hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {/* Drinks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {drinks.map((drink) => (
                <div key={drink.id} className={`card ${!drink.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{drink.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{drink.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">${drink.price}</span>
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {drink.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditDrink(drink)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit drink"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDrink(drink.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete drink"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{drink.isActive ? 'Active' : 'Inactive'}</span>
                    <button
                      onClick={() => {
                        setDrinks(prev => prev.map(d => 
                          d.id === drink.id ? { ...d, isActive: !d.isActive } : d
                        ));
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        drink.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {drink.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
            </div>
            
            {/* Filters */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="analytics-filters">
                <div className="form-group">
                  <label className="form-label" htmlFor="search-feedback">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="search-feedback"
                      type="text"
                      className="input pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search feedback..."
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="filter-category">Category</label>
                  <select
                    id="filter-category"
                    className="input"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="filter-rating">Rating</label>
                  <select
                    id="filter-rating"
                    className="input"
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                  >
                    <option value="">All Ratings</option>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="filter-date">Date</label>
                  <input
                    id="filter-date"
                    type="date"
                    className="input"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {/* Detailed Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sentiment Analysis */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-red-600" />
                  Sentiment Analysis
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Positive', value: analytics.sentimentStats.positive, color: '#10B981' },
                          { name: 'Neutral', value: analytics.sentimentStats.neutral, color: '#6B7280' },
                          { name: 'Negative', value: analytics.sentimentStats.negative, color: '#EF4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}`}
                      >
                        {[
                          { name: 'Positive', value: analytics.sentimentStats.positive, color: '#10B981' },
                          { name: 'Neutral', value: analytics.sentimentStats.neutral, color: '#6B7280' },
                          { name: 'Negative', value: analytics.sentimentStats.negative, color: '#EF4444' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Recent Trends */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                  Recent Rating Trends
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.recentTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip labelFormatter={(label) => `Feedback ${label}`} />
                      <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#DC2626" 
                        strokeWidth={3}
                        dot={{ fill: '#DC2626', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Filtered Feedback List */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-red-600" />
                Feedback Details ({filteredFeedback.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredFeedback.map((f) => (
                  <div key={f.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">{f.customerName}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < f.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {f.sentiment && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              f.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              f.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {f.sentiment}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">{f.drinkName}</span> • {f.category} • 
                          {new Date(f.timestamp).toLocaleDateString()}
                        </div>
                        
                        <p className="text-gray-700">{f.comment}</p>
                        
                        {f.aiInsights && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">AI Insights:</h4>
                            <p className="text-sm text-blue-800">{f.aiInsights}</p>
                          </div>
                        )}
                      </div>
                      
                      <button
                        onClick={() => setExpandedFeedback(expandedFeedback === f.id ? null : f.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        {expandedFeedback === f.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredFeedback.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No feedback matches your current filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Settings View */}
        {currentView === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            
            {/* Data Management */}
            <div className="card" id="data-management">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-red-600" />
                Data Management
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleExportData}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
                
                <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import Data
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={handleClearAllData}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>• Export: Download all your data as a JSON file</p>
                <p>• Import: Upload a previously exported JSON file</p>
                <p>• Clear: Remove all drinks, feedback, and categories</p>
              </div>
            </div>
            
            {/* Category Management */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Manage Categories</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{cat.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{cat.name}</div>
                        <div className="text-sm text-gray-500">
                          {drinks.filter(d => d.category === cat.name).length} drinks
                        </div>
                      </div>
                    </div>
                    
                    <div
                      className="w-full h-3 rounded-full"
                      style={{ backgroundColor: cat.color + '20', border: `1px solid ${cat.color}40` }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: cat.color,
                          width: `${Math.min(100, (drinks.filter(d => d.category === cat.name).length / drinks.length) * 100 || 0)}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* App Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">App Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{drinks.length}</div>
                  <div className="text-gray-600">Total Drinks</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{feedback.length}</div>
                  <div className="text-gray-600">Total Feedback</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{categories.length}</div>
                  <div className="text-gray-600">Categories</div>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-600">
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Last Updated:</strong> June 2025</p>
                <p><strong>Features:</strong> Feedback Collection, Analytics, AI Insights, Data Export</p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-12">
        <div className="container-fluid text-center text-sm text-gray-600">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900">Confirm Action</h3>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-2">
              <p className="text-gray-500">{confirmMessage}</p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmAction();
                  setShowConfirmDialog(false);
                }}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;