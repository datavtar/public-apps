import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  ArrowDown,
  ArrowUp,
  Download,
  Upload,
  X,
  ChartBar,
  Warehouse,
  Package,
  Moon,
  Sun,
  Truck,
  Tag
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

interface Inventory {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location: string;
  reorderLevel: number;
  lastUpdated: string;
  supplierName: string;
  cost: number;
}

interface InventoryFilter {
  name: string;
  category: string;
  location: string;
}

interface CategoryData {
  name: string;
  value: number;
}

interface LocationData {
  name: string;
  value: number;
}

const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Inventory state
  const [inventories, setInventories] = useState<Inventory[]>(() => {
    const savedInventories = localStorage.getItem('inventories');
    return savedInventories ? JSON.parse(savedInventories) : [];
  });
  
  // UI states
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  
  // Form states
  const [currentInventory, setCurrentInventory] = useState<Inventory>({
    id: '',
    name: '',
    category: '',
    quantity: 0,
    unit: '',
    location: '',
    reorderLevel: 0,
    lastUpdated: '',
    supplierName: '',
    cost: 0
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<InventoryFilter>({
    name: '',
    category: '',
    location: ''
  });
  
  // Sorting states
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Inventory | null;
    direction: 'ascending' | 'descending' | null;
  }>({ key: null, direction: null });

  // Error states
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Save inventories to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('inventories', JSON.stringify(inventories));
  }, [inventories]);

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

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddModalOpen(false);
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
        setIsFilterModalOpen(false);
        setIsDashboardOpen(false);
        setIsImportModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Function to generate dashboard data
  const generateDashboardData = useCallback(() => {
    // Group by category
    const categoryData: CategoryData[] = [];
    const categoryMap = new Map<string, number>();
    
    inventories.forEach(item => {
      const currentValue = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, currentValue + item.quantity);
    });
    
    categoryMap.forEach((value, name) => {
      categoryData.push({ name, value });
    });
    
    // Group by location
    const locationData: LocationData[] = [];
    const locationMap = new Map<string, number>();
    
    inventories.forEach(item => {
      const currentValue = locationMap.get(item.location) || 0;
      locationMap.set(item.location, currentValue + item.quantity);
    });
    
    locationMap.forEach((value, name) => {
      locationData.push({ name, value });
    });

    return { categoryData, locationData };
  }, [inventories]);

  // Get unique categories and locations for filters
  const getUniqueCategories = useCallback(() => {
    const categories = new Set<string>();
    inventories.forEach(inv => categories.add(inv.category));
    return Array.from(categories);
  }, [inventories]);

  const getUniqueLocations = useCallback(() => {
    const locations = new Set<string>();
    inventories.forEach(inv => locations.add(inv.location));
    return Array.from(locations);
  }, [inventories]);

  // Sorting function
  const requestSort = (key: keyof Inventory) => {
    let direction: 'ascending' | 'descending' | null = 'ascending';
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'ascending') {
        direction = 'descending';
      } else if (sortConfig.direction === 'descending') {
        direction = null;
      }
    }
    setSortConfig({ key, direction });
  };

  // Applied sorting and filtering
  const filteredInventories = inventories
    .filter(inv => {
      const nameMatch = inv.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = !filter.category || inv.category === filter.category;
      const locationMatch = !filter.location || inv.location === filter.location;
      return nameMatch && categoryMatch && locationMatch;
    })
    .sort((a, b) => {
      if (!sortConfig.key || !sortConfig.direction) return 0;

      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortConfig.direction === 'ascending') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      } else {
        // Handle numbers
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        if (sortConfig.direction === 'ascending') {
          return aNum - bNum;
        } else {
          return bNum - aNum;
        }
      }
    });

  // Reset current inventory
  const resetCurrentInventory = () => {
    setCurrentInventory({
      id: '',
      name: '',
      category: '',
      quantity: 0,
      unit: '',
      location: '',
      reorderLevel: 0,
      lastUpdated: new Date().toISOString().split('T')[0],
      supplierName: '',
      cost: 0
    });
    setErrors({});
  };

  // Validation function
  const validateInventory = (inv: Inventory): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!inv.name.trim()) newErrors.name = 'Name is required';
    if (!inv.category.trim()) newErrors.category = 'Category is required';
    if (inv.quantity < 0) newErrors.quantity = 'Quantity cannot be negative';
    if (!inv.unit.trim()) newErrors.unit = 'Unit is required';
    if (!inv.location.trim()) newErrors.location = 'Location is required';
    if (inv.reorderLevel < 0) newErrors.reorderLevel = 'Reorder level cannot be negative';
    if (inv.cost < 0) newErrors.cost = 'Cost cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const numericTypes = ['number'];
    
    if (numericTypes.includes(type)) {
      setCurrentInventory(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setCurrentInventory(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Modal handlers
  const openAddModal = () => {
    resetCurrentInventory();
    setIsAddModalOpen(true);
  };

  const openEditModal = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (inventory: Inventory) => {
    setCurrentInventory(inventory);
    setIsDeleteModalOpen(true);
  };

  // CRUD operations
  const addInventory = () => {
    if (!validateInventory(currentInventory)) return;
    
    const newInventory: Inventory = {
      ...currentInventory,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setInventories(prev => [...prev, newInventory]);
    setIsAddModalOpen(false);
    resetCurrentInventory();
  };

  const updateInventory = () => {
    if (!validateInventory(currentInventory)) return;
    
    const updatedInventory = {
      ...currentInventory,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    setInventories(prev =>
      prev.map(inv => (inv.id === currentInventory.id ? updatedInventory : inv))
    );
    
    setIsEditModalOpen(false);
    resetCurrentInventory();
  };

  const deleteInventory = () => {
    setInventories(prev => prev.filter(inv => inv.id !== currentInventory.id));
    setIsDeleteModalOpen(false);
    resetCurrentInventory();
  };

  // Filter handlers
  const applyFilter = () => {
    setIsFilterModalOpen(false);
  };

  const resetFilter = () => {
    setFilter({
      name: '',
      category: '',
      location: ''
    });
    setIsFilterModalOpen(false);
  };

  // Export/Import functions
  const exportToCSV = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Location', 'Reorder Level', 'Last Updated', 'Supplier', 'Cost'];
    
    const rows = inventories.map(inv => [
      inv.name,
      inv.category,
      inv.quantity.toString(),
      inv.unit,
      inv.location,
      inv.reorderLevel.toString(),
      inv.lastUpdated,
      inv.supplierName,
      inv.cost.toString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory-export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplate = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Location', 'Reorder Level', 'Supplier', 'Cost'];
    const csvContent = headers.join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'inventory-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        
        if (lines.length < 2) {
          alert('File is empty or invalid');
          return;
        }
        
        const headers = lines[0].split(',');
        const importedInventories: Inventory[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',');
          const inventory: Inventory = {
            id: crypto.randomUUID(),
            name: values[0] || '',
            category: values[1] || '',
            quantity: parseInt(values[2]) || 0,
            unit: values[3] || '',
            location: values[4] || '',
            reorderLevel: parseInt(values[5]) || 0,
            lastUpdated: new Date().toISOString().split('T')[0],
            supplierName: values[6] || '',
            cost: parseFloat(values[7]) || 0
          };
          
          importedInventories.push(inventory);
        }
        
        if (importedInventories.length > 0) {
          setInventories(prev => [...prev, ...importedInventories]);
          setIsImportModalOpen(false);
          alert(`Successfully imported ${importedInventories.length} inventory items`);
        } else {
          alert('No valid inventory items found in the file');
        }
      } catch (error) {
        console.error('Error importing file:', error);
        alert('Error importing file. Please check the file format.');
      }
    };
    
    reader.readAsText(file);
  };

  // Dashboard data
  const { categoryData, locationData } = generateDashboardData();

  // Get low stock items
  const lowStockItems = inventories.filter(inv => inv.quantity <= inv.reorderLevel);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-fluid py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Warehouse className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            <h1 className="text-xl font-bold">Inventory Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDashboardOpen(true)}
              className="btn-sm btn-primary flex items-center gap-2"
              aria-label="View Dashboard"
            >
              <ChartBar size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="theme-toggle"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
              <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between mb-6">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              className="input pr-10"
              placeholder="Search inventories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search inventories"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="btn btn-secondary flex items-center gap-2"
              aria-label="Filter inventory"
            >
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button
              onClick={openAddModal}
              className="btn btn-primary flex items-center gap-2"
              aria-label="Add new inventory"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </button>
            <div className="dropdown relative">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                aria-label="Import/Export inventory"
              >
                <Upload size={16} />
                <span className="hidden sm:inline">Import/Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="card overflow-hidden">
          <div className="table-container overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="table-header px-4 py-3">
                    <button
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => requestSort('name')}
                      aria-label="Sort by name"
                    >
                      Name
                      {sortConfig.key === 'name' && (
                        <span>
                          {sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : 
                          sortConfig.direction === 'descending' ? <ArrowDown size={14} /> : null}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="table-header px-4 py-3">
                    <button
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => requestSort('category')}
                      aria-label="Sort by category"
                    >
                      Category
                      {sortConfig.key === 'category' && (
                        <span>
                          {sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : 
                          sortConfig.direction === 'descending' ? <ArrowDown size={14} /> : null}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="table-header px-4 py-3">
                    <button
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => requestSort('quantity')}
                      aria-label="Sort by quantity"
                    >
                      Quantity
                      {sortConfig.key === 'quantity' && (
                        <span>
                          {sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : 
                          sortConfig.direction === 'descending' ? <ArrowDown size={14} /> : null}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="table-header px-4 py-3">Unit</th>
                  <th className="table-header px-4 py-3">Location</th>
                  <th className="table-header px-4 py-3">Last Updated</th>
                  <th className="table-header px-4 py-3">Status</th>
                  <th className="table-header px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInventories.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                      No inventory items found. Add some items to get started.
                    </td>
                  </tr>
                ) : (
                  filteredInventories.map((inventory) => (
                    <tr key={inventory.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 theme-transition">
                      <td className="table-cell px-4 py-3 font-medium">{inventory.name}</td>
                      <td className="table-cell px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {inventory.category}
                        </span>
                      </td>
                      <td className="table-cell px-4 py-3">{inventory.quantity}</td>
                      <td className="table-cell px-4 py-3">{inventory.unit}</td>
                      <td className="table-cell px-4 py-3">{inventory.location}</td>
                      <td className="table-cell px-4 py-3">{inventory.lastUpdated}</td>
                      <td className="table-cell px-4 py-3">
                        {inventory.quantity <= inventory.reorderLevel ? (
                          <span className="badge badge-error">Low Stock</span>
                        ) : (
                          <span className="badge badge-success">In Stock</span>
                        )}
                      </td>
                      <td className="table-cell px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(inventory)}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 theme-transition"
                            aria-label="Edit inventory"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(inventory)}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 theme-transition"
                            aria-label="Delete inventory"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Inventory Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="add-inventory-title">
            <div className="modal-header">
              <h2 id="add-inventory-title" className="text-xl font-bold">Add Inventory Item</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); addInventory(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    value={currentInventory.name}
                    onChange={handleInputChange}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {errors.name && <p id="name-error" className="form-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="category" className="form-label">Category</label>
                  <input
                    id="category"
                    type="text"
                    name="category"
                    className={`input ${errors.category ? 'border-red-500' : ''}`}
                    value={currentInventory.category}
                    onChange={handleInputChange}
                    aria-invalid={errors.category ? 'true' : 'false'}
                    aria-describedby={errors.category ? 'category-error' : undefined}
                  />
                  {errors.category && <p id="category-error" className="form-error">{errors.category}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">Quantity</label>
                  <input
                    id="quantity"
                    type="number"
                    name="quantity"
                    className={`input ${errors.quantity ? 'border-red-500' : ''}`}
                    value={currentInventory.quantity}
                    onChange={handleInputChange}
                    aria-invalid={errors.quantity ? 'true' : 'false'}
                    aria-describedby={errors.quantity ? 'quantity-error' : undefined}
                  />
                  {errors.quantity && <p id="quantity-error" className="form-error">{errors.quantity}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="unit" className="form-label">Unit</label>
                  <input
                    id="unit"
                    type="text"
                    name="unit"
                    className={`input ${errors.unit ? 'border-red-500' : ''}`}
                    value={currentInventory.unit}
                    onChange={handleInputChange}
                    aria-invalid={errors.unit ? 'true' : 'false'}
                    aria-describedby={errors.unit ? 'unit-error' : undefined}
                  />
                  {errors.unit && <p id="unit-error" className="form-error">{errors.unit}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="location" className="form-label">Location</label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    className={`input ${errors.location ? 'border-red-500' : ''}`}
                    value={currentInventory.location}
                    onChange={handleInputChange}
                    aria-invalid={errors.location ? 'true' : 'false'}
                    aria-describedby={errors.location ? 'location-error' : undefined}
                  />
                  {errors.location && <p id="location-error" className="form-error">{errors.location}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="reorderLevel" className="form-label">Reorder Level</label>
                  <input
                    id="reorderLevel"
                    type="number"
                    name="reorderLevel"
                    className={`input ${errors.reorderLevel ? 'border-red-500' : ''}`}
                    value={currentInventory.reorderLevel}
                    onChange={handleInputChange}
                    aria-invalid={errors.reorderLevel ? 'true' : 'false'}
                    aria-describedby={errors.reorderLevel ? 'reorderLevel-error' : undefined}
                  />
                  {errors.reorderLevel && <p id="reorderLevel-error" className="form-error">{errors.reorderLevel}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="supplierName" className="form-label">Supplier Name</label>
                  <input
                    id="supplierName"
                    type="text"
                    name="supplierName"
                    className="input"
                    value={currentInventory.supplierName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cost" className="form-label">Cost</label>
                  <input
                    id="cost"
                    type="number"
                    name="cost"
                    className={`input ${errors.cost ? 'border-red-500' : ''}`}
                    value={currentInventory.cost}
                    onChange={handleInputChange}
                    step="0.01"
                    aria-invalid={errors.cost ? 'true' : 'false'}
                    aria-describedby={errors.cost ? 'cost-error' : undefined}
                  />
                  {errors.cost && <p id="cost-error" className="form-error">{errors.cost}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {isEditModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="edit-inventory-title">
            <div className="modal-header">
              <h2 id="edit-inventory-title" className="text-xl font-bold">Edit Inventory Item</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateInventory(); }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="form-group">
                  <label htmlFor="edit-name" className="form-label">Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    name="name"
                    className={`input ${errors.name ? 'border-red-500' : ''}`}
                    value={currentInventory.name}
                    onChange={handleInputChange}
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'edit-name-error' : undefined}
                  />
                  {errors.name && <p id="edit-name-error" className="form-error">{errors.name}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-category" className="form-label">Category</label>
                  <input
                    id="edit-category"
                    type="text"
                    name="category"
                    className={`input ${errors.category ? 'border-red-500' : ''}`}
                    value={currentInventory.category}
                    onChange={handleInputChange}
                    aria-invalid={errors.category ? 'true' : 'false'}
                    aria-describedby={errors.category ? 'edit-category-error' : undefined}
                  />
                  {errors.category && <p id="edit-category-error" className="form-error">{errors.category}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-quantity" className="form-label">Quantity</label>
                  <input
                    id="edit-quantity"
                    type="number"
                    name="quantity"
                    className={`input ${errors.quantity ? 'border-red-500' : ''}`}
                    value={currentInventory.quantity}
                    onChange={handleInputChange}
                    aria-invalid={errors.quantity ? 'true' : 'false'}
                    aria-describedby={errors.quantity ? 'edit-quantity-error' : undefined}
                  />
                  {errors.quantity && <p id="edit-quantity-error" className="form-error">{errors.quantity}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-unit" className="form-label">Unit</label>
                  <input
                    id="edit-unit"
                    type="text"
                    name="unit"
                    className={`input ${errors.unit ? 'border-red-500' : ''}`}
                    value={currentInventory.unit}
                    onChange={handleInputChange}
                    aria-invalid={errors.unit ? 'true' : 'false'}
                    aria-describedby={errors.unit ? 'edit-unit-error' : undefined}
                  />
                  {errors.unit && <p id="edit-unit-error" className="form-error">{errors.unit}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-location" className="form-label">Location</label>
                  <input
                    id="edit-location"
                    type="text"
                    name="location"
                    className={`input ${errors.location ? 'border-red-500' : ''}`}
                    value={currentInventory.location}
                    onChange={handleInputChange}
                    aria-invalid={errors.location ? 'true' : 'false'}
                    aria-describedby={errors.location ? 'edit-location-error' : undefined}
                  />
                  {errors.location && <p id="edit-location-error" className="form-error">{errors.location}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-reorderLevel" className="form-label">Reorder Level</label>
                  <input
                    id="edit-reorderLevel"
                    type="number"
                    name="reorderLevel"
                    className={`input ${errors.reorderLevel ? 'border-red-500' : ''}`}
                    value={currentInventory.reorderLevel}
                    onChange={handleInputChange}
                    aria-invalid={errors.reorderLevel ? 'true' : 'false'}
                    aria-describedby={errors.reorderLevel ? 'edit-reorderLevel-error' : undefined}
                  />
                  {errors.reorderLevel && <p id="edit-reorderLevel-error" className="form-error">{errors.reorderLevel}</p>}
                </div>
                <div className="form-group">
                  <label htmlFor="edit-supplierName" className="form-label">Supplier Name</label>
                  <input
                    id="edit-supplierName"
                    type="text"
                    name="supplierName"
                    className="input"
                    value={currentInventory.supplierName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-cost" className="form-label">Cost</label>
                  <input
                    id="edit-cost"
                    type="number"
                    name="cost"
                    className={`input ${errors.cost ? 'border-red-500' : ''}`}
                    value={currentInventory.cost}
                    onChange={handleInputChange}
                    step="0.01"
                    aria-invalid={errors.cost ? 'true' : 'false'}
                    aria-describedby={errors.cost ? 'edit-cost-error' : undefined}
                  />
                  {errors.cost && <p id="edit-cost-error" className="form-error">{errors.cost}</p>}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content max-w-sm" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="delete-inventory-title">
            <div className="modal-header">
              <h2 id="delete-inventory-title" className="text-xl font-bold">Confirm Deletion</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4">
              <p>Are you sure you want to delete <strong>{currentInventory.name}</strong>? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={deleteInventory}
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsFilterModalOpen(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="filter-inventory-title">
            <div className="modal-header">
              <h2 id="filter-inventory-title" className="text-xl font-bold">Filter Inventory</h2>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div className="form-group">
                <label htmlFor="filter-category" className="form-label">Category</label>
                <select
                  id="filter-category"
                  className="input"
                  value={filter.category}
                  onChange={(e) => setFilter(prev => ({ ...prev, category: e.target.value }))}>
                  <option value="">All Categories</option>
                  {getUniqueCategories().map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="filter-location" className="form-label">Location</label>
                <select
                  id="filter-location"
                  className="input"
                  value={filter.location}
                  onChange={(e) => setFilter(prev => ({ ...prev, location: e.target.value }))}>
                  <option value="">All Locations</option>
                  {getUniqueLocations().map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={resetFilter}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={applyFilter}
                className="btn btn-primary"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Modal */}
      {isImportModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsImportModalOpen(false)}>
          <div className="modal-content max-w-md" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="import-export-title">
            <div className="modal-header">
              <h2 id="import-export-title" className="text-xl font-bold">Import/Export Inventory</h2>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Import Inventory</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Upload a CSV file with inventory data. Please ensure it follows the required format.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={downloadTemplate}
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 flex items-center gap-2"
                  >
                    <Download size={16} />
                    <span>Download Template</span>
                  </button>
                  <label className="btn btn-primary flex items-center gap-2 cursor-pointer">
                    <Upload size={16} />
                    <span>Upload CSV</span>
                    <input
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleImportFile}
                    />
                  </label>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-medium mb-2">Export Inventory</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Export your inventory data as a CSV file.
                </p>
                <button
                  onClick={exportToCSV}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Download size={16} />
                  <span>Export as CSV</span>
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Modal */}
      {isDashboardOpen && (
        <div className="modal-backdrop" onClick={() => setIsDashboardOpen(false)}>
          <div className="modal-content max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()} role="dialog" aria-labelledby="dashboard-title">
            <div className="modal-header">
              <h2 id="dashboard-title" className="text-xl font-bold">Inventory Dashboard</h2>
              <button
                onClick={() => setIsDashboardOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="stat-card">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <div className="stat-title">Total Items</div>
                  </div>
                  <div className="stat-value">{inventories.length}</div>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div className="stat-title">Categories</div>
                  </div>
                  <div className="stat-value">{getUniqueCategories().length}</div>
                </div>
                
                <div className="stat-card">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div className="stat-title">Low Stock Items</div>
                  </div>
                  <div className="stat-value">{lowStockItems.length}</div>
                </div>
              </div>
              
              {/* Charts section */}
              <div className="space-y-8">
                <div className="card p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4">Stock by Category</h3>
                  {categoryData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={categoryData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                            color: isDarkMode ? '#e2e8f0' : '#1f2937'
                          }} />
                          <Legend />
                          <Bar dataKey="value" name="Quantity" fill="#60a5fa" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex-center text-gray-500">No data available</div>
                  )}
                </div>

                <div className="card p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4">Stock by Location</h3>
                  {locationData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={locationData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip contentStyle={{ 
                            backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                            borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                            color: isDarkMode ? '#e2e8f0' : '#1f2937'
                          }} />
                          <Legend />
                          <Bar dataKey="value" name="Quantity" fill="#34d399" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-80 flex-center text-gray-500">No data available</div>
                  )}
                </div>
                
                {lowStockItems.length > 0 && (
                  <div className="card p-4 md:p-6">
                    <h3 className="text-lg font-semibold mb-4">Low Stock Alert</h3>
                    <div className="table-container overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th className="table-header px-4 py-3">Name</th>
                            <th className="table-header px-4 py-3">Category</th>
                            <th className="table-header px-4 py-3">Quantity</th>
                            <th className="table-header px-4 py-3">Reorder Level</th>
                            <th className="table-header px-4 py-3">Location</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {lowStockItems.map(item => (
                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 theme-transition">
                              <td className="table-cell px-4 py-3 font-medium">{item.name}</td>
                              <td className="table-cell px-4 py-3">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                  {item.category}
                                </span>
                              </td>
                              <td className="table-cell px-4 py-3">{item.quantity}</td>
                              <td className="table-cell px-4 py-3">{item.reorderLevel}</td>
                              <td className="table-cell px-4 py-3">{item.location}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="py-4 text-center border-t border-gray-200 dark:border-gray-700 mt-auto">
              <button
                type="button"
                onClick={() => setIsDashboardOpen(false)}
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Close Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md py-6 mt-auto">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
