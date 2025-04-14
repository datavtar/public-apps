import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  X,
  Moon,
  Sun,
  FileText,
  BarChart2,
  Package,
  ShoppingBag,
  Truck,
  AlertCircle,
  Check
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, PieChart, Pie } from 'recharts';
import styles from './styles/styles.module.css';

// Define types for our inventory items
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  threshold: number;
  price: number;
  supplier: string;
  lastUpdated: string;
  notes?: string;
  type: 'product' | 'equipment';
}

// Type for the form state
type FormData = Omit<InventoryItem, 'id' | 'lastUpdated'> & { id?: string };

// Type for sorting
type SortField = 'name' | 'category' | 'quantity' | 'price';
type SortDirection = 'asc' | 'desc';

// Types for filters
interface Filters {
  search: string;
  category: string;
  type: 'all' | 'product' | 'equipment';
  status: 'all' | 'low' | 'normal' | 'out';
}

// Type for reporting view
type ReportType = 'category' | 'status' | 'type';

// Main App component
const App: React.FC = () => {
  // State for dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved === 'true' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('darkMode', (!darkMode).toString());
  };

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // State for modals
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'add' | 'edit'>('add');
  const [activeTab, setActiveTab] = useState<'inventory' | 'reports'>('inventory');
  const [reportType, setReportType] = useState<ReportType>('category');
  const [notification, setNotification] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category: '',
    quantity: 0,
    threshold: 10,
    price: 0,
    supplier: '',
    notes: '',
    type: 'product',
  });

  // Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const savedInventory = localStorage.getItem('inventory');
    return savedInventory ? JSON.parse(savedInventory) : [];
  });

  // Sort and filter state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    type: 'all',
    status: 'all',
  });

  // Save inventory to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  // Close modal with Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setModalOpen(false);
        setDeleteModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  // Available categories
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    inventory.forEach(item => uniqueCategories.add(item.category));
    return Array.from(uniqueCategories).sort();
  }, [inventory]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;

    // Parse to number if the input is a number type
    if (name === 'quantity' || name === 'threshold' || name === 'price') {
      parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
    }

    setFormData(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (actionType === 'add') {
        // Add new item
        const newItem: InventoryItem = {
          ...formData,
          id: crypto.randomUUID(),
          lastUpdated: new Date().toISOString(),
        };
        setInventory(prev => [...prev, newItem]);
        showNotification('Item added successfully!', 'success');
      } else {
        // Edit existing item
        setInventory(prev =>
          prev.map(item =>
            item.id === formData.id
              ? { ...formData, id: item.id, lastUpdated: new Date().toISOString() }
              : item
          )
        );
        showNotification('Item updated successfully!', 'success');
      }
      resetForm();
      setModalOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('An error occurred. Please try again.', 'error');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: 0,
      threshold: 10,
      price: 0,
      supplier: '',
      notes: '',
      type: 'product',
    });
    setActionType('add');
    setCurrentItem(null);
  };

  // Open add item modal
  const openAddModal = () => {
    resetForm();
    setActionType('add');
    setModalOpen(true);
  };

  // Open edit item modal
  const openEditModal = (id: string) => {
    const itemToEdit = inventory.find(item => item.id === id);
    if (itemToEdit) {
      setFormData({
        id: itemToEdit.id,
        name: itemToEdit.name,
        category: itemToEdit.category,
        quantity: itemToEdit.quantity,
        threshold: itemToEdit.threshold,
        price: itemToEdit.price,
        supplier: itemToEdit.supplier,
        notes: itemToEdit.notes || '',
        type: itemToEdit.type,
      });
      setActionType('edit');
      setCurrentItem(id);
      setModalOpen(true);
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (id: string) => {
    setCurrentItem(id);
    setDeleteModalOpen(true);
  };

  // Delete item
  const deleteItem = () => {
    try {
      if (currentItem) {
        setInventory(prev => prev.filter(item => item.id !== currentItem));
        setDeleteModalOpen(false);
        setCurrentItem(null);
        showNotification('Item deleted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showNotification('Failed to delete item. Please try again.', 'error');
    }
  };

  // Handle filter changes
  const handleFilterChange = (name: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: 'all',
      status: 'all',
    });
  };

  // Generate inventory report CSV
  const generateCSVReport = () => {
    try {
      // Header row
      const csvHeader = [
        'ID',
        'Name',
        'Category',
        'Type',
        'Quantity',
        'Threshold',
        'Price',
        'Supplier',
        'Last Updated',
        'Notes'
      ].join(',');

      // Data rows
      const csvRows = filteredInventory.map(item => {
        return [
          item.id,
          `"${item.name}"`,
          `"${item.category}"`,
          item.type,
          item.quantity,
          item.threshold,
          item.price.toFixed(2),
          `"${item.supplier}"`,
          new Date(item.lastUpdated).toLocaleString(),
          `"${item.notes || ''}"`
        ].join(',');
      });

      // Combine header and rows
      const csvContent = [csvHeader, ...csvRows].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `inventory-report-${new Date().toISOString().split('T')[0]}.csv`);
      link.click();
      URL.revokeObjectURL(url);

      showNotification('Report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating CSV:', error);
      showNotification('Failed to generate report. Please try again.', 'error');
    }
  };

  // Apply filters to inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      // Search filter
      const searchMatch = item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.supplier.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.notes?.toLowerCase().includes(filters.search.toLowerCase()) || false);

      // Category filter
      const categoryMatch = !filters.category || item.category === filters.category;

      // Type filter
      const typeMatch = filters.type === 'all' || item.type === filters.type;

      // Status filter
      let statusMatch = true;
      if (filters.status === 'low') {
        statusMatch = item.quantity > 0 && item.quantity <= item.threshold;
      } else if (filters.status === 'out') {
        statusMatch = item.quantity === 0;
      } else if (filters.status === 'normal') {
        statusMatch = item.quantity > item.threshold;
      }

      return searchMatch && categoryMatch && typeMatch && statusMatch;
    });
  }, [inventory, filters]);

  // Sort the filtered inventory
  const sortedInventory = useMemo(() => {
    return [...filteredInventory].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name' || sortField === 'category') {
        comparison = a[sortField].localeCompare(b[sortField]);
      } else {
        comparison = a[sortField] - b[sortField];
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredInventory, sortField, sortDirection]);

  // Generate report data based on report type
  const reportData = useMemo(() => {
    if (reportType === 'category') {
      const categoryData: { [key: string]: number } = {};
      inventory.forEach(item => {
        if (!categoryData[item.category]) {
          categoryData[item.category] = 0;
        }
        categoryData[item.category] += item.quantity;
      });

      return Object.entries(categoryData).map(([name, value]) => ({ name, value }));
    } else if (reportType === 'status') {
      let normal = 0;
      let low = 0;
      let out = 0;

      inventory.forEach(item => {
        if (item.quantity === 0) {
          out += 1;
        } else if (item.quantity <= item.threshold) {
          low += 1;
        } else {
          normal += 1;
        }
      });

      return [
        { name: 'Normal', value: normal },
        { name: 'Low Stock', value: low },
        { name: 'Out of Stock', value: out }
      ];
    } else { // type
      const productCount = inventory.filter(item => item.type === 'product').length;
      const equipmentCount = inventory.filter(item => item.type === 'equipment').length;

      return [
        { name: 'Products', value: productCount },
        { name: 'Equipment', value: equipmentCount }
      ];
    }
  }, [inventory, reportType]);

  // Summary statistics
  const inventorySummary = useMemo(() => {
    const totalItems = inventory.length;
    const totalQuantity = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity <= item.threshold).length;
    const outOfStockItems = inventory.filter(item => item.quantity === 0).length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      totalItems,
      totalQuantity,
      lowStockItems,
      outOfStockItems,
      totalValue
    };
  }, [inventory]);

  // Get status class for inventory item
  const getStatusClass = (item: InventoryItem): string => {
    if (item.quantity === 0) {
      return 'text-red-600 dark:text-red-400';
    } else if (item.quantity <= item.threshold) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-green-600 dark:text-green-400';
  };

  // Determine status label
  const getStatusLabel = (item: InventoryItem): string => {
    if (item.quantity === 0) {
      return 'Out of Stock';
    } else if (item.quantity <= item.threshold) {
      return 'Low Stock';
    }
    return 'In Stock';
  };

  // Get chart colors
  const getStatusColors = (status: string): string => {
    switch (status) {
      case 'Normal':
        return '#4ade80';
      case 'Low Stock':
        return '#facc15';
      case 'Out of Stock':
        return '#ef4444';
      default:
        return '#60a5fa';
    }
  };

  // Get category colors
  const getCategoryColor = (index: number): string => {
    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#a3e635',
      '#f43f5e', '#06b6d4', '#14b8a6', '#f59e0b', '#6366f1'
    ];
    return colors[index % colors.length];
  };

  // Get type colors
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'Products':
        return '#3b82f6';
      case 'Equipment':
        return '#8b5cf6';
      default:
        return '#60a5fa';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              <Package className="inline-block mr-2" size={28} />Inventory Management System
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container-fluid py-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm md:text-base ${activeTab === 'inventory' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package className="inline-block mr-2" size={18} />Inventory
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm md:text-base ${activeTab === 'reports' ? 'text-primary-600 border-b-2 border-primary-500' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart2 className="inline-block mr-2" size={18} />Reports
          </button>
        </div>

        {/* Notification */}
        {notification.show && (
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} ${styles.notification}`}>
            {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-auto text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="stat-card">
                <div className="stat-title">Total Items</div>
                <div className="stat-value">{inventorySummary.totalItems}</div>
                <div className="stat-desc flex items-center mt-2">
                  <Package className="mr-1" size={16} /> In inventory
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Quantity</div>
                <div className="stat-value">{inventorySummary.totalQuantity}</div>
                <div className="stat-desc flex items-center mt-2">
                  <ShoppingBag className="mr-1" size={16} /> Units in stock
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Low Stock Items</div>
                <div className="stat-value text-yellow-500">{inventorySummary.lowStockItems}</div>
                <div className="stat-desc flex items-center mt-2">
                  <AlertCircle className="mr-1" size={16} /> Need attention
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Total Value</div>
                <div className="stat-value">${inventorySummary.totalValue.toFixed(2)}</div>
                <div className="stat-desc flex items-center mt-2">
                  <Truck className="mr-1" size={16} /> Inventory worth
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="relative w-full sm:w-64 md:w-72">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input w-full pl-10 input-responsive"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={openAddModal}
                  className="btn btn-primary flex-center gap-2"
                >
                  <Plus size={18} /> Add Item
                </button>
                <button
                  onClick={generateCSVReport}
                  className="btn bg-green-600 text-white hover:bg-green-700 flex-center gap-2"
                  title="Download Inventory Report"
                >
                  <Download size={18} /> Export
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center">
                  <Filter size={18} className="mr-2 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm font-medium">Filters:</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 w-full mt-2">
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input-responsive"
                    aria-label="Filter by category"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value as 'all' | 'product' | 'equipment')}
                    className="input-responsive"
                    aria-label="Filter by type"
                  >
                    <option value="all">All Types</option>
                    <option value="product">Products</option>
                    <option value="equipment">Equipment</option>
                  </select>

                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value as 'all' | 'low' | 'normal' | 'out')}
                    className="input-responsive"
                    aria-label="Filter by status"
                  >
                    <option value="all">All Status</option>
                    <option value="normal">In Stock</option>
                    <option value="low">Low Stock</option>
                    <option value="out">Out of Stock</option>
                  </select>

                  <button 
                    onClick={resetFilters}
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 flex-center gap-2"
                    aria-label="Reset filters"
                  >
                    <X size={16} /> Reset Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
              {sortedInventory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full table">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('name')}
                          >
                            <span>Name</span>
                            {sortField === 'name' && (
                              sortDirection === 'asc' ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('category')}
                          >
                            <span>Category</span>
                            {sortField === 'category' && (
                              sortDirection === 'asc' ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('quantity')}
                          >
                            <span>Quantity</span>
                            {sortField === 'quantity' && (
                              sortDirection === 'asc' ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          <button
                            className="flex items-center space-x-1"
                            onClick={() => handleSort('price')}
                          >
                            <span>Price</span>
                            {sortField === 'price' && (
                              sortDirection === 'asc' ? (
                                <ArrowUp size={14} />
                              ) : (
                                <ArrowDown size={14} />
                              )
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Last Updated
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                      {sortedInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {item.category}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            <span className="capitalize">{item.type}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(item)}`}>
                              {getStatusLabel(item)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                            {new Date(item.lastUpdated).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => openEditModal(item.id)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                aria-label={`Edit ${item.name}`}
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                aria-label={`Delete ${item.name}`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No items found</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {inventory.length === 0 ? "Get started by adding your first inventory item." : "No items match your filters."}
                  </p>
                  {inventory.length === 0 && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="btn btn-primary flex-center mx-auto gap-2"
                      >
                        <Plus size={18} /> Add New Item
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <FileText className="mr-2" size={20} /> Inventory Reports
                </h2>
                <div className="flex items-center gap-3">
                  <label htmlFor="report-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Report Type:
                  </label>
                  <select
                    id="report-type"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="input-responsive w-auto"
                  >
                    <option value="category">By Category</option>
                    <option value="status">By Status</option>
                    <option value="type">By Type</option>
                  </select>
                  <button
                    onClick={generateCSVReport}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex-center gap-2"
                  >
                    <Download size={18} /> Export CSV
                  </button>
                </div>
              </div>
            </div>
            
            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat-card">
                <div className="stat-title">Total Items</div>
                <div className="stat-value">{inventorySummary.totalItems}</div>
                <div className="stat-desc">In inventory</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Out of Stock Items</div>
                <div className="stat-value text-red-500">{inventorySummary.outOfStockItems}</div>
                <div className="stat-desc">Need reordering</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Inventory Value</div>
                <div className="stat-value">${inventorySummary.totalValue.toFixed(2)}</div>
                <div className="stat-desc">Total worth</div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {reportType === 'category' ? 'Inventory by Category' : 
                 reportType === 'status' ? 'Inventory by Status' : 'Inventory by Type'}
              </h3>
              
              <div className="h-80 w-full">
                {reportType === 'category' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70} 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Quantity" isAnimationActive={true}>
                        {reportData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={reportType === 'status' ? getStatusColors(entry.name) : getTypeColor(entry.name)} 
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Critical Items</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Items that need attention (low stock or out of stock)</p>
              </div>
              {inventory.filter(item => item.quantity === 0 || item.quantity <= item.threshold).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full table">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-slate-700">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Threshold</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
                      {inventory
                        .filter(item => item.quantity === 0 || item.quantity <= item.threshold)
                        .map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {item.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {item.category}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {item.threshold}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(item)}`}>
                                {getStatusLabel(item)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => openEditModal(item.id)}
                                className="btn btn-sm btn-primary"
                              >
                                Update Stock
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Check className="mx-auto h-12 w-12 text-green-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">All items are well stocked</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    No items are currently below their threshold levels.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Item Modal */}
      {modalOpen && (
        <div 
          className="modal-backdrop" 
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="modal-content max-w-3xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {actionType === 'add' ? 'Add New Item' : 'Edit Item'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label required">Item Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category" className="form-label required">Category</label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input"
                    required
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>

                <div className="form-group">
                  <label htmlFor="type" className="form-label required">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input"
                    required
                  >
                    <option value="product">Product</option>
                    <option value="equipment">Equipment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity" className="form-label required">Quantity</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="threshold" className="form-label required">Low Stock Threshold</label>
                  <input
                    id="threshold"
                    name="threshold"
                    type="number"
                    min="0"
                    value={formData.threshold}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price" className="form-label required">Price ($)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="supplier" className="form-label required">Supplier</label>
                  <input
                    id="supplier"
                    name="supplier"
                    type="text"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div className="form-group md:col-span-2">
                  <label htmlFor="notes" className="form-label">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input h-24"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {actionType === 'add' ? 'Add Item' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && currentItem && (
        <div 
          className="modal-backdrop" 
          onClick={() => setDeleteModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div 
            className="modal-content max-w-md" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="delete-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteItem}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm theme-transition py-4 mt-auto">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;