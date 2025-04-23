import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Search, ChevronDown, Plus, Trash2, Edit, X, ChevronUp, ShoppingBag, Calendar, Truck, ArrowDownUp, Filter, Download, Upload, Moon, Sun } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for the application
type Product = {
  id: string;
  name: string;
  type: 'fruit' | 'vegetable';
  price: number;
  quantity: number;
  season: 'winter' | 'summer' | 'monsoon' | 'autumn' | 'all';
  date: string;
  notes?: string;
};

type Filter = {
  type: string;
  season: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
};

type SortConfig = {
  key: keyof Product | '';
  direction: 'asc' | 'desc';
};

const App: React.FC = () => {
  // State management for the application
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState<Omit<Product, 'id'> & { id?: string }>({
    name: '',
    type: 'fruit',
    price: 0,
    quantity: 0,
    season: 'all',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [filter, setFilter] = useState<Filter>({
    type: 'all',
    season: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('fruitVendorProducts');
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // Sample data if no data exists
        const sampleData: Product[] = [
          {
            id: '1',
            name: 'સફરજન (Apple)',
            type: 'fruit',
            price: 120,
            quantity: 50,
            season: 'winter',
            date: '2025-01-15',
            notes: 'તાજા સફરજન'
          },
          {
            id: '2',
            name: 'ગાજર (Carrot)',
            type: 'vegetable',
            price: 60,
            quantity: 30,
            season: 'winter',
            date: '2025-01-15',
            notes: 'ઉત્તમ ગુણવત્તા'
          },
          {
            id: '3',
            name: 'કેળાં (Banana)',
            type: 'fruit',
            price: 50,
            quantity: 100,
            season: 'all',
            date: '2025-01-16',
            notes: 'પાકા કેળાં'
          },
          {
            id: '4',
            name: 'મરચાં (Chilli)',
            type: 'vegetable',
            price: 80,
            quantity: 20,
            season: 'summer',
            date: '2025-01-17',
            notes: 'તીખા'
          },
          {
            id: '5',
            name: 'કેરી (Mango)',
            type: 'fruit',
            price: 150,
            quantity: 40,
            season: 'summer',
            date: '2025-01-18',
            notes: 'કેસર કેરી'
          }
        ];
        setProducts(sampleData);
        localStorage.setItem('fruitVendorProducts', JSON.stringify(sampleData));
      }
      
      // Check for dark mode preference
      const darkModePreference = localStorage.getItem('darkMode');
      setIsDarkMode(darkModePreference === 'true');
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  // Save products to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('fruitVendorProducts', JSON.stringify(products));
    }
  }, [products, loading]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;
    
    // Convert numeric values
    if (type === 'number') {
      processedValue = value === '' ? 0 : parseFloat(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && formData.id) {
        // Update existing product
        setProducts(prev => 
          prev.map(product => 
            product.id === formData.id ? { ...formData, id: product.id } as Product : product
          )
        );
      } else {
        // Add new product
        const newProduct: Product = {
          ...formData as Omit<Product, 'id'>,
          id: Date.now().toString()
        };
        setProducts(prev => [...prev, newProduct]);
      }
      
      // Reset form and close modal
      closeModal();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('સમસ્યા આવી, ફરી પ્રયાસ કરો. (Error, please try again)');
    }
  };

  // Open modal for adding a new product
  const openAddModal = () => {
    setFormData({
      name: '',
      type: 'fruit',
      price: 0,
      quantity: 0,
      season: 'all',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsEditMode(false);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Open modal for editing an existing product
  const openEditModal = (product: Product) => {
    setFormData({ ...product });
    setIsEditMode(true);
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove('modal-open');
    setFormData({
      name: '',
      type: 'fruit',
      price: 0,
      quantity: 0,
      season: 'all',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  // Handle closing the modal with the Escape key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isModalOpen]);

  // Delete a product
  const handleDelete = (id: string) => {
    if (window.confirm('શું તમે ખરેખર આ આઇટમ કાઢી નાખવા માંગો છો? (Do you really want to delete this item?)')) {
      setProducts(prev => prev.filter(product => product.id !== id));
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilter({
      type: 'all',
      season: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  // Apply sorting to products
  const requestSort = (key: keyof Product) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Type', 'Price', 'Quantity', 'Season', 'Date', 'Notes'];
    const csvRows = [
      headers.join(','),
      ...filteredProducts.map(product => {
        return [
          `"${product.name}"`,
          product.type,
          product.price,
          product.quantity,
          product.season,
          product.date,
          `"${product.notes || ''}"`
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fruit-vendor-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  // Import data from CSV
  const importFromCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Skip the header row
        const newProducts: Product[] = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = rows[i].split(',');
          const product: Product = {
            id: Date.now().toString() + i,
            name: values[0].replace(/\"/g, ''), // Remove quotes
            type: values[1] === 'fruit' ? 'fruit' : 'vegetable',
            price: parseFloat(values[2]),
            quantity: parseInt(values[3], 10),
            season: values[4] as any, // Type assertion
            date: values[5],
            notes: values[6]?.replace(/\"/g, '') || ''
          };
          newProducts.push(product);
        }
        
        if (window.confirm(`${newProducts.length} નવી આઇટમ્સ આયાત કરી શકાય છે. શું તમે ચાલુ રાખવા માંગો છો? (${newProducts.length} new items can be imported. Do you want to continue?)`)) {
          setProducts(prev => [...prev, ...newProducts]);
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('CSV ફાઇલ આયાત કરવામાં સમસ્યા આવી. (Error importing CSV file)');
      }
    };
    reader.readAsText(file);
    // Reset the file input
    e.target.value = '';
  };

  // Create a CSV template
  const downloadTemplate = () => {
    const headers = ['Name', 'Type', 'Price', 'Quantity', 'Season', 'Date', 'Notes'];
    const exampleRow = ['"નામ (Name)"', 'fruit', '100', '10', 'winter', '2025-01-01', '"નોંધ (Notes)"'];
    const csvContent = [headers.join(','), exampleRow.join(',')].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'fruit-vendor-template.csv');
    link.click();
  };

  // Filter products based on current filter state
  const filteredProducts = products.filter(product => {
    // Filter by type
    if (filter.type !== 'all' && product.type !== filter.type) return false;
    
    // Filter by season
    if (filter.season !== 'all' && product.season !== filter.season) return false;
    
    // Filter by date range
    if (filter.dateFrom && product.date < filter.dateFrom) return false;
    if (filter.dateTo && product.date > filter.dateTo) return false;
    
    // Filter by search term (name)
    if (filter.searchTerm && !product.name.toLowerCase().includes(filter.searchTerm.toLowerCase()))
      return false;
    
    return true;
  });

  // Apply sorting to filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortConfig.key === '') return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Prepare data for charts
  const prepareChartData = () => {
    const typeData = [
      { name: 'ફળ (Fruits)', value: filteredProducts.filter(p => p.type === 'fruit').reduce((sum, p) => sum + p.quantity, 0) },
      { name: 'શાકભાજી (Vegetables)', value: filteredProducts.filter(p => p.type === 'vegetable').reduce((sum, p) => sum + p.quantity, 0) }
    ];
    
    const seasonData = [
      { name: 'શિયાળો (Winter)', value: filteredProducts.filter(p => p.season === 'winter').reduce((sum, p) => sum + p.quantity, 0) },
      { name: 'ઉનાળો (Summer)', value: filteredProducts.filter(p => p.season === 'summer').reduce((sum, p) => sum + p.quantity, 0) },
      { name: 'ચોમાસુ (Monsoon)', value: filteredProducts.filter(p => p.season === 'monsoon').reduce((sum, p) => sum + p.quantity, 0) },
      { name: 'શરદ (Autumn)', value: filteredProducts.filter(p => p.season === 'autumn').reduce((sum, p) => sum + p.quantity, 0) },
      { name: 'બધી ઋતુ (All Season)', value: filteredProducts.filter(p => p.season === 'all').reduce((sum, p) => sum + p.quantity, 0) }
    ];
    
    // Bar chart data - top 5 products by quantity
    const barData = [...filteredProducts]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
      .map(p => ({
        name: p.name,
        quantity: p.quantity
      }));
    
    return { typeData, seasonData, barData };
  };
  
  const { typeData, seasonData, barData } = prepareChartData();
  
  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Calculate summary statistics
  const totalProducts = filteredProducts.length;
  const totalQuantity = filteredProducts.reduce((sum, p) => sum + p.quantity, 0);
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const winterProducts = filteredProducts.filter(p => p.season === 'winter').length;

  // Loading state
  if (loading) {
    return (
      <div className="flex-center h-screen">
        <div className="space-y-4 text-center">
          <div className="skeleton-circle w-16 h-16 mx-auto"></div>
          <div className="skeleton-text w-48 h-6 mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400">લોડ થઈ રહ્યું છે... (Loading...)</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between flex-wrap gap-4">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                શાકભાજી અને ફળ વિક્રેતા એપ્લિકેશન
                <span className="block text-sm font-normal text-gray-500 dark:text-gray-400">
                  Fruit & Vegetable Vendor App
                </span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div className="relative">
                <div className="flex items-center bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-md">
                  <input
                    type="text"
                    placeholder="શોધો... (Search...)"
                    className="input-sm border-0 focus:ring-0"
                    value={filter.searchTerm}
                    onChange={(e) => setFilter(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                  <Search className="h-5 w-5 text-gray-400 mr-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card">
            <div className="stat-title">કુલ આઇટમ્સ (Total Items)</div>
            <div className="stat-value">{totalProducts}</div>
            <div className="stat-desc">
              ફળ: {filteredProducts.filter(p => p.type === 'fruit').length} | 
              શાકભાજી: {filteredProducts.filter(p => p.type === 'vegetable').length}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">કુલ જથ્થો (Total Quantity)</div>
            <div className="stat-value">{totalQuantity}</div>
            <div className="stat-desc">એકમ (units)</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">કુલ મૂલ્ય (Total Value)</div>
            <div className="stat-value">₹{totalValue.toLocaleString()}</div>
            <div className="stat-desc">બધા આઇટમ્સ (all items)</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">શિયાળુ આઇટમ્સ (Winter Items)</div>
            <div className="stat-value">{winterProducts}</div>
            <div className="stat-desc">શિયાળાની સીઝન (winter season)</div>
          </div>
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="card col-span-1">
            <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">પ્રકાર અનુસાર વિતરણ (Distribution by Type)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} એકમ (units)`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card col-span-1">
            <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">સીઝન અનુસાર વિતરણ (Distribution by Season)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={seasonData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {seasonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} એકમ (units)`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card col-span-1">
            <h2 className="text-lg font-medium mb-4 text-gray-800 dark:text-white">શ્રેષ્ઠ 5 આઇટમ્સ (Top 5 Items)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openAddModal}
              className="btn btn-primary flex items-center gap-1"
              aria-label="Add new item"
            >
              <Plus size={16} />
              <span>નવી આઇટમ (New Item)</span>
            </button>
            
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white flex items-center gap-1"
              aria-label="Toggle filters"
            >
              <Filter size={16} />
              <span>ફિલ્ટર્સ (Filters)</span>
              {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              className="btn bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
              aria-label="Export data"
            >
              <Download size={16} />
              <span>ડેટા એક્સપોર્ટ (Export)</span>
            </button>
            
            <label className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 cursor-pointer">
              <Upload size={16} />
              <span>ડેટા ઇમ્પોર્ટ (Import)</span>
              <input
                type="file"
                accept=".csv"
                className="hidden"
                onChange={importFromCSV}
              />
            </label>
            
            <button
              onClick={downloadTemplate}
              className="btn bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-1"
              aria-label="Download template"
            >
              <Download size={16} />
              <span>ટેમ્પ્લેટ (Template)</span>
            </button>
          </div>
        </div>
        
        {/* Filters Panel */}
        {isFilterOpen && (
          <div className="card mb-6 bg-gray-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="form-group mb-0">
                <label className="form-label">પ્રકાર (Type)</label>
                <select
                  name="type"
                  value={filter.type}
                  onChange={handleFilterChange}
                  className="input input-sm"
                >
                  <option value="all">બધા (All)</option>
                  <option value="fruit">ફળ (Fruit)</option>
                  <option value="vegetable">શાકભાજી (Vegetable)</option>
                </select>
              </div>
              
              <div className="form-group mb-0">
                <label className="form-label">સીઝન (Season)</label>
                <select
                  name="season"
                  value={filter.season}
                  onChange={handleFilterChange}
                  className="input input-sm"
                >
                  <option value="all">બધી (All)</option>
                  <option value="winter">શિયાળો (Winter)</option>
                  <option value="summer">ઉનાળો (Summer)</option>
                  <option value="monsoon">ચોમાસુ (Monsoon)</option>
                  <option value="autumn">શરદ (Autumn)</option>
                </select>
              </div>
              
              <div className="form-group mb-0">
                <label className="form-label">તારીખથી (Date From)</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filter.dateFrom}
                  onChange={handleFilterChange}
                  className="input input-sm"
                />
              </div>
              
              <div className="form-group mb-0">
                <label className="form-label">તારીખ સુધી (Date To)</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filter.dateTo}
                  onChange={handleFilterChange}
                  className="input input-sm"
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <button
                onClick={resetFilters}
                className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              >
                ફિલ્ટર્સ રીસેટ કરો (Reset Filters)
              </button>
            </div>
          </div>
        )}
        
        {/* Products Table */}
        <div className="overflow-hidden rounded-lg shadow">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header py-3 pl-6" style={{ width: '30%' }}>
                    <button
                      className="flex items-center gap-1 focus:outline-none"
                      onClick={() => requestSort('name')}
                      aria-label="Sort by name"
                    >
                      નામ (Name)
                      {sortConfig.key === 'name' && (
                        <ArrowDownUp size={14} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="table-header py-3">
                    <button
                      className="flex items-center gap-1 focus:outline-none"
                      onClick={() => requestSort('type')}
                      aria-label="Sort by type"
                    >
                      પ્રકાર (Type)
                      {sortConfig.key === 'type' && (
                        <ArrowDownUp size={14} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="table-header py-3">
                    <button
                      className="flex items-center gap-1 focus:outline-none"
                      onClick={() => requestSort('price')}
                      aria-label="Sort by price"
                    >
                      ભાવ (Price)
                      {sortConfig.key === 'price' && (
                        <ArrowDownUp size={14} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="table-header py-3">
                    <button
                      className="flex items-center gap-1 focus:outline-none"
                      onClick={() => requestSort('quantity')}
                      aria-label="Sort by quantity"
                    >
                      જથ્થો (Qty)
                      {sortConfig.key === 'quantity' && (
                        <ArrowDownUp size={14} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="table-header py-3">
                    <button
                      className="flex items-center gap-1 focus:outline-none"
                      onClick={() => requestSort('season')}
                      aria-label="Sort by season"
                    >
                      સીઝન (Season)
                      {sortConfig.key === 'season' && (
                        <ArrowDownUp size={14} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="table-header py-3">
                    <button
                      className="flex items-center gap-1 focus:outline-none"
                      onClick={() => requestSort('date')}
                      aria-label="Sort by date"
                    >
                      તારીખ (Date)
                      {sortConfig.key === 'date' && (
                        <ArrowDownUp size={14} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="table-header py-3 text-center">એક્શન (Actions)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {sortedProducts.length > 0 ? (
                  sortedProducts.map(product => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition"
                    >
                      <td className="table-cell">
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                        {product.notes && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {product.notes}
                          </div>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${product.type === 'fruit' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>
                          {product.type === 'fruit' ? 'ફળ (Fruit)' : 'શાકભાજી (Vegetable)'}
                        </span>
                      </td>
                      <td className="table-cell">₹{product.price}</td>
                      <td className="table-cell">{product.quantity}</td>
                      <td className="table-cell">
                        <span className={`${styles.seasonBadge} ${styles[product.season]}`}>
                          {product.season === 'winter' && 'શિયાળો (Winter)'}
                          {product.season === 'summer' && 'ઉનાળો (Summer)'}
                          {product.season === 'monsoon' && 'ચોમાસુ (Monsoon)'}
                          {product.season === 'autumn' && 'શરદ (Autumn)'}
                          {product.season === 'all' && 'બધી ઋતુ (All)'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {new Date(product.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="table-cell text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(product)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            aria-label="Edit item"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            aria-label="Delete item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="table-cell text-center py-8">
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <Truck className="h-12 w-12 mb-2" />
                        <p className="text-lg">કોઈ આઇટમ્સ મળી નથી (No items found)</p>
                        <p className="text-sm">નવી આઇટમ ઉમેરવા માટે "નવી આઇટમ" બટન પર ક્લિક કરો.</p>
                        <p className="text-sm">(Click "New Item" button to add items)</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Item count summary */}
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          કુલ {sortedProducts.length} આઇટમ્સ દર્શાવી રહ્યા છીએ (Showing {sortedProducts.length} items)
          {sortedProducts.length !== products.length && (
            <span> (કુલ {products.length} માંથી ફિલ્ટર કરેલ) (filtered from {products.length} total)</span>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-header">
              <h2 id="modal-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditMode ? 'આઇટમ સંપાદિત કરો (Edit Item)' : 'નવી આઇટમ ઉમેરો (Add New Item)'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">નામ (Name) *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="input"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="type" className="form-label">પ્રકાર (Type) *</label>
                    <select
                      id="type"
                      name="type"
                      required
                      className="input"
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="fruit">ફળ (Fruit)</option>
                      <option value="vegetable">શાકભાજી (Vegetable)</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="season" className="form-label">સીઝન (Season) *</label>
                    <select
                      id="season"
                      name="season"
                      required
                      className="input"
                      value={formData.season}
                      onChange={handleInputChange}
                    >
                      <option value="all">બધી ઋતુ (All Seasons)</option>
                      <option value="winter">શિયાળો (Winter)</option>
                      <option value="summer">ઉનાળો (Summer)</option>
                      <option value="monsoon">ચોમાસુ (Monsoon)</option>
                      <option value="autumn">શરદ (Autumn)</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">ભાવ (Price) *</label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="input"
                      value={formData.price}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="quantity" className="form-label">જથ્થો (Quantity) *</label>
                    <input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="0"
                      required
                      className="input"
                      value={formData.quantity}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="date" className="form-label">તારીખ (Date) *</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    required
                    className="input"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">નોંધ (Notes)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="input"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                >
                  રદ કરો (Cancel)
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditMode ? 'અપડેટ કરો (Update)' : 'ઉમેરો (Add)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-8">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;