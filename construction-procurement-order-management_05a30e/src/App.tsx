import React, { useState, useEffect } from 'react';
import './styles/styles.module.css';

interface Order {
 id: string;
 item: string;
 quantity: number;
 supplier: string;
 status: 'Pending' | 'Approved' | 'Rejected' | 'Shipped';
 deliveryDate?: string; // Optional, as it might not be set initially
}

const App: React.FC = () => {
 const [orders, setOrders] = useState<Order[]>([]);
 const [loading, setLoading] = useState<boolean>(true);
 const [error, setError] = useState<string | null>(null);
 const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
 const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
 const [filterStatus, setFilterStatus] = useState<string>('All');
  const [sortKey, setSortKey] = useState<keyof Order | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

 useEffect(() => {
 const savedMode = localStorage.getItem('darkMode');
 const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
 setIsDarkMode(savedMode === 'true' || (savedMode === null && prefersDark));
 }, []);

 useEffect(() => {
 document.documentElement.classList.toggle('dark', isDarkMode);
 localStorage.setItem('darkMode', String(isDarkMode));
 }, [isDarkMode]);

 useEffect(() => {
 const initialOrders: Order[] = [
 { id: '1', item: 'Cement', quantity: 100, supplier: 'Supplier A', status: 'Pending' },
 { id: '2', item: 'Steel Rods', quantity: 500, supplier: 'Supplier B', status: 'Approved', deliveryDate: '2024-05-15' },
 { id: '3', item: 'Bricks', quantity: 1000, supplier: 'Supplier C', status: 'Rejected' },
 { id: '4', item: 'Sand', quantity: 200, supplier: 'Supplier A', status: 'Shipped', deliveryDate: '2024-05-10' },
 ];

 setTimeout(() => {
 setOrders(initialOrders);
 setLoading(false);
 }, 500);
 }, []);

 const toggleDarkMode = () => {
 setIsDarkMode(!isDarkMode);
 };

 const handleAddOrder = (newOrder: Omit<Order, 'id'>) => {
 const id = String(orders.length + 1);
 setOrders([...orders, { ...newOrder, id }]);
 setIsAddModalOpen(false);
 };

  const handleEditOrder = (updatedOrder: Order) => {
    setOrders(orders.map(order => order.id === updatedOrder.id ? updatedOrder : order));
    setIsEditModalOpen(false);
    setCurrentOrder(null);
  };

 const handleDeleteOrder = (id: string) => {
 setOrders(orders.filter((order) => order.id !== id));
 };

  const handleOpenEditModal = (order: Order) => {
    setCurrentOrder(order);
    setIsEditModalOpen(true);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status);
  };

  const handleSort = (key: keyof Order) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const filteredOrders = orders.filter(order => {
    const itemMatch = order.item.toLowerCase().includes(searchTerm.toLowerCase());
    const supplierMatch = order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filterStatus === 'All' || order.status === filterStatus;
    return (itemMatch || supplierMatch) && statusMatch;
  });

  const sortedOrders = sortKey ? [...filteredOrders].sort((a, b) => {
    constaVal = a[sortKey];
    constbVal = b[sortKey];

    if (aVal === undefined || bVal === undefined) return 0;

    let comparison = 0;
 if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  }) : filteredOrders;


 return (
 <div className="bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 min-h-screen">
 <div className="container-fluid p-4 sm:p-6 md:p-8">

 <div className="flex items-center justify-between mb-6">
 <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">Procurement Orders</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm dark:text-slate-300">Light</span>
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <span className="theme-toggle-thumb"></span>
            <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
          </button>
          <span className="text-sm dark:text-slate-300">Dark</span>
        </div>
 </div>

 <div className="flex flex-col sm:flex-row gap-4 mb-4">
 <input
 type="text"
 placeholder="Search by item or supplier..."
 className="input w-full sm:w-auto"
 onChange={handleSearch}
 role="searchbox"
 name="searchInput"
 />
          <select
            className="input w-full sm:w-auto"
            onChange={(e) => handleFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Shipped">Shipped</option>
          </select>
 <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)} role="button" name="addOrderButton">
 Add Order
 </button>
 </div>

 {loading ? (
 <div className="flex justify-center items-center h-64">
 <div className="skeleton-text w-1/2"></div>
 </div>
 ) : error ? (
 <div className="alert alert-error">
 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
 </svg>
 <p>{error}</p>
 </div>
 ) : (
 <div className="table-container">
 <table className="table">
 <thead className="bg-gray-50 dark:bg-gray-700">
 <tr>
 <th className="table-header cursor-pointer" onClick={() => handleSort('item')}>Item</th>
 <th className="table-header cursor-pointer" onClick={() => handleSort('quantity')}>Quantity</th>
 <th className="table-header cursor-pointer" onClick={() => handleSort('supplier')}>Supplier</th>
 <th className="table-header cursor-pointer" onClick={() => handleSort('status')}>Status</th>
 <th className="table-header cursor-pointer" onClick={() => handleSort('deliveryDate')}>Delivery Date</th>
 <th className="table-header">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {sortedOrders.map((order) => (
 <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
 <td className="table-cell">{order.item}</td>
 <td className="table-cell">{order.quantity}</td>
 <td className="table-cell">{order.supplier}</td>
 <td className="table-cell">
 <span className={`badge ${order.status === 'Approved' ? 'badge-success' : order.status === 'Rejected' ? 'badge-error' : order.status === 'Shipped' ? 'badge-info' : 'badge-warning'}`}>
 {order.status}
 </span>
 </td>
 <td className="table-cell">{order.deliveryDate || 'N/A'}</td>
 <td className="table-cell">
 <button className="btn btn-sm btn-primary mr-2" onClick={() => handleOpenEditModal(order)} role="button" name={`editOrderButton-${order.id}`}>Edit</button>
 <button className="btn btn-sm bg-red-500 text-white hover:bg-red-600" onClick={() => handleDeleteOrder(order.id)} role="button" name={`deleteOrderButton-${order.id}`}>Delete</button>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {isAddModalOpen && (
 <div className="modal-backdrop">
 <div className="modal-content">
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Order</h3>
 <button className="text-gray-400 hover:text-gray-500" onClick={() => setIsAddModalOpen(false)}>&times;</button>
 </div>
 <div className="mt-2 space-y-4">
 <div className="form-group">
 <label className="form-label" htmlFor="item">Item</label>
 <input id="item" type="text" className="input" onChange={(e) => setCurrentOrder({ ...currentOrder || {} as Order, item: e.target.value })} />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="quantity">Quantity</label>
 <input id="quantity" type="number" className="input" onChange={(e) => setCurrentOrder({ ...currentOrder || {} as Order, quantity: parseInt(e.target.value, 10) })} />
 </div>
 <div className="form-group">
 <label className="form-label" htmlFor="supplier">Supplier</label>
 <input id="supplier" type="text" className="input" onChange={(e) => setCurrentOrder({ ...currentOrder || {} as Order, supplier: e.target.value })} />
 </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    onChange={(e) => setCurrentOrder({ ...currentOrder || {} as Order, status: e.target.value as 'Pending' | 'Approved' | 'Rejected' | 'Shipped' })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Shipped">Shipped</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="deliveryDate">Delivery Date</label>
                  <input id="deliveryDate" type="date" className="input" onChange={(e) => setCurrentOrder({ ...currentOrder || {} as Order, deliveryDate: e.target.value })} />
                </div>
 </div>
 <div className="modal-footer">
 <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
 <button className="btn btn-primary" onClick={() => currentOrder && handleAddOrder(currentOrder)}>Confirm</button>
 </div>
 </div>
 </div>
 )}

        {isEditModalOpen && currentOrder && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Edit Order</h3>
                <button className="text-gray-400 hover:text-gray-500" onClick={() => { setIsEditModalOpen(false); setCurrentOrder(null); }}>&times;</button>
              </div>
              <div className="mt-2 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-item">Item</label>
                  <input id="edit-item" type="text" className="input" value={currentOrder.item} onChange={(e) => setCurrentOrder({ ...currentOrder, item: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-quantity">Quantity</label>
                  <input id="edit-quantity" type="number" className="input" value={currentOrder.quantity} onChange={(e) => setCurrentOrder({ ...currentOrder, quantity: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-supplier">Supplier</label>
                  <input id="edit-supplier" type="text" className="input" value={currentOrder.supplier} onChange={(e) => setCurrentOrder({ ...currentOrder, supplier: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    className="input"
                    value={currentOrder.status}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value as 'Pending' | 'Approved' | 'Rejected' | 'Shipped' })}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Shipped">Shipped</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-deliveryDate">Delivery Date</label>
                  <input id="edit-deliveryDate" type="date" className="input" value={currentOrder.deliveryDate || ''} onChange={(e) => setCurrentOrder({ ...currentOrder, deliveryDate: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => { setIsEditModalOpen(false); setCurrentOrder(null); }}>Cancel</button>
                <button className="btn btn-primary" onClick={() => currentOrder && handleEditOrder(currentOrder)}>Update</button>
              </div>
            </div>
          </div>
        )}

 </div>
      <footer className="text-center p-4 mt-8 border-t border-gray-200 dark:border-gray-700">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
 </div>
 );
};

export default App;
