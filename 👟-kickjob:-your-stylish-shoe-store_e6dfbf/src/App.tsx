import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingCart, 
  Heart, 
  Search, 
  Filter, 
  Star, 
  Plus, 
  Minus, 
  Eye, 
  Truck, 
  Shield, 
  CreditCard, 
  User, 
  Package, 
  Settings, 
  BarChart3, 
  Upload, 
  Download, 
  Trash2, 
  Edit, 
  X, 
  Check,
  Menu,
  Home,
  Tag,
  Users,
  TrendingUp,
  Calendar,
  DollarSign,
  MessageCircle,
  Send,
  Bot,
  RefreshCw,
  HelpCircle,
  Zap
} from 'lucide-react';
import AILayer from './components/AILayer';
import styles from './styles/styles.module.css';

// Defined locally to replace import from './components/AILayer.types'
interface AILayerHandle {
  sendToAI: (prompt: string, file?: File) => void;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  description: string;
  features: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  featured: boolean;
  tags: string[];
}

interface CartItem extends Product {
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  customerInfo: CustomerInfo;
  orderDate: string;
  trackingNumber?: string;
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
}

interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  context?: string;
}

type FilterOptions = {
  category: string;
  brand: string;
  priceRange: [number, number];
  size: string;
  color: string;
  inStock: boolean;
};

type AdminTab = 'dashboard' | 'products' | 'orders' | 'customers' | 'analytics' | 'settings';
type CustomerTab = 'products' | 'cart' | 'checkout' | 'orders' | 'account';

// Defined locally to replace import from './components/AdminLogin'
const AdminLogin: React.FC<{ linkText: string }> = ({ linkText }) => {
  const handleAdminLogin = () => {
    // In a real app, this would trigger authentication logic.
    // For this example, it's a placeholder.
    console.log("Admin login action placeholder.");
  };

  return (
    <button onClick={handleAdminLogin} className="text-gray-400 hover:text-white transition-colors">
      {linkText}
    </button>
  );
};

const App: React.FC = () => {
  // Auth context - would be replaced with actual auth context
  const { currentUser, logout } = { currentUser: null, logout: () => {} };

  // AI Layer ref and states
  const aiLayerRef = useRef<AILayerHandle>(null);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showChatbot, setShowChatbot] = useState<boolean>(false);
  
  // Enhanced chatbot states
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Main app states
  const [currentTab, setCurrentTab] = useState<CustomerTab>('products');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    category: '',
    brand: '',
    priceRange: [0, 1000],
    size: '',
    color: '',
    inStock: false
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'USA'
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Initialize data
  useEffect(() => {
    initializeData();
    loadChatHistory();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  // Save chat history to localStorage
  useEffect(() => {
    localStorage.setItem('kickjob_chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const initializeData = () => {
    const savedProducts = localStorage.getItem('kickjob_products');
    const savedCart = localStorage.getItem('kickjob_cart');
    const savedOrders = localStorage.getItem('kickjob_orders');
    const savedReviews = localStorage.getItem('kickjob_reviews');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      const initialProducts = generateInitialProducts();
      setProducts(initialProducts);
      localStorage.setItem('kickjob_products', JSON.stringify(initialProducts));
    }

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }

    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      const initialReviews = generateInitialReviews();
      setReviews(initialReviews);
      localStorage.setItem('kickjob_reviews', JSON.stringify(initialReviews));
    }
  };

  const loadChatHistory = () => {
    const savedHistory = localStorage.getItem('kickjob_chat_history');
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    } else {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome-' + Date.now(),
        type: 'assistant',
        content: "👋 Hi! I'm your KickJob shopping assistant! I can help you find the perfect shoes, answer questions about our products, check order status, explain our policies, and much more. What can I help you with today?",
        timestamp: new Date().toISOString(),
        context: 'welcome'
      };
      setChatHistory([welcomeMessage]);
    }
  };

  const generateInitialProducts = (): Product[] => {
    return [
      {
        id: '1',
        name: 'Air Max Revolution',
        brand: 'KickJob',
        price: 129.99,
        originalPrice: 159.99,
        category: 'running',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['Black', 'White', 'Red', 'Blue'],
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500'],
        description: 'Revolutionary running shoe with advanced cushioning technology and breathable mesh upper.',
        features: ['Air Max cushioning', 'Breathable mesh', 'Durable rubber sole', 'Lightweight design'],
        rating: 4.5,
        reviews: 124,
        inStock: true,
        featured: true,
        tags: ['running', 'comfort', 'lightweight']
      },
      {
        id: '2',
        name: 'Urban Street Walker',
        brand: 'KickJob',
        price: 89.99,
        category: 'casual',
        sizes: ['6', '7', '8', '9', '10', '11'],
        colors: ['Black', 'White', 'Gray'],
        images: ['https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500'],
        description: 'Stylish casual sneakers perfect for everyday wear with premium leather construction.',
        features: ['Premium leather', 'Comfortable insole', 'Non-slip sole', 'Classic design'],
        rating: 4.3,
        reviews: 89,
        inStock: true,
        featured: true,
        tags: ['casual', 'leather', 'street']
      },
      {
        id: '3',
        name: 'Elite Performance Pro',
        brand: 'KickJob',
        price: 199.99,
        category: 'athletic',
        sizes: ['7', '8', '9', '10', '11', '12', '13'],
        colors: ['Black', 'Red', 'Blue', 'Green'],
        images: ['https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=500', 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'],
        description: 'High-performance athletic shoes designed for serious athletes with cutting-edge technology.',
        features: ['Advanced shock absorption', 'Carbon fiber plate', 'Energy return foam', 'Athletic fit'],
        rating: 4.8,
        reviews: 256,
        inStock: true,
        featured: true,
        tags: ['athletic', 'performance', 'professional']
      },
      {
        id: '4',
        name: 'Classic Canvas Low',
        brand: 'KickJob',
        price: 59.99,
        category: 'casual',
        sizes: ['5', '6', '7', '8', '9', '10', '11'],
        colors: ['White', 'Black', 'Red', 'Navy'],
        images: ['https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500'],
        description: 'Timeless canvas sneakers with a vintage-inspired design perfect for any casual outfit.',
        features: ['Canvas upper', 'Rubber sole', 'Classic lacing', 'Versatile style'],
        rating: 4.2,
        reviews: 67,
        inStock: true,
        featured: false,
        tags: ['casual', 'canvas', 'classic']
      },
      {
        id: '5',
        name: 'Trail Master X',
        brand: 'KickJob',
        price: 149.99,
        category: 'outdoor',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['Brown', 'Green', 'Black'],
        images: ['https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=500'],
        description: 'Rugged outdoor shoes built for hiking and trail adventures with waterproof protection.',
        features: ['Waterproof membrane', 'Aggressive tread', 'Ankle support', 'Durable construction'],
        rating: 4.6,
        reviews: 143,
        inStock: true,
        featured: false,
        tags: ['outdoor', 'hiking', 'waterproof']
      },
      {
        id: '6',
        name: 'Luxury Leather Loafer',
        brand: 'KickJob',
        price: 179.99,
        category: 'formal',
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['Black', 'Brown', 'Tan'],
        images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=500'],
        description: 'Elegant leather loafers crafted from premium materials for formal and business occasions.',
        features: ['Premium leather', 'Cushioned insole', 'Formal design', 'Hand-stitched details'],
        rating: 4.4,
        reviews: 92,
        inStock: true,
        featured: false,
        tags: ['formal', 'leather', 'business']
      }
    ];
  };

  const generateInitialReviews = (): Review[] => {
    return [
      {
        id: '1',
        productId: '1',
        customerName: 'John D.',
        rating: 5,
        comment: 'Amazing comfort and style! Perfect for my morning runs.',
        date: '2025-05-15'
      },
      {
        id: '2',
        productId: '1',
        customerName: 'Sarah M.',
        rating: 4,
        comment: 'Great shoes, but sizing runs a bit small.',
        date: '2025-05-10'
      },
      {
        id: '3',
        productId: '2',
        customerName: 'Mike R.',
        rating: 5,
        comment: 'Love these for everyday wear. Very comfortable!',
        date: '2025-05-08'
      }
    ];
  };

  // Enhanced AI Chat Functions
  const createContextualPrompt = (userMessage: string): string => {
    const storeContext = {
      storeName: "KickJob",
      products: products.map(p => ({
        name: p.name,
        price: p.price,
        category: p.category,
        sizes: p.sizes,
        colors: p.colors,
        inStock: p.inStock,
        rating: p.rating,
        description: p.description,
        features: p.features
      })),
      policies: {
        shipping: "Free shipping on orders over $75. Standard shipping takes 3-7 business days.",
        returns: "30-day money back guarantee. Items must be in original condition.",
        exchanges: "Free exchanges within 30 days for different sizes or colors.",
        warranty: "1-year warranty on all footwear against manufacturing defects."
      },
      categories: ['running', 'casual', 'athletic', 'outdoor', 'formal'],
      brands: ['KickJob'],
      priceRange: { min: 59.99, max: 199.99 },
      currentOffers: "Sale items up to 25% off. Free shipping on orders over $75.",
      customerService: {
        hours: "Monday-Friday 9AM-6PM EST",
        phone: "1-800-KICKJOB",
        email: "support@kickjob.com"
      }
    };

    const conversationHistory = chatHistory
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.type}: ${msg.content}`)
      .join('\n');

    const cartInfo = cart.length > 0 ? 
      `Current cart: ${cart.map(item => `${item.name} (${item.selectedSize}, ${item.selectedColor}) x${item.quantity}`).join(', ')}. Total: $${getCartTotal().toFixed(2)}` : 
      'Cart is empty';

    return `You are a helpful customer service assistant for KickJob shoe store. You have access to our complete product catalog, policies, and customer information. Always be friendly, helpful, and knowledgeable.

STORE INFORMATION:
${JSON.stringify(storeContext, null, 2)}

CUSTOMER'S CURRENT CART:
${cartInfo}

RECENT CONVERSATION HISTORY:
${conversationHistory}

CUSTOMER'S CURRENT QUESTION:
${userMessage}

Please provide a helpful, accurate response. If recommending products, mention specific names, prices, and features. If the customer asks about orders, policies, or specific products, provide detailed information. Always maintain conversation context and reference previous messages when relevant. Keep responses conversational and helpful.`;
  };

  const addMessageToHistory = (type: 'user' | 'assistant', content: string, context?: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toISOString(),
      context
    };
    setChatHistory(prev => [...prev, newMessage]);
  };

  const handleAIChat = () => {
    if (!aiPrompt.trim()) {
      setAiError("Please enter a message to chat.");
      return;
    }

    // Add user message to history
    addMessageToHistory('user', aiPrompt);
    
    // Clear input and show typing
    const userMessage = aiPrompt;
    setAiPrompt('');
    setIsTyping(true);
    setAiResult(null);
    setAiError(null);

    // Create contextual prompt
    const contextualPrompt = createContextualPrompt(userMessage);

    // Send to AI
    aiLayerRef.current?.sendToAI(contextualPrompt);
  };

  const handleQuickAction = (action: string) => {
    const quickActions: { [key: string]: string } = {
      'shipping': 'What are your shipping options and costs?',
      'returns': 'What is your return policy?',
      'sizing': 'How do I find the right shoe size?',
      'recommendations': 'Can you recommend some popular shoes?',
      'orders': 'How can I track my order?',
      'support': 'How can I contact customer support?'
    };

    if (quickActions[action]) {
      setAiPrompt(quickActions[action]);
      handleAIChat();
    }
  };

  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('kickjob_chat_history');
    loadChatHistory(); // Reload with welcome message
  };

  // Handle AI responses
  useEffect(() => {
    if (aiResult && isTyping) {
      setIsTyping(false);
      addMessageToHistory('assistant', aiResult);
      setAiResult(null);
    }
  }, [aiResult, isTyping]);

  useEffect(() => {
    if (aiError && isTyping) {
      setIsTyping(false);
      addMessageToHistory('assistant', "I apologize, but I'm having trouble responding right now. Please try again or contact our customer support at support@kickjob.com or 1-800-KICKJOB.");
      setAiError(null);
    }
  }, [aiError, isTyping]);

  const handleProductAnalysis = (file: File) => {
    const analysisPrompt = `Analyze this shoe image and extract product information. Return JSON with keys "name", "category", "estimated_price", "colors", "style_description", "recommended_features"`;
    
    setAiResult(null);
    setAiError(null);
    
    aiLayerRef.current?.sendToAI(analysisPrompt, file);
  };

  // Product functions
  const addToCart = (product: Product, size: string, color: string, quantity: number = 1) => {
    const existingItem = cart.find(item => 
      item.id === product.id && 
      item.selectedSize === size && 
      item.selectedColor === color
    );

    let newCart: CartItem[];
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id && 
        item.selectedSize === size && 
        item.selectedColor === color
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const cartItem: CartItem = {
        ...product,
        selectedSize: size,
        selectedColor: color,
        quantity
      };
      newCart = [...cart, cartItem];
    }

    setCart(newCart);
    localStorage.setItem('kickjob_cart', JSON.stringify(newCart));
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    const newCart = cart.filter(item => 
      !(item.id === id && item.selectedSize === size && item.selectedColor === color)
    );
    setCart(newCart);
    localStorage.setItem('kickjob_cart', JSON.stringify(newCart));
  };

  const updateCartQuantity = (id: string, size: string, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }

    const newCart = cart.map(item =>
      item.id === id && item.selectedSize === size && item.selectedColor === color
        ? { ...item, quantity }
        : item
    );
    setCart(newCart);
    localStorage.setItem('kickjob_cart', JSON.stringify(newCart));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = !searchQuery || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = !filters.category || product.category === filters.category;
      const matchesBrand = !filters.brand || product.brand === filters.brand;
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesInStock = !filters.inStock || product.inStock;

      return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesInStock;
    });
  };

  const processOrder = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      items: [...cart],
      total: getCartTotal(),
      status: 'pending',
      customerInfo: { ...customerInfo },
      orderDate: new Date().toISOString(),
      trackingNumber: `KJ${Date.now().toString().slice(-8)}`
    };

    const newOrders = [...orders, newOrder];
    setOrders(newOrders);
    localStorage.setItem('kickjob_orders', JSON.stringify(newOrders));

    setCart([]);
    localStorage.setItem('kickjob_cart', JSON.stringify([]));
    setCurrentTab('orders');
  };

  // Admin functions
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    const newProducts = [...products, newProduct];
    setProducts(newProducts);
    localStorage.setItem('kickjob_products', JSON.stringify(newProducts));
  };

  const updateProduct = (product: Product) => {
    const newProducts = products.map(p => p.id === product.id ? product : p);
    setProducts(newProducts);
    localStorage.setItem('kickjob_products', JSON.stringify(newProducts));
  };

  const deleteProduct = (id: string) => {
    const newProducts = products.filter(p => p.id !== id);
    setProducts(newProducts);
    localStorage.setItem('kickjob_products', JSON.stringify(newProducts));
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    const newOrders = orders.map(order =>
      order.id === orderId ? { ...order, status } : order
    );
    setOrders(newOrders);
    localStorage.setItem('kickjob_orders', JSON.stringify(newOrders));
  };

  const exportData = () => {
    const data = {
      products,
      orders,
      reviews,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kickjob-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    localStorage.removeItem('kickjob_products');
    localStorage.removeItem('kickjob_cart');
    localStorage.removeItem('kickjob_orders');
    localStorage.removeItem('kickjob_reviews');
    initializeData();
  };

  // Product Modal Component
  const ProductModal: React.FC = () => {
    const [selectedSize, setSelectedSize] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<string>('');
    const [quantity, setQuantity] = useState<number>(1);

    useEffect(() => {
      if (selectedProduct) {
        setSelectedSize(selectedProduct.sizes[0] || '');
        setSelectedColor(selectedProduct.colors[0] || '');
        setQuantity(1);
      }
    }, [selectedProduct]);

    if (!selectedProduct) return null;

    const handleAddToCart = () => {
      if (selectedSize && selectedColor) {
        addToCart(selectedProduct, selectedSize, selectedColor, quantity);
        setShowProductModal(false);
        setSelectedProduct(null);
      }
    };

    return (
      <div className="modal-backdrop" onClick={() => setShowProductModal(false)}>
        <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-xl font-bold">{selectedProduct.name}</h3>
            <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <img 
                src={selectedProduct.images[0]} 
                alt={selectedProduct.name}
                className="w-full h-64 object-cover rounded-lg"
              />
              <div className="grid grid-cols-3 gap-2">
                {selectedProduct.images.slice(1).map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`${selectedProduct.name} ${index + 2}`}
                    className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80"
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-primary-600">${selectedProduct.price}</span>
                  {selectedProduct.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">${selectedProduct.originalPrice}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(selectedProduct.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">({selectedProduct.reviews} reviews)</span>
                </div>
              </div>
              
              <p className="text-gray-700">{selectedProduct.description}</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">Size:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1 border rounded ${selectedSize === size ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Color:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1 border rounded ${selectedColor === color ? 'border-primary-600 bg-primary-50' : 'border-gray-300'}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity:</label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn btn-sm bg-gray-200 text-gray-700"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-1 border rounded text-center min-w-12">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="btn btn-sm bg-gray-200 text-gray-700"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Features:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {selectedProduct.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || !selectedColor}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                Add to Cart - ${(selectedProduct.price * quantity).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Product Card Component
  const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="card hover:shadow-lg transition-shadow duration-300">
      <div className="relative mb-4">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-lg"
        />
        {product.originalPrice && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
            Sale
          </span>
        )}
        <button 
          onClick={() => {
            setSelectedProduct(product);
            setShowProductModal(true);
          }}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow hover:bg-gray-50"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        <p className="text-gray-600">{product.brand}</p>
        
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary-600">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">({product.reviews})</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map(tag => (
            <span key={tag} className="badge badge-info text-xs">{tag}</span>
          ))}
        </div>
        
        <button
          onClick={() => {
            setSelectedProduct(product);
            setShowProductModal(true);
          }}
          className="btn btn-primary w-full mt-3"
        >
          View Details
        </button>
      </div>
    </div>
  );

  // Homepage Component
  const Homepage: React.FC = () => (
    <div className="space-y-8">
      {/* Hero Section */}
      <section id="welcome_fallback" className={`${styles.hero} relative bg-gradient-to-r from-primary-600 to-secondary-600 text-white py-20 rounded-xl`}>
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold">
                Step Into Style with <span className="text-yellow-400">KickJob</span>
              </h1>
              <p className="text-xl opacity-90">
                Discover our premium collection of shoes designed for comfort, performance, and style. 
                From athletic performance to casual elegance, find your perfect pair.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setCurrentTab('products')}
                  className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100"
                  id="shop-now-btn"
                >
                  Shop Now
                </button>
                <button 
                  onClick={() => setShowChatbot(true)}
                  className="btn btn-lg border-2 border-white text-white hover:bg-white hover:text-primary-600"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Chat with AI Assistant
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600" 
                alt="Featured Shoe"
                className="w-full max-w-md mx-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <Truck className="h-12 w-12 mx-auto mb-4 text-primary-600" />
            <h3 className="text-xl font-semibold mb-2">Free Shipping</h3>
            <p className="text-gray-600">Free shipping on orders over $75</p>
          </div>
          <div className="text-center p-6">
            <Shield className="h-12 w-12 mx-auto mb-4 text-primary-600" />
            <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
            <p className="text-gray-600">30-day money back guarantee</p>
          </div>
          <div className="text-center p-6">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary-600" />
            <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
            <p className="text-gray-600">Safe and secure payment processing</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-wide">
        <h2 className="text-3xl font-bold text-center mb-8" id="featured-products">Featured Products</h2>
        <div className="grid-responsive">
          {products.filter(p => p.featured).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <button 
            onClick={() => setCurrentTab('products')}
            className="btn btn-primary btn-lg"
            id="view-all-products"
          >
            View All Products
          </button>
        </div>
      </section>
    </div>
  );

  // Products Page Component
  const ProductsPage: React.FC = () => {
    const filteredProducts = getFilteredProducts();

    return (
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-1/4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="card space-y-6" id="product-filters">
              <h3 className="text-lg font-semibold">Filters</h3>
              
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select 
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="input w-full"
                >
                  <option value="">All Categories</option>
                  <option value="running">Running</option>
                  <option value="casual">Casual</option>
                  <option value="athletic">Athletic</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="formal">Formal</option>
                </select>
              </div>
              
              {/* Brand Filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select 
                  value={filters.brand}
                  onChange={(e) => setFilters({...filters, brand: e.target.value})}
                  className="input w-full"
                >
                  <option value="">All Brands</option>
                  <option value="KickJob">KickJob</option>
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                </label>
                <div className="flex gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[0]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: [parseInt(e.target.value), filters.priceRange[1]]
                    })}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) => setFilters({
                      ...filters, 
                      priceRange: [filters.priceRange[0], parseInt(e.target.value)]
                    })}
                    className="flex-1"
                  />
                </div>
              </div>
              
              {/* In Stock Filter */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={filters.inStock}
                  onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="inStock" className="text-sm">In Stock Only</label>
              </div>
              
              <button
                onClick={() => setFilters({
                  category: '',
                  brand: '',
                  priceRange: [0, 1000],
                  size: '',
                  color: '',
                  inStock: false
                })}
                className="btn bg-gray-200 text-gray-700 w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="lg:w-3/4">
            {/* Search and Filter Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                  id="product-search"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn bg-gray-200 text-gray-700 lg:hidden"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
            
            {/* Results */}
            <div className="mb-4">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
            
            {/* Products Grid */}
            <div className="grid-responsive" id="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button
                  onClick={() => {
                    setFilters({
                      category: '',
                      brand: '',
                      priceRange: [0, 1000],
                      size: '',
                      color: '',
                      inStock: false
                    });
                    setSearchQuery('');
                  }}
                  className="btn btn-primary mt-4"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Cart Page Component
  const CartPage: React.FC = () => (
    <div className="container-narrow">
      <h2 className="text-2xl font-bold mb-6" id="shopping-cart">Shopping Cart ({cart.length} items)</h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
          <button 
            onClick={() => setCurrentTab('products')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cart Items */}
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="card flex flex-col sm:flex-row gap-4">
                <img 
                  src={item.images[0]} 
                  alt={item.name}
                  className="w-full sm:w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600">{item.brand}</p>
                  <p className="text-sm text-gray-500">Size: {item.selectedSize}, Color: {item.selectedColor}</p>
                  <p className="text-lg font-bold text-primary-600">${item.price}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                    className="btn btn-sm bg-gray-200 text-gray-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 border rounded text-center min-w-12">{item.quantity}</span>
                  <button 
                    onClick={() => updateCartQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                    className="btn btn-sm bg-gray-200 text-gray-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                    className="btn btn-sm bg-red-100 text-red-600 hover:bg-red-200 ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className="card bg-gray-50">
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>Shipping:</span>
                <span>{getCartTotal() > 75 ? 'FREE' : '$9.99'}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${(getCartTotal() + (getCartTotal() > 75 ? 0 : 9.99)).toFixed(2)}</span>
              </div>
              <button
                onClick={() => setCurrentTab('checkout')}
                className="btn btn-primary w-full btn-lg"
                id="proceed-to-checkout"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Checkout Page Component
  const CheckoutPage: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    
    const handleSubmitOrder = () => {
      processOrder();
    };

    return (
      <div className="container-narrow">
        <h2 className="text-2xl font-bold mb-6" id="checkout-page">Checkout</h2>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-300'}`}>3</div>
          </div>
        </div>
        
        {step === 1 && (
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Shipping Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  value={customerInfo.firstName}
                  onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  value={customerInfo.lastName}
                  onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="form-label">ZIP Code</label>
                <input
                  type="text"
                  value={customerInfo.zipCode}
                  onChange={(e) => setCustomerInfo({...customerInfo, zipCode: e.target.value})}
                  className="input"
                  required
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.address}
              className="btn btn-primary w-full mt-6 disabled:opacity-50"
            >
              Continue to Payment
            </button>
          </div>
        )}
        
        {step === 2 && (
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Payment Information</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  value={paymentInfo.cardholderName}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cardholderName: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  value={paymentInfo.cardNumber}
                  onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')})}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Expiry Date</label>
                  <input
                    type="text"
                    value={paymentInfo.expiryDate}
                    onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value.replace(/\D/g, '').replace(/(\d{2})(?=\d)/, '$1/')})}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">CVV</label>
                  <input
                    type="text"
                    value={paymentInfo.cvv}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value.replace(/\D/g, '')})}
                    placeholder="123"
                    maxLength={4}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setStep(1)}
                className="btn bg-gray-200 text-gray-700 flex-1"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!paymentInfo.cardholderName || !paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv}
                className="btn btn-primary flex-1 disabled:opacity-50"
              >
                Review Order
              </button>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="card">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex justify-between">
                    <span>{item.name} ({item.selectedSize}, {item.selectedColor}) x{item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-3 font-bold flex justify-between">
                  <span>Total:</span>
                  <span>${(getCartTotal() + (getCartTotal() > 75 ? 0 : 9.99)).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            {/* Shipping & Payment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                <p className="text-sm text-gray-600">
                  {customerInfo.firstName} {customerInfo.lastName}<br />
                  {customerInfo.address}<br />
                  {customerInfo.city}, {customerInfo.zipCode}<br />
                  {customerInfo.phone}
                </p>
              </div>
              <div className="card">
                <h4 className="font-semibold mb-2">Payment Method</h4>
                <p className="text-sm text-gray-600">
                  **** **** **** {paymentInfo.cardNumber.slice(-4)}<br />
                  {paymentInfo.cardholderName}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="btn bg-gray-200 text-gray-700 flex-1"
              >
                Back
              </button>
              <button
                onClick={handleSubmitOrder}
                className="btn btn-primary flex-1"
                id="place-order"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Orders Page Component
  const OrdersPage: React.FC = () => (
    <div className="container-narrow">
      <h2 className="text-2xl font-bold mb-6" id="order-history">Order History</h2>
      
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 text-lg mb-4">No orders found</p>
          <button 
            onClick={() => setCurrentTab('products')}
            className="btn btn-primary"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                  <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                  <p className="text-gray-600">
                    {new Date(order.orderDate).toLocaleDateString()} • {order.items.length} items
                  </p>
                  {order.trackingNumber && (
                    <p className="text-sm text-gray-500">Tracking: {order.trackingNumber}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">${order.total.toFixed(2)}</p>
                  <span className={`badge ${
                    order.status === 'delivered' ? 'badge-success' :
                    order.status === 'shipped' ? 'badge-info' :
                    order.status === 'processing' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center gap-4 py-2 border-t">
                    <img 
                      src={item.images[0]} 
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Size: {item.selectedSize}, Color: {item.selectedColor}, Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Account Page Component
  const AccountPage: React.FC = () => (
    <div className="container-narrow">
      <h2 className="text-2xl font-bold mb-6" id="account-settings">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Personal Information */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">First Name</label>
              <input
                type="text"
                value={customerInfo.firstName}
                onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">Last Name</label>
              <input
                type="text"
                value={customerInfo.lastName}
                onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                className="input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                className="input"
              />
            </div>
          </div>
          <button className="btn btn-primary mt-4">Save Changes</button>
        </div>
        
        {/* Shipping Address */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Default Shipping Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="form-label">Address</label>
              <input
                type="text"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                value={customerInfo.city}
                onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                className="input"
              />
            </div>
            <div>
              <label className="form-label">ZIP Code</label>
              <input
                type="text"
                value={customerInfo.zipCode}
                onChange={(e) => setCustomerInfo({...customerInfo, zipCode: e.target.value})}
                className="input"
              />
            </div>
          </div>
          <button className="btn btn-primary mt-4">Save Address</button>
        </div>
        
        {/* Preferences */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Email notifications</span>
              <input type="checkbox" defaultChecked className="form-checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <span>SMS notifications</span>
              <input type="checkbox" className="form-checkbox" />
            </div>
            <div className="flex items-center justify-between">
              <span>Marketing emails</span>
              <input type="checkbox" defaultChecked className="form-checkbox" />
            </div>
          </div>
          <button className="btn btn-primary mt-4">Save Preferences</button>
        </div>
      </div>
    </div>
  );

  // Admin Dashboard Component
  const AdminDashboard: React.FC = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const totalProducts = products.length;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" id="admin-dashboard">Admin Dashboard</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card">
            <div className="stat-title">Total Orders</div>
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-desc">+12% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Revenue</div>
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            <div className="stat-desc">+8% from last month</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Pending Orders</div>
            <div className="stat-value">{pendingOrders}</div>
            <div className="stat-desc">Needs attention</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Products</div>
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-desc">Total in catalog</div>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Order ID</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Total</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Date</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id}>
                    <td className="table-cell">#{order.id}</td>
                    <td className="table-cell">{order.customerInfo.firstName} {order.customerInfo.lastName}</td>
                    <td className="table-cell">${order.total.toFixed(2)}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        order.status === 'delivered' ? 'badge-success' :
                        order.status === 'shipped' ? 'badge-info' :
                        order.status === 'processing' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="table-cell">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="table-cell">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderModal(true);
                        }}
                        className="btn btn-sm btn-primary"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Admin Products Component
  const AdminProducts: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" id="admin-products">Product Management</h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowProductModal(true);
          }}
          className="btn btn-primary"
          id="add-product-btn"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Product
        </button>
      </div>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Image</th>
                <th className="table-header">Name</th>
                <th className="table-header">Category</th>
                <th className="table-header">Price</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td className="table-cell">
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                  </td>
                  <td className="table-cell">{product.name}</td>
                  <td className="table-cell">{product.category}</td>
                  <td className="table-cell">${product.price}</td>
                  <td className="table-cell">
                    <span className={`badge ${product.inStock ? 'badge-success' : 'badge-error'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductModal(true);
                        }}
                        className="btn btn-sm bg-blue-100 text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="btn btn-sm bg-red-100 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Admin Orders Component
  const AdminOrders: React.FC = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="admin-orders">Order Management</h2>
      
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Order ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Items</th>
                <th className="table-header">Total</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="table-cell">#{order.id}</td>
                  <td className="table-cell">
                    {order.customerInfo.firstName} {order.customerInfo.lastName}
                  </td>
                  <td className="table-cell">{order.items.length}</td>
                  <td className="table-cell">${order.total.toFixed(2)}</td>
                  <td className="table-cell">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                      className="input-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="table-cell">{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderModal(true);
                      }}
                      className="btn btn-sm btn-primary"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Admin Settings Component
  const AdminSettings: React.FC = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold" id="admin-settings">Settings</h2>
      
      {/* AI Product Analysis */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">AI Product Analysis</h3>
        <p className="text-gray-600 mb-4">Upload a shoe image to analyze and extract product information</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleProductAnalysis(file);
            }
          }}
          className="input"
        />
        {aiLoading && <p className="text-blue-600 mt-2">Analyzing image...</p>}
        {aiResult && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">Analysis Result:</h4>
            <pre className="text-sm text-green-700 mt-2 whitespace-pre-wrap">{aiResult}</pre>
          </div>
        )}
        {aiError && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <p className="text-red-600">Error: {aiError}</p>
          </div>
        )}
      </div>
      
      {/* Data Management */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={exportData} className="btn bg-blue-100 text-blue-600">
              <Download className="h-5 w-5 mr-2" />
              Export Data
            </button>
            <button onClick={clearAllData} className="btn bg-red-100 text-red-600">
              <Trash2 className="h-5 w-5 mr-2" />
              Clear All Data
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Export all store data or clear all data and reset to initial state.
          </p>
        </div>
      </div>
      
      {/* Store Settings */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Store Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="form-label">Store Name</label>
            <input type="text" defaultValue="KickJob" className="input" />
          </div>
          <div>
            <label className="form-label">Contact Email</label>
            <input type="email" defaultValue="support@kickjob.com" className="input" />
          </div>
          <div>
            <label className="form-label">Free Shipping Threshold</label>
            <input type="number" defaultValue="75" className="input" />
          </div>
          <div>
            <label className="form-label">Currency</label>
            <select className="input">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <button className="btn btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );

  // Enhanced AI Chatbot Component
  const AIChatbot: React.FC = () => (
    <div className="fixed bottom-4 right-4 z-50">
      {showChatbot && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-96 h-[32rem] flex flex-col border border-gray-200 dark:border-slate-700">
          {/* Chatbot Header */}
          <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">KickJob Assistant</h3>
                <p className="text-xs opacity-80">Always here to help!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChatHistory}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                title="Clear conversation"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setShowChatbot(false)} 
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="p-3 border-b bg-gray-50 dark:bg-slate-700">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleQuickAction('recommendations')}
                className="btn btn-sm bg-primary-100 text-primary-700 hover:bg-primary-200 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Recommendations
              </button>
              <button
                onClick={() => handleQuickAction('shipping')}
                className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs"
              >
                <Truck className="h-3 w-3 mr-1" />
                Shipping
              </button>
              <button
                onClick={() => handleQuickAction('sizing')}
                className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200 text-xs"
              >
                <HelpCircle className="h-3 w-3 mr-1" />
                Sizing
              </button>
            </div>
          </div>
          
          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-slate-900"
            id="chat-messages"
          >
            {chatHistory.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  message.type === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-sm' 
                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-bl-sm'
                }`}>
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">KickJob Assistant is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="p-4 border-t bg-white dark:bg-slate-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask about shoes, orders, sizing, or anything else..."
                className="input flex-1 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && !isTyping && handleAIChat()}
                disabled={isTyping}
                id="chat-input"
              />
              <button 
                onClick={handleAIChat} 
                className="btn btn-primary p-2" 
                disabled={isTyping || !aiPrompt.trim()}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI may make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      )}
      
      {!showChatbot && (
        <button
          onClick={() => setShowChatbot(true)}
          className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          id="chat-toggle"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  );

  // Order Modal Component
  const OrderModal: React.FC = () => {
    const handleCloseModal = () => {
      setShowOrderModal(false);
      setSelectedOrder(null);
    };

    // Close modal on Escape key
    // This hook is now called unconditionally on every render of OrderModal, fixing the error.
    useEffect(() => {
      const handleEscapeKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          handleCloseModal();
        }
      };

      if (showOrderModal) {
        document.addEventListener('keydown', handleEscapeKey);
        return () => document.removeEventListener('keydown', handleEscapeKey);
      }
    }, [showOrderModal]);

    // The conditional return is now placed *after* all hooks, which is valid.
    if (!selectedOrder) return null;

    return (
      <div className="modal-backdrop" onClick={handleCloseModal}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-xl font-bold">Order #{selectedOrder.id}</h3>
            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <p>{selectedOrder.customerInfo.firstName} {selectedOrder.customerInfo.lastName}</p>
              <p>{selectedOrder.customerInfo.email}</p>
              <p>{selectedOrder.customerInfo.phone}</p>
              <p>{selectedOrder.customerInfo.address}</p>
              <p>{selectedOrder.customerInfo.city}, {selectedOrder.customerInfo.zipCode}</p>
            </div>
            
            {/* Order Items */}
            <div>
              <h4 className="font-semibold mb-2">Items ({selectedOrder.items.length})</h4>
              <div className="space-y-3">
                {selectedOrder.items.map(item => (
                  <div key={`${item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex items-center gap-4 p-3 border rounded">
                    <img src={item.images[0]} alt={item.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h5 className="font-medium">{item.name}</h5>
                      <p className="text-sm text-gray-600">Size: {item.selectedSize}, Color: {item.selectedColor}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${selectedOrder.total.toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Order Date: {new Date(selectedOrder.orderDate).toLocaleDateString()}
              </p>
              {selectedOrder.trackingNumber && (
                <p className="text-sm text-gray-600">
                  Tracking: {selectedOrder.trackingNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="generation_issue_fallback">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40 theme-transition">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentTab('products')}
                className="text-2xl font-bold text-primary-600 hover:text-primary-700"
                id="logo"
              >
                KickJob
              </button>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentTab('products')}
                className={`text-sm font-medium transition-colors ${
                  currentTab === 'products' ? 'text-primary-600' : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                }`}
                id="products-nav"
              >
                Products
              </button>
              <button
                onClick={() => setCurrentTab('cart')}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  currentTab === 'cart' ? 'text-primary-600' : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                }`}
                id="cart-nav"
              >
                <ShoppingCart className="h-4 w-4" />
                Cart ({cart.length})
              </button>
              <button
                onClick={() => setCurrentTab('orders')}
                className={`text-sm font-medium transition-colors ${
                  currentTab === 'orders' ? 'text-primary-600' : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                }`}
                id="orders-nav"
              >
                Orders
              </button>
              <button
                onClick={() => setCurrentTab('account')}
                className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                  currentTab === 'account' ? 'text-primary-600' : 'text-gray-700 dark:text-slate-300 hover:text-primary-600'
                }`}
                id="account-nav"
              >
                <User className="h-4 w-4" />
                Account
              </button>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <button className="p-2">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        {currentTab === 'products' && (
          <>
            <Homepage />
            <div className="mt-12">
              <ProductsPage />
            </div>
          </>
        )}
        {currentTab === 'cart' && <CartPage />}
        {currentTab === 'checkout' && <CheckoutPage />}
        {currentTab === 'orders' && <OrdersPage />}
        {currentTab === 'account' && <AccountPage />}
      </main>

      {/* Admin Panel */}
      {currentUser && (
        <div className="fixed bottom-20 left-4 z-40">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-4 space-y-4 max-w-xs">
            <h3 className="font-semibold text-gray-900 dark:text-white">Admin Panel</h3>
            <div className="space-y-2">
              <button
                onClick={() => setAdminTab('dashboard')}
                className={`btn w-full text-left ${adminTab === 'dashboard' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
                id="admin-dashboard-tab"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => setAdminTab('products')}
                className={`btn w-full text-left ${adminTab === 'products' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
                id="admin-products-tab"
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </button>
              <button
                onClick={() => setAdminTab('orders')}
                className={`btn w-full text-left ${adminTab === 'orders' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
                id="admin-orders-tab"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Orders
              </button>
              <button
                onClick={() => setAdminTab('settings')}
                className={`btn w-full text-left ${adminTab === 'settings' ? 'btn-primary' : 'bg-gray-100 text-gray-700'}`}
                id="admin-settings-tab"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Content Overlay */}
      {currentUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Panel</h2>
                <button onClick={() => {}} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              {adminTab === 'dashboard' && <AdminDashboard />}
              {adminTab === 'products' && <AdminProducts />}
              {adminTab === 'orders' && <AdminOrders />}
              {adminTab === 'settings' && <AdminSettings />}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showProductModal && <ProductModal />}
      {showOrderModal && <OrderModal />}

      {/* Enhanced AI Chatbot */}
      <AIChatbot />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-primary-400">KickJob</h3>
              <p className="text-gray-400">
                Your premier destination for quality footwear. Step into style with our curated collection.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setCurrentTab('products')} className="hover:text-white">Products</button></li>
                <li><button onClick={() => setCurrentTab('orders')} className="hover:text-white">Orders</button></li>
                <li><button onClick={() => setCurrentTab('account')} className="hover:text-white">Account</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">Size Guide</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Newsletter</a></li>
                <li><a href="#" className="hover:text-white">Social Media</a></li>
                <li><button onClick={() => setShowChatbot(true)} className="hover:text-white">AI Assistant</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">Copyright © 2025 Datavtar Private Limited. All rights reserved.</p>
            <AdminLogin linkText="Admin Login" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;