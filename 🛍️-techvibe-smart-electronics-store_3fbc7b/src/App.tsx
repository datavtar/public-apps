import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  User, 
  Menu, 
  X, 
  Star, 
  Plus, 
  Minus, 
  Trash2, 
  Filter,
  MessageCircle,
  Send,
  Bot,
  CheckCircle,
  Truck,
  Shield,
  ArrowRight,
  Heart,
  Eye,
  Settings,
  Download,
  Upload,
  Edit,
  ChevronDown
} from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import AdminLogin from './components/AdminLogin';

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  description: string;
  specifications: { [key: string]: string };
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  brand: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customerInfo: {
    name: string;
    email: string;
    address: string;
    phone: string;
  };
  orderDate: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

function App() {
  // Authentication
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Navigation and UI state
  const [currentPage, setCurrentPage] = useState<'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'order-success' | 'admin-dashboard' | 'settings'>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Checkout state
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });

  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! I\'m your TechVibe assistant. I can help you find products, answer questions about specifications, and assist with your shopping experience. What can I help you with today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  // AI Layer state
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // Admin state
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  // Sample products data
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'iPhone 15 Pro Max',
      price: 1199,
      originalPrice: 1299,
      category: 'smartphones',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop',
      description: 'The most advanced iPhone with titanium design, A17 Pro chip, and revolutionary camera system.',
      specifications: {
        'Display': '6.7" Super Retina XDR',
        'Chip': 'A17 Pro',
        'Camera': '48MP Main + 12MP Ultra Wide + 12MP Telephoto',
        'Storage': '256GB',
        'Battery': 'Up to 29 hours video playback'
      },
      rating: 4.8,
      reviews: 2847,
      inStock: true,
      featured: true,
      brand: 'Apple'
    },
    {
      id: '2',
      name: 'MacBook Pro 16"',
      price: 2499,
      category: 'laptops',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      description: 'Supercharged by M3 Pro and M3 Max chips. Built for professionals who push the limits.',
      specifications: {
        'Display': '16.2" Liquid Retina XDR',
        'Chip': 'Apple M3 Pro',
        'Memory': '18GB Unified Memory',
        'Storage': '512GB SSD',
        'Battery': 'Up to 22 hours'
      },
      rating: 4.9,
      reviews: 1243,
      inStock: true,
      featured: true,
      brand: 'Apple'
    },
    {
      id: '3',
      name: 'AirPods Pro (3rd Gen)',
      price: 249,
      originalPrice: 279,
      category: 'audio',
      image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400&h=400&fit=crop',
      description: 'Adaptive Audio, Personalized Spatial Audio, and next-level Active Noise Cancellation.',
      specifications: {
        'Noise Cancellation': 'Active Noise Cancellation',
        'Battery': 'Up to 6 hours listening',
        'Chip': 'H2 chip',
        'Features': 'Adaptive Audio, Spatial Audio',
        'Water Resistance': 'IPX4'
      },
      rating: 4.7,
      reviews: 892,
      inStock: true,
      featured: false,
      brand: 'Apple'
    },
    {
      id: '4',
      name: 'Samsung Galaxy S24 Ultra',
      price: 1299,
      category: 'smartphones',
      image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop',
      description: 'Built with titanium and featuring Galaxy AI, the most intelligent Galaxy smartphone yet.',
      specifications: {
        'Display': '6.8" Dynamic AMOLED 2X',
        'Processor': 'Snapdragon 8 Gen 3',
        'Camera': '200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto',
        'Storage': '256GB',
        'S Pen': 'Included'
      },
      rating: 4.6,
      reviews: 1567,
      inStock: true,
      featured: true,
      brand: 'Samsung'
    },
    {
      id: '5',
      name: 'Dell XPS 13 Plus',
      price: 1199,
      originalPrice: 1399,
      category: 'laptops',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
      description: 'Ultra-thin, premium laptop with stunning InfinityEdge display and powerful performance.',
      specifications: {
        'Display': '13.4" FHD+ InfinityEdge',
        'Processor': 'Intel Core i7-1360P',
        'Memory': '16GB LPDDR5',
        'Storage': '512GB SSD',
        'Graphics': 'Intel Iris Xe'
      },
      rating: 4.5,
      reviews: 743,
      inStock: true,
      featured: false,
      brand: 'Dell'
    },
    {
      id: '6',
      name: 'Sony WH-1000XM5',
      price: 399,
      category: 'audio',
      image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
      description: 'Industry-leading noise canceling with exceptional sound quality and all-day comfort.',
      specifications: {
        'Noise Cancellation': 'Industry-leading Active Noise Cancellation',
        'Battery': 'Up to 30 hours',
        'Quick Charge': '3 min charge = 3 hours playback',
        'Audio': 'Hi-Res Audio, LDAC',
        'Microphones': '8 microphones for clear calls'
      },
      rating: 4.8,
      reviews: 2156,
      inStock: true,
      featured: false,
      brand: 'Sony'
    }
  ]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('techvibe-cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    const savedProducts = localStorage.getItem('techvibe-products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    const savedOrders = localStorage.getItem('techvibe-orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('techvibe-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('techvibe-products', JSON.stringify(products));
  }, [products]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('techvibe-orders', JSON.stringify(orders));
  }, [orders]);

  // Cart functions
  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get categories
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Checkout function
  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cartItems],
      total: getCartTotal(),
      customerInfo: { ...customerInfo },
      orderDate: new Date(),
      status: 'pending'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCartItems([]);
    setCustomerInfo({ name: '', email: '', address: '', phone: '' });
    setCurrentPage('order-success');
  };

  // Chat functions
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    
    // Prepare context for AI
    const storeContext = `You are a helpful customer service assistant for TechVibe Electronics Store. 

Our current products include:
${products.map(p => `- ${p.name} (${p.brand}) - $${p.price} - ${p.description} - In Stock: ${p.inStock ? 'Yes' : 'No'}`).join('\n')}

Store policies:
- Free shipping on orders over $499
- 30-day return policy
- 1-year warranty on all electronics
- Price matching available
- Customer service hours: 9AM-9PM EST

Help the customer with their inquiry about products, specifications, recommendations, store policies, or general shopping assistance. Be friendly, helpful, and knowledgeable about our electronics products.`;

    const prompt = `${chatInput}

${storeContext}`;

    setChatInput('');
    
    // Send to AI
    aiLayerRef.current?.sendToAI(prompt);
  };

  const handleAIResult = (result: string) => {
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: result,
      isUser: false,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, aiMessage]);
  };

  // Admin functions
  const handleProductSubmit = (productData: Partial<Product>) => {
    if (editingProduct) {
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id ? { ...editingProduct, ...productData } : p
      ));
    } else {
      const newProduct: Product = {
        id: Date.now().toString(),
        name: '',
        price: 0,
        category: 'smartphones',
        image: '',
        description: '',
        specifications: {},
        rating: 0,
        reviews: 0,
        inStock: true,
        featured: false,
        brand: '',
        ...productData
      } as Product;
      setProducts(prev => [...prev, newProduct]);
    }
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const exportData = () => {
    const data = {
      products,
      orders,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `techvibe-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.products) setProducts(data.products);
        if (data.orders) setOrders(data.orders);
      } catch (error) {
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    const confirmed = window.confirm('Are you sure you want to clear all data? This cannot be undone.');
    if (confirmed) {
      setProducts([]);
      setOrders([]);
      setCartItems([]);
      localStorage.removeItem('techvibe-products');
      localStorage.removeItem('techvibe-orders');
      localStorage.removeItem('techvibe-cart');
    }
  };

  // Render functions
  const renderHeader = () => (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-50 theme-transition">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#548b99] to-[#95c7c3] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">TV</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">TechVibe</h1>
              <p className="text-xs text-[#548B99]">Electronics Store</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setCurrentPage('home')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'home' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage('products')}
              className={`text-sm font-medium transition-colors ${
                currentPage === 'products' 
                  ? 'text-[#548B99]' 
                  : 'text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99]'
              }`}
            >
              Products
            </button>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#548B99] focus:border-transparent bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <button
              onClick={() => setShowCart(true)}
              className="relative p-2 text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99] transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#C1436D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={() => setCurrentPage('settings')}
              className="p-2 text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99] transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-[#424B54] dark:text-[#F7FAFC]"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-slate-700 py-4">
            <div className="flex flex-col gap-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#548B99] focus:border-transparent bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* Mobile Navigation */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCurrentPage('home');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99] py-2"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    setCurrentPage('products');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-left text-[#424B54] dark:text-[#F7FAFC] hover:text-[#548B99] py-2"
                >
                  Products
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  const renderHomePage = () => (
    <div id="welcome_fallback" className="theme-transition">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#e7f7f7] via-[#95c7c3] to-[#548b99] dark:from-[#548b99] dark:via-[#95C7C3] dark:to-[#e7f7f7] py-20">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                Discover the Latest in
                <span className="block text-[#548B99] dark:text-[#1F2E3D]">Technology</span>
              </h1>
              <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] mb-8 leading-relaxed">
                From cutting-edge smartphones to powerful laptops and premium audio gear - find everything you need to stay connected and productive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setCurrentPage('products')}
                  className="btn bg-[#1F2E3D] text-white hover:bg-[#424B54] flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
                >
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    const featuredSection = document.getElementById('featured-products');
                    featuredSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="btn bg-white/20 backdrop-blur-sm text-[#1F2E3D] dark:text-white border-2 border-white/30 hover:bg-white/30 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                >
                  View Featured
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
                  alt="Latest Technology"
                  className="rounded-3xl shadow-2xl w-full"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#C1436D]/20 to-[#A350A3]/20 rounded-3xl transform rotate-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="container-wide">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#14B8A6] to-[#2DD4BF] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Free Shipping</h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC]">Free shipping on all orders over $499. Fast and reliable delivery nationwide.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#3B82F6] to-[#93C5FD] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">1-Year Warranty</h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC]">Comprehensive warranty coverage on all electronics for your peace of mind.</p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F97316] to-[#FB923C] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">30-Day Returns</h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC]">Not satisfied? Return any item within 30 days for a full refund.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured-products" className="py-20 bg-[#F7FAFC] dark:bg-[#2D3748]">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Featured Products</h2>
            <p className="text-xl text-[#548B99] max-w-2xl mx-auto">Discover our hand-picked selection of the latest and greatest tech products</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.filter(p => p.featured).map(product => (
              <div
                key={product.id}
                className="card bg-white dark:bg-slate-800 rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.originalPrice && (
                    <div className="absolute top-4 left-4 bg-[#C1436D] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Save ${product.originalPrice - product.price}
                    </div>
                  )}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">({product.reviews})</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2 group-hover:text-[#548B99] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-lg text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setCurrentPage('product-detail');
                      }}
                      className="flex-1 btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 btn bg-[#C1436D] text-white hover:bg-[#A350A3] rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4" />
                      Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => setCurrentPage('products')}
              className="btn bg-[#548B99] text-white hover:bg-[#1F2E3D] px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 hover:scale-105"
            >
              View All Products
            </button>
          </div>
        </div>
      </section>
    </div>
  );

  const renderProductsPage = () => (
    <div id="generation_issue_fallback" className="py-8 theme-transition">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Filters</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
              
              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Categories */}
                <div>
                  <h4 className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <label key={category} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="category"
                          value={category}
                          checked={selectedCategory === category}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="text-[#548B99] focus:ring-[#548B99]"
                        />
                        <span className="text-[#424B54] dark:text-[#F7FAFC] capitalize">
                          {category === 'all' ? 'All Products' : category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-3">Brands</h4>
                  <div className="space-y-2">
                    {Array.from(new Set(products.map(p => p.brand))).map(brand => (
                      <label key={brand} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="text-[#548B99] focus:ring-[#548B99]"
                        />
                        <span className="text-[#424B54] dark:text-[#F7FAFC]">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                {selectedCategory === 'all' ? 'All Products' : `${selectedCategory.charAt(0).toUpperCase()}${selectedCategory.slice(1)}`}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-[#424B54] dark:text-[#F7FAFC]">
                  {filteredProducts.length} products found
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="card bg-white dark:bg-slate-800 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.originalPrice && (
                      <div className="absolute top-3 left-3 bg-[#C1436D] text-white px-2 py-1 rounded-lg text-xs font-semibold">
                        ${product.originalPrice - product.price} OFF
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">({product.reviews})</span>
                    </div>
                    <h3 className="font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2 text-sm group-hover:text-[#548B99] transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                        ${product.price}
                      </span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setCurrentPage('product-detail');
                        }}
                        className="flex-1 btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-lg text-sm py-2 transition-all duration-300"
                      >
                        View
                      </button>
                      <button
                        onClick={() => addToCart(product)}
                        className="flex-1 btn bg-[#C1436D] text-white hover:bg-[#A350A3] rounded-lg text-sm py-2 transition-all duration-300"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">No products found</h3>
                <p className="text-[#424B54] dark:text-[#F7FAFC] mb-6">Try adjusting your search or filter criteria</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-full px-6"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;

    return (
      <div className="py-8 theme-transition">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Product Image */}
            <div className="relative">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-full rounded-3xl shadow-2xl"
              />
              {selectedProduct.originalPrice && (
                <div className="absolute top-6 left-6 bg-[#C1436D] text-white px-4 py-2 rounded-full text-sm font-semibold">
                  Save ${selectedProduct.originalPrice - selectedProduct.price}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-[#548B99] font-semibold uppercase tracking-wider">
                    {selectedProduct.brand}
                  </span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {selectedProduct.category}
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">
                  {selectedProduct.name}
                </h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(selectedProduct.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[#424B54] dark:text-[#F7FAFC]">
                    {selectedProduct.rating} ({selectedProduct.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">
                  ${selectedProduct.price}
                </span>
                {selectedProduct.originalPrice && (
                  <span className="text-2xl text-gray-500 line-through">
                    ${selectedProduct.originalPrice}
                  </span>
                )}
              </div>

              <p className="text-lg text-[#424B54] dark:text-[#F7FAFC] leading-relaxed">
                {selectedProduct.description}
              </p>

              {/* Specifications */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Specifications</h3>
                <div className="grid gap-3">
                  {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-slate-700">
                      <span className="font-medium text-[#424B54] dark:text-[#F7FAFC]">{key}:</span>
                      <span className="text-[#1F2E3D] dark:text-[#e7f7f7]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => addToCart(selectedProduct)}
                  className="flex-1 btn bg-[#C1436D] text-white hover:bg-[#A350A3] rounded-2xl py-4 text-lg font-semibold flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                >
                  <ShoppingCart className="w-6 h-6" />
                  Add to Cart
                </button>
                <button className="btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-2xl px-6 py-4 transition-all duration-300">
                  <Heart className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#424B54] dark:text-[#F7FAFC]">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  <span>Free shipping on orders over $499</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>1-year warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => (
    <div className={`fixed inset-0 bg-black/50 z-50 ${showCart ? 'block' : 'hidden'}`}>
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-slate-800 shadow-2xl overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Shopping Cart</h2>
            <button
              onClick={() => setShowCart(false)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] mb-2">Your cart is empty</h3>
              <p className="text-[#424B54] dark:text-[#F7FAFC] mb-6">Add some products to get started</p>
              <button
                onClick={() => {
                  setShowCart(false);
                  setCurrentPage('products');
                }}
                className="btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-full px-6"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {cartItems.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-2xl">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7] text-sm mb-1">
                        {item.product.name}
                      </h4>
                      <p className="text-[#548B99] font-bold">${item.product.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-500"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-[#1F2E3D] dark:text-[#e7f7f7]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-500"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Total:</span>
                  <span className="text-2xl font-bold text-[#548B99]">${getCartTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setCurrentPage('checkout');
                  }}
                  className="w-full btn bg-[#C1436D] text-white hover:bg-[#A350A3] rounded-2xl py-4 text-lg font-semibold transition-all duration-300"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderCheckout = () => (
    <div className="py-8 theme-transition">
      <div className="container-narrow">
        <h1 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-8 text-center">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Customer Information</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="input w-full rounded-xl"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="input w-full rounded-xl"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  className="input w-full rounded-xl"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="form-label">Shipping Address</label>
                <textarea
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  className="input w-full rounded-xl h-24 resize-none"
                  placeholder="Enter your full address"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.product.id} className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7] text-sm">
                      {item.product.name}
                    </h4>
                    <p className="text-[#424B54] dark:text-[#F7FAFC] text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#548B99]">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#424B54] dark:text-[#F7FAFC]">Subtotal:</span>
                <span className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#424B54] dark:text-[#F7FAFC]">Shipping:</span>
                <span className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">
                  {getCartTotal() >= 499 ? 'Free' : '$19.99'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-slate-700 pt-2">
                <span className="text-[#1F2E3D] dark:text-[#e7f7f7]">Total:</span>
                <span className="text-[#548B99]">
                  ${(getCartTotal() + (getCartTotal() >= 499 ? 0 : 19.99)).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={!customerInfo.name || !customerInfo.email || !customerInfo.address || !customerInfo.phone}
              className="w-full btn bg-[#C1436D] text-white hover:bg-[#A350A3] disabled:bg-gray-300 disabled:cursor-not-allowed rounded-2xl py-4 text-lg font-semibold mt-6 transition-all duration-300"
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrderSuccess = () => (
    <div className="py-20 theme-transition">
      <div className="container-narrow text-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-4xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-4">Order Placed Successfully!</h1>
        <p className="text-xl text-[#424B54] dark:text-[#F7FAFC] mb-8">
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setCurrentPage('home')}
            className="btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-full px-8 py-3"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => setCurrentPage('products')}
            className="btn bg-white border-2 border-[#548B99] text-[#548B99] hover:bg-[#548B99] hover:text-white rounded-full px-8 py-3"
          >
            View Products
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="py-8 theme-transition">
      <div className="container-narrow">
        <h1 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-8">Settings</h1>
        
        <div className="space-y-6">
          {currentUser && (
            <>
              {/* Data Management */}
              <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Data Management</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={exportData}
                    className="btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export Data
                  </button>
                  <label className="btn bg-[#3B82F6] text-white hover:bg-[#2563EB] rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-5 h-5" />
                    Import Data
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
                <p className="text-[#424B54] dark:text-[#F7FAFC] mb-4">
                  This action will permanently delete all products, orders, and cart data. This cannot be undone.
                </p>
                <button
                  onClick={clearAllData}
                  className="btn bg-red-600 text-white hover:bg-red-700 rounded-xl flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear All Data
                </button>
              </div>
            </>
          )}

          {/* Store Information */}
          <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Store Information</h2>
            <div className="space-y-4 text-[#424B54] dark:text-[#F7FAFC]">
              <div>
                <strong className="text-[#1F2E3D] dark:text-[#e7f7f7]">Store Name:</strong> TechVibe Electronics Store
              </div>
              <div>
                <strong className="text-[#1F2E3D] dark:text-[#e7f7f7]">Email:</strong> support@techvibe.com
              </div>
              <div>
                <strong className="text-[#1F2E3D] dark:text-[#e7f7f7]">Phone:</strong> 1-800-TECHVIBE
              </div>
              <div>
                <strong className="text-[#1F2E3D] dark:text-[#e7f7f7]">Address:</strong> 123 Tech Street, Silicon Valley, CA 94025
              </div>
              <div>
                <strong className="text-[#1F2E3D] dark:text-[#e7f7f7]">Business Hours:</strong> Monday - Friday: 9AM - 9PM EST
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="py-8 theme-transition">
      <div className="container-wide">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Admin Dashboard</h1>
          <button
            onClick={() => setCurrentUser(null)}
            className="btn bg-red-600 text-white hover:bg-red-700 rounded-xl"
          >
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="stat-card bg-gradient-to-br from-[#3B82F6] to-[#93C5FD] text-white rounded-2xl">
            <div className="stat-title text-blue-100">Total Products</div>
            <div className="stat-value">{products.length}</div>
          </div>
          <div className="stat-card bg-gradient-to-br from-[#14B8A6] to-[#2DD4BF] text-white rounded-2xl">
            <div className="stat-title text-teal-100">Total Orders</div>
            <div className="stat-value">{orders.length}</div>
          </div>
          <div className="stat-card bg-gradient-to-br from-[#F97316] to-[#FB923C] text-white rounded-2xl">
            <div className="stat-title text-orange-100">Revenue</div>
            <div className="stat-value">${orders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}</div>
          </div>
          <div className="stat-card bg-gradient-to-br from-[#C1436D] to-[#A350A3] text-white rounded-2xl">
            <div className="stat-title text-pink-100">Avg Order</div>
            <div className="stat-value">
              ${orders.length > 0 ? (orders.reduce((sum, order) => sum + order.total, 0) / orders.length).toFixed(0) : '0'}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Products Management */}
          <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7]">Products</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-xl flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {products.map(product => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7]">{product.name}</h4>
                    <p className="text-[#548B99]">${product.price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setShowProductForm(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders Management */}
          <div className="card bg-white dark:bg-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">Recent Orders</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {orders.slice(0, 10).map(order => (
                <div key={order.id} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1F2E3D] dark:text-[#e7f7f7]">Order #{order.id}</span>
                    <span className="text-[#548B99] font-bold">${order.total.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-[#424B54] dark:text-[#F7FAFC]">
                    <p>{order.customerInfo.name}</p>
                    <p>{new Date(order.orderDate).toLocaleDateString()}</p>
                    <p className="capitalize">{order.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-[#1F2E3D] dark:text-[#e7f7f7] mb-6">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const productData = {
                    name: formData.get('name') as string,
                    price: Number(formData.get('price')),
                    originalPrice: formData.get('originalPrice') ? Number(formData.get('originalPrice')) : undefined,
                    category: formData.get('category') as string,
                    brand: formData.get('brand') as string,
                    description: formData.get('description') as string,
                    image: formData.get('image') as string,
                    inStock: formData.get('inStock') === 'on',
                    featured: formData.get('featured') === 'on',
                    rating: Number(formData.get('rating')) || 0,
                    reviews: Number(formData.get('reviews')) || 0,
                    specifications: {}
                  };
                  handleProductSubmit(productData);
                }}
                className="space-y-4"
              >
                <input
                  name="name"
                  type="text"
                  placeholder="Product Name"
                  defaultValue={editingProduct?.name || ''}
                  className="input w-full rounded-xl"
                  required
                />
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  defaultValue={editingProduct?.price || ''}
                  className="input w-full rounded-xl"
                  required
                />
                <input
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  placeholder="Original Price (Optional)"
                  defaultValue={editingProduct?.originalPrice || ''}
                  className="input w-full rounded-xl"
                />
                <select
                  name="category"
                  defaultValue={editingProduct?.category || ''}
                  className="input w-full rounded-xl"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="smartphones">Smartphones</option>
                  <option value="laptops">Laptops</option>
                  <option value="audio">Audio</option>
                  <option value="accessories">Accessories</option>
                </select>
                <input
                  name="brand"
                  type="text"
                  placeholder="Brand"
                  defaultValue={editingProduct?.brand || ''}
                  className="input w-full rounded-xl"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Description"
                  defaultValue={editingProduct?.description || ''}
                  className="input w-full rounded-xl h-24 resize-none"
                  required
                />
                <input
                  name="image"
                  type="url"
                  placeholder="Image URL"
                  defaultValue={editingProduct?.image || ''}
                  className="input w-full rounded-xl"
                  required
                />
                <div className="flex gap-4">
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    max="5"
                    placeholder="Rating"
                    defaultValue={editingProduct?.rating || ''}
                    className="input flex-1 rounded-xl"
                  />
                  <input
                    name="reviews"
                    type="number"
                    placeholder="Reviews Count"
                    defaultValue={editingProduct?.reviews || ''}
                    className="input flex-1 rounded-xl"
                  />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      name="inStock"
                      type="checkbox"
                      defaultChecked={editingProduct?.inStock !== false}
                      className="rounded"
                    />
                    <span className="text-[#424B54] dark:text-[#F7FAFC]">In Stock</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      name="featured"
                      type="checkbox"
                      defaultChecked={editingProduct?.featured || false}
                      className="rounded"
                    />
                    <span className="text-[#424B54] dark:text-[#F7FAFC]">Featured</span>
                  </label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 btn bg-gray-500 text-white hover:bg-gray-600 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn bg-[#548B99] text-white hover:bg-[#1F2E3D] rounded-xl"
                  >
                    {editingProduct ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderChatbot = () => (
    <div className={`fixed bottom-6 right-6 z-50 ${isChatOpen ? 'w-96 h-[500px]' : 'w-auto h-auto'}`}>
      {isChatOpen ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 flex flex-col h-full">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#548B99] to-[#95c7c3] rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-[#1F2E3D] dark:text-[#e7f7f7]">TechVibe Assistant</h3>
                <p className="text-xs text-[#548B99]">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#548B99] to-[#95c7c3] rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    message.isUser
                      ? 'bg-[#548B99] text-white'
                      : 'bg-gray-100 dark:bg-slate-700 text-[#1F2E3D] dark:text-[#e7f7f7]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                </div>
                {message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#C1436D] to-[#A350A3] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {aiLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-br from-[#548B99] to-[#95c7c3] rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-2xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#548B99] focus:border-transparent bg-white dark:bg-slate-700 dark:text-white text-sm"
                disabled={aiLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || aiLoading}
                className="p-2 bg-[#548B99] text-white rounded-xl hover:bg-[#1F2E3D] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-[#548B99] to-[#95c7c3] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
    </div>
  );

  const renderFooter = () => (
    <footer className="bg-[#1F2E3D] text-white py-12 mt-20">
      <div className="container-wide">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-[#548b99] to-[#95c7c3] rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">TV</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">TechVibe</h3>
                <p className="text-xs text-[#95c7c3]">Electronics Store</p>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Your trusted destination for the latest in consumer electronics and technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => setCurrentPage('home')} className="hover:text-[#95c7c3] transition-colors">Home</button></li>
              <li><button onClick={() => setCurrentPage('products')} className="hover:text-[#95c7c3] transition-colors">Products</button></li>
              <li><button onClick={() => setCurrentPage('settings')} className="hover:text-[#95c7c3] transition-colors">Settings</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li><button onClick={() => { setSelectedCategory('smartphones'); setCurrentPage('products'); }} className="hover:text-[#95c7c3] transition-colors">Smartphones</button></li>
              <li><button onClick={() => { setSelectedCategory('laptops'); setCurrentPage('products'); }} className="hover:text-[#95c7c3] transition-colors">Laptops</button></li>
              <li><button onClick={() => { setSelectedCategory('audio'); setCurrentPage('products'); }} className="hover:text-[#95c7c3] transition-colors">Audio</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: support@techvibe.com</li>
              <li>Phone: 1-800-TECHVIBE</li>
              <li>Hours: 9AM-9PM EST</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
          <AdminLogin linkText="Admin Login" />
        </div>
      </div>
    </footer>
  );

  // Handle Escape key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCart) setShowCart(false);
        if (isChatOpen) setIsChatOpen(false);
        if (showProductForm) {
          setShowProductForm(false);
          setEditingProduct(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showCart, isChatOpen, showProductForm]);

  // Check for admin user
  useEffect(() => {
    const adminUser = localStorage.getItem('currentUser');
    if (adminUser) {
      setCurrentUser(JSON.parse(adminUser));
      setCurrentPage('admin-dashboard');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F7FAFC] dark:bg-[#2D3748] theme-transition">
      {renderHeader()}
      
      <main>
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'products' && renderProductsPage()}
        {currentPage === 'product-detail' && renderProductDetail()}
        {currentPage === 'cart' && renderCart()}
        {currentPage === 'checkout' && renderCheckout()}
        {currentPage === 'order-success' && renderOrderSuccess()}
        {currentPage === 'settings' && renderSettings()}
        {currentPage === 'admin-dashboard' && currentUser && renderAdminDashboard()}
      </main>

      {renderFooter()}
      {renderCart()}
      {renderChatbot()}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={handleAIResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
    </div>
  );
}

export default App;