import React, { useState, useEffect } from 'react';
import { Shield, Cpu, Zap, Target, Globe, Users, Mail, Phone, MapPin, ChevronDown, Menu, X, ArrowRight, CheckCircle, Star, Award, TrendingUp, Rocket, Brain } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  imageUrl: string;
}

interface ContactForm {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    subject: '',
    message: ''
  });
  const [newsItems] = useState<NewsItem[]>([
    {
      id: '1',
      title: 'ThorneGuard Unveils Next-Generation Autonomous Defense Platform',
      date: '2024-12-15',
      excerpt: 'Revolutionary AI-powered defense system demonstrates 99.7% accuracy in field trials.',
      category: 'Product Launch'
    },
    {
      id: '2',
      title: 'Partnership with Global Defense Initiative Announced',
      date: '2024-12-10',
      excerpt: 'Strategic collaboration to advance autonomous defense technologies worldwide.',
      category: 'Partnership'
    },
    {
      id: '3',
      title: 'Advanced AI Ethics Framework Implementation',
      date: '2024-12-05',
      excerpt: 'ThorneGuard leads industry in responsible autonomous weapons development.',
      category: 'Innovation'
    }
  ]);

  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Guardian AI Turret',
      category: 'Stationary Defense',
      description: 'Autonomous perimeter defense system with advanced threat detection and neutralization capabilities.',
      features: ['360° surveillance', 'AI-powered threat assessment', 'Precision targeting', 'Remote operation'],
      imageUrl: '/api/placeholder/400/300'
    },
    {
      id: '2',
      name: 'Sentinel Drone Squadron',
      category: 'Aerial Defense',
      description: 'Coordinated autonomous drone swarm for reconnaissance and tactical operations.',
      features: ['Swarm intelligence', 'Real-time coordination', 'Stealth technology', 'Long-range operation'],
      imageUrl: '/api/placeholder/400/300'
    },
    {
      id: '3',
      name: 'Aegis Mobile Platform',
      category: 'Mobile Defense',
      description: 'Self-navigating armored vehicle with integrated defense systems.',
      features: ['Autonomous navigation', 'Adaptive armor', 'Multi-weapon systems', 'Battlefield AI'],
      imageUrl: '/api/placeholder/400/300'
    }
  ]);

  useEffect(() => {
    const savedForm = localStorage.getItem('thorneguard-contact-form');
    if (savedForm) {
      try {
        setContactForm(JSON.parse(savedForm));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('thorneguard-contact-form', JSON.stringify(contactForm));
  }, [contactForm]);

  const handleContactFormChange = (field: keyof ContactForm, value: string) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    alert('Thank you for your inquiry. Our team will contact you within 24 hours.');
    setContactForm({
      name: '',
      email: '',
      company: '',
      subject: '',
      message: ''
    });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-black text-red-500">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-red-900">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-orange-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                ThorneGuard
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <button 
                onClick={() => scrollToSection('home')}
                className={`hover:text-orange-400 transition-colors ${
                  activeSection === 'home' ? 'text-orange-400' : 'text-red-400'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className={`hover:text-orange-400 transition-colors ${
                  activeSection === 'about' ? 'text-orange-400' : 'text-red-400'
                }`}
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('products')}
                className={`hover:text-orange-400 transition-colors ${
                  activeSection === 'products' ? 'text-orange-400' : 'text-red-400'
                }`}
              >
                Products
              </button>
              <button 
                onClick={() => scrollToSection('news')}
                className={`hover:text-orange-400 transition-colors ${
                  activeSection === 'news' ? 'text-orange-400' : 'text-red-400'
                }`}
              >
                News
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className={`hover:text-orange-400 transition-colors ${
                  activeSection === 'contact' ? 'text-orange-400' : 'text-red-400'
                }`}
              >
                Contact
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-red-400 hover:text-orange-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-red-900">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="text-left py-2 text-red-400 hover:text-orange-400 transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="text-left py-2 text-red-400 hover:text-orange-400 transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => scrollToSection('products')}
                  className="text-left py-2 text-red-400 hover:text-orange-400 transition-colors"
                >
                  Products
                </button>
                <button 
                  onClick={() => scrollToSection('news')}
                  className="text-left py-2 text-red-400 hover:text-orange-400 transition-colors"
                >
                  News
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="text-left py-2 text-red-400 hover:text-orange-400 transition-colors"
                >
                  Contact
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-20 min-h-screen flex items-center bg-black">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-red-500">
                  Advanced
                  <span className="block bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Autonomous Defense
                  </span>
                  Systems
                </h1>
                <p className="text-lg sm:text-xl text-red-400 leading-relaxed">
                  ThorneGuard leads the future of military technology with AI-powered autonomous weaponry systems, 
                  delivering unmatched precision and reliability in critical defense scenarios.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => scrollToSection('products')}
                  className="btn bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  Explore Products
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="btn border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black px-8 py-3 rounded-lg font-semibold transition-all"
                >
                  Contact Us
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500">99.7%</div>
                  <div className="text-sm text-red-400">Accuracy Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500">24/7</div>
                  <div className="text-sm text-red-400">Operations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-500">50+</div>
                  <div className="text-sm text-red-400">Countries</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-full flex items-center justify-center">
                <div className="aspect-square w-3/4 bg-gradient-to-br from-red-500/30 to-orange-600/30 rounded-full flex items-center justify-center">
                  <Shield className="h-24 w-24 sm:h-32 sm:w-32 text-orange-500" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-red-600 rounded-full animate-pulse delay-300"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-black">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-red-500">
              Leading the Future of
              <span className="block text-orange-500">Autonomous Defense</span>
            </h2>
            <p className="text-lg text-red-400 max-w-3xl mx-auto">
              With cutting-edge AI and robotics technology, ThorneGuard develops sophisticated autonomous weaponry 
              systems that redefine military capabilities and protect nations worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="card bg-gray-900 border border-red-900 hover:border-orange-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-600/20 rounded-lg">
                  <Brain className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-500">Advanced AI</h3>
              </div>
              <p className="text-red-400">
                Proprietary machine learning algorithms enable real-time threat assessment and decision-making 
                with unparalleled accuracy and speed.
              </p>
            </div>

            <div className="card bg-gray-900 border border-red-900 hover:border-orange-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-600/20 rounded-lg">
                  <Cpu className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-500">Robotics Excellence</h3>
              </div>
              <p className="text-red-400">
                State-of-the-art robotic platforms integrate seamlessly with our AI systems to deliver 
                autonomous operation in any environment.
              </p>
            </div>

            <div className="card bg-gray-900 border border-red-900 hover:border-orange-500 transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-600/20 rounded-lg">
                  <Target className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold text-red-500">Precision Systems</h3>
              </div>
              <p className="text-red-400">
                Our targeting systems achieve sub-millimeter accuracy while maintaining ethical guidelines 
                and minimizing collateral damage.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-red-500">Our Mission</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-red-400">
                    Develop autonomous defense systems that protect military personnel and civilian populations
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-red-400">
                    Maintain the highest ethical standards in autonomous weapons development and deployment
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
                  <p className="text-red-400">
                    Pioneer breakthrough technologies that shape the future of military defense capabilities
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="stat-card bg-gray-900 border border-red-900">
                <div className="stat-title text-red-400">Years of Innovation</div>
                <div className="stat-value text-orange-500">15+</div>
              </div>
              <div className="stat-card bg-gray-900 border border-red-900">
                <div className="stat-title text-red-400">R&D Investment</div>
                <div className="stat-value text-orange-500">$2.5B</div>
              </div>
              <div className="stat-card bg-gray-900 border border-red-900">
                <div className="stat-title text-red-400">Patents Held</div>
                <div className="stat-value text-orange-500">200+</div>
              </div>
              <div className="stat-card bg-gray-900 border border-red-900">
                <div className="stat-title text-red-400">Global Partners</div>
                <div className="stat-value text-orange-500">75+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-black">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-red-500">
              Advanced Defense
              <span className="block text-orange-500">Product Portfolio</span>
            </h2>
            <p className="text-lg text-red-400 max-w-3xl mx-auto">
              Explore our comprehensive range of autonomous defense systems designed for modern military operations.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="card bg-gray-900 border border-red-900 hover:border-orange-500 transition-all hover:scale-105 group">
                <div className="aspect-video bg-gray-800 rounded-lg mb-4 flex items-center justify-center">
                  <Shield className="h-16 w-16 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="badge bg-red-600/20 text-orange-500 text-xs mb-2">
                      {product.category}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-red-500">{product.name}</h3>
                    <p className="text-red-400 text-sm">{product.description}</p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-orange-500">Key Features:</h4>
                    <ul className="space-y-1">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-red-400">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="btn w-full bg-gray-800 hover:bg-red-600 border border-red-900 hover:border-orange-500 text-red-500 hover:text-white transition-all"
                  >
                    Request Information
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Section */}
      <section id="news" className="py-20 bg-black">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-red-500">
              Latest News &
              <span className="block text-orange-500">Updates</span>
            </h2>
            <p className="text-lg text-red-400 max-w-3xl mx-auto">
              Stay informed about ThorneGuard's latest developments, partnerships, and technological breakthroughs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.map((item) => (
              <div key={item.id} className="card bg-gray-900 border border-red-900 hover:border-orange-500 transition-colors group">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge bg-red-600/20 text-orange-500 text-xs">
                        {item.category}
                      </span>
                      <span className="text-xs text-red-400">{item.date}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 text-red-500 group-hover:text-orange-500 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-red-400 text-sm">{item.excerpt}</p>
                  </div>
                  
                  <button className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center gap-1 transition-colors">
                    Read More
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-black">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-red-500">
              Get in
              <span className="block text-orange-500">Touch</span>
            </h2>
            <p className="text-lg text-red-400 max-w-3xl mx-auto">
              Ready to discuss your defense requirements? Contact our team for consultation and custom solutions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-red-500">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg">
                      <MapPin className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-red-500">Headquarters</p>
                      <p className="text-red-400 text-sm">1200 Defense Boulevard, Tech City, TC 90210</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg">
                      <Phone className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-red-500">Phone</p>
                      <p className="text-red-400 text-sm">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-600/20 rounded-lg">
                      <Mail className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-red-500">Email</p>
                      <p className="text-red-400 text-sm">contact@thorneguard.com</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-gray-900 border border-red-900">
                <h4 className="text-lg font-semibold mb-4 text-red-500">Business Hours</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-red-400">Monday - Friday</span>
                    <span className="text-orange-500">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Saturday</span>
                    <span className="text-orange-500">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">Sunday</span>
                    <span className="text-orange-500">Emergency Only</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-red-500">Name *</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => handleContactFormChange('name', e.target.value)}
                    className="input bg-gray-900 border-red-900 text-red-400 focus:border-orange-500 placeholder-red-600"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-red-500">Company</label>
                  <input
                    type="text"
                    value={contactForm.company}
                    onChange={(e) => handleContactFormChange('company', e.target.value)}
                    className="input bg-gray-900 border-red-900 text-red-400 focus:border-orange-500 placeholder-red-600"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label text-red-500">Email *</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => handleContactFormChange('email', e.target.value)}
                  className="input bg-gray-900 border-red-900 text-red-400 focus:border-orange-500 placeholder-red-600"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-red-500">Subject *</label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => handleContactFormChange('subject', e.target.value)}
                  className="input bg-gray-900 border-red-900 text-red-400 focus:border-orange-500 placeholder-red-600"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label text-red-500">Message *</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => handleContactFormChange('message', e.target.value)}
                  rows={5}
                  className="input bg-gray-900 border-red-900 text-red-400 focus:border-orange-500 placeholder-red-600 resize-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn w-full bg-red-600 hover:bg-red-700 text-white py-3 font-semibold transition-all hover:scale-105"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black border-t border-red-900 py-8">
        <div className="container-wide">
          <div className="flex-center">
            <p className="text-red-400 text-sm">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;