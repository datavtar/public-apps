import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Shield, 
  Target, 
  Cpu, 
  Satellite, 
  Radar,
  Settings as SettingsIcon, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Download,
  Upload,
  FileText,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Users,
  Award,
  Zap,
  Lock,
  Eye,
  Crosshair,
  Navigation,
  Gauge,
  LogOut
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  specifications: Record<string, string>;
  features: string[];
  image: string;
  price: string;
  availability: string;
}

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company: string;
  position: string;
  message: string;
  productInterest: string;
  timestamp: string;
}

interface Settings {
  theme: 'light' | 'dark';
  language: string;
  currency: string;
  notifications: boolean;
}

type ActiveSection = 'home' | 'products' | 'technology' | 'about' | 'contact' | 'settings' | 'ai-analysis';

function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Core state
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  
  // AI Analysis state
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    position: '',
    message: '',
    productInterest: ''
  });
  
  // Settings state
  const [settings, setSettings] = useState<Settings>({
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    notifications: true
  });
  
  // Data arrays
  const [products] = useState<Product[]>([
    {
      id: 'autonomous-sentry',
      name: 'TG-AS100 Autonomous Sentry',
      category: 'Perimeter Defense',
      description: 'Advanced AI-powered autonomous sentry system with 360° threat detection and precision targeting capabilities.',
      specifications: {
        'Range': '2.5 km',
        'Payload': '7.62mm NATO / .50 BMG',
        'Power': 'Solar/Battery Hybrid',
        'Operating Temperature': '-40°C to +65°C',
        'Detection Range': '5 km thermal/optical',
        'Response Time': '<2 seconds'
      },
      features: [
        'AI-powered threat identification',
        'Autonomous target engagement',
        'Weather-resistant construction',
        'Remote monitoring and control',
        'Encrypted communication protocols'
      ],
      image: '/api/placeholder/400/300',
      price: 'Contact for Pricing',
      availability: 'Available Q2 2025'
    },
    {
      id: 'drone-swarm',
      name: 'TG-DS500 Drone Swarm System',
      category: 'Aerial Defense',
      description: 'Coordinated swarm of autonomous drones for reconnaissance, surveillance, and tactical engagement.',
      specifications: {
        'Swarm Size': '50-500 units',
        'Flight Time': '4 hours per unit',
        'Communication Range': '50 km',
        'Payload Capacity': '2 kg per unit',
        'Maximum Speed': '120 km/h',
        'Altitude Ceiling': '3000m'
      },
      features: [
        'Distributed AI decision making',
        'Self-healing swarm topology',
        'Multi-mission capability',
        'Real-time data sharing',
        'Autonomous formation flight'
      ],
      image: '/api/placeholder/400/300',
      price: 'Contact for Pricing',
      availability: 'Available Now'
    },
    {
      id: 'mobile-platform',
      name: 'TG-MP200 Mobile Defense Platform',
      category: 'Ground Systems',
      description: 'Unmanned ground vehicle with adaptive weapon systems and advanced battlefield AI.',
      specifications: {
        'Weight': '1200 kg',
        'Max Speed': '80 km/h',
        'Range': '500 km',
        'Armor Rating': 'Level IV',
        'Weapon Systems': 'Modular mounting',
        'Communication': 'Secure mesh network'
      },
      features: [
        'All-terrain mobility',
        'Modular weapon integration',
        'Autonomous navigation',
        'Real-time tactical analysis',
        'Remote operation capability'
      ],
      image: '/api/placeholder/400/300',
      price: 'Contact for Pricing',
      availability: 'Available Q1 2025'
    }
  ]);
  
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedInquiries = localStorage.getItem('thorneguard_inquiries');
    const savedSettings = localStorage.getItem('thorneguard_settings');
    
    if (savedInquiries) {
      try {
        setInquiries(JSON.parse(savedInquiries));
      } catch (error) {
        console.error('Error loading inquiries:', error);
      }
    }
    
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);
  
  // Save data to localStorage
  const saveInquiries = (newInquiries: ContactInquiry[]) => {
    setInquiries(newInquiries);
    localStorage.setItem('thorneguard_inquiries', JSON.stringify(newInquiries));
  };
  
  const saveSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('thorneguard_settings', JSON.stringify(newSettings));
    if (newSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // AI Analysis functions
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAiPrompt(`Analyze this defense document/specification and extract key technical requirements, capabilities, and recommendations. Return JSON with keys "summary", "technical_specs", "recommendations", "compliance_notes".`);
    }
  };
  
  const handleAiAnalysis = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file for analysis.');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(aiPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI analysis request.');
    }
  };
  
  // Contact form functions
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      return;
    }
    
    const newInquiry: ContactInquiry = {
      id: Date.now().toString(),
      ...contactForm,
      timestamp: new Date().toISOString()
    };
    
    saveInquiries([...inquiries, newInquiry]);
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      company: '',
      position: '',
      message: '',
      productInterest: ''
    });
    
    alert('Thank you for your inquiry. We will contact you soon.');
  };
  
  // Navigation functions
  const scrollToSection = (section: ActiveSection) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };
  
  // Data management functions
  const downloadData = () => {
    const data = {
      inquiries,
      settings,
      exportDate: new Date().toISOString()
    };
    
    const csvContent = inquiries.map(inquiry => 
      `"${inquiry.name}","${inquiry.email}","${inquiry.company}","${inquiry.position}","${inquiry.message}","${inquiry.productInterest}","${inquiry.timestamp}"`
    ).join('\n');
    
    const headers = 'Name,Email,Company,Position,Message,Product Interest,Timestamp\n';
    const csv = headers + csvContent;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'thorneguard_inquiries.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
      setInquiries([]);
      localStorage.removeItem('thorneguard_inquiries');
      alert('All data has been cleared.');
    }
  };
  
  const renderHeader = () => (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
      <div className="container-wide">
        <div className="flex-between py-4">
          <div className="flex items-center gap-3" id="welcome_fallback">
            <Shield className="h-8 w-8 text-green-400" />
            <span className="text-xl font-bold text-white">ThorneGuard</span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {(['home', 'products', 'technology', 'about', 'contact'] as ActiveSection[]).map((section) => (
              <button
                key={section}
                onClick={() => scrollToSection(section)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === section
                    ? 'text-green-400'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
            <button
              onClick={() => scrollToSection('ai-analysis')}
              className="btn bg-green-600 hover:bg-green-700 text-white text-sm"
              id="ai-analysis-nav"
            >
              AI Analysis
            </button>
          </nav>
          
          {/* User Controls */}
          <div className="flex items-center gap-4">
            {currentUser && (
              <span className="text-sm text-slate-300 hidden lg:block">
                Welcome, {currentUser.first_name}
              </span>
            )}
            <button
              onClick={() => scrollToSection('settings')}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-slate-300" />
            </button>
            {currentUser && (
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5 text-red-400" />
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <nav className="flex flex-col gap-4">
              {(['home', 'products', 'technology', 'about', 'contact', 'ai-analysis'] as ActiveSection[]).map((section) => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-left text-sm font-medium transition-colors ${
                    activeSection === section
                      ? 'text-green-400'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {section === 'ai-analysis' ? 'AI Analysis' : section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
  
  const renderHome = () => (
    <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20" id="generation_issue_fallback">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-20">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
              Advanced <span className="text-green-400">Autonomous</span> Defense Systems
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              ThorneGuard leads the future of military technology with AI-powered autonomous weaponry systems. Our cutting-edge robotics and artificial intelligence provide unmatched precision and reliability for modern defense applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => scrollToSection('products')}
                className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                id="explore-products"
              >
                Explore Products <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="btn border border-slate-600 text-white hover:bg-slate-800 flex items-center gap-2"
              >
                Contact Sales <Phone className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="relative">
            <div className={`${styles.heroAnimation} bg-slate-800 rounded-2xl p-8 border border-slate-700`}>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-700 rounded-lg p-4 flex flex-col items-center">
                  <Target className="h-12 w-12 text-green-400 mb-2" />
                  <span className="text-white font-semibold">Precision</span>
                  <span className="text-slate-300 text-sm">99.8% Accuracy</span>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 flex flex-col items-center">
                  <Cpu className="h-12 w-12 text-blue-400 mb-2" />
                  <span className="text-white font-semibold">AI-Powered</span>
                  <span className="text-slate-300 text-sm">Real-time</span>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 flex flex-col items-center">
                  <Shield className="h-12 w-12 text-purple-400 mb-2" />
                  <span className="text-white font-semibold">Secure</span>
                  <span className="text-slate-300 text-sm">Encrypted</span>
                </div>
                <div className="bg-slate-700 rounded-lg p-4 flex flex-col items-center">
                  <Satellite className="h-12 w-12 text-orange-400 mb-2" />
                  <span className="text-white font-semibold">Connected</span>
                  <span className="text-slate-300 text-sm">Global Range</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-t border-slate-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">15+</div>
            <div className="text-slate-300">Years Experience</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">50+</div>
            <div className="text-slate-300">Military Contracts</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">99.8%</div>
            <div className="text-slate-300">System Reliability</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">24/7</div>
            <div className="text-slate-300">Support Available</div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const renderProducts = () => (
    <section className="min-h-screen bg-slate-800 py-20">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Defense Solutions</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our comprehensive range of autonomous defense systems provides unmatched capabilities for modern military operations.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="card bg-slate-700 border border-slate-600 hover:border-green-400 transition-all duration-300" id={`product-${product.id}`}>
              <div className="aspect-w-16 aspect-h-9 mb-6">
                <div className="bg-slate-600 rounded-lg flex items-center justify-center">
                  <Target className="h-16 w-16 text-green-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="badge bg-green-600 text-white text-xs">{product.category}</span>
                  <h3 className="text-xl font-bold text-white mt-2">{product.name}</h3>
                  <p className="text-slate-300 text-sm mt-2">{product.description}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Key Features:</h4>
                  <ul className="text-slate-300 text-sm space-y-1">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-600">
                  <div>
                    <div className="text-green-400 font-semibold">{product.price}</div>
                    <div className="text-slate-400 text-sm">{product.availability}</div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setExpandedProduct(expandedProduct === product.id ? null : product.id);
                    }}
                    className="btn btn-sm bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                  >
                    Details {expandedProduct === product.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
                
                {expandedProduct === product.id && (
                  <div className="mt-4 pt-4 border-t border-slate-600 space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Specifications:</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-slate-400">{key}:</span>
                            <span className="text-white">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">All Features:</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <button
                      onClick={() => {
                        setContactForm(prev => ({ ...prev, productInterest: product.name }));
                        scrollToSection('contact');
                      }}
                      className="btn w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Request Quote
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
  
  const renderTechnology = () => (
    <section className="min-h-screen bg-slate-900 py-20">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Advanced Technology</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Our cutting-edge AI and robotics technologies set new standards in autonomous defense systems.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="card bg-slate-800 border border-slate-700" id="ai-technology">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <Cpu className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Decision Engine</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Advanced neural networks process real-time battlefield data to make split-second tactical decisions with 99.8% accuracy.
            </p>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• Real-time threat assessment</li>
              <li>• Autonomous target prioritization</li>
              <li>• Predictive analytics</li>
              <li>• Machine learning optimization</li>
            </ul>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Precision Targeting</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Multi-sensor fusion technology ensures precise target acquisition and engagement across all environmental conditions.
            </p>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• Multi-spectral imaging</li>
              <li>• Ballistic computation</li>
              <li>• Environmental compensation</li>
              <li>• Sub-MOA accuracy</li>
            </ul>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Secure Communications</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Military-grade encryption and mesh networking ensure secure, resilient communication in contested environments.
            </p>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• AES-256 encryption</li>
              <li>• Mesh network topology</li>
              <li>• Anti-jamming technology</li>
              <li>• Quantum-resistant protocols</li>
            </ul>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-orange-600 rounded-lg">
                <Satellite className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Global Connectivity</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Satellite and terrestrial communication systems provide worldwide operational capability and real-time command integration.
            </p>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• Satellite uplinks</li>
              <li>• 5G integration</li>
              <li>• Global positioning</li>
              <li>• Real-time telemetry</li>
            </ul>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-600 rounded-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Power Systems</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Hybrid power solutions combine solar, battery, and fuel cell technologies for extended operational endurance.
            </p>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• Solar panel arrays</li>
              <li>• Lithium-ion batteries</li>
              <li>• Fuel cell backup</li>
              <li>• 72+ hour operation</li>
            </ul>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-teal-600 rounded-lg">
                <Eye className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Sensor Suite</h3>
            </div>
            <p className="text-slate-300 mb-4">
              Comprehensive sensor integration provides 360-degree situational awareness in all weather and lighting conditions.
            </p>
            <ul className="text-slate-400 text-sm space-y-2">
              <li>• Thermal imaging</li>
              <li>• Optical cameras</li>
              <li>• Radar systems</li>
              <li>• Acoustic sensors</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
  
  const renderAbout = () => (
    <section className="min-h-screen bg-slate-800 py-20">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">About ThorneGuard</h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              Founded in 2009, ThorneGuard has been at the forefront of autonomous defense technology development. Our team of expert engineers, AI researchers, and military specialists work tirelessly to create the most advanced and reliable defense systems in the world.
            </p>
            <p className="text-lg text-slate-300 leading-relaxed">
              With over 15 years of experience and partnerships with leading military organizations worldwide, we continue to push the boundaries of what's possible in autonomous defense technology.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <Users className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">200+</div>
                <div className="text-slate-300">Expert Engineers</div>
              </div>
              <div className="text-center">
                <Award className="h-12 w-12 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">25+</div>
                <div className="text-slate-300">Industry Awards</div>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="card bg-slate-700 border border-slate-600">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Globe className="h-6 w-6 text-green-400" />
                Global Presence
              </h3>
              <p className="text-slate-300">
                With offices in North America, Europe, and Asia-Pacific, we provide worldwide support and service for our defense systems.
              </p>
            </div>
            
            <div className="card bg-slate-700 border border-slate-600">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-green-400" />
                Security Clearance
              </h3>
              <p className="text-slate-300">
                Our facility and personnel maintain the highest security clearances, ensuring compliance with international defense standards.
              </p>
            </div>
            
            <div className="card bg-slate-700 border border-slate-600">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Star className="h-6 w-6 text-green-400" />
                Innovation Focus
              </h3>
              <p className="text-slate-300">
                We invest 25% of our revenue into R&D, continuously advancing the state of autonomous defense technology.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const renderContact = () => (
    <section className="min-h-screen bg-slate-900 py-20">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Contact ThorneGuard</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Ready to discuss your defense requirements? Our team of experts is standing by to provide consultation and support.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-16">
          <div className="space-y-8">
            <div className="card bg-slate-800 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6">Get In Touch</h3>
              
              <form onSubmit={handleContactSubmit} className="space-y-4" id="contact-form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label text-slate-300">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      className="input bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-slate-300">Email *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      className="input bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label text-slate-300">Company</label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                      className="input bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      placeholder="Defense Corp"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-slate-300">Position</label>
                    <input
                      type="text"
                      value={contactForm.position}
                      onChange={(e) => setContactForm(prev => ({ ...prev, position: e.target.value }))}
                      className="input bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                      placeholder="Procurement Officer"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label text-slate-300">Product Interest</label>
                  <select
                    value={contactForm.productInterest}
                    onChange={(e) => setContactForm(prev => ({ ...prev, productInterest: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white"
                  >
                    <option value="">Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.name}>{product.name}</option>
                    ))}
                    <option value="custom">Custom Solution</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label text-slate-300">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="input bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    placeholder="Please describe your requirements..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                >
                  Send Message <ArrowRight className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="card bg-slate-800 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">Headquarters</div>
                    <div className="text-slate-300">1200 Defense Plaza<br />Arlington, VA 22202<br />United States</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Phone className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">Sales</div>
                    <div className="text-slate-300">+1 (555) 123-4567</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-white font-semibold">Email</div>
                    <div className="text-slate-300">sales@thorneguard.com<br />support@thorneguard.com</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card bg-slate-800 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4">Recent Inquiries</h3>
              
              {inquiries.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {inquiries.slice(-5).reverse().map(inquiry => (
                    <div key={inquiry.id} className="p-3 bg-slate-700 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-white font-medium">{inquiry.name}</span>
                        <span className="text-slate-400 text-xs">
                          {new Date(inquiry.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-slate-300 text-sm">{inquiry.company}</div>
                      {inquiry.productInterest && (
                        <div className="text-green-400 text-xs mt-1">{inquiry.productInterest}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No inquiries yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const renderAiAnalysis = () => (
    <section className="min-h-screen bg-slate-800 py-20">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">AI Document Analysis</h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Upload defense specifications, requirements documents, or technical files for instant AI-powered analysis and recommendations.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="card bg-slate-700 border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-green-400" />
              Document Analysis Tool
            </h3>
            
            <div className="space-y-6">
              <div className="form-group">
                <label className="form-label text-slate-300">Analysis Prompt</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                  className="input bg-slate-600 border-slate-500 text-white placeholder-slate-400"
                  placeholder="Enter your analysis requirements or leave blank for automatic document analysis..."
                  id="ai-prompt-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-slate-300">Upload Document</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    className="input bg-slate-600 border-slate-500 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                    id="file-upload"
                  />
                </div>
                {selectedFile && (
                  <div className="mt-2 text-sm text-green-400">
                    Selected: {selectedFile.name}
                  </div>
                )}
              </div>
              
              <button
                onClick={handleAiAnalysis}
                disabled={isAiLoading || (!aiPrompt.trim() && !selectedFile)}
                className="btn bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white flex items-center gap-2"
                id="analyze-button"
              >
                {isAiLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Analyze Document
                  </>
                )}
              </button>
              
              {aiError && (
                <div className="alert alert-error">
                  <X className="h-5 w-5" />
                  <p>Error: {typeof aiError === 'string' ? aiError : 'Analysis failed. Please try again.'}</p>
                </div>
              )}
              
              {aiResult && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-white">Analysis Results:</h4>
                  <div className="bg-slate-600 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-slate-200 text-sm whitespace-pre-wrap">{aiResult}</pre>
                  </div>
                  <button
                    onClick={() => {
                      const blob = new Blob([aiResult], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'analysis_results.txt';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="btn btn-sm bg-slate-600 hover:bg-slate-500 text-white flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Results
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="card bg-slate-700 border border-slate-600 text-center">
              <Target className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Requirements Analysis</h4>
              <p className="text-slate-300 text-sm">Extract and analyze technical requirements from specification documents.</p>
            </div>
            
            <div className="card bg-slate-700 border border-slate-600 text-center">
              <Shield className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Compliance Check</h4>
              <p className="text-slate-300 text-sm">Verify compliance with military standards and regulations.</p>
            </div>
            
            <div className="card bg-slate-700 border border-slate-600 text-center">
              <Cpu className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h4 className="text-white font-semibold mb-2">Solution Matching</h4>
              <p className="text-slate-300 text-sm">Match requirements with our available defense solutions.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const renderSettings = () => (
    <section className="min-h-screen bg-slate-900 py-20">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Settings</h2>
          <p className="text-xl text-slate-300">Manage your preferences and data</p>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="card bg-slate-800 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Preferences</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Theme</div>
                  <div className="text-slate-400 text-sm">Choose your preferred theme</div>
                </div>
                <select
                  value={settings.theme}
                  onChange={(e) => saveSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
                  className="input w-32 bg-slate-700 border-slate-600 text-white"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Language</div>
                  <div className="text-slate-400 text-sm">Select your language</div>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => saveSettings({ ...settings, language: e.target.value })}
                  className="input w-32 bg-slate-700 border-slate-600 text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-white font-medium">Currency</div>
                  <div className="text-slate-400 text-sm">Pricing display currency</div>
                </div>
                <select
                  value={settings.currency}
                  onChange={(e) => saveSettings({ ...settings, currency: e.target.value })}
                  className="input w-32 bg-slate-700 border-slate-600 text-white"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="card bg-slate-800 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Data Management</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">Export Data</div>
                  <div className="text-slate-400 text-sm">Download all inquiries as CSV</div>
                </div>
                <button
                  onClick={downloadData}
                  className="btn btn-sm bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  id="export-data"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-700 rounded-lg">
                <div>
                  <div className="text-white font-medium">Clear All Data</div>
                  <div className="text-slate-400 text-sm">Delete all stored inquiries</div>
                </div>
                <button
                  onClick={clearAllData}
                  className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
                >
                  Clear Data
                </button>
              </div>
              
              <div className="p-4 bg-slate-700 rounded-lg">
                <div className="text-white font-medium mb-2">Storage Summary</div>
                <div className="text-slate-400 text-sm space-y-1">
                  <div>Total Inquiries: {inquiries.length}</div>
                  <div>Last Updated: {inquiries.length > 0 ? new Date(inquiries[inquiries.length - 1]?.timestamp || '').toLocaleDateString() : 'Never'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
  
  const renderFooter = () => (
    <footer className="bg-slate-900 border-t border-slate-700 py-12">
      <div className="container-wide">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-green-400" />
              <span className="text-xl font-bold text-white">ThorneGuard</span>
            </div>
            <p className="text-slate-400 text-sm">
              Leading the future of autonomous defense technology with precision, reliability, and innovation.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>Autonomous Sentries</li>
              <li>Drone Swarms</li>
              <li>Mobile Platforms</li>
              <li>Custom Solutions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Technology</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>AI Decision Engine</li>
              <li>Precision Targeting</li>
              <li>Secure Communications</li>
              <li>Global Connectivity</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>+1 (555) 123-4567</li>
              <li>sales@thorneguard.com</li>
              <li>1200 Defense Plaza</li>
              <li>Arlington, VA 22202</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-700 pt-8 text-center text-slate-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </div>
    </footer>
  );
  
  // Handle escape key for modals
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null);
        setExpandedProduct(null);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);
  
  return (
    <div className={`min-h-screen theme-transition ${settings.theme === 'dark' ? 'dark' : ''}`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
      
      {renderHeader()}
      
      <main>
        {activeSection === 'home' && renderHome()}
        {activeSection === 'products' && renderProducts()}
        {activeSection === 'technology' && renderTechnology()}
        {activeSection === 'about' && renderAbout()}
        {activeSection === 'contact' && renderContact()}
        {activeSection === 'ai-analysis' && renderAiAnalysis()}
        {activeSection === 'settings' && renderSettings()}
      </main>
      
      {renderFooter()}
    </div>
  );
}

export default App;