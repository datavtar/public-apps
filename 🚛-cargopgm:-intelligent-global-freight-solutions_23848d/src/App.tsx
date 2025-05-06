import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Menu, X, ArrowRight, Truck, Globe, Database, BrainCircuit, ShieldCheck as Shield, MapPin, ChevronDown, Play, Check, MessageCircle, Mail, Phone } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for our app
interface TestimonialType {
  id: number;
  name: string;
  company: string;
  position: string;
  quote: string;
  avatar: string;
}

interface FeatureType {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const App: React.FC = () => {
  // State for theme toggle
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // State for mobile navigation
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  // State for active section in nav
  const [activeSection, setActiveSection] = useState<string>('home');

  // State to control video modal
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  // References to sections for scroll spy
  const homeRef = useRef<HTMLDivElement>(null);
  const solutionsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Setup intersectionObserver for scroll spy
  useEffect(() => {
    const sectionRefs = [
      { section: 'home', ref: homeRef },
      { section: 'solutions', ref: solutionsRef },
      { section: 'about', ref: aboutRef },
      { section: 'features', ref: featuresRef },
      { section: 'testimonials', ref: testimonialRef },
      { section: 'contact', ref: contactRef }
    ];

    const observerOptions = {
      threshold: 0.5,
      rootMargin: '-100px 0px -100px 0px'
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const section = sectionRefs.find(item => item.ref.current === entry.target);
          if (section) {
            setActiveSection(section.section);
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sectionRefs.forEach(({ ref }) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      sectionRefs.forEach(({ ref }) => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  // Apply theme when dark mode state changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Close menu when user clicks outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const navElement = document.getElementById('mobile-menu');
      if (isMenuOpen && navElement && !navElement.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Add event listener when menu is open
    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    // Clean up
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isVideoModalOpen) setIsVideoModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isVideoModalOpen]);

  // Toggle body scrolling when modal is open
  useEffect(() => {
    if (isVideoModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isVideoModalOpen]);

  // Sample features data
  const features: FeatureType[] = [
    {
      id: 1,
      title: "Global Network Integration",
      description: "Connect seamlessly with carriers, warehouses, and partners across continents through our unified platform.",
      icon: <Globe className="h-8 w-8 text-primary-600 dark:text-primary-400" />
    },
    {
      id: 2,
      title: "Intelligent Logistics MCP",
      description: "Our Multi-Agent Cognitive Platform optimizes routes, predicts disruptions, and adapts to changing conditions in real-time.",
      icon: <BrainCircuit className="h-8 w-8 text-primary-600 dark:text-primary-400" />
    },
    {
      id: 3,
      title: "End-to-End Visibility",
      description: "Track shipments from origin to destination with unprecedented granularity and insight across all modes of transport.",
      icon: <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
    },
    {
      id: 4,
      title: "Data-Driven Decisions",
      description: "Transform logistics data into actionable intelligence with powerful analytics and customizable dashboards.",
      icon: <Database className="h-8 w-8 text-primary-600 dark:text-primary-400" />
    },
    {
      id: 5,
      title: "Secure Transportation",
      description: "Enterprise-grade security protocols protect your cargo data and transactions across the entire supply chain.",
      icon: <Shield className="h-8 w-8 text-primary-600 dark:text-primary-400" />
    },
    {
      id: 6,
      title: "Precision Location Mapping",
      description: "Pinpoint accuracy for tracking shipments and optimizing delivery routes in both urban and remote areas.",
      icon: <MapPin className="h-8 w-8 text-primary-600 dark:text-primary-400" />
    },
  ];

  // Sample testimonials data
  const testimonials: TestimonialType[] = [
    {
      id: 1,
      name: "Sarah Johnson",
      company: "GlobalTrade Inc.",
      position: "Logistics Director",
      quote: "CargoPGM has revolutionized our international shipping operations. The intelligent routing has reduced our transit times by 23% and cut costs significantly.",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id: 2,
      name: "Michael Chen",
      company: "Pacific Distribution",
      position: "Supply Chain Manager",
      quote: "The predictive analytics in CargoPGM allowed us to anticipate port congestion issues and reroute shipments before they became problems. It's like having a crystal ball for logistics.",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      id: 3,
      name: "Amara Okafor",
      company: "Transcontinental Freight",
      position: "CEO",
      quote: "We've integrated CargoPGM across our entire operation. The agentic capabilities have automated routine decisions, freeing our team to focus on strategic initiatives and customer service.",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg"
    },
  ];

  // Handle smooth scrolling for navigation
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    setIsMenuOpen(false);
    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 theme-transition">
      {/* Navigation */}
      <header className="sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm z-[var(--z-sticky)] theme-transition">
        <div className="container-fluid py-4 flex-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
              Cargo<span className="text-secondary-600 dark:text-secondary-400">PGM</span>
            </h1>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ul className="flex space-x-6">
              <li>
                <button 
                  onClick={() => scrollToSection(homeRef)}
                  className={`theme-transition text-base hover:text-primary-600 dark:hover:text-primary-400 ${activeSection === 'home' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection(solutionsRef)}
                  className={`theme-transition text-base hover:text-primary-600 dark:hover:text-primary-400 ${activeSection === 'solutions' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Solutions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection(aboutRef)}
                  className={`theme-transition text-base hover:text-primary-600 dark:hover:text-primary-400 ${activeSection === 'about' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection(featuresRef)}
                  className={`theme-transition text-base hover:text-primary-600 dark:hover:text-primary-400 ${activeSection === 'features' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Features
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection(testimonialRef)}
                  className={`theme-transition text-base hover:text-primary-600 dark:hover:text-primary-400 ${activeSection === 'testimonials' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Testimonials
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection(contactRef)}
                  className={`theme-transition text-base hover:text-primary-600 dark:hover:text-primary-400 ${activeSection === 'contact' ? 'text-primary-600 dark:text-primary-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  Contact
                </button>
              </li>
            </ul>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 theme-transition"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-primary-400" />
              ) : (
                <Moon className="h-5 w-5 text-primary-600" />
              )}
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-primary-400" />
              ) : (
                <Moon className="h-5 w-5 text-primary-600" />
              )}
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden bg-white dark:bg-slate-900 shadow-lg absolute w-full theme-transition"
          >
            <div className="py-3 space-y-1 px-4">
              <button 
                onClick={() => scrollToSection(homeRef)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeSection === 'home' ? 'bg-gray-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection(solutionsRef)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeSection === 'solutions' ? 'bg-gray-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                Solutions
              </button>
              <button 
                onClick={() => scrollToSection(aboutRef)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeSection === 'about' ? 'bg-gray-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection(featuresRef)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeSection === 'features' ? 'bg-gray-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                Features
              </button>
              <button 
                onClick={() => scrollToSection(testimonialRef)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeSection === 'testimonials' ? 'bg-gray-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                Testimonials
              </button>
              <button 
                onClick={() => scrollToSection(contactRef)}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${activeSection === 'contact' ? 'bg-gray-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
              >
                Contact
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section ref={homeRef} className="py-16 md:py-24 bg-gradient-to-br from-white to-gray-100 dark:from-slate-900 dark:to-slate-800 theme-transition overflow-hidden">
          <div className="container-fluid">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gray-900 dark:text-white">
                  Next-Gen <span className="text-primary-600 dark:text-primary-400">Intelligent</span> Global Freight Management
                </h1>
                <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
                  Connect, control, and optimize your global freight with unprecedented speed and intelligence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => scrollToSection(contactRef)}
                    className="btn btn-primary theme-transition flex items-center justify-center gap-2"
                  >
                    Get Started <ArrowRight className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setIsVideoModalOpen(true)}
                    className="btn bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 dark:bg-transparent dark:text-primary-400 dark:border-primary-400 dark:hover:bg-slate-800 theme-transition flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" /> Watch Demo
                  </button>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className={`${styles.heroImage} rounded-lg shadow-xl overflow-hidden`}>
                  <img 
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                    alt="Global logistics network visualization" 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section with Animation */}
        <section ref={solutionsRef} className="py-16 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Intelligent Solutions for Modern Logistics</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Our integrated platform unifies your entire freight operation with predictive intelligence</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card hover:shadow-lg theme-transition flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-4 mb-6">
                  <Globe className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Global Network Integration</h3>
                <p className="text-gray-600 dark:text-gray-300">Connect seamlessly with carriers, warehouses, and partners across continents through our unified platform.</p>
              </div>

              <div className="card hover:shadow-lg theme-transition flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-4 mb-6">
                  <BrainCircuit className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">MCP Logistics Intelligence</h3>
                <p className="text-gray-600 dark:text-gray-300">Our Multi-Agent Cognitive Platform optimizes routes, predicts disruptions, and adapts to changing conditions in real-time.</p>
              </div>

              <div className="card hover:shadow-lg theme-transition flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                <div className="rounded-full bg-primary-100 dark:bg-primary-900/30 p-4 mb-6">
                  <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">End-to-End Visibility</h3>
                <p className="text-gray-600 dark:text-gray-300">Track shipments from origin to destination with unprecedented granularity and insight across all modes of transport.</p>
              </div>
            </div>

            <div className="text-center mt-12">
              <button 
                onClick={() => scrollToSection(featuresRef)}
                className="btn btn-secondary theme-transition flex items-center gap-2 mx-auto"
              >
                Explore All Features <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section ref={aboutRef} className="py-16 bg-gray-50 dark:bg-slate-800 theme-transition overflow-hidden">
          <div className="container-fluid">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2 order-2 md:order-1">
                <div className={`${styles.aboutImage} rounded-lg shadow-xl overflow-hidden relative`}>
                  <img 
                    src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=900&q=80" 
                    alt="Logistics control center" 
                    className="w-full h-full object-cover" 
                  />
                  <div className={`${styles.imageBadge} absolute bottom-4 right-4 bg-white dark:bg-slate-900 py-2 px-3 rounded-lg shadow-lg`}>
                    <span className="text-primary-600 dark:text-primary-400 font-medium">Intelligent Logistics</span>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">About CargoPGM</h2>
                <div className="prose prose-lg dark:prose-invert">
                  <p>
                    At CargoPGM, we are transforming logistics with an intelligent and agentic, MCP-based infrastructure. With CargoPGM your are not only managing logistics, you are empowering it to think, adapt, and evolve.
                  </p>
                  <p>
                    Our platform's revolutionary cognitive architecture goes beyond traditional software by actively learning from your operations, continuously optimizing routes, predicting potential disruptions, and making real-time adjustments to ensure your freight moves efficiently across the globe.
                  </p>
                  <p className="font-semibold text-primary-600 dark:text-primary-400">
                    Smarter logistics starts here!
                  </p>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">AI-powered optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">Global partner network</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                      <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section ref={featuresRef} className="py-16 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Powerful Features</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Our comprehensive suite of tools empowers your logistics operations</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.id} className="card hover:shadow-lg theme-transition">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Slider */}
        <section ref={testimonialRef} className="py-16 bg-gray-50 dark:bg-slate-800 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">What Our Clients Say</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Companies around the world trust CargoPGM for their logistics needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="card hover:shadow-lg theme-transition">
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 italic mb-6 flex-grow">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <img 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        className="w-12 h-12 rounded-full mr-4" 
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.position}, {testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section ref={contactRef} className="py-16 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Get in Touch</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">Ready to transform your logistics operations? Contact us today.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="card">
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input id="name" type="text" className="input" placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input id="email" type="email" className="input" placeholder="your.email@company.com" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="company" className="form-label">Company</label>
                    <input id="company" type="text" className="input" placeholder="Your company name" />
                  </div>
                  <div className="form-group">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea 
                      id="message" 
                      rows={4} 
                      className="input" 
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary w-full md:w-auto">
                    Send Message
                  </button>
                </form>
              </div>

              <div className="flex flex-col justify-between">
                <div className="card mb-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email</p>
                        <a href="mailto:info@cargopgm.com" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">info@cargopgm.com</a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                        <a href="tel:+11234567890" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">+1 (123) 456-7890</a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MessageCircle className="h-6 w-6 text-primary-600 dark:text-primary-400 mr-3 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Live Chat</p>
                        <p className="text-gray-600 dark:text-gray-300">Available Monday - Friday, 9am-6pm ET</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Global Headquarters</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    123 Logistics Drive<br />
                    Suite 400<br />
                    Boston, MA 02110<br />
                    United States
                  </p>
                  <div className={`${styles.mapContainer} rounded-md overflow-hidden h-48 bg-gray-200 dark:bg-slate-700`}>
                    {/* Map placeholder - would be replaced with actual react-leaflet map component */}
                    <div className="h-full w-full flex items-center justify-center">
                      <MapPin className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Modal */}
        {isVideoModalOpen && (
          <div 
            className="modal-backdrop" 
            onClick={() => setIsVideoModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="video-modal-title"
          >
            <div 
              className="modal-content w-full max-w-4xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 bg-gray-900">
                <h3 id="video-modal-title" className="text-white font-medium">CargoPGM Platform Demo</h3>
                <button 
                  onClick={() => setIsVideoModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Close modal"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="aspect-w-16 aspect-h-9">
                <div className="w-full h-full flex items-center justify-center bg-black p-2">
                  {/* This would be replaced with an actual video player */}
                  <div className="text-white text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 text-primary-400" />
                    <p className="text-lg">Video demonstration would play here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 theme-transition">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Cargo<span className="text-primary-400">PGM</span></h3>
              <p className="text-gray-400 mb-4">Intelligent global freight management for the modern world.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Global Network</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">MCP Platform</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Visibility Tools</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Data Analytics</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Press</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-center md:text-left mb-4 md:mb-0">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;