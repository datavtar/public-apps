import React, { useState, useEffect } from 'react';
import {
  ShoppingBag as LucideShoppingBag,
  Plus,
  Minus,
  Edit,
  Trash2,
  Search,
  Download,
  Upload,
  FileText,
  Check,
  X,
  Sun,
  Moon,
  Calendar,
  Clock,
  User,
  Package,
  DollarSign,
  Filter,
  ChevronDown,
  ChevronUp,
  Settings,
  Eye,
  Menu
} from 'lucide-react';

// Type definitions
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
  ingredients: string[];
};

type CartItem = {
  id: string;
  quantity: number;
  menuItem: MenuItem;
};

type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  timestamp: Date;
  tableNumber?: string;
};

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  cost: number;
};

type UserRole = 'customer' | 'restaurant';

const App: React.FC = () => {
  // State management
  const [userRole, setUserRole] = useState<UserRole>('customer');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCart, setShowCart] = useState<boolean>(false);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [showAddMenuItem, setShowAddMenuItem] = useState<boolean>(false);
  const [showAddInventory, setShowAddInventory] = useState<boolean>(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [importType, setImportType] = useState<'menu' | 'inventory'>('menu');

  // Initialize data from localStorage
  useEffect(() => {
    const savedMenuItems = localStorage.getItem('zipeat-menu');
    const savedOrders = localStorage.getItem('zipeat-orders');
    const savedInventory = localStorage.getItem('zipeat-inventory');
    const savedDarkMode = localStorage.getItem('zipeat-darkmode');
    const savedUserRole = localStorage.getItem('zipeat-userrole');

    if (savedMenuItems) {
      setMenuItems(JSON.parse(savedMenuItems));
    } else {
      // Initialize with sample data
      const sampleMenu: MenuItem[] = [
        {
          id: '1',
          name: 'Butter Chicken',
          description: 'Creamy tomato-based curry with tender chicken pieces',
          price: 320,
          category: 'Main Course',
          available: true,
          ingredients: ['chicken', 'tomatoes', 'cream', 'butter', 'spices']
        },
        {
          id: '2',
          name: 'Paneer Tikka Masala',
          description: 'Grilled cottage cheese in rich masala gravy',
          price: 280,
          category: 'Main Course',
          available: true,
          ingredients: ['paneer', 'tomatoes', 'cream', 'onions', 'spices']
        },
        {
          id: '3',
          name: 'Biryani',
          description: 'Fragrant basmati rice with marinated meat/vegetables',
          price: 350,
          category: 'Rice',
          available: true,
          ingredients: ['basmati rice', 'meat', 'saffron', 'yogurt', 'spices']
        },
        {
          id: '4',
          name: 'Masala Chai',
          description: 'Traditional Indian spiced tea',
          price: 25,
          category: 'Beverages',
          available: true,
          ingredients: ['tea leaves', 'milk', 'sugar', 'cardamom', 'ginger']
        }
      ];
      setMenuItems(sampleMenu);
      localStorage.setItem('zipeat-menu', JSON.stringify(sampleMenu));
    }

    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
        ...order,
        timestamp: new Date(order.timestamp)
      }));
      setOrders(parsedOrders);
    }

    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      // Initialize with sample inventory
      const sampleInventory: InventoryItem[] = [
        { id: '1', name: 'Chicken', quantity: 50, unit: 'kg', lowStockThreshold: 10, cost: 200 },
        { id: '2', name: 'Paneer', quantity: 20, unit: 'kg', lowStockThreshold: 5, cost: 300 },
        { id: '3', name: 'Basmati Rice', quantity: 100, unit: 'kg', lowStockThreshold: 20, cost: 80 },
        { id: '4', name: 'Tomatoes', quantity: 30, unit: 'kg', lowStockThreshold: 5, cost: 40 },
        { id: '5', name: 'Cream', quantity: 15, unit: 'liters', lowStockThreshold: 3, cost: 60 }
      ];
      setInventory(sampleInventory);
      localStorage.setItem('zipeat-inventory', JSON.stringify(sampleInventory));
    }

    if (savedDarkMode) {
      const darkMode = JSON.parse(savedDarkMode);
      setIsDarkMode(darkMode);
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }
    }

    if (savedUserRole) {
      setUserRole(savedUserRole as UserRole);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('zipeat-menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('zipeat-orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('zipeat-inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('zipeat-darkmode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('zipeat-userrole', userRole);
  }, [userRole]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Cart functions
  const addToCart = (menuItem: MenuItem) => {
    const existingItem = cart.find(item => item.id === menuItem.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === menuItem.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { id: menuItem.id, quantity: 1, menuItem }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  // Order functions
  const placeOrder = () => {
    if (cart.length === 0 || !customerName || !customerPhone) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      items: [...cart],
      total: getCartTotal(),
      status: 'pending',
      timestamp: new Date(),
      tableNumber: tableNumber || undefined
    };

    setOrders([newOrder, ...orders]);
    
    // Update inventory
    updateInventoryAfterOrder(cart);
    
    // Reset cart and customer info
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setTableNumber('');
    setShowCart(false);
    
    alert('Order placed successfully!');
  };

  const updateInventoryAfterOrder = (cartItems: CartItem[]) => {
    const updatedInventory = [...inventory];
    
    cartItems.forEach(cartItem => {
      cartItem.menuItem.ingredients.forEach(ingredient => {
        const inventoryItem = updatedInventory.find(item => 
          item.name.toLowerCase().includes(ingredient.toLowerCase())
        );
        if (inventoryItem) {
          // Assuming 1 unit consumed per quantity (simplified)
          inventoryItem.quantity = Math.max(0, inventoryItem.quantity - cartItem.quantity);
        }
      });
    });
    
    setInventory(updatedInventory);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status }
        : order
    ));
  };

  // Menu management functions
  const addMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: Date.now().toString()
    };
    setMenuItems([...menuItems, newItem]);
    setShowAddMenuItem(false);
  };

  const updateMenuItem = (updatedItem: MenuItem) => {
    setMenuItems(menuItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingMenuItem(null);
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(menuItems.filter(item => item.id !== itemId));
  };

  // Inventory management functions
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: Date.now().toString()
    };
    setInventory([...inventory, newItem]);
    setShowAddInventory(false);
  };

  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(inventory.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
    setEditingInventory(null);
  };

  const deleteInventoryItem = (itemId: string) => {
    setInventory(inventory.filter(item => item.id !== itemId));
  };

  // Filter functions
  const getFilteredMenuItems = () => {
    let filtered = menuItems;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getCategories = () => {
    const categories = ['all', ...new Set(menuItems.map(item => item.category))];
    return categories;
  };

  const getFilteredOrders = () => {
    if (orderFilter === 'all') return orders;
    return orders.filter(order => order.status === orderFilter);
  };

  // Import/Export functions
  const generateTemplate = (type: 'menu' | 'inventory') => {
    let template;
    let filename;
    
    if (type === 'menu') {
      template = [
        {
          name: 'Sample Dish',
          description: 'Description of the dish',
          price: 100,
          category: 'Main Course',
          available: true,
          ingredients: ['ingredient1', 'ingredient2']
        }
      ];
      filename = 'menu-template.json';
    } else {
      template = [
        {
          name: 'Ingredient Name',
          quantity: 100,
          unit: 'kg',
          lowStockThreshold: 10,
          cost: 50
        }
      ];
      filename = 'inventory-template.json';
    }
    
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = filename;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        let data;
        
        if (file.name.endsWith('.json')) {
          data = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          // Basic CSV parsing
          const lines = content.split('\n');
          const headers = lines[0].split(',');
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header.trim()] = values[index]?.trim();
            });
            return obj;
          }).filter(obj => Object.keys(obj).length > 1);
        }
        
        if (importType === 'menu') {
          const newMenuItems = data.map((item: any) => ({
            id: Date.now().toString() + Math.random(),
            name: item.name || '',
            description: item.description || '',
            price: Number(item.price) || 0,
            category: item.category || 'Other',
            available: item.available !== false,
            ingredients: Array.isArray(item.ingredients) ? item.ingredients : 
                        typeof item.ingredients === 'string' ? item.ingredients.split(',').map((i: string) => i.trim()) : []
          }));
          setMenuItems([...menuItems, ...newMenuItems]);
        } else {
          const newInventoryItems = data.map((item: any) => ({
            id: Date.now().toString() + Math.random(),
            name: item.name || '',
            quantity: Number(item.quantity) || 0,
            unit: item.unit || 'pcs',
            lowStockThreshold: Number(item.lowStockThreshold) || 0,
            cost: Number(item.cost) || 0
          }));
          setInventory([...inventory, ...newInventoryItems]);
        }
        
        setShowImportModal(false);
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  // Close modal on Esc key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowCart(false);
        setShowAddMenuItem(false);
        setShowAddInventory(false);
        setEditingMenuItem(null);
        setEditingInventory(null);
        setShowOrderDetails(null);
        setShowImportModal(false);
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Role switch component
  const RoleSwitch = () => (
    <div className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-slate-700 rounded-lg">
      <button
        onClick={() => setUserRole('customer')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          userRole === 'customer'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
        }`}
      >
        Customer
      </button>
      <button
        onClick={() => setUserRole('restaurant')}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
          userRole === 'restaurant'
            ? 'bg-blue-500 text-white'
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
        }`}
      >
        Restaurant
      </button>
    </div>
  );

  // Menu item form component
  const MenuItemForm = ({ item, onSave, onCancel }: {
    item?: MenuItem;
    onSave: (item: MenuItem | Omit<MenuItem, 'id'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || 0,
      category: item?.category || '',
      available: item?.available ?? true,
      ingredients: item?.ingredients?.join(', ') || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const menuItem = {
        ...formData,
        price: Number(formData.price),
        ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(i => i)
      };
      
      if (item) {
        onSave({ ...menuItem, id: item.id });
      } else {
        onSave(menuItem);
      }
    };

    return (
      <div className="modal-backdrop" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {item ? 'Edit Menu Item' : 'Add Menu Item'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Price (₹)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  type="text"
                  className="input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ingredients (comma-separated)</label>
              <input
                type="text"
                className="input"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="chicken, tomatoes, spices"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="available"
                checked={formData.available}
                onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              />
              <label htmlFor="available" className="text-sm text-gray-700 dark:text-gray-300">
                Available
              </label>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onCancel} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {item ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Inventory form component
  const InventoryForm = ({ item, onSave, onCancel }: {
    item?: InventoryItem;
    onSave: (item: InventoryItem | Omit<InventoryItem, 'id'>) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      quantity: item?.quantity || 0,
      unit: item?.unit || '',
      lowStockThreshold: item?.lowStockThreshold || 0,
      cost: item?.cost || 0
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const inventoryItem = {
        ...formData,
        quantity: Number(formData.quantity),
        lowStockThreshold: Number(formData.lowStockThreshold),
        cost: Number(formData.cost)
      };
      
      if (item) {
        onSave({ ...inventoryItem, id: item.id });
      } else {
        onSave(inventoryItem);
      }
    };

    return (
      <div className="modal-backdrop" onClick={onCancel}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {item ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </h3>
            <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="input"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit</label>
                <input
                  type="text"
                  className="input"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, liters, pcs"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Low Stock Threshold</label>
                <input
                  type="number"
                  className="input"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Cost per Unit (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onCancel} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {item ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Import modal component
  const ImportModal = () => (
    <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Import {importType === 'menu' ? 'Menu Items' : 'Inventory'}
          </h3>
          <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setImportType('menu')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                importType === 'menu'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Menu
            </button>
            <button
              onClick={() => setImportType('inventory')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                importType === 'inventory'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inventory
            </button>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Download the template file to see the required format, then upload your data.
            </p>
            <button
              onClick={() => generateTemplate(importType)}
              className="mt-2 btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Download Template
            </button>
          </div>
          
          <div className="form-group">
            <label className="form-label">Upload File (JSON, CSV)</label>
            <input
              type="file"
              className="input"
              accept=".json,.csv"
              onChange={handleFileUpload}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={() => setShowImportModal(false)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Customer View
  if (userRole === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 theme-transition">
          <div className="container-fluid py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">Z</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ZipEat</h1>
              </div>
              
              <div className="flex items-center gap-3">
                <RoleSwitch />
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <button
                  onClick={() => setShowCart(true)}
                  className="relative p-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  <LucideShoppingBag className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Filter */}
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search dishes..."
                className="input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input sm:w-48"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {getCategories().map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {getFilteredMenuItems().map(item => (
              <div key={item.id} className="card hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No Image</span>
                </div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{item.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">₹{item.price}</span>
                  <span className={`badge ${
                    item.available ? 'badge-success' : 'badge-error'
                  }`}>
                    {item.available ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(item)}
                  disabled={!item.available}
                  className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {getFilteredMenuItems().length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No items found</p>
            </div>
          )}
        </div>

        {/* Cart Modal */}
        {showCart && (
          <div className="modal-backdrop">
            <div className="modal-content max-w-2xl">
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Cart</h3>
                <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{item.menuItem.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">₹{item.menuItem.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t dark:border-slate-600 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">₹{getCartTotal()}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Your Name *"
                        className="input"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        required
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number *"
                        className="input"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Table Number (optional)"
                        className="input"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button onClick={() => setShowCart(false)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Continue Shopping
                    </button>
                    <button 
                      onClick={placeOrder}
                      disabled={!customerName || !customerPhone}
                      className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 py-4 mt-8 theme-transition">
          <div className="container-fluid text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // Restaurant View
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 theme-transition">
        <div className="container-fluid py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">Z</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">ZipEat Restaurant</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <RoleSwitch />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="container-fluid py-4">
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
          {[
            { id: 'orders', label: 'Orders', icon: LucideShoppingBag },
            { id: 'menu', label: 'Menu', icon: Menu },
            { id: 'inventory', label: 'Inventory', icon: Package }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Orders</h2>
              <select
                className="input sm:w-48"
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {getFilteredOrders().length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No orders found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {getFilteredOrders().map(order => (
                  <div key={order.id} className="card">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Order #{order.id.slice(-6)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerPhone}</p>
                        {order.tableNumber && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">Table: {order.tableNumber}</p>
                        )}
                      </div>
                      <span className={`badge ${
                        order.status === 'pending' ? 'badge-warning' :
                        order.status === 'preparing' ? 'badge-info' :
                        order.status === 'ready' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'badge-success'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            ₹{item.quantity * item.menuItem.price}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-4 pt-2 border-t dark:border-slate-600">
                      <span className="font-semibold text-gray-900 dark:text-white">Total: ₹{order.total}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {order.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowOrderDetails(order)}
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1 flex items-center justify-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </button>
                      {order.status !== 'completed' && (
                        <select
                          className="input flex-1 text-sm"
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
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
            )}
          </div>
        )}

        {/* Menu Tab */}
        {activeTab === 'menu' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Menu Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setImportType('menu'); setShowImportModal(true); }}
                  className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
                <button
                  onClick={() => setShowAddMenuItem(true)}
                  className="btn btn-primary flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map(item => (
                <div key={item.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{item.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-orange-600 dark:text-orange-400">₹{item.price}</span>
                        <span className={`badge ${
                          item.available ? 'badge-success' : 'badge-error'
                        }`}>
                          {item.available ? 'Available' : 'Out of Stock'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Category: {item.category}</p>
                      {item.ingredients.length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Ingredients: {item.ingredients.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMenuItem(item)}
                      className="btn bg-blue-500 text-white hover:bg-blue-600 flex-1 flex items-center justify-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex-1 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inventory Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { setImportType('inventory'); setShowImportModal(true); }}
                  className="btn bg-green-500 text-white hover:bg-green-600 flex items-center gap-1"
                >
                  <Upload className="h-4 w-4" />
                  Import
                </button>
                <button
                  onClick={() => setShowAddInventory(true)}
                  className="btn btn-primary flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map(item => (
                <div key={item.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Quantity:</span>
                          <span className={`font-medium ${
                            item.quantity <= item.lowStockThreshold 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Cost:</span>
                          <span className="text-gray-900 dark:text-white font-medium">₹{item.cost}/{item.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">Low Stock:</span>
                          <span className="text-gray-900 dark:text-white">{item.lowStockThreshold}</span>
                        </div>
                      </div>
                      
                      {item.quantity <= item.lowStockThreshold && (
                        <div className="mt-2">
                          <span className="badge badge-warning">Low Stock</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingInventory(item)}
                      className="btn bg-blue-500 text-white hover:bg-blue-600 flex-1 flex items-center justify-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteInventoryItem(item.id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex-1 flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddMenuItem && (
        <MenuItemForm
          onSave={addMenuItem}
          onCancel={() => setShowAddMenuItem(false)}
        />
      )}

      {editingMenuItem && (
        <MenuItemForm
          item={editingMenuItem}
          onSave={updateMenuItem}
          onCancel={() => setEditingMenuItem(null)}
        />
      )}

      {showAddInventory && (
        <InventoryForm
          onSave={addInventoryItem}
          onCancel={() => setShowAddInventory(false)}
        />
      )}

      {editingInventory && (
        <InventoryForm
          item={editingInventory}
          onSave={updateInventoryItem}
          onCancel={() => setEditingInventory(null)}
        />
      )}

      {showOrderDetails && (
        <div className="modal-backdrop" onClick={() => setShowOrderDetails(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Order Details #{showOrderDetails.id.slice(-6)}
              </h3>
              <button onClick={() => setShowOrderDetails(null)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                  <p className="text-gray-900 dark:text-white">{showOrderDetails.customerName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <p className="text-gray-900 dark:text-white">{showOrderDetails.customerPhone}</p>
                </div>
                {showOrderDetails.tableNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Table</label>
                    <p className="text-gray-900 dark:text-white">{showOrderDetails.tableNumber}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time</label>
                  <p className="text-gray-900 dark:text-white">{showOrderDetails.timestamp.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Items</label>
                <div className="space-y-2">
                  {showOrderDetails.items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-700 rounded">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">{item.menuItem.name}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">₹{item.menuItem.price} each</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900 dark:text-white">Qty: {item.quantity}</span>
                        <p className="text-sm text-gray-600 dark:text-gray-300">₹{item.quantity * item.menuItem.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t dark:border-slate-600">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">₹{showOrderDetails.total}</span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setShowOrderDetails(null)} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && <ImportModal />}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 py-4 mt-8 theme-transition">
        <div className="container-fluid text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;