import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Star, 
  Coffee, 
  Leaf, 
  Award, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Settings,
  Trash2,
  Plus,
  Edit,
  Download,
  Upload,
  X,
  Check,
  MessageCircle,
  Send,
  Bot,
  User as UserIcon,
  ChevronDown,
  Filter,
  Heart,
  Truck,
  Shield,
  Clock
} from 'lucide-react';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import AdminLogin from './components/AdminLogin';
import { useAuth } from './contexts/authContext';
import styles from './styles/styles.module.css';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'beans' | 'equipment' | 'accessories';
  origin?: string;
  roast?: 'light' | 'medium' | 'dark';
  description: string;
  rating: number;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  location: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // Navigation state
  const [activeSection, setActiveSection] = useState<string>('home');
  
  // Product and cart state
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRoast, setSelectedRoast] = useState<string>('all');
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  
  // Settings state
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'BrewMaster Coffee Co.',
    storeDescription: 'Premium coffee beans and brewing equipment',
    contactEmail: 'hello@brewmaster.com',
    contactPhone: '+1 (555) 123-4567',
    address: '123 Coffee Street, Bean City, BC 12345'
  });
  
  // Chat state
  const [showChat, setShowChat] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [isAILoading, setIsAILoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any>(null);
  
  // Admin state
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState<boolean>(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  // Initialize data
  useEffect(() => {
    loadFromStorage();
    initializeDefaultData();
  }, []);

  const loadFromStorage = () => {
    try {
      const savedProducts = localStorage.getItem('brewmaster_products');
      const savedCart = localStorage.getItem('brewmaster_cart');
      const savedTestimonials = localStorage.getItem('brewmaster_testimonials');
      const savedSettings = localStorage.getItem('brewmaster_settings');
      const savedMessages = localStorage.getItem('brewmaster_chat');

      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      if (savedTestimonials) {
        setTestimonials(JSON.parse(savedTestimonials));
      }
      if (savedSettings) {
        setStoreSettings(JSON.parse(savedSettings));
      }
      if (savedMessages) {
        setChatMessages(JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    }
  };

  const initializeDefaultData = () => {
    const defaultProducts: Product[] = [
      {
        id: '1',
        name: 'Ethiopian Yirgacheffe',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop',
        category: 'beans',
        origin: 'Ethiopia',
        roast: 'light',
        description: 'Bright and floral with citrus notes',
        rating: 4.8,
        inStock: true
      },
      {
        id: '2',
        name: 'Colombian Supremo',
        price: 22.99,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop',
        category: 'beans',
        origin: 'Colombia',
        roast: 'medium',
        description: 'Well-balanced with chocolate undertones',
        rating: 4.6,
        inStock: true
      },
      {
        id: '3',
        name: 'French Roast Blend',
        price: 19.99,
        image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop',
        category: 'beans',
        origin: 'Blend',
        roast: 'dark',
        description: 'Bold and smoky with intense flavor',
        rating: 4.4,
        inStock: true
      },
      {
        id: '4',
        name: 'Premium Pour Over Kit',
        price: 89.99,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
        category: 'equipment',
        description: 'Complete pour-over brewing setup',
        rating: 4.9,
        inStock: true
      },
      {
        id: '5',
        name: 'Burr Coffee Grinder',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
        category: 'equipment',
        description: 'Precision grinding for perfect extraction',
        rating: 4.7,
        inStock: true
      },
      {
        id: '6',
        name: 'Ceramic Coffee Mugs Set',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
        category: 'accessories',
        description: 'Handcrafted ceramic mugs (set of 4)',
        rating: 4.5,
        inStock: true
      }
    ];

    const defaultTestimonials: Testimonial[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        text: 'The Ethiopian Yirgacheffe is absolutely amazing! The floral notes are incredible.',
        rating: 5,
        location: 'San Francisco, CA'
      },
      {
        id: '2',
        name: 'Mike Chen',
        text: 'Best coffee shop online! Fast shipping and amazing quality.',
        rating: 5,
        location: 'Seattle, WA'
      },
      {
        id: '3',
        name: 'Emma Davis',
        text: 'The pour-over kit changed my morning routine completely. Highly recommended!',
        rating: 5,
        location: 'Portland, OR'
      }
    ];

    if (!localStorage.getItem('brewmaster_products')) {
      setProducts(defaultProducts);
      localStorage.setItem('brewmaster_products', JSON.stringify(defaultProducts));
    }

    if (!localStorage.getItem('brewmaster_testimonials')) {
      setTestimonials(defaultTestimonials);
      localStorage.setItem('brewmaster_testimonials', JSON.stringify(defaultTestimonials));
    }

    if (!localStorage.getItem('brewmaster_settings')) {
      localStorage.setItem('brewmaster_settings', JSON.stringify(storeSettings));
    }
  };

  // Save to storage
  useEffect(() => {
    localStorage.setItem('brewmaster_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('brewmaster_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('brewmaster_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  useEffect(() => {
    localStorage.setItem('brewmaster_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('brewmaster_chat', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Filtered products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesRoast = selectedRoast === 'all' || product.roast === selectedRoast;
    
    return matchesSearch && matchesCategory && matchesRoast;
  });

  // Cart functions
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Product management
  const handleProductSubmit = (formData: FormData) => {
    const productData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      image: formData.get('image') as string,
      category: formData.get('category') as 'beans' | 'equipment' | 'accessories',
      origin: formData.get('origin') as string || undefined,
      roast: formData.get('roast') as 'light' | 'medium' | 'dark' || undefined,
      description: formData.get('description') as string,
      rating: parseFloat(formData.get('rating') as string) || 4.0,
      inStock: formData.get('inStock') === 'true'
    };

    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p
      ));
    } else {
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString()
      };
      setProducts([...products, newProduct]);
    }

    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (productId: string) => {
    setConfirmMessage('Are you sure you want to delete this product?');
    setConfirmAction(() => () => {
      setProducts(products.filter(p => p.id !== productId));
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // Testimonial management
  const handleTestimonialSubmit = (formData: FormData) => {
    const testimonialData = {
      name: formData.get('name') as string,
      text: formData.get('text') as string,
      rating: parseInt(formData.get('rating') as string),
      location: formData.get('location') as string
    };

    if (editingTestimonial) {
      setTestimonials(testimonials.map(t => 
        t.id === editingTestimonial.id ? { ...testimonialData, id: editingTestimonial.id } : t
      ));
    } else {
      const newTestimonial: Testimonial = {
        ...testimonialData,
        id: Date.now().toString()
      };
      setTestimonials([...testimonials, newTestimonial]);
    }

    setShowTestimonialForm(false);
    setEditingTestimonial(null);
  };

  const handleDeleteTestimonial = (testimonialId: string) => {
    setConfirmMessage('Are you sure you want to delete this testimonial?');
    setConfirmAction(() => () => {
      setTestimonials(testimonials.filter(t => t.id !== testimonialId));
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // Chat functions
  const handleSendMessage = () => {
    if (!userMessage.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    
    const coffeeContext = `You are a knowledgeable coffee expert and customer service representative for BrewMaster Coffee Co., a premium coffee store. 

Available products include:
${products.map(p => `- ${p.name}: $${p.price} (${p.category}${p.origin ? `, from ${p.origin}` : ''}${p.roast ? `, ${p.roast} roast` : ''}) - ${p.description}`).join('\n')}

Current store settings:
- Store: ${storeSettings.storeName}
- Email: ${storeSettings.contactEmail}
- Phone: ${storeSettings.contactPhone}
- Address: ${storeSettings.address}

Help customers with:
- Product recommendations based on taste preferences
- Brewing techniques and coffee preparation advice
- Information about coffee origins and roasting
- Order assistance and product details
- General customer support

Be friendly, knowledgeable, and helpful. If customers ask about specific products, provide detailed information. If they need brewing advice, offer step-by-step guidance.

Customer message: ${userMessage}`;

    setUserMessage('');
    
    aiLayerRef.current?.sendToAI(coffeeContext);
  };

  const handleAIResult = (result: string) => {
    const botMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      type: 'bot',
      content: result,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, botMessage]);
  };

  // Data management
  const downloadData = () => {
    const data = {
      products,
      testimonials,
      settings: storeSettings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brewmaster-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    setConfirmMessage('Are you sure you want to delete all data? This action cannot be undone.');
    setConfirmAction(() => () => {
      localStorage.removeItem('brewmaster_products');
      localStorage.removeItem('brewmaster_cart');
      localStorage.removeItem('brewmaster_testimonials');
      localStorage.removeItem('brewmaster_settings');
      localStorage.removeItem('brewmaster_chat');
      
      setProducts([]);
      setCart([]);
      setTestimonials([]);
      setChatMessages([]);
      setStoreSettings({
        storeName: 'BrewMaster Coffee Co.',
        storeDescription: 'Premium coffee beans and brewing equipment',
        contactEmail: 'hello@brewmaster.com',
        contactPhone: '+1 (555) 123-4567',
        address: '123 Coffee Street, Bean City, BC 12345'
      });
      
      setShowConfirmDialog(false);
      initializeDefaultData();
    });
    setShowConfirmDialog(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const renderHome = () => (
    <div id="welcome_fallback" className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1920&h=1080&fit=crop"
            alt="Coffee beans background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            {storeSettings.storeName}
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            {storeSettings.storeDescription}
          </p>
          <button
            onClick={() => setActiveSection('products')}
            className="btn-responsive bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Shop Premium Coffee
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
            Why Choose BrewMaster?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Premium Quality</h3>
              <p className="text-gray-600 dark:text-slate-300">
                Sourced directly from the world's finest coffee regions, ensuring exceptional quality in every bean.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Expert Curation</h3>
              <p className="text-gray-600 dark:text-slate-300">
                Hand-selected by our coffee experts who travel the world to find the perfect beans for our customers.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-amber-100 dark:bg-amber-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-slate-300">
                Fresh coffee delivered to your door within 24-48 hours, ensuring peak freshness and flavor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const renderProducts = () => (
    <div id="products-section" className="min-h-screen bg-gray-50 dark:bg-slate-900 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          Our Premium Collection
        </h2>
        
        {/* Filters */}
        <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-64"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input w-40"
            >
              <option value="all">All Categories</option>
              <option value="beans">Coffee Beans</option>
              <option value="equipment">Equipment</option>
              <option value="accessories">Accessories</option>
            </select>
            
            <select
              value={selectedRoast}
              onChange={(e) => setSelectedRoast(e.target.value)}
              className="input w-32"
            >
              <option value="all">All Roasts</option>
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                    {product.name}
                  </h3>
                  <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer transition-colors" />
                </div>
                
                {product.origin && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">
                    Origin: {product.origin}
                  </p>
                )}
                
                {product.roast && (
                  <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">
                    {product.roast.charAt(0).toUpperCase() + product.roast.slice(1)} Roast
                  </p>
                )}
                
                <p className="text-gray-600 dark:text-slate-300 mb-4">
                  {product.description}
                </p>
                
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderStars(Math.floor(product.rating))}
                  </div>
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    {product.rating}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-amber-600">
                    ${product.price}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!product.inStock}
                    className={`btn px-6 py-2 rounded-full transition-all duration-300 ${
                      product.inStock
                        ? 'btn-primary hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Coffee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-slate-400">
              No products found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCart = () => (
    <div id="cart-section" className="min-h-screen bg-gray-50 dark:bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          Shopping Cart
        </h2>
        
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-slate-400 mb-6">
              Your cart is empty
            </p>
            <button
              onClick={() => setActiveSection('products')}
              className="btn btn-primary"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg flex items-center space-x-6"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 dark:text-slate-300">
                    ${item.price} each
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-semibold text-gray-800 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                  >
                    +
                  </button>
                </div>
                
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-800 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm mt-1"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            
            {/* Cart Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center text-xl font-semibold text-gray-800 dark:text-white mb-4">
                <span>Total: ${cartTotal.toFixed(2)}</span>
                <span>({cartItemCount} items)</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                  <Truck className="w-4 h-4 mr-2" />
                  Free shipping on orders over $50
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure checkout
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 mr-2" />
                  Delivery in 24-48 hours
                </div>
              </div>
              
              <button className="w-full mt-6 btn btn-primary py-3 text-lg">
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div id="about-section" className="min-h-screen bg-white dark:bg-slate-800 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
          About BrewMaster
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-white">
              Our Story
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
              Founded in 2015, BrewMaster Coffee Co. began as a passion project by coffee enthusiasts 
              who traveled the world in search of the perfect cup. What started as a small roastery 
              has grown into a premium coffee destination trusted by thousands of coffee lovers.
            </p>
            <p className="text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
              We work directly with farmers and cooperatives to ensure fair trade practices and 
              sustainable farming methods. Every bean is carefully selected, roasted in small batches, 
              and delivered fresh to preserve the unique characteristics of each origin.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">10,000+</div>
                <div className="text-gray-600 dark:text-slate-300">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-amber-600 mb-2">25+</div>
                <div className="text-gray-600 dark:text-slate-300">Coffee Origins</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&h=400&fit=crop"
              alt="Coffee roasting process"
              className="rounded-2xl shadow-lg w-full"
            />
          </div>
        </div>
        
        {/* Testimonials */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            What Our Customers Say
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 dark:bg-slate-700 rounded-xl p-6 shadow-lg"
              >
                <div className="flex mb-4">
                  {renderStars(testimonial.rating)}
                </div>
                <p className="text-gray-600 dark:text-slate-300 mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {testimonial.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div id="contact-section" className="min-h-screen bg-gray-50 dark:bg-slate-900 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-white">
          Contact Us
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Visit Our Store</h3>
                <p className="text-gray-600 dark:text-slate-300">{storeSettings.address}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Call Us</h3>
                <p className="text-gray-600 dark:text-slate-300">{storeSettings.contactPhone}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Email Us</h3>
                <p className="text-gray-600 dark:text-slate-300">{storeSettings.contactEmail}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Store Hours</h3>
              <div className="space-y-2 text-gray-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>7:00 AM - 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>8:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
              Send us a Message
            </h3>
            
            <form className="space-y-6">
              <div>
                <label className="form-label">Name</label>
                <input type="text" className="input" placeholder="Your name" />
              </div>
              
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="input" placeholder="your@email.com" />
              </div>
              
              <div>
                <label className="form-label">Subject</label>
                <input type="text" className="input" placeholder="How can we help?" />
              </div>
              
              <div>
                <label className="form-label">Message</label>
                <textarea
                  rows={4}
                  className="input resize-none"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>
              
              <button type="submit" className="w-full btn btn-primary">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-20 flex items-center justify-center">
          <div className="text-center">
            <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-slate-400">
              Admin access required to view settings.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div id="settings-section" className="min-h-screen bg-gray-50 dark:bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
            Admin Settings
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Store Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
                Store Information
              </h3>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  setStoreSettings({
                    storeName: formData.get('storeName') as string,
                    storeDescription: formData.get('storeDescription') as string,
                    contactEmail: formData.get('contactEmail') as string,
                    contactPhone: formData.get('contactPhone') as string,
                    address: formData.get('address') as string
                  });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="form-label">Store Name</label>
                  <input
                    name="storeName"
                    type="text"
                    defaultValue={storeSettings.storeName}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Description</label>
                  <input
                    name="storeDescription"
                    type="text"
                    defaultValue={storeSettings.storeDescription}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Email</label>
                  <input
                    name="contactEmail"
                    type="email"
                    defaultValue={storeSettings.contactEmail}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Phone</label>
                  <input
                    name="contactPhone"
                    type="text"
                    defaultValue={storeSettings.contactPhone}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    defaultValue={storeSettings.address}
                    className="input"
                    rows={3}
                  />
                </div>
                
                <button type="submit" className="w-full btn btn-primary">
                  Update Store Info
                </button>
              </form>
            </div>
            
            {/* Product Management */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Products ({products.length})
                </h3>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {product.name}
                      </p>
                      <p className="text-gray-500 dark:text-slate-400 text-xs">
                        ${product.price} - {product.category}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Testimonial Management */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Testimonials ({testimonials.length})
                </h3>
                <button
                  onClick={() => setShowTestimonialForm(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-gray-500 dark:text-slate-400 text-xs">
                        {testimonial.rating} stars - {testimonial.location}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingTestimonial(testimonial);
                          setShowTestimonialForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Data Management */}
          <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
              Data Management
            </h3>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={downloadData}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              
              <button
                onClick={clearAllData}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 theme-transition">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white dark:bg-slate-800 shadow-lg z-50 theme-transition">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div
              id="generation_issue_fallback"
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setActiveSection('home')}
            >
              <Coffee className="w-8 h-8 text-amber-600" />
              <span className="text-xl font-bold text-gray-800 dark:text-white">
                BrewMaster
              </span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              {[
                { id: 'home', label: 'Home' },
                { id: 'products', label: 'Products' },
                { id: 'about', label: 'About' },
                { id: 'contact', label: 'Contact' }
              ].map((item) => (
                <button
                  key={item.id}
                  id={`${item.id}-tab`}
                  onClick={() => setActiveSection(item.id)}
                  className={`font-medium transition-colors ${
                    activeSection === item.id
                      ? 'text-amber-600'
                      : 'text-gray-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {currentUser && (
                <button
                  id="settings-tab"
                  onClick={() => setActiveSection('settings')}
                  className={`font-medium transition-colors ${
                    activeSection === 'settings'
                      ? 'text-amber-600'
                      : 'text-gray-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  Settings
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveSection('cart')}
                className="relative p-2 text-gray-600 dark:text-slate-300 hover:text-amber-600 transition-colors"
              >
                <ShoppingCart className="w-6 h-6" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setShowChat(true)}
                className="p-2 text-gray-600 dark:text-slate-300 hover:text-amber-600 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="pt-16">
        {activeSection === 'home' && renderHome()}
        {activeSection === 'products' && renderProducts()}
        {activeSection === 'cart' && renderCart()}
        {activeSection === 'about' && renderAbout()}
        {activeSection === 'contact' && renderContact()}
        {activeSection === 'settings' && renderSettings()}
      </main>
      
      {/* Chat Modal */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md h-96 flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-amber-600" />
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Coffee Assistant
                </h3>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-slate-400 py-8">
                  <Bot className="w-12 h-12 mx-auto mb-4 text-amber-600" />
                  <p>Hi! I'm your coffee assistant. Ask me about our products, brewing tips, or anything coffee-related!</p>
                </div>
              )}
              
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'bot' && <Bot className="w-4 h-4 mt-0.5 text-amber-600" />}
                      {message.type === 'user' && <UserIcon className="w-4 h-4 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isAILoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-slate-700 px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-amber-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t dark:border-slate-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about coffee, products, brewing..."
                  className="flex-1 input text-sm"
                  disabled={isAILoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isAILoading || !userMessage.trim()}
                  className="btn btn-primary px-3 py-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              {aiError && (
                <p className="text-red-500 text-xs mt-2">
                  Sorry, I'm having trouble responding right now. Please try again.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleProductSubmit(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div>
                  <label className="form-label">Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingProduct?.name || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Price</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    defaultValue={editingProduct?.price || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    defaultValue={editingProduct?.category || 'beans'}
                    className="input"
                    required
                  >
                    <option value="beans">Coffee Beans</option>
                    <option value="equipment">Equipment</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Image URL</label>
                  <input
                    name="image"
                    type="url"
                    defaultValue={editingProduct?.image || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Origin (for beans)</label>
                  <input
                    name="origin"
                    type="text"
                    defaultValue={editingProduct?.origin || ''}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">Roast Level (for beans)</label>
                  <select
                    name="roast"
                    defaultValue={editingProduct?.roast || ''}
                    className="input"
                  >
                    <option value="">Select roast level</option>
                    <option value="light">Light</option>
                    <option value="medium">Medium</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingProduct?.description || ''}
                    className="input"
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Rating</label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    defaultValue={editingProduct?.rating || '4.0'}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="form-label">In Stock</label>
                  <select
                    name="inStock"
                    defaultValue={editingProduct?.inStock ? 'true' : 'false'}
                    className="input"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                    className="flex-1 btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    {editingProduct ? 'Update' : 'Add'} Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Testimonial Form Modal */}
      {showTestimonialForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
                </h3>
                <button
                  onClick={() => {
                    setShowTestimonialForm(false);
                    setEditingTestimonial(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleTestimonialSubmit(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div>
                  <label className="form-label">Customer Name</label>
                  <input
                    name="name"
                    type="text"
                    defaultValue={editingTestimonial?.name || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Location</label>
                  <input
                    name="location"
                    type="text"
                    defaultValue={editingTestimonial?.location || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="form-label">Rating</label>
                  <select
                    name="rating"
                    defaultValue={editingTestimonial?.rating || '5'}
                    className="input"
                    required
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
                
                <div>
                  <label className="form-label">Testimonial Text</label>
                  <textarea
                    name="text"
                    defaultValue={editingTestimonial?.text || ''}
                    className="input"
                    rows={4}
                    required
                  />
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTestimonialForm(false);
                      setEditingTestimonial(null);
                    }}
                    className="flex-1 btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn btn-primary"
                  >
                    {editingTestimonial ? 'Update' : 'Add'} Testimonial
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Confirm Action
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-6">
              {confirmMessage}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 btn bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmAction?.()}
                className="flex-1 btn bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 dark:bg-slate-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Coffee className="w-8 h-8 text-amber-600" />
                <span className="text-xl font-bold">BrewMaster</span>
              </div>
              <p className="text-gray-300 mb-4">
                Premium coffee beans and brewing equipment for the perfect cup.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setActiveSection('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => setActiveSection('products')} className="hover:text-white transition-colors">Products</button></li>
                <li><button onClick={() => setActiveSection('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => setActiveSection('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => { setSelectedCategory('beans'); setActiveSection('products'); }} className="hover:text-white transition-colors">Coffee Beans</button></li>
                <li><button onClick={() => { setSelectedCategory('equipment'); setActiveSection('products'); }} className="hover:text-white transition-colors">Equipment</button></li>
                <li><button onClick={() => { setSelectedCategory('accessories'); setActiveSection('products'); }} className="hover:text-white transition-colors">Accessories</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{storeSettings.contactPhone}</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{storeSettings.contactEmail}</span>
                </li>
                <li className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 mt-1" />
                  <span>{storeSettings.address}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex justify-between items-center">
            <p className="text-gray-300">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </p>
            <AdminLogin linkText="Admin Login" />
          </div>
        </div>
      </footer>

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={handleAIResult}
        onError={setAiError}
        onLoading={setIsAILoading}
      />
    </div>
  );
};

export default App;