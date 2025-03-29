import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import styles from './styles/styles.module.css';
import { 
  Package, 
  Truck, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  ArrowUpDown,
  Sun,
  Moon,
  Download,
  Upload,
  BarChart4,
  ArrowLeft,
  Save,
  X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const App: React.FC = () => {
  // Types
  type ProductType = {
    id: string;
    name: string;
    sku: string;
    category: string;
    quantity: number;
    threshold: number;
    location: string;
    lastUpdated: string;
  };

  type MovementType = {
    id: string;
    productId: string;
    type: 'incoming' | 'outgoing';
    quantity: number;
    date: string;
    reference: string;
    notes: string;
  };

  type FilterOptions = {
    search: string;
    category: string;
    belowThreshold: boolean;
    dateRange: { start: string; end: string };
  };

  type SortOptions = {
    field: string;
    direction: 'asc' | 'desc';
  };

  type Tab = 'inventory' | 'movements' | 'dashboard' | 'add-product' | 'edit-product' | 'add-movement' | 'report';

  // State
  const [activeTab, setActiveTab] = useState<Tab>('inventory');
  const [products, setProducts] = useState<ProductType[]>([]);
  const [movements, setMovements] = useState<MovementType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [filteredMovements, setFilteredMovements] = useState<MovementType[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: '',
    category: '',
    belowThreshold: false,
    dateRange: { start: '', end: '' }
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'name',
    direction: 'asc'
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Load data from local storage
  useEffect(() => {
    // Check for system preference for dark mode
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedDarkMode = localStorage.getItem('darkMode');
    const initialDarkMode = savedDarkMode !== null ? savedDarkMode === 'true' : prefersDarkMode;
    setIsDarkMode(initialDarkMode);
    
    // Load products and movements
    const savedProducts = localStorage.getItem('warehouseProducts');
    const savedMovements = localStorage.getItem('warehouseMovements');
    
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts) as ProductType[];
      setProducts(parsedProducts);
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(parsedProducts.map(p => p.category)));
      setCategories(uniqueCategories);
    } else {
      // Example products if none exist
      const exampleProducts: ProductType[] = [
        {
          id: '1',
          name: 'Laptop',
          sku: 'TECH-001',
          category: 'Electronics',
          quantity: 25,
          threshold: 10,
          location: 'Shelf A1',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Office Chair',
          sku: 'FURN-002',
          category: 'Furniture',
          quantity: 8,
          threshold: 5,
          location: 'Shelf B3',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Desk Lamp',
          sku: 'FURN-003',
          category: 'Furniture',
          quantity: 15,
          threshold: 7,
          location: 'Shelf B2',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Mouse',
          sku: 'TECH-002',
          category: 'Electronics',
          quantity: 40,
          threshold: 15,
          location: 'Shelf A2',
          lastUpdated: new Date().toISOString()
        }
      ];
      setProducts(exampleProducts);
      setCategories(['Electronics', 'Furniture']);
      localStorage.setItem('warehouseProducts', JSON.stringify(exampleProducts));
    }
    
    if (savedMovements) {
      setMovements(JSON.parse(savedMovements) as MovementType[]);
    } else {
      // Example movements if none exist
      const exampleMovements: MovementType[] = [
        {
          id: '1',
          productId: '1',
          type: 'incoming',
          quantity: 10,
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          reference: 'PO-12345',
          notes: 'Regular order'
        },
        {
          id: '2',
          productId: '1',
          type: 'outgoing',
          quantity: 5,
          date: new Date().toISOString(),
          reference: 'SO-67890',
          notes: 'Customer order'
        },
        {
          id: '3',
          productId: '2',
          type: 'incoming',
          quantity: 8,
          date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          reference: 'PO-23456',
          notes: 'New stock'
        }
      ];
      setMovements(exampleMovements);
      localStorage.setItem('warehouseMovements', JSON.stringify(exampleMovements));
    }
  }, []);
  
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
  
  // Update filtered products when filter/sort changes or products change
  useEffect(() => {
    let filtered = [...products];
    
    // Apply search filter
    if (filterOptions.search) {
      const search = filterOptions.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) || 
        product.sku.toLowerCase().includes(search) ||
        product.location.toLowerCase().includes(search)
      );
    }
    
    // Apply category filter
    if (filterOptions.category) {
      filtered = filtered.filter(product => product.category === filterOptions.category);
    }
    
    // Apply threshold filter
    if (filterOptions.belowThreshold) {
      filtered = filtered.filter(product => product.quantity <= product.threshold);
    }
    
    // Apply sort
    filtered.sort((a, b) => {
      const aValue = a[sortOptions.field as keyof ProductType];
      const bValue = b[sortOptions.field as keyof ProductType];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOptions.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOptions.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
    
    setFilteredProducts(filtered);
  }, [products, filterOptions, sortOptions]);
  
  // Update filtered movements when filter changes or movements change
  useEffect(() => {
    let filtered = [...movements];
    
    // Apply date range filter
    if (filterOptions.dateRange.start || filterOptions.dateRange.end) {
      filtered = filtered.filter(movement => {
        const movementDate = new Date(movement.date).getTime();
        const startDate = filterOptions.dateRange.start ? new Date(filterOptions.dateRange.start).getTime() : 0;
        const endDate = filterOptions.dateRange.end ? new Date(filterOptions.dateRange.end).getTime() : Infinity;
        
        return movementDate >= startDate && movementDate <= endDate;
      });
    }
    
    // Apply search filter to references or notes
    if (filterOptions.search) {
      const search = filterOptions.search.toLowerCase();
      filtered = filtered.filter(movement => 
        movement.reference.toLowerCase().includes(search) || 
        movement.notes.toLowerCase().includes(search) ||
        // Find product name from product id
        products.find(p => p.id === movement.productId)?.name.toLowerCase().includes(search)
      );
    }
    
    setFilteredMovements(filtered);
  }, [movements, filterOptions, products]);
  
  // Save data when it changes
  useEffect(() => {
    localStorage.setItem('warehouseProducts', JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem('warehouseMovements', JSON.stringify(movements));
  }, [movements]);
  
  // Helper function to generate a random ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };
  
  // Form handlers
  const handleAddProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newProduct: ProductType = {
      id: generateId(),
      name: (formData.get('name') as string) || '',
      sku: (formData.get('sku') as string) || '',
      category: (formData.get('category') as string) || '',
      quantity: parseInt((formData.get('quantity') as string) || '0'),
      threshold: parseInt((formData.get('threshold') as string) || '0'),
      location: (formData.get('location') as string) || '',
      lastUpdated: new Date().toISOString()
    };
    
    // Add new category if it doesn't exist
    if (newProduct.category && !categories.includes(newProduct.category)) {
      setCategories([...categories, newProduct.category]);
    }
    
    setProducts([...products, newProduct]);
    setActiveTab('inventory');
    
    // Clear form
    e.currentTarget.reset();
  };
  
  const handleEditProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedProduct) return;
    
    const formData = new FormData(e.currentTarget);
    
    const updatedProduct: ProductType = {
      ...selectedProduct,
      name: (formData.get('name') as string) || selectedProduct.name,
      sku: (formData.get('sku') as string) || selectedProduct.sku,
      category: (formData.get('category') as string) || selectedProduct.category,
      quantity: parseInt((formData.get('quantity') as string) || String(selectedProduct.quantity)),
      threshold: parseInt((formData.get('threshold') as string) || String(selectedProduct.threshold)),
      location: (formData.get('location') as string) || selectedProduct.location,
      lastUpdated: new Date().toISOString()
    };
    
    // Add new category if it doesn't exist
    if (updatedProduct.category && !categories.includes(updatedProduct.category)) {
      setCategories([...categories, updatedProduct.category]);
    }
    
    setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
    setSelectedProduct(null);
    setActiveTab('inventory');
  };
  
  const handleDeleteProduct = (id: string) => {
    // Check if there are movements associated with this product
    const hasMovements = movements.some(m => m.productId === id);
    
    if (hasMovements) {
      if (window.confirm('This product has movement records. Deleting it will also delete all associated movement records. Are you sure?')) {
        // Delete associated movements
        const updatedMovements = movements.filter(m => m.productId !== id);
        setMovements(updatedMovements);
        
        // Delete product
        setProducts(products.filter(p => p.id !== id));
      }
    } else {
      if (window.confirm('Are you sure you want to delete this product?')) {
        setProducts(products.filter(p => p.id !== id));
      }
    }
  };
  
  const handleAddMovement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const productId = formData.get('productId') as string;
    const type = formData.get('type') as 'incoming' | 'outgoing';
    const quantity = parseInt((formData.get('quantity') as string) || '0');
    
    if (!productId || !type || quantity <= 0) {
      alert('Please fill all required fields with valid values');
      return;
    }
    
    // Create new movement
    const newMovement: MovementType = {
      id: generateId(),
      productId,
      type,
      quantity,
      date: (formData.get('date') as string) || new Date().toISOString(),
      reference: (formData.get('reference') as string) || '',
      notes: (formData.get('notes') as string) || ''
    };
    
    // Update product quantity
    const product = products.find(p => p.id === productId);
    if (product) {
      const updatedProduct = { ...product };
      
      if (type === 'incoming') {
        updatedProduct.quantity += quantity;
      } else {
        updatedProduct.quantity = Math.max(0, updatedProduct.quantity - quantity);
      }
      
      updatedProduct.lastUpdated = new Date().toISOString();
      
      // Update products
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
    }
    
    // Add movement
    setMovements([...movements, newMovement]);
    setActiveTab('movements');
    
    // Clear form
    e.currentTarget.reset();
  };
  
  const handleSort = (field: string) => {
    if (sortOptions.field === field) {
      // Toggle direction if same field
      setSortOptions({
        ...sortOptions,
        direction: sortOptions.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Set new field with default ascending direction
      setSortOptions({
        field,
        direction: 'asc'
      });
    }
  };
  
  // Generate dashboard data
  const generateDashboardData = () => {
    // Products below threshold
    const belowThreshold = products.filter(p => p.quantity <= p.threshold);
    
    // Category distribution
    const categoryData = categories.map(category => {
      const count = products.filter(p => p.category === category).length;
      return { name: category, value: count };
    }).filter(item => item.value > 0);
    
    // Recent movements
    const recentMovements = [...movements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    
    // Movement trend data (last 7 days)
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();
    
    const movementTrend = last7Days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const incoming = movements
        .filter(m => m.type === 'incoming' && format(new Date(m.date), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, m) => sum + m.quantity, 0);
      
      const outgoing = movements
        .filter(m => m.type === 'outgoing' && format(new Date(m.date), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        date: format(date, 'MMM dd'),
        incoming,
        outgoing
      };
    });
    
    return {
      belowThreshold,
      categoryData,
      recentMovements,
      movementTrend
    };
  };
  
  // Download template function
  const downloadTemplate = () => {
    const templateProducts = [
      { name: 'Example Product', sku: 'SKU-001', category: 'Category', quantity: 10, threshold: 5, location: 'Shelf A1' }
    ];
    
    const headers = ['name', 'sku', 'category', 'quantity', 'threshold', 'location'];
    const csvContent = [
      headers.join(','),
      ...templateProducts.map(product => headers.map(header => product[header as keyof typeof product]).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Upload CSV function
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        
        const newProducts: ProductType[] = [];
        
        // Start from line 1 (skip headers)
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',');
          const product: Record<string, any> = {};
          
          // Map CSV values to product properties
          headers.forEach((header, index) => {
            product[header.trim()] = values[index]?.trim() || '';
          });
          
          // Create product with proper types
          newProducts.push({
            id: generateId(),
            name: product.name || '',
            sku: product.sku || '',
            category: product.category || '',
            quantity: parseInt(product.quantity) || 0,
            threshold: parseInt(product.threshold) || 0,
            location: product.location || '',
            lastUpdated: new Date().toISOString()
          });
          
          // Add new categories
          if (product.category && !categories.includes(product.category)) {
            setCategories(prev => [...prev, product.category]);
          }
        }
        
        if (newProducts.length > 0) {
          setProducts(prev => [...prev, ...newProducts]);
          alert(`Successfully imported ${newProducts.length} products`);
        } else {
          alert('No valid products found in the file');
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
      }
    };
    
    reader.readAsText(file);
    // Clear the input value so the same file can be uploaded again if needed
    e.target.value = '';
  };
  
  // Prepare dashboard data
  const dashboardData = generateDashboardData();
  
  // Generate colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];
  
  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition-all ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container-fluid py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <Package className="h-8 w-8 text-primary-600 dark:text-primary-400" />
            <h1 className="ml-2 text-xl font-bold">Warehouse Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm dark:text-gray-300">Light</span>
              <button 
                className="theme-toggle w-12 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center transition-all duration-300 focus:outline-none shadow"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className={`bg-white dark:bg-gray-600 w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`}>
                  {isDarkMode ? <Moon className="w-3 h-3 text-gray-300" /> : <Sun className="w-3 h-3 text-yellow-500" />}
                </div>
              </button>
              <span className="text-sm dark:text-gray-300">Dark</span>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="container-fluid px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            <button 
              className={`tab-button py-3 px-3 border-b-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('inventory')}
              aria-label="View Inventory"
            >
              <Package className="inline-block w-4 h-4 mr-1" />
              Inventory
            </button>
            <button 
              className={`tab-button py-3 px-3 border-b-2 font-medium text-sm ${activeTab === 'movements' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('movements')}
              aria-label="View Movements"
            >
              <Truck className="inline-block w-4 h-4 mr-1" />
              Movements
            </button>
            <button 
              className={`tab-button py-3 px-3 border-b-2 font-medium text-sm ${activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab('dashboard')}
              aria-label="View Dashboard"
            >
              <BarChart4 className="inline-block w-4 h-4 mr-1" />
              Dashboard
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container-fluid px-4 sm:px-6 lg:px-8 py-6">
        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl font-bold mb-4 sm:mb-0">Inventory Management</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <button 
                  className="btn btn-primary flex items-center justify-center" 
                  onClick={() => setActiveTab('add-product')}
                  aria-label="Add new product"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Product
                </button>
                <button 
                  className="btn btn-secondary flex items-center justify-center" 
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Toggle filters"
                >
                  <Filter className="w-4 h-4 mr-1" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
                <div className="relative inline-block">
                  <button 
                    className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center justify-center" 
                    onClick={downloadTemplate}
                    aria-label="Download template"
                  >
                    <Download className="w-4 h-4 mr-1" /> Template
                  </button>
                </div>
                <div className="relative">
                  <label className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center cursor-pointer">
                    <Upload className="w-4 h-4 mr-1" /> Import CSV
                    <input 
                      type="file" 
                      accept=".csv" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      aria-label="Upload CSV"
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Filters */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="search">Search</label>
                    <div className="relative">
                      <input 
                        id="search" 
                        type="text" 
                        className="input pl-10" 
                        placeholder="Search by name, SKU, or location" 
                        value={filterOptions.search}
                        onChange={(e) => setFilterOptions({...filterOptions, search: e.target.value})}
                        aria-label="Search inventory"
                      />
                      <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="category">Category</label>
                    <select 
                      id="category" 
                      className="input" 
                      value={filterOptions.category}
                      onChange={(e) => setFilterOptions({...filterOptions, category: e.target.value})}
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category, index) => (
                        <option key={index} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group flex items-end">
                    <label className="form-check flex items-center">
                      <input 
                        type="checkbox" 
                        className="form-checkbox" 
                        checked={filterOptions.belowThreshold}
                        onChange={(e) => setFilterOptions({...filterOptions, belowThreshold: e.target.checked})}
                        aria-label="Show only items below threshold"
                      />
                      <span className="ml-2">Show only items below threshold</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {/* Products Table */}
            <div className="table-container bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">
                      <button 
                        className="flex items-center font-semibold text-left" 
                        onClick={() => handleSort('name')}
                        aria-label="Sort by name"
                      >
                        Name
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="table-header">
                      <button 
                        className="flex items-center font-semibold text-left" 
                        onClick={() => handleSort('sku')}
                        aria-label="Sort by SKU"
                      >
                        SKU
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="table-header">
                      <button 
                        className="flex items-center font-semibold text-left" 
                        onClick={() => handleSort('category')}
                        aria-label="Sort by category"
                      >
                        Category
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="table-header">
                      <button 
                        className="flex items-center font-semibold text-left" 
                        onClick={() => handleSort('quantity')}
                        aria-label="Sort by quantity"
                      >
                        Quantity
                        <ArrowUpDown className="w-4 h-4 ml-1" />
                      </button>
                    </th>
                    <th className="table-header">Threshold</th>
                    <th className="table-header">Location</th>
                    <th className="table-header">Last Updated</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <tr key={product.id} className={product.quantity <= product.threshold ? 'bg-red-50 dark:bg-red-900/20' : ''}>
                        <td className="table-cell font-medium">{product.name}</td>
                        <td className="table-cell">{product.sku}</td>
                        <td className="table-cell">
                          <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            {product.category}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`font-medium ${product.quantity <= product.threshold ? 'text-red-600 dark:text-red-400' : ''}`}>
                            {product.quantity}
                          </span>
                        </td>
                        <td className="table-cell">{product.threshold}</td>
                        <td className="table-cell">{product.location}</td>
                        <td className="table-cell">{format(new Date(product.lastUpdated), 'MMM dd, yyyy')}</td>
                        <td className="table-cell">
                          <div className="flex space-x-2">
                            <button 
                              className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center" 
                              onClick={() => {
                                setSelectedProduct(product);
                                setActiveTab('edit-product');
                              }}
                              aria-label={`Edit ${product.name}`}
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button 
                              className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center justify-center" 
                              onClick={() => handleDeleteProduct(product.id)}
                              aria-label={`Delete ${product.name}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                        No products found. Add some products or adjust your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Movements Tab */}
        {activeTab === 'movements' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl font-bold mb-4 sm:mb-0">Inventory Movements</h2>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <button 
                  className="btn btn-primary flex items-center justify-center" 
                  onClick={() => setActiveTab('add-movement')}
                  aria-label="Record movement"
                >
                  <Plus className="w-4 h-4 mr-1" /> Record Movement
                </button>
                <button 
                  className="btn btn-secondary flex items-center justify-center" 
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Toggle filters"
                >
                  <Filter className="w-4 h-4 mr-1" /> {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>
            </div>
            
            {/* Filters */}
            {showFilters && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="movement-search">Search</label>
                    <div className="relative">
                      <input 
                        id="movement-search" 
                        type="text" 
                        className="input pl-10" 
                        placeholder="Search by reference or notes" 
                        value={filterOptions.search}
                        onChange={(e) => setFilterOptions({...filterOptions, search: e.target.value})}
                        aria-label="Search movements"
                      />
                      <Search className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="date-start">From Date</label>
                    <input 
                      id="date-start" 
                      type="date" 
                      className="input" 
                      value={filterOptions.dateRange.start}
                      onChange={(e) => setFilterOptions({
                        ...filterOptions, 
                        dateRange: {...filterOptions.dateRange, start: e.target.value}
                      })}
                      aria-label="Filter from date"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="date-end">To Date</label>
                    <input 
                      id="date-end" 
                      type="date" 
                      className="input" 
                      value={filterOptions.dateRange.end}
                      onChange={(e) => setFilterOptions({
                        ...filterOptions, 
                        dateRange: {...filterOptions.dateRange, end: e.target.value}
                      })}
                      aria-label="Filter to date"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Movements Table */}
            <div className="table-container bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Date</th>
                    <th className="table-header">Product</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Quantity</th>
                    <th className="table-header">Reference</th>
                    <th className="table-header">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredMovements.length > 0 ? (
                    filteredMovements.map(movement => {
                      const product = products.find(p => p.id === movement.productId);
                      return (
                        <tr key={movement.id}>
                          <td className="table-cell">{format(new Date(movement.date), 'MMM dd, yyyy')}</td>
                          <td className="table-cell font-medium">{product?.name || 'Unknown Product'}</td>
                          <td className="table-cell">
                            {movement.type === 'incoming' ? (
                              <span className="badge badge-success">Incoming</span>
                            ) : (
                              <span className="badge badge-error">Outgoing</span>
                            )}
                          </td>
                          <td className="table-cell font-medium">{movement.quantity}</td>
                          <td className="table-cell">{movement.reference}</td>
                          <td className="table-cell">{movement.notes}</td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                        No movements found. Record some movements or adjust your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Warehouse Dashboard</h2>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="stat-card">
                <div className="stat-title">Total Products</div>
                <div className="stat-value">{products.length}</div>
                <div className="stat-desc">In inventory</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Low Stock Items</div>
                <div className="stat-value">{dashboardData.belowThreshold.length}</div>
                <div className="stat-desc text-red-500 dark:text-red-400">
                  Items below threshold
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Recent Activity</div>
                <div className="stat-value">{movements.length}</div>
                <div className="stat-desc">Total movement records</div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Products By Category */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Products by Category</h3>
                <div className="w-full" style={{ height: '300px' }}>
                  {dashboardData.categoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {dashboardData.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      No category data available
                    </div>
                  )}
                </div>
              </div>
              
              {/* Movement Trends */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Movement Trends (Last 7 Days)</h3>
                <div className="w-full" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.movementTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="incoming" name="Incoming" fill="#00C49F" />
                      <Bar dataKey="outgoing" name="Outgoing" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Low Stock Items */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Low Stock Items</h3>
              {dashboardData.belowThreshold.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Name</th>
                        <th className="table-header">Current Quantity</th>
                        <th className="table-header">Threshold</th>
                        <th className="table-header">Category</th>
                        <th className="table-header">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {dashboardData.belowThreshold.map(product => (
                        <tr key={product.id}>
                          <td className="table-cell font-medium">{product.name}</td>
                          <td className="table-cell text-red-600 dark:text-red-400 font-medium">{product.quantity}</td>
                          <td className="table-cell">{product.threshold}</td>
                          <td className="table-cell">
                            <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                              {product.category}
                            </span>
                          </td>
                          <td className="table-cell">
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setSelectedProduct(product);
                                setActiveTab('add-movement');
                              }}
                              aria-label={`Restock ${product.name}`}
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No items are below threshold levels.</p>
              )}
            </div>
          </div>
        )}
        
        {/* Add Product Form */}
        {activeTab === 'add-product' && (
          <div className="card max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add New Product</h2>
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => setActiveTab('inventory')}
                aria-label="Back to inventory"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Product Name</label>
                  <input 
                    id="name" 
                    name="name" 
                    type="text" 
                    className="input" 
                    required 
                    aria-label="Product name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="sku">SKU</label>
                  <input 
                    id="sku" 
                    name="sku" 
                    type="text" 
                    className="input" 
                    required 
                    aria-label="Product SKU"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <div className="relative">
                    <input 
                      id="category" 
                      name="category" 
                      type="text" 
                      className="input" 
                      list="category-options"
                      required 
                      aria-label="Product category"
                    />
                    <datalist id="category-options">
                      {categories.map((category, index) => (
                        <option key={index} value={category} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input 
                    id="location" 
                    name="location" 
                    type="text" 
                    className="input" 
                    required 
                    aria-label="Product location"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="quantity">Initial Quantity</label>
                  <input 
                    id="quantity" 
                    name="quantity" 
                    type="number" 
                    min="0" 
                    className="input" 
                    required 
                    aria-label="Initial quantity"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="threshold">Low Stock Threshold</label>
                  <input 
                    id="threshold" 
                    name="threshold" 
                    type="number" 
                    min="0" 
                    className="input" 
                    required 
                    aria-label="Low stock threshold"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setActiveTab('inventory')}
                  aria-label="Cancel adding product"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center justify-center"
                  aria-label="Save new product"
                >
                  <Save className="w-4 h-4 mr-1" /> Save Product
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Edit Product Form */}
        {activeTab === 'edit-product' && selectedProduct && (
          <div className="card max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Edit Product</h2>
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  setSelectedProduct(null);
                  setActiveTab('inventory');
                }}
                aria-label="Back to inventory"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
            </div>
            
            <form onSubmit={handleEditProduct}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-name">Product Name</label>
                  <input 
                    id="edit-name" 
                    name="name" 
                    type="text" 
                    className="input" 
                    defaultValue={selectedProduct.name}
                    required 
                    aria-label="Product name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-sku">SKU</label>
                  <input 
                    id="edit-sku" 
                    name="sku" 
                    type="text" 
                    className="input" 
                    defaultValue={selectedProduct.sku}
                    required 
                    aria-label="Product SKU"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-category">Category</label>
                  <div className="relative">
                    <input 
                      id="edit-category" 
                      name="category" 
                      type="text" 
                      className="input" 
                      list="edit-category-options"
                      defaultValue={selectedProduct.category}
                      required 
                      aria-label="Product category"
                    />
                    <datalist id="edit-category-options">
                      {categories.map((category, index) => (
                        <option key={index} value={category} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-location">Location</label>
                  <input 
                    id="edit-location" 
                    name="location" 
                    type="text" 
                    className="input" 
                    defaultValue={selectedProduct.location}
                    required 
                    aria-label="Product location"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-quantity">Quantity</label>
                  <input 
                    id="edit-quantity" 
                    name="quantity" 
                    type="number" 
                    min="0" 
                    className="input" 
                    defaultValue={selectedProduct.quantity}
                    required 
                    aria-label="Product quantity"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-threshold">Low Stock Threshold</label>
                  <input 
                    id="edit-threshold" 
                    name="threshold" 
                    type="number" 
                    min="0" 
                    className="input" 
                    defaultValue={selectedProduct.threshold}
                    required 
                    aria-label="Low stock threshold"
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveTab('inventory');
                  }}
                  aria-label="Cancel editing product"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center justify-center"
                  aria-label="Save changes"
                >
                  <Save className="w-4 h-4 mr-1" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Add Movement Form */}
        {activeTab === 'add-movement' && (
          <div className="card max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Record Inventory Movement</h2>
              <button 
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                onClick={() => {
                  setSelectedProduct(null);
                  setActiveTab('movements');
                }}
                aria-label="Back to movements"
              >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </button>
            </div>
            
            <form onSubmit={handleAddMovement}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="productId">Product</label>
                  <select 
                    id="productId" 
                    name="productId" 
                    className="input" 
                    required 
                    defaultValue={selectedProduct?.id || ''}
                    aria-label="Select product"
                  >
                    <option value="" disabled>Select a product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name} - {product.sku}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Movement Type</label>
                  <select 
                    id="type" 
                    name="type" 
                    className="input" 
                    required 
                    aria-label="Movement type"
                  >
                    <option value="incoming">Incoming (Stock In)</option>
                    <option value="outgoing">Outgoing (Stock Out)</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="quantity">Quantity</label>
                  <input 
                    id="quantity" 
                    name="quantity" 
                    type="number" 
                    min="1" 
                    className="input" 
                    required 
                    aria-label="Movement quantity"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="date">Date</label>
                  <input 
                    id="date" 
                    name="date" 
                    type="date" 
                    className="input" 
                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                    required 
                    aria-label="Movement date"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="reference">Reference</label>
                  <input 
                    id="reference" 
                    name="reference" 
                    type="text" 
                    className="input" 
                    placeholder="PO-12345, SO-67890, etc."
                    aria-label="Reference number"
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea 
                    id="notes" 
                    name="notes" 
                    className="input" 
                    rows={3}
                    placeholder="Additional information about this movement"
                    aria-label="Movement notes"
                  ></textarea>
                </div>
              </div>
              
              <div className="flex justify-end mt-6 space-x-2">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={() => {
                    setSelectedProduct(null);
                    setActiveTab('movements');
                  }}
                  aria-label="Cancel recording movement"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center justify-center"
                  aria-label="Record movement"
                >
                  <Save className="w-4 h-4 mr-1" /> Record Movement
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-auto">
        <div className="container-fluid px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;