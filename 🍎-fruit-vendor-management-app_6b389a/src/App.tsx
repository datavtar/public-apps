import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, Package, TrendingUp, DollarSign, Camera, Download, Upload,
  Search, Filter, Plus, Edit, Trash2, Calendar, BarChart3,
  PieChart, Users, ShoppingCart, Eye, Settings, Sun, Moon,
  LogOut, Home, Smartphone, CreditCard, Receipt, Target,
  ArrowUp, ArrowDown, Star, CheckCircle, AlertTriangle
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Fruit {
  id: string;
  name: string;
  nameMarathi: string;
  quantity: number;
  unit: 'kg' | 'dozen' | 'piece';
  buyPrice: number;
  sellPrice: number;
  category: string;
  quality: 'Premium' | 'Good' | 'Average';
  supplier: string;
  purchaseDate: string;
  expiryDate: string;
  image?: string;
}

interface Sale {
  id: string;
  items: SaleItem[];
  customerId?: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  date: string;
  discount: number;
}

interface SaleItem {
  fruitId: string;
  fruitName: string;
  quantity: number;
  price: number;
  total: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  lastPurchase: string;
  loyalty: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

interface DashboardStats {
  totalRevenue: number;
  dailySales: number;
  inventoryValue: number;
  lowStockItems: number;
  totalCustomers: number;
  todayOrders: number;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  // Data States
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Form States
  const [showAddFruit, setShowAddFruit] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [editingFruit, setEditingFruit] = useState<Fruit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sale Form States
  const [saleForm, setSaleForm] = useState({
    customerName: '',
    customerPhone: '',
    items: [] as SaleItem[],
    paymentMethod: 'cash' as 'cash' | 'upi' | 'card',
    discount: 0
  });
  
  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  // Sample data initialization
  useEffect(() => {
    const initializeData = () => {
      // Initialize fruits if not present
      const storedFruits = localStorage.getItem('fruits');
      if (!storedFruits) {
        const sampleFruits: Fruit[] = [
          {
            id: '1',
            name: 'Apple',
            nameMarathi: 'सफरचंद',
            quantity: 50,
            unit: 'kg',
            buyPrice: 80,
            sellPrice: 120,
            category: 'Seasonal',
            quality: 'Premium',
            supplier: 'Mumbai Wholesale',
            purchaseDate: '2025-01-10',
            expiryDate: '2025-01-25'
          },
          {
            id: '2',
            name: 'Banana',
            nameMarathi: 'केळी',
            quantity: 30,
            unit: 'dozen',
            buyPrice: 40,
            sellPrice: 60,
            category: 'Daily',
            quality: 'Good',
            supplier: 'Local Farm',
            purchaseDate: '2025-01-12',
            expiryDate: '2025-01-18'
          },
          {
            id: '3',
            name: 'Orange',
            nameMarathi: 'संत्रा',
            quantity: 25,
            unit: 'kg',
            buyPrice: 60,
            sellPrice: 90,
            category: 'Citrus',
            quality: 'Premium',
            supplier: 'Nagpur Direct',
            purchaseDate: '2025-01-11',
            expiryDate: '2025-01-20'
          },
          {
            id: '4',
            name: 'Mango',
            nameMarathi: 'आंबा',
            quantity: 15,
            unit: 'piece',
            buyPrice: 25,
            sellPrice: 40,
            category: 'Premium',
            quality: 'Premium',
            supplier: 'Ratnagiri Farms',
            purchaseDate: '2025-01-13',
            expiryDate: '2025-01-23'
          }
        ];
        setFruits(sampleFruits);
        localStorage.setItem('fruits', JSON.stringify(sampleFruits));
      } else {
        setFruits(JSON.parse(storedFruits));
      }
      
      // Initialize sales
      const storedSales = localStorage.getItem('sales');
      if (!storedSales) {
        const sampleSales: Sale[] = [
          {
            id: '1',
            items: [{ fruitId: '1', fruitName: 'Apple', quantity: 2, price: 120, total: 240 }],
            customerName: 'राम पाटील',
            customerPhone: '9876543210',
            totalAmount: 240,
            paymentMethod: 'upi',
            date: '2025-01-13',
            discount: 0
          }
        ];
        setSales(sampleSales);
        localStorage.setItem('sales', JSON.stringify(sampleSales));
      } else {
        setSales(JSON.parse(storedSales));
      }
      
      // Initialize customers
      const storedCustomers = localStorage.getItem('customers');
      if (!storedCustomers) {
        const sampleCustomers: Customer[] = [
          {
            id: '1',
            name: 'राम पाटील',
            phone: '9876543210',
            address: 'पुणे',
            totalPurchases: 5200,
            lastPurchase: '2025-01-13',
            loyalty: 'Gold'
          }
        ];
        setCustomers(sampleCustomers);
        localStorage.setItem('customers', JSON.stringify(sampleCustomers));
      } else {
        setCustomers(JSON.parse(storedCustomers));
      }
    };
    
    initializeData();
  }, []);
  
  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('fruits', JSON.stringify(fruits));
  }, [fruits]);
  
  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);
  
  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  // Utility Functions
  const calculateDashboardStats = (): DashboardStats => {
    const today = new Date().toISOString().split('T')[0];
    const todaySales = sales.filter(sale => sale.date === today);
    const dailySales = todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const inventoryValue = fruits.reduce((sum, fruit) => sum + (fruit.quantity * fruit.buyPrice), 0);
    const lowStockItems = fruits.filter(fruit => fruit.quantity < 10).length;
    
    return {
      totalRevenue,
      dailySales,
      inventoryValue,
      lowStockItems,
      totalCustomers: customers.length,
      todayOrders: todaySales.length
    };
  };
  
  const filteredFruits = fruits.filter(fruit => {
    const matchesSearch = fruit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         fruit.nameMarathi.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || fruit.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  const categories = ['all', ...Array.from(new Set(fruits.map(fruit => fruit.category)))];
  
  // CRUD Functions
  const addFruit = (fruitData: Omit<Fruit, 'id'>) => {
    const newFruit: Fruit = {
      ...fruitData,
      id: Date.now().toString()
    };
    setFruits(prev => [...prev, newFruit]);
    setShowAddFruit(false);
  };
  
  const updateFruit = (updatedFruit: Fruit) => {
    setFruits(prev => prev.map(fruit => 
      fruit.id === updatedFruit.id ? updatedFruit : fruit
    ));
    setEditingFruit(null);
  };
  
  const deleteFruit = (id: string) => {
    setFruits(prev => prev.filter(fruit => fruit.id !== id));
  };
  
  const addSale = () => {
    if (saleForm.items.length === 0) return;
    
    const totalAmount = saleForm.items.reduce((sum, item) => sum + item.total, 0) - saleForm.discount;
    
    const newSale: Sale = {
      id: Date.now().toString(),
      items: [...saleForm.items],
      customerName: saleForm.customerName,
      customerPhone: saleForm.customerPhone,
      totalAmount,
      paymentMethod: saleForm.paymentMethod,
      date: new Date().toISOString().split('T')[0],
      discount: saleForm.discount
    };
    
    // Update inventory
    const updatedFruits = fruits.map(fruit => {
      const soldItem = saleForm.items.find(item => item.fruitId === fruit.id);
      if (soldItem) {
        return { ...fruit, quantity: fruit.quantity - soldItem.quantity };
      }
      return fruit;
    });
    
    setFruits(updatedFruits);
    setSales(prev => [...prev, newSale]);
    
    // Update or add customer
    const existingCustomerIndex = customers.findIndex(c => c.phone === saleForm.customerPhone);
    if (existingCustomerIndex >= 0) {
      const updatedCustomers = [...customers];
      updatedCustomers[existingCustomerIndex] = {
        ...updatedCustomers[existingCustomerIndex],
        totalPurchases: updatedCustomers[existingCustomerIndex].totalPurchases + totalAmount,
        lastPurchase: new Date().toISOString().split('T')[0]
      };
      setCustomers(updatedCustomers);
    } else if (saleForm.customerName && saleForm.customerPhone) {
      const newCustomer: Customer = {
        id: Date.now().toString(),
        name: saleForm.customerName,
        phone: saleForm.customerPhone,
        address: '',
        totalPurchases: totalAmount,
        lastPurchase: new Date().toISOString().split('T')[0],
        loyalty: totalAmount > 5000 ? 'Gold' : totalAmount > 2000 ? 'Silver' : 'Bronze'
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    
    // Reset form
    setSaleForm({
      customerName: '',
      customerPhone: '',
      items: [],
      paymentMethod: 'cash',
      discount: 0
    });
    setShowSaleModal(false);
  };
  
  const addItemToSale = (fruit: Fruit, quantity: number) => {
    const existingItemIndex = saleForm.items.findIndex(item => item.fruitId === fruit.id);
    const total = quantity * fruit.sellPrice;
    
    if (existingItemIndex >= 0) {
      const updatedItems = [...saleForm.items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity,
        total: updatedItems[existingItemIndex].total + total
      };
      setSaleForm(prev => ({ ...prev, items: updatedItems }));
    } else {
      const newItem: SaleItem = {
        fruitId: fruit.id,
        fruitName: fruit.name,
        quantity,
        price: fruit.sellPrice,
        total
      };
      setSaleForm(prev => ({ ...prev, items: [...prev.items, newItem] }));
    }
  };
  
  // AI Functions
  const handleAIAnalysis = (analysisType: 'quality' | 'price' | 'inventory') => {
    let prompt = '';
    
    switch (analysisType) {
      case 'quality':
        if (selectedImage) {
          prompt = 'Analyze this fruit image and provide quality assessment. Return JSON with keys "quality", "freshness", "ripeness", "defects", "sellability", "recommendations".';
        } else {
          prompt = 'Analyze current fruit inventory quality and provide recommendations for maintaining freshness and reducing waste.';
        }
        break;
      case 'price':
        prompt = `Analyze market prices for fruits and suggest optimal pricing. Current inventory: ${JSON.stringify(fruits.map(f => ({ name: f.name, buyPrice: f.buyPrice, sellPrice: f.sellPrice, category: f.category })))}. Return JSON with "priceAnalysis", "recommendations", "marketTrends".`;
        break;
      case 'inventory':
        prompt = `Analyze inventory levels and suggest restocking. Current stock: ${JSON.stringify(fruits.map(f => ({ name: f.name, quantity: f.quantity, unit: f.unit, expiryDate: f.expiryDate })))}. Return JSON with "lowStock", "expiringItems", "restockSuggestions".`;
        break;
    }
    
    setAiPrompt(prompt);
    setAiResult(null);
    setAiError(null);
    
    try {
      if (selectedImage && analysisType === 'quality') {
        aiLayerRef.current?.sendToAI(prompt, selectedImage);
      } else {
        aiLayerRef.current?.sendToAI(prompt);
      }
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };
  
  const exportData = (type: 'inventory' | 'sales' | 'customers') => {
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'inventory':
        data = fruits;
        filename = 'inventory.csv';
        break;
      case 'sales':
        data = sales;
        filename = 'sales.csv';
        break;
      case 'customers':
        data = customers;
        filename = 'customers.csv';
        break;
    }
    
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [headers, ...data.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    )].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  
  const stats = calculateDashboardStats();
  
  // Render Functions
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">आजचा विक्री</div>
              <div className="stat-value">₹{stats.dailySales}</div>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">एकूण उत्पन्न</div>
              <div className="stat-value">₹{stats.totalRevenue}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">स्टॉक व्हॅल्यू</div>
              <div className="stat-value">₹{stats.inventoryValue}</div>
            </div>
            <Package className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">कमी स्टॉक</div>
              <div className="stat-value">{stats.lowStockItems}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">ग्राहक</div>
              <div className="stat-value">{stats.totalCustomers}</div>
            </div>
            <Users className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">आजचे ऑर्डर</div>
              <div className="stat-value">{stats.todayOrders}</div>
            </div>
            <ShoppingCart className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">झटपट कार्य</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setShowAddFruit(true)}
            className="btn btn-primary flex flex-col items-center gap-2 p-4"
            id="add-fruit-quick"
          >
            <Plus className="h-6 w-6" />
            <span>फळ जोडा</span>
          </button>
          
          <button
            onClick={() => setShowSaleModal(true)}
            className="btn bg-green-600 text-white hover:bg-green-700 flex flex-col items-center gap-2 p-4"
            id="new-sale-quick"
          >
            <ShoppingCart className="h-6 w-6" />
            <span>नवीन सेल</span>
          </button>
          
          <button
            onClick={() => handleAIAnalysis('inventory')}
            className="btn bg-purple-600 text-white hover:bg-purple-700 flex flex-col items-center gap-2 p-4"
            id="ai-analysis-quick"
          >
            <BarChart3 className="h-6 w-6" />
            <span>AI विश्लेषण</span>
          </button>
          
          <button
            onClick={() => exportData('sales')}
            className="btn bg-orange-600 text-white hover:bg-orange-700 flex flex-col items-center gap-2 p-4"
            id="export-quick"
          >
            <Download className="h-6 w-6" />
            <span>डाउनलोड</span>
          </button>
        </div>
      </div>
      
      {/* Recent Sales */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">अलीकडील विक्री</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">ग्राहक</th>
                <th className="table-header">रक्कम</th>
                <th className="table-header">दिनांक</th>
                <th className="table-header">पेमेंट</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {sales.slice(-5).reverse().map(sale => (
                <tr key={sale.id}>
                  <td className="table-cell">{sale.customerName}</td>
                  <td className="table-cell">₹{sale.totalAmount}</td>
                  <td className="table-cell">{sale.date}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      sale.paymentMethod === 'cash' ? 'badge-success' :
                      sale.paymentMethod === 'upi' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {sale.paymentMethod.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  
  const renderInventory = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">फळांचा साठा (Inventory)</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowAddFruit(true)}
            className="btn btn-primary flex items-center gap-2"
            id="add-fruit-btn"
          >
            <Plus className="h-4 w-4" />
            नवीन फळ जोडा
          </button>
          <button
            onClick={() => exportData('inventory')}
            className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="फळ शोधा..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                id="search-fruits"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
              id="filter-category"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'सर्व श्रेणी' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* Inventory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredFruits.map(fruit => (
          <div key={fruit.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{fruit.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{fruit.nameMarathi}</p>
              </div>
              <span className={`badge ${
                fruit.quality === 'Premium' ? 'badge-success' :
                fruit.quality === 'Good' ? 'badge-info' : 'badge-warning'
              }`}>
                {fruit.quality}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">स्टॉक:</span>
                <span className={`font-medium ${
                  fruit.quantity < 10 ? 'text-red-600' : 
                  fruit.quantity < 20 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {fruit.quantity} {fruit.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">खरेदी दर:</span>
                <span>₹{fruit.buyPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">विक्री दर:</span>
                <span className="font-semibold text-green-600">₹{fruit.sellPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">श्रेणी:</span>
                <span>{fruit.category}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setEditingFruit(fruit)}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex-1 flex items-center justify-center gap-1"
              >
                <Edit className="h-4 w-4" />
                संपादित करा
              </button>
              <button
                onClick={() => deleteFruit(fruit.id)}
                className="btn bg-red-600 text-white hover:bg-red-700 px-3"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredFruits.length === 0 && (
        <div className="card text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">कोणतेही फळ सापडले नाही</h3>
          <p className="text-gray-500 dark:text-gray-500">नवीन फळ जोडा किंवा शोध बदला</p>
        </div>
      )}
    </div>
  );
  
  const renderSales = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">विक्री रेकॉर्ड (Sales)</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSaleModal(true)}
            className="btn btn-primary flex items-center gap-2"
            id="new-sale-btn"
          >
            <Plus className="h-4 w-4" />
            नवीन सेल
          </button>
          <button
            onClick={() => exportData('sales')}
            className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th className="table-header">ID</th>
              <th className="table-header">ग्राहक</th>
              <th className="table-header">फोन</th>
              <th className="table-header">रक्कम</th>
              <th className="table-header">पेमेंट</th>
              <th className="table-header">दिनांक</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            {sales.slice().reverse().map(sale => (
              <tr key={sale.id}>
                <td className="table-cell">#{sale.id.slice(-4)}</td>
                <td className="table-cell">{sale.customerName}</td>
                <td className="table-cell">{sale.customerPhone}</td>
                <td className="table-cell font-semibold">₹{sale.totalAmount}</td>
                <td className="table-cell">
                  <span className={`badge ${
                    sale.paymentMethod === 'cash' ? 'badge-success' :
                    sale.paymentMethod === 'upi' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {sale.paymentMethod.toUpperCase()}
                  </span>
                </td>
                <td className="table-cell">{sale.date}</td>
                <td className="table-cell">
                  <button className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700">
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  const renderCustomers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">ग्राहक (Customers)</h2>
        <button
          onClick={() => exportData('customers')}
          className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(customer => (
          <div key={customer.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{customer.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{customer.phone}</p>
              </div>
              <span className={`badge ${
                customer.loyalty === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                customer.loyalty === 'Gold' ? 'badge-warning' :
                customer.loyalty === 'Silver' ? 'bg-gray-100 text-gray-800' : 'badge-info'
              }`}>
                {customer.loyalty}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">एकूण खरेदी:</span>
                <span className="font-semibold">₹{customer.totalPurchases}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">शेवटची खरेदी:</span>
                <span>{customer.lastPurchase}</span>
              </div>
              {customer.address && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">पत्ता:</span>
                  <span>{customer.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  const renderAI = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">AI सहायक (AI Assistant)</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI विश्लेषण</h3>
          <div className="space-y-4">
            <button
              onClick={() => handleAIAnalysis('quality')}
              className="btn bg-green-600 text-white hover:bg-green-700 w-full flex items-center gap-2"
              disabled={aiLoading}
              id="ai-quality-analysis"
            >
              <CheckCircle className="h-4 w-4" />
              गुणवत्ता तपासणी
            </button>
            
            <button
              onClick={() => handleAIAnalysis('price')}
              className="btn bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center gap-2"
              disabled={aiLoading}
              id="ai-price-analysis"
            >
              <DollarSign className="h-4 w-4" />
              किंमत विश्लेषण
            </button>
            
            <button
              onClick={() => handleAIAnalysis('inventory')}
              className="btn bg-purple-600 text-white hover:bg-purple-700 w-full flex items-center gap-2"
              disabled={aiLoading}
              id="ai-inventory-analysis"
            >
              <Package className="h-4 w-4" />
              स्टॉक विश्लेषण
            </button>
          </div>
        </div>
        
        {/* Image Upload for Quality Check */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">फळ गुणवत्ता तपासणी</h3>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              className="input"
              id="fruit-image-upload"
            />
            {selectedImage && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                निवडलेली फाइल: {selectedImage.name}
              </div>
            )}
            <button
              onClick={() => handleAIAnalysis('quality')}
              disabled={!selectedImage || aiLoading}
              className="btn btn-primary w-full flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              फोटो विश्लेषण करा
            </button>
          </div>
        </div>
      </div>
      
      {/* AI Results */}
      {aiLoading && (
        <div className="card text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>AI विश्लेषण करत आहे...</p>
        </div>
      )}
      
      {aiError && (
        <div className="alert alert-error">
          <AlertTriangle className="h-5 w-5" />
          <p>त्रुटी: {aiError.message || 'AI विश्लेषणामध्ये समस्या आली'}</p>
        </div>
      )}
      
      {aiResult && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">AI परिणाम</h3>
          <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">{aiResult}</pre>
          </div>
        </div>
      )}
    </div>
  );
  
  // Modals
  const FruitModal = ({ isEdit = false }: { isEdit?: boolean }) => {
    const fruit = isEdit ? editingFruit : null;
    const [formData, setFormData] = useState({
      name: fruit?.name || '',
      nameMarathi: fruit?.nameMarathi || '',
      quantity: fruit?.quantity || 0,
      unit: fruit?.unit || 'kg' as 'kg' | 'dozen' | 'piece',
      buyPrice: fruit?.buyPrice || 0,
      sellPrice: fruit?.sellPrice || 0,
      category: fruit?.category || '',
      quality: fruit?.quality || 'Good' as 'Premium' | 'Good' | 'Average',
      supplier: fruit?.supplier || '',
      purchaseDate: fruit?.purchaseDate || new Date().toISOString().split('T')[0],
      expiryDate: fruit?.expiryDate || ''
    });
    
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isEdit && fruit) {
        updateFruit({ ...fruit, ...formData });
      } else {
        addFruit(formData);
      }
    };
    
    return (
      <div className="modal-backdrop" onClick={() => isEdit ? setEditingFruit(null) : setShowAddFruit(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">
              {isEdit ? 'फळ संपादित करा' : 'नवीन फळ जोडा'}
            </h3>
            <button
              onClick={() => isEdit ? setEditingFruit(null) : setShowAddFruit(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">फळाचे नाव (English)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">फळाचे नाव (मराठी)</label>
                <input
                  type="text"
                  value={formData.nameMarathi}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameMarathi: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">प्रमाण</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="input"
                  required
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">मोजमाप</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as 'kg' | 'dozen' | 'piece' }))}
                  className="input"
                >
                  <option value="kg">Kg</option>
                  <option value="dozen">Dozen</option>
                  <option value="piece">Piece</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">खरेदी दर (₹)</label>
                <input
                  type="number"
                  value={formData.buyPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, buyPrice: Number(e.target.value) }))}
                  className="input"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">विक्री दर (₹)</label>
                <input
                  type="number"
                  value={formData.sellPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, sellPrice: Number(e.target.value) }))}
                  className="input"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">श्रेणी</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="input"
                  placeholder="e.g., Seasonal, Daily, Premium"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">गुणवत्ता</label>
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData(prev => ({ ...prev, quality: e.target.value as 'Premium' | 'Good' | 'Average' }))}
                  className="input"
                >
                  <option value="Premium">Premium</option>
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">पुरवठादार</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">खरेदी दिनांक</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">एक्सपायरी दिनांक</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="input"
                  required
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => isEdit ? setEditingFruit(null) : setShowAddFruit(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                रद्द करा
              </button>
              <button type="submit" className="btn btn-primary">
                {isEdit ? 'अपडेट करा' : 'जोडा'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  
  const SaleModal = () => {
    const [selectedFruit, setSelectedFruit] = useState('');
    const [quantity, setQuantity] = useState(1);
    
    const handleAddItem = () => {
      const fruit = fruits.find(f => f.id === selectedFruit);
      if (fruit && quantity > 0 && quantity <= fruit.quantity) {
        addItemToSale(fruit, quantity);
        setSelectedFruit('');
        setQuantity(1);
      }
    };
    
    const totalAmount = saleForm.items.reduce((sum, item) => sum + item.total, 0);
    const finalAmount = totalAmount - saleForm.discount;
    
    return (
      <div className="modal-backdrop" onClick={() => setShowSaleModal(false)}>
        <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">नवीन सेल</h3>
            <button
              onClick={() => setShowSaleModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div className="space-y-4">
              <h4 className="font-semibold">ग्राहक माहिती</h4>
              <div className="form-group">
                <label className="form-label">ग्राहकाचे नाव</label>
                <input
                  type="text"
                  value={saleForm.customerName}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">फोन नंबर</label>
                <input
                  type="tel"
                  value={saleForm.customerPhone}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">पेमेंट पद्धत</label>
                <select
                  value={saleForm.paymentMethod}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'upi' | 'card' }))}
                  className="input"
                >
                  <option value="cash">रोख (Cash)</option>
                  <option value="upi">UPI</option>
                  <option value="card">कार्ड (Card)</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">सूट (₹)</label>
                <input
                  type="number"
                  value={saleForm.discount}
                  onChange={(e) => setSaleForm(prev => ({ ...prev, discount: Number(e.target.value) }))}
                  className="input"
                  min="0"
                  max={totalAmount}
                />
              </div>
            </div>
            
            {/* Add Items */}
            <div className="space-y-4">
              <h4 className="font-semibold">आयटम जोडा</h4>
              <div className="form-group">
                <label className="form-label">फळ निवडा</label>
                <select
                  value={selectedFruit}
                  onChange={(e) => setSelectedFruit(e.target.value)}
                  className="input"
                >
                  <option value="">फळ निवडा...</option>
                  {fruits.filter(fruit => fruit.quantity > 0).map(fruit => (
                    <option key={fruit.id} value={fruit.id}>
                      {fruit.name} ({fruit.nameMarathi}) - ₹{fruit.sellPrice}/{fruit.unit} - {fruit.quantity} available
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">प्रमाण</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="input"
                  min="1"
                  max={selectedFruit ? fruits.find(f => f.id === selectedFruit)?.quantity || 0 : 0}
                />
              </div>
              
              <button
                onClick={handleAddItem}
                disabled={!selectedFruit || quantity <= 0}
                className="btn btn-primary w-full"
              >
                आयटम जोडा
              </button>
              
              {/* Items List */}
              <div className="space-y-2">
                <h5 className="font-medium">निवडलेले आयटम:</h5>
                {saleForm.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-slate-700 rounded">
                    <span>{item.fruitName} x {item.quantity}</span>
                    <span className="font-semibold">₹{item.total}</span>
                  </div>
                ))}
                
                {saleForm.items.length > 0 && (
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold">
                      <span>एकूण रक्कम:</span>
                      <span>₹{totalAmount}</span>
                    </div>
                    {saleForm.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>सूट:</span>
                        <span>-₹{saleForm.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-1">
                      <span>अंतिम रक्कम:</span>
                      <span>₹{finalAmount}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => setShowSaleModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              रद्द करा
            </button>
            <button
              onClick={addSale}
              disabled={saleForm.items.length === 0 || !saleForm.customerName}
              className="btn btn-primary"
            >
              सेल पूर्ण करा
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="welcome_fallback">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-fluid">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">फळविक्रेता व्यवस्थापन</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Fruit Vendor Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser && (
                <span className="text-sm text-gray-700 dark:text-gray-300 hidden md:block">
                  Welcome, {currentUser.first_name}
                </span>
              )}
              
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 theme-transition"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 theme-transition"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition" id="generation_issue_fallback">
        <div className="container-fluid">
          <div className="flex space-x-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'डॅशबोर्ड', icon: Home },
              { id: 'inventory', label: 'साठा', icon: Package },
              { id: 'sales', label: 'विक्री', icon: ShoppingCart },
              { id: 'customers', label: 'ग्राहक', icon: Users },
              { id: 'ai', label: 'AI सहायक', icon: Target }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-600 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                  id={`nav-${tab.id}`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'sales' && renderSales()}
        {activeTab === 'customers' && renderCustomers()}
        {activeTab === 'ai' && renderAI()}
      </main>
      
      {/* Modals */}
      {showAddFruit && <FruitModal />}
      {editingFruit && <FruitModal isEdit />}
      {showSaleModal && <SaleModal />}
      
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedImage || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12 theme-transition">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;