import React, { useState, useEffect } from 'react';
import {
  Truck,
  Ship,
  Plane,
  Warehouse,
  TrendingUp,
  Globe,
  ShoppingBag,
  Package,
  Server,
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  Map,
  Database,
  ChartBar,
  ArrowLeft,
  ArrowUp,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Youtube,
  Instagram
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const App: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [currentHero, setCurrentHero] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [activeTestimonial, setActiveTestimonial] = useState<number>(0);
  const [selectedFeature, setSelectedFeature] = useState<string>('visibility');

  // Hero slides content
  const heroSlides = [
    {
      title: "Global Freight Management Simplified",
      subtitle: "Connect, control, and optimize your supply chain with unprecedented speed and intelligence",
      image: "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      ctaText: "Get Started"
    },
    {
      title: "Optimize Your Logistics Network",
      subtitle: "Real-time visibility and AI-powered insights for better decision making",
      image: "https://images.unsplash.com/photo-1573030889348-c6b0f8b15e40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      ctaText: "Learn More"
    },
    {
      title: "Your MCP Server for Logistics",
      subtitle: "One platform for all your freight management needs",
      image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80",
      ctaText: "Explore Solutions"
    }
  ];

  // Features data
  const featuresData = {
    visibility: {
      title: "Real-time Visibility",
      description: "Track shipments across all modes of transportation with real-time updates and notifications. Get complete visibility into your entire supply chain from origin to destination.",
      icon: <Globe className="h-12 w-12 text-primary-600 mb-4" />,
      stats: [
        { name: 'On-time Delivery', value: 94 },
        { name: 'Accuracy', value: 99 },
        { name: 'Visibility Coverage', value: 98 }
      ]
    },
    optimization: {
      title: "Route Optimization",
      description: "Leverage AI algorithms to optimize routing decisions, reduce transit times, and minimize transportation costs while meeting delivery commitments.",
      icon: <Map className="h-12 w-12 text-primary-600 mb-4" />,
      stats: [
        { name: 'Cost Reduction', value: 18 },
        { name: 'Time Saved', value: 23 },
        { name: 'CO2 Reduction', value: 15 }
      ]
    },
    analytics: {
      title: "Advanced Analytics",
      description: "Transform logistics data into actionable insights. Identify trends, predict disruptions, and uncover opportunities for continuous improvement.",
      icon: <Database className="h-12 w-12 text-primary-600 mb-4" />,
      stats: [
        { name: 'Data Points', value: 85 },
        { name: 'Predictive Accuracy', value: 92 },
        { name: 'Issue Resolution', value: 75 }
      ]
    },
    integration: {
      title: "Seamless Integration",
      description: "Connect with your existing systems and partners through our open API platform. Unify your logistics ecosystem without disrupting operations.",
      icon: <Server className="h-12 w-12 text-primary-600 mb-4" />,
      stats: [
        { name: 'System Compatibility', value: 98 },
        { name: 'Integration Speed', value: 80 },
        { name: 'Partner Connectivity', value: 95 }
      ]
    },
    performance: {
      title: "Performance Monitoring",
      description: "Measure and benchmark logistics performance against industry standards and your own KPIs. Drive continuous improvement through data-driven decisions.",
      icon: <ChartBar className="h-12 w-12 text-primary-600 mb-4" />,
      stats: [
        { name: 'KPI Improvement', value: 32 },
        { name: 'Response Time', value: 85 },
        { name: 'Decision Speed', value: 67 }
      ]
    }
  };

  // Statistics data
  const statisticsData = [
    { name: 'Shipments Managed', value: '10M+', icon: <Package className="h-8 w-8" /> },
    { name: 'Cost Savings', value: '$325M', icon: <TrendingUp className="h-8 w-8" /> },
    { name: 'Global Network', value: '150+ Countries', icon: <Globe className="h-8 w-8" /> },
    { name: 'Customers', value: '5,000+', icon: <ShoppingBag className="h-8 w-8" /> }
  ];

  // Testimonials data
  const testimonialsData = [
    {
      quote: "CargoPGM has transformed our logistics operations. We've reduced costs by 23% and improved delivery times significantly.",
      author: "Sarah Johnson",
      company: "Global Retail Solutions",
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      quote: "The real-time visibility across our entire supply chain has been a game changer. We can now proactively manage exceptions rather than constantly fighting fires.",
      author: "Michael Chang",
      company: "Pacific Manufacturing",
      image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      quote: "Implementation was smooth and the ROI was almost immediate. Their customer support team is exceptional and truly understands logistics challenges.",
      author: "Elena Rodriguez",
      company: "Meridian Logistics",
      image: "https://randomuser.me/api/portraits/women/3.jpg"
    }
  ];

  // Performance data for charts
  const performanceData = [
    { name: 'Jan', value: 4000 },
    { name: 'Feb', value: 3000 },
    { name: 'Mar', value: 2000 },
    { name: 'Apr', value: 2780 },
    { name: 'May', value: 1890 },
    { name: 'Jun', value: 2390 },
    { name: 'Jul', value: 3490 },
    { name: 'Aug', value: 4000 },
    { name: 'Sep', value: 5000 },
    { name: 'Oct', value: 4500 },
    { name: 'Nov', value: 3800 },
    { name: 'Dec', value: 5200 }
  ];

  const pieData = [
    { name: 'Ocean', value: 45 },
    { name: 'Air', value: 25 },
    { name: 'Rail', value: 15 },
    { name: 'Road', value: 15 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonialsData.length);
    }, 8000);
    return () => clearInterval(interval);
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

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-800 dark:text-gray-100 transition theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-[var(--z-sticky)] theme-transition">
        <div className="container-fluid flex justify-between items-center py-4">
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold">CargoPGM</span>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <a href="#solutions" className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors">
              Solutions
            </a>
            <a href="#features" className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors">
              Features
            </a>
            <a href="#testimonials" className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors">
              Testimonials
            </a>
            <a href="#contact" className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors">
              Contact
            </a>
            <button className="btn btn-primary" onClick={() => window.location.href = '#contact'}>
              Request Demo
            </button>
            <button 
              className="theme-toggle" 
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
            </button>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <button 
              className="theme-toggle" 
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
            </button>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden bg-white dark:bg-slate-800 shadow-lg py-4 px-6 theme-transition">
            <div className="flex flex-col space-y-3">
              <a 
                href="#solutions" 
                className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Solutions
              </a>
              <a 
                href="#features" 
                className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#testimonials" 
                className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Testimonials
              </a>
              <a 
                href="#contact" 
                className="hover:text-primary-600 font-medium dark:hover:text-primary-400 transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <button 
                className="btn btn-primary mt-2" 
                onClick={() => {
                  window.location.href = '#contact';
                  setMobileMenuOpen(false);
                }}
              >
                Request Demo
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[600px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div 
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${index === currentHero ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="container-fluid text-white text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{slide.title}</h1>
                <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">{slide.subtitle}</p>
                <button className="btn btn-lg btn-primary">
                  {slide.ctaText} <ArrowRight className="ml-2 h-5 w-5 inline" />
                </button>
              </div>
            </div>
          ))}

          {/* Hero navigation dots */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-3 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentHero ? 'bg-white' : 'bg-gray-400 bg-opacity-50'}`}
                onClick={() => setCurrentHero(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Solutions Section */}
        <section id="solutions" className="py-16 bg-gray-50 dark:bg-slate-800 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Logistics Solutions</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                CargoPGM's MCP server provides end-to-end solutions for your entire supply chain
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6 mx-auto">
                  <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Land Transportation</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Optimize road and rail freight with real-time tracking, dynamic routing, and carrier management tools.
                </p>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6 mx-auto">
                  <Ship className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Ocean Freight</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Manage container shipping with vessel tracking, port operations, and documentation handling.
                </p>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6 mx-auto">
                  <Plane className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Air Freight</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Expedite time-sensitive shipments with end-to-end air cargo management and tracking solutions.
                </p>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6 mx-auto">
                  <Warehouse className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Warehouse Management</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Streamline inventory, picking, packing, and shipping operations with our smart warehouse solutions.
                </p>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6 mx-auto">
                  <Globe className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Global Trade Management</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Navigate customs, compliance, and international regulations with our trade management tools.
                </p>
              </div>

              <div className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-6 mx-auto">
                  <ChartBar className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">Analytics & Reporting</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">
                  Transform logistics data into actionable insights with customizable dashboards and reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-primary-700 text-white">
          <div className="container-fluid">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {statisticsData.map((stat, index) => (
                <div key={index} className="">
                  <div className="flex items-center justify-center mb-4">
                    {stat.icon}
                  </div>
                  <h4 className="text-3xl font-bold mb-2">{stat.value}</h4>
                  <p className="text-primary-200">{stat.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Platform Features</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Explore the capabilities of our MCP server for logistics and supply chain management
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Feature navigation */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 theme-transition">
                  <h3 className="text-xl font-semibold mb-4">Platform Capabilities</h3>
                  <ul className="space-y-2">
                    {Object.entries(featuresData).map(([key, feature]) => (
                      <li key={key}>
                        <button
                          className={`w-full text-left p-3 rounded-md flex items-center transition-colors ${selectedFeature === key ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                          onClick={() => setSelectedFeature(key)}
                        >
                          <span className="font-medium">{feature.title}</span>
                          <ArrowRight className={`ml-auto h-5 w-5 transition-transform ${selectedFeature === key ? 'transform rotate-90' : ''}`} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Feature content */}
              <div className="lg:col-span-2">
                <div className="card h-full">
                  <div className="mb-6">
                    {featuresData[selectedFeature as keyof typeof featuresData].icon}
                    <h3 className="text-2xl font-bold mb-2">{featuresData[selectedFeature as keyof typeof featuresData].title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      {featuresData[selectedFeature as keyof typeof featuresData].description}
                    </p>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-4">Performance Metrics</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={featuresData[selectedFeature as keyof typeof featuresData].stats}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3B82F6" name="Percentage" unit="%" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Dashboard Preview */}
        <section className="py-16 bg-gray-50 dark:bg-slate-800 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Performance Dashboard</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Monitor and analyze logistics performance with comprehensive analytics
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="card lg:col-span-2">
                <h3 className="text-xl font-semibold mb-4">Monthly Shipment Volume</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={performanceData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" activeDot={{ r: 8 }} name="Shipments" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h3 className="text-xl font-semibold mb-4">Transport Mode Distribution</h3>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-16 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Hear from businesses that have transformed their logistics operations with CargoPGM
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
                  {testimonialsData.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div className="card text-center p-8">
                        <div className="mb-6">
                          <img 
                            src={testimonial.image} 
                            alt={testimonial.author} 
                            className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-primary-100 dark:border-primary-900"
                          />
                        </div>
                        <blockquote className="text-xl italic mb-4">"{testimonial.quote}"</blockquote>
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-gray-500 dark:text-gray-400">{testimonial.company}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center mt-6 space-x-2">
                {testimonialsData.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-colors ${index === activeTestimonial ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                    onClick={() => setActiveTestimonial(index)}
                    aria-label={`Go to testimonial ${index + 1}`}
                  />
                ))}
              </div>

              <button 
                className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white dark:bg-slate-700 rounded-full p-2 shadow-md text-gray-600 dark:text-gray-200 theme-transition"
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length)}
                aria-label="Previous testimonial"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <button 
                className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white dark:bg-slate-700 rounded-full p-2 shadow-md text-gray-600 dark:text-gray-200 theme-transition"
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonialsData.length)}
                aria-label="Next testimonial"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="container-fluid text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Logistics?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join thousands of businesses that have optimized their supply chains with CargoPGM's MCP server
            </p>
            <button 
              className="btn btn-lg bg-white text-primary-700 hover:bg-gray-100 transition-colors"
              onClick={() => window.location.href = '#contact'}
            >
              Request Demo <ArrowRight className="ml-2 h-5 w-5 inline" />
            </button>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-16 bg-white dark:bg-slate-900 theme-transition">
          <div className="container-fluid">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Have questions about how CargoPGM can help your business? Reach out to our team for a personalized consultation.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                    <span>123 Logistics Way, Global Hub, CA 94103</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 mr-3" />
                    <span>info@cargopgm.com</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400" aria-label="LinkedIn">
                      <Linkedin className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400" aria-label="Twitter">
                      <Twitter className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400" aria-label="YouTube">
                      <Youtube className="h-6 w-6" />
                    </a>
                    <a href="#" className="text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400" aria-label="Instagram">
                      <Instagram className="h-6 w-6" />
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <div className="card">
                  <h3 className="text-xl font-semibold mb-6">Request a Demo</h3>
                  <form className="space-y-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input type="text" id="name" className="input" placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="company" className="form-label">Company</label>
                      <input type="text" id="company" className="input" placeholder="Your company" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input type="email" id="email" className="input" placeholder="your.email@company.com" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input type="tel" id="phone" className="input" placeholder="Your phone number" />
                    </div>
                    <div className="form-group">
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea id="message" rows={4} className="input" placeholder="Tell us about your logistics needs"></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary w-full">Submit Request</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back to top button */}
        <button 
          className="fixed bottom-8 right-8 bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-colors"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-12">
        <div className="container-fluid">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold text-white">CargoPGM</span>
              </div>
              <p className="mb-4">Empowering businesses to connect, control, and optimize global freight at unprecedented speed and intelligence.</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Solutions</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Land Transportation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Ocean Freight</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Air Freight</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Warehouse Management</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Global Trade</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Leadership</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">News</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Webinars</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center">
            <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex gap-4">
              <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary-400 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
