import React, { useState, useRef, useEffect } from 'react';
import { Shield, Zap, Target, Eye, Settings, Cpu, Satellite, MessageCircle, X, Menu, ChevronDown, Mail, Phone, MapPin, ArrowRight, Check, Globe, Users, Award } from 'lucide-react';
import { useAuth } from './contexts/authContext';
import LoginForm from './components/LoginForm';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  specs: string[];
  image: string;
  features: string[];
}

interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image: string;
  expertise: string[];
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  timestamp: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Navigation state
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // AI Chat state
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatResult, setChatResult] = useState<string | null>(null);
  const [chatError, setChatError] = useState<any | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{type: 'user' | 'bot', message: string, timestamp: string}>>([]);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [isContactSubmitted, setIsContactSubmitted] = useState(false);
  
  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    language: 'en',
    theme: 'dark',
    notifications: true
  });
  
  // Data state
  const [products] = useState<Product[]>([
    {
      id: 'ag-sentinel',
      name: 'AG-Sentinel',
      category: 'Autonomous Ground Vehicle',
      description: 'Advanced autonomous ground vehicle with AI-powered threat detection and engagement capabilities.',
      specs: ['Range: 50km', 'Speed: 80 km/h', 'Payload: 500kg', 'Battery: 48h standby'],
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop',
      features: ['360° Threat Detection', 'Autonomous Navigation', 'Real-time Intelligence', 'Modular Weapon Systems']
    },
    {
      id: 'as-hawk',
      name: 'AS-Hawk',
      category: 'Autonomous Aerial System',
      description: 'High-altitude reconnaissance and engagement drone with advanced AI targeting systems.',
      specs: ['Altitude: 15,000m', 'Range: 200km', 'Endurance: 24h', 'Payload: 50kg'],
      image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&h=400&fit=crop',
      features: ['Stealth Technology', 'AI Target Recognition', 'Weather Resistant', 'Encrypted Communications']
    },
    {
      id: 'ns-guardian',
      name: 'NS-Guardian',
      category: 'Naval Security System',
      description: 'Maritime autonomous defense platform for port and coastal security operations.',
      specs: ['Range: 100km', 'Speed: 45 knots', 'Depth: 500m', 'Endurance: 72h'],
      image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=600&h=400&fit=crop',
      features: ['Underwater Detection', 'Surface Engagement', 'Sonar Integration', 'Emergency Response']
    },
    {
      id: 'cs-matrix',
      name: 'CS-Matrix',
      category: 'Cyber Security Suite',
      description: 'AI-powered cybersecurity platform for military network protection and threat mitigation.',
      specs: ['Response: <1ms', 'Coverage: 10,000 nodes', 'Threats: 99.9% detection', 'Updates: Real-time'],
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
      features: ['Threat Intelligence', 'Automated Response', 'Network Monitoring', 'Incident Analysis']
    }
  ]);
  
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: 'sarah-chen',
      name: 'Dr. Sarah Chen',
      position: 'Chief Technology Officer',
      bio: 'Leading AI researcher with 15+ years in autonomous systems and military robotics.',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop',
      expertise: ['Artificial Intelligence', 'Robotics', 'Defense Systems']
    },
    {
      id: 'marcus-torres',
      name: 'Col. Marcus Torres (Ret.)',
      position: 'Head of Defense Operations',
      bio: 'Former military strategist with extensive experience in defense procurement and operations.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
      expertise: ['Military Strategy', 'Operations Management', 'Defense Procurement']
    },
    {
      id: 'elena-kowalski',
      name: 'Dr. Elena Kowalski',
      position: 'Lead Systems Engineer',
      bio: 'Expert in autonomous vehicle systems and real-time control algorithms.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
      expertise: ['Systems Engineering', 'Control Systems', 'Autonomous Vehicles']
    }
  ]);
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('thorneguard_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedChatHistory = localStorage.getItem('thorneguard_chat_history');
    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
    }
  }, []);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('thorneguard_settings', JSON.stringify(settings));
  }, [settings]);
  
  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem('thorneguard_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);
  
  // Handle AI chat
  const handleSendChat = () => {
    if (!chatPrompt.trim()) return;
    
    const userMessage = {
      type: 'user' as const,
      message: chatPrompt,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    
    const contextualPrompt = `You are a professional AI assistant for ThorneGuard, a military defense contractor specializing in autonomous weaponry systems. Context: We develop autonomous ground vehicles, aerial systems, naval security platforms, and cybersecurity solutions for military applications. Please provide helpful, professional responses about our capabilities, products, or general defense technology inquiries. User question: ${chatPrompt}`;
    
    setChatResult(null);
    setChatError(null);
    setChatPrompt('');
    
    try {
      aiLayerRef.current?.sendToAI(contextualPrompt);
    } catch (error) {
      setChatError('Failed to process chat request');
    }
  };
  
  // Handle AI chat result
  useEffect(() => {
    if (chatResult) {
      const botMessage = {
        type: 'bot' as const,
        message: chatResult,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, botMessage]);
      setChatResult(null);
    }
  }, [chatResult]);
  
  // Handle contact form
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const message: ContactMessage = {
      id: Date.now().toString(),
      ...contactForm,
      timestamp: new Date().toISOString()
    };
    
    const existingMessages = JSON.parse(localStorage.getItem('thorneguard_contact_messages') || '[]');
    localStorage.setItem('thorneguard_contact_messages', JSON.stringify([...existingMessages, message]));
    
    setContactForm({ name: '', email: '', company: '', message: '' });
    setIsContactSubmitted(true);
    
    setTimeout(() => {
      setIsContactSubmitted(false);
    }, 3000);
  };
  
  // Handle settings update
  const updateSettings = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  // Clear all data
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('thorneguard_settings');
      localStorage.removeItem('thorneguard_chat_history');
      localStorage.removeItem('thorneguard_contact_messages');
      setChatHistory([]);
      setSettings({ language: 'en', theme: 'dark', notifications: true });
      alert('All data has been cleared.');
    }
  };
  
  // Download data
  const downloadData = () => {
    const data = {
      settings: settings,
      chatHistory: chatHistory,
      contactMessages: JSON.parse(localStorage.getItem('thorneguard_contact_messages') || '[]'),
      exportDate: new Date().toISOString()
    };
    
    const csvContent = [
      'Type,Content,Timestamp',
      ...chatHistory.map(msg => `${msg.type},"${msg.message.replace(/"/g, '""')}",${msg.timestamp}`),
      ...JSON.parse(localStorage.getItem('thorneguard_contact_messages') || '[]').map((msg: ContactMessage) => 
        `contact,"${msg.name} (${msg.email}) from ${msg.company}: ${msg.message.replace(/"/g, '""')}",${msg.timestamp}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thorneguard_data_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle escape key for modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsChatOpen(false);
        setShowSettings(false);
        setIsMobileMenuOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  return (
    <div id="welcome_fallback" className="min-h-screen bg-slate-900 text-white theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={chatPrompt}
        onResult={(result) => setChatResult(result)}
        onError={(error) => setChatError(error)}
        onLoading={(loading) => setIsChatLoading(loading)}
      />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">ThorneGuard</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {['home', 'products', 'company', 'team', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-colors hover:text-red-400 ${
                    activeSection === section ? 'text-red-400' : 'text-gray-300'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                id="settings-button"
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              
              <button
                className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-800 border-t border-slate-700 py-4">
              {['home', 'products', 'company', 'team', 'contact'].map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className="block w-full text-left px-4 py-2 text-gray-300 hover:text-red-400 transition-colors"
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </nav>
      
      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center relative overflow-hidden">
        <div className={styles.heroBackground}></div>
        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div id="generation_issue_fallback" className="space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Autonomous
                <span className="text-red-500"> Defense</span>
                <br />Systems
              </h1>
              <p className="text-xl text-gray-300 leading-relaxed">
                Advanced AI-powered autonomous weaponry and defense systems for modern military operations. 
                Protecting nations through cutting-edge robotics and artificial intelligence.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => scrollToSection('products')}
                  className="btn btn-primary btn-lg flex items-center gap-2 group"
                >
                  Explore Systems
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="btn bg-transparent border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white btn-lg"
                >
                  Contact Defense Team
                </button>
              </div>
              
              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">50+</div>
                  <div className="text-sm text-gray-400">Active Systems</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">15+</div>
                  <div className="text-sm text-gray-400">Countries Served</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">99.9%</div>
                  <div className="text-sm text-gray-400">Reliability</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop"
                alt="Autonomous Military Vehicle"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-red-500 p-4 rounded-lg">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-6 -right-6 bg-slate-800 p-4 rounded-lg border border-slate-600">
                <Target className="w-8 h-8 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Products Section */}
      <section id="products" className="py-20 bg-slate-800">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Defense Systems Portfolio</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive autonomous defense solutions designed for modern military challenges
            </p>
          </div>
          
          <div id="products-grid" className="grid md:grid-cols-2 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="card-responsive bg-slate-900 border border-slate-700 hover:border-red-500 transition-all duration-300 group"
              >
                <div className="relative overflow-hidden rounded-lg mb-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <div className="absolute top-4 left-4">
                    <span className="badge bg-red-500 text-white text-xs">{product.category}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                  <p className="text-gray-300">{product.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {product.specs.map((spec, index) => (
                      <div key={index} className="text-sm text-gray-400">
                        <Check className="w-4 h-4 text-green-500 inline mr-2" />
                        {spec}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-400">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, index) => (
                        <span key={index} className="badge bg-slate-700 text-gray-300 text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Company Section */}
      <section id="company" className="py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold">Leading Defense Innovation</h2>
              <p className="text-xl text-gray-300 leading-relaxed">
                ThorneGuard stands at the forefront of military technology, developing autonomous systems 
                that enhance operational capability while protecting human personnel.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
                    <p className="text-gray-300">Advanced machine learning algorithms for real-time threat assessment and autonomous decision-making.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Military-Grade Security</h3>
                    <p className="text-gray-300">Hardened systems with encrypted communications and fail-safe mechanisms for critical operations.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <Satellite className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Global Operations</h3>
                    <p className="text-gray-300">Deployed across multiple theaters with 24/7 support and real-time monitoring capabilities.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=600&fit=crop"
                alt="Military Command Center"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/20 to-transparent rounded-lg" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section id="team" className="py-20 bg-slate-800">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Leadership Team</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Expert professionals with decades of experience in defense technology and military operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="card-responsive bg-slate-900 border border-slate-700 text-center group hover:border-red-500 transition-all duration-300"
              >
                <div className="relative mx-auto w-32 h-32 mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover rounded-full border-4 border-slate-600 group-hover:border-red-500 transition-colors"
                  />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-red-400 font-semibold mb-4">{member.position}</p>
                <p className="text-gray-300 mb-6">{member.bio}</p>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">Expertise</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.expertise.map((skill, index) => (
                      <span key={index} className="badge bg-slate-700 text-gray-300 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Defense Partnership Inquiries</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect with our defense specialists to discuss autonomous systems for your military operations
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Email</h3>
                    <p className="text-gray-300">defense@thorneguard.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Secure Line</h3>
                    <p className="text-gray-300">+1 (555) DEF-ENSE</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500 rounded-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Headquarters</h3>
                    <p className="text-gray-300">1000 Defense Plaza<br />Arlington, VA 22202</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
                <h3 className="text-lg font-semibold mb-4 text-red-400">Security Clearance</h3>
                <p className="text-gray-300 text-sm">
                  All defense partnership discussions require appropriate security clearance. 
                  Please include your clearance level and sponsoring organization in your inquiry.
                </p>
              </div>
            </div>
            
            <div className="card-responsive bg-slate-800 border border-slate-700">
              {isContactSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-400">Message Sent</h3>
                  <p className="text-gray-300">Our defense team will review your inquiry and respond within 24 hours.</p>
                </div>
              ) : (
                <form id="contact-form" onSubmit={handleContactSubmit} className="space-y-6">
                  <h3 className="text-xl font-semibold mb-6">Send Secure Message</h3>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-name">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      className="input bg-slate-700 border-slate-600 text-white"
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
                      className="input bg-slate-700 border-slate-600 text-white"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-company">Organization *</label>
                    <input
                      id="contact-company"
                      type="text"
                      className="input bg-slate-700 border-slate-600 text-white"
                      value={contactForm.company}
                      onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-message">Message *</label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      className="input bg-slate-700 border-slate-600 text-white resize-none"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Describe your defense requirements and clearance level..."
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full flex items-center justify-center gap-2"
                    disabled={!contactForm.name || !contactForm.email || !contactForm.company || !contactForm.message}
                  >
                    <Shield className="w-5 h-5" />
                    Send Secure Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Chat Button */}
      <button
        id="chat-toggle"
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-40"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      
      {/* AI Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col border border-slate-700">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">ThorneGuard AI Assistant</h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>Ask about our defense systems, capabilities, or military solutions.</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-700 text-gray-100'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
              
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              
              {chatError && (
                <div className="bg-red-900/50 border border-red-500 p-3 rounded-lg">
                  <p className="text-red-400 text-sm">Error: Unable to process request. Please try again.</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask about our defense systems..."
                  className="flex-1 input bg-slate-700 border-slate-600 text-white text-sm"
                  disabled={isChatLoading}
                />
                <button
                  onClick={handleSendChat}
                  disabled={!chatPrompt.trim() || isChatLoading}
                  className="btn btn-primary px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-semibold text-white">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="form-label">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSettings('language', e.target.value)}
                    className="input bg-slate-700 border-slate-600 text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSettings('theme', e.target.value)}
                    className="input bg-slate-700 border-slate-600 text-white"
                  >
                    <option value="dark">Dark (Military)</option>
                    <option value="light">Light</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="form-label mb-0">Notifications</label>
                  <button
                    onClick={() => updateSettings('notifications', !settings.notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.notifications ? 'bg-red-500' : 'bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
              
              <div className="border-t border-slate-700 pt-6 space-y-4">
                <h4 className="font-semibold text-red-400">Data Management</h4>
                
                <button
                  onClick={downloadData}
                  className="btn bg-slate-700 text-white hover:bg-slate-600 w-full flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4 rotate-90" />
                  Download Data (CSV)
                </button>
                
                <button
                  onClick={clearAllData}
                  className="btn bg-red-900 text-red-300 hover:bg-red-800 hover:text-white w-full flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-red-500" />
                <span className="text-xl font-bold">ThorneGuard</span>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced autonomous defense systems for modern military operations.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Products</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Ground Vehicles</div>
                <div>Aerial Systems</div>
                <div>Naval Platforms</div>
                <div>Cyber Security</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Company</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>About Us</div>
                <div>Leadership</div>
                <div>Careers</div>
                <div>Press</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div>Defense Partnership</div>
                <div>Technical Support</div>
                <div>Media Inquiries</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                Copyright © 2025 Datavtar Private Limited. All rights reserved.
              </div>
              
              {!currentUser ? (
                <LoginForm title="Admin Login" subtitle="Content Management" />
              ) : (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">Admin: {currentUser.first_name}</span>
                  <button
                    onClick={logout}
                    className="btn btn-sm bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;