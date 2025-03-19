import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Search, Filter, ArrowUpDown } from 'lucide-react';

// Define types and interfaces
interface ProcurementOrder {
  id: string;
  item: string;
  quantity: number;
  supplier: string;
  orderDate: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
}


const App: React.FC = () => {
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);


  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);

  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [supplier, setSupplier] = useState('');
  const [orderDate, setOrderDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<ProcurementOrder['status']>('Pending');

  // Search and Filter

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProcurementOrder['status'] | ''>('');



  // Dark mode toggle

    useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      const initialMode = savedMode === 'true' || (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(initialMode);

      if (initialMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('darkMode', 'true');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('darkMode', 'false');
        }
    }

  }, [isDarkMode]);

  // Initial dummy data load (mimicking initial fetch)
  useEffect(() => {
    setLoading(true);
    const dummyData: ProcurementOrder[] = [
      { id: '1', item: 'Cement', quantity: 100, supplier: 'ABC Suppliers', orderDate: '2024-01-15', status: 'Completed' },
      { id: '2', item: 'Steel Rods', quantity: 500, supplier: 'XYZ Corp', orderDate: '2024-02-20', status: 'Approved' },
      { id: '3', item: 'Bricks', quantity: 1000, supplier: 'Brick Makers Ltd', orderDate: '2024-03-10', status: 'Pending' },
      { id: '4', item: 'Sand', quantity: 200, supplier: 'Sand Suppliers', orderDate: '2024-06-24', status: 'Rejected' },
    ];
    setTimeout(() => {
      setOrders(dummyData);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddOrUpdateOrder = () => {
    if (!item || quantity <= 0 || !supplier || !orderDate) {
      setError('Please fill in all fields.');
      return;
    }

    const newOrder: ProcurementOrder = {
      id: editOrderId || String(Date.now()),
      item,
      quantity,
      supplier,
      orderDate,
      status,
    };

    if (editOrderId) {
      // Update existing order
      setOrders(orders.map((order) => (order.id === editOrderId ? newOrder : order)));
    } else {
      // Add new order
      setOrders([...orders, newOrder]);
    }

    // Reset form and close modal
    resetForm();
  };

  const handleEditOrder = (id: string) => {
    const orderToEdit = orders.find((order) => order.id === id);
    if (orderToEdit) {
      setItem(orderToEdit.item);
      setQuantity(orderToEdit.quantity);
      setSupplier(orderToEdit.supplier);
      setOrderDate(orderToEdit.orderDate);
      setStatus(orderToEdit.status);
      setEditOrderId(id);
      setIsModalOpen(true);
    }
  };

  const handleDeleteOrder = (id: string) => {
    setOrders(orders.filter((order) => order.id !== id));
  };

  const resetForm = () => {
    setItem('');
    setQuantity(1);
    setSupplier('');
    setOrderDate(format(new Date(), 'yyyy-MM-dd'));
    setStatus('Pending');
    setError(null);
    setIsModalOpen(false);
    setEditOrderId(null);
  };

    // Computed property for filtering orders
    const filteredOrders = orders.filter((order) => {
      const searchMatch = order.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus ? order.status === filterStatus : true;
      return searchMatch && statusMatch;
    });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100">
      <div className="container mx-auto px-4 py-8">
         <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Procurement Order Management</h1>

            <div className="flex items-center space-x-2">
                <span className="text-sm dark:text-slate-300">Light</span>
                <button 
                    className="theme-toggle relative w-10 h-5 inline-block" 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    role="switch"
                    name="themeToggle"
                >
                    <span className="absolute cursor-pointer inset-0 bg-gray-200 dark:bg-slate-700 rounded-full transition-colors duration-300 ease-in-out"></span>
                    <span className="theme-toggle-thumb absolute inset-y-0 left-0 w-5 h-5 bg-white dark:bg-slate-900 rounded-full shadow-md transform transition-transform duration-300 ease-in-out" style={{ transform: isDarkMode ? 'translateX(100%)' : 'translateX(0%)' }}></span>
                    <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                </button>
                <span className="text-sm dark:text-slate-300">Dark</span>
            </div>
          </div>
        
        {/* Add Order Button */}
        <div className="mb-6">
          <button className="btn btn-primary flex items-center gap-x-2" onClick={() => setIsModalOpen(true)} role="button" name="addOrder">
            <Plus size={16}/>Add Order
          </button>
        </div>

        {/* Search and Filter */}
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by item or supplier..."
                className="input pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                role="searchbox"
                name="searchInput"
                
              />
            </div>
              
              <div className='flex items-center gap-x-2'>
                <Filter size={16} />
                <select
                  className="input"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as ProcurementOrder['status'] | '')}
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
        </div>

        {/* Loading and Error states */}
        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="alert alert-error"><p>{error}</p></div>}

        {/* Order Table */}
        {!loading && (
          <div className="table-container overflow-x-auto">
            <table className="table min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Item</th>
                  <th className="table-header">Quantity</th>
                  <th className="table-header">Supplier</th>
                  <th className="table-header">Order Date</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <td className="table-cell">{order.item}</td>
                    <td className="table-cell">{order.quantity}</td>
                    <td className="table-cell">{order.supplier}</td>
                    <td className="table-cell">{order.orderDate}</td>
                    <td className="table-cell">
                      <span className={`badge ${order.status === 'Completed' ? 'badge-success' :
                        order.status === 'Pending' ? 'badge-warning' :
                        order.status === 'Approved' ? 'badge-info' : 'badge-error'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="table-cell">
                    <div className="flex items-center gap-x-1">
                      <button className="btn btn-sm btn-primary" onClick={() => handleEditOrder(order.id)} role="button" name={`editOrder${order.id}`}>
                        <Edit size={16} />
                      </button>
                      <button className="btn btn-sm bg-red-500 text-white hover:bg-red-600 transition-colors" onClick={() => handleDeleteOrder(order.id)} role="button" name={`deleteOrder${order.id}`}>
                        <Trash2 size={16} />
                      </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={6} className="text-center py-4">No orders found.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="modal-content bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 w-full md:w-1/2">
              <h2 className="text-lg font-semibold mb-4">{editOrderId ? 'Edit Order' : 'Add Order'}</h2>
              
                <div className="form-group">
                    <label className="form-label">Item</label>
                    <input type="text" className="input" value={item} onChange={(e) => setItem(e.target.value)}  role="textbox" name="item" />
                </div>
                <div className="form-group">
                    <label className="form-label">Quantity</label>
                    <input type="number" className="input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}  role="textbox" name="quantity"/>
                </div>
                <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <input type="text" className="input" value={supplier} onChange={(e) => setSupplier(e.target.value)}  role="textbox" name="supplier"/>
                </div>
                <div className="form-group">
                    <label className="form-label">Order Date</label>
                    <input type="date" className="input" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} role="textbox" name="orderDate"/>
                </div>

                <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="input" value={status} onChange={(e) => setStatus(e.target.value as ProcurementOrder['status'])}>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Completed">Completed</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

              <div className="mt-6 flex justify-end gap-x-4">
                <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600" onClick={resetForm} role="button" name="cancelOrder">Cancel</button>
                <button className="btn btn-primary" onClick={handleAddOrUpdateOrder} role="button" name="saveOrder">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="text-center text-sm py-4 mt-4 bg-gray-200 dark:bg-slate-900 dark:text-slate-400">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
