import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Edit2,
  Trash2,
  Filter,
  Search,
  ArrowDownUp,
  Download,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  Box,
  Repeat,
  Truck,
  Clipboard,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types
type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  lastUpdated: string;
};

type InventoryMovement = {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'transfer';
  quantity: number;
  fromLocation?: string;
  toLocation?: string;
  reason: string;
  date: string;
  performedBy: string;
};

type MovementSummary = {
  productName: string;
  inflow: number;
  outflow: number;
  netChange: number;
};

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

type FilterConfig = {
  category: string;
  location: string;
  movementType: string;
  dateRange: {
    start: string;
    end: string;
  };
};

type AppView = 'dashboard' | 'inventory' | 'movements' | 'reports' | 'addProduct' | 'editProduct' | 'addMovement';

function App() {
  // State management
  const [view, setView] = useState<AppView>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    category: '',
    location: '',
    movementType: '',
    dateRange: { start: '', end: '' },
  });
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Form handling
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<Product>();
  const movementForm = useForm<InventoryMovement>();

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

  // Load data from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem('warehouse-products');
    const savedMovements = localStorage.getItem('warehouse-movements');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Initialize with sample data
      const sampleProducts: Product[] = [
        {
          id: '1',
          name: 'Laptop Computer',
          sku: 'TECH-001',
          category: 'Electronics',
          quantity: 25,
          location: 'Section A-1',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Office Chair',
          sku: 'FURN-002',
          category: 'Furniture',
          quantity: 15,
          location: 'Section B-3',
          lastUpdated: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Wireless Mouse',
          sku: 'TECH-002',
          category: 'Electronics',
          quantity: 50,
          location: 'Section A-2',
          lastUpdated: new Date().toISOString(),
        },
      ];
      setProducts(sampleProducts);
      localStorage.setItem('warehouse-products', JSON.stringify(sampleProducts));
    }

    if (savedMovements) {
      setMovements(JSON.parse(savedMovements));
    } else {
      // Initialize with sample movement data
      const sampleMovements: InventoryMovement[] = [
        {
          id: '1',
          productId: '1',
          type: 'in',
          quantity: 10,
          reason: 'Initial stock',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          performedBy: 'John Manager',
        },
        {
          id: '2',
          productId: '1',
          type: 'out',
          quantity: 2,
          reason: 'Customer order #1234',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          performedBy: 'Sarah Warehouse',
        },
        {
          id: '3',
          productId: '2',
          type: 'in',
          quantity: 5,
          reason: 'Restocking',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          performedBy: 'John Manager',
        },
        {
          id: '4',
          productId: '3',
          type: 'transfer',
          quantity: 15,
          fromLocation: 'Section A-1',
          toLocation: 'Section A-2',
          reason: 'Reorganization',
          date: new Date().toISOString(),
          performedBy: 'Sarah Warehouse',
        },
      ];
      setMovements(sampleMovements);
      localStorage.setItem('warehouse-movements', JSON.stringify(sampleMovements));
    }
  }, []);

  // Extract unique categories and locations
  useEffect(() => {
    const categories = Array.from(new Set(products.map(product => product.category)));
    const locations = Array.from(new Set(products.map(product => product.location)));
    setUniqueCategories(categories);
    setUniqueLocations(locations);
  }, [products]);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (products.length > 0) {
      localStorage.setItem('warehouse-products', JSON.stringify(products));
    }
  }, [products]);

  useEffect(() => {
    if (movements.length > 0) {
      localStorage.setItem('warehouse-movements', JSON.stringify(movements));
    }
  }, [movements]);

  // Sorting logic
  const sortedProducts = [...products].sort((a, b) => {
    if (a[sortConfig.key as keyof Product] < b[sortConfig.key as keyof Product]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key as keyof Product] > b[sortConfig.key as keyof Product]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Filtering and searching logic
  const filteredProducts = sortedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterConfig.category === '' || product.category === filterConfig.category;
    const matchesLocation = filterConfig.location === '' || product.location === filterConfig.location;
    
    return matchesSearch && matchesCategory && matchesLocation;
  });

  const filteredMovements = movements.filter(movement => {
    const product = products.find(p => p.id === movement.productId);
    const productName = product ? product.name : '';
    
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterConfig.movementType === '' || movement.type === filterConfig.movementType;
    
    const movementDate = new Date(movement.date);
    const startDate = filterConfig.dateRange.start ? new Date(filterConfig.dateRange.start) : null;
    const endDate = filterConfig.dateRange.end ? new Date(filterConfig.dateRange.end) : null;
    
    const matchesDateRange = (!startDate || movementDate >= startDate) && 
                             (!endDate || movementDate <= endDate);
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  // Report data preparation
  const prepareMovementSummary = (): MovementSummary[] => {
    const summary: Record<string, MovementSummary> = {};
    
    products.forEach(product => {
      summary[product.id] = {
        productName: product.name,
        inflow: 0,
        outflow: 0,
        netChange: 0
      };
    });
    
    movements.forEach(movement => {
      if (movement.type === 'in') {
        summary[movement.productId].inflow += movement.quantity;
        summary[movement.productId].netChange += movement.quantity;
      } else if (movement.type === 'out') {
        summary[movement.productId].outflow += movement.quantity;
        summary[movement.productId].netChange -= movement.quantity;
      }
      // Transfers don't affect net totals
    });
    
    return Object.values(summary);
  };

  // Chart data
  const movementSummaryData = prepareMovementSummary();

  // Handlers
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddProduct = (data: Product) => {
    const newProduct = {
      ...data,
      id: Date.now().toString(),
      lastUpdated: new Date().toISOString()
    };
    setProducts([...products, newProduct]);
    reset();
    setView('inventory');
  };

  const handleEditProduct = (data: Product) => {
    if (selectedProduct) {
      const updatedProducts = products.map(product => 
        product.id === selectedProduct.id ? { ...data, id: product.id, lastUpdated: new Date().toISOString() } : product
      );
      setProducts(updatedProducts);
      setSelectedProduct(null);
      reset();
      setView('inventory');
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== id));
      // Also remove related movements
      setMovements(movements.filter(movement => movement.productId !== id));
    }
  };

  const handleAddMovement = (data: InventoryMovement) => {
    const newMovement = {
      ...data,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    // Update product quantity based on movement type
    const updatedProducts = [...products];
    const productIndex = updatedProducts.findIndex(p => p.id === data.productId);
    
    if (productIndex !== -1) {
      const product = updatedProducts[productIndex];
      
      if (data.type === 'in') {
        product.quantity += data.quantity;
      } else if (data.type === 'out') {
        product.quantity -= data.quantity;
      } else if (data.type === 'transfer') {
        // For transfers, just update the location
        product.location = data.toLocation || product.location;
      }
      
      product.lastUpdated = new Date().toISOString();
      updatedProducts[productIndex] = product;
      
      setProducts(updatedProducts);
      setMovements([...movements, newMovement]);
      movementForm.reset();
      setView('movements');
    }
  };

  const startEditProduct = (product: Product) => {
    setSelectedProduct(product);
    Object.entries(product).forEach(([key, value]) => {
      setValue(key as keyof Product, value);
    });
    setView('editProduct');
  };

  const prepareMovementForm = () => {
    setView('addMovement');
    movementForm.reset();
  };

  const getProductMovementInfo = (productId: string) => {
    const productMovements = movements.filter(m => m.productId === productId);
    const incoming = productMovements
      .filter(m => m.type === 'in')
      .reduce((sum, m) => sum + m.quantity, 0);
    const outgoing = productMovements
      .filter(m => m.type === 'out')
      .reduce((sum, m) => sum + m.quantity, 0);
    return { incoming, outgoing };
  };

  const exportInventoryCSV = () => {
    const headers = ['ID', 'Name', 'SKU', 'Category', 'Quantity', 'Location', 'Last Updated'];
    const csvData = [
      headers.join(','),
      ...products.map(product => [
        product.id,
        `"${product.name}"`,
        product.sku,
        product.category,
        product.quantity,
        `"${product.location}"`,
        format(new Date(product.lastUpdated), 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMovementsCSV = () => {
    const headers = ['ID', 'Product', 'Type', 'Quantity', 'From Location', 'To Location', 'Reason', 'Date', 'By'];
    const csvData = [
      headers.join(','),
      ...movements.map(movement => {
        const product = products.find(p => p.id === movement.productId);
        return [
          movement.id,
          `"${product ? product.name : 'Unknown Product'}"`,
          movement.type,
          movement.quantity,
          `"${movement.fromLocation || ''}"`,
          `"${movement.toLocation || ''}"`,
          `"${movement.reason}"`,
          format(new Date(movement.date), 'yyyy-MM-dd HH:mm'),
          `"${movement.performedBy}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'movements_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const templateData = 'Name,SKU,Category,Quantity,Location\nExample Product,PROD-001,Electronics,10,Section A-1\n';
    const blob = new Blob([templateData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dashboard metrics
  const getLowStockItems = () => {
    return products.filter(product => product.quantity < 10).length;
  };

  const getTotalProducts = () => {
    return products.length;
  };

  const getRecentMovements = () => {
    return movements.filter(m => {
      const date = new Date(m.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7; // Last 7 days
    }).length;
  };

  const getTotalStock = () => {
    return products.reduce((total, product) => total + product.quantity, 0);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white ${styles.appContainer}`}>
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Warehouse Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className="flex h-[calc(100vh-4rem)]">
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block overflow-y-auto">
          <div className="p-4">
            <nav className="space-y-1">
              <button 
                onClick={() => setView('dashboard')}
                className={`flex items-center px-4 py-2 w-full text-left rounded-md ${view === 'dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                role="menuitem"
              >
                <TrendingUp className="mr-3 h-5 w-5" />
                Dashboard
              </button>
              <button 
                onClick={() => setView('inventory')}
                className={`flex items-center px-4 py-2 w-full text-left rounded-md ${view === 'inventory' || view === 'addProduct' || view === 'editProduct' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                role="menuitem"
              >
                <Box className="mr-3 h-5 w-5" />
                Inventory
              </button>
              <button 
                onClick={() => setView('movements')}
                className={`flex items-center px-4 py-2 w-full text-left rounded-md ${view === 'movements' || view === 'addMovement' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                role="menuitem"
              >
                <Repeat className="mr-3 h-5 w-5" />
                Movements
              </button>
              <button 
                onClick={() => setView('reports')}
                className={`flex items-center px-4 py-2 w-full text-left rounded-md ${view === 'reports' ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                role="menuitem"
              >
                <Clipboard className="mr-3 h-5 w-5" />
                Reports
              </button>
            </nav>
          </div>
        </aside>

        {/* Mobile navigation */}
        <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 md:hidden">
          <div className="grid h-full grid-cols-4">
            <button
              onClick={() => setView('dashboard')}
              className={`flex flex-col items-center justify-center ${view === 'dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
              role="menuitem"
            >
              <TrendingUp className="w-6 h-6" />
              <span className="text-xs">Dashboard</span>
            </button>
            <button
              onClick={() => setView('inventory')}
              className={`flex flex-col items-center justify-center ${view === 'inventory' || view === 'addProduct' || view === 'editProduct' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
              role="menuitem"
            >
              <Box className="w-6 h-6" />
              <span className="text-xs">Inventory</span>
            </button>
            <button
              onClick={() => setView('movements')}
              className={`flex flex-col items-center justify-center ${view === 'movements' || view === 'addMovement' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
              role="menuitem"
            >
              <Repeat className="w-6 h-6" />
              <span className="text-xs">Movements</span>
            </button>
            <button
              onClick={() => setView('reports')}
              className={`flex flex-col items-center justify-center ${view === 'reports' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}
              role="menuitem"
            >
              <Clipboard className="w-6 h-6" />
              <span className="text-xs">Reports</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {view === 'dashboard' && (
            <div>
              <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
              
              {/* Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="stat-card">
                  <div className="stat-title">Total Products</div>
                  <div className="stat-value">{getTotalProducts()}</div>
                  <div className="stat-desc flex items-center">
                    <Box className="w-4 h-4 mr-1" /> Current inventory items
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Total Stock</div>
                  <div className="stat-value">{getTotalStock()}</div>
                  <div className="stat-desc flex items-center">
                    <Truck className="w-4 h-4 mr-1" /> Items in warehouse
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Recent Movements</div>
                  <div className="stat-value">{getRecentMovements()}</div>
                  <div className="stat-desc flex items-center">
                    <Repeat className="w-4 h-4 mr-1" /> Last 7 days
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Low Stock Items</div>
                  <div className="stat-value">{getLowStockItems()}</div>
                  <div className="stat-desc flex items-center text-amber-500">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Need attention
                  </div>
                </div>
              </div>
              
              {/* Recent Activity */}
              <div className="card mb-8">
                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Product</th>
                        <th className="table-header">Activity</th>
                        <th className="table-header">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 5)
                        .map(movement => {
                          const product = products.find(p => p.id === movement.productId);
                          return (
                            <tr key={movement.id}>
                              <td className="table-cell">{format(new Date(movement.date), 'MMM dd, yyyy')}</td>
                              <td className="table-cell">{product ? product.name : 'Unknown Product'}</td>
                              <td className="table-cell">
                                <span className={
                                  movement.type === 'in' ? 'badge badge-success' : 
                                  movement.type === 'out' ? 'badge badge-error' : 
                                  'badge badge-info'
                                }>
                                  {movement.type === 'in' ? 'Received' : 
                                   movement.type === 'out' ? 'Issued' : 
                                   'Transferred'}
                                </span>
                              </td>
                              <td className="table-cell">
                                <div className="flex items-center">
                                  {movement.type === 'in' ? (
                                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                                  ) : movement.type === 'out' ? (
                                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                                  ) : (
                                    <Repeat className="w-4 h-4 text-blue-500 mr-1" />
                                  )}
                                  {movement.quantity}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Stock Movement Chart */}
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Stock Movement Summary</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={movementSummaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="productName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inflow" name="Received" fill="#22c55e" />
                      <Bar dataKey="outflow" name="Issued" fill="#ef4444" />
                      <Bar dataKey="netChange" name="Net Change" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {view === 'inventory' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Inventory</h1>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setView('addProduct')}
                    className="btn btn-primary flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Product
                  </button>
                  <button 
                    onClick={exportInventoryCSV}
                    className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center"
                  >
                    <Download size={16} className="mr-1" /> Export
                  </button>
                </div>
              </div>

              <div className="card mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by name or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 w-full"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
                  >
                    <Filter size={16} className="mr-1" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select
                        value={filterConfig.category}
                        onChange={(e) => setFilterConfig({...filterConfig, category: e.target.value})}
                        className="input"
                      >
                        <option value="">All Categories</option>
                        {uniqueCategories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <select
                        value={filterConfig.location}
                        onChange={(e) => setFilterConfig({...filterConfig, location: e.target.value})}
                        className="input"
                      >
                        <option value="">All Locations</option>
                        {uniqueLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th 
                        className="table-header cursor-pointer"
                        onClick={() => requestSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          <ArrowDownUp size={16} className="ml-1" />
                        </div>
                      </th>
                      <th 
                        className="table-header cursor-pointer"
                        onClick={() => requestSort('sku')}
                      >
                        <div className="flex items-center">
                          SKU
                          <ArrowDownUp size={16} className="ml-1" />
                        </div>
                      </th>
                      <th 
                        className="table-header cursor-pointer"
                        onClick={() => requestSort('category')}
                      >
                        <div className="flex items-center">
                          Category
                          <ArrowDownUp size={16} className="ml-1" />
                        </div>
                      </th>
                      <th 
                        className="table-header cursor-pointer"
                        onClick={() => requestSort('quantity')}
                      >
                        <div className="flex items-center">
                          Quantity
                          <ArrowDownUp size={16} className="ml-1" />
                        </div>
                      </th>
                      <th 
                        className="table-header cursor-pointer"
                        onClick={() => requestSort('location')}
                      >
                        <div className="flex items-center">
                          Location
                          <ArrowDownUp size={16} className="ml-1" />
                        </div>
                      </th>
                      <th className="table-header">Last Updated</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => {
                        const { incoming, outgoing } = getProductMovementInfo(product.id);
                        return (
                          <tr key={product.id}>
                            <td className="table-cell">{product.name}</td>
                            <td className="table-cell">{product.sku}</td>
                            <td className="table-cell">{product.category}</td>
                            <td className="table-cell">
                              <span className={product.quantity < 10 ? 'text-red-500 font-bold' : ''}>
                                {product.quantity}
                              </span>
                            </td>
                            <td className="table-cell">{product.location}</td>
                            <td className="table-cell">{format(new Date(product.lastUpdated), 'MMM dd, yyyy')}</td>
                            <td className="table-cell">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => startEditProduct(product)}
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                  aria-label="Edit product"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                                  aria-label="Delete product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-4">
                          No products found. Try changing your search criteria or <button 
                            onClick={() => setView('addProduct')}
                            className="text-primary-600 hover:underline"
                          >
                            add a new product
                          </button>.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'addProduct' && (
            <div>
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setView('inventory')}
                  className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-semibold">Add New Product</h1>
              </div>

              <div className="card">
                <div className="flex justify-between mb-4">
                  <h2 className="text-lg font-medium">Product Details</h2>
                  <button 
                    onClick={downloadTemplate}
                    className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                  >
                    <Download size={14} className="mr-1" /> Download Template
                  </button>
                </div>

                <form onSubmit={handleSubmit(handleAddProduct)} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Product Name</label>
                    <input 
                      id="name"
                      type="text" 
                      className={`input ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter product name" 
                      {...register('name', { required: true })}
                    />
                    {errors.name && <p className="form-error">Product name is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="sku">SKU</label>
                    <input 
                      id="sku"
                      type="text" 
                      className={`input ${errors.sku ? 'border-red-500' : ''}`}
                      placeholder="Enter product SKU" 
                      {...register('sku', { required: true })}
                    />
                    {errors.sku && <p className="form-error">SKU is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="category">Category</label>
                    <input 
                      id="category"
                      type="text" 
                      className={`input ${errors.category ? 'border-red-500' : ''}`}
                      placeholder="Enter product category" 
                      list="category-options"
                      {...register('category', { required: true })}
                    />
                    <datalist id="category-options">
                      {uniqueCategories.map(category => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                    {errors.category && <p className="form-error">Category is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="quantity">Quantity</label>
                    <input 
                      id="quantity"
                      type="number" 
                      className={`input ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="Enter quantity" 
                      min="0"
                      {...register('quantity', { 
                        required: true,
                        valueAsNumber: true,
                        min: 0
                      })}
                    />
                    {errors.quantity && <p className="form-error">Valid quantity is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Storage Location</label>
                    <input 
                      id="location"
                      type="text" 
                      className={`input ${errors.location ? 'border-red-500' : ''}`}
                      placeholder="Enter storage location" 
                      list="location-options"
                      {...register('location', { required: true })}
                    />
                    <datalist id="location-options">
                      {uniqueLocations.map(location => (
                        <option key={location} value={location} />
                      ))}
                    </datalist>
                    {errors.location && <p className="form-error">Storage location is required</p>}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      type="button"
                      onClick={() => {
                        reset();
                        setView('inventory');
                      }}
                      className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      Save Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {view === 'editProduct' && selectedProduct && (
            <div>
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => {
                    setView('inventory');
                    setSelectedProduct(null);
                    reset();
                  }}
                  className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-semibold">Edit Product</h1>
              </div>

              <div className="card">
                <form onSubmit={handleSubmit(handleEditProduct)} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-name">Product Name</label>
                    <input 
                      id="edit-name"
                      type="text" 
                      className={`input ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter product name" 
                      {...register('name', { required: true })}
                    />
                    {errors.name && <p className="form-error">Product name is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-sku">SKU</label>
                    <input 
                      id="edit-sku"
                      type="text" 
                      className={`input ${errors.sku ? 'border-red-500' : ''}`}
                      placeholder="Enter product SKU" 
                      {...register('sku', { required: true })}
                    />
                    {errors.sku && <p className="form-error">SKU is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-category">Category</label>
                    <input 
                      id="edit-category"
                      type="text" 
                      className={`input ${errors.category ? 'border-red-500' : ''}`}
                      placeholder="Enter product category" 
                      list="edit-category-options"
                      {...register('category', { required: true })}
                    />
                    <datalist id="edit-category-options">
                      {uniqueCategories.map(category => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                    {errors.category && <p className="form-error">Category is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-quantity">Quantity</label>
                    <input 
                      id="edit-quantity"
                      type="number" 
                      className={`input ${errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="Enter quantity" 
                      min="0"
                      {...register('quantity', { 
                        required: true,
                        valueAsNumber: true,
                        min: 0
                      })}
                    />
                    {errors.quantity && <p className="form-error">Valid quantity is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="edit-location">Storage Location</label>
                    <input 
                      id="edit-location"
                      type="text" 
                      className={`input ${errors.location ? 'border-red-500' : ''}`}
                      placeholder="Enter storage location" 
                      list="edit-location-options"
                      {...register('location', { required: true })}
                    />
                    <datalist id="edit-location-options">
                      {uniqueLocations.map(location => (
                        <option key={location} value={location} />
                      ))}
                    </datalist>
                    {errors.location && <p className="form-error">Storage location is required</p>}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedProduct(null);
                        reset();
                        setView('inventory');
                      }}
                      className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      Update Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {view === 'movements' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Inventory Movements</h1>
                <div className="flex space-x-2">
                  <button 
                    onClick={prepareMovementForm}
                    className="btn btn-primary flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Record Movement
                  </button>
                  <button 
                    onClick={exportMovementsCSV}
                    className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center"
                  >
                    <Download size={16} className="mr-1" /> Export
                  </button>
                </div>
              </div>

              <div className="card mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search by product or reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10 w-full"
                    />
                  </div>
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
                  >
                    <Filter size={16} className="mr-1" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                  </button>
                </div>

                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label">Movement Type</label>
                      <select
                        value={filterConfig.movementType}
                        onChange={(e) => setFilterConfig({...filterConfig, movementType: e.target.value})}
                        className="input"
                      >
                        <option value="">All Types</option>
                        <option value="in">Incoming</option>
                        <option value="out">Outgoing</option>
                        <option value="transfer">Transfer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">From Date</label>
                      <input
                        type="date"
                        value={filterConfig.dateRange.start}
                        onChange={(e) => setFilterConfig({
                          ...filterConfig, 
                          dateRange: {...filterConfig.dateRange, start: e.target.value}
                        })}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">To Date</label>
                      <input
                        type="date"
                        value={filterConfig.dateRange.end}
                        onChange={(e) => setFilterConfig({
                          ...filterConfig, 
                          dateRange: {...filterConfig.dateRange, end: e.target.value}
                        })}
                        className="input"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Date</th>
                      <th className="table-header">Product</th>
                      <th className="table-header">Type</th>
                      <th className="table-header">Quantity</th>
                      <th className="table-header">From/To</th>
                      <th className="table-header">Reason</th>
                      <th className="table-header">Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.length > 0 ? (
                      filteredMovements
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map(movement => {
                          const product = products.find(p => p.id === movement.productId);
                          return (
                            <tr key={movement.id}>
                              <td className="table-cell">{format(new Date(movement.date), 'MMM dd, yyyy')}</td>
                              <td className="table-cell">{product ? product.name : 'Unknown Product'}</td>
                              <td className="table-cell">
                                <span className={
                                  movement.type === 'in' ? 'badge badge-success' : 
                                  movement.type === 'out' ? 'badge badge-error' : 
                                  'badge badge-info'
                                }>
                                  {movement.type === 'in' ? 'Received' : 
                                   movement.type === 'out' ? 'Issued' : 
                                   'Transferred'}
                                </span>
                              </td>
                              <td className="table-cell">{movement.quantity}</td>
                              <td className="table-cell">
                                {movement.type === 'transfer' ? (
                                  <span>{movement.fromLocation} → {movement.toLocation}</span>
                                ) : (
                                  <span>-</span>
                                )}
                              </td>
                              <td className="table-cell">{movement.reason}</td>
                              <td className="table-cell">{movement.performedBy}</td>
                            </tr>
                          );
                        })
                    ) : (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-4">
                          No movements found. Try changing your search criteria or <button 
                            onClick={prepareMovementForm}
                            className="text-primary-600 hover:underline"
                          >
                            record a new movement
                          </button>.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'addMovement' && (
            <div>
              <div className="flex items-center mb-6">
                <button 
                  onClick={() => setView('movements')}
                  className="mr-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-semibold">Record Inventory Movement</h1>
              </div>

              <div className="card">
                <form onSubmit={movementForm.handleSubmit(handleAddMovement)} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="productId">Product</label>
                    <select
                      id="productId"
                      className={`input ${movementForm.formState.errors.productId ? 'border-red-500' : ''}`}
                      {...movementForm.register('productId', { required: true })}
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
                      ))}
                    </select>
                    {movementForm.formState.errors.productId && <p className="form-error">Product is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="type">Movement Type</label>
                    <select
                      id="type"
                      className={`input ${movementForm.formState.errors.type ? 'border-red-500' : ''}`}
                      {...movementForm.register('type', { required: true })}
                    >
                      <option value="">Select movement type</option>
                      <option value="in">Incoming (Received)</option>
                      <option value="out">Outgoing (Issued)</option>
                      <option value="transfer">Transfer (Internal)</option>
                    </select>
                    {movementForm.formState.errors.type && <p className="form-error">Movement type is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="quantity">Quantity</label>
                    <input 
                      id="quantity"
                      type="number" 
                      className={`input ${movementForm.formState.errors.quantity ? 'border-red-500' : ''}`}
                      placeholder="Enter quantity" 
                      min="1"
                      {...movementForm.register('quantity', { 
                        required: true,
                        valueAsNumber: true,
                        min: 1
                      })}
                    />
                    {movementForm.formState.errors.quantity && <p className="form-error">Valid quantity is required</p>}
                  </div>

                  {movementForm.watch('type') === 'transfer' && (
                    <>
                      <div className="form-group">
                        <label className="form-label" htmlFor="fromLocation">From Location</label>
                        <input 
                          id="fromLocation"
                          type="text" 
                          className={`input ${movementForm.formState.errors.fromLocation ? 'border-red-500' : ''}`}
                          placeholder="Source location" 
                          list="source-locations"
                          {...movementForm.register('fromLocation', { 
                            required: movementForm.watch('type') === 'transfer'
                          })}
                        />
                        <datalist id="source-locations">
                          {uniqueLocations.map(location => (
                            <option key={location} value={location} />
                          ))}
                        </datalist>
                        {movementForm.formState.errors.fromLocation && <p className="form-error">Source location is required</p>}
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="toLocation">To Location</label>
                        <input 
                          id="toLocation"
                          type="text" 
                          className={`input ${movementForm.formState.errors.toLocation ? 'border-red-500' : ''}`}
                          placeholder="Destination location" 
                          list="dest-locations"
                          {...movementForm.register('toLocation', { 
                            required: movementForm.watch('type') === 'transfer'
                          })}
                        />
                        <datalist id="dest-locations">
                          {uniqueLocations.map(location => (
                            <option key={location} value={location} />
                          ))}
                        </datalist>
                        {movementForm.formState.errors.toLocation && <p className="form-error">Destination location is required</p>}
                      </div>
                    </>
                  )}

                  <div className="form-group">
                    <label className="form-label" htmlFor="reason">Reason / Reference</label>
                    <input 
                      id="reason"
                      type="text" 
                      className={`input ${movementForm.formState.errors.reason ? 'border-red-500' : ''}`}
                      placeholder="Enter reason or reference number" 
                      {...movementForm.register('reason', { required: true })}
                    />
                    {movementForm.formState.errors.reason && <p className="form-error">Reason is required</p>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="performedBy">Performed By</label>
                    <input 
                      id="performedBy"
                      type="text" 
                      className={`input ${movementForm.formState.errors.performedBy ? 'border-red-500' : ''}`}
                      placeholder="Enter name of person performing this action" 
                      {...movementForm.register('performedBy', { required: true })}
                    />
                    {movementForm.formState.errors.performedBy && <p className="form-error">Name is required</p>}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      type="button"
                      onClick={() => {
                        movementForm.reset();
                        setView('movements');
                      }}
                      className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                    >
                      Record Movement
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {view === 'reports' && (
            <div>
              <h1 className="text-2xl font-semibold mb-6">Inventory Reports</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Inventory Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Products:</span>
                      <span className="font-semibold">{products.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Quantity:</span>
                      <span className="font-semibold">{products.reduce((sum, p) => sum + p.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Low Stock Items:</span>
                      <span className="font-semibold text-red-500">{products.filter(p => p.quantity < 10).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Out of Stock Items:</span>
                      <span className="font-semibold text-red-600">{products.filter(p => p.quantity === 0).length}</span>
                    </div>
                  </div>
                  <button 
                    onClick={exportInventoryCSV}
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 mt-4 w-full flex items-center justify-center"
                  >
                    <Download size={16} className="mr-1" /> Export Inventory Report
                  </button>
                </div>
                
                <div className="card">
                  <h2 className="text-xl font-semibold mb-4">Movement Summary</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Movements:</span>
                      <span className="font-semibold">{movements.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Incoming:</span>
                      <span className="font-semibold text-green-500">{movements.filter(m => m.type === 'in').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Outgoing:</span>
                      <span className="font-semibold text-red-500">{movements.filter(m => m.type === 'out').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Transfers:</span>
                      <span className="font-semibold text-blue-500">{movements.filter(m => m.type === 'transfer').length}</span>
                    </div>
                  </div>
                  <button 
                    onClick={exportMovementsCSV}
                    className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 mt-4 w-full flex items-center justify-center"
                  >
                    <Download size={16} className="mr-1" /> Export Movement Report
                  </button>
                </div>
              </div>
              
              <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4">Low Stock Items</h2>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Product</th>
                        <th className="table-header">SKU</th>
                        <th className="table-header">Category</th>
                        <th className="table-header">Quantity</th>
                        <th className="table-header">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(product => product.quantity < 10)
                        .sort((a, b) => a.quantity - b.quantity)
                        .map(product => (
                          <tr key={product.id}>
                            <td className="table-cell">{product.name}</td>
                            <td className="table-cell">{product.sku}</td>
                            <td className="table-cell">{product.category}</td>
                            <td className="table-cell">
                              <span className="font-bold text-red-500">{product.quantity}</span>
                            </td>
                            <td className="table-cell">{product.location}</td>
                          </tr>
                        ))}
                      {products.filter(product => product.quantity < 10).length === 0 && (
                        <tr>
                          <td colSpan={5} className="table-cell text-center py-4">No low stock items found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Inventory Movement Chart</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={movementSummaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="productName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inflow" name="Incoming" fill="#22c55e" />
                      <Bar dataKey="outflow" name="Outgoing" fill="#ef4444" />
                      <Bar dataKey="netChange" name="Net Change" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Pagination controls - if needed */}
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing all items
            </div>
            <div className="flex space-x-2">
              <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
                <ArrowLeft size={16} className="mr-1" /> Previous
              </button>
              <button className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center">
                Next <ArrowRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 py-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
}

export default App;
