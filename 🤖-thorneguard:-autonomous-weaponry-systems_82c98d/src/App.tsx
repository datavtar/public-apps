import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Shield,
  Target,
  Cpu,
  Satellite,
  Navigation,
  Settings,
  Menu,
  X,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  User,
  LogOut,
  FileText,
  Download,
  Upload,
  Check,
  Star,
  ArrowRight,
  Play,
  Brain,
  Zap,
  Lock
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
    autonomy: string;
    precision: string;
  };
  image: string;
  status: 'operational' | 'development' | 'testing';
}

interface ContactForm {
  name: string;
  email: string;
  company: string;
  message: string;
  clearanceLevel: string;
}

interface Settings {
  theme: 'light' | 'dark';
  language: 'en' | 'es' | 'fr' | 'de';
  autoPlay: boolean;
  notifications: boolean;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // AI Layer State
  const [promptText, setPromptText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  // App State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    message: '',
    clearanceLevel: 'public'
  });
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    language: 'en',
    autoPlay: true,
    notifications: true
  });
  const [showAiPanel, setShowAiPanel] = useState<boolean>(false);
  const [analysisType, setAnalysisType] = useState<string>('document');

  const products: Product[] = [
    {
      id: 'thor-1',
      name: 'THOR-1 Autonomous Sentry',
      category: 'Perimeter Defense',
      description: 'Advanced autonomous sentry system with AI-powered threat detection and engagement capabilities.',
      specifications: {
        range: '2.5km',
        payload: '40mm grenades / 7.62mm',
        autonomy: '72 hours',
        precision: '99.7% accuracy'
      },
      image: '/api/placeholder/400/300',
      status: 'operational'
    },
    {
      id: 'guardian-x',
      name: 'Guardian-X Patrol Drone',
      category: 'Aerial Surveillance',
      description: 'Multi-role autonomous drone for reconnaissance and targeted elimination missions.',
      specifications: {
        range: '50km',
        payload: 'Hellfire missiles / 20mm cannon',
        autonomy: '18 hours',
        precision: '99.9% accuracy'
      },
      image: '/api/placeholder/400/300',
      status: 'operational'
    },
    {
      id: 'aegis-shield',
      name: 'AEGIS Shield System',
      category: 'Point Defense',
      description: 'Rapid-response anti-projectile system with predictive AI targeting algorithms.',
      specifications: {
        range: '5km',
        payload: 'Interceptor missiles',
        autonomy: 'Continuous',
        precision: '99.95% intercept rate'
      },
      image: '/api/placeholder/400/300',
      status: 'testing'
    },
    {
      id: 'titan-mech',
      name: 'TITAN Assault Mech',
      category: 'Heavy Combat',
      description: 'Next-generation autonomous combat platform for urban warfare scenarios.',
      specifications: {
        range: '10km',
        payload: 'Multi-weapon systems',
        autonomy: '48 hours',
        precision: '99.8% accuracy'
      },
      image: '/api/placeholder/400/300',
      status: 'development'
    }
  ];

  const capabilities = [
    {
      icon: Brain,
      title: 'Advanced AI Integration',
      description: 'Cutting-edge machine learning algorithms for autonomous decision-making'
    },
    {
      icon: Target,
      title: 'Precision Targeting',
      description: 'Sub-meter accuracy with advanced ballistic compensation systems'
    },
    {
      icon: Shield,
      title: 'Defensive Systems',
      description: 'Multi-layered protection against conventional and electronic threats'
    },
    {
      icon: Satellite,
      title: 'Network Integration',
      description: 'Seamless connectivity with existing command and control infrastructure'
    }
  ];

  const stats = [
    { label: 'Active Deployments', value: '50+', icon: Target },
    { label: 'Mission Success Rate', value: '99.8%', icon: Check },
    { label: 'Countries Served', value: '25', icon: Globe },
    { label: 'R&D Investment', value: '$2.5B', icon: Brain }
  ];

  useEffect(() => {
    const savedSettings = localStorage.getItem('thorneguard_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedContacts = localStorage.getItem('thorneguard_contacts');
    if (!savedContacts) {
      localStorage.setItem('thorneguard_contacts', JSON.stringify([]));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('thorneguard_settings', JSON.stringify(settings));
    
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contacts = JSON.parse(localStorage.getItem('thorneguard_contacts') || '[]');
    const newContact = {
      ...contactForm,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    contacts.push(newContact);
    localStorage.setItem('thorneguard_contacts', JSON.stringify(contacts));
    
    setContactForm({
      name: '',
      email: '',
      company: '',
      message: '',
      clearanceLevel: 'public'
    });
    
    alert('Contact request submitted successfully. Our team will reach out within 24 hours.');
  };

  const handleAiAnalysis = () => {
    if (!promptText?.trim() && !selectedFile) {
      setAiError('Please provide text or select a file for analysis.');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    let prompt = promptText;
    if (!prompt && selectedFile) {
      if (analysisType === 'document') {
        prompt = 'Analyze this document and extract key technical specifications, capabilities, and strategic information. Return JSON with keys "summary", "specifications", "capabilities", "recommendations".';
      } else if (analysisType === 'threat') {
        prompt = 'Analyze this content for threat assessment. Identify potential risks, vulnerabilities, and countermeasures. Return JSON with keys "threat_level", "risks", "vulnerabilities", "countermeasures".';
      } else {
        prompt = 'Analyze this content and provide a comprehensive assessment relevant to defense and security applications.';
      }
    }
    
    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const downloadContacts = () => {
    const contacts = JSON.parse(localStorage.getItem('thorneguard_contacts') || '[]');
    
    if (contacts.length === 0) {
      alert('No contact data to download.');
      return;
    }
    
    const csvContent = [
      'Name,Email,Company,Clearance Level,Message,Timestamp',
      ...contacts.map((contact: any) => 
        `"${contact.name}","${contact.email}","${contact.company}","${contact.clearanceLevel}","${contact.message.replace(/"/g, '""')}","${contact.timestamp}"`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thorneguard_contacts.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('thorneguard_contacts');
      localStorage.removeItem('thorneguard_settings');
      setContactForm({
        name: '',
        email: '',
        company: '',
        message: '',
        clearanceLevel: 'public'
      });
      alert('All data cleared successfully.');
    }
  };

  const renderHome = () => (
    <div className="space-y-16">
      {/* Hero Section */}
      <section id="welcome_fallback" className={`${styles.heroSection} relative min-h-screen flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90"></div>
        <div className="relative z-10 container-wide text-center text-white">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              THORNEGUARD
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl mb-8 text-gray-300">
              Autonomous Defense Systems
            </p>
            <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-gray-400">
              Leading the future of military technology with AI-powered autonomous weaponry systems designed for modern warfare scenarios.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                id="explore-products-btn"
                onClick={() => setCurrentPage('products')}
                className="btn-responsive bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <Target className="h-5 w-5" />
                Explore Systems
              </button>
              <button 
                onClick={() => setCurrentPage('contact')}
                className="btn-responsive bg-transparent border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Mail className="h-5 w-5" />
                Request Access
              </button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronRight className="h-6 w-6 text-red-400 rotate-90" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="stat-card text-center group hover:scale-105 transition-transform duration-300">
                <IconComponent className="h-8 w-8 text-red-500 mx-auto mb-3 group-hover:text-red-400 transition-colors" />
                <div className="stat-value text-red-600 dark:text-red-400">{stat.value}</div>
                <div className="stat-title">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Core Capabilities
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Advanced autonomous systems engineered for maximum effectiveness and reliability in critical defense scenarios.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((capability, index) => {
            const IconComponent = capability.icon;
            return (
              <div key={index} className="card group hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="flex flex-col items-center text-center">
                  <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full mb-4 group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                    <IconComponent className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {capability.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {capability.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Products Preview */}
      <section className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Featured Systems
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Cutting-edge autonomous defense platforms
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {products.slice(0, 3).map((product) => (
            <div key={product.id} className="card group hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                <div className="w-full h-48 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
                  <Target className="h-16 w-16 text-red-500" />
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`badge ${
                  product.status === 'operational' ? 'badge-success' :
                  product.status === 'testing' ? 'badge-warning' : 'badge-info'
                }`}>
                  {product.status.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{product.category}</span>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                {product.name}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {product.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Range:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.specifications.range}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Precision:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{product.specifications.precision}</span>
                </div>
              </div>
              
              <button 
                onClick={() => setCurrentPage('products')}
                className="w-full btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => setCurrentPage('products')}
            className="btn-responsive bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 mx-auto"
          >
            View All Systems
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );

  const renderProducts = () => (
    <div className="container-wide space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Defense Systems Portfolio
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Comprehensive range of autonomous weaponry systems designed for modern military operations and strategic defense initiatives.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {products.map((product) => (
          <div key={product.id} id={`product-${product.id}`} className="card-lg group hover:shadow-2xl transition-all duration-500">
            <div className="aspect-w-16 aspect-h-9 mb-6 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <div className="w-full h-64 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center group-hover:from-slate-600 group-hover:to-slate-800 transition-all duration-500">
                <Target className="h-24 w-24 text-red-500 group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <span className={`badge ${
                product.status === 'operational' ? 'badge-success' :
                product.status === 'testing' ? 'badge-warning' : 'badge-info'
              }`}>
                {product.status.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{product.category}</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              {product.name}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {product.description}
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Range</div>
                  <div className="font-medium text-gray-900 dark:text-white">{product.specifications.range}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Payload</div>
                  <div className="font-medium text-gray-900 dark:text-white">{product.specifications.payload}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Autonomy</div>
                  <div className="font-medium text-gray-900 dark:text-white">{product.specifications.autonomy}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Precision</div>
                  <div className="font-medium text-gray-900 dark:text-white">{product.specifications.precision}</div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                Request Info
              </button>
              <button 
                onClick={() => {
                  setPromptText(`Analyze the ${product.name} system specifications and provide strategic assessment. Focus on operational capabilities, deployment scenarios, and tactical advantages.`);
                  setAnalysisType('document');
                  setShowAiPanel(true);
                }}
                className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
              >
                <Brain className="h-4 w-4" />
                AI Analysis
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="container-wide space-y-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          About ThorneGuard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Pioneering the future of autonomous defense through cutting-edge AI and robotics technology.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Our Mission
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            ThorneGuard is dedicated to developing advanced autonomous weaponry systems that provide superior defensive capabilities while maintaining the highest standards of reliability and precision. Our technology serves to protect personnel and strategic assets in the most challenging operational environments.
          </p>
          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            With over two decades of experience in defense technology, we combine military expertise with cutting-edge AI research to deliver solutions that exceed the demands of modern warfare.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg p-8 text-white">
          <h3 className="text-2xl font-bold mb-6">Key Achievements</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <span>50+ successful military deployments</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <span>99.8% mission success rate</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <span>25 countries served worldwide</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <span>$2.5B invested in R&D</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-400" />
              <span>ISO 9001 & ISO 27001 certified</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card text-center">
          <Brain className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">AI Research</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Advanced machine learning algorithms for autonomous decision-making and threat assessment.
          </p>
        </div>
        
        <div className="card text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Defense Systems</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive protection solutions for military installations and strategic assets.
          </p>
        </div>
        
        <div className="card text-center">
          <Target className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Precision Engineering</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Sub-meter accuracy targeting systems with advanced ballistic compensation.
          </p>
        </div>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white text-center">
          Security & Compliance
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-4xl mx-auto leading-relaxed">
          All ThorneGuard systems are developed in compliance with international defense regulations and export controls. 
          Our facilities maintain the highest security clearances and undergo regular audits to ensure complete operational security. 
          We work exclusively with authorized military and government agencies.
        </p>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="container-wide space-y-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Contact ThorneGuard
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Connect with our defense specialists to discuss your strategic requirements and explore our autonomous systems portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Get in Touch
          </h2>
          
          <form id="contact-form" onSubmit={handleContactSubmit} className="space-y-6">
            <div className="form-group">
              <label className="form-label" htmlFor="contact-name">Full Name *</label>
              <input
                id="contact-name"
                type="text"
                className="input"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="contact-email">Email Address *</label>
              <input
                id="contact-email"
                type="email"
                className="input"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="contact-company">Organization/Agency *</label>
              <input
                id="contact-company"
                type="text"
                className="input"
                value={contactForm.company}
                onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="clearance-level">Security Clearance Level</label>
              <select
                id="clearance-level"
                className="input"
                value={contactForm.clearanceLevel}
                onChange={(e) => setContactForm(prev => ({ ...prev, clearanceLevel: e.target.value }))}
              >
                <option value="public">Public</option>
                <option value="confidential">Confidential</option>
                <option value="secret">Secret</option>
                <option value="top-secret">Top Secret</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="contact-message">Message *</label>
              <textarea
                id="contact-message"
                rows={6}
                className="input"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Please describe your requirements, operational context, and specific systems of interest..."
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <Mail className="h-5 w-5" />
              Submit Request
            </button>
          </form>
        </div>
        
        <div className="space-y-8">
          <div className="card">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Contact Information
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">+1 (555) 0123-4567</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">defense@thorneguard.com</span>
              </div>
              
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  ThorneGuard Defense Systems<br />
                  1247 Defense Boulevard<br />
                  Arlington, VA 22201
                </span>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Response Time
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Our defense specialists typically respond to qualified inquiries within 24 hours. 
              For urgent requirements, please call our direct line.
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Security Notice
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    All communications are subject to security verification. Please include your organization details and clearance level.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              AI Document Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload technical specifications or requirements documents for AI-powered analysis and recommendations.
            </p>
            <button
              onClick={() => setShowAiPanel(true)}
              className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Open AI Analysis Panel
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="container-wide space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Customize your ThorneGuard experience and manage your data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Appearance & Preferences
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="form-label">Theme</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'light' }))}
                  className={`btn ${settings.theme === 'light' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Light
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, theme: 'dark' }))}
                  className={`btn ${settings.theme === 'dark' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  Dark
                </button>
              </div>
            </div>
            
            <div>
              <label className="form-label" htmlFor="language-select">Language</label>
              <select
                id="language-select"
                className="input"
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value as 'en' | 'es' | 'fr' | 'de' }))}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="form-label mb-0">Auto-play Media</label>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoPlay: !prev.autoPlay }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoPlay ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.autoPlay ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="form-label mb-0">Notifications</label>
              <button
                onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.notifications ? 'bg-red-600' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            Data Management
          </h2>
          
          <div className="space-y-4">
            <button
              id="download-data-btn"
              onClick={downloadContacts}
              className="w-full btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Download className="h-5 w-5" />
              Download Contact Data (CSV)
            </button>
            
            <button
              onClick={clearAllData}
              className="w-full btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              Clear All Data
            </button>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Data Security
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    All data is stored locally in your browser and encrypted. No information is transmitted to external servers without explicit consent.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          AI Analysis Panel
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Access advanced AI-powered document and threat analysis capabilities for defense planning and strategic assessment.
        </p>
        <button
          onClick={() => setShowAiPanel(true)}
          className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          Open AI Analysis Panel
        </button>
      </div>
    </div>
  );

  const renderAiPanel = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Defense Analysis
            </h2>
            <button
              onClick={() => setShowAiPanel(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="form-label">Analysis Type</label>
                <select
                  className="input"
                  value={analysisType}
                  onChange={(e) => setAnalysisType(e.target.value)}
                >
                  <option value="document">Document Analysis</option>
                  <option value="threat">Threat Assessment</option>
                  <option value="strategic">Strategic Planning</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Text Input</label>
                <textarea
                  className="input"
                  rows={6}
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="Enter text for analysis or provide specific instructions..."
                />
              </div>
              
              <div>
                <label className="form-label">File Upload (Optional)</label>
                <input
                  type="file"
                  className="input"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
              
              <button
                onClick={handleAiAnalysis}
                disabled={isAiLoading || (!promptText.trim() && !selectedFile)}
                className="w-full btn bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white flex items-center justify-center gap-2"
              >
                {isAiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4" />
                    Analyze
                  </>
                )}
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Analysis Results</label>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-auto">
                  {isAiLoading && (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  
                  {aiError && (
                    <div className="alert alert-error">
                      <p>Error: {aiError.toString()}</p>
                    </div>
                  )}
                  
                  {aiResult && (
                    <div className="prose dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
                    </div>
                  )}
                  
                  {!isAiLoading && !aiError && !aiResult && (
                    <div className="text-gray-500 dark:text-gray-400 text-center py-8">
                      Analysis results will appear here...
                    </div>
                  )}
                </div>
              </div>
              
              {aiResult && (
                <button
                  onClick={() => {
                    const blob = new Blob([aiResult], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `thorneguard_analysis_${Date.now()}.txt`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="w-full btn bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Results
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { id: 'home', label: 'Home', icon: Target },
    { id: 'products', label: 'Systems', icon: Shield },
    { id: 'about', label: 'About', icon: Cpu },
    { id: 'contact', label: 'Contact', icon: Mail },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-white dark:bg-slate-900 theme-transition">
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
      
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-lg sticky top-0 z-40 theme-transition">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  THORNEGUARD
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Defense Systems
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      currentPage === item.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-3">
              {currentUser && (
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden lg:block">
                  Welcome, {currentUser.first_name}
                </span>
              )}
              
              {currentUser && (
                <button
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                </button>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-slate-700 py-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
                      currentPage === item.id
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1">
        {currentPage === 'home' && renderHome()}
        {currentPage === 'products' && renderProducts()}
        {currentPage === 'about' && renderAbout()}
        {currentPage === 'contact' && renderContact()}
        {currentPage === 'settings' && renderSettings()}
      </main>
      
      {/* AI Panel Modal */}
      {showAiPanel && renderAiPanel()}
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">THORNEGUARD</h3>
                  <p className="text-sm text-gray-400">Defense Systems</p>
                </div>
              </div>
              <p className="text-gray-400">
                Leading autonomous defense technology for modern military applications.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <button onClick={() => setCurrentPage('products')} className="block text-gray-400 hover:text-white transition-colors">
                  Defense Systems
                </button>
                <button onClick={() => setCurrentPage('about')} className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </button>
                <button onClick={() => setCurrentPage('contact')} className="block text-gray-400 hover:text-white transition-colors">
                  Contact
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+1 (555) 0123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>defense@thorneguard.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Arlington, VA 22201</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;