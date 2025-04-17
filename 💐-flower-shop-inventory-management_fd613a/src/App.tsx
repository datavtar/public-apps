import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Plus, Edit, Trash2, Search, Sun, Moon, ArrowUp, ArrowDown, Filter, X, Sprout, Download, Upload, Save } from 'lucide-react';
import styles from './styles/styles.module.css';

// Types
interface FlowerItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  imageUrl?: string;
  description?: string;
  lastUpdated: string;
}

type SortKey = keyof Omit<FlowerItem, 'imageUrl' | 'description' | 'lastUpdated'> | 'lastUpdated';

interface SortConfig {
  key: SortKey;
  direction: 'ascending' | 'descending';
}

// Utility Functions
const generateId = (): string => `flower_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const formatDate = (date: Date): string => date.toISOString();

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

// Initial Data (if localStorage is empty)
const initialFlowers: FlowerItem[] = [
  {
    id: generateId(),
    name: 'Rose', 
    category: 'Classic', 
    stock: 50, 
    price: 2.50, 
    imageUrl: 'https://via.placeholder.com/100x100/FF7F7F/FFFFFF?text=Rose',
    description: 'Classic red rose, symbol of love.', 
    lastUpdated: formatDate(new Date())
  },
  {
    id: generateId(),
    name: 'Tulip', 
    category: 'Seasonal', 
    stock: 30, 
    price: 1.80, 
    imageUrl: 'https://via.placeholder.com/100x100/FFD700/FFFFFF?text=Tulip',
    description: 'Colorful spring tulips.',
    lastUpdated: formatDate(new Date(Date.now() - 86400000)) // Yesterday
  },
  {
    id: generateId(),
    name: 'Orchid', 
    category: 'Exotic', 
    stock: 15, 
    price: 15.00, 
    imageUrl: 'https://via.placeholder.com/100x100/DA70D6/FFFFFF?text=Orchid',
    description: 'Elegant and long-lasting orchid.',
    lastUpdated: formatDate(new Date(Date.now() - 172800000)) // 2 days ago
  },
  {
    id: generateId(),
    name: 'Sunflower', 
    category: 'Seasonal', 
    stock: 25, 
    price: 3.00, 
    imageUrl: 'https://via.placeholder.com/100x100/FFC107/FFFFFF?text=Sunflower',
    description: 'Bright and cheerful sunflower.',
    lastUpdated: formatDate(new Date())
  },
];

// Main App Component
const App: React.FC = () => {
  const [flowers, setFlowers] = useState<FlowerItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FlowerItem>>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>({ key: 'name', direction: 'ascending' });
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Load data from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const savedFlowers = localStorage.getItem('flowerInventory');
      if (savedFlowers) {
        setFlowers(JSON.parse(savedFlowers));
      } else {
        // Seed initial data if nothing in storage
        setFlowers(initialFlowers);
        localStorage.setItem('flowerInventory', JSON.stringify(initialFlowers));
      }
    } catch (error) {
      console.error('Failed to load flowers from localStorage:', error);
      setFlowers(initialFlowers); // Fallback to initial data on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage whenever flowers change
  useEffect(() => {
    // Don't save during initial load
    if (!isLoading) {
        try {
            localStorage.setItem('flowerInventory', JSON.stringify(flowers));
        } catch (error) {
            console.error('Failed to save flowers to localStorage:', error);
            // Optionally notify the user that data couldn't be saved
        }
    }
  }, [flowers, isLoading]);

  // Apply dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Handle Esc key to close modal
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    if (isModalOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isModalOpen]);

  // Filter and Sort Logic
  const filteredAndSortedFlowers = useMemo(() => {
    let filtered = flowers.filter(flower =>
      flower.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flower.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flower.description && flower.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (filterCategory) {
      filtered = filtered.filter(flower => flower.category === filterCategory);
    }

    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Type-safe comparison
        let comparison = 0;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          comparison = aValue - bValue;
        } else if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else {
           // Handle potential null/undefined or mixed types gracefully
          const strA = String(aValue ?? '');
          const strB = String(bValue ?? '');
          comparison = strA.localeCompare(strB);
        }

        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [flowers, searchTerm, filterCategory, sortConfig]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const uniqueCategories = new Set(flowers.map(f => f.category));
    return ['', ...Array.from(uniqueCategories)]; // Add 'All Categories'
  }, [flowers]);

  // --- Form Handling --- 
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;

    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
      if (isNaN(processedValue as number) || processedValue < 0) {
           processedValue = 0; // Prevent negative or NaN values
      }
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    // Clear error for this field on change
    if (formErrors[name]) {
        setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
      const errors: Record<string, string> = {};
      if (!formData.name?.trim()) errors.name = 'Flower name is required.';
      if (!formData.category?.trim()) errors.category = 'Category is required.';
      if (formData.stock === undefined || formData.stock === null || formData.stock < 0) errors.stock = 'Stock must be a non-negative number.';
      if (formData.price === undefined || formData.price === null || formData.price <= 0) errors.price = 'Price must be a positive number.';
      // Basic URL validation (optional)
      if (formData.imageUrl && !/^https?:\/\//.test(formData.imageUrl)) {
          errors.imageUrl = 'Please enter a valid URL (starting with http:// or https://).';
      }
      setFormErrors(errors);
      return Object.keys(errors).length === 0;
  }

  const openModal = (item: FlowerItem | null = null) => {
    setFormErrors({}); // Clear previous errors
    if (item) {
      setIsEditing(true);
      setCurrentItemId(item.id);
      setFormData({ ...item }); // Pre-fill form for editing
    } else {
      setIsEditing(false);
      setCurrentItemId(null);
      setFormData({ // Reset form for adding
          name: '',
          category: '',
          stock: 0,
          price: 0,
          imageUrl: '',
          description: ''
      }); 
    }
    document.body.classList.add('modal-open');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    document.body.classList.remove('modal-open');
    setIsModalOpen(false);
    setIsEditing(false);
    setCurrentItemId(null);
    setFormData({});
    setFormErrors({});
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const now = formatDate(new Date());

    if (isEditing && currentItemId) {
      // Update existing flower
      setFlowers(prevFlowers =>
        prevFlowers.map(flower =>
          flower.id === currentItemId
            ? { ...flower, ...formData, lastUpdated: now } as FlowerItem // Ensure type safety
            : flower
        )
      );
    } else {
      // Add new flower
      const newFlower: FlowerItem = {
        id: generateId(),
        name: formData.name || 'Unnamed Flower',
        category: formData.category || 'Uncategorized',
        stock: formData.stock ?? 0, 
        price: formData.price ?? 0,
        imageUrl: formData.imageUrl || '',
        description: formData.description || '',
        lastUpdated: now,
      };
      setFlowers(prevFlowers => [newFlower, ...prevFlowers]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this flower?')) {
      setFlowers(prevFlowers => prevFlowers.filter(flower => flower.id !== id));
    }
  };

  // --- Sorting --- 
  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUp size={14} className="opacity-30" />; // Default icon or hidden
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />;
  };

  // --- Theme Toggle --- 
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  // --- Data Export/Import --- 
  const exportData = () => {
      try {
          const dataStr = JSON.stringify(flowers, null, 2); // Pretty print JSON
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          
          const exportFileDefaultName = 'flower_inventory_export.json';
          
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();
          linkElement.remove();
      } catch (error) {
          console.error('Error exporting data:', error);
          alert('Failed to export data. See console for details.');
      }
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          try {
              const text = e.target?.result;
              if (typeof text !== 'string') {
                  throw new Error('Invalid file content');
              }
              const importedFlowers: FlowerItem[] = JSON.parse(text);
              
              // Basic validation (check if it's an array and items have required keys)
              if (!Array.isArray(importedFlowers) || importedFlowers.some(item => !item.id || !item.name || !item.category || item.stock === undefined || item.price === undefined )) {
                   throw new Error('Invalid file format or missing required fields.');
              }
              
              if (window.confirm(`Importing ${importedFlowers.length} items. This will replace your current inventory. Continue?`)) {
                setFlowers(importedFlowers);
                // Manually trigger save to localStorage since isLoading might be false
                localStorage.setItem('flowerInventory', JSON.stringify(importedFlowers));
                alert('Inventory imported successfully!');
              }

          } catch (error) {
              console.error('Error importing data:', error);
              alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
          } finally {
             // Reset file input to allow importing the same file again if needed
             event.target.value = ''; 
          }
      };
      reader.onerror = (error) => {
          console.error('Error reading file:', error);
          alert('Failed to read file.');
          event.target.value = '';
      };
      reader.readAsText(file);
  };

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const stockByCategory: { [key: string]: number } = {};
    filteredAndSortedFlowers.forEach(flower => {
      stockByCategory[flower.category] = (stockByCategory[flower.category] || 0) + flower.stock;
    });
    return Object.entries(stockByCategory).map(([name, stock]) => ({ name, stock }));
  }, [filteredAndSortedFlowers]);


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
        <div className="space-y-4 p-8">
          <div className="skeleton-text w-48 h-8 mx-auto"></div>
          <div className="skeleton-text w-full h-10"></div>
          <div className="skeleton-text w-full h-40"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen theme-transition-all ${isDarkMode ? 'dark' : ''} bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 flex flex-col`}>
      {/* Header */} 
      <header className="bg-white dark:bg-slate-800 shadow-md p-4 sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
             <Sprout className="text-primary-600 dark:text-primary-400" size={28} />
             <h1 className="text-2xl font-semibold">Flower Shop Inventory</h1>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            {/* Theme Toggle */} 
            <div className="flex items-center gap-2">
              <Sun size={18} className={`text-yellow-500 ${!isDarkMode ? 'opacity-100' : 'opacity-50'}`} />
              <button
                onClick={toggleTheme}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                role="switch"
                aria-checked={isDarkMode}
                name="theme-toggle"
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              <Moon size={18} className={`text-blue-400 ${isDarkMode ? 'opacity-100' : 'opacity-50'}`} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */} 
      <main className="container-wide mx-auto p-4 md:p-6 lg:p-8 flex-grow">
        {/* Controls: Search, Filter, Add */} 
        <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/3">
            <input
              type="text"
              placeholder="Search by name, category, description..."
              className="input input-responsive pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search inventory"
              name="search"
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-auto">
                  <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="input input-responsive appearance-none pr-8"
                      aria-label="Filter by category"
                      name="filter-category"
                  >
                      <option value="">All Categories</option>
                      {categories.slice(1).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                      ))}
                  </select>
                   <Filter size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
              </div>
              
              <button
                onClick={() => openModal()}
                className="btn btn-primary btn-responsive flex items-center justify-center gap-2 w-full sm:w-auto"
                aria-label="Add new flower"
                name="add-flower"
              >
                <Plus size={18} />
                <span>Add Flower</span>
              </button>
          </div>
        </div>
        
         {/* Data Import/Export Buttons */} 
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-start">
           <button
             onClick={exportData}
             className="btn bg-green-600 hover:bg-green-700 text-white btn-responsive flex items-center justify-center gap-2 w-full sm:w-auto"
             aria-label="Export inventory data to JSON file"
             name="export-data"
           >
             <Download size={18} />
             <span>Export Data</span>
           </button>
           <label 
             className="btn bg-blue-600 hover:bg-blue-700 text-white btn-responsive flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
             aria-label="Import inventory data from JSON file"
             htmlFor="import-file-input"
             role="button"
             tabIndex={0}
           >
             <Upload size={18} />
             <span>Import Data</span>
             <input 
                 type="file"
                 id="import-file-input" 
                 className="hidden" 
                 accept=".json,application/json" 
                 onChange={importData}
                 aria-hidden="true" // Hide from accessibility tree, label handles it
             />
           </label>
        </div>

        {/* Stock Overview Chart */} 
        {chartData.length > 0 && (
          <div className="mb-8 card card-responsive">
             <h2 className="text-lg font-semibold mb-4">Stock Overview by Category</h2>
             <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
                  <XAxis dataKey="name" className="text-xs fill-current text-gray-600 dark:text-slate-400" />
                  <YAxis allowDecimals={false} className="text-xs fill-current text-gray-600 dark:text-slate-400" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? 'rgb(30 41 59 / 0.9)' : 'rgba(255, 255, 255, 0.9)',
                      borderColor: isDarkMode ? 'rgb(51 65 85)' : 'rgb(229 231 235)',
                      color: isDarkMode ? '#e2e8f0' : '#1f2937',
                      borderRadius: '0.375rem', 
                      boxShadow: 'var(--shadow-md)',
                    }} 
                    cursor={{ fill: isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(203, 213, 225, 0.3)' }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '0.875rem' }}/>
                  <Bar dataKey="stock" fill="var(--color-primary, #4f46e5)" name="Stock Count" className={`fill-primary-600 dark:fill-primary-500 ${styles.rechartsBar}`} />
                </BarChart>
             </ResponsiveContainer>
          </div>
        )}

        {/* Flower Inventory Table */} 
        <div className="table-container theme-transition-all">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-cell px-4 py-3 w-16 sm:w-24">Image</th>
                <th className="table-cell px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('name')} role="columnheader" aria-sort={sortConfig?.key === 'name' ? sortConfig.direction : 'none'} >
                  <div className="flex items-center gap-1">Name {getSortIcon('name')}</div>
                </th>
                <th className="table-cell px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600" onClick={() => requestSort('category')} role="columnheader" aria-sort={sortConfig?.key === 'category' ? sortConfig.direction : 'none'}>
                   <div className="flex items-center gap-1">Category {getSortIcon('category')}</div>
                </th>
                <th className="table-cell px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-right" onClick={() => requestSort('stock')} role="columnheader" aria-sort={sortConfig?.key === 'stock' ? sortConfig.direction : 'none'}>
                   <div className="flex items-center justify-end gap-1">Stock {getSortIcon('stock')}</div>
                </th>
                <th className="table-cell px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 text-right" onClick={() => requestSort('price')} role="columnheader" aria-sort={sortConfig?.key === 'price' ? sortConfig.direction : 'none'}>
                    <div className="flex items-center justify-end gap-1">Price {getSortIcon('price')}</div>
                </th>
                <th className="table-cell px-4 py-3 hidden lg:table-cell">Description</th>
                <th className="table-cell px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600 hidden md:table-cell" onClick={() => requestSort('lastUpdated')} role="columnheader" aria-sort={sortConfig?.key === 'lastUpdated' ? sortConfig.direction : 'none'}>
                    <div className="flex items-center gap-1">Last Updated {getSortIcon('lastUpdated')}</div>
                </th>
                <th className="table-cell px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-all">
              {filteredAndSortedFlowers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-10 text-gray-500 dark:text-slate-400">
                    No flowers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredAndSortedFlowers.map((flower) => (
                  <tr key={flower.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 theme-transition-bg">
                    <td className="table-cell px-4 py-3 align-middle">
                      <img 
                        src={flower.imageUrl || 'https://via.placeholder.com/64x64/CCCCCC/FFFFFF?text=No+Image'}
                        alt={flower.name}
                        className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-md shadow-sm"
                        loading="lazy"
                      />
                    </td>
                    <td className="table-cell px-4 py-3 align-middle font-medium">{flower.name}</td>
                    <td className="table-cell px-4 py-3 align-middle">
                      <span className="badge badge-info capitalize">{flower.category}</span>
                    </td>
                    <td className="table-cell px-4 py-3 align-middle text-right">{flower.stock}</td>
                    <td className="table-cell px-4 py-3 align-middle text-right">{formatCurrency(flower.price)}</td>
                    <td className="table-cell px-4 py-3 align-middle text-sm text-gray-600 dark:text-slate-400 hidden lg:table-cell max-w-xs truncate" title={flower.description}>{flower.description}</td>
                    <td className="table-cell px-4 py-3 align-middle text-sm text-gray-500 dark:text-slate-400 hidden md:table-cell">{new Date(flower.lastUpdated).toLocaleDateString()}</td>
                    <td className="table-cell px-4 py-3 align-middle text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => openModal(flower)}
                          className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 rounded-full"
                          aria-label={`Edit ${flower.name}`}
                          name={`edit-${flower.id}`}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(flower.id)}
                          className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 rounded-full"
                          aria-label={`Delete ${flower.name}`}
                          name={`delete-${flower.id}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Footer */} 
      <footer className="text-center py-4 mt-8 text-sm text-gray-500 dark:text-slate-400 border-t border-gray-200 dark:border-slate-700 theme-transition-colors">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Add/Edit Modal */} 
      {isModalOpen && (
        <div
          className="modal-backdrop fade-in theme-transition-bg"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="modal-content slide-in theme-transition-all max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <div className="modal-header">
              <h3 id="modal-title" className="text-xl font-semibold">{isEditing ? 'Edit Flower' : 'Add New Flower'}</h3>
              <button 
                onClick={closeModal} 
                className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-500"
                aria-label="Close modal"
                name="close-modal"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Flower Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className={`input ${formErrors.name ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  aria-describedby={formErrors.name ? 'name-error' : undefined}
                  aria-invalid={!!formErrors.name}
                />
                 {formErrors.name && <p id="name-error" className="form-error">{formErrors.name}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="category">Category</label>
                <input
                  id="category"
                  name="category"
                  type="text"
                  className={`input ${formErrors.category ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                  value={formData.category || ''}
                  onChange={handleInputChange}
                  required
                  aria-describedby={formErrors.category ? 'category-error' : undefined}
                  aria-invalid={!!formErrors.category}
                />
                {formErrors.category && <p id="category-error" className="form-error">{formErrors.category}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="stock">Stock Quantity</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    className={`input ${formErrors.stock ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                    value={formData.stock ?? ''}
                    onChange={handleInputChange}
                    required
                    aria-describedby={formErrors.stock ? 'stock-error' : undefined}
                    aria-invalid={!!formErrors.stock}
                  />
                   {formErrors.stock && <p id="stock-error" className="form-error">{formErrors.stock}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="price">Price (USD)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    className={`input ${formErrors.price ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                    value={formData.price ?? ''}
                    onChange={handleInputChange}
                    required
                    aria-describedby={formErrors.price ? 'price-error' : undefined}
                    aria-invalid={!!formErrors.price}
                  />
                   {formErrors.price && <p id="price-error" className="form-error">{formErrors.price}</p>}
                </div>
              </div>
               <div className="form-group">
                <label className="form-label" htmlFor="imageUrl">Image URL (Optional)</label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className={`input ${formErrors.imageUrl ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                  value={formData.imageUrl || ''}
                  onChange={handleInputChange}
                  aria-describedby={formErrors.imageUrl ? 'imageUrl-error' : undefined}
                  aria-invalid={!!formErrors.imageUrl}
                />
                {formErrors.imageUrl && <p id="imageUrl-error" className="form-error">{formErrors.imageUrl}</p>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="input border-gray-300 dark:border-slate-600"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 btn-responsive"
                  name="cancel-modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-responsive flex items-center justify-center gap-1"
                  name="save-flower"
                >
                  <Save size={18} />
                  {isEditing ? 'Save Changes' : 'Add Flower'}
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
