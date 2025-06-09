import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  CreditCard, 
  Coffee, 
  Car, 
  GraduationCap, 
  Star, 
  Check, 
  Menu, 
  X, 
  ChevronDown,
  Clock,
  Settings,
  BarChart3,
  Users,
  MessageCircle,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import styles from './styles/styles.module.css';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  rating: number;
  content: string;
  industry: string;
}

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  popular: boolean;
}

interface IndustryCase {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface WebsiteContent {
  hero: {
    title: string;
    subtitle: string;
    cta: string;
  };
  stats: {
    apps: string;
    customers: string;
    satisfaction: string;
    avgTime: string;
  };
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Admin states
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingContent, setEditingContent] = useState(false);
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);

  // AI Layer integration
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Load data from localStorage
  const [testimonials, setTestimonials] = useState<Testimonial[]>(() => {
    const saved = localStorage.getItem('buildit-testimonials');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        name: 'Sarah Chen',
        company: 'Brew & Bite Cafe',
        rating: 5,
        content: 'BuildIt transformed our cafe operations in just 8 minutes! The integrated payment system and order management saved us thousands in development costs.',
        industry: 'food'
      },
      {
        id: '2',
        name: 'Marcus Rodriguez',
        company: 'AutoFix Garage',
        rating: 5,
        content: 'As a mechanic, I never thought I could have my own service booking app. BuildIt made it possible without writing a single line of code!',
        industry: 'automotive'
      },
      {
        id: '3',
        name: 'Dr. Priya Sharma',
        company: 'EduTech Academy',
        rating: 5,
        content: 'Our student management system was up and running in 7 minutes. The AI integration helps us track student progress automatically.',
        industry: 'education'
      }
    ];
  });

  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(() => {
    const saved = localStorage.getItem('buildit-content');
    return saved ? JSON.parse(saved) : {
      hero: {
        title: 'From Idea to Production in Under 10 Minutes',
        subtitle: 'BuildIt is the revolutionary AI platform that transforms your business ideas into fully functional applications. No coding required, no technical expertise needed.',
        cta: 'Start Building Now'
      },
      stats: {
        apps: '10,000+',
        customers: '5,000+',
        satisfaction: '99%',
        avgTime: '8 mins'
      }
    };
  });

  const features: Feature[] = [
    {
      id: '1',
      icon: 'zap',
      title: 'Lightning Fast Deployment',
      description: 'Get your app from concept to production in under 10 minutes with our AI-powered platform.'
    },
    {
      id: '2',
      icon: 'shield',
      title: 'Built-in Security & Authentication',
      description: 'Enterprise-grade security, user authentication, and authorization included out of the box.'
    },
    {
      id: '3',
      icon: 'credit-card',
      title: 'Payment Integration',
      description: 'Razorpay and Stripe integrations ready to use. Start accepting payments immediately.'
    },
    {
      id: '4',
      icon: 'globe',
      title: 'Cloud & On-Premise',
      description: 'Deploy to cloud or on-premise infrastructure with automated scaling and monitoring.'
    },
    {
      id: '5',
      icon: 'code',
      title: 'AI-Powered Features',
      description: 'Smart AI capabilities integrated for your specific use case, from chatbots to analytics.'
    },
    {
      id: '6',
      icon: 'settings',
      title: 'Complete Digital Support',
      description: 'Testing, bug fixing, documentation, and deployment - everything handled automatically.'
    }
  ];

  const industrycases: IndustryCase[] = [
    {
      id: '1',
      title: 'Cafes & Eateries',
      description: 'Complete digital transformation for food businesses',
      icon: 'coffee',
      benefits: ['Online ordering system', 'Payment processing', 'Inventory management', 'Customer loyalty programs']
    },
    {
      id: '2',
      title: 'Auto Garages',
      description: 'Service booking and customer management',
      icon: 'car',
      benefits: ['Appointment scheduling', 'Service tracking', 'Parts inventory', 'Customer communication']
    },
    {
      id: '3',
      title: 'Educational Institutes',
      description: 'Student and course management systems',
      icon: 'graduation-cap',
      benefits: ['Student enrollment', 'Course management', 'Progress tracking', 'Parent communication']
    }
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: '1',
      name: 'Starter',
      price: '$29/month',
      features: ['1 Application', 'Basic AI Features', 'Cloud Deployment', 'Standard Support'],
      popular: false
    },
    {
      id: '2',
      name: 'Professional',
      price: '$99/month',
      features: ['5 Applications', 'Advanced AI Features', 'Cloud + On-Premise', 'Priority Support', 'Custom Integrations'],
      popular: true
    },
    {
      id: '3',
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited Applications', 'Full AI Suite', 'Dedicated Infrastructure', '24/7 Support', 'White-label Options'],
      popular: false
    }
  ];

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How quickly can I deploy my application?',
      answer: 'Most applications are deployed in under 10 minutes. Complex enterprise applications might take up to 30 minutes.'
    },
    {
      id: '2',
      question: 'Do I need any technical knowledge?',
      answer: 'No! BuildIt is designed for non-technical users. Simply describe your idea in plain English and our AI handles the rest.'
    },
    {
      id: '3',
      question: 'What payment methods are supported?',
      answer: 'We support Razorpay and Stripe out of the box, covering all major credit cards, digital wallets, and regional payment methods.'
    },
    {
      id: '4',
      question: 'Can I customize my application after deployment?',
      answer: 'Yes! You can make changes anytime through our intuitive interface. Updates are deployed automatically.'
    },
    {
      id: '5',
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade security with encryption, secure authentication, and compliance with major data protection regulations.'
    }
  ];

  useEffect(() => {
    localStorage.setItem('buildit-testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('buildit-content', JSON.stringify(websiteContent));
  }, [websiteContent]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize chat with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        id: '1',
        type: 'bot',
        content: 'Hi! I\'m here to help you learn about BuildIt. Ask me anything about our AI platform, pricing, features, or how we can help transform your business idea into a production app!',
        timestamp: new Date()
      }]);
    }
  }, [chatMessages.length]);

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Prepare AI prompt with context
    const contextPrompt = `You are a helpful assistant for BuildIt, an AI platform that transforms business ideas into production-ready applications in under 10 minutes. 

BuildIt Features:
- Text-to-production app development
- Built-in authentication & authorization
- Razorpay & Stripe payment integration
- AI features integrated for specific use cases
- Cloud and on-premise deployment
- Complete digital support (testing, bug fixing, documentation)
- Perfect for cafes, garages, educational institutes, and more

User Question: ${chatInput}

Please provide a helpful, friendly response about BuildIt's capabilities. Keep it conversational and informative.`;

    // Call AI Layer
    setAiResult(null);
    setAiError(null);
    aiLayerRef.current?.sendToAI(contextPrompt);

    setChatInput('');
  };

  // Handle AI response for chat
  useEffect(() => {
    if (aiResult && isTyping) {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResult,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setAiResult(null);
    }
  }, [aiResult, isTyping]);

  // Handle AI errors for chat
  useEffect(() => {
    if (aiError && isTyping) {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I\'m having trouble responding right now. Please try again or contact our support team for immediate assistance.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      setAiError(null);
    }
  }, [aiError, isTyping]);

  const handleAddTestimonial = (testimonial: Omit<Testimonial, 'id'>) => {
    const newTestimonial = {
      ...testimonial,
      id: Date.now().toString()
    };
    setTestimonials(prev => [...prev, newTestimonial]);
    setShowAddTestimonial(false);
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setTestimonials(prev => prev.map(t => t.id === testimonial.id ? testimonial : t));
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const filteredTestimonials = selectedIndustry === 'all' 
    ? testimonials 
    : testimonials.filter(t => t.industry === selectedIndustry);

  const renderIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'zap': return <Zap className={className} />;
      case 'shield': return <Shield className={className} />;
      case 'credit-card': return <CreditCard className={className} />;
      case 'globe': return <Globe className={className} />;
      case 'code': return <Code className={className} />;
      case 'settings': return <Settings className={className} />;
      case 'coffee': return <Coffee className={className} />;
      case 'car': return <Car className={className} />;
      case 'graduation-cap': return <GraduationCap className={className} />;
      default: return <Zap className={className} />;
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div id="welcome_fallback" className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 theme-transition ${styles.app}`}>
      {/* AI Layer for chatbot */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Navigation */}
      <nav id="navigation" className="fixed top-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700 z-50 theme-transition">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#548b99] to-[#95c7c3] rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">BuildIt</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className="text-gray-600 hover:text-[#548b99] dark:text-gray-300 dark:hover:text-[#95c7c3] transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('features')}
                className="text-gray-600 hover:text-[#548b99] dark:text-gray-300 dark:hover:text-[#95c7c3] transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection('solutions')}
                className="text-gray-600 hover:text-[#548b99] dark:text-gray-300 dark:hover:text-[#95c7c3] transition-colors"
              >
                Solutions
              </button>
              <button 
                onClick={() => scrollToSection('pricing')}
                className="text-gray-600 hover:text-[#548b99] dark:text-gray-300 dark:hover:text-[#95c7c3] transition-colors"
              >
                Pricing
              </button>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <button 
                onClick={() => scrollToSection('home')}
                className="bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white px-6 py-2 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex flex-col space-y-3">
                <button onClick={() => scrollToSection('home')} className="text-left text-gray-600 dark:text-gray-300 hover:text-[#548b99] dark:hover:text-[#95c7c3] transition-colors">Home</button>
                <button onClick={() => scrollToSection('features')} className="text-left text-gray-600 dark:text-gray-300 hover:text-[#548b99] dark:hover:text-[#95c7c3] transition-colors">Features</button>
                <button onClick={() => scrollToSection('solutions')} className="text-left text-gray-600 dark:text-gray-300 hover:text-[#548b99] dark:hover:text-[#95c7c3] transition-colors">Solutions</button>
                <button onClick={() => scrollToSection('pricing')} className="text-left text-gray-600 dark:text-gray-300 hover:text-[#548b99] dark:hover:text-[#95c7c3] transition-colors">Pricing</button>
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>
                  <button className="bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white px-6 py-2 rounded-full hover:shadow-lg transition-all duration-200">
                    Get Started
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {/* Hero Section */}
        <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
          <div id="generation_issue_fallback" className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-block">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-[#C3E0DD] to-[#91C8C3] text-[#548b99] mb-6">
                  <Zap className="w-4 h-4 mr-2" />
                  Revolutionary AI Platform
                </span>
              </div>
              
              {editingContent && currentUser ? (
                <div className="space-y-4 mb-8">
                  <input
                    type="text"
                    value={websiteContent.hero.title}
                    onChange={(e) => setWebsiteContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, title: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-3xl lg:text-5xl font-bold text-center"
                  />
                  <textarea
                    value={websiteContent.hero.subtitle}
                    onChange={(e) => setWebsiteContent(prev => ({
                      ...prev,
                      hero: { ...prev.hero, subtitle: e.target.value }
                    }))}
                    className="w-full p-3 border border-gray-300 rounded-lg text-lg text-center"
                    rows={3}
                  />
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setEditingContent(false)}
                      className="btn btn-primary"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingContent(false)}
                      className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-4xl lg:text-6xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6 leading-tight">
                    {websiteContent.hero.title}
                    {currentUser && (
                      <button
                        onClick={() => setEditingContent(true)}
                        className="ml-4 p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                  </h1>
                  <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] mb-8 max-w-3xl mx-auto leading-relaxed">
                    {websiteContent.hero.subtitle}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-16">
                <button className="bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center">
                  {websiteContent.hero.cta}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="border-2 border-[#548b99] text-[#548b99] dark:text-[#95c7c3] dark:border-[#95c7c3] px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#548b99] hover:text-white dark:hover:bg-[#95c7c3] dark:hover:text-slate-900 transition-all duration-200">
                  Watch Demo
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-3xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#548b99] dark:text-[#95c7c3] mb-2">{websiteContent.stats.apps}</div>
                  <div className="text-gray-600 dark:text-gray-400">Apps Built</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#548b99] dark:text-[#95c7c3] mb-2">{websiteContent.stats.customers}</div>
                  <div className="text-gray-600 dark:text-gray-400">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#548b99] dark:text-[#95c7c3] mb-2">{websiteContent.stats.satisfaction}</div>
                  <div className="text-gray-600 dark:text-gray-400">Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#548b99] dark:text-[#95c7c3] mb-2">{websiteContent.stats.avgTime}</div>
                  <div className="text-gray-600 dark:text-gray-400">Avg. Build Time</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white dark:bg-slate-800 theme-transition">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                Everything You Need, Out of the Box
              </h2>
              <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
                BuildIt provides a comprehensive suite of features that eliminate the need for technical expertise, 
                multiple vendors, and lengthy development cycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.id} className="group bg-gray-50 dark:bg-slate-700 p-8 rounded-2xl hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#548b99] to-[#95c7c3] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-200">
                    {renderIcon(feature.icon, 'w-6 h-6 text-white')}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-[#424B54] dark:text-[#F7FAFC] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Solutions */}
        <section id="solutions" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 theme-transition">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                Tailored Solutions for Every Industry
              </h2>
              <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
                From cafes to garages, educational institutes to retail stores - BuildIt adapts to your specific business needs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {industryCase.map((industry) => (
                <div key={industry.id} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#548b99] to-[#95c7c3] rounded-2xl flex items-center justify-center mb-6">
                    {renderIcon(industry.icon, 'w-8 h-8 text-white')}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">
                    {industry.title}
                  </h3>
                  <p className="text-[#424B54] dark:text-[#F7FAFC] mb-6">
                    {industry.description}
                  </p>
                  <ul className="space-y-3">
                    {industry.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-[#424B54] dark:text-[#F7FAFC]">
                        <Check className="w-5 h-5 text-[#548b99] dark:text-[#95c7c3] mr-3 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 bg-white dark:bg-slate-800 theme-transition">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-16">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                  What Our Customers Say
                </h2>
                <p className="text-xl text-[#424B54] dark:text-[#F7FAFC]">
                  Real stories from real businesses transformed by BuildIt.
                </p>
              </div>
              {currentUser && (
                <button
                  onClick={() => setShowAddTestimonial(true)}
                  className="btn btn-primary flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {['all', 'food', 'automotive', 'education'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedIndustry(filter)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedIndustry === filter
                      ? 'bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {filter === 'all' ? 'All Industries' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {filteredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gray-50 dark:bg-slate-700 p-8 rounded-2xl relative">
                  {currentUser && (
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => setEditingTestimonial(testimonial)}
                        className="p-2 rounded-lg bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-[#424B54] dark:text-[#F7FAFC] mb-6 italic leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div>
                    <div className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">{testimonial.name}</div>
                    <div className="text-[#548b99] dark:text-[#95c7c3]">{testimonial.company}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 theme-transition">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
                Choose the plan that fits your business. No hidden fees, no surprises. Scale as you grow.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <div key={plan.id} className={`bg-white dark:bg-slate-800 p-8 rounded-2xl relative ${
                  plan.popular ? 'ring-2 ring-[#548b99] scale-105 shadow-2xl' : 'shadow-lg hover:shadow-xl'
                } transition-all duration-300`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white px-6 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">{plan.name}</h3>
                    <div className="text-4xl font-bold text-[#548b99] dark:text-[#95c7c3] mb-2">{plan.price}</div>
                    {plan.price !== 'Custom' && <div className="text-gray-600 dark:text-gray-400">per month</div>}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-[#424B54] dark:text-[#F7FAFC]">
                        <Check className="w-5 h-5 text-[#548b99] dark:text-[#95c7c3] mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 rounded-full font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white hover:shadow-lg transform hover:scale-105'
                      : 'border-2 border-[#548b99] text-[#548b99] dark:text-[#95c7c3] dark:border-[#95c7c3] hover:bg-[#548b99] hover:text-white dark:hover:bg-[#95c7c3] dark:hover:text-slate-900'
                  }`}>
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 bg-white dark:bg-slate-800 theme-transition">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
                Everything you need to know about BuildIt. Can't find what you're looking for? 
                Chat with our AI assistant below.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-gray-50 dark:bg-slate-700 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFAQ(openFAQ === faq.id ? null : faq.id)}
                    className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                  >
                    <span className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">{faq.question}</span>
                    <ChevronDown className={`w-5 h-5 text-[#548b99] dark:text-[#95c7c3] transition-transform ${
                      openFAQ === faq.id ? 'rotate-180' : ''
                    }`} />
                  </button>
                  {openFAQ === faq.id && (
                    <div className="px-6 pb-6">
                      <p className="text-[#424B54] dark:text-[#F7FAFC] leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Admin Panel */}
        {currentUser && (
          <section id="admin-panel" className="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 theme-transition">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl">
                <h2 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-8 flex items-center">
                  <Settings className="w-8 h-8 mr-3" />
                  Admin Dashboard
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="stat-card">
                    <div className="stat-title">Total Testimonials</div>
                    <div className="stat-value">{testimonials.length}</div>
                    <div className="stat-desc">Active customer reviews</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">FAQ Items</div>
                    <div className="stat-value">{faqs.length}</div>
                    <div className="stat-desc">Knowledge base entries</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Features</div>
                    <div className="stat-value">{features.length}</div>
                    <div className="stat-desc">Platform capabilities</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setShowAddTestimonial(true)}
                        className="w-full btn btn-primary flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Testimonial
                      </button>
                      <button
                        onClick={() => setEditingContent(true)}
                        className="w-full btn bg-[#548b99] text-white hover:bg-[#477a85] flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Hero Content
                      </button>
                      <button
                        onClick={() => {
                          const data = { testimonials, websiteContent, faqs, features };
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = 'buildit-website-data.json';
                          a.click();
                        }}
                        className="w-full btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Recent Activity</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                        Website content updated
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                        New testimonial added
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
                        Admin dashboard accessed
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#1F2E3D] dark:bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-r from-[#548b99] to-[#95c7c3] rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">BuildIt</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Transform your business ideas into production-ready applications in under 10 minutes. 
                No coding required, no technical expertise needed.
              </p>
              <div className="flex space-x-4">
                <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-sm">f</span>
                </button>
                <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-sm">t</span>
                </button>
                <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                  <span className="text-sm">in</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3 text-gray-300">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('solutions')} className="hover:text-white transition-colors">Solutions</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </p>
            <AdminLogin linkText="Admin Login" />
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen ? (
          <div className="w-96 h-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-[#548b99] to-[#95c7c3] rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">BuildIt Assistant</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-xl ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white' 
                      : 'bg-gray-100 dark:bg-slate-700 text-[#424B54] dark:text-[#F7FAFC]'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-slate-700 p-3 rounded-xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask about BuildIt..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#548b99] dark:bg-slate-700 dark:text-white text-sm"
                  disabled={isTyping}
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={isTyping || !chatInput.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-[#548b99] to-[#95c7c3] text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Add Testimonial Modal */}
      {showAddTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Add New Testimonial</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleAddTestimonial({
                name: formData.get('name') as string,
                company: formData.get('company') as string,
                rating: parseInt(formData.get('rating') as string),
                content: formData.get('content') as string,
                industry: formData.get('industry') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input name="name" type="text" className="input" required />
                </div>
                <div>
                  <label className="form-label">Company</label>
                  <input name="company" type="text" className="input" required />
                </div>
                <div>
                  <label className="form-label">Rating</label>
                  <select name="rating" className="input" required>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Industry</label>
                  <select name="industry" className="input" required>
                    <option value="food">Food & Beverage</option>
                    <option value="automotive">Automotive</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Testimonial</label>
                  <textarea name="content" className="input" rows={4} required></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddTestimonial(false)}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Testimonial Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Edit Testimonial</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleEditTestimonial({
                ...editingTestimonial,
                name: formData.get('name') as string,
                company: formData.get('company') as string,
                rating: parseInt(formData.get('rating') as string),
                content: formData.get('content') as string,
                industry: formData.get('industry') as string
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input name="name" type="text" className="input" defaultValue={editingTestimonial.name} required />
                </div>
                <div>
                  <label className="form-label">Company</label>
                  <input name="company" type="text" className="input" defaultValue={editingTestimonial.company} required />
                </div>
                <div>
                  <label className="form-label">Rating</label>
                  <select name="rating" className="input" defaultValue={editingTestimonial.rating} required>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Industry</label>
                  <select name="industry" className="input" defaultValue={editingTestimonial.industry} required>
                    <option value="food">Food & Beverage</option>
                    <option value="automotive">Automotive</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Testimonial</label>
                  <textarea name="content" className="input" rows={4} defaultValue={editingTestimonial.content} required></textarea>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingTestimonial(null)}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;