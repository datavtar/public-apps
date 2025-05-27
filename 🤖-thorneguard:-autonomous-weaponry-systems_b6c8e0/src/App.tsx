import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import LoginForm from './components/LoginForm';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Shield,
  Target,
  Cpu,
  Satellite,
  Compass,
  Zap,
  Eye,
  Brain,
  Settings,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Send,
  User,
  Globe,
  Gauge,
  Lock,
  CheckCircle,
  Star,
  Award,
  Users,
  Calendar,
  Download,
  FileText,
  Image,
  Play,
  Pause
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  specifications: {
    range: string;
    accuracy: string;
    autonomy: string;
    payload: string;
  };
  image: string;
  status: 'operational' | 'development' | 'testing';
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
  image: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  organization: string;
  message: string;
  timestamp: string;
  status: 'new' | 'reviewed';
}

interface ChatMessage {
  id: string;
  message: string;
  isUser: boolean;
  timestamp: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    organization: '',
    message: ''
  });
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([]);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  
  // AI Layer integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any | null>(null);

  const products: Product[] = [
    {
      id: 'aegis-drone',
      name: 'Aegis Autonomous Drone',
      category: 'Aerial Systems',
      description: 'Advanced autonomous aerial platform with AI-powered target recognition and engagement capabilities.',
      features: [
        'Autonomous flight and navigation',
        'AI-powered target identification',
        'Real-time threat assessment',
        'Swarm coordination capabilities',
        'Electronic warfare resistance'
      ],
      specifications: {
        range: '50km operational radius',
        accuracy: '±0.5m precision targeting',
        autonomy: '6 hours continuous operation',
        payload: '15kg maximum capacity'
      },
      image: '/api/placeholder/400/300',
      status: 'operational'
    },
    {
      id: 'sentinel-turret',
      name: 'Sentinel Defense Turret',
      category: 'Ground Systems',
      description: 'Stationary autonomous defense system with 360-degree coverage and multi-target engagement.',
      features: [
        'AI threat detection',
        '360-degree coverage',
        'Multi-target engagement',
        'Weather-resistant design',
        'Remote monitoring integration'
      ],
      specifications: {
        range: '2km effective range',
        accuracy: '±0.1m at maximum range',
        autonomy: '24/7 continuous operation',
        payload: 'Variable ammunition types'
      },
      image: '/api/placeholder/400/300',
      status: 'operational'
    },
    {
      id: 'guardian-robot',
      name: 'Guardian Combat Robot',
      category: 'Ground Systems',
      description: 'Mobile autonomous ground unit for patrol, reconnaissance, and tactical engagement.',
      features: [
        'Terrain adaptation',
        'Stealth capabilities',
        'Multi-sensor fusion',
        'Tactical communication',
        'Modular weapon systems'
      ],
      specifications: {
        range: '100km mission radius',
        accuracy: '±0.3m targeting precision',
        autonomy: '12 hours field operation',
        payload: '50kg equipment capacity'
      },
      image: '/api/placeholder/400/300',
      status: 'testing'
    },
    {
      id: 'phantom-interceptor',
      name: 'Phantom Missile Interceptor',
      category: 'Air Defense',
      description: 'High-speed autonomous interceptor for incoming missile and aircraft threats.',
      features: [
        'Hypersonic capability',
        'Predictive targeting AI',
        'Multi-stage interception',
        'Network coordination',
        'Countermeasure resistance'
      ],
      specifications: {
        range: '200km interception range',
        accuracy: '99.5% intercept success rate',
        autonomy: 'Launch-ready 24/7',
        payload: 'Kinetic kill vehicle'
      },
      image: '/api/placeholder/400/300',
      status: 'development'
    }
  ];

  const newsItems: NewsItem[] = [
    {
      id: 'news-1',
      title: 'ThorneGuard Receives $500M Defense Contract',
      summary: 'Major contract awarded for next-generation autonomous defense systems deployment.',
      date: '2024-12-15',
      category: 'Contract Award',
      image: '/api/placeholder/300/200'
    },
    {
      id: 'news-2',
      title: 'AI Defense Technology Breakthrough',
      summary: 'Revolutionary advancement in autonomous threat detection and response systems.',
      date: '2024-12-10',
      category: 'Technology',
      image: '/api/placeholder/300/200'
    },
    {
      id: 'news-3',
      title: 'International Defense Expo Participation',
      summary: 'Showcasing cutting-edge autonomous weaponry at the Global Defense Summit.',
      date: '2024-12-05',
      category: 'Events',
      image: '/api/placeholder/300/200'
    }
  ];

  useEffect(() => {
    const saved = localStorage.getItem('thorneguard-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setContactMessages(data.contactMessages || []);
        setChatMessages(data.chatMessages || []);
        setDarkMode(data.darkMode ?? true);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
    
    // Initialize with welcome message
    if (chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        message: 'Welcome to ThorneGuard Defense Systems. How can I assist you with information about our autonomous weaponry and defense solutions?',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setChatMessages([welcomeMessage]);
    }
  }, []);

  useEffect(() => {
    const data = {
      contactMessages,
      chatMessages,
      darkMode
    };
    localStorage.setItem('thorneguard-data', JSON.stringify(data));
  }, [contactMessages, chatMessages, darkMode]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const newMessage: ContactMessage = {
      id: 'contact-' + Date.now(),
      name: contactForm.name,
      email: contactForm.email,
      organization: contactForm.organization,
      message: contactForm.message,
      timestamp: new Date().toISOString(),
      status: 'new'
    };

    setContactMessages(prev => [newMessage, ...prev]);
    setContactForm({ name: '', email: '', organization: '', message: '' });
    alert('Thank you for your inquiry. We will contact you shortly.');
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: 'user-' + Date.now(),
      message: chatInput.trim(),
      isUser: true,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    
    // Prepare AI prompt with context
    const contextPrompt = `You are an AI assistant for ThorneGuard Defense Systems, a military defense technology company specializing in autonomous weaponry systems. Our products include:

1. Aegis Autonomous Drone - Advanced aerial platform with AI-powered target recognition
2. Sentinel Defense Turret - Stationary autonomous defense system with 360-degree coverage
3. Guardian Combat Robot - Mobile autonomous ground unit for patrol and tactical engagement
4. Phantom Missile Interceptor - High-speed autonomous interceptor for missile threats

Company focus areas:
- Autonomous weaponry systems
- AI-powered defense technology
- Robotics and automation
- Military applications
- Defense contracts and solutions

User inquiry: ${chatInput.trim()}

Provide a professional, informative response about ThorneGuard's capabilities, products, or services. Keep responses concise and focused on defense technology.`;
    
    setPromptText(contextPrompt);
    setChatInput('');
    
    try {
      aiLayerRef.current?.sendToAI(contextPrompt);
    } catch (error) {
      console.error('AI chat error:', error);
      const errorMessage: ChatMessage = {
        id: 'error-' + Date.now(),
        message: 'I apologize, but I\'m currently experiencing technical difficulties. Please contact our team directly for immediate assistance.',
        isUser: false,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleAIResult = (result: string) => {
    setAiResult(result);
    
    const botMessage: ChatMessage = {
      id: 'bot-' + Date.now(),
      message: result,
      isUser: false,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, botMessage]);
  };

  const handleAIError = (error: any) => {
    setError(error);
    
    const errorMessage: ChatMessage = {
      id: 'error-' + Date.now(),
      message: 'I apologize, but I\'m currently experiencing technical difficulties. Please contact our team directly for immediate assistance.',
      isUser: false,
      timestamp: new Date().toISOString()
    };
    
    setChatMessages(prev => [...prev, errorMessage]);
  };

  const downloadBrochure = () => {
    const brochureData = products.map(product => ({
      Name: product.name,
      Category: product.category,
      Description: product.description,
      Range: product.specifications.range,
      Accuracy: product.specifications.accuracy,
      Autonomy: product.specifications.autonomy,
      Payload: product.specifications.payload,
      Status: product.status
    }));

    const csvContent = [
      Object.keys(brochureData[0]).join(','),
      ...brochureData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'thorneguard-products-brochure.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div id="welcome_fallback" className={`min-h-screen transition-all duration-300 ${darkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* AILayer Integration */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={handleAIResult}
        onError={handleAIError}
        onLoading={setIsLoading}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${styles.glassEffect}`}>
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div id="generation_issue_fallback" className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold text-white">ThorneGuard</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                id="nav-home"
                onClick={() => scrollToSection('home')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeSection === 'home' ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                id="nav-products"
                onClick={() => scrollToSection('products')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeSection === 'products' ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:text-white'
                }`}
              >
                Products
              </button>
              <button
                id="nav-about"
                onClick={() => scrollToSection('about')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeSection === 'about' ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:text-white'
                }`}
              >
                About
              </button>
              <button
                id="nav-news"
                onClick={() => scrollToSection('news')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeSection === 'news' ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:text-white'
                }`}
              >
                News
              </button>
              <button
                id="nav-contact"
                onClick={() => scrollToSection('contact')}
                className={`px-3 py-2 rounded-md transition-colors ${
                  activeSection === 'contact' ? 'text-red-400 bg-red-500/10' : 'text-gray-300 hover:text-white'
                }`}
              >
                Contact
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-t border-slate-700">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {['home', 'products', 'about', 'news', 'contact'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="block px-3 py-2 text-gray-300 hover:text-white capitalize w-full text-left"
                  >
                    {section}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className={`relative min-h-screen flex items-center ${styles.heroSection}`}>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-800/70"></div>
        <div className="container-wide relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Autonomous Defense
              <span className="text-red-400 block">Technology</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Next-generation AI-powered weaponry systems for modern military operations.
              Precision, autonomy, and reliability when it matters most.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                id="hero-products-btn"
                onClick={() => scrollToSection('products')}
                className="btn-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
              >
                Explore Systems
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={downloadBrochure}
                className="btn-lg border-2 border-white text-white hover:bg-white hover:text-slate-900 flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Download className="h-5 w-5" />
                Download Brochure
              </button>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className={styles.backgroundAnimation}>
          <div className={styles.floatingIcon}>
            <Target className="h-8 w-8 text-red-400/30" />
          </div>
          <div className={styles.floatingIcon} style={{ animationDelay: '2s' }}>
            <Satellite className="h-6 w-6 text-blue-400/30" />
          </div>
          <div className={styles.floatingIcon} style={{ animationDelay: '4s' }}>
            <Cpu className="h-10 w-10 text-green-400/30" />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-slate-800">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Advanced Defense Systems
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our cutting-edge autonomous weaponry combines artificial intelligence with precision engineering
              to deliver unmatched performance in critical defense scenarios.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                id={`product-${product.id}`}
                className={`card bg-slate-900/50 border border-slate-700 hover:border-red-500/50 transition-all duration-300 group hover:scale-105 ${styles.productCard}`}
              >
                <div className="relative overflow-hidden rounded-lg mb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`badge ${
                      product.status === 'operational' ? 'badge-success' :
                      product.status === 'testing' ? 'badge-warning' :
                      'badge-info'
                    }`}>
                      {product.status === 'operational' ? 'Operational' :
                       product.status === 'testing' ? 'Testing' : 'Development'}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                <p className="text-red-400 text-sm font-medium mb-3">{product.category}</p>
                <p className="text-gray-400 mb-4">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Range</p>
                    <p className="text-white font-medium">{product.specifications.range}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Accuracy</p>
                    <p className="text-white font-medium">{product.specifications.accuracy}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-900">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Leading Defense Innovation
              </h2>
              <p className="text-lg text-gray-400 mb-6">
                ThorneGuard Defense Systems stands at the forefront of autonomous military technology,
                developing AI-powered defense solutions that protect national interests worldwide.
              </p>
              <p className="text-lg text-gray-400 mb-8">
                Our team of experts combines decades of military experience with cutting-edge
                artificial intelligence research to create the next generation of defense systems.
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">15+</div>
                  <div className="text-gray-400">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">50+</div>
                  <div className="text-gray-400">Defense Contracts</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">200+</div>
                  <div className="text-gray-400">Engineers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400 mb-2">99.9%</div>
                  <div className="text-gray-400">Mission Success</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-600/10 rounded-lg flex items-center justify-center">
                  <Brain className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Artificial Intelligence</h3>
                  <p className="text-gray-400">
                    Advanced AI algorithms for autonomous decision-making and threat assessment.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center">
                  <Cpu className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Precision Engineering</h3>
                  <p className="text-gray-400">
                    Military-grade hardware designed for extreme conditions and maximum reliability.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Security First</h3>
                  <p className="text-gray-400">
                    Cybersecurity and operational security built into every system from the ground up.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 bg-slate-800">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Latest Developments
            </h2>
            <p className="text-xl text-gray-400">
              Stay updated with our latest breakthroughs and industry announcements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <article
                key={item.id}
                id={`news-${item.id}`}
                className="card bg-slate-900/50 border border-slate-700 hover:border-red-500/50 transition-all duration-300 group"
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="badge bg-red-600 text-white">{item.category}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {new Date(item.date).toLocaleDateString()}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-gray-400">{item.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Connect With Our Team
            </h2>
            <p className="text-xl text-gray-400">
              Ready to discuss your defense requirements? Get in touch with our experts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="card bg-slate-800/50 border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6">Send us a Message</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="form-group">
                  <label className="form-label text-gray-300">Name *</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label text-gray-300">Email *</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label text-gray-300">Organization</label>
                  <input
                    id="contact-organization"
                    type="text"
                    value={contactForm.organization}
                    onChange={(e) => setContactForm(prev => ({ ...prev, organization: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label text-gray-300">Message *</label>
                  <textarea
                    id="contact-message"
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white h-32 resize-none"
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn btn-primary w-full flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="card bg-slate-800/50 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-red-400" />
                    <span className="text-gray-300">defense@thorneguard.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-red-400" />
                    <span className="text-gray-300">+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-red-400" />
                    <span className="text-gray-300">Arlington, VA 22201, USA</span>
                  </div>
                </div>
              </div>
              
              <div className="card bg-slate-800/50 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Security Clearance</h3>
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Top Secret / SCI Cleared</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">ITAR Compliant</span>
                </div>
              </div>
              
              <div className="card bg-slate-800/50 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Certifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300">ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300">AS9100D</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-400" />
                    <span className="text-gray-300">CMMI Level 3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div 
          className="modal-backdrop"
          onClick={() => setSelectedProduct(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-title"
        >
          <div 
            className="modal-content bg-slate-800 border border-slate-700 max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="product-modal-title" className="text-2xl font-bold text-white">
                {selectedProduct.name}
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-white"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                
                <h4 className="text-lg font-semibold text-white mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {selectedProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-gray-300">
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <p className="text-gray-300 mb-6">{selectedProduct.description}</p>
                
                <h4 className="text-lg font-semibold text-white mb-4">Technical Specifications</h4>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-gray-400">Operational Range:</span>
                    <span className="text-white">{selectedProduct.specifications.range}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-gray-400">Targeting Accuracy:</span>
                    <span className="text-white">{selectedProduct.specifications.accuracy}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-gray-400">Autonomous Operation:</span>
                    <span className="text-white">{selectedProduct.specifications.autonomy}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-700 pb-2">
                    <span className="text-gray-400">Payload Capacity:</span>
                    <span className="text-white">{selectedProduct.specifications.payload}</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <span className={`badge ${
                    selectedProduct.status === 'operational' ? 'badge-success' :
                    selectedProduct.status === 'testing' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    Status: {selectedProduct.status === 'operational' ? 'Operational' :
                             selectedProduct.status === 'testing' ? 'Testing' : 'Development'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setSelectedProduct(null)}
                className="btn bg-gray-600 text-white hover:bg-gray-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  scrollToSection('contact');
                }}
                className="btn btn-primary"
              >
                Request Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Button */}
      <button
        id="chat-toggle"
        onClick={() => setChatOpen(!chatOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 z-40 ${chatOpen ? 'rotate-45' : 'hover:scale-110'}`}
      >
        {chatOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* AI Chat Window */}
      {chatOpen && (
        <div id="chat-window" className="fixed bottom-24 right-6 w-80 h-96 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-30 flex flex-col">
          <div className="bg-red-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">ThorneGuard Assistant</h3>
            <p className="text-sm text-red-100">Ask about our defense systems</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  msg.isUser 
                    ? 'bg-red-600 text-white' 
                    : 'bg-slate-700 text-gray-300'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-gray-300 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className={styles.typingIndicator}></div>
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Ask about our systems..."
                className="flex-1 input bg-slate-700 border-slate-600 text-white text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleChatSubmit}
                disabled={isLoading || !chatInput.trim()}
                className="btn btn-primary px-3 py-2 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-red-500" />
              <span className="text-lg font-bold text-white">ThorneGuard Defense Systems</span>
            </div>
            
            {!currentUser ? (
              <LoginForm title="Admin Login" subtitle="Content Management" />
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Admin: {currentUser.first_name}</span>
                <button
                  onClick={logout}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-gray-400">
            <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;