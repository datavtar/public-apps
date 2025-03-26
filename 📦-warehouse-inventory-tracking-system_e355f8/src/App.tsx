import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Search, PlusCircle, Edit, Trash2, XCircle, Check, Package, Truck, ArrowUpDown, Moon, Sun, Filter, Save, X, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import styles from './styles/styles.module.css';

// Type definitions
type InventoryItem = {
 id: string;
 sku: string;
 name: string;
 category: string;
 quantity: number;
 unit: string;
 location: string;
 lastUpdated: string;
 status: 'In Stock' | 'Low Stock' | 'Out of Stock';
};

type Movement = {
 id: string;
 itemId: string;
 type: 'Inbound' | 'Outbound' | 'Transfer';
 quantity: number;
 fromLocation?: string;
 toLocation?: string;
 date: string;
 notes: string;
};

type FilterOptions = {
 category: string;
 status: string;
 location: string;
 searchTerm: string;
};

type SortConfig = {
 key: keyof InventoryItem | '';
 direction: 'asc' | 'desc';
};

type TabType = 'inventory' | 'movements' | 'dashboard';

const App: React.FC = () => {
 // State definitions
 const [activeTab, setActiveTab] = useState<TabType>('inventory');
 const [inventory, setInventory] = useState<InventoryItem[]>([]);
 const [movements, setMovements] = useState<Movement[]>([]);
 const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
 const [filteredMovements, setFilteredMovements] = useState<Movement[]>([]);
 const [filterOptions, setFilterOptions] = useState<FilterOptions>({
 category: '',
 status: '',
 location: '',
 searchTerm: '',
 });
 const [sortConfig, setSortConfig] = useState<SortConfig>({
 key: '',
 direction: 'asc',
 });
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
 const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
 const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
 name: '',
 sku: '',
 category: '',
 quantity: 0,
 unit: 'pcs',
 location: '',
 status: 'In Stock',
 });
 const [newMovement, setNewMovement] = useState<Partial<Movement>>({
 type: 'Inbound',
 quantity: 0,
 fromLocation: '',
 toLocation: '',
 notes: '',
 });
 const [selectedItemId, setSelectedItemId] = useState<string>('');
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 // Check for saved preference or system preference
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 const [isLoading, setIsLoading] = useState<boolean>(true);
 
 // Constants
 const categories = ['Electronics', 'Furniture', 'Food', 'Clothing', 'Tools', 'Office Supplies'];
 const locations = ['Warehouse A', 'Warehouse B', 'Aisle 1', 'Aisle 2', 'Aisle 3', 'Storage Room', 'Loading Dock'];
 const units = ['pcs', 'kg', 'liter', 'box', 'pallet'];
 const statuses = ['In Stock', 'Low Stock', 'Out of Stock'];

 // Mock data initialization
 useEffect(() => {
 // Simulate loading delay
 const timer = setTimeout(() => {
 const mockInventory: InventoryItem[] = [
 {
 id: '1',
 sku: 'EL-1001',
 name: 'Laptop',
 category: 'Electronics',
 quantity: 25,
 unit: 'pcs',
 location: 'Warehouse A',
 lastUpdated: new Date().toISOString(),
 status: 'In Stock',
 },
 {
 id: '2',
 sku: 'EL-1002',
 name: 'Smartphone',
 category: 'Electronics',
 quantity: 50,
 unit: 'pcs',
 location: 'Warehouse A',
 lastUpdated: new Date().toISOString(),
 status: 'In Stock',
 },
 {
 id: '3',
 sku: 'FU-2001',
 name: 'Office Chair',
 category: 'Furniture',
 quantity: 10,
 unit: 'pcs',
 location: 'Warehouse B',
 lastUpdated: new Date().toISOString(),
 status: 'Low Stock',
 },
 {
 id: '4',
 sku: 'FO-3001',
 name: 'Canned Beans',
 category: 'Food',
 quantity: 0,
 unit: 'box',
 location: 'Aisle 1',
 lastUpdated: new Date().toISOString(),
 status: 'Out of Stock',
 },
 {
 id: '5',
 sku: 'CL-4001',
 name: 'T-Shirts',
 category: 'Clothing',
 quantity: 200,
 unit: 'pcs',
 location: 'Aisle 2',
 lastUpdated: new Date().toISOString(),
 status: 'In Stock',
 },
 ];

 const mockMovements: Movement[] = [
 {
 id: '1',
 itemId: '1',
 type: 'Inbound',
 quantity: 10,
 toLocation: 'Warehouse A',
 date: new Date(Date.now() - 86400000).toISOString(), // yesterday
 notes: 'Initial stock',
 },
 {
 id: '2',
 itemId: '2',
 type: 'Inbound',
 quantity: 20,
 toLocation: 'Warehouse A',
 date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
 notes: 'Shipment arrival',
 },
 {
 id: '3',
 itemId: '3',
 type: 'Outbound',
 quantity: 5,
 fromLocation: 'Warehouse B',
 date: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
 notes: 'Customer order #A52341',
 },
 {
 id: '4',
 itemId: '1',
 type: 'Transfer',
 quantity: 3,
 fromLocation: 'Warehouse A',
 toLocation: 'Warehouse B',
 date: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
 notes: 'Rebalancing stock',
 },
 {
 id: '5',
 itemId: '4',
 type: 'Outbound',
 quantity: 15,
 fromLocation: 'Aisle 1',
 date: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
 notes: 'Customer order #B78901',
 },
 ];

 setInventory(mockInventory);
 setMovements(mockMovements);
 setFilteredInventory(mockInventory);
 setFilteredMovements(mockMovements);
 setIsLoading(false);
 }, 1000); // 1 second delay to simulate loading

 return () => clearTimeout(timer);
 }, []);

 // Dark mode handling
 useEffect(() => {
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 }, [isDarkMode]);

 // Filtering and sorting logic
 useEffect(() => {
 let filtered = [...inventory];
 if (filterOptions.category) {
 filtered = filtered.filter(item => item.category === filterOptions.category);
 }
 if (filterOptions.status) {
 filtered = filtered.filter(item => item.status === filterOptions.status);
 }
 if (filterOptions.location) {
 filtered = filtered.filter(item => item.location === filterOptions.location);
 }
 if (filterOptions.searchTerm) {
 const term = filterOptions.searchTerm.toLowerCase();
 filtered = filtered.filter(item => 
 item.name.toLowerCase().includes(term) || 
 item.sku.toLowerCase().includes(term)
 );
 }

 if (sortConfig.key) {
 filtered.sort((a, b) => {
 if (a[sortConfig.key] < b[sortConfig.key]) {
 return sortConfig.direction === 'asc' ? -1 : 1;
 }
 if (a[sortConfig.key] > b[sortConfig.key]) {
 return sortConfig.direction === 'asc' ? 1 : -1;
 }
 return 0;
 });
 }

 setFilteredInventory(filtered);
 }, [inventory, filterOptions, sortConfig]);

 useEffect(() => {
 let filtered = [...movements];
 if (filterOptions.searchTerm) {
 const term = filterOptions.searchTerm.toLowerCase();
 filtered = filtered.filter(movement => {
 const relatedItem = inventory.find(item => item.id === movement.itemId);
 return relatedItem?.name.toLowerCase().includes(term) || 
 relatedItem?.sku.toLowerCase().includes(term) ||
 movement.notes.toLowerCase().includes(term);
 });
 }
 setFilteredMovements(filtered);
 }, [movements, filterOptions, inventory]);

 // Event handlers
 const handleSort = (key: keyof InventoryItem) => {
 let direction: 'asc' | 'desc' = 'asc';
 if (sortConfig.key === key && sortConfig.direction === 'asc') {
 direction = 'desc';
 }
 setSortConfig({ key, direction });
 };

 const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
 const { name, value } = e.target;
 setFilterOptions(prev => ({
 ...prev,
 [name]: value,
 }));
 };

 const resetFilters = () => {
 setFilterOptions({
 category: '',
 status: '',
 location: '',
 searchTerm: '',
 });
 };

 const handleNewItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 if (name === 'quantity') {
 const numValue = parseInt(value, 10) || 0;
 setNewItem(prev => ({
 ...prev,
 [name]: numValue,
 status: determineStatus(numValue),
 }));
 } else {
 setNewItem(prev => ({
 ...prev,
 [name]: value,
 }));
 }
 };

 const handleEditItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
 if (!editingItem) return;

 const { name, value } = e.target;
 if (name === 'quantity') {
 const numValue = parseInt(value, 10) || 0;
 setEditingItem(prev => ({
 ...prev!,
 [name]: numValue,
 status: determineStatus(numValue),
 }));
 } else {
 setEditingItem(prev => ({
 ...prev!,
 [name]: value,
 }));
 }
 };

 const handleNewMovementChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target;
 if (name === 'quantity') {
 setNewMovement(prev => ({
 ...prev,
 [name]: parseInt(value, 10) || 0,
 }));
 } else {
 setNewMovement(prev => ({
 ...prev,
 [name]: value,
 }));
 }
 };

 const handleMovementTypeChange = (type: Movement['type']) => {
 setNewMovement(prev => ({
 ...prev,
 type,
 // Reset location fields based on type
 fromLocation: type === 'Inbound' ? '' : prev.fromLocation,
 toLocation: type === 'Outbound' ? '' : prev.toLocation,
 }));
 };

 const handleAddItem = () => {
 if (!newItem.name || !newItem.sku || !newItem.category || !newItem.location) {
 alert('Please fill in all required fields.');
 return;
 }

 const item: InventoryItem = {
 id: Date.now().toString(),
 sku: newItem.sku || '',
 name: newItem.name || '',
 category: newItem.category || '',
 quantity: newItem.quantity || 0,
 unit: newItem.unit || 'pcs',
 location: newItem.location || '',
 lastUpdated: new Date().toISOString(),
 status: determineStatus(newItem.quantity || 0),
 };

 setInventory(prev => [...prev, item]);
 setNewItem({
 name: '',
 sku: '',
 category: '',
 quantity: 0,
 unit: 'pcs',
 location: '',
 status: 'In Stock',
 });
 setIsAddModalOpen(false);
 };

 const handleUpdateItem = () => {
 if (!editingItem) return;

 setInventory(prev =>
 prev.map(item => (item.id === editingItem.id ? {
 ...editingItem,
 lastUpdated: new Date().toISOString(),
 } : item))
 );
 setEditingItem(null);
 };

 const handleDeleteItem = (id: string) => {
 if (window.confirm('Are you sure you want to delete this item?')) {
 setInventory(prev => prev.filter(item => item.id !== id));
 // Also delete associated movements
 setMovements(prev => prev.filter(movement => movement.itemId !== id));
 }
 };

 const handleAddMovement = () => {
 if (!selectedItemId || !newMovement.quantity) {
 alert('Please select an item and enter a quantity.');
 return;
 }

 // Validate locations based on movement type
 if (newMovement.type === 'Inbound' && !newMovement.toLocation) {
 alert('Please specify a destination location.');
 return;
 }
 if (newMovement.type === 'Outbound' && !newMovement.fromLocation) {
 alert('Please specify a source location.');
 return;
 }
 if (newMovement.type === 'Transfer' && (!newMovement.fromLocation || !newMovement.toLocation)) {
 alert('Please specify both source and destination locations.');
 return;
 }

 const movement: Movement = {
 id: Date.now().toString(),
 itemId: selectedItemId,
 type: newMovement.type as Movement['type'],
 quantity: newMovement.quantity || 0,
 fromLocation: newMovement.fromLocation,
 toLocation: newMovement.toLocation,
 date: new Date().toISOString(),
 notes: newMovement.notes || '',
 };

 setMovements(prev => [...prev, movement]);

 // Update inventory quantity
 setInventory(prev =>
 prev.map(item => {
 if (item.id === selectedItemId) {
 let newQuantity = item.quantity;
 if (movement.type === 'Inbound') {
 newQuantity += movement.quantity;
 } else if (movement.type === 'Outbound') {
 newQuantity -= movement.quantity;
 }
 // For transfers, the total quantity doesn't change

 return {
 ...item,
 quantity: newQuantity,
 status: determineStatus(newQuantity),
 lastUpdated: new Date().toISOString(),
 };
 }
 return item;
 })
 );

 setNewMovement({
 type: 'Inbound',
 quantity: 0,
 fromLocation: '',
 toLocation: '',
 notes: '',
 });
 setSelectedItemId('');
 setIsMovementModalOpen(false);
 };

 const determineStatus = (quantity: number): InventoryItem['status'] => {
 if (quantity <= 0) return 'Out of Stock';
 if (quantity < 10) return 'Low Stock';
 return 'In Stock';
 };

 const getStatusBadgeClass = (status: string) => {
 switch (status) {
 case 'In Stock':
 return 'badge badge-success';
 case 'Low Stock':
 return 'badge badge-warning';
 case 'Out of Stock':
 return 'badge badge-error';
 default:
 return 'badge';
 }
 };

 const getMovementBadgeClass = (type: string) => {
 switch (type) {
 case 'Inbound':
 return 'badge badge-success';
 case 'Outbound':
 return 'badge badge-error';
 case 'Transfer':
 return 'badge badge-info';
 default:
 return 'badge';
 }
 };

 // Calculate dashboard metrics
 const getTotalItems = () => inventory.length;
 const getTotalQuantity = () => inventory.reduce((sum, item) => sum + item.quantity, 0);
 const getLowStockItems = () => inventory.filter(item => item.status === 'Low Stock').length;
 const getOutOfStockItems = () => inventory.filter(item => item.status === 'Out of Stock').length;
 const getRecentMovements = () => movements.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
 
 // Render loading state
 if (isLoading) {
 return (
 <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-gray-900 theme-transition">
 <div className="w-16 h-16 mb-4">
 <RefreshCw className="w-full h-full animate-spin text-primary-500" />
 </div>
 <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Loading Inventory System...</h2>
 <div className="w-64 space-y-3">
 <div className="skeleton-text w-full"></div>
 <div className="skeleton-text w-2/3"></div>
 <div className="skeleton-text w-3/4"></div>
 </div>
 </div>
 );
 }

 return (
 <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 theme-transition">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow theme-transition">
 <div className="container-fluid py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center">
 <div className="flex items-center mb-4 sm:mb-0">
 <Package className="h-8 w-8 text-primary-500 mr-2" />
 <h1 className="text-2xl font-bold">Warehouse Inventory Manager</h1>
 </div>
 <div className="flex items-center space-x-4">
 <button 
 className="theme-toggle flex items-center" 
 onClick={() => setIsDarkMode(!isDarkMode)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? 
 <Sun className="h-5 w-5" /> : 
 <Moon className="h-5 w-5" />}
 <span className="ml-2 text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
 </button>
 </div>
 </div>
 </header>

 {/* Navigation */}
 <nav className="bg-primary-600 dark:bg-primary-800 text-white shadow-md theme-transition">
 <div className="container-fluid">
 <div className="flex flex-wrap">
 <button 
 className={`py-3 px-4 font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-primary-700 dark:bg-primary-900' : 'hover:bg-primary-700 dark:hover:bg-primary-900'}`}
 onClick={() => setActiveTab('dashboard')}
 role="tab"
 aria-selected={activeTab === 'dashboard'}
 name="dashboard-tab"
 >
 Dashboard
 </button>
 <button 
 className={`py-3 px-4 font-medium transition-colors ${activeTab === 'inventory' ? 'bg-primary-700 dark:bg-primary-900' : 'hover:bg-primary-700 dark:hover:bg-primary-900'}`}
 onClick={() => setActiveTab('inventory')}
 role="tab"
 aria-selected={activeTab === 'inventory'}
 name="inventory-tab"
 >
 Inventory
 </button>
 <button 
 className={`py-3 px-4 font-medium transition-colors ${activeTab === 'movements' ? 'bg-primary-700 dark:bg-primary-900' : 'hover:bg-primary-700 dark:hover:bg-primary-900'}`}
 onClick={() => setActiveTab('movements')}
 role="tab"
 aria-selected={activeTab === 'movements'}
 name="movements-tab"
 >
 Movements
 </button>
 </div>
 </div>
 </nav>

 {/* Main Content */}
 <main className="flex-grow p-4 sm:p-6 md:p-8">
 {/* Dashboard Tab */}
 {activeTab === 'dashboard' && (
 <div className="space-y-6">
 <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
 
 {/* Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Total Items</div>
 <div className="stat-value">{getTotalItems()}</div>
 <div className="stat-desc">Unique inventory items</div>
 </div>
 
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Total Quantity</div>
 <div className="stat-value">{getTotalQuantity()}</div>
 <div className="stat-desc">Combined items in stock</div>
 </div>
 
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Low Stock Items</div>
 <div className="stat-value">{getLowStockItems()}</div>
 <div className="stat-desc text-warning-500">Needs attention</div>
 </div>
 
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Out of Stock</div>
 <div className="stat-value">{getOutOfStockItems()}</div>
 <div className="stat-desc text-error-500">Requires restocking</div>
 </div>
 </div>
 
 {/* Recent Activity */}
 <div className="card bg-white dark:bg-gray-800">
 <h3 className="text-lg font-medium">Recent Movements</h3>
 <div className="mt-4 overflow-x-auto">
 <table className="table w-full">
 <thead>
 <tr>
 <th className="table-header">Date</th>
 <th className="table-header">Item</th>
 <th className="table-header">Type</th>
 <th className="table-header">Quantity</th>
 <th className="table-header">Locations</th>
 </tr>
 </thead>
 <tbody>
 {getRecentMovements().map(movement => {
 const item = inventory.find(i => i.id === movement.itemId);
 return (
 <tr key={movement.id}>
 <td className="table-cell">{format(new Date(movement.date), 'MMM dd, yyyy HH:mm')}</td>
 <td className="table-cell">{item?.name || 'Unknown'}</td>
 <td className="table-cell">
 <span className={getMovementBadgeClass(movement.type)}>{movement.type}</span>
 </td>
 <td className="table-cell">{movement.quantity} {item?.unit || 'pcs'}</td>
 <td className="table-cell">
 {movement.type === 'Inbound' && `→ ${movement.toLocation}`}
 {movement.type === 'Outbound' && `${movement.fromLocation} →`}
 {movement.type === 'Transfer' && `${movement.fromLocation} → ${movement.toLocation}`}
 </td>
 </tr>
 );
 })}
 {getRecentMovements().length === 0 && (
 <tr>
 <td colSpan={5} className="table-cell text-center py-4">No recent movements</td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 
 {/* Inventory Status */}
 <div className="card bg-white dark:bg-gray-800">
 <h3 className="text-lg font-medium">Inventory Status by Category</h3>
 <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
 {categories.map(category => {
 const categoryItems = inventory.filter(item => item.category === category);
 const totalItems = categoryItems.length;
 const inStock = categoryItems.filter(item => item.status === 'In Stock').length;
 const lowStock = categoryItems.filter(item => item.status === 'Low Stock').length;
 const outOfStock = categoryItems.filter(item => item.status === 'Out of Stock').length;
 const totalQuantity = categoryItems.reduce((sum, item) => sum + item.quantity, 0);
 
 if (totalItems === 0) return null;
 
 return (
 <div key={category} className="p-4 border rounded-lg dark:border-gray-700">
 <h4 className="font-medium text-lg">{category}</h4>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{totalItems} items, {totalQuantity} units total</p>
 <div className="mt-2 flex space-x-2">
 {inStock > 0 && <span className="badge badge-success">{inStock} In Stock</span>}
 {lowStock > 0 && <span className="badge badge-warning">{lowStock} Low Stock</span>}
 {outOfStock > 0 && <span className="badge badge-error">{outOfStock} Out of Stock</span>}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </div>
 )}

 {/* Inventory Tab */}
 {activeTab === 'inventory' && (
 <div>
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
 <h2 className="text-2xl font-bold mb-4 sm:mb-0">Inventory Items</h2>
 <button 
 className="btn btn-primary flex items-center"
 onClick={() => setIsAddModalOpen(true)}
 name="add-inventory-item"
 >
 <PlusCircle className="h-5 w-5 mr-1" />
 Add Item
 </button>
 </div>

 {/* Filters */}
 <div className="card bg-white dark:bg-gray-800 mb-6">
 <h3 className="text-lg font-medium mb-4 flex items-center">
 <Filter className="h-5 w-5 mr-2" />
 Filters
 </h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="searchTerm">Search</label>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
 <input
 id="searchTerm"
 name="searchTerm"
 type="text"
 value={filterOptions.searchTerm}
 onChange={handleFilterChange}
 placeholder="Search by name or SKU"
 className="input pl-10"
 />
 </div>
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="category">Category</label>
 <select
 id="category"
 name="category"
 value={filterOptions.category}
 onChange={handleFilterChange}
 className="input"
 >
 <option value="">All Categories</option>
 {categories.map(category => (
 <option key={category} value={category}>{category}</option>
 ))}
 </select>
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="status">Status</label>
 <select
 id="status"
 name="status"
 value={filterOptions.status}
 onChange={handleFilterChange}
 className="input"
 >
 <option value="">All Status</option>
 {statuses.map(status => (
 <option key={status} value={status}>{status}</option>
 ))}
 </select>
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="location">Location</label>
 <select
 id="location"
 name="location"
 value={filterOptions.location}
 onChange={handleFilterChange}
 className="input"
 >
 <option value="">All Locations</option>
 {locations.map(location => (
 <option key={location} value={location}>{location}</option>
 ))}
 </select>
 </div>
 <div className="form-group flex items-end">
 <button 
 className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 w-full"
 onClick={resetFilters}
 name="reset-filters"
 >
 Reset Filters
 </button>
 </div>
 </div>
 </div>

 {/* Table */}
 <div className="card bg-white dark:bg-gray-800 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="table">
 <thead>
 <tr>
 <th className="table-header" onClick={() => handleSort('sku')}>
 <div className="flex items-center cursor-pointer">
 SKU
 <ArrowUpDown className="h-4 w-4 ml-1" />
 </div>
 </th>
 <th className="table-header" onClick={() => handleSort('name')}>
 <div className="flex items-center cursor-pointer">
 Name
 <ArrowUpDown className="h-4 w-4 ml-1" />
 </div>
 </th>
 <th className="table-header" onClick={() => handleSort('category')}>
 <div className="flex items-center cursor-pointer">
 Category
 <ArrowUpDown className="h-4 w-4 ml-1" />
 </div>
 </th>
 <th className="table-header" onClick={() => handleSort('quantity')}>
 <div className="flex items-center cursor-pointer">
 Quantity
 <ArrowUpDown className="h-4 w-4 ml-1" />
 </div>
 </th>
 <th className="table-header" onClick={() => handleSort('location')}>
 <div className="flex items-center cursor-pointer">
 Location
 <ArrowUpDown className="h-4 w-4 ml-1" />
 </div>
 </th>
 <th className="table-header" onClick={() => handleSort('status')}>
 <div className="flex items-center cursor-pointer">
 Status
 <ArrowUpDown className="h-4 w-4 ml-1" />
 </div>
 </th>
 <th className="table-header" onClick={() => handleSort('lastUpdated')}>
 <div className="flex items-center cursor-pointer">
 Last Updated
 <ArrowUpDown className="h-4 w-4 ml-1" />
 </div>
 </th>
 <th className="table-header text-right">Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredInventory.map(item => (
 <tr key={item.id}>
 <td className="table-cell font-mono">{item.sku}</td>
 <td className="table-cell font-medium">{item.name}</td>
 <td className="table-cell">{item.category}</td>
 <td className="table-cell">{item.quantity} {item.unit}</td>
 <td className="table-cell">{item.location}</td>
 <td className="table-cell">
 <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
 </td>
 <td className="table-cell text-sm text-gray-500">
 {format(new Date(item.lastUpdated), 'MMM dd, yyyy')}
 </td>
 <td className="table-cell text-right space-x-1">
 <button 
 className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
 onClick={() => {
 setEditingItem(item);
 }}
 aria-label={`Edit ${item.name}`}
 name={`edit-item-${item.id}`}
 >
 <Edit className="h-4 w-4" />
 </button>
 <button 
 className="btn btn-sm bg-green-500 text-white hover:bg-green-600"
 onClick={() => {
 setSelectedItemId(item.id);
 setNewMovement(prev => ({
 ...prev,
 type: 'Inbound',
 toLocation: item.location,
 }));
 setIsMovementModalOpen(true);
 }}
 aria-label={`Record movement for ${item.name}`}
 name={`move-item-${item.id}`}
 >
 <Truck className="h-4 w-4" />
 </button>
 <button 
 className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
 onClick={() => handleDeleteItem(item.id)}
 aria-label={`Delete ${item.name}`}
 name={`delete-item-${item.id}`}
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </td>
 </tr>
 ))}
 {filteredInventory.length === 0 && (
 <tr>
 <td colSpan={8} className="table-cell text-center py-8">
 No items found. {filterOptions.searchTerm || filterOptions.category || filterOptions.status || filterOptions.location ? 'Try adjusting your filters.' : 'Add your first item by clicking the "Add Item" button.'}
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {/* Movements Tab */}
 {activeTab === 'movements' && (
 <div>
 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
 <h2 className="text-2xl font-bold mb-4 sm:mb-0">Inventory Movements</h2>
 <button 
 className="btn btn-primary flex items-center"
 onClick={() => {
 setSelectedItemId('');
 setNewMovement({
 type: 'Inbound',
 quantity: 0,
 fromLocation: '',
 toLocation: '',
 notes: '',
 });
 setIsMovementModalOpen(true);
 }}
 name="record-movement"
 >
 <PlusCircle className="h-5 w-5 mr-1" />
 Record Movement
 </button>
 </div>

 {/* Search */}
 <div className="card bg-white dark:bg-gray-800 mb-6">
 <div className="form-group mb-0">
 <label className="form-label" htmlFor="movementSearch">Search Movements</label>
 <div className="relative">
 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
 <input
 id="movementSearch"
 name="searchTerm"
 type="text"
 value={filterOptions.searchTerm}
 onChange={handleFilterChange}
 placeholder="Search by item name, SKU, or notes"
 className="input pl-10"
 />
 </div>
 </div>
 </div>

 {/* Table */}
 <div className="card bg-white dark:bg-gray-800 overflow-hidden">
 <div className="overflow-x-auto">
 <table className="table">
 <thead>
 <tr>
 <th className="table-header">Date & Time</th>
 <th className="table-header">Item</th>
 <th className="table-header">Type</th>
 <th className="table-header">Quantity</th>
 <th className="table-header">From</th>
 <th className="table-header">To</th>
 <th className="table-header">Notes</th>
 </tr>
 </thead>
 <tbody>
 {filteredMovements.map(movement => {
 const item = inventory.find(i => i.id === movement.itemId);
 return (
 <tr key={movement.id}>
 <td className="table-cell whitespace-nowrap">
 {format(new Date(movement.date), 'MMM dd, yyyy HH:mm')}
 </td>
 <td className="table-cell font-medium">
 {item ? (
 <>
 <div>{item.name}</div>
 <div className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</div>
 </>
 ) : 'Unknown Item'}
 </td>
 <td className="table-cell">
 <span className={getMovementBadgeClass(movement.type)}>
 {movement.type}
 </span>
 </td>
 <td className="table-cell">
 {movement.quantity} {item?.unit || 'pcs'}
 </td>
 <td className="table-cell">
 {movement.fromLocation || '-'}
 </td>
 <td className="table-cell">
 {movement.toLocation || '-'}
 </td>
 <td className="table-cell">
 {movement.notes || '-'}
 </td>
 </tr>
 );
 })}
 {filteredMovements.length === 0 && (
 <tr>
 <td colSpan={7} className="table-cell text-center py-8">
 No movements found. {filterOptions.searchTerm ? 'Try adjusting your search.' : 'Record your first movement by clicking the "Record Movement" button.'}
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

 {/* Add Item Modal */}
 {isAddModalOpen && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg">
 <div className="modal-header">
 <h3 className="text-lg font-medium">Add New Inventory Item</h3>
 <button 
 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
 onClick={() => setIsAddModalOpen(false)}
 aria-label="Close modal"
 >
 <XCircle className="h-6 w-6" />
 </button>
 </div>

 <div className="mt-4 space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="name">Item Name</label>
 <input
 id="name"
 name="name"
 type="text"
 value={newItem.name}
 onChange={handleNewItemChange}
 className="input"
 required
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="sku">SKU</label>
 <input
 id="sku"
 name="sku"
 type="text"
 value={newItem.sku}
 onChange={handleNewItemChange}
 className="input"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="category">Category</label>
 <select
 id="category"
 name="category"
 value={newItem.category}
 onChange={handleNewItemChange}
 className="input"
 required
 >
 <option value="">Select Category</option>
 {categories.map(category => (
 <option key={category} value={category}>{category}</option>
 ))}
 </select>
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="location">Location</label>
 <select
 id="location"
 name="location"
 value={newItem.location}
 onChange={handleNewItemChange}
 className="input"
 required
 >
 <option value="">Select Location</option>
 {locations.map(location => (
 <option key={location} value={location}>{location}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="quantity">Initial Quantity</label>
 <input
 id="quantity"
 name="quantity"
 type="number"
 value={newItem.quantity}
 onChange={handleNewItemChange}
 min="0"
 className="input"
 required
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="unit">Unit</label>
 <select
 id="unit"
 name="unit"
 value={newItem.unit}
 onChange={handleNewItemChange}
 className="input"
 required
 >
 {units.map(unit => (
 <option key={unit} value={unit}>{unit}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="form-group">
 <label className="form-label">Status</label>
 <div className="mt-1">
 <span className={getStatusBadgeClass(determineStatus(newItem.quantity || 0))}>
 {determineStatus(newItem.quantity || 0)}
 </span>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
 Status is automatically determined based on quantity.
 </p>
 </div>
 </div>
 </div>

 <div className="modal-footer">
 <button 
 className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setIsAddModalOpen(false)}
 >
 Cancel
 </button>
 <button 
 className="btn btn-primary"
 onClick={handleAddItem}
 >
 Add Item
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Edit Item Modal */}
 {editingItem && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg">
 <div className="modal-header">
 <h3 className="text-lg font-medium">Edit {editingItem.name}</h3>
 <button 
 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
 onClick={() => setEditingItem(null)}
 aria-label="Close modal"
 >
 <XCircle className="h-6 w-6" />
 </button>
 </div>

 <div className="mt-4 space-y-4">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="edit-name">Item Name</label>
 <input
 id="edit-name"
 name="name"
 type="text"
 value={editingItem.name}
 onChange={handleEditItemChange}
 className="input"
 required
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="edit-sku">SKU</label>
 <input
 id="edit-sku"
 name="sku"
 type="text"
 value={editingItem.sku}
 onChange={handleEditItemChange}
 className="input"
 required
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="edit-category">Category</label>
 <select
 id="edit-category"
 name="category"
 value={editingItem.category}
 onChange={handleEditItemChange}
 className="input"
 required
 >
 {categories.map(category => (
 <option key={category} value={category}>{category}</option>
 ))}
 </select>
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="edit-location">Location</label>
 <select
 id="edit-location"
 name="location"
 value={editingItem.location}
 onChange={handleEditItemChange}
 className="input"
 required
 >
 {locations.map(location => (
 <option key={location} value={location}>{location}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="form-group">
 <label className="form-label" htmlFor="edit-quantity">Quantity</label>
 <input
 id="edit-quantity"
 name="quantity"
 type="number"
 value={editingItem.quantity}
 onChange={handleEditItemChange}
 min="0"
 className="input"
 required
 />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="edit-unit">Unit</label>
 <select
 id="edit-unit"
 name="unit"
 value={editingItem.unit}
 onChange={handleEditItemChange}
 className="input"
 required
 >
 {units.map(unit => (
 <option key={unit} value={unit}>{unit}</option>
 ))}
 </select>
 </div>
 </div>

 <div className="form-group">
 <label className="form-label">Status</label>
 <div className="mt-1">
 <span className={getStatusBadgeClass(editingItem.status)}>
 {editingItem.status}
 </span>
 <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
 Status is automatically determined based on quantity.
 </p>
 </div>
 </div>
 </div>

 <div className="modal-footer">
 <button 
 className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setEditingItem(null)}
 >
 Cancel
 </button>
 <button 
 className="btn btn-primary"
 onClick={handleUpdateItem}
 >
 <Save className="h-4 w-4 mr-1" />
 Save Changes
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Movement Modal */}
 {isMovementModalOpen && (
 <div className="modal-backdrop">
 <div className="modal-content max-w-lg">
 <div className="modal-header">
 <h3 className="text-lg font-medium">Record Inventory Movement</h3>
 <button 
 className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
 onClick={() => setIsMovementModalOpen(false)}
 aria-label="Close modal"
 >
 <XCircle className="h-6 w-6" />
 </button>
 </div>

 <div className="mt-4 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="itemId">Select Item</label>
 <select
 id="itemId"
 value={selectedItemId}
 onChange={(e) => setSelectedItemId(e.target.value)}
 className="input"
 required
 >
 <option value="">Choose an item</option>
 {inventory.map(item => (
 <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
 ))}
 </select>
 </div>

 <div className="form-group">
 <label className="form-label">Movement Type</label>
 <div className="flex flex-wrap gap-2">
 <button
 type="button"
 className={`btn ${newMovement.type === 'Inbound' ? 'btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
 onClick={() => handleMovementTypeChange('Inbound')}
 >
 <ChevronRight className="h-4 w-4 mr-1" />
 Inbound
 </button>
 <button
 type="button"
 className={`btn ${newMovement.type === 'Outbound' ? 'btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
 onClick={() => handleMovementTypeChange('Outbound')}
 >
 <ChevronLeft className="h-4 w-4 mr-1" />
 Outbound
 </button>
 <button
 type="button"
 className={`btn ${newMovement.type === 'Transfer' ? 'btn-primary' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
 onClick={() => handleMovementTypeChange('Transfer')}
 >
 <Truck className="h-4 w-4 mr-1" />
 Transfer
 </button>
 </div>
 </div>

 <div className="form-group">
 <label className="form-label" htmlFor="quantity">Quantity</label>
 <input
 id="quantity"
 name="quantity"
 type="number"
 value={newMovement.quantity}
 onChange={handleNewMovementChange}
 min="1"
 className="input"
 required
 />
 </div>

 {(newMovement.type === 'Outbound' || newMovement.type === 'Transfer') && (
 <div className="form-group">
 <label className="form-label" htmlFor="fromLocation">From Location</label>
 <select
 id="fromLocation"
 name="fromLocation"
 value={newMovement.fromLocation}
 onChange={handleNewMovementChange}
 className="input"
 required
 >
 <option value="">Select Source Location</option>
 {locations.map(location => (
 <option key={location} value={location}>{location}</option>
 ))}
 </select>
 </div>
 )}

 {(newMovement.type === 'Inbound' || newMovement.type === 'Transfer') && (
 <div className="form-group">
 <label className="form-label" htmlFor="toLocation">To Location</label>
 <select
 id="toLocation"
 name="toLocation"
 value={newMovement.toLocation}
 onChange={handleNewMovementChange}
 className="input"
 required
 >
 <option value="">Select Destination Location</option>
 {locations.map(location => (
 <option key={location} value={location}>{location}</option>
 ))}
 </select>
 </div>
 )}

 <div className="form-group">
 <label className="form-label" htmlFor="notes">Notes</label>
 <textarea
 id="notes"
 name="notes"
 value={newMovement.notes}
 onChange={handleNewMovementChange}
 className="input h-24"
 placeholder="Enter any additional information"
 ></textarea>
 </div>
 </div>

 <div className="modal-footer">
 <button 
 className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
 onClick={() => setIsMovementModalOpen(false)}
 >
 Cancel
 </button>
 <button 
 className="btn btn-primary"
 onClick={handleAddMovement}
 >
 Record Movement
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 shadow-inner py-4 mt-auto theme-transition">
 <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
 Copyright &copy; 2025 of Datavtar Private Limited. All rights reserved.
 </div>
 </footer>
 </div>
 );
};

export default App;