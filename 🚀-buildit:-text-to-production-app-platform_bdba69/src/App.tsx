import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Code, 
  Zap, 
  Shield, 
  CreditCard, 
  Bot, 
  Coffee, 
  Car, 
  GraduationCap, 
  Check, 
  Star, 
  ArrowRight, 
  Menu, 
  X, 
  ChevronDown,
  Settings,
  FileText,
  Users,
  BarChart3,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  MessageCircle
} from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

interface UseCase {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
}

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  timestamp: string;
}

interface WebsiteContent {
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
  };
  features: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
  }>;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // AI Chatbot State
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'bot', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAIResult] = useState<string | null>(null);
  const [aiError, setAIError] = useState<any | null>(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Admin State
  const [adminActiveTab, setAdminActiveTab] = useState('content');

  // Data State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>({
    hero: {
      title: 'Transform Ideas into Production Apps in 10 Minutes',
      subtitle: 'BuildIt empowers non-technical entrepreneurs and SMEs to create fully functional applications with built-in payments, authentication, AI, and cloud deployment.',
      ctaText: 'Start Building Now'
    },
    features: [
      {
        id: '1',
        title: 'Text to Production',
        description: 'Describe your app idea in plain text and get a fully functional production application',
        icon: 'Code'
      },
      {
        id: '2',
        title: 'Lightning Fast',
        description: 'From concept to deployment in under 10 minutes with automated testing and bug fixes',
        icon: 'Zap'
      },
      {
        id: '3',
        title: 'Built-in Security',
        description: 'Enterprise-grade authentication and authorization included out of the box',
        icon: 'Shield'
      },
      {
        id: '4',
        title: 'Payment Ready',
        description: 'Razorpay and Stripe integration pre-configured for immediate monetization',
        icon: 'CreditCard'
      },
      {
        id: '5',
        title: 'AI Powered',
        description: 'Advanced AI capabilities integrated for your specific use case requirements',
        icon: 'Bot'
      },
      {
        id: '6',
        title: 'Cloud & On-Premise',
        description: 'Flexible deployment options with automatic scaling and maintenance',
        icon: 'Zap'
      }
    ]
  });

  // Initialize data from localStorage
  useEffect(() => {
    const savedTestimonials = localStorage.getItem('buildit_testimonials');
    const savedUseCases = localStorage.getItem('buildit_usecases');
    const savedPricing = localStorage.getItem('buildit_pricing');
    const savedSubmissions = localStorage.getItem('buildit_submissions');
    const savedContent = localStorage.getItem('buildit_content');

    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials));
    } else {
      const defaultTestimonials: Testimonial[] = [
        {
          id: '1',
          name: 'Sarah Chen',
          role: 'Cafe Owner',
          company: 'Brew & Beans',
          content: 'BuildIt transformed my coffee shop idea into a complete POS and ordering system in minutes. The payment integration works flawlessly!',
          rating: 5,
          avatar: '👩‍💼'
        },
        {
          id: '2',
          name: 'Michael Rodriguez',
          role: 'Garage Owner',
          company: 'AutoFix Pro',
          content: 'I described my garage management needs and got a full application with inventory, scheduling, and customer management. Incredible!',
          rating: 5,
          avatar: '👨‍🔧'
        },
        {
          id: '3',
          name: 'Dr. Priya Sharma',
          role: 'Education Director',
          company: 'Learn Academy',
          content: 'Our student management system was built and deployed faster than we could imagine. The AI features help us track student progress automatically.',
          rating: 5,
          avatar: '👩‍🏫'
        }
      ];
      setTestimonials(defaultTestimonials);
      localStorage.setItem('buildit_testimonials', JSON.stringify(defaultTestimonials));
    }

    if (savedUseCases) {
      setUseCases(JSON.parse(savedUseCases));
    } else {
      const defaultUseCases: UseCase[] = [
        {
          id: '1',
          title: 'Cafes & Restaurants',
          description: 'Complete POS, ordering, inventory, and customer management systems',
          icon: <Coffee className="w-8 h-8" />,
          features: ['Order Management', 'Payment Processing', 'Inventory Tracking', 'Customer Analytics', 'Staff Scheduling']
        },
        {
          id: '2',
          title: 'Auto Garages',
          description: 'Service scheduling, parts inventory, and customer relationship management',
          icon: <Car className="w-8 h-8" />,
          features: ['Service Booking', 'Parts Management', 'Customer History', 'Billing System', 'Mechanic Scheduling']
        },
        {
          id: '3',
          title: 'Educational Institutes',
          description: 'Student management, course tracking, and progress analytics',
          icon: <GraduationCap className="w-8 h-8" />,
          features: ['Student Records', 'Course Management', 'Grade Tracking', 'Parent Portal', 'AI Analytics']
        }
      ];
      setUseCases(defaultUseCases);
      localStorage.setItem('buildit_usecases', JSON.stringify(defaultUseCases));
    }

    if (savedPricing) {
      setPricingTiers(JSON.parse(savedPricing));
    } else {
      const defaultPricing: PricingTier[] = [
        {
          id: '1',
          name: 'Starter',
          price: '$99',
          period: '/month',
          description: 'Perfect for small businesses and startups',
          features: ['Up to 3 Apps', 'Basic AI Features', 'Cloud Hosting', 'Email Support', 'Payment Integration']
        },
        {
          id: '2',
          name: 'Professional',
          price: '$299',
          period: '/month',
          description: 'Ideal for growing businesses',
          features: ['Unlimited Apps', 'Advanced AI', 'Priority Support', 'Custom Domains', 'Analytics Dashboard', 'API Access'],
          popular: true
        },
        {
          id: '3',
          name: 'Enterprise',
          price: '$799',
          period: '/month',
          description: 'For large organizations',
          features: ['Everything in Pro', 'On-Premise Deployment', 'White Label', '24/7 Phone Support', 'Custom Integrations', 'SLA Guarantee']
        }
      ];
      setPricingTiers(defaultPricing);
      localStorage.setItem('buildit_pricing', JSON.stringify(defaultPricing));
    }

    if (savedSubmissions) {
      setContactSubmissions(JSON.parse(savedSubmissions));
    }

    if (savedContent) {
      setWebsiteContent(JSON.parse(savedContent));
    }
  }, []);

  // Handle AI response
  useEffect(() => {
    if (aiResult) {
      const botMessage = {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: aiResult
      };
      setChatMessages(prev => [...prev, botMessage]);
      setAIResult(null);
    }
  }, [aiResult]);

  // Handle AI error
  useEffect(() => {
    if (aiError) {
      const errorMessage = {
        id: Date.now().toString(),
        type: 'bot' as const,
        content: "I'm sorry, I encountered an error while processing your request. Please try again or contact our support team."
      };
      setChatMessages(prev => [...prev, errorMessage]);
      setAIError(null);
    }
  }, [aiError]);

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput
    };
    setChatMessages(prev => [...prev, userMessage]);

    const contextualPrompt = `You are a helpful assistant for BuildIt, a text-to-production app platform that helps non-technical entrepreneurs and SMEs create fully functional applications in under 10 minutes. 

BuildIt Features:
- Text to production app development
- Built-in authentication and authorization
- Razorpay and Stripe payment integration
- AI capabilities integrated for specific use cases
- Cloud and on-premise deployment options
- Automated testing and bug fixes
- Full documentation and support

Target Users: Non-technical entrepreneurs, SMEs, cafe owners, garage owners, educational institutes, and anyone needing custom applications.

User Question: ${chatInput}

Please provide a helpful, informative response about BuildIt's capabilities, pricing, or how it can help solve their business needs. Keep the tone professional yet friendly.`;

    setChatInput('');
    aiLayerRef.current?.sendToAI(contextualPrompt);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submission: ContactSubmission = {
      id: Date.now().toString(),
      ...contactForm,
      timestamp: new Date().toISOString()
    };
    
    const updatedSubmissions = [...contactSubmissions, submission];
    setContactSubmissions(updatedSubmissions);
    localStorage.setItem('buildit_submissions', JSON.stringify(updatedSubmissions));
    
    setContactForm({ name: '', email: '', company: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const saveContent = () => {
    localStorage.setItem('buildit_content', JSON.stringify(websiteContent));
    localStorage.setItem('buildit_testimonials', JSON.stringify(testimonials));
    localStorage.setItem('buildit_usecases', JSON.stringify(useCases));
    localStorage.setItem('buildit_pricing', JSON.stringify(pricingTiers));
    alert('Content saved successfully!');
  };

  const exportData = () => {
    const data = {
      testimonials,
      useCases,
      pricingTiers,
      contactSubmissions,
      websiteContent,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildit-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('buildit_testimonials');
      localStorage.removeItem('buildit_usecases');
      localStorage.removeItem('buildit_pricing');
      localStorage.removeItem('buildit_submissions');
      localStorage.removeItem('buildit_content');
      window.location.reload();
    }
  };

  const renderNavigation = () => (
    <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container-wide">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2" id="welcome_fallback">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BuildIt</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              id="home-tab"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'home' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
            </button>
            <button
              id="features-tab"
              onClick={() => setActiveTab('features')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'features' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Features
            </button>
            <button
              id="usecases-tab"
              onClick={() => setActiveTab('usecases')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'usecases' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Use Cases
            </button>
            <button
              id="pricing-tab"
              onClick={() => setActiveTab('pricing')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'pricing' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Pricing
            </button>
            <button
              id="contact-tab"
              onClick={() => setActiveTab('contact')}
              className={`px-3 py-2 rounded-md transition-colors ${
                activeTab === 'contact' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Contact
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {['home', 'features', 'usecases', 'pricing', 'contact'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                  activeTab === tab ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );

  const renderHeroSection = () => (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container-wide relative py-20 lg:py-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {websiteContent.hero.title}
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-8 leading-relaxed">
            {websiteContent.hero.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              id="hero-cta"
              className="btn-responsive bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              {websiteContent.hero.ctaText} <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button className="btn-responsive border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  const renderFeaturesSection = () => (
    <section className="py-20 bg-white">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need, Out of the Box
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BuildIt comes packed with enterprise-grade features that would typically take months to implement
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {websiteContent.features.map((feature, index) => (
            <div
              key={feature.id}
              className="card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                {feature.icon === 'Code' && <Code className="w-6 h-6 text-white" />}
                {feature.icon === 'Zap' && <Zap className="w-6 h-6 text-white" />}
                {feature.icon === 'Shield' && <Shield className="w-6 h-6 text-white" />}
                {feature.icon === 'CreditCard' && <CreditCard className="w-6 h-6 text-white" />}
                {feature.icon === 'Bot' && <Bot className="w-6 h-6 text-white" />}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderUseCasesSection = () => (
    <section className="py-20 bg-gray-50">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Perfect for Every Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From small cafes to educational institutes, BuildIt adapts to your specific industry needs
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={useCase.id}
              className="card bg-white hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="text-blue-600 mb-4">
                {useCase.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{useCase.title}</h3>
              <p className="text-gray-600 mb-4">{useCase.description}</p>
              <ul className="space-y-2">
                {useCase.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderTestimonialsSection = () => (
    <section className="py-20 bg-white">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600">
            See what our customers are saying about BuildIt
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="card hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center mb-4">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-600 italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderPricingSection = () => (
    <section className="py-20 bg-gray-50">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingTiers.map((tier, index) => (
            <div
              key={tier.id}
              className={`card relative overflow-hidden ${
                tier.popular ? 'border-2 border-blue-500 transform scale-105' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {tier.price}<span className="text-lg text-gray-600">{tier.period}</span>
                </div>
                <p className="text-gray-600">{tier.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-600">
                    <Check className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full btn ${
                  tier.popular 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const renderContactSection = () => (
    <section className="py-20 bg-white">
      <div className="container-wide">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-600">
            Ready to transform your business? Let's talk!
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="company">Company Name</label>
              <input
                id="company"
                type="text"
                className="input"
                value={contactForm.company}
                onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="message">Message</label>
              <textarea
                id="message"
                rows={5}
                className="input"
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full btn bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );

  const renderChatbot = () => (
    <>
      {/* Chatbot Toggle Button */}
      <button
        id="chatbot-toggle"
        onClick={() => setChatbotOpen(!chatbotOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
      >
        {chatbotOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chatbot Window */}
      {chatbotOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border z-50 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold">BuildIt Assistant</h3>
            <p className="text-sm opacity-90">How can I help you today?</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.length === 0 && (
              <div className="text-gray-500 text-sm">
                👋 Hi! I'm here to help you learn about BuildIt. Ask me anything about our features, pricing, or how we can help your business!
              </div>
            )}
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isAILoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                placeholder="Type your message..."
                className="flex-1 input text-sm"
              />
              <button
                onClick={handleChatSubmit}
                disabled={!chatInput.trim() || isAILoading}
                className="btn btn-primary btn-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderAdminPanel = () => {
    if (!currentUser) return null;

    return (
      <div className="py-20 bg-gray-50 min-h-screen">
        <div className="container-wide">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {currentUser.first_name}</span>
              <button onClick={logout} className="btn bg-red-600 text-white hover:bg-red-700">
                Logout
              </button>
            </div>
          </div>

          {/* Admin Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {['content', 'testimonials', 'submissions', 'settings'].map((tab) => (
                  <button
                    key={tab}
                    id={`admin-${tab}-tab`}
                    onClick={() => setAdminActiveTab(tab)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      adminActiveTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Admin Content */}
          {adminActiveTab === 'content' && (
            <div className="space-y-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Hero Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="input"
                      value={websiteContent.hero.title}
                      onChange={(e) => setWebsiteContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, title: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">Subtitle</label>
                    <textarea
                      className="input"
                      rows={3}
                      value={websiteContent.hero.subtitle}
                      onChange={(e) => setWebsiteContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, subtitle: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <label className="form-label">CTA Text</label>
                    <input
                      type="text"
                      className="input"
                      value={websiteContent.hero.ctaText}
                      onChange={(e) => setWebsiteContent(prev => ({
                        ...prev,
                        hero: { ...prev.hero, ctaText: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>
              <button onClick={saveContent} className="btn btn-primary">
                Save Content
              </button>
            </div>
          )}

          {adminActiveTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Manage Testimonials</h3>
                <button
                  onClick={() => {
                    const newTestimonial: Testimonial = {
                      id: Date.now().toString(),
                      name: 'New Customer',
                      role: 'Business Owner',
                      company: 'Company Name',
                      content: 'Great experience with BuildIt!',
                      rating: 5,
                      avatar: '👤'
                    };
                    const updated = [...testimonials, newTestimonial];
                    setTestimonials(updated);
                    localStorage.setItem('buildit_testimonials', JSON.stringify(updated));
                  }}
                  className="btn btn-primary"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Testimonial
                </button>
              </div>
              
              <div className="grid gap-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="card">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="input"
                          value={testimonial.name}
                          onChange={(e) => {
                            const updated = testimonials.map(t => 
                              t.id === testimonial.id ? { ...t, name: e.target.value } : t
                            );
                            setTestimonials(updated);
                            localStorage.setItem('buildit_testimonials', JSON.stringify(updated));
                          }}
                        />
                      </div>
                      <div>
                        <label className="form-label">Company</label>
                        <input
                          type="text"
                          className="input"
                          value={testimonial.company}
                          onChange={(e) => {
                            const updated = testimonials.map(t => 
                              t.id === testimonial.id ? { ...t, company: e.target.value } : t
                            );
                            setTestimonials(updated);
                            localStorage.setItem('buildit_testimonials', JSON.stringify(updated));
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="form-label">Content</label>
                      <textarea
                        className="input"
                        rows={3}
                        value={testimonial.content}
                        onChange={(e) => {
                          const updated = testimonials.map(t => 
                            t.id === testimonial.id ? { ...t, content: e.target.value } : t
                          );
                          setTestimonials(updated);
                          localStorage.setItem('buildit_testimonials', JSON.stringify(updated));
                        }}
                      />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => {
                          const updated = testimonials.filter(t => t.id !== testimonial.id);
                          setTestimonials(updated);
                          localStorage.setItem('buildit_testimonials', JSON.stringify(updated));
                        }}
                        className="btn bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminActiveTab === 'submissions' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Contact Submissions</h3>
              {contactSubmissions.length === 0 ? (
                <p className="text-gray-500">No submissions yet.</p>
              ) : (
                <div className="grid gap-4">
                  {contactSubmissions.map((submission) => (
                    <div key={submission.id} className="card">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{submission.name}</h4>
                          <p className="text-sm text-gray-600">{submission.email}</p>
                          {submission.company && (
                            <p className="text-sm text-gray-600">{submission.company}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{submission.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {adminActiveTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Website Settings</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <button
                  onClick={saveContent}
                  className="btn btn-primary flex items-center justify-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Save All Content
                </button>
                
                <button
                  onClick={exportData}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </button>
                
                <button
                  onClick={clearAllData}
                  className="btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center"
                >
                  <Trash2 className="w-5 h-5 mr-2" />
                  Clear All Data
                </button>
              </div>

              <div className="card">
                <h4 className="text-lg font-semibold mb-4">Statistics</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="stat-card">
                    <div className="stat-title">Total Testimonials</div>
                    <div className="stat-value">{testimonials.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Contact Submissions</div>
                    <div className="stat-value">{contactSubmissions.length}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-title">Use Cases</div>
                    <div className="stat-value">{useCases.length}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFooter = () => (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-wide">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">BuildIt</span>
            </div>
            <p className="text-gray-400">
              Transform your ideas into production-ready applications in minutes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              <li>
                <AdminLogin linkText="Admin Login" />
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved</p>
        </div>
      </div>
    </footer>
  );

  if (currentUser) {
    return renderAdminPanel();
  }

  return (
    <div className="min-h-screen bg-white" id="generation_issue_fallback">
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={setAIResult}
        onError={setAIError}
        onLoading={setIsAILoading}
      />
      
      {renderNavigation()}
      
      {activeTab === 'home' && (
        <>
          {renderHeroSection()}
          {renderFeaturesSection()}
          {renderTestimonialsSection()}
        </>
      )}
      
      {activeTab === 'features' && renderFeaturesSection()}
      {activeTab === 'usecases' && renderUseCasesSection()}
      {activeTab === 'pricing' && renderPricingSection()}
      {activeTab === 'contact' && renderContactSection()}
      
      {renderChatbot()}
      {renderFooter()}
    </div>
  );
};

export default App;