import React, { useState, useEffect, useRef } from 'react';
import { User, Settings, Eye, EyeOff, Plus, Edit, Trash2, MapPin, ShoppingCart, Minus, Clock, Check, X, Menu, Filter, Search, ArrowLeft, QrCode, Users, Utensils, Coffee, Star, Heart } from 'lucide-react';

// Types and Interfaces
interface Table {
  id: string;
  number: number;
  seats: number;
  x: number;
  y: number;
  status: 'available' | 'occupied' | 'reserved' | 'disabled';
  customerId?: string;
  orderCode?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'mains' | 'starters' | 'desserts' | 'beverages' | 'specials';
  image: string;
  available: boolean;
  rating: number;
  preparationTime: number;
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  instructions: string;
}

interface Order {
  id: string;
  tableId: string;
  customerId: string;
  items: CartItem[];
  total: number;
  status: 'ordering' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'completed';
  timestamp: Date;
  orderCode: string;
}

interface Customer {
  id: string;
  tableId: string;
  orderCode: string;
  status: 'seated' | 'ordering' | 'checked_out';
}

type AppMode = 'selection' | 'manager' | 'customer';
type ManagerView = 'login' | 'dashboard' | 'layout' | 'orders';
type CustomerView = 'seating' | 'ordering' | 'cart' | 'checkout';

const App: React.FC = () => {
  // State Management
  const [appMode, setAppMode] = useState<AppMode>('selection');
  const [managerView, setManagerView] = useState<ManagerView>('login');
  const [customerView, setCustomerView] = useState<CustomerView>('seating');
  const [isManagerLoggedIn, setIsManagerLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [tables, setTables] = useState<Table[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [orderCode, setOrderCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditingLayout, setIsEditingLayout] = useState(false);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const layoutRef = useRef<HTMLDivElement>(null);

  // Sample Data
  const sampleTables: Table[] = [
    { id: '1', number: 1, seats: 2, x: 100, y: 100, status: 'available' },
    { id: '2', number: 2, seats: 4, x: 250, y: 100, status: 'occupied', customerId: 'c1', orderCode: '1234' },
    { id: '3', number: 3, seats: 6, x: 400, y: 100, status: 'available' },
    { id: '4', number: 4, seats: 2, x: 100, y: 250, status: 'reserved' },
    { id: '5', number: 5, seats: 4, x: 250, y: 250, status: 'available' },
    { id: '6', number: 6, seats: 8, x: 400, y: 250, status: 'disabled' },
  ];

  const sampleMenuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Grilled Salmon',
      description: 'Fresh Atlantic salmon with herbs and lemon',
      price: 24.99,
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
      available: true,
      rating: 4.8,
      preparationTime: 20
    },
    {
      id: '2',
      name: 'Caesar Salad',
      description: 'Crispy romaine lettuce with parmesan and croutons',
      price: 12.99,
      category: 'starters',
      image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      available: true,
      rating: 4.5,
      preparationTime: 10
    },
    {
      id: '3',
      name: 'Chocolate Lava Cake',
      description: 'Warm chocolate cake with molten center',
      price: 8.99,
      category: 'desserts',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400',
      available: true,
      rating: 4.9,
      preparationTime: 15
    },
    {
      id: '4',
      name: 'Craft Beer',
      description: 'Local brewery selection',
      price: 6.99,
      category: 'beverages',
      image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400',
      available: true,
      rating: 4.3,
      preparationTime: 2
    },
    {
      id: '5',
      name: 'Ribeye Steak',
      description: 'Premium aged beef with seasonal vegetables',
      price: 32.99,
      category: 'mains',
      image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
      available: true,
      rating: 4.7,
      preparationTime: 25
    },
    {
      id: '6',
      name: 'Truffle Risotto',
      description: 'Creamy arborio rice with black truffle',
      price: 28.99,
      category: 'specials',
      image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=400',
      available: true,
      rating: 4.6,
      preparationTime: 18
    }
  ];

  // Local Storage Functions
  const saveToLocalStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const getFromLocalStorage = (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  };

  // Initialize Data
  useEffect(() => {
    const savedTables = getFromLocalStorage('restaurant_tables', sampleTables);
    const savedMenuItems = getFromLocalStorage('restaurant_menu', sampleMenuItems);
    const savedOrders = getFromLocalStorage('restaurant_orders', []);
    const savedCustomers = getFromLocalStorage('restaurant_customers', []);
    
    setTables(savedTables);
    setMenuItems(savedMenuItems);
    setOrders(savedOrders);
    setCustomers(savedCustomers);
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveToLocalStorage('restaurant_tables', tables);
  }, [tables]);

  useEffect(() => {
    saveToLocalStorage('restaurant_orders', orders);
  }, [orders]);

  useEffect(() => {
    saveToLocalStorage('restaurant_customers', customers);
  }, [customers]);

  // Manager Functions
  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'manager' && loginForm.password === 'password123') {
      setIsManagerLoggedIn(true);
      setManagerView('dashboard');
    } else {
      alert('Invalid credentials. Use: manager / password123');
    }
  };

  const handleTableStatusChange = (tableId: string, status: Table['status']) => {
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, status } : table
    ));
  };

  const handleTableDrop = (e: React.DragEvent, tableId: string) => {
    e.preventDefault();
    if (!layoutRef.current) return;
    
    const rect = layoutRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setTables(prev => prev.map(table => 
      table.id === tableId ? { ...table, x, y } : table
    ));
  };

  const addNewTable = () => {
    const newTable: Table = {
      id: Date.now().toString(),
      number: tables.length + 1,
      seats: 4,
      x: 50,
      y: 50,
      status: 'available'
    };
    setTables(prev => [...prev, newTable]);
  };

  const deleteTable = (tableId: string) => {
    setTables(prev => prev.filter(table => table.id !== tableId));
  };

  // Customer Functions
  const handleTableSelect = (table: Table) => {
    if (table.status !== 'available') return;
    
    setSelectedTable(table);
    const newCustomer: Customer = {
      id: Date.now().toString(),
      tableId: table.id,
      orderCode: Math.floor(1000 + Math.random() * 9000).toString(),
      status: 'seated'
    };
    
    setCurrentCustomer(newCustomer);
    setCustomers(prev => [...prev, newCustomer]);
    
    // Update table status
    setTables(prev => prev.map(t => 
      t.id === table.id ? { ...t, status: 'occupied', customerId: newCustomer.id, orderCode: newCustomer.orderCode } : t
    ));
  };

  const handleOrderCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find(c => c.orderCode === orderCode);
    if (customer) {
      setCurrentCustomer(customer);
      setSelectedTable(tables.find(t => t.id === customer.tableId) || null);
      setCustomerView('ordering');
    } else {
      alert('Invalid order code. Please check and try again.');
    }
  };

  const addToCart = (menuItem: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(item => item.menuItem.id === menuItem.id);
      if (existing) {
        return prev.map(item => 
          item.menuItem.id === menuItem.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { menuItem, quantity: 1, instructions: '' }];
    });
  };

  const updateCartItem = (menuItemId: string, quantity: number, instructions?: string) => {
    if (quantity === 0) {
      setCart(prev => prev.filter(item => item.menuItem.id !== menuItemId));
    } else {
      setCart(prev => prev.map(item => 
        item.menuItem.id === menuItemId 
          ? { ...item, quantity, ...(instructions !== undefined && { instructions }) }
          : item
      ));
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !currentCustomer) return;
    
    const newOrder: Order = {
      id: Date.now().toString(),
      tableId: currentCustomer.tableId,
      customerId: currentCustomer.id,
      items: [...cart],
      total: calculateTotal(),
      status: 'confirmed',
      timestamp: new Date(),
      orderCode: currentCustomer.orderCode
    };
    
    setOrders(prev => [...prev, newOrder]);
    setCart([]);
    setCustomerView('checkout');
    
    // Update customer status
    setCustomers(prev => prev.map(c => 
      c.id === currentCustomer.id ? { ...c, status: 'checked_out' } : c
    ));
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.available;
  });

  // Get table style based on seats
  const getTableStyle = (table: Table) => {
    const baseSize = 40;
    const size = baseSize + (table.seats * 5);
    return {
      width: `${size}px`,
      height: `${size}px`,
      left: `${table.x}px`,
      top: `${table.y}px`
    };
  };

  // Get status color
  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-red-500';
      case 'reserved': return 'bg-yellow-500';
      case 'disabled': return 'bg-gray-500';
      default: return 'bg-gray-300';
    }
  };

  // Role Selection Screen
  if (appMode === 'selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Utensils className="h-16 w-16 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">RestaurantPro</h1>
            <p className="text-gray-600">Complete Restaurant Management Solution</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => setAppMode('manager')}
              className="w-full card hover:shadow-lg transition-shadow p-6 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Manager Portal</h2>
                  <p className="text-gray-600 text-sm">Manage seating, orders, and restaurant operations</p>
                </div>
                <Settings className="h-8 w-8 text-orange-600 group-hover:text-orange-700" />
              </div>
            </button>
            
            <button
              onClick={() => setAppMode('customer')}
              className="w-full card hover:shadow-lg transition-shadow p-6 text-left group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Customer Portal</h2>
                  <p className="text-gray-600 text-sm">Select seats, browse menu, and place orders</p>
                </div>
                <User className="h-8 w-8 text-orange-600 group-hover:text-orange-700" />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manager App
  if (appMode === 'manager') {
    // Manager Login
    if (!isManagerLoggedIn) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="card">
              <div className="text-center mb-6">
                <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Manager Login</h1>
                <p className="text-gray-600 mt-2">Access restaurant management portal</p>
              </div>
              
              <form onSubmit={handleManagerLogin} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="input"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="input pr-10"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <button type="submit" className="btn btn-primary w-full">
                  Login
                </button>
              </form>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Demo Credentials:</strong><br />
                  Username: manager<br />
                  Password: password123
                </p>
              </div>
              
              <button
                onClick={() => setAppMode('selection')}
                className="mt-4 w-full btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Manager Dashboard
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container-fluid">
            <div className="flex-between py-4">
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Manager Portal</h1>
                  <p className="text-sm text-gray-600">Restaurant Management System</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setManagerView('dashboard')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      managerView === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setManagerView('layout')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      managerView === 'layout' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Layout
                  </button>
                  <button
                    onClick={() => setManagerView('orders')}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      managerView === 'orders' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Orders
                  </button>
                </div>
                
                <button
                  onClick={() => {
                    setIsManagerLoggedIn(false);
                    setManagerView('login');
                    setAppMode('selection');
                  }}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="container-fluid py-6">
          {/* Dashboard View */}
          {managerView === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="stat-card">
                  <div className="stat-title">Total Tables</div>
                  <div className="stat-value">{tables.length}</div>
                  <div className="stat-desc">Restaurant capacity</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Occupied Tables</div>
                  <div className="stat-value">{tables.filter(t => t.status === 'occupied').length}</div>
                  <div className="stat-desc">Currently serving</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Active Orders</div>
                  <div className="stat-value">{orders.filter(o => o.status !== 'completed').length}</div>
                  <div className="stat-desc">In progress</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Today's Revenue</div>
                  <div className="stat-value">${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}</div>
                  <div className="stat-desc">Total earnings</div>
                </div>
              </div>

              {/* Table Status Overview */}
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Table Status Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                  {tables.map(table => (
                    <div key={table.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">Table {table.number}</span>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(table.status)}`}></div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{table.seats} seats</p>
                      <p className="text-xs text-gray-500 capitalize">{table.status}</p>
                      {table.orderCode && (
                        <p className="text-xs text-blue-600 mt-1">Code: {table.orderCode}</p>
                      )}
                      
                      <div className="mt-3 flex gap-1">
                        <button
                          onClick={() => handleTableStatusChange(table.id, 'available')}
                          className={`px-2 py-1 text-xs rounded ${
                            table.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-green-50'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          onClick={() => handleTableStatusChange(table.id, 'disabled')}
                          className={`px-2 py-1 text-xs rounded ${
                            table.status === 'disabled' ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          Disable
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Layout Editor */}
          {managerView === 'layout' && (
            <div className="space-y-6">
              <div className="flex-between">
                <h2 className="text-lg font-semibold text-gray-900">Seating Layout Editor</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditingLayout(!isEditingLayout)}
                    className={`btn ${isEditingLayout ? 'bg-green-600 text-white' : 'btn-primary'}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditingLayout ? 'Save Layout' : 'Edit Layout'}
                  </button>
                  <button onClick={addNewTable} className="btn btn-secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Table
                  </button>
                </div>
              </div>

              <div className="card">
                <div className="mb-4">
                  <h3 className="font-medium text-gray-900 mb-2">Legend</h3>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-gray-600">Reserved</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-500 rounded"></div>
                      <span className="text-sm text-gray-600">Disabled</span>
                    </div>
                  </div>
                </div>

                <div
                  ref={layoutRef}
                  className="relative bg-gray-100 rounded-lg p-4 min-h-96 border-2 border-dashed border-gray-300"
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedTable) {
                      handleTableDrop(e, draggedTable.id);
                      setDraggedTable(null);
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <p className="text-sm text-gray-500 mb-4">
                    {isEditingLayout ? 'Drag tables to reposition them' : 'Current restaurant layout'}
                  </p>
                  
                  {tables.map(table => (
                    <div
                      key={table.id}
                      className={`absolute flex items-center justify-center rounded-lg text-white font-medium cursor-pointer transition-transform hover:scale-105 ${
                        getStatusColor(table.status)
                      } ${isEditingLayout ? 'cursor-move' : ''}`}
                      style={getTableStyle(table)}
                      draggable={isEditingLayout}
                      onDragStart={() => setDraggedTable(table)}
                    >
                      <div className="text-center">
                        <div className="text-sm font-bold">{table.number}</div>
                        <div className="text-xs">{table.seats} seats</div>
                      </div>
                      
                      {isEditingLayout && (
                        <button
                          onClick={() => deleteTable(table.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders View */}
          {managerView === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
              
              <div className="grid gap-4">
                {orders.length === 0 ? (
                  <div className="card text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-600">Orders will appear here as customers place them.</p>
                  </div>
                ) : (
                  orders.map(order => {
                    const table = tables.find(t => t.id === order.tableId);
                    return (
                      <div key={order.id} className="card">
                        <div className="flex-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              Table {table?.number} - Order #{order.orderCode}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'ready' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </div>
                            <p className="text-lg font-bold text-gray-900 mt-1">
                              ${order.total.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex-between py-2 border-b border-gray-100 last:border-0">
                              <div>
                                <span className="font-medium text-gray-900">{item.menuItem.name}</span>
                                <span className="text-gray-600 ml-2">x{item.quantity}</span>
                                {item.instructions && (
                                  <p className="text-sm text-gray-500 mt-1">Note: {item.instructions}</p>
                                )}
                              </div>
                              <span className="text-gray-900">
                                ${(item.menuItem.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                          {order.status === 'confirmed' && (
                            <button
                              onClick={() => setOrders(prev => prev.map(o => 
                                o.id === order.id ? { ...o, status: 'preparing' } : o
                              ))}
                              className="btn bg-yellow-600 text-white hover:bg-yellow-700"
                            >
                              Start Preparing
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button
                              onClick={() => setOrders(prev => prev.map(o => 
                                o.id === order.id ? { ...o, status: 'ready' } : o
                              ))}
                              className="btn bg-green-600 text-white hover:bg-green-700"
                            >
                              Mark Ready
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button
                              onClick={() => setOrders(prev => prev.map(o => 
                                o.id === order.id ? { ...o, status: 'completed' } : o
                              ))}
                              className="btn btn-primary"
                            >
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Customer App
  if (appMode === 'customer') {
    // Seating Selection
    if (customerView === 'seating') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container-fluid">
              <div className="flex-between py-4">
                <div className="flex items-center gap-3">
                  <Utensils className="h-8 w-8 text-orange-600" />
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">RestaurantPro</h1>
                    <p className="text-sm text-gray-600">Select your table</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setAppMode('selection')}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  ← Back
                </button>
              </div>
            </div>
          </header>

          <main className="container-fluid py-6">
            <div className="max-w-4xl mx-auto">
              {/* Order Code Entry */}
              <div className="card mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Already have an order code?</h2>
                <form onSubmit={handleOrderCodeSubmit} className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    placeholder="Enter 4-digit order code"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                    maxLength={4}
                  />
                  <button type="submit" className="btn btn-primary">
                    <QrCode className="h-4 w-4 mr-2" />
                    Access Order
                  </button>
                </form>
              </div>

              {/* Table Selection */}
              <div className="card">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Table</h2>
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-sm text-gray-600">Reserved</span>
                    </div>
                  </div>
                </div>

                <div className="relative bg-gray-100 rounded-lg p-8 min-h-96">
                  {tables.map(table => (
                    <button
                      key={table.id}
                      className={`absolute flex items-center justify-center rounded-lg text-white font-medium transition-all hover:scale-105 ${
                        getStatusColor(table.status)
                      } ${table.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'}`}
                      style={getTableStyle(table)}
                      onClick={() => handleTableSelect(table)}
                      disabled={table.status !== 'available'}
                    >
                      <div className="text-center">
                        <div className="text-sm font-bold">{table.number}</div>
                        <div className="text-xs">{table.seats} seats</div>
                        {table.status === 'available' && (
                          <div className="text-xs mt-1">Click to select</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    // Menu Ordering
    if (customerView === 'ordering') {
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
            <div className="container-fluid">
              <div className="flex-between py-4">
                <div className="flex items-center gap-3">
                  <Utensils className="h-8 w-8 text-orange-600" />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Menu</h1>
                    <p className="text-sm text-gray-600">
                      Table {selectedTable?.number} • Code: {currentCustomer?.orderCode}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCustomerView('cart')}
                    className="btn btn-primary relative"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setCustomerView('seating')}
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="container-fluid py-6">
            {/* Filters */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search menu items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {['all', 'starters', 'mains', 'desserts', 'beverages', 'specials'].map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === category
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuItems.map(item => (
                <div key={item.id} className="card hover:shadow-lg transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex-between mb-2">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">{item.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex-between text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {item.preparationTime} min
                        </span>
                        <span className="text-lg font-bold text-gray-900">${item.price}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => addToCart(item)}
                      className="btn btn-primary w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredMenuItems.length === 0 && (
              <div className="text-center py-12">
                <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </main>
        </div>
      );
    }

    // Cart View
    if (customerView === 'cart') {
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="container-fluid">
              <div className="flex-between py-4">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="h-8 w-8 text-orange-600" />
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
                    <p className="text-sm text-gray-600">
                      Table {selectedTable?.number} • {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => setCustomerView('ordering')}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Continue Shopping
                </button>
              </div>
            </div>
          </header>

          <main className="container-fluid py-6">
            <div className="max-w-2xl mx-auto">
              {cart.length === 0 ? (
                <div className="card text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                  <p className="text-gray-600 mb-6">Add some delicious items from our menu!</p>
                  <button
                    onClick={() => setCustomerView('ordering')}
                    className="btn btn-primary"
                  >
                    Browse Menu
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Cart Items */}
                  <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
                    <div className="space-y-4">
                      {cart.map((item, index) => (
                        <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                          <div className="flex gap-4">
                            <img
                              src={item.menuItem.image}
                              alt={item.menuItem.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex-between mb-2">
                                <h3 className="font-medium text-gray-900">{item.menuItem.name}</h3>
                                <span className="text-lg font-semibold text-gray-900">
                                  ${(item.menuItem.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{item.menuItem.description}</p>
                              
                              {/* Quantity Controls */}
                              <div className="flex items-center gap-3 mb-3">
                                <button
                                  onClick={() => updateCartItem(item.menuItem.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-medium text-gray-900 min-w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartItem(item.menuItem.id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              
                              {/* Special Instructions */}
                              <textarea
                                placeholder="Special instructions (optional)"
                                className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none"
                                rows={2}
                                value={item.instructions}
                                onChange={(e) => updateCartItem(item.menuItem.id, item.quantity, e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="card">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    <div className="space-y-2">
                      <div className="flex-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex-between">
                        <span className="text-gray-600">Tax (8%)</span>
                        <span className="text-gray-900">${(calculateTotal() * 0.08).toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex-between">
                          <span className="text-lg font-semibold text-gray-900">Total</span>
                          <span className="text-lg font-bold text-gray-900">
                            ${(calculateTotal() * 1.08).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      className="btn btn-primary w-full mt-6"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Place Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      );
    }

    // Checkout Success
    if (customerView === 'checkout') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="card">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-6">
                Your order has been sent to the kitchen. You'll receive updates on the preparation status.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 mb-2">Order Details</div>
                <div className="font-semibold text-gray-900">
                  Table {selectedTable?.number} • Code: {currentCustomer?.orderCode}
                </div>
                <div className="text-gray-600">
                  Total: ${(calculateTotal() * 1.08).toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setCustomerView('seating');
                    setCurrentCustomer(null);
                    setSelectedTable(null);
                    setCart([]);
                  }}
                  className="btn btn-primary w-full"
                >
                  Start New Order
                </button>
                <button
                  onClick={() => setAppMode('selection')}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 w-full"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
      </div>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2">
        <div className="container-fluid">
          <p className="text-center text-xs text-gray-500">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;