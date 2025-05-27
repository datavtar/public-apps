import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Star, Target, TrendingUp, Lightbulb, Filter, Search, X, Eye, Trash2, Edit, Check, DollarSign, Calendar, BarChart3 } from 'lucide-react';

// Types and Interfaces
interface SalesIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cost: 'Low' | 'Medium' | 'High';
  expectedROI: string;
  implementationTips: string[];
  timeframe: string;
}

interface SavedIdea extends SalesIdea {
  savedAt: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  notes: string;
  priority: 'Low' | 'Medium' | 'High';
}

interface FilterState {
  category: string;
  difficulty: string;
  cost: string;
  search: string;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'generator' | 'tracker' | 'analytics'>('generator');
  const [ideas] = useState<SalesIdea[]>([
    {
      id: '1',
      title: 'Implement Customer Referral Program',
      description: 'Create a structured referral program that rewards existing customers for bringing in new business.',
      category: 'Customer Retention',
      difficulty: 'Medium',
      cost: 'Low',
      expectedROI: '200-400%',
      implementationTips: [
        'Offer meaningful rewards (discounts, free products, cash)',
        'Make the referral process simple with unique codes',
        'Track and follow up on referrals promptly',
        'Promote the program across all customer touchpoints'
      ],
      timeframe: '2-4 weeks'
    },
    {
      id: '2',
      title: 'Optimize Email Marketing Sequences',
      description: 'Develop automated email workflows that nurture leads and re-engage dormant customers.',
      category: 'Digital Marketing',
      difficulty: 'Medium',
      cost: 'Low',
      expectedROI: '300-500%',
      implementationTips: [
        'Segment your email list based on customer behavior',
        'Create compelling subject lines and preview text',
        'Use personalization and dynamic content',
        'Test different send times and frequencies'
      ],
      timeframe: '1-3 weeks'
    },
    {
      id: '3',
      title: 'Launch Limited-Time Flash Sales',
      description: 'Create urgency and drive immediate purchases with strategic flash sales and limited offers.',
      category: 'Pricing Strategy',
      difficulty: 'Easy',
      cost: 'Low',
      expectedROI: '150-300%',
      implementationTips: [
        'Choose slow-moving inventory or high-margin items',
        'Create genuine scarcity with limited quantities',
        'Promote across multiple channels simultaneously',
        'Set clear start and end times'
      ],
      timeframe: '1 week'
    },
    {
      id: '4',
      title: 'Develop Strategic Partnerships',
      description: 'Form alliances with complementary businesses to cross-promote and expand customer reach.',
      category: 'Business Development',
      difficulty: 'Hard',
      cost: 'Medium',
      expectedROI: '250-600%',
      implementationTips: [
        'Identify businesses with similar target audiences',
        'Propose mutually beneficial partnership terms',
        'Create formal agreements with clear expectations',
        'Track and measure partnership performance'
      ],
      timeframe: '4-8 weeks'
    },
    {
      id: '5',
      title: 'Implement Social Proof Strategies',
      description: 'Leverage customer testimonials, reviews, and social proof to build trust and credibility.',
      category: 'Customer Experience',
      difficulty: 'Easy',
      cost: 'Low',
      expectedROI: '200-400%',
      implementationTips: [
        'Collect and display customer testimonials prominently',
        'Show real-time purchase notifications',
        'Display trust badges and certifications',
        'Encourage and respond to online reviews'
      ],
      timeframe: '1-2 weeks'
    },
    {
      id: '6',
      title: 'Create Value-Added Bundles',
      description: 'Package complementary products or services together to increase average order value.',
      category: 'Product Strategy',
      difficulty: 'Medium',
      cost: 'Low',
      expectedROI: '180-350%',
      implementationTips: [
        'Analyze purchase patterns to identify bundle opportunities',
        'Price bundles attractively compared to individual items',
        'Highlight the savings and convenience benefits',
        'Test different bundle combinations'
      ],
      timeframe: '2-3 weeks'
    },
    {
      id: '7',
      title: 'Enhance Customer Support Experience',
      description: 'Improve customer service quality to increase satisfaction, retention, and word-of-mouth referrals.',
      category: 'Customer Experience',
      difficulty: 'Medium',
      cost: 'Medium',
      expectedROI: '300-700%',
      implementationTips: [
        'Implement live chat or chatbot functionality',
        'Train staff on active listening and problem-solving',
        'Create comprehensive FAQ and knowledge base',
        'Follow up after resolving customer issues'
      ],
      timeframe: '3-6 weeks'
    },
    {
      id: '8',
      title: 'Launch Retargeting Ad Campaigns',
      description: 'Re-engage website visitors who didn\'t purchase with targeted advertising across platforms.',
      category: 'Digital Marketing',
      difficulty: 'Medium',
      cost: 'Medium',
      expectedROI: '400-800%',
      implementationTips: [
        'Install tracking pixels on your website',
        'Create compelling ad creatives with clear CTAs',
        'Segment audiences based on behavior and interests',
        'Set appropriate frequency caps to avoid ad fatigue'
      ],
      timeframe: '2-4 weeks'
    },
    {
      id: '9',
      title: 'Implement Loyalty Program',
      description: 'Reward repeat customers with points, discounts, or exclusive perks to encourage continued purchases.',
      category: 'Customer Retention',
      difficulty: 'Hard',
      cost: 'Medium',
      expectedROI: '250-500%',
      implementationTips: [
        'Design a simple and rewarding point system',
        'Offer tier-based benefits for higher spenders',
        'Make redemption process straightforward',
        'Promote program benefits regularly'
      ],
      timeframe: '6-10 weeks'
    },
    {
      id: '10',
      title: 'Optimize Website Conversion Rate',
      description: 'Improve website design, checkout process, and user experience to convert more visitors into customers.',
      category: 'Digital Marketing',
      difficulty: 'Medium',
      cost: 'Low',
      expectedROI: '200-600%',
      implementationTips: [
        'Simplify the checkout process and reduce form fields',
        'Add trust signals and security badges',
        'Optimize page loading speed',
        'A/B test different headlines and call-to-action buttons'
      ],
      timeframe: '3-5 weeks'
    },
    {
      id: '11',
      title: 'Create Content Marketing Strategy',
      description: 'Develop valuable content that educates customers and positions your brand as an industry expert.',
      category: 'Digital Marketing',
      difficulty: 'Hard',
      cost: 'Medium',
      expectedROI: '300-700%',
      implementationTips: [
        'Research trending topics in your industry',
        'Create diverse content formats (blogs, videos, infographics)',
        'Optimize content for SEO and social sharing',
        'Maintain consistent publishing schedule'
      ],
      timeframe: '4-8 weeks'
    },
    {
      id: '12',
      title: 'Implement Dynamic Pricing',
      description: 'Adjust prices based on demand, competition, and customer segments to maximize revenue.',
      category: 'Pricing Strategy',
      difficulty: 'Hard',
      cost: 'High',
      expectedROI: '150-400%',
      implementationTips: [
        'Analyze competitor pricing regularly',
        'Use data analytics to identify pricing opportunities',
        'Test price changes on small customer segments',
        'Communicate value clearly when raising prices'
      ],
      timeframe: '6-12 weeks'
    }
  ]);
  const [savedIdeas, setSavedIdeas] = useState<SavedIdea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<SalesIdea[]>([]);
  const [expandedIdea, setExpandedIdea] = useState<string | null>(null);
  const [randomIdea, setRandomIdea] = useState<SalesIdea | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    cost: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editingIdea, setEditingIdea] = useState<SavedIdea | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Categories and options
  const categories = ['All', 'Digital Marketing', 'Customer Retention', 'Pricing Strategy', 'Customer Experience', 'Product Strategy', 'Business Development'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const costs = ['All', 'Low', 'Medium', 'High'];
  const statuses = ['Planning', 'In Progress', 'Completed', 'On Hold'];
  const priorities = ['Low', 'Medium', 'High'];

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('salesIdeasTracker');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSavedIdeas(parsed.savedIdeas || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }

    const darkModePreference = localStorage.getItem('darkMode');
    if (darkModePreference === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save data to localStorage whenever savedIdeas changes
  useEffect(() => {
    const dataToSave = {
      savedIdeas
    };
    localStorage.setItem('salesIdeasTracker', JSON.stringify(dataToSave));
  }, [savedIdeas]);

  // Filter ideas based on current filters
  useEffect(() => {
    let filtered = ideas;

    if (filters.category && filters.category !== 'All') {
      filtered = filtered.filter(idea => idea.category === filters.category);
    }

    if (filters.difficulty && filters.difficulty !== 'All') {
      filtered = filtered.filter(idea => idea.difficulty === filters.difficulty);
    }

    if (filters.cost && filters.cost !== 'All') {
      filtered = filtered.filter(idea => idea.cost === filters.cost);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(searchTerm) ||
        idea.description.toLowerCase().includes(searchTerm) ||
        idea.category.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredIdeas(filtered);
  }, [ideas, filters]);

  // Dark mode toggle
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

  // Generate random idea
  const generateRandomIdea = () => {
    const randomIndex = Math.floor(Math.random() * ideas.length);
    setRandomIdea(ideas[randomIndex]);
  };

  // Save idea to tracker
  const saveIdea = (idea: SalesIdea) => {
    const newSavedIdea: SavedIdea = {
      ...idea,
      savedAt: new Date().toISOString(),
      status: 'Planning',
      notes: '',
      priority: 'Medium'
    };
    setSavedIdeas(prev => [...prev, newSavedIdea]);
  };

  // Remove saved idea
  const removeSavedIdea = (id: string) => {
    setSavedIdeas(prev => prev.filter(idea => idea.id !== id));
  };

  // Update saved idea
  const updateSavedIdea = (updatedIdea: SavedIdea) => {
    setSavedIdeas(prev => prev.map(idea => idea.id === updatedIdea.id ? updatedIdea : idea));
    setEditingIdea(null);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      cost: '',
      search: ''
    });
  };

  // Check if idea is already saved
  const isIdeaSaved = (ideaId: string) => {
    return savedIdeas.some(savedIdea => savedIdea.id === ideaId);
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'Hard': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Get cost color
  const getCostColor = (cost: string) => {
    switch (cost) {
      case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900';
      case 'In Progress': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'Completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'On Hold': return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900';
      case 'High': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900';
    }
  };

  // Calculate analytics
  const analytics = {
    totalIdeas: savedIdeas.length,
    completedIdeas: savedIdeas.filter(idea => idea.status === 'Completed').length,
    inProgressIdeas: savedIdeas.filter(idea => idea.status === 'In Progress').length,
    highPriorityIdeas: savedIdeas.filter(idea => idea.priority === 'High').length,
    completionRate: savedIdeas.length > 0 ? Math.round((savedIdeas.filter(idea => idea.status === 'Completed').length / savedIdeas.length) * 100) : 0
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-wide py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Sales Boost Hub
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Discover proven strategies to increase your sales
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 mt-4 overflow-x-auto">
            {[
              { id: 'generator', label: 'Idea Generator', icon: Lightbulb },
              { id: 'tracker', label: 'My Ideas', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setCurrentView(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  currentView === id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-wide py-6">
        {currentView === 'generator' && (
          <div className="space-y-6">
            {/* Random Idea Generator */}
            <div className="card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Inspiration
                </h2>
                <button
                  onClick={generateRandomIdea}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Generate Random Idea
                </button>
              </div>

              {randomIdea && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {randomIdea.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {randomIdea.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="badge badge-info">{randomIdea.category}</span>
                        <span className={`badge ${getDifficultyColor(randomIdea.difficulty)}`}>
                          {randomIdea.difficulty}
                        </span>
                        <span className={`badge ${getCostColor(randomIdea.cost)}`}>
                          {randomIdea.cost} Cost
                        </span>
                        <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ROI: {randomIdea.expectedROI}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => saveIdea(randomIdea)}
                      disabled={isIdeaSaved(randomIdea.id)}
                      className={`btn flex items-center gap-2 ${
                        isIdeaSaved(randomIdea.id)
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'btn-primary'
                      }`}
                    >
                      <Star className="h-4 w-4" />
                      {isIdeaSaved(randomIdea.id) ? 'Saved' : 'Save Idea'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="card">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Browse All Ideas ({filteredIdeas.length})
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {(filters.category || filters.difficulty || filters.cost || filters.search) && (
                    <button
                      onClick={clearFilters}
                      className="btn bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <label className="form-label">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        placeholder="Search ideas..."
                        className="input pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="input"
                    >
                      {categories.map(category => (
                        <option key={category} value={category === 'All' ? '' : category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Difficulty</label>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="input"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty === 'All' ? '' : difficulty}>
                          {difficulty}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Cost</label>
                    <select
                      value={filters.cost}
                      onChange={(e) => setFilters(prev => ({ ...prev, cost: e.target.value }))}
                      className="input"
                    >
                      {costs.map(cost => (
                        <option key={cost} value={cost === 'All' ? '' : cost}>
                          {cost}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Ideas List */}
              <div className="space-y-4">
                {filteredIdeas.length === 0 ? (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No ideas found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try adjusting your filters or search terms.
                    </p>
                  </div>
                ) : (
                  filteredIdeas.map(idea => (
                    <div key={idea.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {idea.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setExpandedIdea(expandedIdea === idea.id ? null : idea.id)}
                                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                aria-label="View details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => saveIdea(idea)}
                                disabled={isIdeaSaved(idea.id)}
                                className={`p-1 ${
                                  isIdeaSaved(idea.id)
                                    ? 'text-yellow-500'
                                    : 'text-gray-400 hover:text-yellow-500'
                                }`}
                                aria-label="Save idea"
                              >
                                <Star className={`h-4 w-4 ${isIdeaSaved(idea.id) ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {idea.description}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="badge badge-info">{idea.category}</span>
                            <span className={`badge ${getDifficultyColor(idea.difficulty)}`}>
                              {idea.difficulty}
                            </span>
                            <span className={`badge ${getCostColor(idea.cost)}`}>
                              {idea.cost} Cost
                            </span>
                            <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ROI: {idea.expectedROI}
                            </span>
                            <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              {idea.timeframe}
                            </span>
                          </div>

                          {expandedIdea === idea.id && (
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Implementation Tips:
                              </h4>
                              <ul className="space-y-2">
                                {idea.implementationTips.map((tip, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                    <span className="text-green-500 mt-0.5">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {currentView === 'tracker' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Saved Ideas
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Track and manage your sales improvement strategies
                </p>
              </div>
            </div>

            {/* Saved Ideas */}
            {savedIdeas.length === 0 ? (
              <div className="card text-center py-12">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No saved ideas yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Start by saving some ideas from the generator.
                </p>
                <button
                  onClick={() => setCurrentView('generator')}
                  className="btn btn-primary"
                >
                  Browse Ideas
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {savedIdeas.map(idea => (
                  <div key={idea.id} className="card">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {idea.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingIdea(idea)}
                              className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              aria-label="Edit idea"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeSavedIdea(idea.id)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                              aria-label="Remove idea"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {idea.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span className="badge badge-info">{idea.category}</span>
                          <span className={`badge ${getStatusColor(idea.status)}`}>
                            {idea.status}
                          </span>
                          <span className={`badge ${getPriorityColor(idea.priority)}`}>
                            {idea.priority} Priority
                          </span>
                          <span className={`badge ${getDifficultyColor(idea.difficulty)}`}>
                            {idea.difficulty}
                          </span>
                          <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            ROI: {idea.expectedROI}
                          </span>
                        </div>
                        {idea.notes && (
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes:</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{idea.notes}</p>
                          </div>
                        )}
                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                          Saved on {new Date(idea.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'analytics' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Track your progress and idea implementation
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="stat-card">
                <div className="stat-title">Total Ideas</div>
                <div className="stat-value">{analytics.totalIdeas}</div>
                <div className="stat-desc">Ideas saved</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Completed</div>
                <div className="stat-value text-green-600 dark:text-green-400">{analytics.completedIdeas}</div>
                <div className="stat-desc">Successfully implemented</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">In Progress</div>
                <div className="stat-value text-yellow-600 dark:text-yellow-400">{analytics.inProgressIdeas}</div>
                <div className="stat-desc">Currently working on</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">High Priority</div>
                <div className="stat-value text-red-600 dark:text-red-400">{analytics.highPriorityIdeas}</div>
                <div className="stat-desc">Urgent items</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Success Rate</div>
                <div className="stat-value text-blue-600 dark:text-blue-400">{analytics.completionRate}%</div>
                <div className="stat-desc">Completion rate</div>
              </div>
            </div>

            {savedIdeas.length === 0 ? (
              <div className="card text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No data to analyze yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Save some ideas and track their progress to see analytics.
                </p>
                <button
                  onClick={() => setCurrentView('generator')}
                  className="btn btn-primary"
                >
                  Browse Ideas
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {/* Status Distribution */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ideas by Status
                  </h3>
                  <div className="space-y-3">
                    {statuses.map(status => {
                      const count = savedIdeas.filter(idea => idea.status === status).length;
                      const percentage = savedIdeas.length > 0 ? (count / savedIdeas.length) * 100 : 0;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`badge ${getStatusColor(status)}`}>
                              {status}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {count} ideas
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Ideas by Category
                  </h3>
                  <div className="space-y-3">
                    {categories.slice(1).map(category => {
                      const count = savedIdeas.filter(idea => idea.category === category).length;
                      const percentage = savedIdeas.length > 0 ? (count / savedIdeas.length) * 100 : 0;
                      return count > 0 ? (
                        <div key={category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="badge badge-info">
                              {category}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {count} ideas
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                              {Math.round(percentage)}%
                            </span>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingIdea && (
        <div className="modal-backdrop" onClick={() => setEditingIdea(null)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Edit Idea
              </h3>
              <button
                onClick={() => setEditingIdea(null)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Status</label>
                  <select
                    value={editingIdea.status}
                    onChange={(e) => setEditingIdea({ ...editingIdea, status: e.target.value as any })}
                    className="input"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Priority</label>
                  <select
                    value={editingIdea.priority}
                    onChange={(e) => setEditingIdea({ ...editingIdea, priority: e.target.value as any })}
                    className="input"
                  >
                    {priorities.map(priority => (
                      <option key={priority} value={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea
                  value={editingIdea.notes}
                  onChange={(e) => setEditingIdea({ ...editingIdea, notes: e.target.value })}
                  rows={4}
                  className="input"
                  placeholder="Add your implementation notes, progress updates, or insights..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setEditingIdea(null)}
                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => updateSavedIdea(editingIdea)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="container-wide py-6">
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;