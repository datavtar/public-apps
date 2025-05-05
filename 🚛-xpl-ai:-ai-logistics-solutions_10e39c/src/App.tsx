import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import {
  Truck,
  Warehouse,
  Package,
  Brain,
  Globe,
  MapPin,
  ChartBar,
  User,
  Mail,
  Send,
  Menu,
  X,
  ArrowRight,
  CheckCircle,
  BrainCircuit,
  Database,
  Route,
  TrendingUp,
  Github,
  Linkedin,
  Twitter,
  ArrowUp,
  Moon,
  Sun
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isContactFormSubmitted, setIsContactFormSubmitted] = useState<boolean>(false);
  const [isScrolledToTop, setIsScrolledToTop] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  interface ContactFormData {
    name: string;
    email: string;
    message: string;
  }
  
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  
  interface FormError {
    name?: string;
    email?: string;
    message?: string;
  }
  
  const [formErrors, setFormErrors] = useState<FormError>({});

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolledToTop(window.scrollY < 100);
      
      // Set active section based on scroll position
      const sections = ['home', 'about', 'solutions', 'technology', 'contact'];
      let currentSection = 'home';
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 200) {
          currentSection = section;
        }
      }
      
      setActiveSection(currentSection);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
      closeMenu();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof FormError]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormError = {};
    let isValid = true;
    
    if (!contactForm.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!contactForm.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactForm.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    if (!contactForm.message.trim()) {
      errors.message = 'Message is required';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // In a real application, you would send this data to your backend
      console.log('Form submitted:', contactForm);
      
      // Store in localStorage for demonstration
      const storedContacts = JSON.parse(localStorage.getItem('contacts') || '[]');
      localStorage.setItem('contacts', JSON.stringify([...storedContacts, contactForm]));
      
      // Reset form
      setContactForm({
        name: '',
        email: '',
        message: ''
      });
      
      // Show success message
      setIsContactFormSubmitted(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsContactFormSubmitted(false);
      }, 5000);
    }
  };

  // Sample data for charts
  const deliveryEfficiencyData = [
    { month: 'Jan', traditional: 65, withXplAI: 85 },
    { month: 'Feb', traditional: 68, withXplAI: 89 },
    { month: 'Mar', traditional: 67, withXplAI: 93 },
    { month: 'Apr', traditional: 70, withXplAI: 94 },
    { month: 'May', traditional: 72, withXplAI: 95 },
    { month: 'Jun', traditional: 71, withXplAI: 97 },
  ];

  const costReductionData = [
    { name: 'Fuel', reduction: 28 },
    { name: 'Labor', reduction: 22 },
    { name: 'Maintenance', reduction: 19 },
    { name: 'Admin', reduction: 32 },
  ];

  return (
    <div className="min-h-screen font-sans text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className={`fixed w-full top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm transition-all duration-300 ${!isScrolledToTop ? 'shadow-md py-3' : 'py-5'}`}>
        <div className="container-fluid flex-between">
          <div className={styles.logo} onClick={() => scrollToSection('home')} role="button" aria-label="Go to home section">
            <span className="text-primary-600 dark:text-primary-400">xpl</span>
            <span className="text-gray-800 dark:text-white">-ai</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => scrollToSection('home')} 
                className={`${activeSection === 'home' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
                aria-label="Navigate to home section"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className={`${activeSection === 'about' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
                aria-label="Navigate to about section"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('solutions')} 
                className={`${activeSection === 'solutions' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
                aria-label="Navigate to solutions section"
              >
                Solutions
              </button>
              <button 
                onClick={() => scrollToSection('technology')} 
                className={`${activeSection === 'technology' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
                aria-label="Navigate to technology section"
              >
                Technology
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className={`${activeSection === 'contact' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
                aria-label="Navigate to contact section"
              >
                Contact
              </button>
            </nav>
            
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 mr-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-slate-900 pt-20 theme-transition">
          <nav className="container-fluid flex flex-col space-y-6 py-8">
            <button 
              onClick={() => scrollToSection('home')} 
              className="text-xl font-medium py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Navigate to home section"
            >
              Home
            </button>
            <button 
              onClick={() => scrollToSection('about')} 
              className="text-xl font-medium py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Navigate to about section"
            >
              About
            </button>
            <button 
              onClick={() => scrollToSection('solutions')} 
              className="text-xl font-medium py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Navigate to solutions section"
            >
              Solutions
            </button>
            <button 
              onClick={() => scrollToSection('technology')} 
              className="text-xl font-medium py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Navigate to technology section"
            >
              Technology
            </button>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-xl font-medium py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Navigate to contact section"
            >
              Contact
            </button>
          </nav>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-primary-600 dark:text-primary-400">Revolutionizing</span> Logistics with
              <span className="block">Intelligent AI Solutions</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
              Xpl-AI is transforming the logistics industry with cutting-edge artificial intelligence that optimizes routes, reduces costs, and increases efficiency.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => scrollToSection('solutions')} 
                className="btn btn-primary text-lg px-8 py-3 rounded-full flex items-center justify-center gap-2"
                aria-label="Explore our solutions"
              >
                Explore Solutions <ArrowRight size={20} />
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="btn text-lg px-8 py-3 rounded-full bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 border border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-slate-700"
                aria-label="Contact us"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
        
        <div className="container-wide mt-20">
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImageOverlay}></div>
            <div className={styles.heroImage}></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50 dark:bg-slate-800/50">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">About <span className="text-primary-600 dark:text-primary-400">Xpl-AI</span></h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Based in Amsterdam, we're a team of AI experts, logistics specialists, and data scientists dedicated to solving complex supply chain challenges.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card theme-transition hover:shadow-lg transition-shadow">
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                <BrainCircuit size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Vision</h3>
              <p className="text-gray-600 dark:text-gray-300">
                To create a future where logistics operations are fully optimized through artificial intelligence, reducing waste and maximizing efficiency across global supply chains.
              </p>
            </div>
            
            <div className="card theme-transition hover:shadow-lg transition-shadow">
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                <TrendingUp size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Mission</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Empower logistics companies with accessible AI tools that deliver immediate operational improvements and long-term competitive advantages in an evolving market.
              </p>
            </div>
            
            <div className="card theme-transition hover:shadow-lg transition-shadow">
              <div className="text-primary-600 dark:text-primary-400 mb-4">
                <Globe size={48} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Our Impact</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Since our founding in 2021, we've helped logistics providers reduce fuel consumption by 28%, decrease delivery times by 31%, and improve overall operational efficiency by 42%.
              </p>
            </div>
          </div>
          
          <div className="mt-20">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold mb-4">Why Choose <span className="text-primary-600 dark:text-primary-400">Xpl-AI</span>?</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 text-green-500 dark:text-green-400">
                        <CheckCircle size={20} />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Industry Expertise:</span> Our team combines decades of logistics experience with cutting-edge AI knowledge.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 text-green-500 dark:text-green-400">
                        <CheckCircle size={20} />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Proven Results:</span> Our solutions have delivered measurable improvements for logistics companies of all sizes.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 text-green-500 dark:text-green-400">
                        <CheckCircle size={20} />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Customized Approach:</span> We develop tailored AI solutions that address your specific operational challenges.
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 text-green-500 dark:text-green-400">
                        <CheckCircle size={20} />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Continuous Innovation:</span> Our research team constantly improves our algorithms to stay ahead of industry changes.
                      </p>
                    </li>
                  </ul>
                </div>
                <div className={styles.aboutImage}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-20">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our <span className="text-primary-600 dark:text-primary-400">Solutions</span></h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We offer comprehensive AI-powered tools designed specifically for the logistics industry.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-8">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                  <Route size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart Route Optimization</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Our AI algorithms analyze traffic patterns, weather conditions, and delivery constraints in real-time to calculate the most efficient routes for your fleet.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Reduce fuel consumption by up to 30%
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Increase on-time deliveries by 27%
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Dynamic re-routing based on real-time conditions
                  </li>
                </ul>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  aria-label="Learn more about Smart Route Optimization"
                >
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-8">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                  <Warehouse size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Warehouse Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Optimize warehouse operations with AI-powered inventory management, predictive stocking, and automated resource allocation.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Reduce picking time by up to 40%
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Decrease inventory holding costs by 25%
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Optimize space utilization with 3D mapping
                  </li>
                </ul>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  aria-label="Learn more about Warehouse Intelligence"
                >
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-8">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                  <Database size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Predictive Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Harness the power of your data with advanced analytics that forecast demand, identify potential disruptions, and recommend proactive solutions.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Improve forecast accuracy by up to 35%
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Reduce stockouts by 42% while reducing inventory
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Identify emerging trends before your competitors
                  </li>
                </ul>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  aria-label="Learn more about Predictive Analytics"
                >
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-8">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                  <Truck size={28} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Fleet Management System</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Monitor and maintain your vehicle fleet with AI-powered diagnostic tools, maintenance scheduling, and driver performance analytics.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Extend vehicle lifespan by up to 20%
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Reduce maintenance costs by 32%
                  </li>
                  <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <div className="text-green-500 dark:text-green-400">
                      <CheckCircle size={16} />
                    </div>
                    Improve driver safety and efficiency
                  </li>
                </ul>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="text-primary-600 dark:text-primary-400 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                  aria-label="Learn more about Fleet Management System"
                >
                  Learn more <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-50 dark:bg-slate-800/60 rounded-2xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-6">Proven Results That <span className="text-primary-600 dark:text-primary-400">Drive Success</span></h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Our AI-powered solutions deliver measurable improvements to our clients' logistics operations. See how our technology can transform your business with real data.
                </p>
                
                <div className="mb-8">
                  <h4 className="text-xl font-semibold mb-4">Delivery Efficiency Improvement</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={deliveryEfficiencyData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                        <YAxis label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }} stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}
                          labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#111827' }}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="traditional" 
                          stroke="#94a3b8" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }} 
                          name="Traditional Logistics"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="withXplAI" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          dot={{ r: 4 }} 
                          activeDot={{ r: 6 }} 
                          name="With Xpl-AI Solutions"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="mb-8">
                  <h4 className="text-xl font-semibold mb-4">Cost Reduction by Category</h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={costReductionData}
                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                        <YAxis label={{ value: 'Reduction %', angle: -90, position: 'insideLeft' }} stroke={isDarkMode ? '#94a3b8' : '#6b7280'} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e5e7eb' }}
                          labelStyle={{ color: isDarkMode ? '#e2e8f0' : '#111827' }}
                        />
                        <Bar dataKey="reduction" fill="#3b82f6" name="Cost Reduction (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
                  <h4 className="text-xl font-semibold mb-4">Overall Impact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="stat-card">
                      <div className="stat-title">Delivery Time Reduction</div>
                      <div className="stat-value">31%</div>
                      <div className="stat-desc text-green-500 dark:text-green-400">↓ Average time to deliver</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-title">Operational Efficiency</div>
                      <div className="stat-value">42%</div>
                      <div className="stat-desc text-green-500 dark:text-green-400">↑ Overall improvement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="technology" className="py-20 bg-gray-50 dark:bg-slate-800/50">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our <span className="text-primary-600 dark:text-primary-400">Technology</span></h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powered by cutting-edge artificial intelligence and machine learning algorithms.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-3 h-full">
                <div className="col-span-3 md:col-span-1 bg-primary-600 dark:bg-primary-700 text-white p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <Brain size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">AI Core</h3>
                  <p className="opacity-80">
                    Our proprietary artificial intelligence engine powers all Xpl-AI solutions.
                  </p>
                </div>
                <div className="col-span-3 md:col-span-2 p-6 md:p-8">
                  <h4 className="text-xl font-semibold mb-4">Key Technologies</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Deep Learning Networks</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Multilayer neural networks that recognize patterns in complex logistics data.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Reinforcement Learning</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Dynamic algorithms that learn optimal decisions through experience.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Natural Language Processing</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Advanced text analysis for processing shipment documentation and communication.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Computer Vision</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Image recognition for inventory management and damage inspection.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-3 h-full">
                <div className="col-span-3 md:col-span-1 bg-primary-600 dark:bg-primary-700 text-white p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <MapPin size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Real-Time Analytics</h3>
                  <p className="opacity-80">
                    Continuous monitoring and analysis of your logistics operations.
                  </p>
                </div>
                <div className="col-span-3 md:col-span-2 p-6 md:p-8">
                  <h4 className="text-xl font-semibold mb-4">Analytical Capabilities</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Predictive Maintenance</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Forecasting equipment failures before they occur to prevent downtime.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Anomaly Detection</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Identifying unusual patterns that may indicate problems or opportunities.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Scenario Simulation</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Testing potential operational changes in a virtual environment before implementation.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Performance Dashboards</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Intuitive visualization of KPIs and operational metrics for decision-makers.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-3 h-full">
                <div className="col-span-3 md:col-span-1 bg-primary-600 dark:bg-primary-700 text-white p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <Package size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Smart Integration</h3>
                  <p className="opacity-80">
                    Seamlessly connect with your existing systems and technologies.
                  </p>
                </div>
                <div className="col-span-3 md:col-span-2 p-6 md:p-8">
                  <h4 className="text-xl font-semibold mb-4">Integration Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">API-First Architecture</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Robust APIs for connecting with your existing software ecosystem.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">IoT Compatibility</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Connect with sensors, tracking devices, and other IoT hardware.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Third-Party Connectors</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Pre-built integrations with popular logistics and ERP platforms.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Data Import/Export</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Flexible tools for moving data in and out of the platform.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-3 h-full">
                <div className="col-span-3 md:col-span-1 bg-primary-600 dark:bg-primary-700 text-white p-6 md:p-8 flex flex-col justify-center">
                  <div className="mb-4">
                    <ChartBar size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Scalable Platform</h3>
                  <p className="opacity-80">
                    Grows with your business from small operations to enterprise-scale logistics.
                  </p>
                </div>
                <div className="col-span-3 md:col-span-2 p-6 md:p-8">
                  <h4 className="text-xl font-semibold mb-4">Scalability Features</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Cloud-Native Infrastructure</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Deployed on high-performance cloud infrastructure for reliability and scalability.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Microservices Architecture</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Modular design allows for independent scaling of system components.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Multi-Region Deployment</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Global infrastructure for low-latency access from anywhere in the world.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-primary-600 dark:text-primary-400 mt-1">
                        <CheckCircle size={18} />
                      </div>
                      <div>
                        <h5 className="font-medium mb-1">Flexible Pricing Tiers</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Options for businesses of all sizes, from startups to global enterprises.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-6">Ready to transform your logistics operations with AI?</h3>
            <button 
              onClick={() => scrollToSection('contact')} 
              className="btn btn-primary text-lg px-8 py-3 rounded-full inline-flex items-center justify-center gap-2"
              aria-label="Contact us to learn more"
            >
              Get Started <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container-fluid">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in <span className="text-primary-600 dark:text-primary-400">Touch</span></h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Ready to see how our AI solutions can transform your logistics operations? Let's start a conversation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8">
              {isContactFormSubmitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="text-green-500 dark:text-green-400 mb-4">
                    <CheckCircle size={60} />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Thank You!</h3>
                  <p className="text-gray-600 dark:text-gray-300 max-w-md">
                    Your message has been received. Our team will get back to you shortly.
                  </p>
                  <button 
                    onClick={() => setIsContactFormSubmitted(false)} 
                    className="mt-6 btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-600"
                    aria-label="Send another message"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactInputChange}
                      className={`input ${formErrors.name ? 'border-red-500 dark:border-red-400' : ''}`}
                      placeholder="John Doe"
                      aria-label="Your name"
                    />
                    {formErrors.name && <p className="form-error">{formErrors.name}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactInputChange}
                      className={`input ${formErrors.email ? 'border-red-500 dark:border-red-400' : ''}`}
                      placeholder="john@example.com"
                      aria-label="Your email address"
                    />
                    {formErrors.email && <p className="form-error">{formErrors.email}</p>}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactInputChange}
                      className={`input min-h-[150px] resize-y ${formErrors.message ? 'border-red-500 dark:border-red-400' : ''}`}
                      placeholder="Tell us about your logistics challenges and how we can help..."
                      aria-label="Your message"
                    ></textarea>
                    {formErrors.message && <p className="form-error">{formErrors.message}</p>}
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full mt-4 flex items-center justify-center gap-2"
                    aria-label="Send message"
                  >
                    <Send size={18} /> Send Message
                  </button>
                </form>
              )}
            </div>
            
            <div>
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="text-primary-600 dark:text-primary-400 mt-1">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Headquarters</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        Prinsengracht 112<br />
                        1015 EA Amsterdam<br />
                        The Netherlands
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="text-primary-600 dark:text-primary-400 mt-1">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Email</h4>
                      <p className="text-gray-600 dark:text-gray-300">
                        info@xpl-ai.com<br />
                        support@xpl-ai.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-primary-600 dark:bg-primary-700 text-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold mb-6">Schedule a Demo</h3>
                <p className="opacity-90 mb-6">
                  See our AI-powered logistics solutions in action with a personalized demonstration tailored to your specific needs.
                </p>
                <button 
                  onClick={() => {
                    setContactForm({
                      ...contactForm,
                      message: "I'm interested in scheduling a demo of your AI logistics solutions."
                    });
                    document.getElementById('message')?.focus();
                  }} 
                  className="w-full py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  aria-label="Schedule a demo"
                >
                  Schedule Now <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-slate-800/70 pt-16 pb-8">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="md:col-span-1">
              <div className={styles.footerLogo}>
                <span className="text-primary-600 dark:text-primary-400">xpl</span>
                <span className="text-gray-800 dark:text-white">-ai</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                Revolutionizing logistics with artificial intelligence. Our advanced solutions optimize operations and reduce costs.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Solutions</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => scrollToSection('solutions')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Learn about Smart Route Optimization"
                  >
                    Smart Route Optimization
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('solutions')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Learn about Warehouse Intelligence"
                  >
                    Warehouse Intelligence
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('solutions')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Learn about Predictive Analytics"
                  >
                    Predictive Analytics
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('solutions')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Learn about Fleet Management"
                  >
                    Fleet Management
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Learn about our vision"
                  >
                    Our Vision
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('about')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Learn about our mission"
                  >
                    Our Mission
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('technology')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Learn about our technology"
                  >
                    Our Technology
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    aria-label="Contact us"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4 mb-6">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label="Twitter profile"
                >
                  <Twitter size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label="LinkedIn profile"
                >
                  <Linkedin size={20} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  aria-label="GitHub profile"
                >
                  <Github size={20} />
                </a>
              </div>
              <div>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="btn btn-primary flex items-center justify-center gap-2"
                  aria-label="Get in touch with us"
                >
                  <Mail size={18} /> Get in Touch
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-0">
                Copyright © 2025 Datavtar Private Limited. All rights reserved.
              </p>
              <div className="flex space-x-6 text-sm">
                <a 
                  href="#" 
                  className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Read our privacy policy"
                >
                  Privacy Policy
                </a>
                <a 
                  href="#" 
                  className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                  aria-label="Read our terms of service"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 p-3 rounded-full bg-primary-600 dark:bg-primary-700 text-white shadow-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-all duration-300 ${isScrolledToTop ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Scroll to top"
      >
        <ArrowUp size={24} />
      </button>
    </div>
  );
};

export default App;