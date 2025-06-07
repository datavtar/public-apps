import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Tag, 
  BarChart3,
  Eye,
  EyeOff,
  Moon,
  Sun,
  LogOut,
  Camera,
  FileText,
  Percent,
  ShoppingBag,
  Warehouse,
  ChevronDown,
  ChevronUp,
  Star,
  AlertCircle
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  sku: string;
  supplier?: string;
  image?: string;
  tags: string[];
  offers: Offer[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Offer {
  id: string;
  type: 'percentage' | 'fixed' | 'bogo';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

interface StoreSettings {
  storeName: string;
  currency: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark';
}

type TabType = 'dashboard' | 'products' | 'offers' | 'analytics' | 'settings';
type SortField = 'name' | 'price' | 'stock' | 'createdAt' | 'category';
type SortOrder = 'asc' | 'desc';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Food & Beverages', 'Home & Garden',
  'Health & Beauty', 'Sports & Outdoor', 'Books & Media', 'Toys & Games',
  'Automotive', 'Office Supplies'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Japanese'];
const TIMEZONES = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Asia/Kolkata'];

function App() {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'My Store',
    currency: 'USD',
    timezone: 'UTC',
    language: 'English',
    theme: 'light'
  });

  // Product Management States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Modal States
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form States
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    stock: 0,
    sku: '',
    supplier: '',
    tags: [],
    isActive: true
  });

  const [offerForm, setOfferForm] = useState<Partial<Offer>>({
    type: 'percentage',
    value: 0,
    description: '',
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('shop_products');
    const savedCategories = localStorage.getItem('shop_categories');
    const savedSettings = localStorage.getItem('shop_settings');

    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Initialize with sample data
      initializeSampleData();
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      initializeCategories();
    }

    if (savedSettings) {
      setStoreSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('shop_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('shop_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('shop_settings', JSON.stringify(storeSettings));
    
    // Apply theme
    if (storeSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [storeSettings]);

  const initializeSampleData = () => {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        price: 99.99,
        originalPrice: 129.99,
        category: 'Electronics',
        stock: 25,
        sku: 'WBH001',
        supplier: 'AudioTech Inc.',
        tags: ['wireless', 'bluetooth', 'headphones'],
        offers: [{
          id: 'off1',
          type: 'percentage',
          value: 20,
          description: '20% off limited time',
          startDate: '2025-06-01',
          endDate: '2025-06-30',
          isActive: true
        }],
        isActive: true,
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2025-06-07T00:00:00Z'
      },
      {
        id: '2',
        name: 'Organic Coffee Beans',
        description: 'Premium organic coffee beans, medium roast',
        price: 24.99,
        category: 'Food & Beverages',
        stock: 50,
        sku: 'OCB002',
        supplier: 'Green Bean Co.',
        tags: ['organic', 'coffee', 'premium'],
        offers: [],
        isActive: true,
        createdAt: '2025-06-02T00:00:00Z',
        updatedAt: '2025-06-07T00:00:00Z'
      }
    ];
    setProducts(sampleProducts);
  };

  const initializeCategories = () => {
    const initialCategories: Category[] = CATEGORIES.map((cat, index) => ({
      id: `cat_${index}`,
      name: cat,
      isActive: true
    }));
    setCategories(initialCategories);
  };

  // AI Functions
  const handleAiProductAnalysis = (file: File) => {
    const prompt = `Analyze this product image and extract detailed information. Return JSON with keys: "name", "description", "category", "estimatedPrice", "tags", "features". Focus on identifying the product type, key features, and provide a detailed description suitable for e-commerce.`;
    
    setAiResult(null);
    setAiError(null);
    setSelectedFile(file);
    
    try {
      aiLayerRef.current?.sendToAI(prompt, file);
    } catch (error) {
      setAiError('Failed to analyze product image');
    }
  };

  const handleAiBulkDescription = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please provide product details for description generation');
      return;
    }

    const prompt = `Generate a compelling product description for e-commerce based on these details: ${aiPrompt}. Return JSON with keys: "description", "features", "benefits", "suggestedTags". Make it marketing-friendly and highlight key selling points.`;
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to generate product description');
    }
  };

  // Product Management Functions
  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) {
      alert('Please fill in required fields (name and price)');
      return;
    }

    const now = new Date().toISOString();
    const productData: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: productForm.name || '',
      description: productForm.description || '',
      price: Number(productForm.price) || 0,
      originalPrice: Number(productForm.originalPrice) || undefined,
      category: productForm.category || '',
      stock: Number(productForm.stock) || 0,
      sku: productForm.sku || '',
      supplier: productForm.supplier || '',
      tags: productForm.tags || [],
      offers: editingProduct?.offers || [],
      isActive: productForm.isActive ?? true,
      createdAt: editingProduct?.createdAt || now,
      updatedAt: now
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? productData : p));
    } else {
      setProducts(prev => [...prev, productData]);
    }

    resetProductForm();
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setShowDeleteConfirm(false);
  };

  const handleBulkDelete = () => {
    setProducts(prev => prev.filter(p => !selectedProducts.includes(p.id)));
    setSelectedProducts([]);
    setShowDeleteConfirm(false);
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      stock: 0,
      sku: '',
      supplier: '',
      tags: [],
      isActive: true
    });
    setEditingProduct(null);
    setShowProductModal(false);
  };

  // Filtering and Sorting
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Analytics Calculations
  const analytics = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
    lowStockItems: products.filter(p => p.stock < 10).length,
    activeOffers: products.reduce((sum, p) => sum + p.offers.filter(o => o.isActive).length, 0),
    topCategories: CATEGORIES.map(cat => ({
      name: cat,
      count: products.filter(p => p.category === cat).length
    })).filter(c => c.count > 0).sort((a, b) => b.count - a.count).slice(0, 5)
  };

  // Export Functions
  const handleExportCSV = () => {
    const headers = ['Name', 'Description', 'Price', 'Category', 'Stock', 'SKU', 'Supplier', 'Tags'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        `"${p.name}"`,
        `"${p.description}"`,
        p.price,
        `"${p.category}"`,
        p.stock,
        `"${p.sku}"`,
        `"${p.supplier || ''}"`,
        `"${p.tags.join('; ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Name', 'Description', 'Price', 'Category', 'Stock', 'SKU', 'Supplier', 'Tags'];
    const sampleRow = ['Sample Product', 'Product description here', '29.99', 'Electronics', '100', 'SKU001', 'Supplier Name', 'tag1; tag2'];
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'product_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle CSV Import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const newProducts: Product[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',');
          const product: Product = {
            id: Date.now().toString() + i,
            name: values[0]?.replace(/"/g, '') || '',
            description: values[1]?.replace(/"/g, '') || '',
            price: parseFloat(values[2]) || 0,
            category: values[3]?.replace(/"/g, '') || '',
            stock: parseInt(values[4]) || 0,
            sku: values[5]?.replace(/"/g, '') || '',
            supplier: values[6]?.replace(/"/g, '') || '',
            tags: values[7]?.replace(/"/g, '').split(';').map(t => t.trim()).filter(t => t) || [],
            offers: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          newProducts.push(product);
        }
      }
      
      setProducts(prev => [...prev, ...newProducts]);
      setShowBulkUploadModal(false);
    };
    
    reader.readAsText(file);
  };

  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('products')}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Total Products</div>
              <div className="stat-value">{analytics.totalProducts}</div>
            </div>
            <Package className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Total Value</div>
              <div className="stat-value">{storeSettings.currency} {analytics.totalValue.toFixed(2)}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Low Stock</div>
              <div className="stat-value">{analytics.lowStockItems}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Active Offers</div>
              <div className="stat-value">{analytics.activeOffers}</div>
            </div>
            <Percent className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setShowProductModal(true);
              setEditingProduct(null);
            }}
            className="btn bg-blue-500 text-white hover:bg-blue-600 flex-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="btn bg-green-500 text-white hover:bg-green-600 flex-center"
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Import
          </button>
          <button
            onClick={handleExportCSV}
            className="btn bg-purple-500 text-white hover:bg-purple-600 flex-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className="btn bg-orange-500 text-white hover:bg-orange-600 flex-center"
          >
            <Tag className="w-4 h-4 mr-2" />
            Manage Offers
          </button>
        </div>
      </div>

      {/* Top Categories */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
        <div className="space-y-3">
          {analytics.topCategories.map((category, index) => (
            <div key={category.name} className="flex-between">
              <span className="text-gray-600 dark:text-gray-300">{category.name}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${(category.count / analytics.totalProducts) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div id="products-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="btn bg-green-500 text-white hover:bg-green-600"
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </button>
          <button
            onClick={handleExportCSV}
            className="btn bg-purple-500 text-white hover:bg-purple-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => {
              setShowProductModal(true);
              setEditingProduct(null);
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn bg-gray-500 text-white hover:bg-gray-600 flex-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
          </div>

          {showFilters && (
            <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Sort By</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="input"
                >
                  <option value="name">Name</option>
                  <option value="price">Price</option>
                  <option value="stock">Stock</option>
                  <option value="createdAt">Date Created</option>
                </select>
              </div>
              <div>
                <label className="form-label">Sort Order</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="input"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
              <div className="flex items-end">
                {selectedProducts.length > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="btn bg-red-500 text-white hover:bg-red-600 w-full"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Selected ({selectedProducts.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedProducts.map(product => (
          <div key={product.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex-between mb-3">
              <input
                type="checkbox"
                checked={selectedProducts.includes(product.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProducts([...selectedProducts, product.id]);
                  } else {
                    setSelectedProducts(selectedProducts.filter(id => id !== product.id));
                  }
                }}
                className="rounded"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingProduct(product);
                    setProductForm(product);
                    setShowProductModal(true);
                  }}
                  className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {product.description}
                </p>
              </div>

              <div className="flex-between">
                <div>
                  <span className="text-xl font-bold text-green-600">
                    {storeSettings.currency} {product.price}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {storeSettings.currency} {product.originalPrice}
                    </span>
                  )}
                </div>
                <span className="badge badge-info">{product.category}</span>
              </div>

              <div className="flex-between text-sm">
                <span>Stock: <strong>{product.stock}</strong></span>
                <span>SKU: <strong>{product.sku}</strong></span>
              </div>

              {product.offers.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {product.offers.filter(o => o.isActive).map(offer => (
                    <span key={offer.id} className="badge badge-warning text-xs">
                      {offer.type === 'percentage' ? `${offer.value}% OFF` : `${storeSettings.currency} ${offer.value} OFF`}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex-between">
                <span className={`badge ${product.isActive ? 'badge-success' : 'badge-error'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
                {product.stock < 10 && (
                  <span className="badge badge-warning">Low Stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAndSortedProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory ? 'Try adjusting your search or filters' : 'Get started by adding your first product'}
          </p>
        </div>
      )}
    </div>
  );

  const renderOffers = () => (
    <div id="offers-tab" className="space-y-6">
      <div className="flex-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Offers & Discounts</h2>
        <button
          onClick={() => setShowOfferModal(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </button>
      </div>

      <div className="alert alert-info">
        <Tag className="w-5 h-5" />
        <p>Create and manage special offers for your products. Offers can be percentage-based, fixed amount, or buy-one-get-one deals.</p>
      </div>

      {/* Offers will be displayed here - simplified for brevity */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Active Offers</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Offer management functionality would be implemented here with full CRUD operations.
        </p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div id="analytics-tab" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Category Distribution</h3>
          <div className="space-y-3">
            {analytics.topCategories.map((category) => (
              <div key={category.name} className="flex-between">
                <span>{category.name}</span>
                <span className="font-medium">{category.count} items</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Inventory Summary</h3>
          <div className="space-y-3">
            <div className="flex-between">
              <span>Total Products</span>
              <span className="font-medium">{analytics.totalProducts}</span>
            </div>
            <div className="flex-between">
              <span>Total Inventory Value</span>
              <span className="font-medium">{storeSettings.currency} {analytics.totalValue.toFixed(2)}</span>
            </div>
            <div className="flex-between">
              <span>Low Stock Items</span>
              <span className="font-medium text-red-600">{analytics.lowStockItems}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div id="settings-tab" className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Store Settings</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input
                type="text"
                value={storeSettings.storeName}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, storeName: e.target.value }))}
                className="input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                value={storeSettings.currency}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, currency: e.target.value }))}
                className="input"
              >
                {CURRENCIES.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Language</label>
              <select
                value={storeSettings.language}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, language: e.target.value }))}
                className="input"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Timezone</label>
              <select
                value={storeSettings.timezone}
                onChange={(e) => setStoreSettings(prev => ({ ...prev, timezone: e.target.value }))}
                className="input"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Data Management</h3>
          <div className="space-y-4">
            <button
              onClick={handleDownloadTemplate}
              className="btn bg-blue-500 text-white hover:bg-blue-600 w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Import Template
            </button>

            <button
              onClick={handleExportCSV}
              className="btn bg-green-500 text-white hover:bg-green-600 w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export All Data
            </button>

            <button
              onClick={() => {
                if (window.confirm('Are you sure? This will delete all products and cannot be undone.')) {
                  setProducts([]);
                  localStorage.removeItem('shop_products');
                }
              }}
              className="btn bg-red-500 text-white hover:bg-red-600 w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </button>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-3">Theme Settings</h4>
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <button
                onClick={() => setStoreSettings(prev => ({ 
                  ...prev, 
                  theme: prev.theme === 'light' ? 'dark' : 'light' 
                }))}
                className="theme-toggle"
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Features Section */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">AI-Powered Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-3">Product Image Analysis</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Upload a product image to automatically extract details like name, description, and category.
            </p>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAiProductAnalysis(file);
                }}
                className="input"
              />
              {isAiLoading && (
                <div className="text-sm text-blue-600">Analyzing image...</div>
              )}
              {aiResult && (
                <div className="bg-green-50 dark:bg-green-900 p-3 rounded text-sm">
                  <strong>AI Analysis Result:</strong>
                  <pre className="mt-2 whitespace-pre-wrap">{aiResult}</pre>
                </div>
              )}
              {aiError && (
                <div className="bg-red-50 dark:bg-red-900 p-3 rounded text-sm text-red-700 dark:text-red-300">
                  Error: {aiError}
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Description Generator</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Provide basic product details to generate compelling descriptions.
            </p>
            <div className="space-y-3">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter product details (e.g., 'Wireless headphones, Bluetooth 5.0, noise canceling')"
                className="input min-h-[100px]"
              />
              <button
                onClick={handleAiBulkDescription}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="btn btn-primary w-full disabled:opacity-50"
              >
                {isAiLoading ? 'Generating...' : 'Generate Description'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center gap-4">
              <ShoppingBag className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {storeSettings.storeName}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {currentUser?.first_name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setStoreSettings(prev => ({ 
                  ...prev, 
                  theme: prev.theme === 'light' ? 'dark' : 'light' 
                }))}
                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {storeSettings.theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={logout}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b">
        <div className="container-fluid">
          <div className="flex space-x-1 py-2">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'products', label: 'Products', icon: Package },
              { key: 'offers', label: 'Offers', icon: Tag },
              { key: 'analytics', label: 'Analytics', icon: TrendingUp },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main id="generation_issue_fallback" className="container-fluid py-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'products' && renderProducts()}
        {activeTab === 'offers' && renderOffers()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div className="modal-backdrop" onClick={() => setShowProductModal(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setShowProductModal(false)}>×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Original Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.originalPrice || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    value={productForm.category || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                    className="input"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    value={productForm.stock || ''}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={productForm.description || ''}
                  onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input
                  type="text"
                  value={productForm.supplier || ''}
                  onChange={(e) => setProductForm(prev => ({ ...prev, supplier: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={productForm.isActive ?? true}
                  onChange={(e) => setProductForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded mr-2"
                />
                <label htmlFor="isActive" className="text-sm">Product is active</label>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowProductModal(false)}
                className="btn bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                className="btn btn-primary"
              >
                {editingProduct ? 'Update' : 'Save'} Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="modal-backdrop" onClick={() => setShowBulkUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Bulk Import Products</h3>
              <button onClick={() => setShowBulkUploadModal(false)}>×</button>
            </div>

            <div className="space-y-4">
              <div className="alert alert-info">
                <FileText className="w-5 h-5" />
                <p>Upload a CSV file with your products. Download the template first to see the required format.</p>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="btn bg-blue-500 text-white hover:bg-blue-600 w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </button>

              <div className="form-group">
                <label className="form-label">Upload CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowBulkUploadModal(false)}
                className="btn bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Confirm Deletion</h3>
              <button onClick={() => setShowDeleteConfirm(false)}>×</button>
            </div>

            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete {selectedProducts.length > 0 ? `${selectedProducts.length} selected products` : 'this product'}? 
              This action cannot be undone.
            </p>

            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn bg-gray-300 text-gray-700 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={selectedProducts.length > 0 ? handleBulkDelete : () => setShowDeleteConfirm(false)}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          setSelectedFile(null);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t py-4 mt-12">
        <div className="container-fluid">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;