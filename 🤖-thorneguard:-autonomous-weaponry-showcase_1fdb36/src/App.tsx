import React, { useState, useRef, useEffect } from 'react';
// Removed: import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
// Removed: import { AILayerHandle } from './components/AILayer.types';
import {
  Shield,
  Target,
  Cpu,
  Satellite,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Settings,
  Globe,
  BrainCircuit,
  Gauge,
  Rocket,
  Eye,
  Lock,
  FileText,
  Phone,
  Mail,
  MapPin,
  Download,
  Upload,
  Trash2,
  Moon,
  Sun,
  LogOut,
  User,
  Database,
  Zap,
  Factory,
  Check // Added Check icon
} from 'lucide-react';
import styles from './styles/styles.module.css';

// --- START INLINED DEFINITIONS ---

// Define AILayerHandle interface (previously from ./components/AILayer.types)
interface AILayerHandle {
  sendToAI: (prompt: string, file?: File) => void;
}

// Define CurrentUser interface for the auth context
interface CurrentUserAuth {
  id: string;
  first_name: string;
  email?: string;
}

// Mock implementation of useAuth (previously from ./contexts/authContext)
const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUserAuth | null>(null);

  useEffect(() => {
    // Simulate fetching user data or an initial logged-in state for the demo
    // Set a mock user for demonstration purposes
    setTimeout(() => {
        setCurrentUser({
            id: 'user-001',
            first_name: 'DemoUser',
            email: 'demo@example.com',
        });
    }, 50); // Small delay to mimic async fetch
  }, []);

  const logout = () => {
    console.log('Logout action triggered');
    setCurrentUser(null);
    // In a real app, also clear tokens, redirect, etc.
  };

  return { currentUser, logout };
};
// --- END INLINED DEFINITIONS ---

interface ProductSpec {
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: {
    range: string;
    payload: string;
    accuracy: string;
    autonomy: string;
    speed: string;
    endurance: string;
  };
  features: string[];
  image: string;
  status: 'Development' | 'Testing' | 'Operational' | 'Classified';
}

interface ContactSubmission {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  clearanceLevel: string;
  timestamp: string;
  status: 'New' | 'In Review' | 'Responded' | 'Archived';
}

interface CompanyNews {
  id: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  category: 'Product Launch' | 'Contract Award' | 'Technology' | 'Partnership';
  classification: 'Public' | 'Restricted';
}

interface AnalysisResult {
  id: string;
  type: 'Document' | 'Image' | 'Text';
  filename?: string;
  analysis: string;
  extractedData: any;
  timestamp: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Navigation and UI State
  const [currentSection, setCurrentSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('thorneguard_darkMode');
      return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });
  const [showSettings, setShowSettings] = useState(false);

  // Product and Content State
  const [products, setProducts] = useState<ProductSpec[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductSpec | null>(null);
  const [news, setNews] = useState<CompanyNews[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);

  // AI Analysis State
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    clearanceLevel: 'Public'
  });

  // Settings State
  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    currency: 'USD',
    notifications: true,
    securityLevel: 'Standard'
  });

  // Default data definitions (moved up for clarity before usage in loadData)
  const defaultProducts: ProductSpec[] = [
    {
      id: '1',
      name: 'Guardian Sentinel X1',
      category: 'Autonomous Defense Platform',
      description: 'Advanced autonomous perimeter defense system with AI-powered threat detection and neutralization capabilities.',
      specifications: {
        range: '5km effective range',
        payload: 'Multi-tier response system',
        accuracy: '99.7% target identification',
        autonomy: '72-hour independent operation',
        speed: 'Sub-second response time',
        endurance: '30-day deployment cycle'
      },
      features: [
        'AI-powered threat assessment',
        'Autonomous target engagement',
        'Multi-sensor fusion technology',
        'Encrypted communication protocols',
        'Weather-resistant operation',
        'Remote override capabilities'
      ],
      image: '/api/placeholder/600/400', // Placeholder image path
      status: 'Operational'
    },
    {
      id: '2',
      name: 'Reaper Drone MK-VII',
      category: 'Tactical Strike Platform',
      description: 'Next-generation autonomous aerial combat system designed for precision strikes and reconnaissance missions.',
      specifications: {
        range: '2000km operational radius',
        payload: '500kg precision munitions',
        accuracy: '1m CEP at maximum range',
        autonomy: 'Full mission autonomy',
        speed: 'Mach 0.8 cruise speed',
        endurance: '24-hour flight time'
      },
      features: [
        'Stealth composite construction',
        'Advanced EW capabilities',
        'Real-time battlefield analysis',
        'Swarm coordination protocols',
        'Adaptive mission planning',
        'Satellite communication link'
      ],
      image: '/api/placeholder/600/400', // Placeholder image path
      status: 'Testing'
    },
    {
      id: '3',
      name: 'Aegis Shield Network',
      category: 'Area Denial System',
      description: 'Distributed autonomous defense network providing comprehensive area protection through coordinated AI systems.',
      specifications: {
        range: '50km coverage radius',
        payload: 'Modular response systems',
        accuracy: '99.9% threat classification',
        autonomy: 'Distributed AI mesh network',
        speed: 'Simultaneous multi-target engagement',
        endurance: 'Continuous operation'
      },
      features: [
        'Mesh network topology',
        'Self-healing architecture',
        'Predictive threat modeling',
        'Scalable deployment',
        'Integration with existing systems',
        'Command and control interface'
      ],
      image: '/api/placeholder/600/400', // Placeholder image path
      status: 'Development'
    }
  ];

  const defaultNews: CompanyNews[] = [
    {
      id: '1',
      title: 'ThorneGuard Awarded $2.3B Defense Contract',
      summary: 'Major contract for next-generation autonomous defense systems across multiple military branches.',
      content: 'ThorneGuard has been selected for a landmark defense contract worth $2.3 billion to develop and deploy advanced autonomous weaponry systems.',
      date: '2024-12-15',
      category: 'Contract Award',
      classification: 'Public'
    },
    {
      id: '2',
      title: 'Revolutionary AI Combat Algorithm Breakthrough',
      summary: 'Proprietary machine learning models achieve unprecedented accuracy in threat identification and response.',
      content: 'Our research division has developed breakthrough AI algorithms that significantly enhance autonomous decision-making capabilities.',
      date: '2024-12-10',
      category: 'Technology',
      classification: 'Public'
    },
    {
      id: '3',
      title: 'Strategic Partnership with Allied Defense Industries',
      summary: 'Collaboration to accelerate development of next-generation defense technologies.',
      content: 'ThorneGuard announces strategic partnership to enhance global defense capabilities through shared research and development.',
      date: '2024-12-05',
      category: 'Partnership',
      classification: 'Public'
    }
  ];

  // Initialize data and theme
  useEffect(() => {
    loadData();
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadData = () => {
    try {
      // Load products
      const savedProducts = localStorage.getItem('thorneguard_products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(defaultProducts);
        localStorage.setItem('thorneguard_products', JSON.stringify(defaultProducts));
      }

      // Load news
      const savedNews = localStorage.getItem('thorneguard_news');
      if (savedNews) {
        setNews(JSON.parse(savedNews));
      } else {
        setNews(defaultNews);
        localStorage.setItem('thorneguard_news', JSON.stringify(defaultNews));
      }

      // Load other data
      const savedContacts = localStorage.getItem('thorneguard_contacts');
      if (savedContacts) setContactSubmissions(JSON.parse(savedContacts));

      const savedAnalysis = localStorage.getItem('thorneguard_analysis');
      if (savedAnalysis) setAnalysisResults(JSON.parse(savedAnalysis));

      const savedSettings = localStorage.getItem('thorneguard_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('thorneguard_products', JSON.stringify(products));
      localStorage.setItem('thorneguard_news', JSON.stringify(news));
      localStorage.setItem('thorneguard_contacts', JSON.stringify(contactSubmissions));
      localStorage.setItem('thorneguard_analysis', JSON.stringify(analysisResults));
      localStorage.setItem('thorneguard_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('thorneguard_darkMode', newMode.toString());
  };

  const scrollToSection = (sectionId: string) => {
    setCurrentSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSubmission: ContactSubmission = {
      id: Date.now().toString(),
      ...contactForm,
      timestamp: new Date().toISOString(),
      status: 'New'
    };
    const updatedSubmissions = [...contactSubmissions, newSubmission];
    setContactSubmissions(updatedSubmissions);
    // localStorage.setItem('thorneguard_contacts', JSON.stringify(updatedSubmissions)); // This will be handled by saveData effect
    setContactForm({
      name: '',
      organization: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      clearanceLevel: 'Public'
    });
    alert('Contact submission received. Our team will respond within 24 hours.');
  };

  const handleAiAnalysis = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file for analysis.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    const prompt = aiPrompt || 'Analyze this document and extract key technical specifications, capabilities, and strategic information. Return as structured JSON with keys: summary, technical_specs, capabilities, strategic_value, recommendations.';
    
    try {
      if (selectedFile) {
        aiLayerRef.current?.sendToAI(prompt, selectedFile);
      } else {
        aiLayerRef.current?.sendToAI(prompt);
      }
    } catch (error) {
      console.error('AI analysis dispatch error:', error);
      setAiError('Failed to process AI request');
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    const newAnalysis: AnalysisResult = {
      id: Date.now().toString(),
      type: selectedFile ? (selectedFile.type.startsWith('image/') ? 'Image' : 'Document') : 'Text',
      filename: selectedFile?.name,
      analysis: result,
      extractedData: {},
      timestamp: new Date().toISOString()
    };
    
    try {
      const parsedData = JSON.parse(result);
      newAnalysis.extractedData = parsedData;
    } catch (parseError) {
      console.warn('AI result is not valid JSON:', parseError);
      // Keep original result as string if not JSON, extractedData remains empty object
    }

    const updatedResults = [...analysisResults, newAnalysis];
    setAnalysisResults(updatedResults);
    // localStorage.setItem('thorneguard_analysis', JSON.stringify(updatedResults)); // This will be handled by saveData effect
  };

  const exportData = () => {
    const data = {
      products,
      news,
      contacts: contactSubmissions,
      analysis: analysisResults,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `thorneguard_data_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); // Required for Firefox
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any): string => {
    const headers = ['Type', 'Name/ID', 'Details/Subject', 'Date'];
    let csvContent = headers.join(',') + '\n';
    
    data.products?.forEach((product: ProductSpec) => {
      const description = product.description.replace(/"/g, '""'); // Escape double quotes
      csvContent += `Product,"${product.name}","${description}","${new Date().toISOString().split('T')[0]}"\n`;
    });
    
    data.contacts?.forEach((contact: ContactSubmission) => {
      const subject = contact.subject.replace(/"/g, '""'); // Escape double quotes
      csvContent += `Contact,"${contact.name} (${contact.organization})","${subject}","${contact.timestamp}"\n`;
    });

    data.analysis?.forEach((item: AnalysisResult) => {
        const analysisSummary = (typeof item.analysis === 'string' ? item.analysis.substring(0,100) : JSON.stringify(item.extractedData).substring(0,100)).replace(/"/g, '""');
        csvContent += `${item.type},"${item.filename || item.id}","${analysisSummary}...","${item.timestamp}"\n`;
    });
    
    return csvContent;
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      localStorage.removeItem('thorneguard_products');
      localStorage.removeItem('thorneguard_news');
      localStorage.removeItem('thorneguard_contacts');
      localStorage.removeItem('thorneguard_analysis');
      localStorage.removeItem('thorneguard_settings');
      setProducts(defaultProducts); // Reset to defaults
      setNews(defaultNews); // Reset to defaults
      setContactSubmissions([]);
      setAnalysisResults([]);
      // Optionally reset settings to a default or leave as is
      // setSettings({ language: 'en', timezone: 'UTC', ... }); 
      alert('All data has been cleared and reset to defaults where applicable.');
      // No need to call saveData() here as state updates will trigger the effect hook
    }
  };

  // Effect to save data whenever relevant state changes
  useEffect(() => {
    saveData();
  }, [products, news, contactSubmissions, analysisResults, settings]);

  return (
    <div className="min-h-screen bg-slate-900 text-white" id="welcome_fallback">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt} // This prop might not be directly used by AILayer if it only takes prompt via sendToAI
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-50" id="main-navigation">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">ThorneGuard</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('hero')} className="hover:text-blue-400 transition-colors">Home</button>
            <button onClick={() => scrollToSection('products')} className="hover:text-blue-400 transition-colors">Products</button>
            <button onClick={() => scrollToSection('technology')} className="hover:text-blue-400 transition-colors">Technology</button>
            <button onClick={() => scrollToSection('company')} className="hover:text-blue-400 transition-colors">Company</button>
            <button onClick={() => scrollToSection('analysis')} className="hover:text-blue-400 transition-colors">AI Analysis</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-blue-400 transition-colors">Contact</button>
          </div>

          {/* User Controls */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Settings"
              id="settings-button"
            >
              <Settings className="h-5 w-5" />
            </button>

            {currentUser && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-300 hidden lg:block">Welcome, {currentUser.first_name}</span>
                <button
                  onClick={logout} // Ensure logout is callable
                  className="p-2 rounded-full hover:bg-slate-700 transition-colors flex items-center space-x-1 text-sm"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5 text-red-400" />
                  <span className="hidden xl:inline">Logout</span>
                </button>
              </div>
            )}
            {!currentUser && (
                <button 
                    onClick={() => alert('Login functionality to be implemented. Currently using mock user.')} 
                    className="p-2 rounded-full hover:bg-slate-700 transition-colors text-sm"
                >
                    Login
                </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-slate-700 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-800 border-t border-slate-700">
            <div className="px-4 py-2 space-y-2">
              <button onClick={() => scrollToSection('hero')} className="block w-full text-left py-2 hover:text-blue-400 transition-colors">Home</button>
              <button onClick={() => scrollToSection('products')} className="block w-full text-left py-2 hover:text-blue-400 transition-colors">Products</button>
              <button onClick={() => scrollToSection('technology')} className="block w-full text-left py-2 hover:text-blue-400 transition-colors">Technology</button>
              <button onClick={() => scrollToSection('company')} className="block w-full text-left py-2 hover:text-blue-400 transition-colors">Company</button>
              <button onClick={() => scrollToSection('analysis')} className="block w-full text-left py-2 hover:text-blue-400 transition-colors">AI Analysis</button>
              <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 hover:text-blue-400 transition-colors">Contact</button>
            </div>
          </div>
        )}
      </nav>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md modal-content">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Settings</h3>
              <button onClick={() => setShowSettings(false)} className="p-1 hover:bg-slate-700 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="settings-language" className="block text-sm font-medium mb-1">Language</label>
                <select 
                  id="settings-language"
                  value={settings.language} 
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="settings-security" className="block text-sm font-medium mb-1">Security Level</label>
                <select 
                  id="settings-security"
                  value={settings.securityLevel} 
                  onChange={(e) => setSettings({...settings, securityLevel: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Standard">Standard</option>
                  <option value="Enhanced">Enhanced</option>
                  <option value="Maximum">Maximum</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Notifications</span>
                <button
                  onClick={() => setSettings({...settings, notifications: !settings.notifications})}
                  className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500 ${ 
                    settings.notifications ? 'bg-blue-600' : 'bg-slate-600'
                  }`}
                  aria-pressed={settings.notifications}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-transform ${ 
                      settings.notifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              
              <div className="border-t border-slate-600 pt-4 space-y-2">
                <button
                  onClick={exportData}
                  className="w-full btn bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </button>
                
                <button
                  onClick={clearAllData}
                  className="w-full btn bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="pt-24 pb-16 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800" data-id="generation_issue_fallback">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Next-Generation
                <span className="text-blue-400 block">Autonomous Defense</span>
              </h1>
              <p className="text-xl text-slate-300 leading-relaxed">
                ThorneGuard delivers cutting-edge autonomous weaponry systems powered by advanced AI and robotics technology for modern military applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSection('products')}
                  className="btn btn-primary btn-lg flex items-center justify-center gap-2 group"
                  id="explore-products-button"
                >
                  Explore Products
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="btn bg-slate-700 hover:bg-slate-600 text-white btn-lg"
                >
                  Request Demo
                </button>
              </div>
            </div>
            
            <div className="relative">
              <div className={`${styles.heroImage} bg-slate-800 rounded-lg p-8 border border-slate-700`}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="stat-card bg-slate-700 p-4 rounded-md shadow">
                    <div className="stat-title text-sm text-slate-400">Active Systems</div>
                    <div className="stat-value text-2xl font-bold text-blue-400">2,847</div>
                    <div className="stat-desc text-xs text-green-400">↗ 23% this quarter</div>
                  </div>
                  <div className="stat-card bg-slate-700 p-4 rounded-md shadow">
                    <div className="stat-title text-sm text-slate-400">Mission Success</div>
                    <div className="stat-value text-2xl font-bold text-green-400">99.7%</div>
                    <div className="stat-desc text-xs text-slate-400">Operational accuracy</div>
                  </div>
                  <div className="stat-card bg-slate-700 p-4 rounded-md shadow">
                    <div className="stat-title text-sm text-slate-400">Response Time</div>
                    <div className="stat-value text-2xl font-bold text-yellow-400">0.3s</div>
                    <div className="stat-desc text-xs text-slate-400">Average engagement</div>
                  </div>
                  <div className="stat-card bg-slate-700 p-4 rounded-md shadow">
                    <div className="stat-title text-sm text-slate-400">Global Reach</div>
                    <div className="stat-value text-2xl font-bold text-purple-400">47</div>
                    <div className="stat-desc text-xs text-slate-400">Countries deployed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-slate-800">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Defense Systems Portfolio</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our comprehensive range of autonomous defense systems provides unmatched protection and tactical advantage
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="card bg-slate-700 hover:bg-slate-600 transition-all duration-300 cursor-pointer p-6 rounded-lg shadow-lg" onClick={() => setSelectedProduct(product)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ 
                    product.status === 'Operational' ? 'bg-green-500 text-green-900' :
                    product.status === 'Testing' ? 'bg-yellow-500 text-yellow-900' :
                    product.status === 'Development' ? 'bg-blue-500 text-blue-900' : 'bg-red-500 text-red-900'
                  } badge`}>
                    {product.status}
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-2">{product.category}</p>
                <p className="text-slate-300 mb-4 text-sm leading-relaxed h-20 overflow-hidden line-clamp-3">{product.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Range:</span>
                    <span className="font-medium">{product.specifications.range}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="font-medium">{product.specifications.accuracy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Autonomy:</span>
                    <span className="font-medium">{product.specifications.autonomy}</span>
                  </div>
                </div>
                
                <button className="btn btn-primary w-full mt-auto" id={`product-${product.id}-details`}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 z-[70] flex items-center justify-center p-4 modal-backdrop">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-content">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold">{selectedProduct.name}</h3>
                <p className="text-slate-400">{selectedProduct.category}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-slate-700 rounded">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-lg mb-4 bg-slate-700" />
                <h4 className="text-lg font-semibold mb-3">Description</h4>
                <p className="text-slate-300 mb-6 leading-relaxed">{selectedProduct.description}</p>
                
                <h4 className="text-lg font-semibold mb-3">Key Features</h4>
                <ul className="space-y-2">
                  {selectedProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-slate-300">
                      <Check className="h-4 w-4 text-green-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold mb-3">Technical Specifications</h4>
                <div className="space-y-3">
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-slate-700 last:border-b-0">
                      <span className="text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-white font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${ 
                    selectedProduct.status === 'Operational' ? 'bg-green-500 text-green-900' :
                    selectedProduct.status === 'Testing' ? 'bg-yellow-500 text-yellow-900' :
                    selectedProduct.status === 'Development' ? 'bg-blue-500 text-blue-900' : 'bg-red-500 text-red-900'
                  } badge`}>
                    Status: {selectedProduct.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-700">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="btn bg-slate-600 hover:bg-slate-500 text-white"
              >
                Close
              </button>
              <button 
                onClick={() => { setSelectedProduct(null); scrollToSection('contact'); }}
                className="btn btn-primary"
              >
                Request Information
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technology Section */}
      <section id="technology" className="py-16 bg-slate-900">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Advanced Technology Stack</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Our cutting-edge technologies combine artificial intelligence, robotics, and advanced materials science
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card bg-slate-800 text-center p-6 rounded-lg shadow-lg hover:bg-slate-700 transition-colors">
              <BrainCircuit className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">AI Decision Engine</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Advanced machine learning algorithms for real-time threat assessment and autonomous decision making</p>
            </div>
            
            <div className="card bg-slate-800 text-center p-6 rounded-lg shadow-lg hover:bg-slate-700 transition-colors">
              <Target className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Precision Targeting</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Multi-sensor fusion technology for unparalleled accuracy in target identification and engagement</p>
            </div>
            
            <div className="card bg-slate-800 text-center p-6 rounded-lg shadow-lg hover:bg-slate-700 transition-colors">
              <Satellite className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Network Integration</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Seamless integration with existing military networks and command structures</p>
            </div>
            
            <div className="card bg-slate-800 text-center p-6 rounded-lg shadow-lg hover:bg-slate-700 transition-colors">
              <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Cybersecurity</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Military-grade encryption and security protocols to prevent unauthorized access</p>
            </div>
          </div>
          
          <div className="mt-12 grid md:grid-cols-3 gap-8">
            <div className="stat-card bg-slate-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="stat-title text-slate-400">R&D Investment</div>
                <Rocket className="h-6 w-6 text-blue-400" />
              </div>
              <div className="stat-value text-3xl font-bold">$847M</div>
              <div className="stat-desc text-sm text-slate-500">Annual technology development</div>
            </div>
            
            <div className="stat-card bg-slate-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="stat-title text-slate-400">Patent Portfolio</div>
                <Lock className="h-6 w-6 text-green-400" />
              </div>
              <div className="stat-value text-3xl font-bold">1,247</div>
              <div className="stat-desc text-sm text-slate-500">Proprietary technologies</div>
            </div>
            
            <div className="stat-card bg-slate-800 p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="stat-title text-slate-400">Processing Power</div>
                <Cpu className="h-6 w-6 text-purple-400" />
              </div>
              <div className="stat-value text-3xl font-bold">15.7</div>
              <div className="stat-desc text-sm text-slate-500">Petaflops computational capacity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Section */}
      <section id="company" className="py-16 bg-slate-800">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">Leading Defense Innovation</h2>
              <p className="text-xl text-slate-300 mb-6 leading-relaxed">
                ThorneGuard has been at the forefront of autonomous defense technology for over two decades, partnering with military organizations worldwide to enhance security and operational effectiveness.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Factory className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Global Manufacturing</h3>
                    <p className="text-slate-400 text-sm">17 production facilities across 6 continents</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Expert Team</h3>
                    <p className="text-slate-400 text-sm">12,000+ engineers and defense specialists</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-slate-700 rounded-lg">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Worldwide Presence</h3>
                    <p className="text-slate-400 text-sm">Serving 47 nations with advanced defense systems</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6">Latest Updates</h3>
              <div className="space-y-4">
                {news.slice(0, 3).map((item) => (
                  <div key={item.id} className="card bg-slate-700 hover:bg-slate-600 transition-colors p-4 rounded-lg shadow">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ 
                        item.category === 'Contract Award' ? 'bg-green-500 text-green-900' :
                        item.category === 'Technology' ? 'bg-blue-500 text-blue-900' :
                        item.category === 'Partnership' ? 'bg-yellow-500 text-yellow-900' : 'bg-red-500 text-red-900'
                       } badge`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-semibold mb-1 text-blue-300 hover:text-blue-200 transition-colors cursor-pointer">{item.title}</h4>
                    <p className="text-sm text-slate-300 line-clamp-2">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Analysis Section */}
      <section id="analysis" className="py-16 bg-slate-900">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">AI-Powered Document Analysis</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Advanced AI capabilities for analyzing defense documents, technical specifications, and strategic intelligence
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="card bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Document Analysis Tool</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="ai-prompt-input" className="form-label block text-sm font-medium mb-1">Analysis Prompt</label>
                  <textarea
                    id="ai-prompt-input"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe what you want to analyze or leave blank for automatic analysis..."
                    className="input w-full h-24 resize-none bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="file-upload-input" className="form-label block text-sm font-medium mb-1">Upload Document</label>
                  <input
                    id="file-upload-input"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    className="input w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {selectedFile && (
                    <p className="text-sm text-slate-400 mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleAiAnalysis}
                  disabled={isAiLoading || (!aiPrompt?.trim() && !selectedFile)}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  id="analyze-button"
                >
                  {isAiLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4 w-4" />
                      Analyze with AI
                    </>
                  )}
                </button>
                
                {aiError && (
                  <div className="alert alert-error bg-red-900 border border-red-700 text-red-200 p-3 rounded-md">
                    <p>{aiError.toString()}</p>
                  </div>
                )}
                
                {aiResult && (
                  <div className="bg-slate-700 rounded-lg p-4 mt-4">
                    <h4 className="font-semibold mb-2 text-lg">Analysis Result:</h4>
                    <div className="text-sm text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto p-2 bg-slate-600/50 rounded">{aiResult}</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="card bg-slate-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">Analysis History</h3>
              
              {analysisResults.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No analysis results yet. Upload a document to get started.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {analysisResults.slice().reverse().map((result) => (
                    <div key={result.id} className="bg-slate-700 hover:bg-slate-600/70 transition-colors rounded-lg p-3 cursor-pointer" onClick={() => {setAiResult(result.analysis); setAiPrompt(''); setSelectedFile(null); scrollToSection('analysis');}}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ 
                          result.type === 'Document' ? 'bg-blue-500 text-blue-900' :
                          result.type === 'Image' ? 'bg-yellow-500 text-yellow-900' : 'bg-green-500 text-green-900'
                        } badge`}>
                          {result.type}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(result.timestamp).toLocaleDateString()} {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      {result.filename && (
                        <p className="text-sm font-medium mb-1 truncate" title={result.filename}>{result.filename}</p>
                      )}
                      
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result.extractedData)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-800">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Secure Communications</h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Connect with our defense specialists for confidential consultations and product demonstrations
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-4 bg-slate-700 rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Headquarters</h4>
                    <p className="text-slate-400 text-sm">1847 Defense Plaza<br />Arlington, VA 22202<br />United States</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-700 rounded-lg">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Secure Line</h4>
                    <p className="text-slate-400 text-sm">+1 (555) 847-GUARD<br />24/7 Emergency: +1 (555) 847-9999</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 bg-slate-700 rounded-lg">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Secure Email</h4>
                    <p className="text-slate-400 text-sm">defense@thorneguard.mil<br />contracts@thorneguard.mil</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 card bg-slate-700 p-4 rounded-lg shadow">
                <h4 className="font-semibold mb-3">Recent Contacts</h4>
                {contactSubmissions.length === 0 ? (
                  <p className="text-slate-400 text-sm">No contact submissions yet.</p>
                ) : (
                  <div className="space-y-2">
                    {contactSubmissions.slice(-3).reverse().map((contact) => (
                      <div key={contact.id} className="flex justify-between items-center text-sm p-2 bg-slate-600/50 rounded">
                        <span className="truncate w-2/3" title={`${contact.name} - ${contact.organization}`}>{contact.name} - {contact.organization}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${ 
                          contact.status === 'New' ? 'bg-blue-500 text-blue-900' :
                          contact.status === 'In Review' ? 'bg-yellow-500 text-yellow-900' :
                          contact.status === 'Responded' ? 'bg-green-500 text-green-900' : 'bg-red-500 text-red-900'
                        } badge`}>
                          {contact.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="card bg-slate-900 p-6 rounded-lg shadow-xl border border-slate-700">
              <h3 className="text-xl font-bold mb-6">Secure Contact Form</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="form-label block text-sm font-medium mb-1">Full Name *</label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="input w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-organization" className="form-label block text-sm font-medium mb-1">Organization *</label>
                    <input
                      id="contact-organization"
                      type="text"
                      required
                      value={contactForm.organization}
                      onChange={(e) => setContactForm({...contactForm, organization: e.target.value})}
                      className="input w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-email" className="form-label block text-sm font-medium mb-1">Email Address *</label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="input w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="contact-phone" className="form-label block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="input w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="contact-clearance" className="form-label block text-sm font-medium mb-1">Clearance Level</label>
                  <select
                    id="contact-clearance"
                    value={contactForm.clearanceLevel}
                    onChange={(e) => setContactForm({...contactForm, clearanceLevel: e.target.value})}
                    className="input w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Secret">Secret</option>
                    <option value="Top Secret">Top Secret</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="contact-subject" className="form-label block text-sm font-medium mb-1">Subject *</label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="input w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="contact-message" className="form-label block text-sm font-medium mb-1">Message *</label>
                  <textarea
                    id="contact-message"
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="input w-full h-32 resize-none bg-slate-700 border border-slate-600 rounded px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please describe your requirements, timeline, and any specific questions..."
                  />
                </div>
                
                <button type="submit" className="btn btn-primary w-full" id="submit-contact">
                  Send Secure Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-8">
        <div className="container-wide mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="text-lg font-bold">ThorneGuard</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-slate-400 text-sm">
                Copyright © 2025 Datavtar Private Limited. All rights reserved.
              </p>
              <p className="text-slate-500 text-xs mt-1">
                ThorneGuard is a subsidiary of Datavtar Private Limited
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
