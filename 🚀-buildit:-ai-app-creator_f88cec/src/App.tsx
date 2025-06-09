import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Star, 
  Zap, 
  Shield, 
  Globe, 
  Code, 
  CreditCard, 
  Users, 
  Clock, 
  Smartphone, 
  Database, 
  Settings, 
  ChevronDown, 
  ChevronUp,
  Menu,
  X,
  MessageCircle,
  Mail,
  Phone,
  Github,
  Twitter,
  Linkedin,
  Plus,
  Minus,
  Edit,
  Trash2,
  Download,
  Upload,
  Coffee,
  GraduationCap,
  Car,
  Building,
  Rocket,
  Target,
  TrendingUp,
  Brain,
  Search
} from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface UseCase {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
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

interface PricingTier {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted: boolean;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

type ActiveTab = 'home' | 'features' | 'use-cases' | 'pricing' | 'resources' | 'contact' | 'admin';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Navigation state
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // AI Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, type: 'user' | 'ai', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  
  // FAQ state
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  
  // Admin content management state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTestimonials = localStorage.getItem('buildit_testimonials');
    const savedBlogPosts = localStorage.getItem('buildit_blog_posts');
    
    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials));
    } else {
      setTestimonials(defaultTestimonials);
    }
    
    if (savedBlogPosts) {
      setBlogPosts(JSON.parse(savedBlogPosts));
    } else {
      setBlogPosts(defaultBlogPosts);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('buildit_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('buildit_blog_posts', JSON.stringify(blogPosts));
  }, [blogPosts]);

  // Default data
  const defaultTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Cafe Owner',
      company: 'Brew & Bytes Coffee',
      content: 'BuildIt transformed my coffee shop idea into a fully functional ordering system in just 8 minutes. No coding knowledge required!',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Auto Shop Owner',
      company: 'Rodriguez Auto Repair',
      content: 'I needed a booking system for my garage. BuildIt delivered a complete solution with payments, scheduling, and customer management.',
      rating: 5,
      avatar: '👨‍🔧'
    },
    {
      id: '3',
      name: 'Dr. Emily Watson',
      role: 'Principal',
      company: 'Greenfield Academy',
      content: 'Our school needed a student management system. BuildIt created exactly what we needed with AI-powered features in minutes.',
      rating: 5,
      avatar: '👩‍🏫'
    }
  ];

  const defaultBlogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'How AI is Revolutionizing App Development',
      excerpt: 'Discover how BuildIt uses AI to transform ideas into production-ready applications without coding.',
      author: 'BuildIt Team',
      date: '2025-06-08',
      readTime: '5 min read',
      category: 'AI Technology'
    },
    {
      id: '2',
      title: 'From Idea to Production in Under 10 Minutes',
      excerpt: 'A step-by-step guide on how BuildIt accelerates the development process for non-technical entrepreneurs.',
      author: 'Sarah Johnson',
      date: '2025-06-07',
      readTime: '7 min read',
      category: 'Getting Started'
    },
    {
      id: '3',
      title: 'Success Stories: Small Businesses Going Digital',
      excerpt: 'Real stories from cafe owners, garage operators, and educators who transformed their businesses with BuildIt.',
      author: 'Mike Chen',
      date: '2025-06-06',
      readTime: '6 min read',
      category: 'Case Studies'
    }
  ];

  const features: Feature[] = [
    {
      id: 'ai-powered',
      icon: <Brain className="h-8 w-8" />,
      title: 'AI-Powered Development',
      description: 'Advanced AI understands your requirements and builds production-ready applications automatically.'
    },
    {
      id: 'instant-deployment',
      icon: <Rocket className="h-8 w-8" />,
      title: 'Instant Deployment',
      description: 'Deploy to cloud or on-premises infrastructure in minutes with automated CI/CD pipelines.'
    },
    {
      id: 'payment-integration',
      icon: <CreditCard className="h-8 w-8" />,
      title: 'Payment Integration',
      description: 'Built-in Razorpay and Stripe integration for seamless payment processing out of the box.'
    },
    {
      id: 'auth-security',
      icon: <Shield className="h-8 w-8" />,
      title: 'Authentication & Security',
      description: 'Enterprise-grade authentication, authorization, and security features included by default.'
    },
    {
      id: 'responsive-design',
      icon: <Smartphone className="h-8 w-8" />,
      title: 'Responsive Design',
      description: 'Mobile-first, responsive applications that work perfectly on all devices and screen sizes.'
    },
    {
      id: 'database-management',
      icon: <Database className="h-8 w-8" />,
      title: 'Database Management',
      description: 'Automated database setup, migrations, and management with optimized performance.'
    }
  ];

  const useCases: UseCase[] = [
    {
      id: 'cafes-restaurants',
      icon: <Coffee className="h-12 w-12" />,
      title: 'Cafes & Restaurants',
      description: 'Complete digital solution for food service businesses',
      features: ['Online ordering system', 'Table reservation management', 'Menu management', 'Payment processing', 'Customer loyalty programs']
    },
    {
      id: 'auto-garages',
      icon: <Car className="h-12 w-12" />,
      title: 'Auto Garages & Repair Shops',
      description: 'Streamline automotive service operations',
      features: ['Appointment booking', 'Service tracking', 'Inventory management', 'Customer communication', 'Billing & invoicing']
    },
    {
      id: 'educational-institutes',
      icon: <GraduationCap className="h-12 w-12" />,
      title: 'Educational Institutes',
      description: 'Comprehensive school and training management',
      features: ['Student management', 'Course scheduling', 'Grade tracking', 'Parent communication', 'Fee management']
    },
    {
      id: 'small-business',
      icon: <Building className="h-12 w-12" />,
      title: 'Small Businesses',
      description: 'Digital transformation for any business type',
      features: ['Customer management', 'Appointment booking', 'Inventory tracking', 'Sales analytics', 'Marketing automation']
    }
  ];

  const pricingTiers: PricingTier[] = [
    {
      id: 'starter',
      name: 'Starter',
      price: '$49/month',
      description: 'Perfect for small businesses and startups',
      features: ['Up to 3 applications', 'Basic AI features', 'Standard support', 'Cloud deployment', '10GB storage'],
      highlighted: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$149/month',
      description: 'Ideal for growing businesses',
      features: ['Up to 10 applications', 'Advanced AI features', 'Priority support', 'Cloud + On-premise', '100GB storage', 'Custom integrations'],
      highlighted: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['Unlimited applications', 'Full AI capabilities', '24/7 dedicated support', 'Multi-cloud deployment', 'Unlimited storage', 'White-label options'],
      highlighted: false
    }
  ];

  const faqs: FAQ[] = [
    {
      id: 'what-is-buildit',
      question: 'What is BuildIt and how does it work?',
      answer: 'BuildIt is an AI-powered platform that transforms your ideas into production-ready applications in under 10 minutes. Simply describe what you want to build, and our AI handles the coding, testing, deployment, and infrastructure setup automatically.'
    },
    {
      id: 'technical-knowledge',
      question: 'Do I need technical knowledge to use BuildIt?',
      answer: 'No technical knowledge required! BuildIt is designed for non-technical entrepreneurs, small business owners, and individuals. You just describe your requirements in plain language, and our AI does the rest.'
    },
    {
      id: 'customization',
      question: 'Can I customize the applications after they are built?',
      answer: 'Yes! While BuildIt creates fully functional applications, you can request modifications and customizations. Our AI can adapt and enhance your applications based on your evolving needs.'
    },
    {
      id: 'deployment-options',
      question: 'What deployment options are available?',
      answer: 'BuildIt supports both cloud and on-premises deployment. We handle all the infrastructure setup, scaling, monitoring, and maintenance for you.'
    },
    {
      id: 'payment-integration',
      question: 'How does payment integration work?',
      answer: 'BuildIt comes with pre-integrated Razorpay and Stripe payment gateways. You just need to connect your merchant accounts, and payment processing is automatically handled in your applications.'
    }
  ];

  // AI Chatbot functions
  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: chatInput
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    
    // Prepare AI context
    const aiContext = `You are a helpful assistant for BuildIt, an AI platform that creates production-ready applications in under 10 minutes for non-technical users. 

Key features of BuildIt:
- Text-to-production app development
- AI-powered code generation, testing, and deployment
- Built-in authentication, authorization, and payment integration (Razorpay, Stripe)
- Support for cafes, restaurants, auto garages, educational institutes, and small businesses
- Cloud and on-premises deployment options
- No coding knowledge required

Answer user questions about BuildIt's capabilities, pricing, use cases, and how it can help their specific business needs. Be helpful, professional, and encouraging.

User question: ${chatInput}`;
    
    setChatInput('');
    
    // Call AI
    aiLayerRef.current?.sendToAI(aiContext);
  };

  const handleAIResponse = (response: string) => {
    const aiMessage = {
      id: Date.now().toString(),
      type: 'ai' as const,
      content: response
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };

  // Admin functions
  const handleSaveTestimonial = (testimonial: Omit<Testimonial, 'id'>) => {
    if (editingTestimonial) {
      setTestimonials(prev => prev.map(t => 
        t.id === editingTestimonial.id 
          ? { ...testimonial, id: editingTestimonial.id }
          : t
      ));
      setEditingTestimonial(null);
    } else {
      const newTestimonial = {
        ...testimonial,
        id: Date.now().toString()
      };
      setTestimonials(prev => [...prev, newTestimonial]);
    }
    setShowTestimonialForm(false);
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveBlogPost = (post: Omit<BlogPost, 'id'>) => {
    if (editingBlogPost) {
      setBlogPosts(prev => prev.map(p => 
        p.id === editingBlogPost.id 
          ? { ...post, id: editingBlogPost.id }
          : p
      ));
      setEditingBlogPost(null);
    } else {
      const newPost = {
        ...post,
        id: Date.now().toString()
      };
      setBlogPosts(prev => [...prev, newPost]);
    }
    setShowBlogForm(false);
  };

  const handleDeleteBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(p => p.id !== id));
  };

  const downloadData = () => {
    const data = {
      testimonials,
      blogPosts,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buildit-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    const confirmed = window.confirm('Are you sure you want to clear all data? This action cannot be undone.');
    if (confirmed) {
      setTestimonials([]);
      setBlogPosts([]);
      localStorage.removeItem('buildit_testimonials');
      localStorage.removeItem('buildit_blog_posts');
    }
  };

  // Render functions
  const renderNavigation = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700">
      <div className="container-wide">
        <div className="flex-between py-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e7f7f7] via-[#95c7c3] to-[#548b99] flex-center">
              <Code className="h-6 w-6 text-[#1F2E3D]" />
            </div>
            <span className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">BuildIt</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
              id="home-tab"
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'home' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Home
            </button>
            <button
              id="features-tab"
              onClick={() => setActiveTab('features')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'features' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Features
            </button>
            <button
              id="use-cases-tab"
              onClick={() => setActiveTab('use-cases')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'use-cases' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Use Cases
            </button>
            <button
              id="pricing-tab"
              onClick={() => setActiveTab('pricing')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'pricing' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Pricing
            </button>
            <button
              id="resources-tab"
              onClick={() => setActiveTab('resources')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'resources' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Resources
            </button>
            <button
              id="contact-tab"
              onClick={() => setActiveTab('contact')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'contact' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Contact
            </button>
            {currentUser && (
              <button
                id="admin-tab"
                onClick={() => setActiveTab('admin')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'admin' 
                    ? 'text-[#548B99]' 
                    : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
                }`}
              >
                Admin
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {currentUser ? (
              <div className="hidden md:flex items-center gap-3">
                <span className="text-sm text-[#424B54] dark:text-[#F7FAFC]">
                  Welcome, {currentUser.first_name}
                </span>
                <button
                  onClick={logout}
                  className="btn-sm bg-gray-100 dark:bg-slate-700 text-[#424B54] dark:text-[#F7FAFC] hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <AdminLogin linkText="Admin Login" />
            )}
            
            <button
              className="md:hidden text-[#424B54] dark:text-[#F7FAFC]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col gap-4">
              <button
                onClick={() => { setActiveTab('home'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${
                  activeTab === 'home' ? 'text-[#548B99]' : 'text-[#424B54] dark:text-[#F7FAFC]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => { setActiveTab('features'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${
                  activeTab === 'features' ? 'text-[#548B99]' : 'text-[#424B54] dark:text-[#F7FAFC]'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => { setActiveTab('use-cases'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${
                  activeTab === 'use-cases' ? 'text-[#548B99]' : 'text-[#424B54] dark:text-[#F7FAFC]'
                }`}
              >
                Use Cases
              </button>
              <button
                onClick={() => { setActiveTab('pricing'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${
                  activeTab === 'pricing' ? 'text-[#548B99]' : 'text-[#424B54] dark:text-[#F7FAFC]'
                }`}
              >
                Pricing
              </button>
              <button
                onClick={() => { setActiveTab('resources'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${
                  activeTab === 'resources' ? 'text-[#548B99]' : 'text-[#424B54] dark:text-[#F7FAFC]'
                }`}
              >
                Resources
              </button>
              <button
                onClick={() => { setActiveTab('contact'); setIsMobileMenuOpen(false); }}
                className={`text-left text-sm font-medium ${
                  activeTab === 'contact' ? 'text-[#548B99]' : 'text-[#424B54] dark:text-[#F7FAFC]'
                }`}
              >
                Contact
              </button>
              {currentUser && (
                <>
                  <button
                    onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                    className={`text-left text-sm font-medium ${
                      activeTab === 'admin' ? 'text-[#548B99]' : 'text-[#424B54] dark:text-[#F7FAFC]'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    onClick={logout}
                    className="text-left text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderHome = () => (
    <div className="pt-20">
      {/* Hero Section */}
      <section id="welcome_fallback" className="py-20 bg-gradient-to-br from-[#F7FAFC] via-[#C3E0DD] to-[#91C8C3] dark:from-[#2D3748] dark:via-[#1a365d] dark:to-[#2c5282]">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] leading-tight">
                  From Idea to
                  <span className="text-[#548B99]"> Production </span>
                  in Under 10 Minutes
                </h1>
                <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] leading-relaxed">
                  BuildIt transforms your business ideas into fully functional, production-ready applications. 
                  No coding knowledge required - just describe what you need, and our AI does the rest.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="btn btn-lg bg-[#548B99] text-white hover:bg-[#3d6b75] transition-all duration-300 transform hover:scale-105">
                  Start Building Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="btn btn-lg bg-white/20 backdrop-blur-sm text-[#1F2E3D] dark:text-[#e7f7f7] border border-white/30 hover:bg-white/30 transition-all duration-300">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#548B99]">10 min</div>
                  <div className="text-sm text-[#424B54] dark:text-[#F7FAFC]">Average build time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#548B99]">1000+</div>
                  <div className="text-sm text-[#424B54] dark:text-[#F7FAFC]">Apps created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#548B99]">99.9%</div>
                  <div className="text-sm text-[#424B54] dark:text-[#F7FAFC]">Uptime</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="bg-[#F7FAFC] dark:bg-slate-700 rounded-lg p-4">
                    <div className="text-sm text-[#424B54] dark:text-[#F7FAFC] font-mono">
                      $ buildit create "coffee shop ordering system"
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Generated React frontend
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Created Node.js backend
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Integrated payment system
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Deployed to production
                    </div>
                  </div>
                  <div className="text-center pt-4">
                    <div className="text-lg font-semibold text-[#548B99]">🎉 App ready in 8 minutes!</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">
              Everything You Need, Built-In
            </h2>
            <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
              BuildIt includes all the essential features and integrations your business needs to go digital immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.slice(0, 6).map((feature) => (
              <div
                key={feature.id}
                className="group bg-[#F7FAFC] dark:bg-slate-800 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-[#548B99] mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#424B54] dark:text-[#F7FAFC]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-[#C3E0DD] to-[#91C8C3] dark:from-[#1e293b] dark:to-[#334155]">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">
              Trusted by Entrepreneurs Worldwide
            </h2>
            <p className="text-xl text-[#424B54] dark:text-[#F7FAFC]">
              See how BuildIt has transformed businesses across industries
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.slice(0, 3).map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-[#424B54] dark:text-[#F7FAFC] mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#548B99]">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#548B99] text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Idea into Reality?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of entrepreneurs who've built their digital future with BuildIt
          </p>
          <button className="btn btn-lg bg-white text-[#548B99] hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );

  const renderFeatures = () => (
    <div className="pt-20">
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
              Powerful Features for Modern Applications
            </h1>
            <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
              BuildIt combines cutting-edge AI technology with enterprise-grade features to deliver 
              production-ready applications that scale with your business.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`group flex gap-6 p-8 rounded-2xl transition-all duration-300 ${
                  index % 2 === 0 
                    ? 'bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700' 
                    : 'bg-gradient-to-br from-[#C3E0DD] to-[#91C8C3] dark:from-slate-700 dark:to-slate-600'
                } hover:shadow-xl transform hover:scale-105`}
              >
                <div className="text-[#548B99] group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#424B54] dark:text-[#F7FAFC] text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Specifications */}
          <div className="bg-gradient-to-r from-[#548B99] to-[#3d6b75] rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-8 text-center">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <h4 className="text-lg font-semibold mb-2">Build Speed</h4>
                <p className="opacity-90">Average 8-10 minutes from idea to deployment</p>
              </div>
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <h4 className="text-lg font-semibold mb-2">Security</h4>
                <p className="opacity-90">Enterprise-grade security with SOC 2 compliance</p>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <h4 className="text-lg font-semibold mb-2">Global Deployment</h4>
                <p className="opacity-90">Multi-region deployment with CDN optimization</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-80" />
                <h4 className="text-lg font-semibold mb-2">Scalability</h4>
                <p className="opacity-90">Auto-scaling infrastructure handles any load</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderUseCases = () => (
    <div className="pt-20">
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
              Perfect for Any Business
            </h1>
            <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
              BuildIt adapts to your industry and business needs, creating tailored solutions 
              that drive growth and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.id}
                className="group bg-gradient-to-br from-[#F7FAFC] via-[#C3E0DD] to-[#91C8C3] dark:from-slate-800 dark:via-slate-700 dark:to-slate-600 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-[#548B99] group-hover:scale-110 transition-transform duration-300">
                    {useCase.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                    {useCase.title}
                  </h3>
                </div>
                
                <p className="text-[#424B54] dark:text-[#F7FAFC] text-lg mb-6 leading-relaxed">
                  {useCase.description}
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">
                    Key Features Include:
                  </h4>
                  {useCase.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-[#424B54] dark:text-[#F7FAFC]">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <button className="btn bg-[#548B99] text-white hover:bg-[#3d6b75] transition-all duration-300">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Success Metrics */}
          <div className="mt-20 text-center">
            <h3 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-12">
              Real Results for Real Businesses
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6">
                <div className="text-4xl font-bold text-[#548B99] mb-2">95%</div>
                <div className="text-[#424B54] dark:text-[#F7FAFC]">Faster Time to Market</div>
              </div>
              <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6">
                <div className="text-4xl font-bold text-[#548B99] mb-2">80%</div>
                <div className="text-[#424B54] dark:text-[#F7FAFC]">Cost Reduction</div>
              </div>
              <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6">
                <div className="text-4xl font-bold text-[#548B99] mb-2">99%</div>
                <div className="text-[#424B54] dark:text-[#F7FAFC]">Customer Satisfaction</div>
              </div>
              <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6">
                <div className="text-4xl font-bold text-[#548B99] mb-2">24/7</div>
                <div className="text-[#424B54] dark:text-[#F7FAFC]">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderPricing = () => (
    <div className="pt-20">
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
              Choose the perfect plan for your business size and needs. All plans include our core AI-powered 
              development platform with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {pricingTiers.map((tier) => (
              <div
                key={tier.id}
                className={`relative rounded-3xl p-8 transition-all duration-300 transform hover:scale-105 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-[#548B99] to-[#3d6b75] text-white shadow-2xl scale-105'
                    : 'bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-[#C1436D] to-[#A350A3] text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${
                    tier.highlighted ? 'text-white' : 'text-[#1F2E3D] dark:text-[#e7f7f7]'
                  }`}>
                    {tier.name}
                  </h3>
                  <div className={`text-4xl font-bold mb-2 ${
                    tier.highlighted ? 'text-white' : 'text-[#548B99]'
                  }`}>
                    {tier.price}
                  </div>
                  <p className={`${
                    tier.highlighted ? 'text-white/80' : 'text-[#424B54] dark:text-[#F7FAFC]'
                  }`}>
                    {tier.description}
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {tier.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className={`h-5 w-5 flex-shrink-0 ${
                        tier.highlighted ? 'text-white' : 'text-green-500'
                      }`} />
                      <span className={`${
                        tier.highlighted ? 'text-white' : 'text-[#424B54] dark:text-[#F7FAFC]'
                      }`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                <button className={`w-full btn transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-white text-[#548B99] hover:bg-gray-100'
                    : 'bg-[#548B99] text-white hover:bg-[#3d6b75]'
                }`}>
                  {tier.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] text-center mb-12">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-gradient-to-r from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h4 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">
                      {faq.question}
                    </h4>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-[#548B99]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#548B99]" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                      <p className="text-[#424B54] dark:text-[#F7FAFC]">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderResources = () => (
    <div className="pt-20">
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
              Resources & Learning
            </h1>
            <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
              Everything you need to succeed with BuildIt. From getting started guides to advanced 
              tutorials and best practices.
            </p>
          </div>

          {/* Blog Posts */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-8">Latest Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="group bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-[#548B99] text-white text-xs rounded-full">
                        {post.category}
                      </span>
                      <span className="text-sm text-[#424B54] dark:text-[#F7FAFC]">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3 group-hover:text-[#548B99] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-[#424B54] dark:text-[#F7FAFC] mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[#424B54] dark:text-[#F7FAFC]">
                        By {post.author} • {new Date(post.date).toLocaleDateString()}
                      </div>
                      <ArrowRight className="h-4 w-4 text-[#548B99] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Resource Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#548B99] mb-4">
                <Code className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">
                Documentation
              </h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm mb-4">
                Comprehensive guides and API documentation
              </p>
              <button className="text-[#548B99] hover:underline">
                View Docs →
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#548B99] mb-4">
                <Play className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">
                Video Tutorials
              </h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm mb-4">
                Step-by-step video guides and walkthroughs
              </p>
              <button className="text-[#548B99] hover:underline">
                Watch Now →
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#548B99] mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">
                Community
              </h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm mb-4">
                Connect with other BuildIt users and experts
              </p>
              <button className="text-[#548B99] hover:underline">
                Join Forum →
              </button>
            </div>

            <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="text-[#548B99] mb-4">
                <Download className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">
                Templates
              </h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm mb-4">
                Ready-to-use templates for common use cases
              </p>
              <button className="text-[#548B99] hover:underline">
                Download →
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderContact = () => (
    <div className="pt-20">
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
              Get in Touch
            </h1>
            <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] max-w-3xl mx-auto">
              Have questions about BuildIt? Our team is here to help you succeed. 
              Reach out and let's discuss how we can transform your business ideas into reality.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                Send us a Message
              </h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">First Name</label>
                    <input type="text" className="input" placeholder="John" />
                  </div>
                  <div>
                    <label className="form-label">Last Name</label>
                    <input type="text" className="input" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input type="email" className="input" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="form-label">Company</label>
                  <input type="text" className="input" placeholder="Your Company" />
                </div>
                <div>
                  <label className="form-label">How can we help?</label>
                  <select className="input">
                    <option>General Inquiry</option>
                    <option>Sales Question</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Message</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder="Tell us about your project or question..."
                  ></textarea>
                </div>
                <button className="btn btn-lg bg-[#548B99] text-white hover:bg-[#3d6b75] w-full">
                  Send Message
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[#548B99] to-[#3d6b75] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <Mail className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Email</div>
                      <div className="opacity-90">support@buildit.ai</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <Phone className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Phone</div>
                      <div className="opacity-90">+1 (555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 rounded-lg p-3">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold">Support Hours</div>
                      <div className="opacity-90">24/7 Available</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">
                  Follow Us
                </h3>
                <div className="flex gap-4">
                  <button className="bg-[#548B99] text-white p-3 rounded-lg hover:bg-[#3d6b75] transition-colors">
                    <Twitter className="h-6 w-6" />
                  </button>
                  <button className="bg-[#548B99] text-white p-3 rounded-lg hover:bg-[#3d6b75] transition-colors">
                    <Linkedin className="h-6 w-6" />
                  </button>
                  <button className="bg-[#548B99] text-white p-3 rounded-lg hover:bg-[#3d6b75] transition-colors">
                    <Github className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#C1436D] to-[#A350A3] rounded-3xl p-8 text-white">
                <h3 className="text-xl font-bold mb-4">Schedule a Demo</h3>
                <p className="mb-6 opacity-90">
                  See BuildIt in action with a personalized demo tailored to your business needs.
                </p>
                <button className="btn bg-white text-[#C1436D] hover:bg-gray-100 transition-colors">
                  Book Demo Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderAdmin = () => {
    if (!currentUser) {
      return (
        <div className="pt-20 min-h-screen flex-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">
              Access Denied
            </h1>
            <p className="text-[#424B54] dark:text-[#F7FAFC]">
              Please log in to access the admin panel.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="pt-20">
        <section className="py-20 bg-white dark:bg-slate-900 min-h-screen">
          <div className="container-wide">
            <div className="flex-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">
                  Admin Panel
                </h1>
                <p className="text-[#424B54] dark:text-[#F7FAFC]">
                  Manage website content and settings
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={downloadData}
                  className="btn bg-green-600 text-white hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </button>
                <button
                  onClick={clearAllData}
                  className="btn bg-red-600 text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </button>
              </div>
            </div>

            {/* Testimonials Management */}
            <div className="mb-12">
              <div className="flex-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                  Testimonials
                </h2>
                <button
                  onClick={() => setShowTestimonialForm(true)}
                  className="btn bg-[#548B99] text-white hover:bg-[#3d6b75]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Testimonial
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6"
                  >
                    <div className="flex-between mb-4">
                      <div className="text-2xl">{testimonial.avatar}</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingTestimonial(testimonial);
                            setShowTestimonialForm(true);
                          }}
                          className="text-[#548B99] hover:text-[#3d6b75]"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTestimonial(testimonial.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-[#548B99] mb-2">
                      {testimonial.role}, {testimonial.company}
                    </div>
                    <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm">
                      {testimonial.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Blog Posts Management */}
            <div>
              <div className="flex-between mb-6">
                <h2 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                  Blog Posts
                </h2>
                <button
                  onClick={() => setShowBlogForm(true)}
                  className="btn bg-[#548B99] text-white hover:bg-[#3d6b75]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blog Post
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gradient-to-br from-[#F7FAFC] to-[#C3E0DD] dark:from-slate-800 dark:to-slate-700 rounded-2xl p-6"
                  >
                    <div className="flex-between mb-4">
                      <span className="px-3 py-1 bg-[#548B99] text-white text-xs rounded-full">
                        {post.category}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingBlogPost(post);
                            setShowBlogForm(true);
                          }}
                          className="text-[#548B99] hover:text-[#3d6b75]"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlogPost(post.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">
                      {post.title}
                    </h3>
                    <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm mb-2">
                      {post.excerpt}
                    </p>
                    <div className="text-xs text-[#548B99]">
                      By {post.author} • {new Date(post.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Form Modal */}
        {showTestimonialForm && (
          <div className="fixed inset-0 bg-black/50 flex-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleSaveTestimonial({
                    name: formData.get('name') as string,
                    role: formData.get('role') as string,
                    company: formData.get('company') as string,
                    content: formData.get('content') as string,
                    rating: 5,
                    avatar: formData.get('avatar') as string || '👤'
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="form-label">Name</label>
                  <input
                    name="name"
                    type="text"
                    className="input"
                    defaultValue={editingTestimonial?.name || ''}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <input
                    name="role"
                    type="text"
                    className="input"
                    defaultValue={editingTestimonial?.role || ''}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Company</label>
                  <input
                    name="company"
                    type="text"
                    className="input"
                    defaultValue={editingTestimonial?.company || ''}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Avatar (emoji)</label>
                  <input
                    name="avatar"
                    type="text"
                    className="input"
                    defaultValue={editingTestimonial?.avatar || '👤'}
                    placeholder="👤"
                  />
                </div>
                <div>
                  <label className="form-label">Content</label>
                  <textarea
                    name="content"
                    className="input"
                    rows={4}
                    defaultValue={editingTestimonial?.content || ''}
                    required
                  ></textarea>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestimonialForm(false);
                      setEditingTestimonial(null);
                    }}
                    className="btn bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-400 dark:hover:bg-slate-500 flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn bg-[#548B99] text-white hover:bg-[#3d6b75] flex-1"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Blog Post Form Modal */}
        {showBlogForm && (
          <div className="fixed inset-0 bg-black/50 flex-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                {editingBlogPost ? 'Edit Blog Post' : 'Add Blog Post'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleSaveBlogPost({
                    title: formData.get('title') as string,
                    excerpt: formData.get('excerpt') as string,
                    author: formData.get('author') as string,
                    category: formData.get('category') as string,
                    date: formData.get('date') as string,
                    readTime: formData.get('readTime') as string
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="form-label">Title</label>
                  <input
                    name="title"
                    type="text"
                    className="input"
                    defaultValue={editingBlogPost?.title || ''}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Excerpt</label>
                  <textarea
                    name="excerpt"
                    className="input"
                    rows={3}
                    defaultValue={editingBlogPost?.excerpt || ''}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className="form-label">Author</label>
                  <input
                    name="author"
                    type="text"
                    className="input"
                    defaultValue={editingBlogPost?.author || ''}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <input
                    name="category"
                    type="text"
                    className="input"
                    defaultValue={editingBlogPost?.category || ''}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input
                    name="date"
                    type="date"
                    className="input"
                    defaultValue={editingBlogPost?.date || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Read Time</label>
                  <input
                    name="readTime"
                    type="text"
                    className="input"
                    placeholder="5 min read"
                    defaultValue={editingBlogPost?.readTime || ''}
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBlogForm(false);
                      setEditingBlogPost(null);
                    }}
                    className="btn bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-400 dark:hover:bg-slate-500 flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn bg-[#548B99] text-white hover:bg-[#3d6b75] flex-1"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderChatbot = () => (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 bg-[#548B99] text-white p-4 rounded-full shadow-lg hover:bg-[#3d6b75] transition-all duration-300 transform hover:scale-110 z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-end p-6 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md h-96 flex flex-col shadow-2xl">
            {/* Chat Header */}
            <div className="flex-between p-4 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#548B99] rounded-full flex-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">
                    BuildIt Assistant
                  </div>
                  <div className="text-xs text-[#548B99]">AI-powered help</div>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-[#424B54] dark:text-[#F7FAFC] py-8">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-[#548B99]" />
                  <p className="mb-2">Hi! I'm here to help you with BuildIt.</p>
                  <p className="text-sm">Ask me anything about our platform, features, or pricing!</p>
                </div>
              ) : (
                chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.type === 'user'
                          ? 'bg-[#548B99] text-white'
                          : 'bg-[#F7FAFC] dark:bg-slate-700 text-[#424B54] dark:text-[#F7FAFC]'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isAILoading && (
                <div className="flex justify-start">
                  <div className="bg-[#F7FAFC] dark:bg-slate-700 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#548B99] rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-[#548B99] rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-[#548B99] rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                  placeholder="Ask me about BuildIt..."
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isAILoading}
                  className="btn bg-[#548B99] text-white hover:bg-[#3d6b75] px-3 py-2 disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-[#424B54] dark:text-[#F7FAFC] mt-2 opacity-70">
                AI can make mistakes. Please verify important information.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHome();
      case 'features':
        return renderFeatures();
      case 'use-cases':
        return renderUseCases();
      case 'pricing':
        return renderPricing();
      case 'resources':
        return renderResources();
      case 'contact':
        return renderContact();
      case 'admin':
        return renderAdmin();
      default:
        return renderHome();
    }
  };

  return (
    <div id="generation_issue_fallback" className="min-h-screen bg-[#F7FAFC] dark:bg-[#2D3748] text-[#424B54] dark:text-[#F7FAFC]">
      {renderNavigation()}
      
      <main>
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-[#1F2E3D] text-white py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e7f7f7] via-[#95c7c3] to-[#548b99] flex-center">
                  <Code className="h-5 w-5 text-[#1F2E3D]" />
                </div>
                <span className="text-lg font-bold">BuildIt</span>
              </div>
              <p className="text-gray-300 mb-4">
                Transforming ideas into production-ready applications with the power of AI.
              </p>
              <div className="flex gap-3">
                <button className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Twitter className="h-5 w-5" />
                </button>
                <button className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Linkedin className="h-5 w-5" />
                </button>
                <button className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <Github className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-gray-300">
                <button onClick={() => setActiveTab('features')} className="block hover:text-white transition-colors">Features</button>
                <button onClick={() => setActiveTab('pricing')} className="block hover:text-white transition-colors">Pricing</button>
                <button onClick={() => setActiveTab('use-cases')} className="block hover:text-white transition-colors">Use Cases</button>
                <div className="hover:text-white transition-colors cursor-pointer">Security</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-gray-300">
                <button onClick={() => setActiveTab('resources')} className="block hover:text-white transition-colors">Documentation</button>
                <div className="hover:text-white transition-colors cursor-pointer">API Reference</div>
                <div className="hover:text-white transition-colors cursor-pointer">Tutorials</div>
                <div className="hover:text-white transition-colors cursor-pointer">Community</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-300">
                <div className="hover:text-white transition-colors cursor-pointer">About Us</div>
                <button onClick={() => setActiveTab('contact')} className="block hover:text-white transition-colors">Contact</button>
                <div className="hover:text-white transition-colors cursor-pointer">Careers</div>
                <div className="hover:text-white transition-colors cursor-pointer">Privacy Policy</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-300">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </div>
            <AdminLogin linkText="Admin Login" />
          </div>
        </div>
      </footer>

      {renderChatbot()}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={handleAIResponse}
        onError={setAiError}
        onLoading={setIsAILoading}
      />
    </div>
  );
};

export default App;