import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  Zap, 
  Shield, 
  Database, 
  CreditCard, 
  Brain, 
  Code, 
  Settings, 
  Users, 
  Star, 
  ArrowRight, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  MapPin,
  Clock,
  Rocket,
  Target,
  Award,
  Building,
  MessageCircle
} from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { useAuth } from './contexts/authContext';
import ReactMarkdown from 'react-markdown';

// Types
interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted: boolean;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
}

interface ContactForm {
  name: string;
  email: string;
  company: string;
  message: string;
}

interface DemoRequest {
  name: string;
  email: string;
  company: string;
  useCase: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Custom hook for dark mode
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };
  
  return { isDark, toggleDarkMode };
};

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  
  // Navigation state
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // AI Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hi! I\'m here to help you learn about BuildIt. Ask me anything about our 7-minute app development platform!',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Form states
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  
  const [demoRequest, setDemoRequest] = useState<DemoRequest>({
    name: '',
    email: '',
    company: '',
    useCase: ''
  });
  
  // Admin content management
  const [features, setFeatures] = useState<Feature[]>([
    {
      id: '1',
      icon: <Zap className="w-8 h-8" />,
      title: '7-Minute Development',
      description: 'Transform any idea into a fully functional app in just 7 minutes with our AI-powered platform.'
    },
    {
      id: '2',
      icon: <Users className="w-8 h-8" />,
      title: 'Built-in RBAC',
      description: 'Out-of-the-box user management with Role-Based Access Control for enterprise-grade security.'
    },
    {
      id: '3',
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Integration',
      description: 'Advanced AI capabilities for text, media, and file processing built into every application.'
    },
    {
      id: '4',
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Payment Gateway',
      description: 'Integrated Razorpay and Stripe payment processing ready to accept payments immediately.'
    },
    {
      id: '5',
      icon: <Shield className="w-8 h-8" />,
      title: 'Security First',
      description: 'Automatic vulnerability management and security monitoring built into every deployment.'
    },
    {
      id: '6',
      icon: <Database className="w-8 h-8" />,
      title: 'Data Lake Integration',
      description: 'Seamless data lake connectivity for enterprise-scale data processing and analytics.'
    }
  ]);
  
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'CTO',
      company: 'TechStart Inc.',
      content: 'BuildIt transformed our development process. What used to take weeks now takes minutes. The AI integration is phenomenal!',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'Product Manager',
      company: 'InnovateCorp',
      content: 'The 7-minute promise seemed too good to be true, but BuildIt delivered. Our MVP was ready for investors in minutes.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      id: '3',
      name: 'Emily Johnson',
      role: 'Founder',
      company: 'StartupXYZ',
      content: 'As a non-technical founder, BuildIt gave me the power to create complex applications without hiring a development team.',
      rating: 5,
      avatar: '👩‍🚀'
    }
  ]);
  
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([
    {
      id: '1',
      name: 'Starter',
      price: '$99',
      period: '/month',
      description: 'Perfect for individual developers and small projects',
      features: [
        '5 app deployments per month',
        'Basic AI integration',
        'Standard security features',
        'Email support',
        'Cloud deployment'
      ],
      highlighted: false
    },
    {
      id: '2',
      name: 'Professional',
      price: '$299',
      period: '/month',
      description: 'Ideal for growing teams and businesses',
      features: [
        '25 app deployments per month',
        'Advanced AI capabilities',
        'RBAC user management',
        'Payment gateway integration',
        'Priority support',
        'On-premises deployment option'
      ],
      highlighted: true
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations with specific needs',
      features: [
        'Unlimited app deployments',
        'Full AI suite access',
        'Advanced security & compliance',
        'Data lake integration',
        'Dedicated support team',
        'Custom integrations',
        'SLA guarantees'
      ],
      highlighted: false
    }
  ]);
  
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Dr. Alex Kumar',
      role: 'CEO & Founder',
      bio: 'Former Google AI researcher with 15+ years in enterprise software development.',
      image: '👨‍🔬'
    },
    {
      id: '2',
      name: 'Maria Gonzalez',
      role: 'CTO',
      bio: 'Ex-Microsoft architect specializing in cloud infrastructure and AI systems.',
      image: '👩‍💻'
    },
    {
      id: '3',
      name: 'David Park',
      role: 'Head of AI',
      bio: 'PhD in Machine Learning from Stanford, leading our AI development initiatives.',
      image: '👨‍🎓'
    },
    {
      id: '4',
      name: 'Lisa Wang',
      role: 'VP of Product',
      bio: 'Product strategist with experience scaling platforms to millions of users.',
      image: '👩‍💼'
    }
  ]);

  // Load data from localStorage
  useEffect(() => {
    const savedFeatures = localStorage.getItem('buildit_features');
    const savedTestimonials = localStorage.getItem('buildit_testimonials');
    const savedPricing = localStorage.getItem('buildit_pricing');
    
    if (savedFeatures) {
      try {
        setFeatures(JSON.parse(savedFeatures));
      } catch (e) {
        console.error('Error loading features:', e);
      }
    }
    
    if (savedTestimonials) {
      try {
        setTestimonials(JSON.parse(savedTestimonials));
      } catch (e) {
        console.error('Error loading testimonials:', e);
      }
    }
    
    if (savedPricing) {
      try {
        setPricingTiers(JSON.parse(savedPricing));
      } catch (e) {
        console.error('Error loading pricing:', e);
      }
    }
  }, []);

  // Save data to localStorage
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  // Handle AI chat
  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Prepare AI prompt with context
    const contextPrompt = `You are a helpful assistant for BuildIt, a revolutionary text-to-production app platform that converts any idea into a working app in just 7 minutes. 

Key features of BuildIt:
- 7-minute app development from idea to deployment
- Built-in user management with RBAC
- AI integration for text, media, and files
- Payment gateway integration (Razorpay and Stripe)
- Automatic vulnerability management
- Data lake integration
- Cloud and on-premises deployment options

Pricing:
- Starter: $99/month (5 apps, basic features)
- Professional: $299/month (25 apps, advanced features)
- Enterprise: Custom pricing (unlimited apps, full features)

User question: ${chatInput}

Please provide a helpful, informative response about BuildIt's capabilities and features. Keep it conversational and engaging.`;
    
    setChatInput('');
    setAiResult(null);
    setAiError(null);
    
    aiLayerRef.current?.sendToAI(contextPrompt);
  };

  // Handle AI result
  useEffect(() => {
    if (aiResult && !aiLoading) {
      const aiMessage: ChatMessage = {
        id: Date.now().toString(),
        text: aiResult,
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      setAiResult(null);
    }
  }, [aiResult, aiLoading]);

  // Handle forms
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    const contacts = JSON.parse(localStorage.getItem('buildit_contacts') || '[]');
    const newContact = {
      ...contactForm,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    contacts.push(newContact);
    localStorage.setItem('buildit_contacts', JSON.stringify(contacts));
    
    // Reset form
    setContactForm({ name: '', email: '', company: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save to localStorage
    const demos = JSON.parse(localStorage.getItem('buildit_demos') || '[]');
    const newDemo = {
      ...demoRequest,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    demos.push(newDemo);
    localStorage.setItem('buildit_demos', JSON.stringify(demos));
    
    // Reset form
    setDemoRequest({ name: '', email: '', company: '', useCase: '' });
    alert('Demo request submitted! We\'ll contact you within 24 hours to schedule your personalized demo.');
  };

  // Admin functions
  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      icon: <Star className="w-8 h-8" />,
      title: 'New Feature',
      description: 'Feature description'
    };
    const updatedFeatures = [...features, newFeature];
    setFeatures(updatedFeatures);
    saveToLocalStorage('buildit_features', updatedFeatures);
  };

  const updateFeature = (id: string, updates: Partial<Feature>) => {
    const updatedFeatures = features.map(feature => 
      feature.id === id ? { ...feature, ...updates } : feature
    );
    setFeatures(updatedFeatures);
    saveToLocalStorage('buildit_features', updatedFeatures);
  };

  const deleteFeature = (id: string) => {
    const updatedFeatures = features.filter(feature => feature.id !== id);
    setFeatures(updatedFeatures);
    saveToLocalStorage('buildit_features', updatedFeatures);
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: 'New Customer',
      role: 'Role',
      company: 'Company',
      content: 'Testimonial content',
      rating: 5,
      avatar: '👤'
    };
    const updatedTestimonials = [...testimonials, newTestimonial];
    setTestimonials(updatedTestimonials);
    saveToLocalStorage('buildit_testimonials', updatedTestimonials);
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    const updatedTestimonials = testimonials.map(testimonial => 
      testimonial.id === id ? { ...testimonial, ...updates } : testimonial
    );
    setTestimonials(updatedTestimonials);
    saveToLocalStorage('buildit_testimonials', updatedTestimonials);
  };

  const deleteTestimonial = (id: string) => {
    const updatedTestimonials = testimonials.filter(testimonial => testimonial.id !== id);
    setTestimonials(updatedTestimonials);
    saveToLocalStorage('buildit_testimonials', updatedTestimonials);
  };

  const navigation = [
    { id: 'home', label: 'Home' },
    { id: 'features', label: 'Features' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Navigation */}
      <nav id="main-navigation" className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
        <div className="container container-lg">
          <div className="flex-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent buildit-logo">
                BuildIt
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  id={`${item.id}-tab`}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-link transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'nav-link-active text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              
              <button
                id="demo-cta"
                onClick={() => setActiveTab('contact')}
                className="btn btn-primary btn-sm hidden md:inline-flex"
              >
                Request Demo
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden pb-4 animate-slide-in-down">
              <div className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`nav-link text-left py-3 px-4 rounded-lg ${
                      activeTab === item.id ? 'nav-link-active' : ''
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setActiveTab('contact');
                    setIsMobileMenuOpen(false);
                  }}
                  className="btn btn-primary mt-2"
                >
                  Request Demo
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div id="generation_issue_fallback" className="space-y-0">
            {/* Hero Section */}
            <section className="py-20 lg:py-32">
              <div className="container container-lg">
                <div className="text-center max-w-4xl mx-auto space-y-8">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium">
                      <Zap className="w-4 h-4" />
                      Revolutionary AI Platform
                    </div>
                    <h1 className="heading-1 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                      From Idea to Production in 
                      <span className="block text-blue-600 dark:text-blue-400">7 Minutes</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                      Transform any thought, idea, or business problem into a fully functional app with AI coding, 
                      RBAC, payment integration, security, and deployment - all automated in just 7 minutes.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={() => setActiveTab('contact')}
                      className="btn btn-primary btn-lg group"
                    >
                      <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Start Building Now
                    </button>
                    <button
                      onClick={() => setActiveTab('features')}
                      className="btn btn-secondary btn-lg"
                    >
                      Explore Features
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">7min</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Idea to Production</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">99.9%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Uptime SLA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">50K+</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Apps Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">Enterprise</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Grade Security</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Preview */}
            <section className="py-20 bg-gray-50 dark:bg-gray-800/50">
              <div className="container container-lg">
                <div className="text-center mb-16">
                  <h2 className="heading-2 mb-4">Everything You Need, Out of the Box</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Our AI platform handles coding, integration, testing, deployment, and more - 
                    so you can focus on your ideas, not infrastructure.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.slice(0, 6).map((feature) => (
                    <div key={feature.id} className="card card-padding card-hover group">
                      <div className="text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        {feature.icon}
                      </div>
                      <h3 className="heading-5 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-12">
                  <button
                    onClick={() => setActiveTab('features')}
                    className="btn btn-primary"
                  >
                    View All Features
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section className="py-20">
              <div className="container container-lg">
                <div className="text-center mb-16">
                  <h2 className="heading-2 mb-4">How BuildIt Works</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    From concept to deployment in three simple steps, powered by advanced AI
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="heading-5 mb-4">1. Describe Your Idea</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Simply describe your app idea in plain English. Our AI understands context, 
                      requirements, and business logic automatically.
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Brain className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="heading-5 mb-4">2. AI Builds & Tests</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Our AI handles coding, integration, security implementation, testing, 
                      and bug fixing - all automatically in minutes.
                    </p>
                  </div>

                  <div className="text-center group">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <Rocket className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="heading-5 mb-4">3. Deploy & Scale</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Your app is deployed to cloud or on-premises infrastructure 
                      with monitoring, security, and scaling built-in.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="container container-lg">
                <div className="text-center mb-16">
                  <h2 className="heading-2 text-white mb-4">Trusted by Innovators</h2>
                  <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                    See what industry leaders are saying about BuildIt
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="card card-padding bg-white/10 backdrop-blur-sm border-white/20 text-white">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="mb-6 text-blue-50">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{testimonial.avatar}</span>
                        <div>
                          <div className="font-semibold">{testimonial.name}</div>
                          <div className="text-sm text-blue-200">{testimonial.role}, {testimonial.company}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
              <div className="container container-lg">
                <div className="card card-padding bg-gradient-to-r from-gray-900 to-blue-900 text-white text-center">
                  <h2 className="heading-2 mb-4">Ready to Build the Future?</h2>
                  <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
                    Join thousands of innovators who are transforming ideas into reality in just 7 minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => setActiveTab('contact')}
                      className="btn btn-primary btn-lg"
                    >
                      <Rocket className="w-5 h-5" />
                      Start Your Free Trial
                    </button>
                    <button
                      onClick={() => setActiveTab('pricing')}
                      className="btn btn-secondary btn-lg bg-white text-gray-900 hover:bg-gray-100"
                    >
                      View Pricing
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="py-20">
            <div className="container container-lg">
              <div className="text-center mb-16">
                <h1 className="heading-1 mb-4">Comprehensive Feature Suite</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                  Every feature you need to build, deploy, and scale enterprise-grade applications 
                  is included out of the box.
                </p>
              </div>

              {/* Admin Features Management */}
              {currentUser && (
                <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="heading-5 mb-4 text-blue-800 dark:text-blue-200">Admin: Manage Features</h3>
                  <button
                    onClick={addFeature}
                    className="btn btn-primary btn-sm mb-4"
                  >
                    Add Feature
                  </button>
                </div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature) => (
                  <div key={feature.id} className="card card-padding card-hover group relative">
                    {currentUser && (
                      <div className="absolute top-4 right-4 flex gap-2">
                        <button
                          onClick={() => {
                            const title = prompt('Feature title:', feature.title);
                            const description = prompt('Feature description:', feature.description);
                            if (title && description) {
                              updateFeature(feature.id, { title, description });
                            }
                          }}
                          className="btn btn-secondary btn-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteFeature(feature.id)}
                          className="btn btn-error btn-xs"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    
                    <div className="text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                      {feature.icon}
                    </div>
                    <h3 className="heading-5 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                  </div>
                ))}
              </div>

              {/* Technical Deep Dive */}
              <section className="mt-20 pt-20 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center mb-16">
                  <h2 className="heading-2 mb-4">Technical Excellence</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Built on cutting-edge technology stack for performance, security, and scalability
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                  <div>
                    <h3 className="heading-4 mb-6">AI-Powered Development</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Code Generation</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Advanced AI models generate production-ready code from natural language
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Automated Testing</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Comprehensive test suite generation and execution
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Bug Detection & Fixing</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            AI identifies and resolves issues automatically
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="heading-4 mb-6">Enterprise Security</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">OWASP Compliance</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Built-in protection against top 10 security vulnerabilities
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Data Encryption</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            End-to-end encryption for data at rest and in transit
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                        <div>
                          <div className="font-semibold mb-1">Continuous Monitoring</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Real-time threat detection and response
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="py-20">
            <div className="container container-lg">
              <div className="text-center mb-16">
                <h1 className="heading-1 mb-4">Simple, Transparent Pricing</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Choose the plan that fits your needs. All plans include our core AI platform 
                  with 7-minute deployment guarantee.
                </p>
              </div>

              {/* Admin Pricing Management */}
              {currentUser && (
                <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="heading-5 mb-4 text-blue-800 dark:text-blue-200">Admin: Manage Pricing</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-300">
                    Pricing management available. Contact development team for pricing structure updates.
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingTiers.map((tier) => (
                  <div 
                    key={tier.id} 
                    className={`card card-padding relative ${
                      tier.highlighted 
                        ? 'ring-2 ring-blue-500 dark:ring-blue-400 scale-105' 
                        : ''
                    }`}
                  >
                    {tier.highlighted && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="badge badge-primary px-4 py-2">Most Popular</span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className="heading-4 mb-2">{tier.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-gray-600 dark:text-gray-400">{tier.period}</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">{tier.description}</p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {tier.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => setActiveTab('contact')}
                      className={`btn w-full ${
                        tier.highlighted ? 'btn-primary' : 'btn-secondary'
                      }`}
                    >
                      {tier.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                    </button>
                  </div>
                ))}
              </div>

              {/* FAQ Section */}
              <section className="mt-20 pt-20 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center mb-12">
                  <h2 className="heading-2 mb-4">Frequently Asked Questions</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  <div>
                    <h4 className="font-semibold mb-2">What's included in the free trial?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Full access to all features for 14 days, including 3 app deployments, 
                      AI integration, and premium support.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Can I change plans anytime?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Yes, you can upgrade or downgrade your plan at any time. 
                      Changes take effect on your next billing cycle.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">What happens to my apps if I cancel?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Your apps continue running for 30 days after cancellation. 
                      You can export your code and data anytime.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Do you offer custom enterprise solutions?</h4>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      Yes, we provide custom integrations, dedicated support, 
                      and on-premises deployment for enterprise clients.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="py-20">
            <div className="container container-lg">
              {/* Company Story */}
              <section className="mb-20">
                <div className="text-center mb-16">
                  <h1 className="heading-1 mb-4">About BuildIt</h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                    We're on a mission to democratize software development and make 
                    app creation accessible to everyone, regardless of technical background.
                  </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="heading-3 mb-6">Our Story</h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-300">
                      <p>
                        Founded in 2023 by a team of AI researchers and enterprise software veterans, 
                        BuildIt was born from the frustration of seeing great ideas die due to technical barriers.
                      </p>
                      <p>
                        We realized that with advances in AI and automation, we could eliminate the 
                        complexity of software development while maintaining enterprise-grade quality and security.
                      </p>
                      <p>
                        Today, BuildIt powers thousands of applications across industries, from startups 
                        building their first MVP to Fortune 500 companies automating internal processes.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="card card-padding">
                      <div className="flex items-center gap-4 mb-4">
                        <Target className="w-8 h-8 text-blue-600" />
                        <h3 className="heading-5">Our Mission</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        To eliminate the technical barriers between ideas and reality, 
                        enabling anyone to build production-ready applications in minutes.
                      </p>
                    </div>
                    <div className="card card-padding">
                      <div className="flex items-center gap-4 mb-4">
                        <Award className="w-8 h-8 text-purple-600" />
                        <h3 className="heading-5">Our Vision</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300">
                        A world where every innovative idea can become a reality, 
                        accelerating human progress through accessible technology.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Team Section */}
              <section className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="heading-2 mb-4">Meet Our Team</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    World-class experts in AI, software architecture, and product development
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="card card-padding text-center card-hover">
                      <div className="text-6xl mb-4">{member.image}</div>
                      <h3 className="heading-5 mb-2">{member.name}</h3>
                      <div className="text-blue-600 dark:text-blue-400 font-medium mb-3">{member.role}</div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{member.bio}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Values */}
              <section className="mb-20">
                <div className="text-center mb-12">
                  <h2 className="heading-2 mb-4">Our Values</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex-center mx-auto mb-6">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="heading-5 mb-4">Speed Without Compromise</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      We believe fast development shouldn't mean sacrificing quality, 
                      security, or maintainability.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex-center mx-auto mb-6">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="heading-5 mb-4">Democratization</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Technology should empower everyone, not just those with technical expertise.
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex-center mx-auto mb-6">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="heading-5 mb-4">Security First</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Every application we generate meets enterprise-grade security standards from day one.
                    </p>
                  </div>
                </div>
              </section>

              {/* Contact CTA */}
              <section className="text-center">
                <div className="card card-padding bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <h2 className="heading-3 mb-4">Ready to Join the Revolution?</h2>
                  <p className="text-lg mb-8 text-blue-100">
                    Experience the future of software development today
                  </p>
                  <button
                    onClick={() => setActiveTab('contact')}
                    className="btn btn-secondary bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Get Started Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="py-20">
            <div className="container container-lg">
              <div className="text-center mb-16">
                <h1 className="heading-1 mb-4">Get Started Today</h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Ready to transform your ideas into reality? Contact us for a personalized demo 
                  or start your free trial today.
                </p>
              </div>

              {/* Admin Dashboard */}
              {currentUser && (
                <div className="mb-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h3 className="heading-5 mb-4 text-blue-800 dark:text-blue-200">Admin Dashboard</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="card card-padding">
                      <h4 className="font-semibold mb-3">Contact Submissions</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-2">
                        {JSON.parse(localStorage.getItem('buildit_contacts') || '[]').length}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Total inquiries received</p>
                    </div>
                    
                    <div className="card card-padding">
                      <h4 className="font-semibold mb-3">Demo Requests</h4>
                      <div className="text-2xl font-bold text-purple-600 mb-2">
                        {JSON.parse(localStorage.getItem('buildit_demos') || '[]').length}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Demos scheduled</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-12">
                {/* Demo Request Form */}
                <div className="card card-padding">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex-center">
                      <Play className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="heading-4">Request a Demo</h2>
                      <p className="text-gray-600 dark:text-gray-300">See BuildIt in action with a personalized demo</p>
                    </div>
                  </div>

                  <form onSubmit={handleDemoSubmit} className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="demo-name" className="form-label">Full Name</label>
                      <input
                        id="demo-name"
                        type="text"
                        className="input"
                        value={demoRequest.name}
                        onChange={(e) => setDemoRequest(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="demo-email" className="form-label">Work Email</label>
                      <input
                        id="demo-email"
                        type="email"
                        className="input"
                        value={demoRequest.email}
                        onChange={(e) => setDemoRequest(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="demo-company" className="form-label">Company</label>
                      <input
                        id="demo-company"
                        type="text"
                        className="input"
                        value={demoRequest.company}
                        onChange={(e) => setDemoRequest(prev => ({ ...prev, company: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="demo-usecase" className="form-label">Use Case</label>
                      <select
                        id="demo-usecase"
                        className="select"
                        value={demoRequest.useCase}
                        onChange={(e) => setDemoRequest(prev => ({ ...prev, useCase: e.target.value }))}
                        required
                      >
                        <option value="">Select your primary use case</option>
                        <option value="mvp">Build MVP for startup</option>
                        <option value="internal">Internal business tools</option>
                        <option value="client">Client project development</option>
                        <option value="automation">Process automation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-full">
                      <Clock className="w-4 h-4" />
                      Schedule Demo
                    </button>
                  </form>
                </div>

                {/* Contact Form */}
                <div className="card card-padding">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex-center">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="heading-4">Contact Us</h2>
                      <p className="text-gray-600 dark:text-gray-300">Have questions? We'd love to hear from you</p>
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="contact-name" className="form-label">Name</label>
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
                      <label htmlFor="contact-email" className="form-label">Email</label>
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
                      <label htmlFor="contact-company" className="form-label">Company</label>
                      <input
                        id="contact-company"
                        type="text"
                        className="input"
                        value={contactForm.company}
                        onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="contact-message" className="form-label">Message</label>
                      <textarea
                        id="contact-message"
                        className="textarea"
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                        required
                      />
                    </div>

                    <button type="submit" className="btn btn-primary w-full">
                      <Mail className="w-4 h-4" />
                      Send Message
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Info */}
              <section className="mt-20 pt-12 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center mb-12">
                  <h2 className="heading-3 mb-4">Other Ways to Reach Us</h2>
                </div>

                <div className="grid md:grid-cols-3 gap-8 text-center">
                  <div className="card card-padding">
                    <Mail className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                    <h3 className="heading-5 mb-2">Email</h3>
                    <p className="text-gray-600 dark:text-gray-300">hello@buildit.ai</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">We reply within 24 hours</p>
                  </div>

                  <div className="card card-padding">
                    <Phone className="w-8 h-8 text-green-600 mx-auto mb-4" />
                    <h3 className="heading-5 mb-2">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-300">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Mon-Fri, 9 AM - 6 PM PST</p>
                  </div>

                  <div className="card card-padding">
                    <MapPin className="w-8 h-8 text-purple-600 mx-auto mb-4" />
                    <h3 className="heading-5 mb-2">Office</h3>
                    <p className="text-gray-600 dark:text-gray-300">San Francisco, CA</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Available for in-person meetings</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="card w-80 h-96 flex flex-col bg-white dark:bg-gray-900 shadow-2xl">
            <div className="flex-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">BuildIt Assistant</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    }`}
                  >
                    {message.isUser ? (
                      <p className="text-sm">{message.text}</p>
                    ) : (
                      <div className="text-sm prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{message.text}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Ask about BuildIt..."
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={!chatInput.trim() || aiLoading}
                  className="btn btn-primary btn-sm"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container container-lg">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold buildit-logo">
                  BuildIt
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Transforming ideas into production-ready applications in just 7 minutes.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => setActiveTab('features')} className="block text-gray-400 hover:text-white transition-colors">Features</button>
                <button onClick={() => setActiveTab('pricing')} className="block text-gray-400 hover:text-white transition-colors">Pricing</button>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Documentation</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">API</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <button onClick={() => setActiveTab('about')} className="block text-gray-400 hover:text-white transition-colors">About</button>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Careers</a>
                <button onClick={() => setActiveTab('contact')} className="block text-gray-400 hover:text-white transition-colors">Contact</button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Community</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Status</a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <AdminLogin linkText="Admin Login" />
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;