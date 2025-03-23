import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { format } from 'date-fns';
import {
 Package,
 PlusCircle,
 Search,
 Edit,
 Trash2,
 ArrowUpDown,
 Box,
 LogOut,
 MoveRight,
 MoveLeft,
 Sun,
 Moon,
 FileText,
 BarChart3,
 AlertCircle,
 CheckCircle2,
 X
} from 'lucide-react';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
 // Type definitions
 type InventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock';
 type TransactionType = 'incoming' | 'outgoing';
 
 interface InventoryItem {
 id: string;
 name: string;
 sku: string;
 category: string;
 quantity: number;
 location: string;
 lastUpdated: Date;
 status: InventoryStatus;
 }
 
 interface InventoryTransaction {
 id: string;
 itemId: string;
 itemName: string;
 type: TransactionType;
 quantity: number;
 date: Date;
 handledBy: string;
 notes?: string;
 }
 
 interface FormValues {
 id?: string;
 name: string;
 sku: string;
 category: string;
 quantity: number;
 location: string;
 }
 
 interface TransactionFormValues {
 id?: string;
 itemId: string;
 type: TransactionType;
 quantity: number;
 handledBy: string;
 notes?: string;
 }
 
 // State management
 const [inventory, setInventory] = useState<InventoryItem[]>([]);
 const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
 const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
 const [searchTerm, setSearchTerm] = useState<string>('');
 const [filterCategory, setFilterCategory] = useState<string>('all');
 const [sortField, setSortField] = useState<keyof InventoryItem>('name');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
 const [activeTab, setActiveTab] = useState<'inventory' | 'transactions' | 'dashboard'>('inventory');
 const [showAddModal, setShowAddModal] = useState<boolean>(false);
 const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
 const [selectedTransaction, setSelectedTransaction] = useState<TransactionType>('incoming');
 const [selectedItem, setSelectedItem] = useState<string>('');
 const [showAlert, setShowAlert] = useState<{show: boolean, type: 'success' | 'error', message: string}>({show: false, type: 'success', message: ''});
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 
 // Form handling
 const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>();
 const transactionForm = useForm<TransactionFormValues>();
 
 // Categories
 const categories = ['Electronics', 'Furniture', 'Clothing', 'Food', 'Raw Materials', 'Tools', 'Office Supplies'];
 
 // Warehouse locations
 const locations = ['Aisle A', 'Aisle B', 'Aisle C', 'Bay 1', 'Bay 2', 'Cold Storage', 'Secure Room'];
 
 // Sample data initialization
 useEffect(() => {
 // Apply dark mode to document
 if (isDarkMode) {
 document.documentElement.classList.add('dark');
 localStorage.setItem('darkMode', 'true');
 } else {
 document.documentElement.classList.remove('dark');
 localStorage.setItem('darkMode', 'false');
 }
 
 if (inventory.length === 0) {
 const sampleInventory: InventoryItem[] = [
 {
 id: '1',
 name: 'Desktop Computer',
 sku: 'COMP-001',
 category: 'Electronics',
 quantity: 15,
 location: 'Aisle A',
 lastUpdated: new Date(2023, 5, 15),
 status: 'in-stock'
 },
 {
 id: '2',
 name: 'Office Chair',
 sku: 'FURN-001',
 category: 'Furniture',
 quantity: 8,
 location: 'Bay 1',
 lastUpdated: new Date(2023, 6, 2),
 status: 'in-stock'
 },
 {
 id: '3',
 name: 'Printer Ink Cartridge',
 sku: 'SUPP-001',
 category: 'Office Supplies',
 quantity: 3,
 location: 'Aisle C',
 lastUpdated: new Date(2023, 7, 10),
 status: 'low-stock'
 },
 {
 id: '4',
 name: 'Smartphone',
 sku: 'ELEC-002',
 category: 'Electronics',
 quantity: 0,
 location: 'Secure Room',
 lastUpdated: new Date(2023, 7, 15),
 status: 'out-of-stock'
 },
 {
 id: '5',
 name: 'Drill Set',
 sku: 'TOOL-001',
 category: 'Tools',
 quantity: 12,
 location: 'Bay 2',
 lastUpdated: new Date(2023, 8, 1),
 status: 'in-stock'
 }
 ];
 
 const sampleTransactions: InventoryTransaction[] = [
 {
 id: '1',
 itemId: '1',
 itemName: 'Desktop Computer',
 type: 'incoming',
 quantity: 10,
 date: new Date(2023, 5, 10),
 handledBy: 'John Doe'
 },
 {
 id: '2',
 itemId: '1',
 itemName: 'Desktop Computer',
 type: 'outgoing',
 quantity: 2,
 date: new Date(2023, 5, 12),
 handledBy: 'Jane Smith'
 },
 {
 id: '3',
 itemId: '2',
 itemName: 'Office Chair',
 type: 'incoming',
 quantity: 10,
 date: new Date(2023, 6, 1),
 handledBy: 'John Doe'
 },
 {
 id: '4',
 itemId: '3',
 itemName: 'Printer Ink Cartridge',
 type: 'incoming',
 quantity: 5,
 date: new Date(2023, 7, 8),
 handledBy: 'Jane Smith'
 },
 {
 id: '5',
 itemId: '3',
 itemName: 'Printer Ink Cartridge',
 type: 'outgoing',
 quantity: 2,
 date: new Date(2023, 7, 9),
 handledBy: 'John Doe',
 notes: 'Urgent request from marketing dept'
 }
 ];
 
 setInventory(sampleInventory);
 setTransactions(sampleTransactions);
 }
 }, [inventory.length, isDarkMode]);
 
 // Alert functions
 const showSuccessAlert = (message: string) => {
 setShowAlert({show: true, type: 'success', message});
 setTimeout(() => setShowAlert({show: false, type: 'success', message: ''}), 3000);
 };
 
 const showErrorAlert = (message: string) => {
 setShowAlert({show: true, type: 'error', message});
 setTimeout(() => setShowAlert({show: false, type: 'error', message: ''}), 3000);
 };
 
 // Item form submit handler
 const onSubmitItem: SubmitHandler<FormValues> = (data) => {
 if (editingItem) {
 // Update existing item
 const updatedInventory = inventory.map(item => 
 item.id === editingItem.id ? 
 {
 ...item,
 name: data.name,
 sku: data.sku,
 category: data.category,
 quantity: data.quantity,
 location: data.location,
 lastUpdated: new Date(),
 status: getInventoryStatus(data.quantity)
 } : item
 );
 
 setInventory(updatedInventory);
 showSuccessAlert('Item updated successfully!');
 } else {
 // Add new item
 const newItem: InventoryItem = {
 id: String(Date.now()),
 name: data.name,
 sku: data.sku,
 category: data.category,
 quantity: data.quantity,
 location: data.location,
 lastUpdated: new Date(),
 status: getInventoryStatus(data.quantity)
 };
 
 setInventory([...inventory, newItem]);
 showSuccessAlert('Item added successfully!');
 }
 
 setEditingItem(null);
 setShowAddModal(false);
 reset();
 };
 
 // Transaction form submit handler
 const onSubmitTransaction: SubmitHandler<TransactionFormValues> = (data) => {
 const selectedInventoryItem = inventory.find(item => item.id === data.itemId);
 
 if (!selectedInventoryItem) {
 showErrorAlert('Selected item not found!');
 return;
 }
 
 // Create new transaction
 const newTransaction: InventoryTransaction = {
 id: String(Date.now()),
 itemId: data.itemId,
 itemName: selectedInventoryItem.name,
 type: data.type,
 quantity: data.quantity,
 date: new Date(),
 handledBy: data.handledBy,
 notes: data.notes
 };
 
 // Update inventory quantity
 const updatedInventory = inventory.map(item => {
 if (item.id === data.itemId) {
 const newQuantity = data.type === 'incoming' ? 
 item.quantity + data.quantity : 
 Math.max(0, item.quantity - data.quantity);
 
 return {
 ...item,
 quantity: newQuantity,
 lastUpdated: new Date(),
 status: getInventoryStatus(newQuantity)
 };
 }
 return item;
 });
 
 setInventory(updatedInventory);
 setTransactions([...transactions, newTransaction]);
 setShowTransactionModal(false);
 transactionForm.reset();
 showSuccessAlert(`${data.type === 'incoming' ? 'Inbound' : 'Outbound'} transaction recorded successfully!`);
 };
 
 // Helper to determine inventory status based on quantity
 const getInventoryStatus = (quantity: number): InventoryStatus => {
 if (quantity <= 0) return 'out-of-stock';
 if (quantity <= 5) return 'low-stock';
 return 'in-stock';
 };
 
 // Helper to get status badge color
 const getStatusBadgeClass = (status: InventoryStatus): string => {
 switch (status) {
 case 'in-stock': return 'badge badge-success';
 case 'low-stock': return 'badge badge-warning';
 case 'out-of-stock': return 'badge badge-error';
 default: return 'badge';
 }
 };
 
 // Delete item handler
 const handleDeleteItem = (id: string) => {
 if (window.confirm('Are you sure you want to delete this item?')) {
 setInventory(inventory.filter(item => item.id !== id));
 showSuccessAlert('Item deleted successfully!');
 }
 };
 
 // Edit item handler
 const handleEditItem = (item: InventoryItem) => {
 setEditingItem(item);
 setValue('name', item.name);
 setValue('sku', item.sku);
 setValue('category', item.category);
 setValue('quantity', item.quantity);
 setValue('location', item.location);
 setShowAddModal(true);
 };
 
 // Handle adding a transaction
 const handleAddTransaction = (type: TransactionType) => {
 setSelectedTransaction(type);
 setShowTransactionModal(true);
 };
 
 // Reset form when closing modals
 const handleCloseAddModal = () => {
 setShowAddModal(false);
 setEditingItem(null);
 reset();
 };
 
 const handleCloseTransactionModal = () => {
 setShowTransactionModal(false);
 transactionForm.reset();
 };
 
 // Sort by field
 const handleSort = (field: keyof InventoryItem) => {
 if (sortField === field) {
 setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
 } else {
 setSortField(field);
 setSortDirection('asc');
 }
 };
 
 // Filter and sort inventory items
 const filteredInventory = inventory
 .filter(item => {
 const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
 item.sku.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
 return matchesSearch && matchesCategory;
 })
 .sort((a, b) => {
 const fieldA = a[sortField];
 const fieldB = b[sortField];
 
 if (fieldA < fieldB) {
 return sortDirection === 'asc' ? -1 : 1;
 } else if (fieldA > fieldB) {
 return sortDirection === 'asc' ? 1 : -1;
 } else {
 return 0;
 }
 });
 
 // Dark mode toggle handler
 const toggleDarkMode = () => {
 setIsDarkMode(prevMode => !prevMode);
 };
 
 // Render
 return (
 <div className={isDarkMode ? 'dark' : ''}>
 <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow">
 <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
 <h1 className="text-3xl font-bold">
 Inventory Management
 </h1>
 <button onClick={toggleDarkMode} className="focus:outline-none">
 {isDarkMode ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6" />}
 </button>
 </div>
 </header>
 
 {/* Main Content */}
 <main>
 <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
 {/* Tabs */}
 <div className="mb-4">
 <nav className="flex space-x-4" aria-label="Tabs">
 <button
 className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'inventory' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-300 hover:text-white'}`}
 aria-current={activeTab === 'inventory' ? 'page' : undefined}
 onClick={() => setActiveTab('inventory')}
 >
 Inventory
 </button>
 <button
 className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'transactions' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-300 hover:text-white'}`}
 aria-current={activeTab === 'transactions' ? 'page' : undefined}
 onClick={() => setActiveTab('transactions')}
 >
 Transactions
 </button>
 <button
 className={`px-3 py-2 font-medium text-sm rounded-md ${activeTab === 'dashboard' ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-indigo-300 hover:text-white'}`}
 aria-current={activeTab === 'dashboard' ? 'page' : undefined}
 onClick={() => setActiveTab('dashboard')}
 >
 Dashboard
 </button>
 </nav>
 </div>
 
 {/* Alert */}
 {showAlert.show && (
 <div className={`alert ${showAlert.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
 <div className="flex-1">
 {showAlert.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
 <label>{showAlert.message}</label>
 </div>
 <button className="btn btn-clear" onClick={() => setShowAlert({...showAlert, show: false})}><X /></button>
 </div>
 )}
 
 {/* Inventory Tab */}
 {activeTab === 'inventory' && (
 <div>
 {/* Search and Filter */}
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center">
 <div className="form-control">
 <input
 type="text"
 placeholder="Search by name or SKU..."
 className="input input-bordered input-sm" // Added input-sm for size
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 />
 </div>
 <div className="form-control ml-2">
 <select
 className="select select-bordered select-sm" // Added select-sm for size
 value={filterCategory}
 onChange={(e) => setFilterCategory(e.target.value)}
 >
 <option value="all">All Categories</option>
 {categories.map(category => (
 <option key={category} value={category}>{category}</option>
 ))}
 </select>
 </div>
 </div>
 <button className="btn btn-sm btn-primary" onClick={() => setShowAddModal(true)}>
 <PlusCircle className="h-4 w-4 mr-1" />
 Add Item
 </button>
 </div>
 
 {/* Inventory Table */}
 <div className="overflow-x-auto">
 <table className="table w-full">
 {/* Head */}
 <thead>
 <tr>
 <th onClick={() => handleSort('name')}>Name <ArrowUpDown className="inline-block h-4 w-4" /></th>
 <th onClick={() => handleSort('sku')}>SKU <ArrowUpDown className="inline-block h-4 w-4" /></th>
 <th onClick={() => handleSort('category')}>Category <ArrowUpDown className="inline-block h-4 w-4" /></th>
 <th onClick={() => handleSort('quantity')}>Quantity <ArrowUpDown className="inline-block h-4 w-4" /></th>
 <th onClick={() => handleSort('location')}>Location <ArrowUpDown className="inline-block h-4 w-4" /></th>
 <th onClick={() => handleSort('lastUpdated')}>Last Updated <ArrowUpDown className="inline-block h-4 w-4" /></th>
 <th>Status</th>
 <th>Actions</th>
 </tr>
 </thead>
 <tbody>
 {filteredInventory.map(item => (
 <tr key={item.id}>
 <td>{item.name}</td>
 <td>{item.sku}</td>
 <td>{item.category}</td>
 <td>{item.quantity}</td>
 <td>{item.location}</td>
 <td>{format(item.lastUpdated, 'yyyy-MM-dd')}</td>
 <td><div className={getStatusBadgeClass(item.status)}>{item.status}</div></td>
 <td>
 <button className="btn btn-sm btn-ghost" onClick={() => handleEditItem(item)}><Edit className="h-4 w-4" /></button>
 <button className="btn btn-sm btn-ghost" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 
 {/* Transactions Tab */}
 {activeTab === 'transactions' && (
 <div>
 <div className="flex justify-end mb-4">
 <button className="btn btn-sm btn-primary mr-2" onClick={() => handleAddTransaction('incoming')}>
 <MoveRight className="h-4 w-4 mr-1" />
 Add Incoming
 </button>
 <button className="btn btn-sm btn-primary" onClick={() => handleAddTransaction('outgoing')}>
 <MoveLeft className="h-4 w-4 mr-1" />
 Add Outgoing
 </button>
 </div>
 <div className="overflow-x-auto">
 <table className="table w-full">
 <thead>
 <tr>
 <th>Item Name</th>
 <th>Type</th>
 <th>Quantity</th>
 <th>Date</th>
 <th>Handled By</th>
 <th>Notes</th>
 </tr>
 </thead>
 <tbody>
 {transactions.map(transaction => (
 <tr key={transaction.id}>
 <td>{transaction.itemName}</td>
 <td>{transaction.type}</td>
 <td>{transaction.quantity}</td>
 <td>{format(transaction.date, 'yyyy-MM-dd')}</td>
 <td>{transaction.handledBy}</td>
 <td>{transaction.notes}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 
 {/* Dashboard Tab */}
 {activeTab === 'dashboard' && (
 <div>
 <div className="stats shadow">
 
 <div className="stat">
 <div className="stat-figure text-primary">
 <Package className="h-6 w-6"/>
 </div>
 <div className="stat-title">Total Items</div>
 <div className="stat-value">{inventory.length}</div>
 <div className="stat-desc">Total number of items in inventory</div>
 </div>
 
 <div className="stat">
 <div className="stat-figure text-secondary">
 <ArrowUpDown className="h-6 w-6"/>
 </div>
 <div className="stat-title">In Stock</div>
 <div className="stat-value">{inventory.filter(item => item.status === 'in-stock').length}</div>
 <div className="stat-desc">Items currently in stock</div>
 </div>
 
 <div className="stat">
 <div className="stat-figure text-accent">
 <AlertCircle className="h-6 w-6"/>
 </div>
 <div className="stat-title">Low Stock</div>
 <div className="stat-value">{inventory.filter(item => item.status === 'low-stock').length}</div>
 <div className="stat-desc">Items with low stock levels</div>
 </div>
 
 <div className="stat">
 <div className="stat-figure text-neutral">
 <Box className="h-6 w-6"/>
 </div>
 <div className="stat-title">Out of Stock</div>
 <div className="stat-value">{inventory.filter(item => item.status === 'out-of-stock').length}</div>
 <div className="stat-desc">Items currently out of stock</div>
 </div>
 
 </div>
 </div>
 )}
 </div>
 </main>
 
 {/* Add Item Modal */}
 {showAddModal && (
 <div className="modal modal-open">
 <div className="modal-box">
 <button onClick={handleCloseAddModal} className="btn btn-sm btn-circle absolute right-2 top-2">
 ✕
 </button>
 <h3 className="font-bold text-lg">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
 <form onSubmit={handleSubmit(onSubmitItem)}>
 <div className="form-control">
 <label className="label">Item Name</label>
 <input type="text" placeholder="Item Name" className="input input-bordered" {...register('name', { required: true })} />
 {errors.name && <span className="text-red-500">This field is required</span>}
 </div>
 <div className="form-control">
 <label className="label">SKU</label>
 <input type="text" placeholder="SKU" className="input input-bordered" {...register('sku', { required: true })} />
 {errors.sku && <span className="text-red-500">This field is required</span>}
 </div>
 <div className="form-control">
 <label className="label">Category</label>
 <select className="select select-bordered" {...register('category', { required: true })}>
 <option value="">Select a category</option>
 {categories.map(category => (
 <option key={category} value={category}>{category}</option>
 ))}
 </select>
 {errors.category && <span className="text-red-500">This field is required</span>}
 </div>
 <div className="form-control">
 <label className="label">Quantity</label>
 <input type="number" placeholder="Quantity" className="input input-bordered" {...register('quantity', { required: true, valueAsNumber: true })} />
 {errors.quantity && <span className="text-red-500">This field is required</span>}
 </div>
 <div className="form-control">
 <label className="label">Location</label>
 <select className="select select-bordered" {...register('location', { required: true })}>
 <option value="">Select a location</option>
 {locations.map(location => (
 <option key={location} value={location}>{location}</option>
 ))}
 </select>
 {errors.location && <span className="text-red-500">This field is required</span>}
 </div>
 <div className="modal-action">
 <button type="submit" className="btn btn-primary">{editingItem ? 'Update' : 'Add'}</button>
 <button type="button" className="btn" onClick={handleCloseAddModal}>Cancel</button>
 </div>
 </form>
 </div>
 </div>
 )}
 
 {/* Add Transaction Modal */}
 {showTransactionModal && (
 <div className="modal modal-open">
 <div className="modal-box">
 <button onClick={handleCloseTransactionModal} className="btn btn-sm btn-circle absolute right-2 top-2">
 ✕
 </button>
 <h3 className="font-bold text-lg">Add {selectedTransaction === 'incoming' ? 'Incoming' : 'Outgoing'} Transaction</h3>
 <form onSubmit={transactionForm.handleSubmit(onSubmitTransaction)}>
 <div className="form-control">
 <label className="label">Item</label>
 <select className="select select-bordered" {...transactionForm.register('itemId', { required: true })} value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
 <option value="">Select an item</option>
 {inventory.map(item => (
 <option key={item.id} value={item.id}>{item.name}</option>
 ))}
 </select>
 {transactionForm.formState.errors.itemId && <span className="text-red-500">This field is required</span>}
 </div>
 <div className="form-control">
 <label className="label">Quantity</label>
 <input type="number" placeholder="Quantity" className="input input-bordered" {...transactionForm.register('quantity', { required: true, valueAsNumber: true })} />
 {transactionForm.formState.errors.quantity && <span className="text-red-500">This field is required</span>}
 </div>
 <input type="hidden" {...transactionForm.register('type')} value={selectedTransaction} />
 <div className="form-control">
 <label className="label">Handled By</label>
 <input type="text" placeholder="Handled By" className="input input-bordered" {...transactionForm.register('handledBy', { required: true })} />
 {transactionForm.formState.errors.handledBy && <span className="text-red-500">This field is required</span>}
 </div>
 <div className="form-control">
 <label className="label">Notes</label>
 <textarea className="textarea textarea-bordered" placeholder="Notes" {...transactionForm.register('notes')}></textarea>
 </div>
 <div className="modal-action">
 <button type="submit" className="btn btn-primary">Add Transaction</button>
 <button type="button" className="btn" onClick={handleCloseTransactionModal}>Cancel</button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 </div>
 );
};

export default App;