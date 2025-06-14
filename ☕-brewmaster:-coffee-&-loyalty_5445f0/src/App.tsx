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
  Clock,
  Calendar,
  CheckCircle,
  Gift,
  Tag,
  Target,
  Percent,
  TrendingUp,
  Copy,
  UserPlus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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

interface Reservation {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  timestamp: Date;
}

interface Customer {
  id: string;
  email: string;
  name: string;
  points: number;
  totalSpent: number;
  joinDate: Date;
  referralCode: string;
  referredBy?: string;
}

interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  isUsed: boolean;
  issuedTo: string;
  issuedDate: Date;
  expiryDate: Date;
  minPurchase: number;
}

interface Transaction {
  id: string;
  customerId: string;
  amount: number;
  pointsEarned: number;
  date: Date;
  items: CartItem[];
  couponUsed?: string;
  discountAmount?: number;
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
  
  // Reservation state
  const [showReservationConfirm, setShowReservationConfirm] = useState<boolean>(false);
  const [reservationData, setReservationData] = useState<Reservation | null>(null);
  
  // Loyalty & Coupon state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState<boolean>(false);
  const [showCustomerForm, setShowCustomerForm] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [couponError, setCouponError] = useState<string>('');
  
  // Admin state
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showTestimonialForm, setShowTestimonialForm] = useState<boolean>(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);

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
      const savedCustomers = localStorage.getItem('brewmaster_customers');
      const savedCoupons = localStorage.getItem('brewmaster_coupons');
      const savedTransactions = localStorage.getItem('brewmaster_transactions');
      const savedCurrentCustomer = localStorage.getItem('brewmaster_current_customer');

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
      if (savedCustomers) {
        const parsedCustomers = JSON.parse(savedCustomers).map((customer: any) => ({
          ...customer,
          joinDate: new Date(customer.joinDate)
        }));
        setCustomers(parsedCustomers);
      }
      if (savedCoupons) {
        const parsedCoupons = JSON.parse(savedCoupons).map((coupon: any) => ({
          ...coupon,
          issuedDate: new Date(coupon.issuedDate),
          expiryDate: new Date(coupon.expiryDate)
        }));
        setCoupons(parsedCoupons);
      }
      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions).map((transaction: any) => ({
          ...transaction,
          date: new Date(transaction.date)
        }));
        setTransactions(parsedTransactions);
      }
      if (savedCurrentCustomer) {
        const parsedCurrentCustomer = JSON.parse(savedCurrentCustomer);
        setCurrentCustomer({
          ...parsedCurrentCustomer,
          joinDate: new Date(parsedCurrentCustomer.joinDate)
        });
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
        image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=300&h=300&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=300&h=300&fit=crop',
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
        image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=300&h=300&fit=crop',
        category: 'equipment',
        description: 'Complete pour-over brewing setup',
        rating: 4.9,
        inStock: true
      },
      {
        id: '5',
        name: 'Burr Coffee Grinder',
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=300&h=300&fit=crop',
        category: 'equipment',
        description: 'Precision grinding for perfect extraction',
        rating: 4.7,
        inStock: true
      },
      {
        id: '6',
        name: 'Ceramic Coffee Mugs Set',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=300&h=300&fit=crop',
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

  useEffect(() => {
    localStorage.setItem('brewmaster_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('brewmaster_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('brewmaster_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (currentCustomer) {
      localStorage.setItem('brewmaster_current_customer', JSON.stringify(currentCustomer));
    } else {
      localStorage.removeItem('brewmaster_current_customer');
    }
  }, [currentCustomer]);

  // Loyalty System Functions
  const generateReferralCode = (email: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const emailHash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    let result = '';
    let seed = Math.abs(emailHash);
    
    for (let i = 0; i < 7; i++) {
      result += chars[seed % chars.length];
      seed = Math.floor(seed / chars.length) + Date.now() + i;
    }
    
    return result;
  };

  const generateCouponCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < 7; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Ensure uniqueness
    const existingCodes = coupons.map(c => c.code);
    if (existingCodes.includes(result)) {
      return generateCouponCode();
    }
    
    return result;
  };

  const createCustomer = (email: string, name: string): Customer => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      email,
      name,
      points: 0,
      totalSpent: 0,
      joinDate: new Date(),
      referralCode: generateReferralCode(email)
    };
    
    return newCustomer;
  };

  const awardPoints = (customerId: string, points: number, reason: string) => {
    setCustomers(prev => prev.map(customer => 
      customer.id === customerId 
        ? { ...customer, points: customer.points + points }
        : customer
    ));
    
    if (currentCustomer?.id === customerId) {
      setCurrentCustomer(prev => prev ? { ...prev, points: prev.points + points } : null);
    }
  };

  const createCoupon = (customerId: string, discountPercent: number, minPurchase: number = 0): Coupon => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) throw new Error('Customer not found');
    
    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: generateCouponCode(),
      discountPercent,
      isUsed: false,
      issuedTo: customer.email,
      issuedDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      minPurchase
    };
    
    setCoupons(prev => [...prev, newCoupon]);
    return newCoupon;
  };

  const checkPointsForRewards = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Reward tiers
    const rewardTiers = [
      { points: 100, discount: 5, minPurchase: 25 },
      { points: 250, discount: 10, minPurchase: 50 },
      { points: 500, discount: 15, minPurchase: 75 },
      { points: 1000, discount: 20, minPurchase: 100 }
    ];
    
    const applicableTier = rewardTiers
      .filter(tier => customer.points >= tier.points)
      .pop();
    
    if (applicableTier && customer.points >= applicableTier.points) {
      // Deduct points and create coupon
      setCustomers(prev => prev.map(c => 
        c.id === customerId 
          ? { ...c, points: c.points - applicableTier.points }
          : c
      ));
      
      if (currentCustomer?.id === customerId) {
        setCurrentCustomer(prev => prev ? { ...prev, points: prev.points - applicableTier.points } : null);
      }
      
      const coupon = createCoupon(customerId, applicableTier.discount, applicableTier.minPurchase);
      
      // Show notification or modal about the new coupon
      return coupon;
    }
  };

  const applyCoupon = (code: string) => {
    setCouponError('');
    
    if (!currentCustomer) {
      setCouponError('Please join our loyalty program to use coupons.');
      return;
    }
    
    const coupon = coupons.find(c => 
      c.code === code.toUpperCase() && 
      !c.isUsed && 
      c.issuedTo === currentCustomer.email &&
      c.expiryDate > new Date()
    );
    
    if (!coupon) {
      setCouponError('Invalid, expired, or already used coupon code.');
      return;
    }
    
    const total = cartTotal;
    if (total < coupon.minPurchase) {
      setCouponError(`Minimum purchase of $${coupon.minPurchase} required for this coupon.`);
      return;
    }
    
    setAppliedCoupon(coupon);
    setCouponCode('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

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
  
  const discountAmount = appliedCoupon ? (cartTotal * appliedCoupon.discountPercent / 100) : 0;
  const finalTotal = cartTotal - discountAmount;

  const processCheckout = () => {
    if (!currentCustomer) {
      setShowCustomerForm(true);
      return;
    }
    
    // Process the transaction
    const pointsEarned = Math.floor(finalTotal); // 1 point per dollar
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      customerId: currentCustomer.id,
      amount: finalTotal,
      pointsEarned,
      date: new Date(),
      items: [...cart],
      couponUsed: appliedCoupon?.code,
      discountAmount
    };
    
    setTransactions(prev => [...prev, transaction]);
    
    // Update customer
    setCustomers(prev => prev.map(customer => 
      customer.id === currentCustomer.id 
        ? { 
            ...customer, 
            points: customer.points + pointsEarned,
            totalSpent: customer.totalSpent + finalTotal
          }
        : customer
    ));
    
    setCurrentCustomer(prev => prev ? {
      ...prev,
      points: prev.points + pointsEarned,
      totalSpent: prev.totalSpent + finalTotal
    } : null);
    
    // Mark coupon as used
    if (appliedCoupon) {
      setCoupons(prev => prev.map(coupon =>
        coupon.id === appliedCoupon.id
          ? { ...coupon, isUsed: true }
          : coupon
      ));
    }
    
    // Check for new rewards
    setTimeout(() => {
      checkPointsForRewards(currentCustomer.id);
    }, 1000);
    
    // Clear cart and coupon
    setCart([]);
    setAppliedCoupon(null);
    
    // Show success message (you could implement a success modal here)
    alert(`Thank you for your purchase! You earned ${pointsEarned} points.`);
  };

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

  // Customer management
  const handleCustomerSubmit = (formData: FormData) => {
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const referralCode = formData.get('referralCode') as string;
    
    // Check if customer already exists
    let customer = customers.find(c => c.email === email);
    
    if (!customer) {
      customer = createCustomer(email, name);
      
      // Check if they were referred
      if (referralCode) {
        const referrer = customers.find(c => c.referralCode === referralCode.toUpperCase());
        if (referrer) {
          customer.referredBy = referrer.id;
          // Award referral points to referrer
          awardPoints(referrer.id, 50, 'Referral bonus');
          // Award welcome points to new customer
          customer.points = 25;
        }
      }
      
      setCustomers(prev => [...prev, customer!]);
    }
    
    setCurrentCustomer(customer);
    setShowCustomerForm(false);
    
    // If they were trying to checkout, process it now
    if (cart.length > 0) {
      processCheckout();
    }
  };

  // Reservation handling
  const handleReservationSubmit = (formData: FormData) => {
    const reservation: Reservation = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      guests: parseInt(formData.get('guests') as string),
      timestamp: new Date()
    };

    setReservationData(reservation);
    setShowReservationConfirm(true);

    // Save to localStorage for admin tracking
    const existingReservations = JSON.parse(localStorage.getItem('brewmaster_reservations') || '[]');
    localStorage.setItem('brewmaster_reservations', JSON.stringify([...existingReservations, reservation]));
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

Loyalty Program Information:
- Customers earn 1 point per dollar spent
- Reward tiers: 100 points = 5% off ($25 min), 250 points = 10% off ($50 min), 500 points = 15% off ($75 min), 1000 points = 20% off ($100 min)
- Referral program: 50 points for referrer, 25 points for new customer
- Coupons expire after 30 days

Help customers with:
- Product recommendations based on taste preferences
- Brewing techniques and coffee preparation advice
- Information about coffee origins and roasting
- Order assistance and product details
- Table reservation information
- Loyalty program questions and coupon usage
- General customer support

Be friendly, knowledgeable, and helpful. If customers ask about specific products, provide detailed information. If they need brewing advice, offer step-by-step guidance. For loyalty program questions, explain how to earn and redeem points.

Please format your response using proper markdown formatting for readability. Use **bold** for important information like product names and prices, and use bullet points or numbered lists where appropriate to organize information clearly. Avoid excessive asterisks and ensure clean, readable formatting.

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
      customers,
      coupons,
      transactions,
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
      localStorage.removeItem('brewmaster_reservations');
      localStorage.removeItem('brewmaster_customers');
      localStorage.removeItem('brewmaster_coupons');
      localStorage.removeItem('brewmaster_transactions');
      localStorage.removeItem('brewmaster_current_customer');
      
      setProducts([]);
      setCart([]);
      setTestimonials([]);
      setChatMessages([]);
      setCustomers([]);
      setCoupons([]);
      setTransactions([]);
      setCurrentCustomer(null);
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setActiveSection('products')}
              className="btn bg-amber-600 hover:bg-amber-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Shop Premium Coffee
            </button>
            {!currentCustomer && (
              <button
                onClick={() => setShowCustomerForm(true)}
                className="btn bg-transparent border-2 border-white text-white hover:bg-white hover:text-amber-600 font-semibold py-4 px-8 rounded-full transition-all duration-300"
              >
                Join Loyalty Program
              </button>
            )}
          </div>
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
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Loyalty Rewards</h3>
              <p className="text-gray-600 dark:text-slate-300">
                Earn points with every purchase and get exclusive discounts. Join our loyalty program today!
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
            
            {/* Coupon Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Apply Coupon
              </h3>
              
              {!appliedCoupon ? (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    className="flex-1 input"
                    maxLength={7}
                  />
                  <button
                    onClick={() => applyCoupon(couponCode)}
                    disabled={!couponCode.trim()}
                    className="btn btn-primary"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Tag className="w-5 h-5 text-green-600" />
                    <span className="text-green-800 dark:text-green-200 font-semibold">
                      {appliedCoupon.code} - {appliedCoupon.discountPercent}% OFF
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              {couponError && (
                <p className="text-red-500 text-sm mt-2">{couponError}</p>
              )}
              
              {!currentCustomer && (
                <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
                  <Gift className="w-4 h-4 inline mr-1" />
                  Join our loyalty program to access exclusive coupons!
                </p>
              )}
            </div>
            
            {/* Cart Summary */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600 dark:text-slate-300">
                  <span>Subtotal:</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({appliedCoupon.discountPercent}%):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-xl font-semibold text-gray-800 dark:text-white">
                    <span>Total:</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
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
                {currentCustomer && (
                  <div className="flex items-center text-sm text-amber-600">
                    <Award className="w-4 h-4 mr-2" />
                    You'll earn {Math.floor(finalTotal)} loyalty points with this purchase!
                  </div>
                )}
              </div>
              
              <button 
                onClick={processCheckout}
                className="w-full mt-6 btn btn-primary py-3 text-lg"
              >
                {currentCustomer ? 'Complete Purchase' : 'Join & Checkout'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderLoyalty = () => (
    <div id="loyalty-section" className="min-h-screen bg-gray-50 dark:bg-slate-900 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-white">
          Loyalty Program
        </h2>
        
        {currentCustomer ? (
          <div className="space-y-8">
            {/* Customer Dashboard */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Welcome back, {currentCustomer.name}!</h3>
                  <p className="opacity-90">Member since {currentCustomer.joinDate.toLocaleDateString()}</p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-3xl font-bold">{currentCustomer.points}</div>
                  <div className="text-sm opacity-90">Points Available</div>
                </div>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center">
                <Target className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Total Spent
                </h4>
                <p className="text-2xl font-bold text-amber-600">
                  ${currentCustomer.totalSpent.toFixed(2)}
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center">
                <Award className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Current Points
                </h4>
                <p className="text-2xl font-bold text-amber-600">
                  {currentCustomer.points}
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg text-center">
                <UserPlus className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Referral Code
                </h4>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-xl font-bold text-amber-600">
                    {currentCustomer.referralCode}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentCustomer.referralCode);
                      alert('Referral code copied!');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Available Coupons */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
                Your Coupons
              </h3>
              
              {coupons.filter(c => c.issuedTo === currentCustomer.email && !c.isUsed && c.expiryDate > new Date()).length === 0 ? (
                <div className="text-center py-8">
                  <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">
                    No active coupons. Keep shopping to earn more rewards!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coupons
                    .filter(c => c.issuedTo === currentCustomer.email && !c.isUsed && c.expiryDate > new Date())
                    .map((coupon) => (
                      <div
                        key={coupon.id}
                        className="border-2 border-dashed border-amber-300 rounded-lg p-4 bg-amber-50 dark:bg-amber-900"
                      >
                        <div className="text-center">
                          <h4 className="text-2xl font-bold text-amber-600 mb-2">
                            {coupon.discountPercent}% OFF
                          </h4>
                          <p className="font-mono text-lg font-semibold text-gray-800 dark:text-white mb-2">
                            {coupon.code}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-slate-300 mb-2">
                            Min. purchase: ${coupon.minPurchase}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-slate-400">
                            Expires: {coupon.expiryDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
            
            {/* Reward Tiers */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
                Reward Tiers
              </h3>
              
              <div className="space-y-4">
                {[
                  { points: 100, discount: 5, minPurchase: 25 },
                  { points: 250, discount: 10, minPurchase: 50 },
                  { points: 500, discount: 15, minPurchase: 75 },
                  { points: 1000, discount: 20, minPurchase: 100 }
                ].map((tier, index) => {
                  const isEarned = currentCustomer.points >= tier.points;
                  const progress = Math.min((currentCustomer.points / tier.points) * 100, 100);
                  
                  return (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {tier.discount}% OFF Coupon
                        </span>
                        <span className="text-sm text-gray-500 dark:text-slate-400">
                          {tier.points} points
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isEarned ? 'bg-green-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300">
                        {isEarned ? 'Tier unlocked!' : `${tier.points - currentCustomer.points} points needed`}
                        • Min. purchase: ${tier.minPurchase}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="w-16 h-16 text-amber-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
              Join Our Loyalty Program
            </h3>
            <p className="text-gray-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              Earn points with every purchase, get exclusive discounts, and enjoy special perks. 
              Plus, refer friends and earn bonus points!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <TrendingUp className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Earn Points
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  1 point per $1 spent
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <Percent className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Get Discounts
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  Up to 20% off rewards
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <UserPlus className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Refer Friends
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  50 bonus points per referral
                </p>
              </div>
              
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
                <Gift className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Welcome Bonus
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-300">
                  25 points just for joining
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowCustomerForm(true)}
              className="btn btn-primary btn-lg"
            >
              Join Now - It's Free!
            </button>
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
                <a 
                  href={`mailto:${storeSettings.contactEmail}`}
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors underline"
                >
                  {storeSettings.contactEmail}
                </a>
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

            {/* Reserve a Table Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-2 mb-4">
                <Users className="w-6 h-6 text-amber-600" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Reserve a Table
                </h3>
              </div>
              <p className="text-gray-600 dark:text-slate-300 mb-6">
                Join us for an exceptional coffee experience in our cozy cafe space.
              </p>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleReservationSubmit(new FormData(e.currentTarget));
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Name</label>
                    <input 
                      name="name"
                      type="text" 
                      className="input" 
                      placeholder="Your name" 
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Email</label>
                    <input 
                      name="email"
                      type="email" 
                      className="input" 
                      placeholder="your@email.com" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">Date</label>
                    <input 
                      name="date"
                      type="date" 
                      className="input" 
                      min={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Time</label>
                    <select name="time" className="input" required>
                      <option value="">Select time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                      <option value="18:00">6:00 PM</option>
                      <option value="19:00">7:00 PM</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Guests</label>
                    <select name="guests" className="input" required>
                      <option value="">Guests</option>
                      <option value="1">1 Guest</option>
                      <option value="2">2 Guests</option>
                      <option value="3">3 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="5">5 Guests</option>
                      <option value="6">6+ Guests</option>
                    </select>
                  </div>
                </div>
                
                <button type="submit" className="w-full btn btn-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reserve Table
                </button>
              </form>
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
            
            {/* Loyalty Management */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Loyalty Program
                </h3>
                <button
                  onClick={() => setShowCouponModal(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Gift className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-amber-50 dark:bg-amber-900 p-3 rounded-lg">
                    <div className="text-lg font-bold text-amber-600">{customers.length}</div>
                    <div className="text-xs text-amber-700 dark:text-amber-300">Members</div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{coupons.filter(c => !c.isUsed).length}</div>
                    <div className="text-xs text-green-700 dark:text-green-300">Active Coupons</div>
                  </div>
                </div>
                
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {customers.slice(0, 5).map((customer) => (
                    <div
                      key={customer.id}
                      className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded text-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">{customer.name}</p>
                        <p className="text-gray-500 dark:text-slate-400 text-xs">{customer.points} points</p>
                      </div>
                      <div className="text-amber-600 font-semibold">
                        ${customer.totalSpent.toFixed(0)}
                      </div>
                    </div>
                  ))}
                  {customers.length > 5 && (
                    <p className="text-center text-gray-500 dark:text-slate-400 text-xs">
                      +{customers.length - 5} more members
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Additional Management Sections */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            
            {/* Data Management */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">
                Data Management
              </h3>
              
              <div className="space-y-4">
                <button
                  onClick={downloadData}
                  className="w-full btn bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export All Data</span>
                </button>
                
                <button
                  onClick={clearAllData}
                  className="w-full btn bg-red-600 text-white hover:bg-red-700 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All Data</span>
                </button>
                
                <div className="text-xs text-gray-500 dark:text-slate-400 text-center pt-2">
                  <p>Export includes: products, customers, coupons, transactions, and settings</p>
                </div>
              </div>
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
                { id: 'loyalty', label: 'Loyalty' },
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
              {currentCustomer && (
                <button
                  onClick={() => setShowLoyaltyModal(true)}
                  className="hidden md:flex items-center space-x-2 text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <Award className="w-5 h-5" />
                  <span className="text-sm font-semibold">{currentCustomer.points} pts</span>
                </button>
              )}
              
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
        {activeSection === 'loyalty' && renderLoyalty()}
        {activeSection === 'about' && renderAbout()}
        {activeSection === 'contact' && renderContact()}
        {activeSection === 'settings' && renderSettings()}
      </main>
      
      {/* Customer Form Modal */}
      {showCustomerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Join Loyalty Program
              </h3>
              <button
                onClick={() => setShowCustomerForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCustomerSubmit(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="form-label">Full Name</label>
                <input
                  name="name"
                  type="text"
                  className="input"
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Email Address</label>
                <input
                  name="email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="form-label">Referral Code (Optional)</label>
                <input
                  name="referralCode"
                  type="text"
                  className="input"
                  placeholder="Enter referral code"
                  maxLength={7}
                />
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Get 25 bonus points if you were referred by a friend!
                </p>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Welcome Benefits:
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  <li>• 25 welcome points (or 50 with referral)</li>
                  <li>• 1 point per $1 spent</li>
                  <li>• Exclusive discount coupons</li>
                  <li>• Birthday rewards</li>
                </ul>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCustomerForm(false)}
                  className="flex-1 btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  Join Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loyalty Modal (Quick View) */}
      {showLoyaltyModal && currentCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Your Loyalty Status
              </h3>
              <button
                onClick={() => setShowLoyaltyModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-amber-600 mb-2">
                {currentCustomer.points}
              </div>
              <div className="text-gray-600 dark:text-slate-300">Points Available</div>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-300">Total Spent:</span>
                <span className="font-semibold text-gray-800 dark:text-white">
                  ${currentCustomer.totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-slate-300">Referral Code:</span>
                <span className="font-mono font-semibold text-amber-600">
                  {currentCustomer.referralCode}
                </span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowLoyaltyModal(false);
                  setActiveSection('loyalty');
                }}
                className="w-full btn btn-primary"
              >
                View Full Dashboard
              </button>
              <button
                onClick={() => setShowLoyaltyModal(false)}
                className="w-full btn bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Coupon Modal */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Generate Coupon
              </h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const customerEmail = formData.get('customerEmail') as string;
                const discountPercent = parseInt(formData.get('discountPercent') as string);
                const minPurchase = parseFloat(formData.get('minPurchase') as string);
                
                const customer = customers.find(c => c.email === customerEmail);
                if (customer) {
                  createCoupon(customer.id, discountPercent, minPurchase);
                  setShowCouponModal(false);
                } else {
                  alert('Customer not found');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="form-label">Customer Email</label>
                <select name="customerEmail" className="input" required>
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.email}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="form-label">Discount Percentage</label>
                <select name="discountPercent" className="input" required>
                  <option value="5">5%</option>
                  <option value="10">10%</option>
                  <option value="15">15%</option>
                  <option value="20">20%</option>
                  <option value="25">25%</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">Minimum Purchase Amount</label>
                <input
                  name="minPurchase"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="25"
                  className="input"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  Generate Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <p>Hi! I'm your coffee assistant. Ask me about our products, brewing tips, loyalty program, table reservations, or anything coffee-related!</p>
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
                      {message.type === 'bot' && <Bot className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />}
                      {message.type === 'user' && <UserIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        {message.type === 'bot' ? (
                          <div className={`text-sm ${styles.chatMessage}`}>
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}
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
                  placeholder="Ask about coffee, loyalty points, reservations..."
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

      {/* Reservation Confirmation Modal */}
      {showReservationConfirm && reservationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Reservation Confirmed!
              </h3>
              <div className="text-sm text-gray-500 dark:text-slate-400 space-y-1">
                <p><strong>Name:</strong> {reservationData.name}</p>
                <p><strong>Email:</strong> {reservationData.email}</p>
                <p><strong>Date:</strong> {new Date(reservationData.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {reservationData.time}</p>
                <p><strong>Guests:</strong> {reservationData.guests}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-300 mt-4">
                We'll send you a confirmation email shortly. Looking forward to serving you!
              </p>
              <button
                onClick={() => {
                  setShowReservationConfirm(false);
                  setReservationData(null);
                }}
                className="mt-6 w-full btn btn-primary"
              >
                Great!
              </button>
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
                <li><button onClick={() => setActiveSection('loyalty')} className="hover:text-white transition-colors">Loyalty</button></li>
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
                  <a 
                    href={`mailto:${storeSettings.contactEmail}`}
                    className="hover:text-white transition-colors"
                  >
                    {storeSettings.contactEmail}
                  </a>
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