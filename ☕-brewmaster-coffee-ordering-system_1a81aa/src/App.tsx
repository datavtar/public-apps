import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Coffee, ShoppingCart, User, Settings, BarChart3, Package, Star, Heart,
  Plus, Minus, X, Edit, Trash2, Download, Upload, Search, Filter,
  TrendingUp, Users, DollarSign, Calendar, Clock, Camera, Brain,
  FileText, Award, Target, CheckCircle, XCircle, AlertCircle,
  Menu, ChevronDown, ChevronUp, Eye, Zap, Sparkles
} from 'lucide-react';

// Types and Interfaces
interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: 'coffee' | 'tea' | 'pastries' | 'sandwiches' | 'specials';
  image: string;
  ingredients: string[];
  allergens: string[];
  available: boolean;
  popular: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  size: 'small' | 'medium' | 'large';
  milk: string;
  extras: string[];
  totalPrice: number;
  customizations: string[];
}

interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  orderDate: string;
  customerName: string;
  loyaltyPointsEarned: number;
  paymentMethod: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  loyaltyPoints: number;
  totalOrders: number;
  favoriteItems: string[];
  preferences: {
    milk: string;
    size: string;
    temperature: string;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  unit: string;
  cost: number;
  supplier: string;
  lastRestocked: string;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  topItems: string[];
}

type TabType = 'menu' | 'cart' | 'orders' | 'customers' | 'analytics' | 'inventory' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Main State
  const [activeTab, setActiveTab] = useState<TabType>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  // AI Integration State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Data States
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);

  // Settings State
  const [settings, setSettings] = useState({
    currency: 'USD',
    language: 'en',
    theme: 'light',
    timezone: 'UTC',
    loyaltyRate: 10, // points per dollar
    taxRate: 8.5,
    defaultOrderStatus: 'pending' as const
  });

  // UI State
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    saveData();
  }, [menu, orders, customers, inventory, settings, cart]);

  const loadData = () => {
    const savedMenu = localStorage.getItem('brewmaster_menu');
    const savedOrders = localStorage.getItem('brewmaster_orders');
    const savedCustomers = localStorage.getItem('brewmaster_customers');
    const savedInventory = localStorage.getItem('brewmaster_inventory');
    const savedSettings = localStorage.getItem('brewmaster_settings');
    const savedCart = localStorage.getItem('brewmaster_cart');
    const savedSalesData = localStorage.getItem('brewmaster_sales');

    if (savedMenu) {
      setMenu(JSON.parse(savedMenu));
    } else {
      setMenu(getInitialMenu());
    }

    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      setOrders(getInitialOrders());
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      setCustomers(getInitialCustomers());
    }

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      setInventory(getInitialInventory());
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    if (savedSalesData) {
      setSalesData(JSON.parse(savedSalesData));
    } else {
      setSalesData(getInitialSalesData());
    }
  };

  const saveData = () => {
    localStorage.setItem('brewmaster_menu', JSON.stringify(menu));
    localStorage.setItem('brewmaster_orders', JSON.stringify(orders));
    localStorage.setItem('brewmaster_customers', JSON.stringify(customers));
    localStorage.setItem('brewmaster_inventory', JSON.stringify(inventory));
    localStorage.setItem('brewmaster_settings', JSON.stringify(settings));
    localStorage.setItem('brewmaster_cart', JSON.stringify(cart));
    localStorage.setItem('brewmaster_sales', JSON.stringify(salesData));
  };

  const getInitialMenu = (): MenuItem[] => [
    {
      id: '1',
      name: 'Signature Espresso',
      description: 'Rich, bold espresso with perfect crema',
      basePrice: 3.50,
      category: 'coffee',
      image: 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=300',
      ingredients: ['Espresso beans', 'Water'],
      allergens: [],
      available: true,
      popular: true
    },
    {
      id: '2',
      name: 'Caramel Macchiato',
      description: 'Vanilla syrup, steamed milk, espresso, and caramel drizzle',
      basePrice: 5.25,
      category: 'coffee',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300',
      ingredients: ['Espresso', 'Steamed milk', 'Vanilla syrup', 'Caramel sauce'],
      allergens: ['Dairy'],
      available: true,
      popular: true
    },
    {
      id: '3',
      name: 'Croissant',
      description: 'Buttery, flaky pastry baked fresh daily',
      basePrice: 2.75,
      category: 'pastries',
      image: 'https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=300',
      ingredients: ['Flour', 'Butter', 'Eggs', 'Yeast'],
      allergens: ['Gluten', 'Dairy', 'Eggs'],
      available: true,
      popular: false
    },
    {
      id: '4',
      name: 'Avocado Toast',
      description: 'Multigrain bread topped with fresh avocado and seasonings',
      basePrice: 8.50,
      category: 'sandwiches',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300',
      ingredients: ['Multigrain bread', 'Avocado', 'Lime', 'Salt', 'Pepper'],
      allergens: ['Gluten'],
      available: true,
      popular: true
    },
    {
      id: '5',
      name: 'Green Tea Latte',
      description: 'Ceremonial grade matcha with steamed milk',
      basePrice: 4.75,
      category: 'tea',
      image: 'https://images.unsplash.com/photo-1515823808-2ada1ea6a90f?w=300',
      ingredients: ['Matcha powder', 'Steamed milk', 'Sugar'],
      allergens: ['Dairy'],
      available: true,
      popular: false
    },
    {
      id: '6',
      name: 'Seasonal Pumpkin Spice',
      description: 'Limited time fall favorite with real pumpkin',
      basePrice: 5.95,
      category: 'specials',
      image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=300',
      ingredients: ['Espresso', 'Pumpkin puree', 'Spices', 'Steamed milk'],
      allergens: ['Dairy'],
      available: true,
      popular: true
    }
  ];

  const getInitialOrders = (): Order[] => [
    {
      id: 'ord-001',
      items: [
        {
          ...getInitialMenu()[0],
          quantity: 2,
          size: 'medium',
          milk: 'Whole Milk',
          extras: ['Extra Shot'],
          totalPrice: 8.50,
          customizations: ['Extra hot']
        }
      ],
      totalAmount: 8.50,
      status: 'completed',
      orderDate: '2025-06-08T10:30:00Z',
      customerName: 'John Doe',
      loyaltyPointsEarned: 85,
      paymentMethod: 'Credit Card'
    },
    {
      id: 'ord-002',
      items: [
        {
          ...getInitialMenu()[1],
          quantity: 1,
          size: 'large',
          milk: 'Oat Milk',
          extras: ['Extra Caramel'],
          totalPrice: 6.25,
          customizations: []
        }
      ],
      totalAmount: 6.25,
      status: 'preparing',
      orderDate: '2025-06-09T09:15:00Z',
      customerName: 'Sarah Wilson',
      loyaltyPointsEarned: 63,
      paymentMethod: 'Mobile Pay'
    }
  ];

  const getInitialCustomers = (): Customer[] => [
    {
      id: 'cust-001',
      name: 'John Doe',
      email: 'john@example.com',
      loyaltyPoints: 150,
      totalOrders: 12,
      favoriteItems: ['1', '2'],
      preferences: {
        milk: 'Whole Milk',
        size: 'medium',
        temperature: 'hot'
      }
    },
    {
      id: 'cust-002',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      loyaltyPoints: 89,
      totalOrders: 8,
      favoriteItems: ['1', '5'],
      preferences: {
        milk: 'Oat Milk',
        size: 'large',
        temperature: 'extra hot'
      }
    }
  ];

  const getInitialInventory = (): InventoryItem[] => [
    {
      id: 'inv-001',
      name: 'Espresso Beans',
      category: 'Coffee',
      currentStock: 50,
      minStock: 10,
      unit: 'lbs',
      cost: 12.50,
      supplier: 'Premium Coffee Co.',
      lastRestocked: '2025-06-07'
    },
    {
      id: 'inv-002',
      name: 'Whole Milk',
      category: 'Dairy',
      currentStock: 25,
      minStock: 5,
      unit: 'gallons',
      cost: 3.25,
      supplier: 'Local Dairy Farm',
      lastRestocked: '2025-06-08'
    },
    {
      id: 'inv-003',
      name: 'Caramel Syrup',
      category: 'Syrups',
      currentStock: 8,
      minStock: 3,
      unit: 'bottles',
      cost: 8.75,
      supplier: 'Flavor House',
      lastRestocked: '2025-06-05'
    }
  ];

  const getInitialSalesData = (): SalesData[] => {
    const data: SalesData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 1000) + 500,
        orders: Math.floor(Math.random() * 50) + 20,
        topItems: ['Signature Espresso', 'Caramel Macchiato', 'Avocado Toast']
      });
    }
    return data;
  };

  // AI Functions
  const handleAiAnalysis = async (prompt: string, file?: File) => {
    if (!prompt?.trim() && !file) {
      setAiError("Please provide a prompt or select a file to analyze.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      let fullPrompt = prompt;
      if (file && file.type.startsWith('image/')) {
        fullPrompt = `${prompt || 'Analyze this food/beverage image'} and extract data. Return JSON with keys "name", "description", "estimated_price", "ingredients", "allergens", "nutritional_info", "category".`;
      }
      
      aiLayerRef.current?.sendToAI(fullPrompt, file);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const handleAiRecommendation = () => {
    const context = `Based on the coffee shop menu and customer preferences, recommend drinks. Customer info: ${currentUser?.first_name || 'Customer'} prefers quality coffee experiences. Return JSON with keys "recommended_items", "reasoning", "customizations".`;
    handleAiAnalysis(context);
  };

  // Cart Functions
  const addToCart = (item: MenuItem, customizations: any) => {
    const cartItem: CartItem = {
      ...item,
      quantity: customizations.quantity || 1,
      size: customizations.size || 'medium',
      milk: customizations.milk || 'Whole Milk',
      extras: customizations.extras || [],
      customizations: customizations.customizations || [],
      totalPrice: calculateItemPrice(item, customizations)
    };

    setCart(prev => {
      const existingIndex = prev.findIndex(
        (ci) => ci.id === item.id && 
        ci.size === cartItem.size && 
        ci.milk === cartItem.milk &&
        JSON.stringify(ci.extras) === JSON.stringify(cartItem.extras)
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += cartItem.quantity;
        updated[existingIndex].totalPrice = calculateItemPrice(item, {
          ...customizations,
          quantity: updated[existingIndex].quantity
        });
        return updated;
      } else {
        return [...prev, cartItem];
      }
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateCartItemQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index);
      return;
    }

    setCart(prev => {
      const updated = [...prev];
      updated[index].quantity = quantity;
      updated[index].totalPrice = calculateItemPrice(updated[index], { quantity });
      return updated;
    });
  };

  const calculateItemPrice = (item: MenuItem, customizations: any): number => {
    let price = item.basePrice;
    const quantity = customizations.quantity || 1;
    
    // Size multipliers
    const sizeMultipliers = { small: 0.8, medium: 1.0, large: 1.3 };
    price *= sizeMultipliers[customizations.size as keyof typeof sizeMultipliers] || 1.0;
    
    // Extras pricing
    const extraPrices: Record<string, number> = {
      'Extra Shot': 0.75,
      'Decaf': 0,
      'Extra Hot': 0,
      'Extra Foam': 0,
      'Light Foam': 0,
      'Extra Caramel': 0.50,
      'Extra Vanilla': 0.50,
      'Whipped Cream': 0.75
    };
    
    if (customizations.extras) {
      customizations.extras.forEach((extra: string) => {
        price += extraPrices[extra] || 0;
      });
    }
    
    return price * quantity;
  };

  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  // Order Functions
  const placeOrder = () => {
    if (cart.length === 0) return;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      items: [...cart],
      totalAmount: getCartTotal(),
      status: 'pending',
      orderDate: new Date().toISOString(),
      customerName: currentUser?.first_name + ' ' + currentUser?.last_name || 'Guest',
      loyaltyPointsEarned: Math.floor(getCartTotal() * settings.loyaltyRate),
      paymentMethod: 'Credit Card'
    };

    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    
    // Update sales data
    const today = new Date().toISOString().split('T')[0];
    setSalesData(prev => {
      const existing = prev.find(data => data.date === today);
      if (existing) {
        existing.revenue += newOrder.totalAmount;
        existing.orders += 1;
        return [...prev];
      } else {
        return [...prev, {
          date: today,
          revenue: newOrder.totalAmount,
          orders: 1,
          topItems: cart.map(item => item.name)
        }];
      }
    });

    setActiveTab('orders');
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status } : order
    ));
  };

  // Menu Management Functions
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: `item-${Date.now()}`
    };
    setMenu(prev => [...prev, newItem]);
  };

  const updateMenuItem = (item: MenuItem) => {
    setMenu(prev => prev.map(menuItem => 
      menuItem.id === item.id ? item : menuItem
    ));
    setEditingItem(null);
  };

  const deleteMenuItem = (itemId: string) => {
    setMenu(prev => prev.filter(item => item.id !== itemId));
  };

  // Utility Functions
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    const keys = [
      'brewmaster_menu', 'brewmaster_orders', 'brewmaster_customers',
      'brewmaster_inventory', 'brewmaster_settings', 'brewmaster_cart',
      'brewmaster_sales'
    ];
    keys.forEach(key => localStorage.removeItem(key));
    loadData();
  };

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  // Confirmation Dialog
  const showConfirmation = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmDialog(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmDialog(false);
    setConfirmAction(null);
  };

  // Navigation Component
  const Navigation = () => (
    <nav className="bg-white dark:bg-slate-800 shadow-lg border-b-2 border-amber-500 sticky top-0 z-50 theme-transition">
      <div className="container-fluid">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3" id="welcome_fallback">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">BrewMaster Coffee</h1>
              <p className="text-sm text-amber-600">Premium Coffee Experience</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {cart.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setActiveTab('cart')}
                  className="btn btn-primary relative"
                  id="cart-button"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </button>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome, {currentUser?.first_name}
              </span>
              <button
                onClick={logout}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300"
              >
                <User className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 pb-4 overflow-x-auto">
          {[
            { id: 'menu', label: 'Menu', icon: Coffee },
            { id: 'cart', label: 'Cart', icon: ShoppingCart },
            { id: 'orders', label: 'Orders', icon: Clock },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
              id={`${tab.id}-tab`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  // Menu Tab Component
  const MenuTab = () => (
    <div className="space-y-6" id="generation_issue_fallback">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Discover Our Menu</h2>
        <p className="opacity-90">Handcrafted beverages and fresh food made with love</p>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setShowAiModal(true)}
            className="btn bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all"
            id="ai-recommendations"
          >
            <Brain className="w-4 h-4 mr-2" />
            Get AI Recommendations
          </button>
          <button
            onClick={() => setShowAiModal(true)}
            className="btn bg-white bg-opacity-20 text-white hover:bg-opacity-30 transition-all"
          >
            <Camera className="w-4 h-4 mr-2" />
            Analyze Food Photo
          </button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['all', 'coffee', 'tea', 'pastries', 'sandwiches', 'specials'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === category
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
              }`}
              id={`category-${category}`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full sm:w-64"
            id="menu-search"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenu.map(item => (
          <div
            key={item.id}
            className="card hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => {
              setSelectedItem(item);
              setShowItemModal(true);
            }}
            id={`menu-item-${item.id}`}
          >
            <div className="relative">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              {item.popular && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Popular
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                <span className="text-lg font-bold text-amber-600">${item.basePrice.toFixed(2)}</span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {item.allergens.map(allergen => (
                  <span
                    key={allergen}
                    className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full dark:bg-red-900 dark:text-red-200"
                  >
                    {allergen}
                  </span>
                ))}
              </div>
              
              <button className="btn btn-primary w-full mt-3 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {currentUser && (
        <div className="mt-8">
          <button
            onClick={() => setEditingItem({} as MenuItem)}
            className="btn btn-primary"
            id="add-menu-item"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Menu Item
          </button>
        </div>
      )}
    </div>
  );

  // Item Customization Modal
  const ItemModal = () => {
    const [size, setSize] = useState('medium');
    const [milk, setMilk] = useState('Whole Milk');
    const [extras, setExtras] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [customizations, setCustomizations] = useState<string[]>([]);

    if (!selectedItem) return null;

    const availableExtras = [
      'Extra Shot', 'Decaf', 'Extra Hot', 'Extra Foam', 'Light Foam',
      'Extra Caramel', 'Extra Vanilla', 'Whipped Cream'
    ];

    const milkOptions = [
      'Whole Milk', 'Skim Milk', '2% Milk', 'Almond Milk', 'Oat Milk', 'Soy Milk', 'Coconut Milk'
    ];

    const currentPrice = calculateItemPrice(selectedItem, { size, extras, quantity });

    return (
      <div className="modal-backdrop" onClick={() => setShowItemModal(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-xl font-semibold">{selectedItem.name}</h3>
            <button
              onClick={() => setShowItemModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="space-y-6">
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="w-full h-64 object-cover rounded-lg"
            />
            
            <div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{selectedItem.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="input"
                  >
                    <option value="small">Small (-20%)</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large (+30%)</option>
                  </select>
                </div>
                
                {selectedItem.category === 'coffee' && (
                  <div>
                    <label className="form-label">Milk</label>
                    <select
                      value={milk}
                      onChange={(e) => setMilk(e.target.value)}
                      className="input"
                    >
                      {milkOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <label className="form-label">Extras</label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableExtras.map(extra => (
                      <label key={extra} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={extras.includes(extra)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setExtras(prev => [...prev, extra]);
                            } else {
                              setExtras(prev => prev.filter(x => x !== extra));
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{extra}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <div className="flex items-center justify-between w-full">
              <div className="text-2xl font-bold text-amber-600">
                ${currentPrice.toFixed(2)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowItemModal(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    addToCart(selectedItem, { size, milk, extras, quantity, customizations });
                    setShowItemModal(false);
                  }}
                  className="btn btn-primary"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cart Tab Component
  const CartTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Cart</h2>
        {cart.length > 0 && (
          <button
            onClick={() => showConfirmation("Clear all items from cart?", () => setCart([]))}
            className="btn bg-red-100 text-red-700 hover:bg-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </button>
        )}
      </div>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">Your cart is empty</h3>
          <p className="text-gray-400 mb-6">Add some delicious items to get started!</p>
          <button
            onClick={() => setActiveTab('menu')}
            className="btn btn-primary"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="card border-l-4 border-amber-500">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {item.size} • {item.milk}
                    </p>
                    {item.extras.length > 0 && (
                      <p className="text-sm text-amber-600">+{item.extras.join(', ')}</p>
                    )}
                    <p className="text-lg font-bold text-amber-600 mt-2">
                      ${item.totalPrice.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateCartItemQuantity(index, item.quantity - 1)}
                        className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateCartItemQuantity(index, item.quantity + 1)}
                        className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => removeFromCart(index)}
                      className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Subtotal:</span>
              <span className="text-lg">${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Tax ({settings.taxRate}%):</span>
              <span className="text-lg">${(getCartTotal() * settings.taxRate / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-6 text-xl font-bold">
              <span>Total:</span>
              <span className="text-amber-600">
                ${(getCartTotal() * (1 + settings.taxRate / 100)).toFixed(2)}
              </span>
            </div>
            
            <button
              onClick={placeOrder}
              className="btn btn-primary w-full text-lg py-3"
              id="place-order"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Place Order
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Orders Tab Component
  const OrdersTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Management</h2>
        <button
          onClick={() => downloadCSV(orders, 'orders.csv')}
          className="btn btn-primary"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Orders
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['pending', 'preparing', 'ready', 'completed'].map(status => {
          const statusOrders = orders.filter(order => order.status === status);
          const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            preparing: 'bg-blue-100 text-blue-800',
            ready: 'bg-green-100 text-green-800',
            completed: 'bg-gray-100 text-gray-800'
          };
          
          return (
            <div key={status} className="card">
              <h3 className="font-semibold mb-4 text-center">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[status as keyof typeof statusColors]}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({statusOrders.length})
                </span>
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {statusOrders.map(order => (
                  <div key={order.id} className="border rounded-lg p-3 bg-gray-50 dark:bg-slate-700">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">#{order.id.slice(-6)}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {order.customerName}
                    </p>
                    
                    <div className="text-sm space-y-1 mb-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>${item.totalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                      {status !== 'completed' && (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className="text-xs px-2 py-1 border rounded"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Analytics Tab Component  
  const AnalyticsTab = () => {
    const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
    const totalOrders = salesData.reduce((sum, data) => sum + data.orders, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            <div className="stat-desc">Last 7 days</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Total Orders</div>
            <div className="stat-value">{totalOrders}</div>
            <div className="stat-desc">Last 7 days</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Avg Order Value</div>
            <div className="stat-value">${avgOrderValue.toFixed(2)}</div>
            <div className="stat-desc">Per order</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Active Customers</div>
            <div className="stat-value">{customers.length}</div>
            <div className="stat-desc">Total registered</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Revenue</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {salesData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-amber-500 w-full rounded-t"
                    style={{ height: `${(data.revenue / Math.max(...salesData.map(d => d.revenue))) * 200}px` }}
                  ></div>
                  <span className="text-xs mt-2 text-center">
                    {new Date(data.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Popular Items</h3>
            <div className="space-y-3">
              {menu.filter(item => item.popular).map((item, index) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-amber-600 font-semibold">${item.basePrice.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // AI Modal Component
  const AiModal = () => (
    <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-600" />
            AI Assistant
          </h3>
          <button
            onClick={() => setShowAiModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">Ask for recommendations or analysis</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="What would you like to know about our menu? Or upload a food photo for analysis..."
              className="input min-h-24"
            />
          </div>
          
          <div>
            <label className="form-label">Upload Photo (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="input"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAiRecommendation}
              className="btn bg-purple-600 text-white hover:bg-purple-700"
              disabled={aiLoading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Recommendations
            </button>
            <button
              onClick={() => handleAiAnalysis(aiPrompt, selectedFile || undefined)}
              className="btn btn-primary"
              disabled={aiLoading || (!aiPrompt.trim() && !selectedFile)}
            >
              {aiLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          
          {aiError && (
            <div className="alert alert-error">
              <AlertCircle className="w-5 h-5" />
              <p>{aiError.message || 'An error occurred'}</p>
            </div>
          )}
          
          {aiResult && (
            <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">AI Analysis:</h4>
              <div className="whitespace-pre-wrap text-sm">{aiResult}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Settings Tab Component
  const SettingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="form-label">Currency</label>
              <select
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Language</label>
              <select
                value={settings.language}
                onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                className="input"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">Tax Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                className="input"
              />
            </div>
            
            <div>
              <label className="form-label">Loyalty Points Rate (per $1)</label>
              <input
                type="number"
                value={settings.loyaltyRate}
                onChange={(e) => setSettings(prev => ({ ...prev, loyaltyRate: parseInt(e.target.value) || 0 }))}
                className="input"
              />
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={() => downloadCSV(menu, 'menu-template.csv')}
              className="btn btn-primary w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Menu Template
            </button>
            
            <button
              onClick={() => downloadCSV(orders, 'orders.csv')}
              className="btn bg-blue-600 text-white hover:bg-blue-700 w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Orders
            </button>
            
            <button
              onClick={() => downloadCSV(customers, 'customers.csv')}
              className="btn bg-green-600 text-white hover:bg-green-700 w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Customers
            </button>
            
            <button
              onClick={() => showConfirmation(
                "This will permanently delete all data. Are you sure?",
                clearAllData
              )}
              className="btn bg-red-600 text-white hover:bg-red-700 w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Confirmation Dialog Component
  const ConfirmDialog = () => (
    <div className="modal-backdrop">
      <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-semibold">Confirm Action</h3>
        </div>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">{confirmMessage}</p>
        
        <div className="modal-footer">
          <button
            onClick={() => setShowConfirmDialog(false)}
            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      <Navigation />
      
      <main className="container-fluid py-6">
        {activeTab === 'menu' && <MenuTab />}
        {activeTab === 'cart' && <CartTab />}
        {activeTab === 'orders' && <OrdersTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>
      
      {showItemModal && <ItemModal />}
      {showAiModal && <AiModal />}
      {showConfirmDialog && <ConfirmDialog />}
      
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-12 theme-transition">
        <div className="container-fluid text-center text-gray-600 dark:text-gray-400">
          <p>Copyright © 2025 Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;