import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { useForm, SubmitHandler } from 'react-hook-form';
import {
  Truck,
  Package,
  ArrowUpDown,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  FileText,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Home,
  Box,
  Moon,
  Sun,
  UserCircle
} from 'lucide-react';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // TypeScript interfaces and types
  interface Inventory {
    id: string;
    sku: string;
    name: string;
    category: string;
    quantity: number;
    location: string;
    lastUpdated: Date;
    status: 'in-stock' | 'low-stock' | 'out-of-stock';
  }

  interface Movement {
    id: string;
    inventoryId: string;
    type: 'inbound' | 'outbound' | 'transfer';
    quantity: number;
    source: string;
    destination: string;
    date: Date;
    processedBy: string;
    notes?: string;
  }

  interface FormValues {
    sku: string;
    name: string;
    category: string;
    quantity: number;
    location: string;
  }

  interface MovementFormValues {
    inventoryId: string;
    type: 'inbound' | 'outbound' | 'transfer';
    quantity: number;
    source: string;
    destination: string;
    notes?: string;
  }

  // State management
  const [inventory, setInventory] = useState<Inventory[]>([
    {
      id: '1',
      sku: 'PROD001',
      name: 'Wireless Headphones',
      category: 'Electronics',
      quantity: 150,
      location: 'Aisle A, Shelf 3',
      lastUpdated: new Date(2023, 5, 15),
      status: 'in-stock'
    },
    {
      id: '2',
      sku: 'PROD002',
      name: 'Cotton T-Shirt',
      category: 'Apparel',
      quantity: 25,
      location: 'Aisle B, Shelf 1',
      lastUpdated: new Date(2023, 5, 10),
      status: 'low-stock'
    },
    {
      id: '3',
      sku: 'PROD003',
      name: 'Protein Powder',
      category: 'Nutrition',
      quantity: 0,
      location: 'Aisle C, Shelf 4',
      lastUpdated: new Date(2023, 5, 1),
      status: 'out-of-stock'
    },
    {
      id: '4',
      sku: 'PROD004',
      name: 'Mechanical Keyboard',
      category: 'Electronics',
      quantity: 75,
      location: 'Aisle A, Shelf 5',
      lastUpdated: new Date(2023, 5, 20),
      status: 'in-stock'
    },
    {
      id: '5',
      sku: 'PROD005',
      name: 'Running Shoes',
      category: 'Footwear',
      quantity: 12,
      location: 'Aisle D, Shelf 2',
      lastUpdated: new Date(2023, 5, 18),
      status: 'low-stock'
    }
  ]);

  const [movements, setMovements] = useState<Movement[]>([
    {
      id: '1',
      inventoryId: '1',
      type: 'inbound',
      quantity: 50,
      source: 'Supplier XYZ',
      destination: 'Aisle A, Shelf 3',
      date: new Date(2023, 5, 15),
      processedBy: 'John Smith',
      notes: 'Regular monthly order'
    },
    {
      id: '2',
      inventoryId: '2',
      type: 'outbound',
      quantity: 10,
      source: 'Aisle B, Shelf 1',
      destination: 'Customer Order #12345',
      date: new Date(2023, 5, 10),
      processedBy: 'Jane Doe',
      notes: 'Express shipping'
    },
    {
      id: '3',
      inventoryId: '4',
      type: 'transfer',
      quantity: 25,
      source: 'Aisle A, Shelf 4',
      destination: 'Aisle A, Shelf 5',
      date: new Date(2023, 5, 20),
      processedBy: 'Robert Johnson',
      notes: 'Reorganizing inventory'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Inventory; direction: 'ascending' | 'descending' } | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMovementFormOpen, setIsMovementFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inventory' | 'movements' | 'dashboard'>('inventory');
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (localStorage.getItem('darkMode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Form handling with react-hook-form
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormValues>();
  const movementForm = useForm<MovementFormValues>();
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Categories derived from inventory data
  const categories = [...new Set(inventory.map(item => item.category))];

  // Effect hooks
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);
  
  useEffect(() => {
    if (editingId) {
      const itemToEdit = inventory.find(item => item.id === editingId);
      if (itemToEdit) {
        setValue('sku', itemToEdit.sku);
        setValue('name', itemToEdit.name);
        setValue('category', itemToEdit.category);
        setValue('quantity', itemToEdit.quantity);
        setValue('location', itemToEdit.location);
      }
    }
  }, [editingId, inventory, setValue]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Sort inventory
  const sortedInventory = React.useMemo(() => {
    let sortableItems = [...filteredInventory];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredInventory, sortConfig]);

  // Sort function
  const requestSort = (key: keyof Inventory) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filter inventory movements for a specific inventory item
  const getInventoryMovements = (inventoryId: string) => {
    return movements.filter(movement => movement.inventoryId === inventoryId);
  };

  // Form submission handlers
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    if (editingId) {
      // Edit existing inventory
      setInventory(prev => prev.map(item => {
        if (item.id === editingId) {
          const status = determineStatus(data.quantity);
          return {
            ...item,
            ...data,
            status,
            lastUpdated: new Date()
          };
        }
        return item;
      }));
      setNotification({message: 'Inventory updated successfully', type: 'success'});
    } else {
      // Add new inventory
      const status = determineStatus(data.quantity);
      const newId = (Math.max(...inventory.map(item => parseInt(item.id))) + 1).toString();
      setInventory(prev => [...prev, {
        id: newId,
        ...data,
        status,
        lastUpdated: new Date()
      }]);
      setNotification({message: 'New item added to inventory', type: 'success'});
    }
    closeForm();
  };

  const onMovementSubmit: SubmitHandler<MovementFormValues> = (data) => {
    const newId = (Math.max(...movements.map(item => parseInt(item.id))) + 1).toString();
    const newMovement: Movement = {
      id: newId,
      ...data,
      date: new Date(),
      processedBy: 'Current User', // In a real app, this would come from authentication
    };
    
    setMovements(prev => [...prev, newMovement]);
    
    // Update inventory quantity
    setInventory(prev => prev.map(item => {
      if (item.id === data.inventoryId) {
        let newQuantity = item.quantity;
        if (data.type === 'inbound') {
          newQuantity += data.quantity;
        } else if (data.type === 'outbound') {
          newQuantity -= data.quantity;
        }
        // For transfers, the quantity remains the same
        
        return {
          ...item,
          quantity: newQuantity,
          status: determineStatus(newQuantity),
          lastUpdated: new Date(),
          location: data.type === 'transfer' ? data.destination : item.location
        };
      }
      return item;
    }));
    
    setNotification({message: 'Inventory movement recorded', type: 'success'});
    closeMovementForm();
  };

  // Helper functions
  const determineStatus = (quantity: number): 'in-stock' | 'low-stock' | 'out-of-stock' => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= 30) return 'low-stock';
    return 'in-stock';
  };

  const openForm = (id?: string) => {
    if (id) setEditingId(id);
    else {
      reset({
        sku: '',
        name: '',
        category: '',
        quantity: 0,
        location: ''
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    reset();
  };

  const openMovementForm = (item: Inventory) => {
    setSelectedInventory(item);
    movementForm.reset({
      inventoryId: item.id,
      type: 'inbound',
      quantity: 1,
      source: '',
      destination: item.location,
      notes: ''
    });
    setIsMovementFormOpen(true);
  };

  const closeMovementForm = () => {
    setIsMovementFormOpen(false);
    setSelectedInventory(null);
    movementForm.reset();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
      setNotification({message: 'Item deleted from inventory', type: 'success'});
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'in-stock': return 'badge badge-success';
      case 'low-stock': return 'badge badge-warning';
      case 'out-of-stock': return 'badge badge-error';
      default: return 'badge';
    }
  };

  const getMovementTypeClass = (type: string) => {
    switch (type) {
      case 'inbound': return 'badge badge-success';
      case 'outbound': return 'badge badge-error';
      case 'transfer': return 'badge badge-info';
      default: return 'badge';
    }
  };

  // Dashboard calculations
  const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out-of-stock').length;
  const recentMovements = [...movements].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6">
        <div className="container-fluid mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center mb-4 sm:mb-0">
            <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">UK Warehouse Manager</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <div className="flex items-center">
              <UserCircle className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Warehouse Manager</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container-fluid mx-auto">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap border-b-2 ${activeTab === 'dashboard' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              role="tab"
              aria-selected={activeTab === 'dashboard'}
            >
              <BarChart3 className="h-5 w-5 mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap border-b-2 ${activeTab === 'inventory' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              role="tab"
              aria-selected={activeTab === 'inventory'}
            >
              <Box className="h-5 w-5 mr-2" />
              Inventory
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-4 py-3 font-medium text-sm flex items-center whitespace-nowrap border-b-2 ${activeTab === 'movements' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              role="tab"
              aria-selected={activeTab === 'movements'}
            >
              <Package className="h-5 w-5 mr-2" />
              Movements
            </button>
          </div>
        </div>
      </nav>

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 ${notification.type === 'success' ? 'alert alert-success' : 'alert alert-error'} shadow-lg fade-in`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-6 w-6" />
          ) : (
            <XCircle className="h-6 w-6" />
          )}
          <p>{notification.message}</p>
          <button 
            onClick={() => setNotification(null)} 
            className="ml-auto hover:text-gray-700 dark:hover:text-gray-300"
            aria-label="Close notification"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow px-4 py-6 sm:px-6 lg:px-8">
        <div className="container-fluid mx-auto">
          {/* Dashboard View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="stat-card">
                  <div className="stat-title">Total Items</div>
                  <div className="stat-value">{totalItems.toLocaleString()}</div>
                  <div className="stat-desc">{inventory.length} unique products</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Low Stock Items</div>
                  <div className="stat-value text-warning-500">{lowStockItems}</div>
                  <div className="stat-desc">Require attention</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Out of Stock Items</div>
                  <div className="stat-value text-error-500">{outOfStockItems}</div>
                  <div className="stat-desc">Need replenishment</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Movements</h3>
                  {recentMovements.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table">
                        <thead>
                          <tr>
                            <th className="table-header">Type</th>
                            <th className="table-header">Item</th>
                            <th className="table-header">Quantity</th>
                            <th className="table-header">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentMovements.map(movement => {
                            const item = inventory.find(i => i.id === movement.inventoryId);
                            return (
                              <tr key={movement.id}>
                                <td className="table-cell">
                                  <span className={getMovementTypeClass(movement.type)}>
                                    {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                                  </span>
                                </td>
                                <td className="table-cell">{item?.name || 'Unknown Item'}</td>
                                <td className="table-cell">{movement.quantity}</td>
                                <td className="table-cell">{format(movement.date, 'dd/MM/yyyy')}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No recent movements recorded.</p>
                  )}
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Inventory Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-success-500 h-2.5 rounded-full" 
                          style={{ width: `${inventory.filter(i => i.status === 'in-stock').length / inventory.length * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {inventory.filter(i => i.status === 'in-stock').length} In Stock
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-warning-500 h-2.5 rounded-full" 
                          style={{ width: `${inventory.filter(i => i.status === 'low-stock').length / inventory.length * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {inventory.filter(i => i.status === 'low-stock').length} Low Stock
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-error-500 h-2.5 rounded-full" 
                          style={{ width: `${inventory.filter(i => i.status === 'out-of-stock').length / inventory.length * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {inventory.filter(i => i.status === 'out-of-stock').length} Out of Stock
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Categories Distribution</h4>
                    <div className="space-y-3">
                      {categories.map(category => (
                        <div key={category} className="flex items-center">
                          <div className="w-1/3 text-sm text-gray-600 dark:text-gray-400">{category}</div>
                          <div className="w-2/3 flex items-center">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                              <div 
                                className="bg-primary-500 h-2.5 rounded-full" 
                                style={{ width: `${inventory.filter(i => i.category === category).length / inventory.length * 100}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                              {inventory.filter(i => i.category === category).length}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Inventory View */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search inventory"
                    />
                  </div>
                  <select
                    className="input"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Filter by category"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    className="btn btn-primary flex items-center justify-center"
                    onClick={() => openForm()}
                    aria-label="Add new item"
                  >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('sku')}>
                          <div className="flex items-center">
                            SKU
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('name')}>
                          <div className="flex items-center">
                            Name
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('category')}>
                          <div className="flex items-center">
                            Category
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('quantity')}>
                          <div className="flex items-center">
                            Quantity
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('location')}>
                          <div className="flex items-center">
                            Location
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('status')}>
                          <div className="flex items-center">
                            Status
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => requestSort('lastUpdated')}>
                          <div className="flex items-center">
                            Last Updated
                            <ArrowUpDown className="h-4 w-4 ml-1" />
                          </div>
                        </th>
                        <th className="table-header">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedInventory.length > 0 ? (
                        sortedInventory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="table-cell">{item.sku}</td>
                            <td className="table-cell font-medium">{item.name}</td>
                            <td className="table-cell">{item.category}</td>
                            <td className="table-cell">{item.quantity}</td>
                            <td className="table-cell">{item.location}</td>
                            <td className="table-cell">
                              <span className={getStatusBadgeClass(item.status)}>
                                {item.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                              </span>
                            </td>
                            <td className="table-cell">{format(item.lastUpdated, 'dd/MM/yyyy')}</td>
                            <td className="table-cell">
                              <div className="flex space-x-2">
                                <button
                                  className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                                  onClick={() => openForm(item.id)}
                                  aria-label={`Edit ${item.name}`}
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-500 hover:text-error-600 dark:text-gray-400 dark:hover:text-error-400"
                                  onClick={() => handleDelete(item.id)}
                                  aria-label={`Delete ${item.name}`}
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-gray-500 hover:text-info-600 dark:text-gray-400 dark:hover:text-info-400"
                                  onClick={() => openMovementForm(item)}
                                  aria-label={`Record movement for ${item.name}`}
                                >
                                  <Package className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="table-cell text-center py-8">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <Box className="h-12 w-12 mb-3 opacity-30" />
                              <p className="text-lg font-medium">No inventory items found</p>
                              <p className="text-sm">Add items to your inventory or adjust your search filters.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Movements View */}
          {activeTab === 'movements' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Movements</h2>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Type</th>
                        <th className="table-header">Item</th>
                        <th className="table-header">Quantity</th>
                        <th className="table-header">Source</th>
                        <th className="table-header">Destination</th>
                        <th className="table-header">Processed By</th>
                        <th className="table-header">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements.length > 0 ? (
                        [...movements]
                          .sort((a, b) => b.date.getTime() - a.date.getTime())
                          .map((movement) => {
                            const item = inventory.find(i => i.id === movement.inventoryId);
                            return (
                              <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="table-cell">{format(movement.date, 'dd/MM/yyyy')}</td>
                                <td className="table-cell">
                                  <span className={getMovementTypeClass(movement.type)}>
                                    {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                                  </span>
                                </td>
                                <td className="table-cell font-medium">{item?.name || 'Unknown Item'}</td>
                                <td className="table-cell">{movement.quantity}</td>
                                <td className="table-cell">{movement.source}</td>
                                <td className="table-cell">{movement.destination}</td>
                                <td className="table-cell">{movement.processedBy}</td>
                                <td className="table-cell">
                                  {movement.notes ? (
                                    <div className="relative group">
                                      <FileText className="h-5 w-5 text-gray-400 cursor-pointer" />
                                      <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                        {movement.notes}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={8} className="table-cell text-center py-8">
                            <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                              <Package className="h-12 w-12 mb-3 opacity-30" />
                              <p className="text-lg font-medium">No movements recorded</p>
                              <p className="text-sm">Track inventory movements by recording inbound, outbound, or transfer transactions.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 px-6 mt-auto">
        <div className="container-fluid mx-auto">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright &copy; 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Inventory Form Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={closeForm}>
          <div 
            ref={modalRef} 
            className="modal-content max-w-lg" 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingId ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button 
                onClick={closeForm} 
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label htmlFor="sku" className="form-label">SKU</label>
                  <input
                    id="sku"
                    type="text"
                    className="input"
                    {...register('sku', { required: 'SKU is required' })}
                  />
                  {errors.sku && <p className="form-error">{errors.sku.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    id="name"
                    type="text"
                    className="input"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="form-error">{errors.name.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <input
                    id="category"
                    type="text"
                    className="input"
                    list="categories"
                    {...register('category', { required: 'Category is required' })}
                  />
                  <datalist id="categories">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  {errors.category && <p className="form-error">{errors.category.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    className="input"
                    {...register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 0, message: 'Quantity must be 0 or greater' },
                      valueAsNumber: true
                    })}
                  />
                  {errors.quantity && <p className="form-error">{errors.quantity.message}</p>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Storage Location</label>
                  <input
                    id="location"
                    type="text"
                    className="input"
                    {...register('location', { required: 'Storage location is required' })}
                  />
                  {errors.location && <p className="form-error">{errors.location.message}</p>}
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={closeForm}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Form Modal */}
      {isMovementFormOpen && selectedInventory && (
        <div className="modal-backdrop" onClick={closeMovementForm}>
          <div 
            ref={modalRef} 
            className="modal-content max-w-lg" 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Record Movement for {selectedInventory.name}
              </h3>
              <button 
                onClick={closeMovementForm} 
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={movementForm.handleSubmit(onMovementSubmit)}>
              <div className="mt-4 space-y-4">
                <input
                  type="hidden"
                  {...movementForm.register('inventoryId')}
                />
                
                <div className="form-group">
                  <label htmlFor="type" className="form-label">Movement Type</label>
                  <select
                    id="type"
                    className="input"
                    {...movementForm.register('type', { required: true })}
                  >
                    <option value="inbound">Inbound (Receiving)</option>
                    <option value="outbound">Outbound (Shipping)</option>
                    <option value="transfer">Internal Transfer</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    className="input"
                    {...movementForm.register('quantity', { 
                      required: 'Quantity is required',
                      min: { value: 1, message: 'Quantity must be at least 1' },
                      max: { 
                        value: movementForm.watch('type') === 'outbound' ? selectedInventory.quantity : 9999, 
                        message: `Cannot ship more than available quantity (${selectedInventory.quantity})` 
                      },
                      valueAsNumber: true
                    })}
                  />
                  {movementForm.formState.errors.quantity && (
                    <p className="form-error">{movementForm.formState.errors.quantity.message}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="source" className="form-label">
                    {movementForm.watch('type') === 'inbound' ? 'Source (Supplier)' : 
                     movementForm.watch('type') === 'outbound' ? 'Source Location' : 'Source Location'}
                  </label>
                  <input
                    id="source"
                    type="text"
                    className="input"
                    defaultValue={movementForm.watch('type') !== 'inbound' ? selectedInventory.location : ''}
                    {...movementForm.register('source', { required: 'Source is required' })}
                  />
                  {movementForm.formState.errors.source && (
                    <p className="form-error">{movementForm.formState.errors.source.message}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="destination" className="form-label">
                    {movementForm.watch('type') === 'inbound' ? 'Destination Location' : 
                     movementForm.watch('type') === 'outbound' ? 'Destination (Customer)' : 'Destination Location'}
                  </label>
                  <input
                    id="destination"
                    type="text"
                    className="input"
                    defaultValue={movementForm.watch('type') === 'inbound' ? selectedInventory.location : ''}
                    {...movementForm.register('destination', { required: 'Destination is required' })}
                  />
                  {movementForm.formState.errors.destination && (
                    <p className="form-error">{movementForm.formState.errors.destination.message}</p>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes" className="form-label">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    className="input min-h-[80px]"
                    {...movementForm.register('notes')}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={closeMovementForm}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={movementForm.watch('type') === 'outbound' && selectedInventory.quantity === 0}
                >
                  Record Movement
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