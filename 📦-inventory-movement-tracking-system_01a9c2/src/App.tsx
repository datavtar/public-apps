import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, 
  Warehouse, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  Tag, 
  Calendar,
  BarChart3,
  PieChart as LucidePieChart,
  Eye,
  Scan,
  Settings,
  ArrowLeftRight,
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

// Types and Interfaces
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStockLevel: number;
  location: string;
  unitPrice: number;
  supplier: string;
  lastUpdated: string;
  description: string;
}

interface MovementRecord {
  id: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  timestamp: string;
  user: string;
  reference: string;
  notes: string;
}

interface DashboardStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  recentMovements: number;
  topCategories: Array<{ name: string; count: number; value: number }>;
  movementTrends: Array<{ date: string; incoming: number; outgoing: number }>;
}

type ViewMode = 'dashboard' | 'inventory' | 'movements' | 'analytics' | 'settings';
type MovementType = 'in' | 'out' | 'adjustment';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const App: React.FC = () => {
  // State Management
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<MovementRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortField, setSortField] = useState<keyof InventoryItem>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [showItemDetailsModal, setShowItemDetailsModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [movementFilter, setMovementFilter] = useState<MovementType | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state for new/edit item
  const [itemForm, setItemForm] = useState<Partial<InventoryItem>>({
    sku: '',
    name: '',
    category: '',
    quantity: 0,
    minStockLevel: 10,
    location: '',
    unitPrice: 0,
    supplier: '',
    description: ''
  });

  // Movement form state
  const [movementForm, setMovementForm] = useState({
    itemId: '',
    type: 'in' as MovementType,
    quantity: 0,
    reason: '',
    reference: '',
    notes: ''
  });

  // Initialize data from localStorage
  useEffect(() => {
    const savedInventory = localStorage.getItem('warehouse_inventory');
    const savedMovements = localStorage.getItem('warehouse_movements');
    const savedDarkMode = localStorage.getItem('warehouse_darkmode');

    if (savedInventory) {
      try {
        setInventory(JSON.parse(savedInventory));
      } catch (error) {
        console.error('Error loading inventory data:', error);
      }
    } else {
      // Initialize with sample data
      const sampleInventory: InventoryItem[] = [
        {
          id: '1',
          sku: 'WH001',
          name: 'Industrial Bolts Pack',
          category: 'Hardware',
          quantity: 250,
          minStockLevel: 50,
          location: 'A-1-01',
          unitPrice: 15.99,
          supplier: 'FastCorp Industries',
          lastUpdated: new Date().toISOString(),
          description: 'High-grade steel bolts for industrial applications'
        },
        {
          id: '2',
          sku: 'WH002',
          name: 'Safety Helmets',
          category: 'Safety',
          quantity: 45,
          minStockLevel: 20,
          location: 'B-2-03',
          unitPrice: 29.99,
          supplier: 'SafetyFirst Ltd',
          lastUpdated: new Date().toISOString(),
          description: 'OSHA compliant safety helmets'
        },
        {
          id: '3',
          sku: 'WH003',
          name: 'Conveyor Belt Motors',
          category: 'Machinery',
          quantity: 8,
          minStockLevel: 15,
          location: 'C-1-05',
          unitPrice: 299.99,
          supplier: 'MotorTech Solutions',
          lastUpdated: new Date().toISOString(),
          description: '2HP conveyor belt motors with warranty'
        },
        {
          id: '4',
          sku: 'WH004',
          name: 'Shipping Labels',
          category: 'Supplies',
          quantity: 1500,
          minStockLevel: 200,
          location: 'D-3-02',
          unitPrice: 0.25,
          supplier: 'PrintPro Supplies',
          lastUpdated: new Date().toISOString(),
          description: 'Thermal shipping labels 4x6 inches'
        },
        {
          id: '5',
          sku: 'WH005',
          name: 'Forklift Batteries',
          category: 'Power',
          quantity: 6,
          minStockLevel: 10,
          location: 'E-1-01',
          unitPrice: 899.99,
          supplier: 'PowerCell Inc',
          lastUpdated: new Date().toISOString(),
          description: '48V industrial forklift batteries'
        }
      ];
      setInventory(sampleInventory);
      localStorage.setItem('warehouse_inventory', JSON.stringify(sampleInventory));
    }

    if (savedMovements) {
      try {
        setMovements(JSON.parse(savedMovements));
      } catch (error) {
        console.error('Error loading movements data:', error);
      }
    } else {
      // Initialize with sample movements
      const sampleMovements: MovementRecord[] = [
        {
          id: 'm1',
          itemId: '1',
          itemName: 'Industrial Bolts Pack',
          itemSku: 'WH001',
          type: 'in',
          quantity: 100,
          previousQuantity: 150,
          newQuantity: 250,
          reason: 'Stock Replenishment',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          user: 'John Manager',
          reference: 'PO-2024-001',
          notes: 'Received from FastCorp Industries'
        },
        {
          id: 'm2',
          itemId: '2',
          itemName: 'Safety Helmets',
          itemSku: 'WH002',
          type: 'out',
          quantity: 15,
          previousQuantity: 60,
          newQuantity: 45,
          reason: 'Department Issue',
          timestamp: new Date(Date.now() - 43200000).toISOString(),
          user: 'Sarah Worker',
          reference: 'REQ-2024-045',
          notes: 'Issued to construction team'
        }
      ];
      setMovements(sampleMovements);
      localStorage.setItem('warehouse_movements', JSON.stringify(sampleMovements));
    }

    if (savedDarkMode) {
      const darkMode = savedDarkMode === 'true';
      setIsDarkMode(darkMode);
      if (darkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('warehouse_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('warehouse_movements', JSON.stringify(movements));
  }, [movements]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('warehouse_darkmode', newMode.toString());
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Calculate dashboard statistics
  const calculateStats = (): DashboardStats => {
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const lowStockItems = inventory.filter(item => item.quantity <= item.minStockLevel).length;
    const recentMovements = movements.filter(
      movement => new Date(movement.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;

    // Top categories by count and value
    const categoryStats = inventory.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = { count: 0, value: 0 };
      }
      acc[item.category].count += item.quantity;
      acc[item.category].value += item.quantity * item.unitPrice;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const topCategories = Object.entries(categoryStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Movement trends for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      return date.toISOString().split('T')[0];
    }).reverse();

    const movementTrends = last7Days.map(date => {
      const dayMovements = movements.filter(
        movement => movement.timestamp.startsWith(date)
      );
      const incoming = dayMovements
        .filter(m => m.type === 'in')
        .reduce((sum, m) => sum + m.quantity, 0);
      const outgoing = dayMovements
        .filter(m => m.type === 'out')
        .reduce((sum, m) => sum + m.quantity, 0);
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        incoming,
        outgoing
      };
    });

    return {
      totalItems,
      totalValue,
      lowStockItems,
      recentMovements,
      topCategories,
      movementTrends
    };
  };

  // Filter and sort inventory
  const filteredInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

  // Filter movements
  const filteredMovements = movements
    .filter(movement => {
      const matchesSearch = movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.itemSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           movement.reason.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = !movementFilter || movement.type === movementFilter;
      const matchesDate = !dateFilter || movement.timestamp.startsWith(dateFilter);
      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Get unique categories
  const categories = Array.from(new Set(inventory.map(item => item.category)));

  // Handle item submission
  const handleItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemForm.sku || !itemForm.name || !itemForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    const itemData: InventoryItem = {
      id: editingItem?.id || Date.now().toString(),
      sku: itemForm.sku || '',
      name: itemForm.name || '',
      category: itemForm.category || '',
      quantity: itemForm.quantity || 0,
      minStockLevel: itemForm.minStockLevel || 10,
      location: itemForm.location || '',
      unitPrice: itemForm.unitPrice || 0,
      supplier: itemForm.supplier || '',
      description: itemForm.description || '',
      lastUpdated: new Date().toISOString()
    };

    if (editingItem) {
      setInventory(prev => prev.map(item => 
        item.id === editingItem.id ? itemData : item
      ));
    } else {
      // Check for duplicate SKU
      if (inventory.some(item => item.sku === itemData.sku)) {
        alert('SKU already exists!');
        return;
      }
      setInventory(prev => [...prev, itemData]);
    }

    resetItemForm();
    setShowAddItemModal(false);
    setEditingItem(null);
  };

  // Handle movement submission
  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!movementForm.itemId || !movementForm.quantity || !movementForm.reason) {
      alert('Please fill in all required fields');
      return;
    }

    const item = inventory.find(i => i.id === movementForm.itemId);
    if (!item) {
      alert('Item not found!');
      return;
    }

    const previousQuantity = item.quantity;
    let newQuantity = previousQuantity;

    if (movementForm.type === 'in') {
      newQuantity = previousQuantity + movementForm.quantity;
    } else if (movementForm.type === 'out') {
      if (movementForm.quantity > previousQuantity) {
        alert('Insufficient stock!');
        return;
      }
      newQuantity = previousQuantity - movementForm.quantity;
    } else {
      newQuantity = movementForm.quantity;
    }

    const movementRecord: MovementRecord = {
      id: Date.now().toString(),
      itemId: movementForm.itemId,
      itemName: item.name,
      itemSku: item.sku,
      type: movementForm.type,
      quantity: movementForm.quantity,
      previousQuantity,
      newQuantity,
      reason: movementForm.reason,
      timestamp: new Date().toISOString(),
      user: 'Current User',
      reference: movementForm.reference,
      notes: movementForm.notes
    };

    setMovements(prev => [movementRecord, ...prev]);
    setInventory(prev => prev.map(i => 
      i.id === movementForm.itemId 
        ? { ...i, quantity: newQuantity, lastUpdated: new Date().toISOString() }
        : i
    ));

    resetMovementForm();
    setShowMovementModal(false);
  };

  // Reset forms
  const resetItemForm = () => {
    setItemForm({
      sku: '',
      name: '',
      category: '',
      quantity: 0,
      minStockLevel: 10,
      location: '',
      unitPrice: 0,
      supplier: '',
      description: ''
    });
  };

  const resetMovementForm = () => {
    setMovementForm({
      itemId: '',
      type: 'in',
      quantity: 0,
      reason: '',
      reference: '',
      notes: ''
    });
  };

  // Handle edit item
  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item);
    setItemForm({ ...item });
    setShowAddItemModal(true);
  };

  // Handle delete item
  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Export data to CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const newItems: InventoryItem[] = [];
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            const values = lines[i].split(',');
            const item: any = {};
            headers.forEach((header, index) => {
              item[header.trim()] = values[index]?.trim().replace(/"/g, '');
            });
            
            if (item.sku && item.name) {
              newItems.push({
                id: Date.now().toString() + i,
                sku: item.sku,
                name: item.name,
                category: item.category || 'Uncategorized',
                quantity: parseInt(item.quantity) || 0,
                minStockLevel: parseInt(item.minStockLevel) || 10,
                location: item.location || '',
                unitPrice: parseFloat(item.unitPrice) || 0,
                supplier: item.supplier || '',
                description: item.description || '',
                lastUpdated: new Date().toISOString()
              });
            }
          }
        }
        
        if (newItems.length > 0) {
          setInventory(prev => [...prev, ...newItems]);
          alert(`Successfully imported ${newItems.length} items`);
        }
      } catch (error) {
        alert('Error importing file. Please check the format.');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      'sku,name,category,quantity,minStockLevel,location,unitPrice,supplier,description',
      'TEMPLATE001,Sample Item,Category,100,10,A-1-01,25.99,Sample Supplier,Sample description'
    ].join('\n');
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddItemModal(false);
        setShowMovementModal(false);
        setShowItemDetailsModal(false);
        setEditingItem(null);
        document.body.classList.remove('modal-open');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const stats = calculateStats();

  // Render Dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-blue-600 dark:text-blue-400">Total Items</div>
              <div className="stat-value text-blue-700 dark:text-blue-300">{stats.totalItems.toLocaleString()}</div>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="stat-card bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-green-600 dark:text-green-400">Total Value</div>
              <div className="stat-value text-green-700 dark:text-green-300">${stats.totalValue.toFixed(2)}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="stat-card bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-red-600 dark:text-red-400">Low Stock</div>
              <div className="stat-value text-red-700 dark:text-red-300">{stats.lowStockItems}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="stat-card bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title text-purple-600 dark:text-purple-400">Recent Movements</div>
              <div className="stat-value text-purple-700 dark:text-purple-300">{stats.recentMovements}</div>
            </div>
            <ArrowLeftRight className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Movement Trends */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Movement Trends (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.movementTrends}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="incoming" fill="#10B981" name="Incoming" />
              <Bar dataKey="outgoing" fill="#EF4444" name="Outgoing" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LucidePieChart className="h-5 w-5" />
            Category Distribution by Value
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                dataKey="value"
                data={stats.topCategories}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {stats.topCategories.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockItems > 0 && (
        <div className="alert alert-warning">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Low Stock Alert!</p>
            <p className="text-sm">
              {stats.lowStockItems} item(s) are running low. 
              <button 
                onClick={() => setCurrentView('inventory')}
                className="ml-1 text-yellow-700 dark:text-yellow-300 underline hover:no-underline"
              >
                View inventory
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Recent Movements */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Movements
          </h3>
          <button
            onClick={() => setCurrentView('movements')}
            className="btn btn-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            View All
          </button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Item</th>
                <th className="table-header">Type</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Reason</th>
                <th className="table-header">Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {movements.slice(0, 5).map(movement => (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{movement.itemName}</div>
                      <div className="text-xs text-gray-500">{movement.itemSku}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      movement.type === 'in' ? 'badge-success' :
                      movement.type === 'out' ? 'badge-error' : 'badge-info'
                    }`}>
                      {movement.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={movement.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                      {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                    </span>
                  </td>
                  <td className="table-cell">{movement.reason}</td>
                  <td className="table-cell">
                    {new Date(movement.timestamp).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Inventory
  const renderInventory = () => (
    <div className="space-y-6">
      {/* Inventory Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6" />
          Inventory Management
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowAddItemModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </button>
          <button
            onClick={() => exportToCSV(inventory, 'inventory')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search items, SKU, category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Category</label>
            <select
              className="input"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Sort By</label>
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={sortField}
                onChange={(e) => setSortField(e.target.value as keyof InventoryItem)}
              >
                <option value="name">Name</option>
                <option value="sku">SKU</option>
                <option value="category">Category</option>
                <option value="quantity">Quantity</option>
                <option value="unitPrice">Price</option>
              </select>
              <button
                onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className="card bg-blue-50 dark:bg-blue-900/20">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="font-medium text-blue-900 dark:text-blue-100">Import Inventory</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">Upload CSV file to bulk import items</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadTemplate}
              className="btn btn-sm bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Template
            </button>
            <label className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              Import CSV
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">SKU</th>
                <th className="table-header">Name</th>
                <th className="table-header">Category</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Location</th>
                <th className="table-header">Unit Price</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell font-mono text-sm">{item.sku}</td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.supplier}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="badge badge-info">{item.category}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        item.quantity <= item.minStockLevel ? 'text-red-600' : 'text-gray-900 dark:text-white'
                      }`}>
                        {item.quantity}
                      </span>
                      {item.quantity <= item.minStockLevel && (
                        <AlertTriangle className="h-4 w-4 text-red-500" title="Low stock" />
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {item.location}
                    </span>
                  </td>
                  <td className="table-cell font-medium">${item.unitPrice.toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      item.quantity <= item.minStockLevel ? 'badge-error' :
                      item.quantity < item.minStockLevel * 2 ? 'badge-warning' : 'badge-success'
                    }`}>
                      {item.quantity <= item.minStockLevel ? 'Low Stock' :
                       item.quantity < item.minStockLevel * 2 ? 'Medium' : 'Good'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowItemDetailsModal(true);
                        }}
                        className="btn btn-sm bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-700"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="btn btn-sm bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-700"
                        title="Edit"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="btn btn-sm bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No items found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Movements
  const renderMovements = () => (
    <div className="space-y-6">
      {/* Movements Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ArrowLeftRight className="h-6 w-6" />
          Movement History
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMovementModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Record Movement
          </button>
          <button
            onClick={() => exportToCSV(movements, 'movements')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Movement Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                className="input pl-10"
                placeholder="Search items, SKU, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Movement Type</label>
            <select
              className="input"
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value as MovementType | '')}
            >
              <option value="">All Types</option>
              <option value="in">Incoming</option>
              <option value="out">Outgoing</option>
              <option value="adjustment">Adjustment</option>
            </select>
          </div>
          <div>
            <label className="form-label">Date</label>
            <input
              type="date"
              className="input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setMovementFilter('');
                setDateFilter('');
              }}
              className="btn bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Item</th>
                <th className="table-header">Type</th>
                <th className="table-header">Quantity</th>
                <th className="table-header">Previous</th>
                <th className="table-header">New</th>
                <th className="table-header">Reason</th>
                <th className="table-header">User</th>
                <th className="table-header">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {filteredMovements.map(movement => (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{movement.itemName}</div>
                      <div className="text-xs text-gray-500 font-mono">{movement.itemSku}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      movement.type === 'in' ? 'badge-success' :
                      movement.type === 'out' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {movement.type === 'in' ? 'IN' : movement.type === 'out' ? 'OUT' : 'ADJ'}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`font-medium ${
                      movement.type === 'in' ? 'text-green-600' : 
                      movement.type === 'out' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
                    </span>
                  </td>
                  <td className="table-cell">{movement.previousQuantity}</td>
                  <td className="table-cell">
                    <span className="font-medium">{movement.newQuantity}</span>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div>{movement.reason}</div>
                      {movement.reference && (
                        <div className="text-xs text-gray-500">Ref: {movement.reference}</div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {movement.user}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm">
                      <div>{new Date(movement.timestamp).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(movement.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredMovements.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No movements found matching your criteria
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render Analytics
  const renderAnalytics = () => {
    const categoryStats = stats.topCategories;
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short' });
      const monthMovements = movements.filter(m => {
        const movementMonth = new Date(m.timestamp).getMonth();
        return movementMonth === i;
      });
      
      return {
        month,
        incoming: monthMovements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0),
        outgoing: monthMovements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0),
        value: monthMovements.reduce((sum, m) => {
          const item = inventory.find(i => i.id === m.itemId);
          return sum + (item ? m.quantity * item.unitPrice : 0);
        }, 0)
      };
    });

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics & Reports
        </h2>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Avg. Item Value</div>
            <div className="stat-value">
              ${inventory.length ? (stats.totalValue / inventory.length).toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Categories</div>
            <div className="stat-value">{categories.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Total Movements</div>
            <div className="stat-value">{movements.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Stock Turnover</div>
            <div className="stat-value">
              {movements.length && inventory.length ? (movements.length / inventory.length).toFixed(1) : '0.0'}
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Monthly Movement Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="incoming" stroke="#10B981" name="Incoming" />
                <Line type="monotone" dataKey="outgoing" stroke="#EF4444" name="Outgoing" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Values */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Category Values</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']} />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items by Value */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Top Items by Total Value</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header">Item</th>
                  <th className="table-header">Category</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Unit Price</th>
                  <th className="table-header">Total Value</th>
                  <th className="table-header">% of Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {inventory
                  .map(item => ({ ...item, totalValue: item.quantity * item.unitPrice }))
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .slice(0, 10)
                  .map(item => (
                    <tr key={item.id}>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.sku}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-info">{item.category}</span>
                      </td>
                      <td className="table-cell">{item.quantity}</td>
                      <td className="table-cell">${item.unitPrice.toFixed(2)}</td>
                      <td className="table-cell font-medium">${item.totalValue.toFixed(2)}</td>
                      <td className="table-cell">
                        {((item.totalValue / stats.totalValue) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Modal for adding/editing items
  const renderItemModal = () => (
    showAddItemModal && (
      <div className="modal-backdrop" onClick={() => {
        setShowAddItemModal(false);
        setEditingItem(null);
        resetItemForm();
        document.body.classList.remove('modal-open');
      }}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h3>
            <button
              onClick={() => {
                setShowAddItemModal(false);
                setEditingItem(null);
                resetItemForm();
                document.body.classList.remove('modal-open');
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleItemSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">SKU *</label>
                <input
                  type="text"
                  className="input"
                  value={itemForm.sku || ''}
                  onChange={(e) => setItemForm(prev => ({ ...prev, sku: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="input"
                  value={itemForm.name || ''}
                  onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  className="input"
                  value={itemForm.category || ''}
                  onChange={(e) => setItemForm(prev => ({ ...prev, category: e.target.value }))}
                  list="categories"
                  required
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input
                  type="text"
                  className="input"
                  value={itemForm.supplier || ''}
                  onChange={(e) => setItemForm(prev => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="input"
                  value={itemForm.quantity || 0}
                  onChange={(e) => setItemForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Min Stock Level</label>
                <input
                  type="number"
                  className="input"
                  value={itemForm.minStockLevel || 10}
                  onChange={(e) => setItemForm(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 10 }))}
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price ($)</label>
                <input
                  type="number"
                  className="input"
                  value={itemForm.unitPrice || 0}
                  onChange={(e) => setItemForm(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="input"
                value={itemForm.location || ''}
                onChange={(e) => setItemForm(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., A-1-01, Warehouse Section B"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input"
                rows={3}
                value={itemForm.description || ''}
                onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description of the item"
              />
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowAddItemModal(false);
                  setEditingItem(null);
                  resetItemForm();
                  document.body.classList.remove('modal-open');
                }}
                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // Modal for recording movements
  const renderMovementModal = () => (
    showMovementModal && (
      <div className="modal-backdrop" onClick={() => {
        setShowMovementModal(false);
        resetMovementForm();
        document.body.classList.remove('modal-open');
      }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">Record Movement</h3>
            <button
              onClick={() => {
                setShowMovementModal(false);
                resetMovementForm();
                document.body.classList.remove('modal-open');
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleMovementSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Select Item *</label>
              <select
                className="input"
                value={movementForm.itemId}
                onChange={(e) => setMovementForm(prev => ({ ...prev, itemId: e.target.value }))}
                required
              >
                <option value="">Choose an item...</option>
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.sku} - {item.name} (Current: {item.quantity})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <select
                  className="input"
                  value={movementForm.type}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, type: e.target.value as MovementType }))}
                  required
                >
                  <option value="in">Incoming (Add Stock)</option>
                  <option value="out">Outgoing (Remove Stock)</option>
                  <option value="adjustment">Adjustment (Set Quantity)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {movementForm.type === 'adjustment' ? 'New Quantity *' : 'Quantity *'}
                </label>
                <input
                  type="number"
                  className="input"
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                  min="1"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Reason *</label>
                <input
                  type="text"
                  className="input"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Stock Replenishment, Customer Order"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reference</label>
                <input
                  type="text"
                  className="input"
                  value={movementForm.reference}
                  onChange={(e) => setMovementForm(prev => ({ ...prev, reference: e.target.value }))}
                  placeholder="e.g., PO-2024-001, REQ-123"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="input"
                rows={3}
                value={movementForm.notes}
                onChange={(e) => setMovementForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this movement"
              />
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                onClick={() => {
                  setShowMovementModal(false);
                  resetMovementForm();
                  document.body.classList.remove('modal-open');
                }}
                className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Record Movement
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // Modal for item details
  const renderItemDetailsModal = () => (
    showItemDetailsModal && selectedItem && (
      <div className="modal-backdrop" onClick={() => {
        setShowItemDetailsModal(false);
        setSelectedItem(null);
        document.body.classList.remove('modal-open');
      }}>
        <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium">Item Details</h3>
            <button
              onClick={() => {
                setShowItemDetailsModal(false);
                setSelectedItem(null);
                document.body.classList.remove('modal-open');
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Item Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">SKU</label>
                  <p className="text-lg font-mono">{selectedItem.sku}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                  <p className="text-lg font-semibold">{selectedItem.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                  <p className="text-lg">
                    <span className="badge badge-info">{selectedItem.category}</span>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</label>
                  <p className="text-lg">{selectedItem.supplier || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Quantity</label>
                  <p className={`text-2xl font-bold ${
                    selectedItem.quantity <= selectedItem.minStockLevel ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedItem.quantity}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Min Stock Level</label>
                  <p className="text-lg">{selectedItem.minStockLevel}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit Price</label>
                  <p className="text-lg font-semibold">${selectedItem.unitPrice.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</label>
                  <p className="text-lg font-bold text-green-600">
                    ${(selectedItem.quantity * selectedItem.unitPrice).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Location and Description */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</label>
                <p className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {selectedItem.location || 'Not specified'}
                </p>
              </div>
              
              {selectedItem.description && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                  <p className="text-gray-700 dark:text-gray-300">{selectedItem.description}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</label>
                <p className="text-sm text-gray-500">
                  {new Date(selectedItem.lastUpdated).toLocaleString()}
                </p>
              </div>
            </div>
            
            {/* Recent Movements for this item */}
            <div>
              <h4 className="text-md font-semibold mb-3">Recent Movements</h4>
              <div className="table-container max-h-64 overflow-y-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Type</th>
                      <th className="table-header">Quantity</th>
                      <th className="table-header">Reason</th>
                      <th className="table-header">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {movements
                      .filter(m => m.itemId === selectedItem.id)
                      .slice(0, 10)
                      .map(movement => (
                        <tr key={movement.id}>
                          <td className="table-cell">
                            <span className={`badge ${
                              movement.type === 'in' ? 'badge-success' :
                              movement.type === 'out' ? 'badge-error' : 'badge-warning'
                            }`}>
                              {movement.type.toUpperCase()}
                            </span>
                          </td>
                          <td className="table-cell">
                            <span className={movement.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                              {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : '±'}{movement.quantity}
                            </span>
                          </td>
                          <td className="table-cell">{movement.reason}</td>
                          <td className="table-cell">
                            {new Date(movement.timestamp).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                
                {movements.filter(m => m.itemId === selectedItem.id).length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                    No movements recorded for this item
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => {
                setShowItemDetailsModal(false);
                handleEditItem(selectedItem);
              }}
              className="btn bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-700 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Item
            </button>
            <button
              onClick={() => {
                setShowItemDetailsModal(false);
                setSelectedItem(null);
                document.body.classList.remove('modal-open');
              }}
              className="btn bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Handle modal open/close for proper body scroll lock
  useEffect(() => {
    if (showAddItemModal || showMovementModal || showItemDetailsModal) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showAddItemModal, showMovementModal, showItemDetailsModal]);

  // Navigation
  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'movements', label: 'Movements', icon: ArrowLeftRight },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Warehouse className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Warehouse Manager</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Inventory Tracking System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  title="Add Item"
                >
                  <Plus className="h-3 w-3" />
                  Add
                </button>
                <button
                  onClick={() => setShowMovementModal(true)}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                  title="Record Movement"
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  Move
                </button>
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 theme-transition"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid">
        <div className="flex gap-6 py-6">
          {/* Sidebar Navigation */}
          <nav className="w-64 flex-shrink-0">
            <div className="card sticky top-6">
              <div className="space-y-1">
                {navigation.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id as ViewMode)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        currentView === item.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              
              {/* Quick Stats in Sidebar */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Quick Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                    <span className="font-medium">{stats.totalItems}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Low Stock:</span>
                    <span className={`font-medium ${
                      stats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {stats.lowStockItems}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="font-medium text-green-600">${stats.totalValue.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'inventory' && renderInventory()}
            {currentView === 'movements' && renderMovements()}
            {currentView === 'analytics' && renderAnalytics()}
          </main>
        </div>
      </div>

      {/* Modals */}
      {renderItemModal()}
      {renderMovementModal()}
      {renderItemDetailsModal()}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12 theme-transition">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;