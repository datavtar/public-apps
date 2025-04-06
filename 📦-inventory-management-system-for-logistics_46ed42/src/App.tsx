import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShoppingCart, Package, Truck, Warehouse, User, Plus, Search, Edit, Trash2, Filter, ArrowUpDown, Menu, X, Download, Upload, Eye, Clock, AlertTriangle } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define Types
interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  supplier: string;
  lastUpdated: string;
  minStockLevel: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  date: string;
  notes: string;
}

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: keyof InventoryItem | '';
  direction: SortDirection;
}

interface FilterConfig {
  category: string;
  status: string;
  location: string;
  searchTerm: string;
}

interface ChartData {
  name: string;
  value: number;
}

const App: React.FC = () => {
  // State Management
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'suppliers' | 'transactions' | 'dashboard'>('dashboard');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    category: '',
    status: '',
    location: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [modalType, setModalType] = useState<'inventory' | 'supplier' | 'transaction'>('inventory');
  const [showLowStockAlert, setShowLowStockAlert] = useState<boolean>(false);
  const [csvImportError, setCsvImportError] = useState<string>('');

  // Constants
  const CATEGORIES = ['Raw Materials', 'Finished Goods', 'Packaging', 'Spare Parts', 'Office Supplies'];
  const LOCATIONS = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Production Floor', 'Distribution Center'];
  const UNITS = ['pcs', 'kg', 'liters', 'boxes', 'pallets'];
  
  // Load data from localStorage on initial render
  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    // Load inventory data
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
      setInventory(JSON.parse(savedInventory));
    } else {
      // Set sample data if none exists
      const sampleInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Cardboard Boxes',
          category: 'Packaging',
          quantity: 150,
          unit: 'pcs',
          price: 2.5,
          location: 'Warehouse A',
          supplier: 'BoxCo Supplies',
          lastUpdated: new Date().toISOString(),
          minStockLevel: 50,
          status: 'In Stock'
        },
        {
          id: '2',
          name: 'Plastic Containers',
          category: 'Packaging',
          quantity: 35,
          unit: 'boxes',
          price: 15.75,
          location: 'Warehouse B',
          supplier: 'PlastiPack Inc',
          lastUpdated: new Date().toISOString(),
          minStockLevel: 40,
          status: 'Low Stock'
        },
        {
          id: '3',
          name: 'Steel Bolts',
          category: 'Spare Parts',
          quantity: 0,
          unit: 'kg',
          price: 8.25,
          location: 'Warehouse C',
          supplier: 'MetalWorks Ltd',
          lastUpdated: new Date().toISOString(),
          minStockLevel: 20,
          status: 'Out of Stock'
        }
      ];
      setInventory(sampleInventory);
      localStorage.setItem('inventory', JSON.stringify(sampleInventory));
    }
    
    // Load suppliers data
    const savedSuppliers = localStorage.getItem('suppliers');
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      // Set sample data if none exists
      const sampleSuppliers: Supplier[] = [
        {
          id: '1',
          name: 'BoxCo Supplies',
          contact: '+1 (555) 123-4567',
          email: 'sales@boxco.com',
          address: '123 Packaging Rd, Boxville, CA 91234'
        },
        {
          id: '2',
          name: 'PlastiPack Inc',
          contact: '+1 (555) 987-6543',
          email: 'orders@plastipack.com',
          address: '456 Container Ave, Plasticity, NY 10001'
        },
        {
          id: '3',
          name: 'MetalWorks Ltd',
          contact: '+1 (555) 456-7890',
          email: 'info@metalworks.com',
          address: '789 Steel Blvd, Irontown, TX 75001'
        }
      ];
      setSuppliers(sampleSuppliers);
      localStorage.setItem('suppliers', JSON.stringify(sampleSuppliers));
    }
    
    // Load transactions data
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    } else {
      // Set sample data if none exists
      const sampleTransactions: Transaction[] = [
        {
          id: '1',
          itemId: '1',
          itemName: 'Cardboard Boxes',
          type: 'in',
          quantity: 50,
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          notes: 'Regular delivery'
        },
        {
          id: '2',
          itemId: '2',
          itemName: 'Plastic Containers',
          type: 'out',
          quantity: 15,
          date: new Date().toISOString(),
          notes: 'Shipping to client XYZ'
        }
      ];
      setTransactions(sampleTransactions);
      localStorage.setItem('transactions', JSON.stringify(sampleTransactions));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Check for low stock items on inventory change
  useEffect(() => {
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStockLevel && item.quantity > 0);
    const outOfStockItems = inventory.filter(item => item.quantity === 0);
    
    if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
      setShowLowStockAlert(true);
    } else {
      setShowLowStockAlert(false);
    }
  }, [inventory]);

  // Filter inventory based on criteria
  const filteredInventory = inventory.filter(item => {
    const matchesCategory = filterConfig.category ? item.category === filterConfig.category : true;
    const matchesStatus = filterConfig.status ? item.status === filterConfig.status : true;
    const matchesLocation = filterConfig.location ? item.location === filterConfig.location : true;
    const matchesSearch = filterConfig.searchTerm
      ? item.name.toLowerCase().includes(filterConfig.searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(filterConfig.searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesStatus && matchesLocation && matchesSearch;
  });

  // Sort inventory based on sort config
  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
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

  // Sort suppliers
  const sortedSuppliers = [...suppliers].sort((a, b) => a.name.localeCompare(b.name));

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Generate chart data for dashboard
  const generateCategoryData = (): ChartData[] => {
    const categoryMap = new Map<string, number>();
    
    inventory.forEach(item => {
      const currentValue = categoryMap.get(item.category) || 0;
      categoryMap.set(item.category, currentValue + item.quantity);
    });
    
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const generateLocationData = (): ChartData[] => {
    const locationMap = new Map<string, number>();
    
    inventory.forEach(item => {
      const currentValue = locationMap.get(item.location) || 0;
      locationMap.set(item.location, currentValue + item.quantity);
    });
    
    return Array.from(locationMap.entries()).map(([name, value]) => ({ name, value }));
  };

  const generateStatusData = (): ChartData[] => {
    const statusCount = {
      'In Stock': inventory.filter(item => item.status === 'In Stock').length,
      'Low Stock': inventory.filter(item => item.status === 'Low Stock').length,
      'Out of Stock': inventory.filter(item => item.status === 'Out of Stock').length
    };
    
    return Object.entries(statusCount).map(([name, value]) => ({ name, value }));
  };

  // Handler Functions
  const handleSortChange = (key: keyof InventoryItem) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilterConfig(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilterConfig({
      category: '',
      status: '',
      location: '',
      searchTerm: ''
    });
  };

  const openAddModal = (type: 'inventory' | 'supplier' | 'transaction') => {
    setModalType(type);
    setModalMode('add');
    
    if (type === 'inventory') {
      setCurrentItem(null);
    } else if (type === 'supplier') {
      setCurrentSupplier(null);
    } else {
      setCurrentTransaction(null);
    }
    
    setShowModal(true);
  };

  const openEditModal = (type: 'inventory' | 'supplier' | 'transaction', id: string) => {
    setModalType(type);
    setModalMode('edit');
    
    if (type === 'inventory') {
      const item = inventory.find(item => item.id === id);
      if (item) setCurrentItem({ ...item });
    } else if (type === 'supplier') {
      const supplier = suppliers.find(supplier => supplier.id === id);
      if (supplier) setCurrentSupplier({ ...supplier });
    } else {
      const transaction = transactions.find(transaction => transaction.id === id);
      if (transaction) setCurrentTransaction({ ...transaction });
    }
    
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentItem(null);
    setCurrentSupplier(null);
    setCurrentTransaction(null);
    setCsvImportError('');
  };

  const handleInventorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newItem: InventoryItem = {
      id: modalMode === 'add' ? Date.now().toString() : currentItem?.id || Date.now().toString(),
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string, 10),
      unit: formData.get('unit') as string,
      price: parseFloat(formData.get('price') as string),
      location: formData.get('location') as string,
      supplier: formData.get('supplier') as string,
      lastUpdated: new Date().toISOString(),
      minStockLevel: parseInt(formData.get('minStockLevel') as string, 10),
      status: 'In Stock' // Will be recalculated below
    };
    
    // Set status based on quantity and minStockLevel
    if (newItem.quantity <= 0) {
      newItem.status = 'Out of Stock';
    } else if (newItem.quantity <= newItem.minStockLevel) {
      newItem.status = 'Low Stock';
    } else {
      newItem.status = 'In Stock';
    }
    
    if (modalMode === 'add') {
      setInventory(prev => [...prev, newItem]);
      
      // Add as an incoming transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        itemId: newItem.id,
        itemName: newItem.name,
        type: 'in',
        quantity: newItem.quantity,
        date: new Date().toISOString(),
        notes: 'Initial inventory setup'
      };
      
      setTransactions(prev => [...prev, newTransaction]);
    } else {
      // If it's an edit, we need to know if quantity changed to log a transaction
      const oldItem = inventory.find(item => item.id === newItem.id);
      
      if (oldItem && oldItem.quantity !== newItem.quantity) {
        const quantityDifference = newItem.quantity - oldItem.quantity;
        const transactionType: 'in' | 'out' = quantityDifference > 0 ? 'in' : 'out';
        
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          itemId: newItem.id,
          itemName: newItem.name,
          type: transactionType,
          quantity: Math.abs(quantityDifference),
          date: new Date().toISOString(),
          notes: 'Inventory adjustment'
        };
        
        setTransactions(prev => [...prev, newTransaction]);
      }
      
      setInventory(prev => 
        prev.map(item => (item.id === newItem.id ? newItem : item))
      );
    }
    
    closeModal();
  };

  const handleSupplierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newSupplier: Supplier = {
      id: modalMode === 'add' ? Date.now().toString() : currentSupplier?.id || Date.now().toString(),
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string
    };
    
    if (modalMode === 'add') {
      setSuppliers(prev => [...prev, newSupplier]);
    } else {
      setSuppliers(prev => 
        prev.map(supplier => (supplier.id === newSupplier.id ? newSupplier : supplier))
      );
    }
    
    closeModal();
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const itemId = formData.get('itemId') as string;
    const type = formData.get('type') as 'in' | 'out';
    const quantity = parseInt(formData.get('quantity') as string, 10);
    
    // Find the selected item
    const item = inventory.find(item => item.id === itemId);
    
    if (!item) {
      alert('Selected item not found!');
      return;
    }
    
    const newTransaction: Transaction = {
      id: modalMode === 'add' ? Date.now().toString() : currentTransaction?.id || Date.now().toString(),
      itemId,
      itemName: item.name,
      type,
      quantity,
      date: new Date().toISOString(),
      notes: formData.get('notes') as string
    };
    
    // Update inventory quantity
    const newInventory = [...inventory];
    const itemIndex = newInventory.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      // Calculate the new quantity
      let newQuantity = newInventory[itemIndex].quantity;
      
      if (type === 'in') {
        newQuantity += quantity;
      } else if (type === 'out') {
        // Check if we have enough inventory
        if (newQuantity < quantity) {
          alert(`Not enough inventory! Current: ${newQuantity}, Requested: ${quantity}`);
          return;
        }
        newQuantity -= quantity;
      }
      
      // Update the inventory item
      newInventory[itemIndex] = {
        ...newInventory[itemIndex],
        quantity: newQuantity,
        lastUpdated: new Date().toISOString(),
        status: newQuantity <= 0 ? 'Out of Stock' : 
                newQuantity <= newInventory[itemIndex].minStockLevel ? 'Low Stock' : 'In Stock'
      };
      
      setInventory(newInventory);
    }
    
    if (modalMode === 'add') {
      setTransactions(prev => [...prev, newTransaction]);
    } else {
      // For edits, we need to revert the old transaction first, then apply the new one
      if (currentTransaction) {
        // This is simplified and might not handle all edge cases
        setTransactions(prev => 
          prev.map(transaction => (transaction.id === newTransaction.id ? newTransaction : transaction))
        );
      }
    }
    
    closeModal();
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(prev => prev.filter(item => item.id !== id));
      // Also remove related transactions
      setTransactions(prev => prev.filter(transaction => transaction.itemId !== id));
    }
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
    }
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      // Get the transaction first to know what to revert
      const transaction = transactions.find(t => t.id === id);
      
      if (transaction) {
        // Revert the inventory change
        const item = inventory.find(item => item.id === transaction.itemId);
        
        if (item) {
          let newQuantity = item.quantity;
          
          // If it was an incoming transaction, we remove the items
          // If it was an outgoing transaction, we add the items back
          if (transaction.type === 'in') {
            newQuantity -= transaction.quantity;
          } else {
            newQuantity += transaction.quantity;
          }
          
          // Update the item
          const updatedItem: InventoryItem = {
            ...item,
            quantity: newQuantity,
            lastUpdated: new Date().toISOString(),
            status: newQuantity <= 0 ? 'Out of Stock' : 
                    newQuantity <= item.minStockLevel ? 'Low Stock' : 'In Stock'
          };
          
          setInventory(prev =>
            prev.map(i => (i.id === item.id ? updatedItem : i))
          );
        }
      }
      
      // Remove the transaction
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // Export inventory as CSV
  const exportInventoryCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Price', 'Location', 'Supplier', 'Last Updated', 'Min Stock Level', 'Status'];
    const rows = inventory.map(item => [
      item.id,
      item.name,
      item.category,
      item.quantity,
      item.unit,
      item.price,
      item.location,
      item.supplier,
      new Date(item.lastUpdated).toLocaleString(),
      item.minStockLevel,
      item.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate an empty CSV template for import
  const downloadCSVTemplate = () => {
    const headers = ['Name', 'Category', 'Quantity', 'Unit', 'Price', 'Location', 'Supplier', 'Min Stock Level'];
    const csvContent = headers.join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import inventory from CSV
  const importInventoryCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        // Validate headers
        const requiredHeaders = ['Name', 'Category', 'Quantity', 'Unit', 'Price', 'Location', 'Supplier', 'Min Stock Level'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          setCsvImportError(`Missing required headers: ${missingHeaders.join(', ')}`);
          return;
        }
        
        // Parse the data
        const newItems: InventoryItem[] = [];
        const newTransactions: Transaction[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue; // Skip empty lines
          
          const values = lines[i].split(',');
          if (values.length !== headers.length) {
            setCsvImportError(`Line ${i + 1} has ${values.length} values, but ${headers.length} were expected.`);
            return;
          }
          
          // Create a map of header to value
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });
          
          // Create the new item
          const itemId = Date.now().toString() + i; // Ensure unique IDs
          const quantity = parseInt(rowData['Quantity'], 10);
          const minStockLevel = parseInt(rowData['Min Stock Level'], 10);
          
          let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
          if (quantity <= 0) {
            status = 'Out of Stock';
          } else if (quantity <= minStockLevel) {
            status = 'Low Stock';
          }
          
          const newItem: InventoryItem = {
            id: itemId,
            name: rowData['Name'],
            category: rowData['Category'],
            quantity,
            unit: rowData['Unit'],
            price: parseFloat(rowData['Price']),
            location: rowData['Location'],
            supplier: rowData['Supplier'],
            lastUpdated: new Date().toISOString(),
            minStockLevel,
            status
          };
          
          newItems.push(newItem);
          
          // Also create an initial transaction
          const newTransaction: Transaction = {
            id: Date.now().toString() + i,
            itemId,
            itemName: newItem.name,
            type: 'in',
            quantity,
            date: new Date().toISOString(),
            notes: 'Imported from CSV'
          };
          
          newTransactions.push(newTransaction);
        }
        
        // Update the state
        setInventory(prev => [...prev, ...newItems]);
        setTransactions(prev => [...prev, ...newTransactions]);
        closeModal();
        alert(`Successfully imported ${newItems.length} items.`);
      } catch (error) {
        console.error('Error importing CSV:', error);
        setCsvImportError('Failed to parse CSV file. Please check the format and try again.');
      }
    };
    
    reader.onerror = () => {
      setCsvImportError('Error reading the file. Please try again.');
    };
    
    reader.readAsText(file);
  };

  // Modal for handling keyboard events (Escape key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Warehouse className="mr-2" size={24} /> Logistics Inventory Manager
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
              
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <User size={16} />
                <span>Logistics Manager</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-800 shadow-md">
          <div className="px-4 py-2 space-y-1">
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <ShoppingCart size={18} className="mr-2" /> Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('inventory'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'inventory' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Package size={18} className="mr-2" /> Inventory
            </button>
            <button 
              onClick={() => { setActiveTab('suppliers'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'suppliers' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Truck size={18} className="mr-2" /> Suppliers
            </button>
            <button 
              onClick={() => { setActiveTab('transactions'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'transactions' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <ArrowUpDown size={18} className="mr-2" /> Transactions
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex">
        {/* Side Navigation (Desktop) */}
        <div className="hidden md:block w-64 bg-white dark:bg-slate-800 shadow-sm h-screen">
          <div className="p-4 space-y-2">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'dashboard' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <ShoppingCart size={18} className="mr-2" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'inventory' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Package size={18} className="mr-2" /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab('suppliers')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'suppliers' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <Truck size={18} className="mr-2" /> Suppliers
            </button>
            <button 
              onClick={() => setActiveTab('transactions')}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center ${activeTab === 'transactions' ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700'}`}
            >
              <ArrowUpDown size={18} className="mr-2" /> Transactions
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8">
          {/* Low Stock Alert */}
          {showLowStockAlert && (
            <div className="alert alert-warning mb-6 fade-in">
              <AlertTriangle size={20} />
              <div>
                <p className="font-medium">Attention Required</p>
                <p className="text-sm">Some items are running low or out of stock. Please check your inventory.</p>
              </div>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openAddModal('inventory')}
                    className="btn btn-primary flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add Item
                  </button>
                  <button 
                    onClick={() => openAddModal('transaction')}
                    className="btn bg-green-600 hover:bg-green-700 text-white flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> New Transaction
                  </button>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Total Items</div>
                  <div className="stat-value">{inventory.length}</div>
                  <div className="stat-desc">In your inventory</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Low Stock Items</div>
                  <div className="stat-value text-yellow-500">
                    {inventory.filter(item => item.status === 'Low Stock').length}
                  </div>
                  <div className="stat-desc">Need attention</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Out of Stock</div>
                  <div className="stat-value text-red-500">
                    {inventory.filter(item => item.status === 'Out of Stock').length}
                  </div>
                  <div className="stat-desc">Need reordering</div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-title">Recent Transactions</div>
                  <div className="stat-value">{transactions.length}</div>
                  <div className="stat-desc">In the system</div>
                </div>
              </div>
              
              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Inventory by Category</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateCategoryData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#4f46e5" name="Quantity" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-medium mb-4">Inventory Status</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={generateStatusData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#10b981" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              
              {/* Recent Transactions and Low Stock Items */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card overflow-hidden">
                  <h3 className="text-lg font-medium mb-4">Recent Transactions</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {sortedTransactions.slice(0, 5).map(transaction => (
                          <tr key={transaction.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{transaction.itemName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {transaction.type === 'in' ? 'IN' : 'OUT'}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{transaction.quantity}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                        {sortedTransactions.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">No transactions found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="card overflow-hidden">
                  <h3 className="text-lg font-medium mb-4">Low & Out of Stock Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {inventory.filter(item => item.status !== 'In Stock').map(item => (
                          <tr key={item.id}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.location}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{item.quantity} {item.unit}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {inventory.filter(item => item.status !== 'In Stock').length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">No low stock items</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Inventory */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={downloadCSVTemplate} className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center">
                    <Download size={16} className="mr-1" /> Template
                  </button>
                  <button onClick={() => setShowModal(true)} className="btn bg-teal-600 hover:bg-teal-700 text-white flex items-center">
                    <Upload size={16} className="mr-1" /> Import
                  </button>
                  <button onClick={exportInventoryCSV} className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center">
                    <Download size={16} className="mr-1" /> Export
                  </button>
                  <button onClick={() => openAddModal('inventory')} className="btn btn-primary flex items-center">
                    <Plus size={16} className="mr-1" /> Add Item
                  </button>
                </div>
              </div>
              
              {/* Search and Filter Section */}
              <div className="card p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
                  <div className="relative w-full md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="searchTerm"
                      value={filterConfig.searchTerm}
                      onChange={handleFilterChange}
                      placeholder="Search inventory..."
                      className="input pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
                    >
                      <Filter size={16} className="mr-1" /> Filters
                    </button>
                    
                    {(filterConfig.category || filterConfig.status || filterConfig.location) && (
                      <button
                        onClick={resetFilters}
                        className="btn bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                
                {showFilters && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="form-group mb-0">
                      <label htmlFor="category" className="form-label mb-1">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={filterConfig.category}
                        onChange={handleFilterChange}
                        className="input"
                      >
                        <option value="">All Categories</option>
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group mb-0">
                      <label htmlFor="status" className="form-label mb-1">Status</label>
                      <select
                        id="status"
                        name="status"
                        value={filterConfig.status}
                        onChange={handleFilterChange}
                        className="input"
                      >
                        <option value="">All Statuses</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>
                    </div>
                    
                    <div className="form-group mb-0">
                      <label htmlFor="location" className="form-label mb-1">Location</label>
                      <select
                        id="location"
                        name="location"
                        value={filterConfig.location}
                        onChange={handleFilterChange}
                        className="input"
                      >
                        <option value="">All Locations</option>
                        {LOCATIONS.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Inventory Table */}
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th 
                        className="table-header px-4 py-3 cursor-pointer"
                        onClick={() => handleSortChange('name')}
                      >
                        <div className="flex items-center justify-between">
                          <span>Name</span>
                          {sortConfig.key === 'name' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3">Category</th>
                      <th 
                        className="table-header px-4 py-3 cursor-pointer"
                        onClick={() => handleSortChange('quantity')}
                      >
                        <div className="flex items-center justify-between">
                          <span>Quantity</span>
                          {sortConfig.key === 'quantity' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3">Location</th>
                      <th 
                        className="table-header px-4 py-3 cursor-pointer"
                        onClick={() => handleSortChange('price')}
                      >
                        <div className="flex items-center justify-between">
                          <span>Price</span>
                          {sortConfig.key === 'price' && (
                            <span className="ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="table-header px-4 py-3">Status</th>
                      <th className="table-header px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedInventory.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell px-4 py-3">{item.name}</td>
                        <td className="table-cell px-4 py-3">{item.category}</td>
                        <td className="table-cell px-4 py-3">{item.quantity} {item.unit}</td>
                        <td className="table-cell px-4 py-3">{item.location}</td>
                        <td className="table-cell px-4 py-3">${item.price.toFixed(2)}</td>
                        <td className="table-cell px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.status === 'In Stock' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="table-cell px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => openEditModal('inventory', item.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              aria-label="Edit item"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => openAddModal('transaction')}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                              aria-label="Add transaction"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              aria-label="Delete item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {filteredInventory.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                          No inventory items found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Suppliers */}
          {activeTab === 'suppliers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Suppliers</h2>
                <button 
                  onClick={() => openAddModal('supplier')}
                  className="btn btn-primary flex items-center"
                >
                  <Plus size={16} className="mr-1" /> Add Supplier
                </button>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3">Name</th>
                      <th className="table-header px-4 py-3">Contact</th>
                      <th className="table-header px-4 py-3">Email</th>
                      <th className="table-header px-4 py-3">Address</th>
                      <th className="table-header px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedSuppliers.map(supplier => (
                      <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell px-4 py-3">{supplier.name}</td>
                        <td className="table-cell px-4 py-3">{supplier.contact}</td>
                        <td className="table-cell px-4 py-3">{supplier.email}</td>
                        <td className="table-cell px-4 py-3 truncate max-w-xs">{supplier.address}</td>
                        <td className="table-cell px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => openEditModal('supplier', supplier.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              aria-label="Edit supplier"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteSupplier(supplier.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              aria-label="Delete supplier"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {suppliers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                          No suppliers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transactions */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
                <button 
                  onClick={() => openAddModal('transaction')}
                  className="btn btn-primary flex items-center"
                >
                  <Plus size={16} className="mr-1" /> New Transaction
                </button>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3">Date & Time</th>
                      <th className="table-header px-4 py-3">Item</th>
                      <th className="table-header px-4 py-3">Type</th>
                      <th className="table-header px-4 py-3">Quantity</th>
                      <th className="table-header px-4 py-3">Notes</th>
                      <th className="table-header px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedTransactions.map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell px-4 py-3">
                          <div className="flex items-center">
                            <Clock size={16} className="mr-2 text-gray-400" />
                            <span>{new Date(transaction.date).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="table-cell px-4 py-3">{transaction.itemName}</td>
                        <td className="table-cell px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'in' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                            {transaction.type === 'in' ? 'Stock In' : 'Stock Out'}
                          </span>
                        </td>
                        <td className="table-cell px-4 py-3">
                          {transaction.quantity} {inventory.find(item => item.id === transaction.itemId)?.unit || ''}
                        </td>
                        <td className="table-cell px-4 py-3 truncate max-w-xs">{transaction.notes}</td>
                        <td className="table-cell px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => openEditModal('transaction', transaction.id)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              aria-label="Edit transaction"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              aria-label="Delete transaction"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm py-4 mt-8">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      {showModal && (
        <div 
          className="modal-backdrop" 
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div 
            className="modal-content max-w-lg w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Import CSV Modal */}
            {activeTab === 'inventory' && !modalType && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium">Import Inventory</h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Upload a CSV file with your inventory data. Please download the template first if you're unsure about the format.
                  </p>
                  
                  {csvImportError && (
                    <div className="alert alert-error mb-4">
                      <p className="text-sm">{csvImportError}</p>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="csvFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-slate-700 dark:bg-slate-800 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">Click to upload or drag and drop</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">CSV file</p>
                        </div>
                        <input 
                          id="csvFile" 
                          type="file" 
                          accept=".csv" 
                          className="hidden" 
                          onChange={importInventoryCSV}
                        />
                      </label>
                    </div>
                    
                    <div className="flex justify-between">
                      <button 
                        onClick={downloadCSVTemplate}
                        className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
                      >
                        <Download size={16} className="mr-1" /> Download Template
                      </button>
                      <button 
                        onClick={closeModal}
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
            
            {/* Inventory Form */}
            {modalType === 'inventory' && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium">
                    {modalMode === 'add' ? 'Add Inventory Item' : 'Edit Inventory Item'}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleInventorySubmit} className="mt-4 space-y-4">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Item Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      defaultValue={currentItem?.name || ''}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="category" className="form-label">Category</label>
                      <select 
                        id="category" 
                        name="category" 
                        defaultValue={currentItem?.category || ''}
                        className="input"
                        required
                      >
                        <option value="" disabled>Select Category</option>
                        {CATEGORIES.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="location" className="form-label">Location</label>
                      <select 
                        id="location" 
                        name="location" 
                        defaultValue={currentItem?.location || ''}
                        className="input"
                        required
                      >
                        <option value="" disabled>Select Location</option>
                        {LOCATIONS.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label htmlFor="quantity" className="form-label">Quantity</label>
                      <input 
                        type="number" 
                        id="quantity" 
                        name="quantity" 
                        min="0"
                        defaultValue={currentItem?.quantity || 0}
                        className="input"
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="unit" className="form-label">Unit</label>
                      <select 
                        id="unit" 
                        name="unit" 
                        defaultValue={currentItem?.unit || ''}
                        className="input"
                        required
                      >
                        <option value="" disabled>Select Unit</option>
                        {UNITS.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="price" className="form-label">Price</label>
                      <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        min="0"
                        step="0.01"
                        defaultValue={currentItem?.price || 0}
                        className="input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="supplier" className="form-label">Supplier</label>
                      <select 
                        id="supplier" 
                        name="supplier" 
                        defaultValue={currentItem?.supplier || ''}
                        className="input"
                        required
                      >
                        <option value="" disabled>Select Supplier</option>
                        {sortedSuppliers.map(supplier => (
                          <option key={supplier.id} value={supplier.name}>{supplier.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="minStockLevel" className="form-label">Min Stock Level</label>
                      <input 
                        type="number" 
                        id="minStockLevel" 
                        name="minStockLevel" 
                        min="0"
                        defaultValue={currentItem?.minStockLevel || 10}
                        className="input"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {modalMode === 'add' ? 'Add Item' : 'Update Item'}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {/* Supplier Form */}
            {modalType === 'supplier' && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium">
                    {modalMode === 'add' ? 'Add Supplier' : 'Edit Supplier'}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleSupplierSubmit} className="mt-4 space-y-4">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">Supplier Name</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      defaultValue={currentSupplier?.name || ''}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="contact" className="form-label">Contact Number</label>
                    <input 
                      type="text" 
                      id="contact" 
                      name="contact" 
                      defaultValue={currentSupplier?.contact || ''}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      defaultValue={currentSupplier?.email || ''}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Address</label>
                    <textarea 
                      id="address" 
                      name="address" 
                      defaultValue={currentSupplier?.address || ''}
                      className="input"
                      rows={3}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="modal-footer">
                    <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {modalMode === 'add' ? 'Add Supplier' : 'Update Supplier'}
                    </button>
                  </div>
                </form>
              </>
            )}
            
            {/* Transaction Form */}
            {modalType === 'transaction' && (
              <>
                <div className="modal-header">
                  <h3 id="modal-title" className="text-lg font-medium">
                    {modalMode === 'add' ? 'Add Transaction' : 'Edit Transaction'}
                  </h3>
                  <button 
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleTransactionSubmit} className="mt-4 space-y-4">
                  <div className="form-group">
                    <label htmlFor="itemId" className="form-label">Item</label>
                    <select 
                      id="itemId" 
                      name="itemId" 
                      defaultValue={currentTransaction?.itemId || ''}
                      className="input"
                      required
                    >
                      <option value="" disabled>Select Item</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} - {item.location} ({item.quantity} {item.unit} available)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Transaction Type</label>
                    <div className="flex space-x-4 mt-1">
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="typeIn" 
                          name="type" 
                          value="in" 
                          defaultChecked={currentTransaction?.type === 'in' || !currentTransaction}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          required
                        />
                        <label htmlFor="typeIn" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Stock In
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input 
                          type="radio" 
                          id="typeOut" 
                          name="type" 
                          value="out" 
                          defaultChecked={currentTransaction?.type === 'out'}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="typeOut" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Stock Out
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="quantity" className="form-label">Quantity</label>
                    <input 
                      type="number" 
                      id="quantity" 
                      name="quantity" 
                      min="1"
                      defaultValue={currentTransaction?.quantity || 1}
                      className="input"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <textarea 
                      id="notes" 
                      name="notes" 
                      defaultValue={currentTransaction?.notes || ''}
                      className="input"
                      rows={2}
                    ></textarea>
                  </div>
                  
                  <div className="modal-footer">
                    <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {modalMode === 'add' ? 'Add Transaction' : 'Update Transaction'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;