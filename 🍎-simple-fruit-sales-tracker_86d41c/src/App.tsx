import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Fruit, ShoppingBag, TrendingUp, Filter, Search, Plus, X, Edit, Trash2, ChevronDown, Sun, Snowflake, ArrowUpDown, Download, Moon, FileText } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types
type Season = 'Winter' | 'Spring' | 'Summer' | 'Fall';

interface Product {
  id: string;
  name: string;
  category: 'Fruit' | 'Vegetable';
  price: number;
  quantity: number;
  date: string;
  season: Season;
  totalAmount: number;
}

interface SalesSummary {
  totalSales: number;
  productCount: number;
  fruitsCount: number;
  vegetablesCount: number;
  topSellingSeason: Season | null;
  topSellingProduct: string | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Data template for CSV export
const DATA_TEMPLATE = 'data:text/csv;charset=utf-8,ID,Name,Category,Price,Quantity,Date,Season,Total Amount\n';

const App: React.FC = () => {
  // State management
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterSeason, setFilterSeason] = useState<string>('All');
  const [sortConfig, setSortConfig] = useState<{key: keyof Product; direction: 'ascending' | 'descending'} | null>(null);
  const [summary, setSummary] = useState<SalesSummary>({
    totalSales: 0,
    productCount: 0,
    fruitsCount: 0,
    vegetablesCount: 0,
    topSellingSeason: null,
    topSellingProduct: null
  });

  // Form state
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'totalAmount'> & { id?: string; totalAmount?: number }>({ 
    name: '',
    category: 'Fruit',
    price: 0,
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    season: 'Winter'
  });

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedProducts = localStorage.getItem('fruitVendorProducts');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
    
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Calculate summary whenever products change
  useEffect(() => {
    if (products.length > 0) {
      // Save to localStorage
      localStorage.setItem('fruitVendorProducts', JSON.stringify(products));

      // Calculate totals
      const totalSales = products.reduce((sum, product) => sum + product.totalAmount, 0);
      const fruitsCount = products.filter(product => product.category === 'Fruit').length;
      const vegetablesCount = products.filter(product => product.category === 'Vegetable').length;
      
      // Find top selling season
      const seasonSales: Record<Season, number> = { Winter: 0, Spring: 0, Summer: 0, Fall: 0 };
      products.forEach(product => {
        seasonSales[product.season] += product.totalAmount;
      });
      
      const topSellingSeason = Object.entries(seasonSales).sort((a, b) => b[1] - a[1])[0][0] as Season;
      
      // Find top selling product
      const productSales: Record<string, number> = {};
      products.forEach(product => {
        if (productSales[product.name]) {
          productSales[product.name] += product.totalAmount;
        } else {
          productSales[product.name] = product.totalAmount;
        }
      });
      
      const topSellingProductEntries = Object.entries(productSales).sort((a, b) => b[1] - a[1]);
      const topSellingProduct = topSellingProductEntries.length > 0 ? topSellingProductEntries[0][0] : null;
      
      setSummary({
        totalSales,
        productCount: products.length,
        fruitsCount,
        vegetablesCount,
        topSellingSeason,
        topSellingProduct
      });
    } else {
      setSummary({
        totalSales: 0,
        productCount: 0,
        fruitsCount: 0,
        vegetablesCount: 0,
        topSellingSeason: null,
        topSellingProduct: null
      });
    }
  }, [products]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;

    if (type === 'number') {
      processedValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const totalAmount = formData.price * formData.quantity;
    
    if (selectedProduct) {
      // Update existing product
      const updatedProducts = products.map(product => 
        product.id === selectedProduct.id 
          ? { ...formData, id: product.id, totalAmount } as Product
          : product
      );
      setProducts(updatedProducts);
    } else {
      // Add new product
      const newProduct: Product = {
        ...formData as Omit<Product, 'id' | 'totalAmount'>,
        id: Date.now().toString(),
        totalAmount
      };
      setProducts([...products, newProduct]);
    }
    
    // Reset form and close modal
    resetForm();
    setIsModalOpen(false);
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Fruit',
      price: 0,
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      season: 'Winter'
    });
    setSelectedProduct(null);
  };

  // Handle edit button click
  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      date: product.date,
      season: product.season
    });
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDelete = (id: string) => {
    const updatedProducts = products.filter(product => product.id !== id);
    setProducts(updatedProducts);
  };

  // Handle sorting
  const requestSort = (key: keyof Product) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Handle export data
  const handleExportData = () => {
    let csvContent = DATA_TEMPLATE;
    
    products.forEach(product => {
      const row = `${product.id},${product.name},${product.category},${product.price},${product.quantity},${product.date},${product.season},${product.totalAmount}\n`;
      csvContent += row;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'fruit_vendor_sales.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle template download
  const handleDownloadTemplate = () => {
    const templateData = DATA_TEMPLATE + 'ID1,Apple,Fruit,1.99,10,2023-12-15,Winter,19.9\n' + 
                        'ID2,Carrot,Vegetable,0.99,20,2023-12-16,Winter,19.8\n' + 
                        'ID3,Banana,Fruit,0.59,15,2023-08-10,Summer,8.85';
    const encodedUri = encodeURI(templateData);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'sales_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort products for display
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
    const matchesSeason = filterSeason === 'All' || product.season === filterSeason;
    return matchesSearch && matchesCategory && matchesSeason;
  });

  // Apply sorting if sortConfig is set
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    
    if (a[key] < b[key]) {
      return direction === 'ascending' ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  // Prepare chart data
  const categoryData = [
    { name: 'Fruits', value: summary.fruitsCount },
    { name: 'Vegetables', value: summary.vegetablesCount }
  ];

  const seasonData = [
    { name: 'Winter', sales: products.filter(p => p.season === 'Winter').reduce((sum, p) => sum + p.totalAmount, 0) },
    { name: 'Spring', sales: products.filter(p => p.season === 'Spring').reduce((sum, p) => sum + p.totalAmount, 0) },
    { name: 'Summer', sales: products.filter(p => p.season === 'Summer').reduce((sum, p) => sum + p.totalAmount, 0) },
    { name: 'Fall', sales: products.filter(p => p.season === 'Fall').reduce((sum, p) => sum + p.totalAmount, 0) }
  ];

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        resetForm();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isModalOpen]);

  // Add/remove modal-open class to body when modal state changes
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4 flex-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary-600 dark:text-primary-400" size={24} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Fruit Vendor Sales Tracker</h1>
          </div>
          <button
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-thumb"></span>
            <span className="absolute right-1 top-1/2 -translate-y-1/2">
              {darkMode ? <Sun size={12} className="text-yellow-200" /> : <Moon size={12} className="text-slate-700" />}
            </span>
          </button>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-title">Total Sales</div>
            <div className="stat-value">${summary.totalSales.toFixed(2)}</div>
            <div className="stat-desc">Sales from all products</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Product Count</div>
            <div className="stat-value">{summary.productCount}</div>
            <div className="stat-desc">{summary.fruitsCount} Fruits, {summary.vegetablesCount} Vegetables</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Top Selling Season</div>
            <div className="stat-value">{summary.topSellingSeason || 'N/A'}</div>
            <div className="stat-desc">Based on total sales</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Top Selling Product</div>
            <div className="stat-value">{summary.topSellingProduct || 'N/A'}</div>
            <div className="stat-desc">Based on total sales</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Products by Category</h3>
            <div className="h-64 flex items-center justify-center">
              {categoryData.some(item => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 text-center dark:text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Sales by Season</h3>
            <div className="h-64 flex items-center justify-center">
              {seasonData.some(item => item.sales > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={seasonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Sales']} />
                    <Legend />
                    <Bar dataKey="sales" name="Sales ($)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-500 text-center dark:text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <select
                  className="input appearance-none pr-8"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  aria-label="Filter by category"
                >
                  <option value="All">All Categories</option>
                  <option value="Fruit">Fruits</option>
                  <option value="Vegetable">Vegetables</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  className="input appearance-none pr-8"
                  value={filterSeason}
                  onChange={(e) => setFilterSeason(e.target.value)}
                  aria-label="Filter by season"
                >
                  <option value="All">All Seasons</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              className="btn btn-outline flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={handleDownloadTemplate}
              aria-label="Download template"
            >
              <FileText size={16} />
              <span className="hidden sm:inline">Template</span>
            </button>
            <button
              className="btn btn-outline flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={handleExportData}
              aria-label="Export data"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={() => setIsModalOpen(true)}
              aria-label="Add new product"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Add Product</span>
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header py-3 px-4">
                  <button 
                    onClick={() => requestSort('name')} 
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Sort by name"
                  >
                    Name
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="table-header py-3 px-4">
                  <button 
                    onClick={() => requestSort('category')} 
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Sort by category"
                  >
                    Category
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="table-header py-3 px-4">
                  <button 
                    onClick={() => requestSort('price')} 
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Sort by price"
                  >
                    Price
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="table-header py-3 px-4">
                  <button 
                    onClick={() => requestSort('quantity')} 
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Sort by quantity"
                  >
                    Quantity
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="table-header py-3 px-4">
                  <button 
                    onClick={() => requestSort('date')} 
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Sort by date"
                  >
                    Date
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="table-header py-3 px-4">
                  <button 
                    onClick={() => requestSort('season')} 
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Sort by season"
                  >
                    Season
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="table-header py-3 px-4">
                  <button 
                    onClick={() => requestSort('totalAmount')} 
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    aria-label="Sort by total"
                  >
                    Total
                    <ArrowUpDown size={14} />
                  </button>
                </th>
                <th className="table-header py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell py-3 px-4 dark:text-white">{product.name}</td>
                    <td className="table-cell py-3 px-4">
                      <span className={`badge ${product.category === 'Fruit' ? 'badge-info' : 'badge-success'}`}>
                        {product.category}
                      </span>
                    </td>
                    <td className="table-cell py-3 px-4 dark:text-white">${product.price.toFixed(2)}</td>
                    <td className="table-cell py-3 px-4 dark:text-white">{product.quantity}</td>
                    <td className="table-cell py-3 px-4 dark:text-white">{product.date}</td>
                    <td className="table-cell py-3 px-4">
                      <span className={`${styles.seasonBadge} ${styles[product.season.toLowerCase()]}`}>
                        {product.season === 'Winter' && <Snowflake size={14} />}
                        {product.season === 'Summer' && <Sun size={14} />}
                        {product.season}
                      </span>
                    </td>
                    <td className="table-cell py-3 px-4 font-medium dark:text-white">${product.totalAmount.toFixed(2)}</td>
                    <td className="table-cell py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          aria-label={`Delete ${product.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="table-cell py-6 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm || filterCategory !== 'All' || filterSeason !== 'All' 
                      ? 'No products match your filters. Try adjusting your search or filters.'
                      : 'No products yet. Click "Add Product" to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-6 mt-8">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Product Form Modal */}
      {isModalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="modal-content max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mt-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">Product Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Apple, Carrot"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="input"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="Fruit">Fruit</option>
                    <option value="Vegetable">Vegetable</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="season" className="form-label">Season</label>
                  <select
                    id="season"
                    name="season"
                    className="input"
                    value={formData.season}
                    onChange={handleChange}
                    required
                  >
                    <option value="Winter">Winter</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Fall">Fall</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label htmlFor="price" className="form-label">Price ($)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    className="input"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="input"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="date" className="form-label">Sale Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  className="input"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {selectedProduct ? 'Update' : 'Add'} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;