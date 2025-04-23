import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Save, Trash2, Edit, Plus, Search, Filter, ArrowDownUp, Moon, Sun, ShoppingCart, Fruit, Package, TrendingUp, Download } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define TypeScript interfaces and types
interface Product {
  id: string;
  name: string;
  category: 'fruit' | 'vegetable';
  price: number;
  stock: number;
  season: 'summer' | 'winter' | 'monsoon' | 'all';
  imageUrl?: string;
}

interface Sale {
  id: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  date: string;
}

type Season = 'summer' | 'winter' | 'monsoon' | 'all';
type SortDirection = 'asc' | 'desc';
type SortField = 'name' | 'price' | 'stock' | 'category';
type ViewMode = 'products' | 'sales' | 'dashboard';

const App: React.FC = () => {
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('products');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSeason, setFilterSeason] = useState<Season | ''>('');
  const [filterCategory, setFilterCategory] = useState<'fruit' | 'vegetable' | ''>('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Form state
  const [isAddingProduct, setIsAddingProduct] = useState<boolean>(false);
  const [isAddingSale, setIsAddingSale] = useState<boolean>(false);
  const [isEditingProduct, setIsEditingProduct] = useState<string | null>(null);
  
  // New product form data
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({ 
    name: '', 
    category: 'fruit', 
    price: 0, 
    stock: 0, 
    season: 'all' 
  });
  
  // New sale form data
  const [newSale, setNewSale] = useState<{
    productId: string;
    quantity: number;
  }>({ 
    productId: '', 
    quantity: 1
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('products');
    const savedSales = localStorage.getItem('sales');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Demo data if no products exists
      const demoProducts: Product[] = [
        { id: '1', name: 'આંબો', category: 'fruit', price: 100, stock: 50, season: 'summer' },
        { id: '2', name: 'સફરજન', category: 'fruit', price: 80, stock: 60, season: 'winter' },
        { id: '3', name: 'કેળા', category: 'fruit', price: 40, stock: 100, season: 'all' },
        { id: '4', name: 'દ્રાક્ષ', category: 'fruit', price: 120, stock: 30, season: 'winter' },
        { id: '5', name: 'બટાકા', category: 'vegetable', price: 30, stock: 200, season: 'all' },
        { id: '6', name: 'ટામેટા', category: 'vegetable', price: 60, stock: 80, season: 'all' },
        { id: '7', name: 'ડુંગળી', category: 'vegetable', price: 40, stock: 150, season: 'all' },
        { id: '8', name: 'કાકડી', category: 'vegetable', price: 25, stock: 70, season: 'summer' },
      ];
      setProducts(demoProducts);
      localStorage.setItem('products', JSON.stringify(demoProducts));
    }
    
    if (savedSales) {
      setSales(JSON.parse(savedSales));
    } else {
      // Demo sales data if none exists
      const demoSales: Sale[] = [
        { id: '1', productId: '1', quantity: 5, totalPrice: 500, date: '2023-05-10' },
        { id: '2', productId: '3', quantity: 10, totalPrice: 400, date: '2023-05-11' },
        { id: '3', productId: '5', quantity: 8, totalPrice: 240, date: '2023-05-11' },
        { id: '4', productId: '2', quantity: 3, totalPrice: 240, date: '2023-06-15' },
        { id: '5', productId: '6', quantity: 6, totalPrice: 360, date: '2023-06-16' },
        { id: '6', productId: '4', quantity: 2, totalPrice: 240, date: '2023-07-20' },
        { id: '7', productId: '7', quantity: 5, totalPrice: 200, date: '2023-08-05' },
        { id: '8', productId: '8', quantity: 7, totalPrice: 175, date: '2023-08-10' },
      ];
      setSales(demoSales);
      localStorage.setItem('sales', JSON.stringify(demoSales));
    }
    
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Update localStorage when products change
  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);
  
  // Update localStorage when sales change
  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);
  
  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);
  
  // Function to generate unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };
  
  // Function to add a new product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProductWithId: Product = {
      ...newProduct,
      id: generateId(),
    };
    setProducts([...products, newProductWithId]);
    setNewProduct({ name: '', category: 'fruit', price: 0, stock: 0, season: 'all' });
    setIsAddingProduct(false);
  };
  
  // Function to update a product
  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingProduct) {
      setProducts(products.map(product => 
        product.id === isEditingProduct ? 
        { ...newProduct, id: isEditingProduct } : 
        product
      ));
      setIsEditingProduct(null);
      setNewProduct({ name: '', category: 'fruit', price: 0, stock: 0, season: 'all' });
    }
  };
  
  // Function to delete a product
  const handleDeleteProduct = (id: string) => {
    // Check if product is used in sales
    const isUsedInSales = sales.some(sale => sale.productId === id);
    
    if (isUsedInSales) {
      alert('આ ઉત્પાદન વેચાણમાં ઉપયોગ થયેલ છે, તેને દૂર કરી શકાતો નથી.');
      return;
    }
    
    setProducts(products.filter(product => product.id !== id));
  };
  
  // Function to add a new sale
  const handleAddSale = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === newSale.productId);
    
    if (!product) {
      alert('કૃપા કરીને ઉત્પાદન પસંદ કરો.');
      return;
    }
    
    if (newSale.quantity <= 0) {
      alert('કૃપા કરીને માન્ય જથ્થો દાખલ કરો.');
      return;
    }
    
    if (newSale.quantity > product.stock) {
      alert(`માફ કરશો, ${product.name} ના માટે ફક્ત ${product.stock} સ્ટોકમાં છે.`);
      return;
    }
    
    const totalPrice = product.price * newSale.quantity;
    
    const sale: Sale = {
      id: generateId(),
      productId: newSale.productId,
      quantity: newSale.quantity,
      totalPrice,
      date: new Date().toISOString().split('T')[0],
    };
    
    // Update sales
    setSales([...sales, sale]);
    
    // Update product stock
    setProducts(products.map(p => 
      p.id === product.id ? 
      { ...p, stock: p.stock - newSale.quantity } : 
      p
    ));
    
    setNewSale({ productId: '', quantity: 1 });
    setIsAddingSale(false);
  };
  
  // Function to start editing a product
  const startEditProduct = (product: Product) => {
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      season: product.season,
    });
    setIsEditingProduct(product.id);
    setIsAddingProduct(true);
  };
  
  // Filter and sort products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSeason = !filterSeason || product.season === filterSeason || product.season === 'all';
      const matchesCategory = !filterCategory || product.category === filterCategory;
      return matchesSearch && matchesSeason && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortField === 'price' || sortField === 'stock') {
        return sortDirection === 'asc' 
          ? a[sortField] - b[sortField] 
          : b[sortField] - a[sortField];
      } else if (sortField === 'category') {
        return sortDirection === 'asc' 
          ? a.category.localeCompare(b.category) 
          : b.category.localeCompare(a.category);
      }
      return 0;
    });
  
  // Get sales with product details
  const salesWithProducts = sales.map(sale => {
    const product = products.find(p => p.id === sale.productId) || 
      { id: '', name: 'ઉત્પાદન ઉપલબ્ધ નથી', category: 'fruit' as const, price: 0, stock: 0, season: 'all' as const };
    return {
      ...sale,
      productName: product.name,
      productCategory: product.category,
      unitPrice: product.price,
    };
  });
  
  // Dashboard data processing
  const salesByCategory = {
    fruit: salesWithProducts
      .filter(sale => products.find(p => p.id === sale.productId)?.category === 'fruit')
      .reduce((sum, sale) => sum + sale.totalPrice, 0),
    vegetable: salesWithProducts
      .filter(sale => products.find(p => p.id === sale.productId)?.category === 'vegetable')
      .reduce((sum, sale) => sum + sale.totalPrice, 0),
  };

  const pieChartData = [
    { name: 'ફળ', value: salesByCategory.fruit },
    { name: 'શાકભાજી', value: salesByCategory.vegetable },
  ];

  // Sales by product (top 5)
  const salesByProduct = products.map(product => {
    const productSales = sales
      .filter(sale => sale.productId === product.id)
      .reduce((sum, sale) => sum + sale.totalPrice, 0);
    return {
      name: product.name,
      value: productSales,
    };
  }).sort((a, b) => b.value - a.value).slice(0, 5);

  // Monthly sales data for bar chart
  const monthlySalesData = sales.reduce<Record<string, number>>((acc, sale) => {
    const month = sale.date.substring(0, 7);
    acc[month] = (acc[month] || 0) + sale.totalPrice;
    return acc;
  }, {});

  const barChartData = Object.entries(monthlySalesData).map(([month, value]) => {
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'જાન્યુ', 'ફેબ્રુ', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન',
      'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટે', 'ઓક્ટો', 'નવે', 'ડિસે'
    ];
    return {
      name: `${monthNames[parseInt(monthNum) - 1]} ${year}`,
      value: value,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

  // Template download function
  const downloadTemplate = () => {
    // Create CSV content
    const headers = 'નામ,વર્ગ (fruit/vegetable),કિંમત,સ્ટોક,ઋતુ (summer/winter/monsoon/all)\n';
    const sampleRows = 'આંબો,fruit,120,50,summer\nગાજર,vegetable,40,100,winter\n';
    const csvContent = headers + sampleRows;
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ઉત્પાદન_ટેમ્પલેટ.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate PDF sales report
  const downloadSalesReport = () => {
    // Create text content for the report
    let reportContent = 'વેચાણ અહેવાલ\n\n';
    reportContent += 'તારીખ: ' + new Date().toLocaleDateString('gu-IN') + '\n\n';
    
    reportContent += 'કુલ વેચાણ: ₹' + sales.reduce((sum, sale) => sum + sale.totalPrice, 0) + '\n';
    reportContent += 'ફળ વેચાણ: ₹' + salesByCategory.fruit + '\n';
    reportContent += 'શાકભાજી વેચાણ: ₹' + salesByCategory.vegetable + '\n\n';
    
    reportContent += 'વેચાણ વિગતો:\n';
    salesWithProducts.forEach((sale, index) => {
      reportContent += `${index + 1}. ${sale.productName} - ${sale.quantity} x ₹${sale.unitPrice} = ₹${sale.totalPrice} (${sale.date})\n`;
    });
    
    // Create blob and download link
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'વેચાણ_અહેવાલ.txt');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-white theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow p-4 sticky top-0 z-10 flex-between">
        <h1 className="text-xl font-bold">ફળ અને શાકભાજી મેનેજમેન્ટ</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)} 
            className="p-2 rounded-full bg-gray-100 dark:bg-slate-700 flex-center"
            aria-label={isDarkMode ? 'લાઇટ મોડ' : 'ડાર્ક મોડ'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-gray-50 dark:bg-slate-800 p-4 shadow-sm flex justify-center gap-2 md:gap-4 flex-wrap">
        <button 
          onClick={() => setViewMode('products')} 
          className={`btn ${viewMode === 'products' ? 'btn-primary' : 'bg-white dark:bg-slate-700'} flex-center gap-2`}
          aria-label="ઉત્પાદનો વ્યવસ્થાપિત કરો"
        >
          <Package size={18} />
          <span>ઉત્પાદનો</span>
        </button>
        <button 
          onClick={() => setViewMode('sales')} 
          className={`btn ${viewMode === 'sales' ? 'btn-primary' : 'bg-white dark:bg-slate-700'} flex-center gap-2`}
          aria-label="વેચાણ વ્યવસ્થાપિત કરો"
        >
          <ShoppingCart size={18} />
          <span>વેચાણ</span>
        </button>
        <button 
          onClick={() => setViewMode('dashboard')} 
          className={`btn ${viewMode === 'dashboard' ? 'btn-primary' : 'bg-white dark:bg-slate-700'} flex-center gap-2`}
          aria-label="ડેશબોર્ડ જુઓ"
        >
          <TrendingUp size={18} />
          <span>ડેશબોર્ડ</span>
        </button>
      </nav>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Products View */}
        {viewMode === 'products' && (
          <div>
            <div className="flex-between flex-wrap gap-4 mb-6">
              <h2 className="text-2xl font-semibold">ઉત્પાદન સૂચિ</h2>
              <button 
                onClick={() => {
                  setIsAddingProduct(true);
                  setIsEditingProduct(null);
                  setNewProduct({ name: '', category: 'fruit', price: 0, stock: 0, season: 'all' });
                }} 
                className="btn btn-primary flex-center gap-2"
                aria-label="નવું ઉત્પાદન ઉમેરો"
              >
                <Plus size={18} />
                <span>નવું ઉત્પાદન</span>
              </button>
              <button 
                onClick={downloadTemplate} 
                className="btn bg-green-500 hover:bg-green-600 text-white flex-center gap-2"
                aria-label="ટેમ્પલેટ ડાઉનલોડ કરો"
              >
                <Download size={18} />
                <span>ટેમ્પલેટ ડાઉનલોડ</span>
              </button>
            </div>
            
            {/* Search, Filter, and Sort Controls */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="ઉત્પાદન શોધો..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input pl-10"
                    aria-label="ઉત્પાદન શોધો"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="form-label" htmlFor="filter-season">ઋતુ</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter size={16} className="text-gray-400" />
                      </div>
                      <select
                        id="filter-season"
                        value={filterSeason}
                        onChange={(e) => setFilterSeason(e.target.value as Season | '')}
                        className="input pl-10"
                        aria-label="ઋતુ દ્વારા ફિલ્ટર કરો"
                      >
                        <option value="">બધી ઋતુઓ</option>
                        <option value="summer">ઉનાળો</option>
                        <option value="winter">શિયાળો</option>
                        <option value="monsoon">ચોમાસું</option>
                        <option value="all">બધી ઋતુ</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="form-label" htmlFor="filter-category">વર્ગ</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Filter size={16} className="text-gray-400" />
                      </div>
                      <select
                        id="filter-category"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value as 'fruit' | 'vegetable' | '')}
                        className="input pl-10"
                        aria-label="વર્ગ દ્વારા ફિલ્ટર કરો"
                      >
                        <option value="">બધા વર્ગો</option>
                        <option value="fruit">ફળ</option>
                        <option value="vegetable">શાકભાજી</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="form-label" htmlFor="sort-field">સૉર્ટ</label>
                  <div className="flex gap-2">
                    <select
                      id="sort-field"
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value as SortField)}
                      className="input flex-1"
                      aria-label="સૉર્ટ ફિલ્ડ"
                    >
                      <option value="name">નામ</option>
                      <option value="price">કિંમત</option>
                      <option value="stock">સ્ટોક</option>
                      <option value="category">વર્ગ</option>
                    </select>
                    <button 
                      onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                      className="btn bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-white"
                      aria-label="સૉર્ટ દિશા બદલો"
                    >
                      <ArrowDownUp size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Products List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">નામ</th>
                      <th className="table-header">વર્ગ</th>
                      <th className="table-header">કિંમત (₹)</th>
                      <th className="table-header">સ્ટોક</th>
                      <th className="table-header">ઋતુ</th>
                      <th className="table-header">ક્રિયાઓ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map(product => (
                        <tr key={product.id}>
                          <td className="table-cell">{product.name}</td>
                          <td className="table-cell">
                            <span className={`badge ${product.category === 'fruit' ? 'badge-info' : 'badge-success'}`}>
                              {product.category === 'fruit' ? 'ફળ' : 'શાકભાજી'}
                            </span>
                          </td>
                          <td className="table-cell">₹{product.price}</td>
                          <td className="table-cell">
                            <span className={`font-medium ${product.stock < 10 ? 'text-red-600 dark:text-red-400' : ''}`}>
                              {product.stock}
                            </span>
                          </td>
                          <td className="table-cell">
                            {product.season === 'summer' && 'ઉનાળો'}
                            {product.season === 'winter' && 'શિયાળો'}
                            {product.season === 'monsoon' && 'ચોમાસું'}
                            {product.season === 'all' && 'બધી ઋતુ'}
                          </td>
                          <td className="table-cell">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => startEditProduct(product)}
                                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-full dark:text-blue-400 dark:hover:bg-blue-900"
                                aria-label="ઉત્પાદન સંપાદિત કરો"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="p-1.5 text-red-600 hover:bg-red-100 rounded-full dark:text-red-400 dark:hover:bg-red-900"
                                aria-label="ઉત્પાદન કાઢી નાખો"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="table-cell text-center">
                          કોઈ ઉત્પાદનો મળ્યા નથી. કૃપા કરીને તમારા ફિલ્ટર્સ બદલો અથવા નવું ઉત્પાદન ઉમેરો.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Add/Edit Product Modal */}
            {isAddingProduct && (
              <div className="modal-backdrop" onClick={() => {
                setIsAddingProduct(false);
                setIsEditingProduct(null);
              }}>
                <div className="modal-content theme-transition" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {isEditingProduct ? 'ઉત્પાદન સંપાદિત કરો' : 'નવું ઉત્પાદન ઉમેરો'}
                    </h3>
                    <button 
                      onClick={() => {
                        setIsAddingProduct(false);
                        setIsEditingProduct(null);
                      }}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      aria-label="બંધ કરો"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <form onSubmit={isEditingProduct ? handleUpdateProduct : handleAddProduct} className="mt-4">
                    <div className="form-group">
                      <label htmlFor="name" className="form-label">નામ</label>
                      <input 
                        type="text" 
                        id="name"
                        value={newProduct.name} 
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="input"
                        required
                        aria-required="true"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="category" className="form-label">વર્ગ</label>
                      <select 
                        id="category"
                        value={newProduct.category} 
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value as 'fruit' | 'vegetable'})}
                        className="input"
                        required
                        aria-required="true"
                      >
                        <option value="fruit">ફળ</option>
                        <option value="vegetable">શાકભાજી</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="price" className="form-label">કિંમત (₹)</label>
                      <input 
                        type="number" 
                        id="price"
                        value={newProduct.price} 
                        onChange={(e) => setNewProduct({...newProduct, price: Number(e.target.value)})}
                        min="0"
                        step="0.01"
                        className="input"
                        required
                        aria-required="true"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="stock" className="form-label">સ્ટોક</label>
                      <input 
                        type="number" 
                        id="stock"
                        value={newProduct.stock} 
                        onChange={(e) => setNewProduct({...newProduct, stock: Number(e.target.value)})}
                        min="0"
                        className="input"
                        required
                        aria-required="true"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="season" className="form-label">ઋતુ</label>
                      <select 
                        id="season"
                        value={newProduct.season} 
                        onChange={(e) => setNewProduct({...newProduct, season: e.target.value as Season})}
                        className="input"
                        required
                        aria-required="true"
                      >
                        <option value="summer">ઉનાળો</option>
                        <option value="winter">શિયાળો</option>
                        <option value="monsoon">ચોમાસું</option>
                        <option value="all">બધી ઋતુ</option>
                      </select>
                    </div>
                    
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        onClick={() => {
                          setIsAddingProduct(false);
                          setIsEditingProduct(null);
                        }}
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                        aria-label="રદ કરો"
                      >
                        રદ કરો
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        aria-label="સાચવો"
                      >
                        <Save size={18} className="mr-1" />
                        સાચવો
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Sales View */}
        {viewMode === 'sales' && (
          <div>
            <div className="flex-between flex-wrap gap-4 mb-6">
              <h2 className="text-2xl font-semibold">વેચાણ સૂચિ</h2>
              <div className="flex gap-2">
                <button 
                  onClick={downloadSalesReport} 
                  className="btn bg-green-500 hover:bg-green-600 text-white flex-center gap-2"
                  aria-label="વેચાણ અહેવાલ ડાઉનલોડ કરો"
                >
                  <Download size={18} />
                  <span>અહેવાલ ડાઉનલોડ</span>
                </button>
                <button 
                  onClick={() => {
                    if (products.length === 0) {
                      alert('કૃપા કરીને પહેલા કોઈ ઉત્પાદન ઉમેરો.');
                      return;
                    }
                    setIsAddingSale(true);
                    setNewSale({ productId: products[0].id, quantity: 1 });
                  }} 
                  className="btn btn-primary flex-center gap-2"
                  aria-label="નવું વેચાણ ઉમેરો"
                >
                  <Plus size={18} />
                  <span>નવું વેચાણ</span>
                </button>
              </div>
            </div>
            
            {/* Sales List */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">તારીખ</th>
                      <th className="table-header">ઉત્પાદન</th>
                      <th className="table-header">વર્ગ</th>
                      <th className="table-header">જથ્થો</th>
                      <th className="table-header">એકમ કિંમત</th>
                      <th className="table-header">કુલ કિંમત</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {salesWithProducts.length > 0 ? (
                      salesWithProducts.map(sale => (
                        <tr key={sale.id}>
                          <td className="table-cell">{sale.date}</td>
                          <td className="table-cell">{sale.productName}</td>
                          <td className="table-cell">
                            <span className={`badge ${sale.productCategory === 'fruit' ? 'badge-info' : 'badge-success'}`}>
                              {sale.productCategory === 'fruit' ? 'ફળ' : 'શાકભાજી'}
                            </span>
                          </td>
                          <td className="table-cell">{sale.quantity}</td>
                          <td className="table-cell">₹{sale.unitPrice}</td>
                          <td className="table-cell font-semibold">₹{sale.totalPrice}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="table-cell text-center">
                          કોઈ વેચાણ મળ્યું નથી. ઉત્પાદન વેચવા માટે 'નવું વેચાણ' બટન પર ક્લિક કરો.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <td colSpan={5} className="table-cell text-right font-semibold">કુલ વેચાણ:</td>
                      <td className="table-cell font-bold">₹{sales.reduce((sum, sale) => sum + sale.totalPrice, 0)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            {/* Add Sale Modal */}
            {isAddingSale && (
              <div className="modal-backdrop" onClick={() => setIsAddingSale(false)}>
                <div className="modal-content theme-transition" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">નવું વેચાણ ઉમેરો</h3>
                    <button 
                      onClick={() => setIsAddingSale(false)}
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      aria-label="બંધ કરો"
                    >
                      &times;
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddSale} className="mt-4">
                    <div className="form-group">
                      <label htmlFor="productId" className="form-label">ઉત્પાદન</label>
                      <select 
                        id="productId"
                        value={newSale.productId} 
                        onChange={(e) => setNewSale({...newSale, productId: e.target.value})}
                        className="input"
                        required
                        aria-required="true"
                      >
                        {products
                          .filter(product => product.stock > 0)
                          .map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ₹{product.price} ({product.stock} સ્ટોકમાં)
                            </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="quantity" className="form-label">જથ્થો</label>
                      <input 
                        type="number" 
                        id="quantity"
                        value={newSale.quantity} 
                        onChange={(e) => setNewSale({...newSale, quantity: Number(e.target.value)})}
                        min="1"
                        max={products.find(p => p.id === newSale.productId)?.stock || 1}
                        className="input"
                        required
                        aria-required="true"
                      />
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg dark:bg-slate-700">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-slate-300 mb-2">મૂલ્ય માહિતી:</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>એકમ કિંમત:</div>
                        <div className="font-medium">₹{products.find(p => p.id === newSale.productId)?.price || 0}</div>
                        <div>જથ્થો:</div>
                        <div className="font-medium">{newSale.quantity}</div>
                        <div className="font-semibold">કુલ કિંમત:</div>
                        <div className="font-semibold">₹{(products.find(p => p.id === newSale.productId)?.price || 0) * newSale.quantity}</div>
                      </div>
                    </div>
                    
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        onClick={() => setIsAddingSale(false)}
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                        aria-label="રદ કરો"
                      >
                        રદ કરો
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        aria-label="વેચાણ સાચવો"
                      >
                        <Save size={18} className="mr-1" />
                        વેચાણ સાચવો
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">વેચાણ ડેશબોર્ડ</h2>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="stat-card">
                <div className="stat-title">કુલ વેચાણ</div>
                <div className="stat-value">₹{sales.reduce((sum, sale) => sum + sale.totalPrice, 0)}</div>
                <div className="stat-desc">કુલ {sales.length} વેચાણ</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">ફળ વેચાણ</div>
                <div className="stat-value">₹{salesByCategory.fruit}</div>
                <div className="stat-desc">{((salesByCategory.fruit / (salesByCategory.fruit + salesByCategory.vegetable)) * 100 || 0).toFixed(1)}% કુલ વેચાણનો</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">શાકભાજી વેચાણ</div>
                <div className="stat-value">₹{salesByCategory.vegetable}</div>
                <div className="stat-desc">{((salesByCategory.vegetable / (salesByCategory.fruit + salesByCategory.vegetable)) * 100 || 0).toFixed(1)}% કુલ વેચાણનો</div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown Pie Chart */}
              <div className="card p-6">
                <h3 className="text-lg font-medium mb-4">વર્ગ અનુસાર વેચાણ</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value}`, 'વેચાણ']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Top Products Bar Chart */}
              <div className="card p-6">
                <h3 className="text-lg font-medium mb-4">શ્રેષ્ઠ ઉત્પાદનો</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesByProduct}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `₹${value}`} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'વેચાણ']} />
                      <Bar dataKey="value" fill="#8884d8">
                        {salesByProduct.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Monthly Sales Trend */}
              <div className="card p-6 lg:col-span-2">
                <h3 className="text-lg font-medium mb-4">માસિક વેચાણ ટ્રેન્ડ</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barChartData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${value}`} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'વેચાણ']} />
                      <Legend />
                      <Bar name="માસિક વેચાણ" dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Inventory Status */}
            <div className="card p-6 mt-6">
              <h3 className="text-lg font-medium mb-4">સ્ટોક અલર્ટ</h3>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">ઉત્પાદન</th>
                      <th className="table-header">વર્ગ</th>
                      <th className="table-header">વર્તમાન સ્ટોક</th>
                      <th className="table-header">સ્થિતિ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {products
                      .filter(product => product.stock < 20)
                      .sort((a, b) => a.stock - b.stock)
                      .map(product => (
                        <tr key={product.id}>
                          <td className="table-cell">{product.name}</td>
                          <td className="table-cell">
                            <span className={`badge ${product.category === 'fruit' ? 'badge-info' : 'badge-success'}`}>
                              {product.category === 'fruit' ? 'ફળ' : 'શાકભાજી'}
                            </span>
                          </td>
                          <td className="table-cell">{product.stock}</td>
                          <td className="table-cell">
                            {product.stock === 0 ? (
                              <span className="badge badge-error">સ્ટોક ખૂટી ગયો છે</span>
                            ) : product.stock < 10 ? (
                              <span className="badge badge-warning">ઓછો સ્ટોક</span>
                            ) : (
                              <span className="badge bg-yellow-50 text-yellow-600">પૂરતો સ્ટોક</span>
                            )}
                          </td>
                        </tr>
                    ))}
                    {products.filter(product => product.stock < 20).length === 0 && (
                      <tr>
                        <td colSpan={4} className="table-cell text-center">
                          બધા ઉત્પાદનોનો સ્ટોક પૂરતો છે!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 p-6 shadow-inner mt-auto">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
