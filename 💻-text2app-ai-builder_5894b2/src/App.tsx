import React, { useState, useRef, useEffect } from 'react';
import { 
  Code, 
  Zap, 
  Smartphone, 
  Rocket, 
  Star, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Menu, 
  X, 
  Mail, 
  Phone, 
  MapPin,
  MessageCircle,
  Globe,
  Shield,
  Clock,
  Download,
  Upload,
  Settings,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import AdminLogin from './components/AdminLogin';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';

interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  rating: number;
  avatar: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  company: string;
  message: string;
  timestamp: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [adminView, setAdminView] = useState('dashboard');
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any>(null);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  // Admin management states
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);

  const aiLayerRef = useRef<AILayerHandle>(null);

  useEffect(() => {
    // Load data from localStorage
    const savedTestimonials = localStorage.getItem('text2app_testimonials');
    const savedContacts = localStorage.getItem('text2app_contacts');
    const savedFeatures = localStorage.getItem('text2app_features');
    const savedPlans = localStorage.getItem('text2app_plans');
    const savedUser = localStorage.getItem('text2app_user');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials));
    } else {
      // Default testimonials
      const defaultTestimonials: Testimonial[] = [
        {
          id: '1',
          name: 'Sarah Johnson',
          company: 'TechStart Inc.',
          content: 'Text2App transformed our idea into a working prototype in hours, not weeks. The AI understanding of our requirements was incredible!',
          rating: 5,
          avatar: 'SJ'
        },
        {
          id: '2',
          name: 'Michael Chen',
          company: 'Digital Solutions',
          content: 'I described my restaurant app idea in plain English and got a fully functional app. The code quality is professional-grade.',
          rating: 5,
          avatar: 'MC'
        },
        {
          id: '3',
          name: 'Emily Rodriguez',
          company: 'Startup Hub',
          content: 'As a non-technical founder, Text2App was a game-changer. I can now validate ideas quickly without hiring a full dev team.',
          rating: 5,
          avatar: 'ER'
        }
      ];
      setTestimonials(defaultTestimonials);
      localStorage.setItem('text2app_testimonials', JSON.stringify(defaultTestimonials));
    }

    if (savedContacts) {
      setContactSubmissions(JSON.parse(savedContacts));
    }

    if (savedFeatures) {
      setFeatures(JSON.parse(savedFeatures));
    } else {
      // Default features
      const defaultFeatures: Feature[] = [
        {
          id: '1',
          title: 'AI-Powered Generation',
          description: 'Advanced AI understands your text descriptions and generates professional, production-ready applications.',
          icon: 'Zap'
        },
        {
          id: '2',
          title: 'Multi-Platform Support',
          description: 'Generate web apps, mobile apps, and desktop applications from a single text description.',
          icon: 'Smartphone'
        },
        {
          id: '3',
          title: 'Professional Code Quality',
          description: 'Clean, maintainable, and scalable code that follows industry best practices and standards.',
          icon: 'Code'
        },
        {
          id: '4',
          title: 'Rapid Prototyping',
          description: 'Go from idea to working prototype in minutes, enabling fast iteration and validation.',
          icon: 'Rocket'
        },
        {
          id: '5',
          title: 'Custom UI/UX',
          description: 'Beautiful, responsive interfaces designed to match your brand and user requirements.',
          icon: 'Globe'
        },
        {
          id: '6',
          title: 'Enterprise Security',
          description: 'Built-in security features and compliance standards for enterprise-grade applications.',
          icon: 'Shield'
        }
      ];
      setFeatures(defaultFeatures);
      localStorage.setItem('text2app_features', JSON.stringify(defaultFeatures));
    }

    if (savedPlans) {
      setPricingPlans(JSON.parse(savedPlans));
    } else {
      // Default pricing plans
      const defaultPlans: PricingPlan[] = [
        {
          id: '1',
          name: 'Starter',
          price: '$49/month',
          features: ['5 Apps per month', 'Basic templates', 'Email support', 'Web apps only', '30-day trial']
        },
        {
          id: '2',
          name: 'Professional',
          price: '$149/month',
          features: ['25 Apps per month', 'Premium templates', 'Priority support', 'Web & Mobile apps', 'Custom branding', 'API access'],
          popular: true
        },
        {
          id: '3',
          name: 'Enterprise',
          price: 'Custom',
          features: ['Unlimited apps', 'Custom templates', '24/7 dedicated support', 'All platforms', 'White-label solution', 'On-premise deployment', 'SLA guarantee']
        }
      ];
      setPricingPlans(defaultPlans);
      localStorage.setItem('text2app_plans', JSON.stringify(defaultPlans));
    }
  }, []);

  useEffect(() => {
    // Save user to localStorage when it changes
    if (currentUser) {
      localStorage.setItem('text2app_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('text2app_user');
    }
  }, [currentUser]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      return;
    }

    const submission: ContactSubmission = {
      id: Date.now().toString(),
      ...contactForm,
      timestamp: new Date().toISOString()
    };

    const updatedSubmissions = [...contactSubmissions, submission];
    setContactSubmissions(updatedSubmissions);
    localStorage.setItem('text2app_contacts', JSON.stringify(updatedSubmissions));

    setContactForm({ name: '', email: '', company: '', message: '' });
    alert('Thank you for your message! We\'ll get back to you soon.');
  };

  const handleChatSubmit = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');

    // Enhanced prompt with context about the startup
    const contextualPrompt = `You are a helpful AI assistant for Text2App, a cutting-edge startup that transforms text descriptions into fully functional applications using advanced AI technology. 

Our services include:
- AI-powered app generation from natural language descriptions
- Multi-platform support (web, mobile, desktop)
- Professional code quality with industry best practices
- Rapid prototyping and iteration
- Custom UI/UX design
- Enterprise security and compliance

User question: ${userMessage}

Please provide a helpful, informative response about our services, pricing, capabilities, or general inquiries. Be friendly, professional, and focus on how Text2App can help solve their needs.`;

    aiLayerRef.current?.sendToAI(contextualPrompt);
  };

  const handleAIResult = (result: string) => {
    setChatMessages(prev => [...prev, { role: 'ai', content: result }]);
    setAiResult(result);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const addTestimonial = (testimonial: Omit<Testimonial, 'id'>) => {
    const newTestimonial: Testimonial = {
      ...testimonial,
      id: Date.now().toString()
    };
    const updated = [...testimonials, newTestimonial];
    setTestimonials(updated);
    localStorage.setItem('text2app_testimonials', JSON.stringify(updated));
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    const updated = testimonials.map(t => t.id === id ? { ...t, ...updates } : t);
    setTestimonials(updated);
    localStorage.setItem('text2app_testimonials', JSON.stringify(updated));
    setEditingTestimonial(null);
  };

  const deleteTestimonial = (id: string) => {
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem('text2app_testimonials', JSON.stringify(updated));
  };

  const renderIcon = (iconName: string, className: string = "") => {
    const icons: Record<string, React.ComponentType<any>> = {
      Zap, Code, Smartphone, Rocket, Globe, Shield
    };
    const IconComponent = icons[iconName] || Code;
    return <IconComponent className={className} />;
  };

  if (currentUser && window.location.pathname !== '/admin') {
    window.history.pushState({}, '', '/admin');
  }

  // Admin Panel
  if (currentUser) {
    return (
      <div id="welcome_fallback" className="min-h-screen bg-gray-50">
        <AILayer
          ref={aiLayerRef}
          prompt=""
          onResult={handleAIResult}
          onError={setAiError}
          onLoading={setIsLoading}
        />
        
        {/* Admin Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Text2App Admin</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {currentUser.first_name}</span>
                <button
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.removeItem('text2app_user');
                    window.history.pushState({}, '', '/');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Admin Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {['dashboard', 'testimonials', 'features', 'pricing', 'contacts', 'settings'].map((view) => (
              <button
                key={view}
                id={`${view}-tab`}
                onClick={() => setAdminView(view)}
                className={`btn ${adminView === view ? 'btn-primary' : 'btn-secondary'}`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          {/* Dashboard */}
          {adminView === 'dashboard' && (
            <div id="generation_issue_fallback" className="space-y-6">
              <h2 className="heading-2">Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="stat-title">Total Testimonials</div>
                  <div className="stat-value">{testimonials.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Contact Submissions</div>
                  <div className="stat-value">{contactSubmissions.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Features</div>
                  <div className="stat-value">{features.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Pricing Plans</div>
                  <div className="stat-value">{pricingPlans.length}</div>
                </div>
              </div>

              <div className="card card-padding">
                <h3 className="heading-4 mb-4">Recent Contact Submissions</h3>
                <div className="space-y-3">
                  {contactSubmissions.slice(-5).reverse().map((submission) => (
                    <div key={submission.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{submission.name} - {submission.company}</p>
                          <p className="text-sm text-gray-600">{submission.email}</p>
                          <p className="text-sm mt-1">{submission.message}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(submission.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Testimonials Management */}
          {adminView === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="heading-2">Manage Testimonials</h2>
                <button
                  onClick={() => setEditingTestimonial({ id: '', name: '', company: '', content: '', rating: 5, avatar: '' })}
                  className="btn btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add Testimonial
                </button>
              </div>

              <div className="grid gap-4">
                {testimonials.map((testimonial) => (
                  <div key={testimonial.id} className="card card-padding">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="avatar avatar-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                            {testimonial.avatar}
                          </div>
                          <div>
                            <p className="font-medium">{testimonial.name}</p>
                            <p className="text-sm text-gray-600">{testimonial.company}</p>
                          </div>
                          <div className="flex">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700">{testimonial.content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => setEditingTestimonial(testimonial)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteTestimonial(testimonial.id)}
                          className="btn btn-error btn-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit Testimonial Modal */}
              {editingTestimonial && (
                <div className="modal-backdrop">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h3 className="heading-5">
                        {editingTestimonial.id ? 'Edit' : 'Add'} Testimonial
                      </h3>
                      <button
                        onClick={() => setEditingTestimonial(null)}
                        className="btn btn-ghost btn-sm"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="modal-body space-y-4">
                      <div className="form-group">
                        <label className="form-label">Name</label>
                        <input
                          type="text"
                          className="input"
                          value={editingTestimonial.name}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Company</label>
                        <input
                          type="text"
                          className="input"
                          value={editingTestimonial.company}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Avatar (Initials)</label>
                        <input
                          type="text"
                          className="input"
                          value={editingTestimonial.avatar}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value })}
                          maxLength={3}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Rating</label>
                        <select
                          className="select"
                          value={editingTestimonial.rating}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) })}
                        >
                          {[1, 2, 3, 4, 5].map(rating => (
                            <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea
                          className="textarea"
                          rows={4}
                          value={editingTestimonial.content}
                          onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        onClick={() => setEditingTestimonial(null)}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (editingTestimonial.id) {
                            updateTestimonial(editingTestimonial.id, editingTestimonial);
                          } else {
                            addTestimonial(editingTestimonial);
                          }
                        }}
                        className="btn btn-primary"
                      >
                        {editingTestimonial.id ? 'Update' : 'Add'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Contact Submissions */}
          {adminView === 'contacts' && (
            <div className="space-y-6">
              <h2 className="heading-2">Contact Submissions</h2>
              <div className="space-y-4">
                {contactSubmissions.map((submission) => (
                  <div key={submission.id} className="card card-padding">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h4 className="font-medium">{submission.name}</h4>
                          <span className="badge badge-gray">{submission.company}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(submission.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{submission.email}</p>
                        <p className="text-gray-700">{submission.message}</p>
                      </div>
                      <button
                        onClick={() => {
                          const updated = contactSubmissions.filter(c => c.id !== submission.id);
                          setContactSubmissions(updated);
                          localStorage.setItem('text2app_contacts', JSON.stringify(updated));
                        }}
                        className="btn btn-error btn-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings */}
          {adminView === 'settings' && (
            <div className="space-y-6">
              <h2 className="heading-2">Settings</h2>
              <div className="card card-padding space-y-4">
                <h3 className="heading-4">Data Management</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      const data = {
                        testimonials,
                        contacts: contactSubmissions,
                        features,
                        pricing: pricingPlans
                      };
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'text2app-data.json';
                      a.click();
                    }}
                    className="btn btn-primary"
                  >
                    <Download className="h-4 w-4" />
                    Export Data
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const data = JSON.parse(e.target?.result as string);
                              if (data.testimonials) {
                                setTestimonials(data.testimonials);
                                localStorage.setItem('text2app_testimonials', JSON.stringify(data.testimonials));
                              }
                              if (data.contacts) {
                                setContactSubmissions(data.contacts);
                                localStorage.setItem('text2app_contacts', JSON.stringify(data.contacts));
                              }
                              if (data.features) {
                                setFeatures(data.features);
                                localStorage.setItem('text2app_features', JSON.stringify(data.features));
                              }
                              if (data.pricing) {
                                setPricingPlans(data.pricing);
                                localStorage.setItem('text2app_plans', JSON.stringify(data.pricing));
                              }
                              alert('Data imported successfully!');
                            } catch (error) {
                              alert('Error importing data. Please check the file format.');
                            }
                          };
                          reader.readAsText(file);
                        }
                      };
                      input.click();
                    }}
                    className="btn btn-secondary"
                  >
                    <Upload className="h-4 w-4" />
                    Import Data
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                        localStorage.clear();
                        setTestimonials([]);
                        setContactSubmissions([]);
                        setFeatures([]);
                        setPricingPlans([]);
                        alert('All data cleared successfully!');
                      }
                    }}
                    className="btn btn-error"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Public Website
  return (
    <div id="welcome_fallback" className="min-h-screen bg-white">
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={handleAIResult}
        onError={setAiError}
        onLoading={setIsLoading}
      />

      {/* Navigation */}
      <nav id="navbar" className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Code className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Text2App
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'features', 'how-it-works', 'pricing', 'testimonials', 'contact'].map((section) => (
                <button
                  key={section}
                  id={`${section}-nav`}
                  onClick={() => scrollToSection(section)}
                  className={`nav-link ${activeSection === section ? 'nav-link-active' : ''}`}
                >
                  {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </button>
              ))}
              <button
                onClick={() => scrollToSection('contact')}
                className="btn btn-primary"
              >
                Get Started
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden btn btn-ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <div className="flex flex-col space-y-2">
                {['home', 'features', 'how-it-works', 'pricing', 'testimonials', 'contact'].map((section) => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className="nav-link text-left"
                  >
                    {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </button>
                ))}
                <button
                  onClick={() => scrollToSection('contact')}
                  className="btn btn-primary w-full mt-4"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 pb-16 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div id="generation_issue_fallback" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="heading-1 mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Transform Your Ideas Into Apps with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Describe your app idea in plain English and watch our advanced AI create a fully functional, 
              production-ready application in minutes. No coding required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => scrollToSection('contact')}
                className="btn btn-primary btn-lg"
              >
                Start Building Now
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="btn btn-secondary btn-lg"
              >
                See How It Works
              </button>
            </div>
            
            {/* Demo Video Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-1">
                <div className="bg-white rounded-xl p-8">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Rocket className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-gray-600 font-medium">Interactive Demo Coming Soon</p>
                      <p className="text-sm text-gray-500">Watch AI transform text into apps</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform combines cutting-edge technology with intuitive design 
              to deliver exceptional app development capabilities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="card card-padding card-hover text-center">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  {renderIcon(feature.icon, "h-6 w-6 text-white")}
                </div>
                <h3 className="heading-5 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your ideas into reality in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="heading-4 mb-4">Describe Your Idea</h3>
              <p className="text-gray-600 leading-relaxed">
                Simply describe your app idea in natural language. Include features, design preferences, 
                and target audience. Our AI understands context and requirements.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="heading-4 mb-4">AI Generates Your App</h3>
              <p className="text-gray-600 leading-relaxed">
                Our advanced AI analyzes your requirements and generates clean, professional code 
                with modern UI/UX design and best practices.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="heading-4 mb-4">Deploy & Iterate</h3>
              <p className="text-gray-600 leading-relaxed">
                Get your fully functional app ready for deployment. Make changes by describing 
                modifications, and watch your app evolve instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your needs. All plans include our core AI generation technology.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <div key={plan.id} className={`card card-padding text-center relative ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="badge badge-primary">Most Popular</span>
                  </div>
                )}
                <h3 className="heading-4 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-600">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollToSection('contact')}
                  className={`btn w-full ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of developers and entrepreneurs who are building faster with Text2App
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="card card-padding">
                <div className="flex mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="avatar avatar-sm bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="heading-2 mb-4">Ready to Build Your App?</h2>
              <p className="text-xl text-gray-600">
                Get in touch with our team to discuss your project and start building today.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div>
                <h3 className="heading-4 mb-6">Get in Touch</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">hello@text2app.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">123 Innovation Street<br />San Francisco, CA 94105</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="card card-padding">
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label form-label-required">Name</label>
                    <input
                      id="name"
                      type="text"
                      className="input"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="email" className="form-label form-label-required">Email</label>
                    <input
                      id="email"
                      type="email"
                      className="input"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="company" className="form-label">Company</label>
                    <input
                      id="company"
                      type="text"
                      className="input"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message" className="form-label form-label-required">Message</label>
                    <textarea
                      id="message"
                      className="textarea"
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      placeholder="Tell us about your app idea..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    Send Message
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot */}
      {showChatbot && (
        <div className="fixed bottom-24 right-6 w-80 max-w-[calc(100vw-3rem)] z-50">
          <div className="card shadow-xl">
            <div className="card-header flex justify-between items-center">
              <h3 className="heading-6">AI Assistant</h3>
              <button
                onClick={() => setShowChatbot(false)}
                className="btn btn-ghost btn-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="card-body">
              <div className="h-64 overflow-y-auto space-y-3 mb-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Hi! I'm here to help you learn about Text2App. Ask me anything!</p>
                  </div>
                )}
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="animate-pulse flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Ask about Text2App..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
                />
                <button
                  onClick={handleChatSubmit}
                  disabled={!chatInput.trim() || isLoading}
                  className="btn btn-primary"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setShowChatbot(!showChatbot)}
        className="fixed bottom-6 right-6 btn btn-primary rounded-full w-14 h-14 flex items-center justify-center shadow-lg z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">Text2App</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Transform your ideas into fully functional applications using the power of artificial intelligence.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><AdminLogin linkText="Admin Login" /></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Datavtar Private Limited. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;