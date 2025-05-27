import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Shield,
  Target,
  Cpu,
  Satellite,
  Brain,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  Download,
  Upload,
  FileText,
  Zap,
  Globe,
  Lock,
  Eye,
  Crosshair,
  Rocket,
  Radar,
  Database,
  ChevronRight,
  ChevronDown,
  Calendar,
  Users,
  Award,
  Gauge,
  Server,
  BrainCircuit
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: {
    range: string;
    payload: string;
    accuracy: string;
    autonomy: string;
    operatingTemp: string;
    weight: string;
  };
  features: string[];
  image: string;
  price: string;
  status: 'Active' | 'Development' | 'Classified';
}

interface CompanyInfo {
  founded: string;
  headquarters: string;
  employees: string;
  contracts: string;
  certifications: string[];
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'New' | 'In Review' | 'Responded' | 'Closed';
  date: string;
}

interface TechnicalDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  analysis?: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Navigation and UI State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('thorneguard_darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true; // Default to dark mode for military aesthetic
  });

  // AI-powered features state
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any>(null);
  
  // Product data
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('thorneguard_products');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Sentinel X-7 Autonomous Defense Turret',
        category: 'Ground Defense',
        description: 'AI-powered autonomous turret system with advanced target recognition and engagement capabilities.',
        specifications: {
          range: '2.5 km',
          payload: '20mm Chain Gun + Missiles',
          accuracy: '99.7% at 1km',
          autonomy: '72 hours',
          operatingTemp: '-40°C to +60°C',
          weight: '2,850 kg'
        },
        features: [
          'Real-time threat assessment',
          'Multi-target engagement',
          'Encrypted communications',
          'Self-diagnostic systems',
          'Weather-resistant housing'
        ],
        image: '/api/placeholder/400/300',
        price: 'Contact for Pricing',
        status: 'Active'
      },
      {
        id: '2',
        name: 'Wraith UAV Swarm System',
        category: 'Aerial Systems',
        description: 'Coordinated drone swarm technology for reconnaissance and tactical operations.',
        specifications: {
          range: '50 km',
          payload: 'Various mission modules',
          accuracy: '95% target identification',
          autonomy: '8 hours flight time',
          operatingTemp: '-30°C to +50°C',
          weight: '15 kg per unit'
        },
        features: [
          'Swarm intelligence coordination',
          'Stealth configuration',
          'Adaptive mission planning',
          'Real-time data sharing',
          'Autonomous return-to-base'
        ],
        image: '/api/placeholder/400/300',
        price: 'Contact for Pricing',
        status: 'Active'
      },
      {
        id: '3',
        name: 'Guardian Naval Defense Platform',
        category: 'Naval Systems',
        description: 'Ship-mounted autonomous defense system for maritime protection.',
        specifications: {
          range: '15 km',
          payload: 'Multi-role missile system',
          accuracy: '98.5% intercept rate',
          autonomy: '96 hours',
          operatingTemp: '-20°C to +55°C',
          weight: '5,200 kg'
        },
        features: [
          'Anti-aircraft capabilities',
          'Anti-missile defense',
          'Surface target engagement',
          'Integrated radar system',
          'Saltwater corrosion resistance'
        ],
        image: '/api/placeholder/400/300',
        price: 'Contact for Pricing',
        status: 'Development'
      }
    ];
  });

  // Company information
  const [companyInfo] = useState<CompanyInfo>({
    founded: '2018',
    headquarters: 'Colorado Springs, CO',
    employees: '750+',
    contracts: '$2.4B',
    certifications: ['ISO 9001:2015', 'ITAR Registered', 'DoD 8570.01-M', 'NIST 800-171']
  });

  // Contact inquiries
  const [inquiries, setInquiries] = useState<ContactInquiry[]>(() => {
    const saved = localStorage.getItem('thorneguard_inquiries');
    return saved ? JSON.parse(saved) : [];
  });

  // Technical documents
  const [documents, setDocuments] = useState<TechnicalDocument[]>(() => {
    const saved = localStorage.getItem('thorneguard_documents');
    return saved ? JSON.parse(saved) : [];
  });

  // Settings state
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('thorneguard_settings');
    return saved ? JSON.parse(saved) : {
      language: 'en',
      currency: 'USD',
      timezone: 'UTC-7',
      notifications: true,
      autoSave: true
    };
  });

  // Form states
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
    priority: 'Medium' as ContactInquiry['priority']
  });

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    category: '',
    description: '',
    specifications: {
      range: '',
      payload: '',
      accuracy: '',
      autonomy: '',
      operatingTemp: '',
      weight: ''
    },
    features: [],
    price: '',
    status: 'Development'
  });

  // UI States
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddProduct, setShowAddProduct] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('thorneguard_darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('thorneguard_darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('thorneguard_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('thorneguard_inquiries', JSON.stringify(inquiries));
  }, [inquiries]);

  useEffect(() => {
    localStorage.setItem('thorneguard_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('thorneguard_settings', JSON.stringify(settings));
  }, [settings]);

  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddProduct(false);
        setEditingProduct(null);
        setMobileMenuOpen(false);
        setExpandedProduct(null);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // AI Functions
  const handleAnalyzeDocument = (file: File) => {
    if (!file) return;
    
    const prompt = `Analyze this defense industry document and extract key information. Return JSON with keys: "document_type", "key_points", "technical_specifications", "security_classification", "summary", "recommendations".`;
    
    setAiResult(null);
    setAiError(null);
    setSelectedFile(file);
    
    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError('Failed to analyze document');
    }
  };

  const handleGenerateProposal = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please provide requirements for the proposal');
      return;
    }
    
    const enhancedPrompt = `Generate a professional defense industry proposal based on these requirements: "${aiPrompt}". Return JSON with keys: "executive_summary", "technical_approach", "timeline", "cost_estimate", "risk_assessment", "deliverables".`;
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(enhancedPrompt);
    } catch (error) {
      setAiError('Failed to generate proposal');
    }
  };

  // Utility functions
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Product functions
  const addProduct = () => {
    if (!newProduct.name?.trim() || !newProduct.category?.trim()) {
      alert('Please fill in required fields');
      return;
    }

    const product: Product = {
      id: generateId(),
      name: newProduct.name || '',
      category: newProduct.category || '',
      description: newProduct.description || '',
      specifications: newProduct.specifications || {
        range: '',
        payload: '',
        accuracy: '',
        autonomy: '',
        operatingTemp: '',
        weight: ''
      },
      features: newProduct.features || [],
      image: '/api/placeholder/400/300',
      price: newProduct.price || 'Contact for Pricing',
      status: newProduct.status || 'Development'
    };

    setProducts(prev => [...prev, product]);
    setNewProduct({
      name: '',
      category: '',
      description: '',
      specifications: {
        range: '',
        payload: '',
        accuracy: '',
        autonomy: '',
        operatingTemp: '',
        weight: ''
      },
      features: [],
      price: '',
      status: 'Development'
    });
    setShowAddProduct(false);
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    setEditingProduct(null);
  };

  // Contact functions
  const submitInquiry = () => {
    if (!contactForm.name?.trim() || !contactForm.email?.trim() || !contactForm.message?.trim()) {
      alert('Please fill in required fields');
      return;
    }

    const inquiry: ContactInquiry = {
      id: generateId(),
      ...contactForm,
      status: 'New',
      date: formatDate(new Date())
    };

    setInquiries(prev => [inquiry, ...prev]);
    setContactForm({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: '',
      priority: 'Medium'
    });
    alert('Inquiry submitted successfully!');
  };

  // Document functions
  const handleFileUpload = (file: File) => {
    const document: TechnicalDocument = {
      id: generateId(),
      name: file.name,
      type: file.type || 'unknown',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      uploadDate: formatDate(new Date())
    };

    setDocuments(prev => [document, ...prev]);
    handleAnalyzeDocument(file);
  };

  // Settings functions
  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const exportData = () => {
    const data = {
      products,
      inquiries,
      documents,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thorneguard-data-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setProducts([]);
      setInquiries([]);
      setDocuments([]);
      localStorage.removeItem('thorneguard_products');
      localStorage.removeItem('thorneguard_inquiries');
      localStorage.removeItem('thorneguard_documents');
      alert('All data cleared successfully');
    }
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Navigation component
  const Navigation = () => (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="container-wide">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2" id="welcome_fallback">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold text-white">ThorneGuard</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === 'home' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'
                }`}
                id="nav-home"
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('products')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === 'products' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'
                }`}
                id="nav-products"
              >
                Products
              </button>
              <button
                onClick={() => setCurrentPage('technology')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === 'technology' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'
                }`}
                id="nav-technology"
              >
                Technology
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === 'about' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'
                }`}
                id="nav-about"
              >
                About
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  currentPage === 'contact' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-300 hover:text-white'
                }`}
                id="nav-contact"
              >
                Contact
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <>
                <span className="text-sm text-gray-300 hidden lg:block">
                  Welcome, {currentUser.first_name}
                </span>
                <button
                  onClick={() => setCurrentPage('settings')}
                  className={`p-2 rounded-full transition-colors ${
                    currentPage === 'settings' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-slate-700'
                  }`}
                  id="nav-settings"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-red-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-700 py-2">
            <div className="flex flex-col gap-2">
              {['home', 'products', 'technology', 'about', 'contact', 'settings'].map(page => (
                <button
                  key={page}
                  onClick={() => {
                    setCurrentPage(page);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-left text-sm font-medium transition-colors ${
                    currentPage === page ? 'text-blue-400 bg-slate-800' : 'text-gray-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {page.charAt(0).toUpperCase() + page.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // Home page component
  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="container-wide relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" id="generation_issue_fallback">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Autonomous Defense
              </span>
              <br />Systems
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Leading the future of military robotics with AI-powered autonomous weaponry systems 
              designed for modern warfare and defense applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setCurrentPage('products')}
                className="btn btn-primary btn-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700"
                id="hero-cta-products"
              >
                <Target className="h-5 w-5" />
                Explore Systems
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentPage('contact')}
                className="btn btn-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center gap-2"
                id="hero-cta-contact"
              >
                <Phone className="h-5 w-5" />
                Request Information
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-800/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Advanced Military Technology</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our autonomous systems combine cutting-edge AI, robotics, and defense expertise 
              to deliver unmatched operational capabilities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">AI-Powered Intelligence</h3>
              </div>
              <p className="text-gray-300">
                Advanced machine learning algorithms for real-time threat assessment, 
                target identification, and autonomous decision-making in complex environments.
              </p>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <Crosshair className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Precision Targeting</h3>
              </div>
              <p className="text-gray-300">
                Sub-meter accuracy with advanced ballistics computation, environmental 
                compensation, and multi-spectral targeting capabilities.
              </p>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700 hover:border-blue-500 transition-colors group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-600 rounded-lg group-hover:bg-blue-500 transition-colors">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Secure Operations</h3>
              </div>
              <p className="text-gray-300">
                Military-grade encryption, secure communications, and fail-safe mechanisms 
                ensure operational security and prevent unauthorized access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">750+</div>
              <div className="text-gray-300">Engineers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">$2.4B</div>
              <div className="text-gray-300">Contracts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">99.7%</div>
              <div className="text-gray-300">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">24/7</div>
              <div className="text-gray-300">Operations</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  // Products page component
  const ProductsPage = () => (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container-wide">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Defense Systems Portfolio</h1>
          <p className="text-xl text-gray-300">
            Comprehensive range of autonomous weaponry and defense solutions for modern military operations.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input bg-slate-800 border-slate-600 text-white"
              id="product-category-filter"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input bg-slate-800 border-slate-600 text-white placeholder-gray-400"
              id="product-search"
            />
          </div>
          
          {currentUser && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="btn btn-primary flex items-center gap-2"
              id="add-product-btn"
            >
              <Target className="h-4 w-4" />
              Add Product
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div key={product.id} className="card bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all group">
              <div className="mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg bg-slate-700"
                />
              </div>
              
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">{product.name}</h3>
                  <span className="text-sm text-blue-400">{product.category}</span>
                </div>
                <span className={`badge ${
                  product.status === 'Active' ? 'badge-success' :
                  product.status === 'Development' ? 'badge-warning' : 'badge-error'
                }`}>
                  {product.status}
                </span>
              </div>
              
              <p className="text-gray-300 mb-4 text-sm">{product.description}</p>
              
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Range:</span>
                  <span className="text-white">{product.specifications.range}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Accuracy:</span>
                  <span className="text-white">{product.specifications.accuracy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Autonomy:</span>
                  <span className="text-white">{product.specifications.autonomy}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-blue-400">{product.price}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                    className="btn btn-sm bg-slate-700 hover:bg-slate-600 text-white"
                  >
                    {expandedProduct === product.id ? 'Less' : 'Details'}
                    <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${
                      expandedProduct === product.id ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {currentUser && (
                    <button
                      onClick={() => setEditingProduct(product.id)}
                      className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
              
              {expandedProduct === product.id && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <h4 className="text-sm font-semibold text-white mb-2">Key Features:</h4>
                  <ul className="space-y-1 text-sm text-gray-300 mb-4">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <h4 className="text-sm font-semibold text-white mb-2">Full Specifications:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Payload:</span>
                      <span className="text-white">{product.specifications.payload}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Weight:</span>
                      <span className="text-white">{product.specifications.weight}</span>
                    </div>
                    <div className="flex justify-between col-span-2">
                      <span className="text-gray-400">Operating Temp:</span>
                      <span className="text-white">{product.specifications.operatingTemp}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or category filter.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-backdrop" onClick={() => setShowAddProduct(false)}>
          <div className="modal-content bg-slate-800 border border-slate-600" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-white">Add New Product</h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label text-gray-300">Product Name</label>
                <input
                  type="text"
                  value={newProduct.name || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="input bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-gray-300">Category</label>
                <select
                  value={newProduct.category || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  className="input bg-slate-700 border-slate-600 text-white"
                >
                  <option value="">Select category</option>
                  <option value="Ground Defense">Ground Defense</option>
                  <option value="Aerial Systems">Aerial Systems</option>
                  <option value="Naval Systems">Naval Systems</option>
                  <option value="Surveillance">Surveillance</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label text-gray-300">Description</label>
                <textarea
                  value={newProduct.description || ''}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  className="input bg-slate-700 border-slate-600 text-white h-24 resize-none"
                  placeholder="Enter product description"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-gray-300">Range</label>
                  <input
                    type="text"
                    value={newProduct.specifications?.range || ''}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      specifications: { ...prev.specifications, range: e.target.value }
                    }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 2.5 km"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label text-gray-300">Accuracy</label>
                  <input
                    type="text"
                    value={newProduct.specifications?.accuracy || ''}
                    onChange={(e) => setNewProduct(prev => ({
                      ...prev,
                      specifications: { ...prev.specifications, accuracy: e.target.value }
                    }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    placeholder="e.g., 99.7%"
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowAddProduct(false)}
                className="btn bg-slate-600 hover:bg-slate-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={addProduct}
                className="btn btn-primary"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Technology page component
  const TechnologyPage = () => (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container-wide">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Advanced AI Technology</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Our autonomous systems leverage cutting-edge artificial intelligence and machine learning 
            technologies to provide superior battlefield awareness and decision-making capabilities.
          </p>
        </div>

        {/* AI Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">AI-Powered Analysis Tools</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="card bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Document Analysis</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Upload defense documents, technical specifications, or contracts for AI-powered analysis 
                and key information extraction.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label text-gray-300">Upload Document</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="input bg-slate-700 border-slate-600 text-white"
                    accept=".pdf,.doc,.docx,.txt"
                    id="document-upload"
                  />
                </div>
                
                {isAiLoading && (
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                    Analyzing document...
                  </div>
                )}
                
                {aiError && (
                  <div className="alert alert-error text-sm">
                    {typeof aiError === 'string' ? aiError : 'Analysis failed'}
                  </div>
                )}
              </div>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Proposal Generation</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Generate professional defense industry proposals based on specific requirements 
                and technical specifications.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label text-gray-300">Requirements</label>
                  <textarea
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="input bg-slate-700 border-slate-600 text-white h-24 resize-none"
                    placeholder="Describe the defense system requirements..."
                    id="proposal-requirements"
                  />
                </div>
                
                <button
                  onClick={handleGenerateProposal}
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  id="generate-proposal-btn"
                >
                  {isAiLoading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Generate Proposal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* AI Results Display */}
          {aiResult && (
            <div className="card bg-slate-800 border border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h3 className="text-xl font-semibold text-white">Analysis Results</h3>
              </div>
              
              <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-gray-300 overflow-auto max-h-96">
                <pre className="whitespace-pre-wrap">{aiResult}</pre>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(aiResult || '');
                    alert('Results copied to clipboard!');
                  }}
                  className="btn btn-sm bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Copy Results
                </button>
                <button
                  onClick={() => setAiResult(null)}
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Core Technologies */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="card bg-slate-800 border border-slate-700">
            <div className="p-3 bg-blue-600 rounded-lg w-fit mb-4">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Neural Networks</h3>
            <p className="text-gray-300 mb-4">
              Deep learning architectures for pattern recognition, threat assessment, 
              and autonomous decision-making in complex combat scenarios.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Convolutional Neural Networks for image analysis</li>
              <li>• Recurrent networks for temporal pattern detection</li>
              <li>• Reinforcement learning for tactical optimization</li>
            </ul>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <div className="p-3 bg-blue-600 rounded-lg w-fit mb-4">
              <Eye className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Computer Vision</h3>
            <p className="text-gray-300 mb-4">
              Advanced visual processing systems for target identification, tracking, 
              and environmental analysis across multiple spectrums.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Multi-spectral image processing</li>
              <li>• Real-time object detection and classification</li>
              <li>• 3D scene reconstruction and mapping</li>
            </ul>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <div className="p-3 bg-blue-600 rounded-lg w-fit mb-4">
              <Satellite className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Sensor Fusion</h3>
            <p className="text-gray-300 mb-4">
              Integration of multiple sensor modalities for comprehensive situational 
              awareness and robust target acquisition capabilities.
            </p>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Radar and LiDAR integration</li>
              <li>• Thermal and optical sensor fusion</li>
              <li>• GPS and inertial navigation systems</li>
            </ul>
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6">System Capabilities</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Gauge className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">99.7%</div>
              <div className="text-gray-300">Target Accuracy</div>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">&lt;100ms</div>
              <div className="text-gray-300">Response Time</div>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">360°</div>
              <div className="text-gray-300">Coverage</div>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <Server className="h-8 w-8 text-white" />
              </div>
              <div className="text-2xl font-bold text-blue-400 mb-1">24/7</div>
              <div className="text-gray-300">Operations</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
    </div>
  );

  // About page component
  const AboutPage = () => (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container-wide">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">About ThorneGuard</h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Leading innovator in autonomous defense systems, combining cutting-edge AI technology 
            with military-grade engineering to protect and serve.
          </p>
        </div>

        {/* Company Overview */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-gray-300 mb-6 leading-relaxed">
              ThorneGuard was founded with a singular mission: to develop the most advanced 
              autonomous defense systems in the world. We believe that superior technology 
              and artificial intelligence can provide decisive advantages in modern warfare 
              while reducing risk to human personnel.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Our team of world-class engineers, AI researchers, and military veterans work 
              tirelessly to push the boundaries of what's possible in autonomous weaponry. 
              Every system we design is built to the highest standards of reliability, 
              accuracy, and operational effectiveness.
            </p>
            <div className="flex flex-wrap gap-4">
              {companyInfo.certifications.map(cert => (
                <span key={cert} className="badge badge-info">{cert}</span>
              ))}
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="card bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Founded</h3>
              </div>
              <p className="text-gray-300">
                Established in {companyInfo.founded} in Colorado Springs, the heart of 
                America's defense technology corridor.
              </p>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <Users className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Team</h3>
              </div>
              <p className="text-gray-300">
                Over {companyInfo.employees} dedicated professionals including AI researchers, 
                robotics engineers, and military specialists.
              </p>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700">
              <div className="flex items-center gap-4 mb-4">
                <Award className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-semibold text-white">Contracts</h3>
              </div>
              <p className="text-gray-300">
                {companyInfo.contracts} in active defense contracts with the U.S. Department 
                of Defense and allied nations.
              </p>
            </div>
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Leadership Team</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-slate-800 border border-slate-700 text-center">
              <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Dr. Sarah Mitchell</h3>
              <p className="text-blue-400 mb-3">Chief Executive Officer</p>
              <p className="text-gray-300 text-sm">
                Former DARPA program manager with 15+ years in defense technology development. 
                PhD in Robotics from MIT.
              </p>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700 text-center">
              <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Gen. Marcus Thorne (Ret.)</h3>
              <p className="text-blue-400 mb-3">Chief Technology Officer</p>
              <p className="text-gray-300 text-sm">
                Retired U.S. Army General with extensive combat experience and advanced 
                degrees in systems engineering.
              </p>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700 text-center">
              <div className="w-24 h-24 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Dr. Kevin Zhao</h3>
              <p className="text-blue-400 mb-3">Chief AI Officer</p>
              <p className="text-gray-300 text-sm">
                Former Google AI researcher specializing in computer vision and 
                autonomous systems. Stanford PhD in Computer Science.
              </p>
            </div>
          </div>
        </div>

        {/* Values and Principles */}
        <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Core Values</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Security First</h3>
              <p className="text-gray-300">
                Every system is designed with security as the foundational principle, 
                ensuring operational integrity and mission success.
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Precision Excellence</h3>
              <p className="text-gray-300">
                We strive for absolute precision in every aspect of our systems, 
                from targeting accuracy to manufacturing quality.
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Innovation Leadership</h3>
              <p className="text-gray-300">
                Continuous innovation drives our development process, ensuring 
                our clients always have access to the most advanced technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Contact page component
  const ContactPage = () => (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container-wide">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contact ThorneGuard</h1>
          <p className="text-xl text-gray-300">
            Get in touch with our team to discuss your defense requirements and explore 
            our autonomous weapons systems.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card bg-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Send an Inquiry</h2>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-gray-300">Full Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter your full name"
                    id="contact-name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label text-gray-300">Email *</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter your email"
                    id="contact-email"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-gray-300">Company/Organization</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    placeholder="Enter company name"
                    id="contact-company"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label text-gray-300">Priority Level</label>
                  <select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm(prev => ({ ...prev, priority: e.target.value as ContactInquiry['priority'] }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    id="contact-priority"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label text-gray-300">Subject</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="input bg-slate-700 border-slate-600 text-white"
                  placeholder="Enter inquiry subject"
                  id="contact-subject"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-gray-300">Message *</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  className="input bg-slate-700 border-slate-600 text-white h-32 resize-none"
                  placeholder="Describe your requirements, timeline, and any specific questions..."
                  id="contact-message"
                />
              </div>
              
              <button
                onClick={submitInquiry}
                className="btn btn-primary w-full"
                id="submit-inquiry-btn"
              >
                <Mail className="h-4 w-4 mr-2" />
                Send Inquiry
              </button>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card bg-slate-800 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Get in Touch</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Sales Hotline</div>
                    <div className="text-gray-300">+1 (719) 555-GUARD</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Sales Email</div>
                    <div className="text-gray-300">sales@thorneguard.com</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <div>
                    <div className="text-white font-medium">Headquarters</div>
                    <div className="text-gray-300">
                      1250 Defense Way<br />
                      Colorado Springs, CO 80906
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Business Hours</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Monday - Friday:</span>
                  <span className="text-white">8:00 AM - 6:00 PM MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Saturday:</span>
                  <span className="text-white">9:00 AM - 2:00 PM MT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Sunday:</span>
                  <span className="text-white">Emergency Only</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Emergency Line:</span>
                  <span className="text-white">24/7 Available</span>
                </div>
              </div>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-4">Security Clearance</h3>
              <p className="text-gray-300 text-sm mb-4">
                All inquiries are handled with the highest level of security. For classified 
                discussions, please use our secure communication channels.
              </p>
              <div className="flex items-center gap-2 text-green-400">
                <Lock className="h-4 w-4" />
                <span className="text-sm">ITAR Compliant Communications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Inquiries (for admin users) */}
        {currentUser && inquiries.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Inquiries</h2>
            
            <div className="grid gap-4">
              {inquiries.slice(0, 5).map(inquiry => (
                <div key={inquiry.id} className="card bg-slate-800 border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{inquiry.name}</h3>
                      <p className="text-gray-300">{inquiry.email} • {inquiry.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${
                        inquiry.priority === 'Critical' ? 'badge-error' :
                        inquiry.priority === 'High' ? 'badge-warning' :
                        inquiry.priority === 'Medium' ? 'badge-info' : 'badge-success'
                      }`}>
                        {inquiry.priority}
                      </span>
                      <span className={`badge ${
                        inquiry.status === 'New' ? 'badge-info' :
                        inquiry.status === 'In Review' ? 'badge-warning' :
                        inquiry.status === 'Responded' ? 'badge-success' : 'bg-gray-500 text-white'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-2">
                    <strong>Subject:</strong> {inquiry.subject || 'No subject'}
                  </p>
                  <p className="text-gray-300 text-sm mb-3">{inquiry.message}</p>
                  <p className="text-gray-400 text-xs">{inquiry.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Settings page component
  const SettingsPage = () => (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="container-wide max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
          <p className="text-xl text-gray-300">
            Manage your system preferences and application data.
          </p>
        </div>

        <div className="space-y-8">
          {/* General Settings */}
          <div className="card bg-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label text-gray-300">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings('language', e.target.value)}
                    className="input bg-slate-700 border-slate-600 text-white"
                    id="settings-language"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label text-gray-300">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => updateSettings('currency', e.target.value)}
                    className="input bg-slate-700 border-slate-600 text-white"
                    id="settings-currency"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label text-gray-300">Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => updateSettings('timezone', e.target.value)}
                  className="input bg-slate-700 border-slate-600 text-white"
                  id="settings-timezone"
                >
                  <option value="UTC-8">Pacific Time (UTC-8)</option>
                  <option value="UTC-7">Mountain Time (UTC-7)</option>
                  <option value="UTC-6">Central Time (UTC-6)</option>
                  <option value="UTC-5">Eastern Time (UTC-5)</option>
                  <option value="UTC+0">GMT (UTC+0)</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="form-label text-gray-300">Dark Mode</label>
                  <p className="text-sm text-gray-400">Toggle between light and dark themes</p>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`theme-toggle ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                  aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  id="settings-theme-toggle"
                >
                  <span className="theme-toggle-thumb"></span>
                </button>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="card bg-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Data Management</h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={exportData}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                  id="export-data-btn"
                >
                  <Download className="h-4 w-4" />
                  Export All Data
                </button>
                
                <div className="relative">
                  <input
                    type="file"
                    id="import-data"
                    className="hidden"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            const data = JSON.parse(event.target?.result as string);
                            if (data.products) setProducts(data.products);
                            if (data.inquiries) setInquiries(data.inquiries);
                            if (data.documents) setDocuments(data.documents);
                            if (data.settings) setSettings(data.settings);
                            alert('Data imported successfully!');
                          } catch (error) {
                            alert('Error importing data. Please check the file format.');
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <button
                    onClick={() => document.getElementById('import-data')?.click()}
                    className="btn bg-green-600 hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Import Data
                  </button>
                </div>
              </div>
              
              <div className="border-t border-slate-600 pt-6">
                <h3 className="text-lg font-semibold text-red-400 mb-3">Danger Zone</h3>
                <button
                  onClick={clearAllData}
                  className="btn bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                  id="clear-data-btn"
                >
                  <X className="h-4 w-4" />
                  Clear All Data
                </button>
                <p className="text-sm text-gray-400 mt-2">
                  This will permanently delete all products, inquiries, and documents. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Documents Management */}
          <div className="card bg-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Document Management</h2>
            
            <div className="space-y-4">
              <div>
                <label className="form-label text-gray-300">Upload Documents</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  className="input bg-slate-700 border-slate-600 text-white"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                  id="settings-file-upload"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG
                </p>
              </div>
              
              {documents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Uploaded Documents</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-blue-400" />
                          <div>
                            <div className="text-white font-medium">{doc.name}</div>
                            <div className="text-gray-400 text-sm">{doc.size} • {doc.uploadDate}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setDocuments(prev => prev.filter(d => d.id !== doc.id));
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Statistics */}
          <div className="card bg-slate-800 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">System Statistics</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="stat-card bg-slate-700">
                <div className="stat-title">Total Products</div>
                <div className="stat-value">{products.length}</div>
                <div className="stat-desc">Defense systems in catalog</div>
              </div>
              
              <div className="stat-card bg-slate-700">
                <div className="stat-title">Customer Inquiries</div>
                <div className="stat-value">{inquiries.length}</div>
                <div className="stat-desc">Total contact submissions</div>
              </div>
              
              <div className="stat-card bg-slate-700">
                <div className="stat-title">Documents</div>
                <div className="stat-value">{documents.length}</div>
                <div className="stat-desc">Uploaded and analyzed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Main render
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''} theme-transition-all`}>
      <Navigation />
      
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'products' && <ProductsPage />}
      {currentPage === 'technology' && <TechnologyPage />}
      {currentPage === 'about' && <AboutPage />}
      {currentPage === 'contact' && <ContactPage />}
      {currentPage === 'settings' && <SettingsPage />}
      
      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8 mt-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold text-white">ThorneGuard</span>
            </div>
            <p className="text-gray-400 text-sm text-center md:text-right">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;