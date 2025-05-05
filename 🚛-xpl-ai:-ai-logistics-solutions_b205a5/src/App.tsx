import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  Globe,
  BarChart,
  BrainCircuit,
  MapPin,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  Warehouse,
  Route,
  MessageCircle,
  Mail,
  Phone,
  ArrowUp,
  LinkedinIcon,
  Twitter,
  Instagram,
  Facebook
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const App: React.FC = () => {
  // State for mobile menu toggle
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Check for saved preference or system preference
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' ||
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [activeSection, setActiveSection] = useState<string>('home');
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  // Analytics data for demo chart
  const analyticsData = [
    { name: 'Jan', emissions: 40, efficiency: 24, cost: 60 },
    { name: 'Feb', emissions: 30, efficiency: 13, cost: 50 },
    { name: 'Mar', emissions: 20, efficiency: 98, cost: 40 },
    { name: 'Apr', emissions: 27, efficiency: 39, cost: 45 },
    { name: 'May', emissions: 18, efficiency: 48, cost: 38 },
    { name: 'Jun', emissions: 23, efficiency: 38, cost: 43 },
    { name: 'Jul', emissions: 34, efficiency: 43, cost: 55 },
  ];

  // Team members data
  const teamMembers = [
    {
      name: 'Emma van der Berg',
      position: 'Co-Founder & CEO',
      bio: 'Former logistics executive with 15+ years in supply chain optimization',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
    },
    {
      name: 'Lars Jansen',
      position: 'Co-Founder & CTO',
      bio: 'AI researcher and engineer specializing in route optimization algorithms',
      avatar: 'https://randomuser.me/api/portraits/men/41.jpg'
    },
    {
      name: 'Sophie Chen',
      position: 'Head of AI Research',
      bio: 'PhD in Machine Learning with focus on predictive analytics for transportation',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
    },
    {
      name: 'Max Dekker',
      position: 'Head of Operations',
      bio: 'Experienced operations leader with background in European logistics networks',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      quote: "XPL-AI has transformed our logistics operation, reducing costs by 28% while improving delivery times by 35%.",
      author: "Johanna Schmidt",
      company: "GreenFreight Europe",
      avatar: "https://randomuser.me/api/portraits/women/45.jpg"
    },
    {
      quote: "The predictive analytics platform provided by XPL-AI has been a game-changer for our supply chain planning.",
      author: "Thomas Bergman",
      company: "Nordic Shipping Co.",
      avatar: "https://randomuser.me/api/portraits/men/22.jpg"
    },
    {
      quote: "We've reduced our carbon footprint by 42% since implementing XPL-AI's optimization solutions across our fleet.",
      author: "Marie Dubois",
      company: "EcoTransport Solutions",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg"
    }
  ];

  // Features data
  const features = [
    {
      title: "AI-Powered Route Optimization",
      description: "Our proprietary algorithms analyze thousands of variables in real-time to determine the most efficient routes, reducing fuel consumption and delivery times.",
      icon: <Route className="h-10 w-10 text-primary-600 dark:text-primary-400" />
    },
    {
      title: "Predictive Analytics Dashboard",
      description: "Anticipate supply chain disruptions before they occur with our advanced predictive modeling that identifies potential issues days in advance.",
      icon: <BarChart className="h-10 w-10 text-primary-600 dark:text-primary-400" />
    },
    {
      title: "Carbon Footprint Reduction",
      description: "Automatically optimize for environmental impact with intelligent load balancing and route planning that minimizes emissions while maintaining efficiency.",
      icon: <Globe className="h-10 w-10 text-primary-600 dark:text-primary-400" />
    },
    {
      title: "Warehouse Intelligence",
      description: "Optimize warehouse operations with AI-driven inventory management and picking route optimization for improved efficiency.",
      icon: <Warehouse className="h-10 w-10 text-primary-600 dark:text-primary-400" />
    },
    {
      title: "Fleet Management",
      description: "Real-time monitoring and optimization of your entire fleet with predictive maintenance alerts and driver performance analytics.",
      icon: <Truck className="h-10 w-10 text-primary-600 dark:text-primary-400" />
    },
    {
      title: "Smart Package Tracking",
      description: "End-to-end visibility with anomaly detection that proactively identifies and resolves delivery issues before they impact customers.",
      icon: <Package className="h-10 w-10 text-primary-600 dark:text-primary-400" />
    }
  ];

  // Handle scroll events for highlighting active section and showing scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      // Show/hide scroll to top button
      setShowScrollTop(window.scrollY > 300);

      // Determine active section based on scroll position
      const sections = ['home', 'about', 'solutions', 'case-studies', 'team', 'contact'];

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Function to scroll to a section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setIsMenuOpen(false); // Close mobile menu after clicking
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 theme-transition-all">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-[var(--z-sticky)] bg-white dark:bg-slate-900 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center">
              <div className="relative h-10 w-10 mr-2 rounded-md bg-primary-600 flex items-center justify-center">
                <BrainCircuit className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">XPL-AI</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {['home', 'about', 'solutions', 'case-studies', 'team', 'contact'].map(section => (
                <button
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium ${activeSection === section ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'} theme-transition`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                </button>
              ))}
            </nav>

            {/* Mobile Menu Button & Dark Mode Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="rounded-full p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              <button
                className="md:hidden rounded-md p-2 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className="mt-4 py-4 border-t border-gray-200 dark:border-gray-700 md:hidden">
              <div className="flex flex-col space-y-4">
                {['home', 'about', 'solutions', 'case-studies', 'team', 'contact'].map(section => (
                  <button
                    key={section}
                    onClick={() => scrollToSection(section)}
                    className={`text-sm font-medium py-2 ${activeSection === section ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'} theme-transition`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section id="home" className="relative py-16 md:py-24 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-slate-800 dark:to-slate-900 theme-transition overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="grid-pattern"></div>
          </div>
          <div className="container-fluid relative z-10">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                  Revolutionizing Logistics
                  <span className="block text-primary-600 dark:text-primary-400">With Artificial Intelligence</span>
                </h1>
                <p className="mt-6 text-lg text-gray-700 dark:text-gray-300 max-w-2xl">
                  XPL-AI combines cutting-edge AI technology with deep logistics expertise to optimize supply chains, reduce costs, and minimize environmental impact for forward-thinking companies.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => scrollToSection('solutions')}
                    className="btn btn-primary flex items-center justify-center"
                  >
                    Explore Solutions <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollToSection('contact')}
                    className="btn bg-white text-primary-600 hover:bg-gray-50 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  >
                    Contact Us
                  </button>
                </div>
              </div>
              <div className="md:w-1/2 relative">
                <div className="relative h-64 md:h-auto rounded-lg overflow-hidden shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
                  <img
                    src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="AI-powered logistics visualization"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center space-x-2">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">Reduced Emissions</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Up to 42% decrease</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card flex items-start space-x-4 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">30%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Average reduction in logistics costs</div>
                </div>
              </div>

              <div className="card flex items-start space-x-4 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">15+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Countries with active implementations</div>
                </div>
              </div>

              <div className="card flex items-start space-x-4 transform hover:-translate-y-1 transition-transform duration-300">
                <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Package className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">10M+</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Shipments optimized monthly</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-16 md:py-24 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 pr-0 md:pr-12 mb-10 md:mb-0">
                <div className="relative">
                  <div className="absolute top-0 left-0 -mt-4 -ml-4 h-72 w-72 bg-primary-100 dark:bg-primary-900/30 rounded-lg -z-10"></div>
                  <img
                    src="https://images.unsplash.com/photo-1581092583537-20d51b4b4f1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Our Amsterdam headquarters"
                    className="rounded-lg shadow-lg w-full object-cover h-auto md:h-96"
                  />
                  <div className="absolute bottom-4 right-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg text-center">
                    <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mx-auto" />
                    <div className="mt-1 text-sm font-medium">Amsterdam, NL</div>
                  </div>
                </div>
              </div>

              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  About <span className="text-primary-600 dark:text-primary-400">XPL-AI</span>
                </h2>
                <div className="mt-6 space-y-6 text-gray-700 dark:text-gray-300">
                  <p>
                    Founded in 2018 in Amsterdam, XPL-AI was born from a simple observation: traditional logistics systems were not equipped to handle the complexity and speed of modern supply chains. Our founders, with backgrounds in AI research and logistics operations, set out to create a new paradigm.
                  </p>
                  <p>
                    Today, we're a team of 50+ AI specialists, logistics experts, and software engineers working at the intersection of artificial intelligence and supply chain management. Our mission is to make logistics smarter, more efficient, and environmentally sustainable through advanced technology.
                  </p>
                  <p>
                    We're proud to serve clients across Europe, North America, and Asia, ranging from mid-sized logistics providers to Fortune 500 enterprises. Our solutions have been recognized by industry awards for innovation, sustainability, and business impact.
                  </p>
                </div>
                <div className="mt-8">
                  <button
                    onClick={() => scrollToSection('team')}
                    className="btn btn-primary"
                  >
                    Meet Our Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-16 md:py-24 bg-gray-50 dark:bg-slate-800 theme-transition">
          <div className="container-fluid">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Our <span className="text-primary-600 dark:text-primary-400">AI-Powered Solutions</span>
              </h2>
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                Comprehensive logistics optimization platforms driven by advanced machine learning algorithms
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="card flex flex-col h-full transform hover:-translate-y-1 transition-transform duration-300">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-700 dark:text-gray-300 flex-grow">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* Analytics Demo */}
            <div className="mt-16 p-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Real-time Analytics Dashboard
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={analyticsData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                        borderColor: isDarkMode ? '#475569' : '#e5e7eb',
                        color: isDarkMode ? '#f1f5f9' : '#111827',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#10b981" name="Route Efficiency" />
                    <Bar dataKey="emissions" fill="#6366f1" name="Emissions Reduction" />
                    <Bar dataKey="cost" fill="#f59e0b" name="Cost Savings" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section id="case-studies" className="py-16 md:py-24 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Customer <span className="text-primary-600 dark:text-primary-400">Success Stories</span>
              </h2>
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                See how leading companies have transformed their logistics operations with our AI solutions
              </p>
            </div>

            {/* Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="card relative">
                  <div className="absolute -top-5 left-5 h-10 w-10 flex items-center justify-center rounded-full bg-primary-600 text-white text-2xl font-serif">
                    "
                  </div>
                  <div className="pt-6">
                    <p className="text-gray-700 dark:text-gray-300 italic mb-6">"{testimonial.quote}" </p>
                    <div className="flex items-center">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        className="h-12 w-12 rounded-full mr-4"
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{testimonial.author}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.company}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Featured Case Study */}
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Case study featuring port logistics optimization"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="badge badge-success inline-block mb-4">FEATURED CASE STUDY</div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Rotterdam Port Authority Reduces Waiting Times by 63%
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6">
                    Using our AI-powered port logistics platform, Rotterdam Port Authority transformed their container handling operations, significantly reducing vessel waiting times and optimizing resource allocation across the terminal.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">63%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Reduction in waiting times</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">€4.2M</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Annual cost savings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">28%</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Increase in throughput</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">18K</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tons CO₂ saved annually</div>
                    </div>
                  </div>
                  <button className="btn btn-primary">
                    Read Full Case Study
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section id="team" className="py-16 md:py-24 bg-gray-50 dark:bg-slate-800 theme-transition">
          <div className="container-fluid">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Meet Our <span className="text-primary-600 dark:text-primary-400">Team</span>
              </h2>
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                A diverse group of AI specialists, logistics experts, and technology innovators
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member, index) => (
                <div key={index} className="card text-center transform hover:-translate-y-1 transition-transform duration-300">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <div className="text-primary-600 dark:text-primary-400 font-medium mb-2">{member.position}</div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{member.bio}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Join Our Team</h3>
              <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
                We're always looking for talented individuals who are passionate about AI, logistics, and making a positive impact on the global supply chain ecosystem.
              </p>
              <button className="btn btn-primary">
                View Open Positions
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 md:py-24 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 lg:pr-16 mb-10 lg:mb-0">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Get in <span className="text-primary-600 dark:text-primary-400">Touch</span>
                </h2>
                <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-lg">
                  Interested in learning how our AI-powered logistics solutions can transform your operations? Contact us today to schedule a consultation with our team.
                </p>

                <div className="mt-8 space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Our Location</h3>
                      <div className="mt-1 text-gray-600 dark:text-gray-400">
                        <p>XPL-AI Headquarters</p>
                        <p>Herengracht 182</p>
                        <p>1016 BR Amsterdam</p>
                        <p>The Netherlands</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Us</h3>
                      <div className="mt-1 text-gray-600 dark:text-gray-400">
                        <p>info@xpl-ai.com</p>
                        <p>support@xpl-ai.com</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Call Us</h3>
                      <div className="mt-1 text-gray-600 dark:text-gray-400">
                        <p>+31 20 123 4567</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                      <LinkedinIcon className="h-5 w-5" />
                    </a>
                    <a href="#" className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                      <Twitter className="h-5 w-5" />
                    </a>
                    <a href="#" className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a href="#" className="h-10 w-10 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary-100 hover:text-primary-600 dark:hover:bg-primary-900/30 dark:hover:text-primary-400 transition-colors">
                      <Facebook className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2">
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Send Us a Message</h3>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">Your Name</label>
                        <input type="text" id="name" name="name" className="input" placeholder="John Doe" />
                      </div>
                      <div className="form-group">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input type="email" id="email" name="email" className="input" placeholder="john@example.com" />
                      </div>
                    </div>
                    <div className="form-group">
                      <label htmlFor="company" className="form-label">Company</label>
                      <input type="text" id="company" name="company" className="input" placeholder="Your Company Ltd." />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea id="message" name="message" rows={4} className="input" placeholder="How can we help you?"></textarea>
                    </div>
                    <div className="form-group">
                      <button type="submit" className="btn btn-primary w-full">
                        Send Message
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 py-12 text-white">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative h-10 w-10 mr-2 rounded-md bg-primary-600 flex items-center justify-center">
                  <BrainCircuit className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">XPL-AI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Revolutionizing logistics with artificial intelligence to create more efficient, cost-effective, and sustainable supply chains.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {['home', 'about', 'solutions', 'case-studies', 'team', 'contact'].map(section => (
                  <li key={section}>
                    <button
                      onClick={() => scrollToSection(section)}
                      className="text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {section.charAt(0).toUpperCase() + section.slice(1).replace('-', ' ')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Route Optimization</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Predictive Analytics</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Fleet Management</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Warehouse Intelligence</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Carbon Footprint Reduction</a></li>
                <li><a href="#" className="text-gray-400 hover:text-primary-400 transition-colors">Smart Package Tracking</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
              <p className="text-gray-400 mb-4">Stay updated with the latest news and innovations in AI logistics.</p>
              <form className="space-y-2">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="input bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default App;