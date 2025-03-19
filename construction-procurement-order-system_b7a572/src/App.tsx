import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowDownUp,
  Filter,
  Sun,
  Moon,
  X,
  Check,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

type OrderStatus = 'pending' | 'approved' | 'rejected' | 'delivered' | 'completed';
type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';

interface Item {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  category: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

interface ProcurementOrder {
  id: string;
  orderNumber: string;
  projectName: string;
  projectCode: string;
  requestDate: Date;
  requiredByDate: Date;
  status: OrderStatus;
  priority: OrderPriority;
  items: Item[];
  supplier: Supplier;
  totalAmount: number;
  notes: string;
  approver?: string;
  approvalDate?: Date;
}

const App: React.FC = () => {
  // State declarations
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [orders, setOrders] = useState<ProcurementOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<ProcurementOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<OrderPriority | 'all'>('all');
  const [sortField, setSortField] = useState<keyof ProcurementOrder>('requestDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedOrder, setSelectedOrder] = useState<ProcurementOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('view');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<'all' | 'details'>('all');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  // Form handling
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<ProcurementOrder>();

  // Initial data load simulation
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    document.documentElement.classList.toggle('dark', savedMode);

    // Generate mock data
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'ABC Construction Supplies',
        contactPerson: 'John Doe',
        email: 'john@abcsupplies.com',
        phone: '555-123-4567'
      },
      {
        id: '2',
        name: 'BuildRight Materials',
        contactPerson: 'Jane Smith',
        email: 'jsmith@buildright.com',
        phone: '555-987-6543'
      },
      {
        id: '3',
        name: 'Quality Hardware Co.',
        contactPerson: 'Robert Johnson',
        email: 'rjohnson@qualityhardware.com',
        phone: '555-567-8901'
      }
    ];

    const mockItems: Item[] = [
      {
        id: '1',
        name: 'Portland Cement',
        description: 'Standard construction grade cement, 50kg bag',
        quantity: 100,
        unitPrice: 12.50,
        unit: 'bag',
        category: 'Building Materials'
      },
      {
        id: '2',
        name: 'Rebar 10mm',
        description: 'Reinforcing steel bar, 10mm diameter, 12m length',
        quantity: 200,
        unitPrice: 15.75,
        unit: 'piece',
        category: 'Steel'
      },
      {
        id: '3',
        name: 'Concrete Blocks 8"',
        description: 'Standard concrete hollow blocks, 8 inches',
        quantity: 1000,
        unitPrice: 2.25,
        unit: 'piece',
        category: 'Building Materials'
      },
      {
        id: '4',
        name: 'Timber 2x4',
        description: 'Treated timber, 2x4 inches, 16ft length',
        quantity: 150,
        unitPrice: 8.50,
        unit: 'piece',
        category: 'Wood'
      },
      {
        id: '5',
        name: 'PVC Pipe 4"',
        description: 'Standard PVC pipe, 4 inch diameter, 6m length',
        quantity: 50,
        unitPrice: 18.30,
        unit: 'piece',
        category: 'Plumbing'
      }
    ];

    const statusOptions: OrderStatus[] = ['pending', 'approved', 'rejected', 'delivered', 'completed'];
    const priorityOptions: OrderPriority[] = ['low', 'medium', 'high', 'urgent'];

    const mockOrders: ProcurementOrder[] = [];

    // Generate 12 orders with different dates and statuses
    for (let i = 1; i <= 12; i++) {
      const randomStatus = statusOptions[Math.floor(Math.random() * statusOptions.length)];
      const randomPriority = priorityOptions[Math.floor(Math.random() * priorityOptions.length)];
      const randomSupplier = mockSuppliers[Math.floor(Math.random() * mockSuppliers.length)];
      
      // Generate between 1 and 3 random items per order
      const orderItems: Item[] = [];
      const numItems = Math.floor(Math.random() * 3) + 1;
      let totalAmount = 0;
      
      for (let j = 0; j < numItems; j++) {
        const randomItem = {...mockItems[Math.floor(Math.random() * mockItems.length)]};
        randomItem.id = `${i}-${j}`; // Ensure unique ID per order
        orderItems.push(randomItem);
        totalAmount += randomItem.quantity * randomItem.unitPrice;
      }

      // Generate dates (request date is in the past, required date is in the future)
      const today = new Date();
      const requestDate = new Date(today);
      requestDate.setDate(today.getDate() - Math.floor(Math.random() * 30)); // 0-30 days ago
      
      const requiredByDate = new Date(today);
      requiredByDate.setDate(today.getDate() + Math.floor(Math.random() * 60) + 15); // 15-75 days in the future
      
      const order: ProcurementOrder = {
        id: `order-${i}`,
        orderNumber: `PO-${new Date().getFullYear()}-${1000 + i}`,
        projectName: `Construction Project ${String.fromCharCode(64 + i)}`,
        projectCode: `CP-${new Date().getFullYear()}-${i}`,
        requestDate,
        requiredByDate,
        status: randomStatus,
        priority: randomPriority,
        items: orderItems,
        supplier: randomSupplier,
        totalAmount,
        notes: `Notes for order ${i}. Additional details about this procurement request.`,
      };
      
      // Add approval info for approved/rejected/completed orders
      if (['approved', 'rejected', 'completed', 'delivered'].includes(randomStatus)) {
        order.approver = 'Alex Johnson';
        const approvalDate = new Date(requestDate);
        approvalDate.setDate(requestDate.getDate() + Math.floor(Math.random() * 5) + 1); // 1-5 days after request
        order.approvalDate = approvalDate;
      }
      
      mockOrders.push(order);
    }

    setOrders(mockOrders);
    setFilteredOrders(mockOrders);
    setLoading(false);
  }, []);

  // Filter and sort whenever relevant states change
  useEffect(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(
        order =>
          order.orderNumber.toLowerCase().includes(lowerSearchTerm) ||
          order.projectName.toLowerCase().includes(lowerSearchTerm) ||
          order.supplier.name.toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(order => order.priority === priorityFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date comparisons
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }

      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }

      // Handle number comparisons
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }

      return 0;
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter, priorityFilter, sortField, sortDirection]);

  // Clear form when modal mode changes
  useEffect(() => {
    if (modalMode === 'add') {
      reset({
        id: `order-${Date.now()}`,
        orderNumber: `PO-${new Date().getFullYear()}-${1000 + orders.length + 1}`,
        projectName: '',
        projectCode: '',
        requestDate: new Date(),
        requiredByDate: new Date(),
        status: 'pending',
        priority: 'medium',
        items: [],
        supplier: {
          id: '',
          name: '',
          contactPerson: '',
          email: '',
          phone: ''
        },
        totalAmount: 0,
        notes: '',
      } as any);
    } else if (modalMode === 'edit' && selectedOrder) {
      // Convert dates to strings for form inputs
      const formData = {
        ...selectedOrder,
        requestDate: format(selectedOrder.requestDate, 'yyyy-MM-dd'),
        requiredByDate: format(selectedOrder.requiredByDate, 'yyyy-MM-dd'),
        approvalDate: selectedOrder.approvalDate ? format(selectedOrder.approvalDate, 'yyyy-MM-dd') : undefined
      };
      
      // Set form values
      Object.entries(formData).forEach(([key, value]) => {
        setValue(key as any, value);
      });
    }
  }, [modalMode, selectedOrder, reset, setValue, orders]);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Handle order operations
  const handleAddOrder = (data: ProcurementOrder) => {
    // Convert string dates back to Date objects
    const newOrder = {
      ...data,
      requestDate: new Date(data.requestDate),
      requiredByDate: new Date(data.requiredByDate),
      approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined
    };
    
    setOrders([...orders, newOrder]);
    setIsModalOpen(false);
  };

  const handleUpdateOrder = (data: ProcurementOrder) => {
    // Convert string dates back to Date objects
    const updatedOrder = {
      ...data,
      requestDate: new Date(data.requestDate),
      requiredByDate: new Date(data.requiredByDate),
      approvalDate: data.approvalDate ? new Date(data.approvalDate) : undefined
    };
    
    setOrders(orders.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
    setIsModalOpen(false);
  };

  const handleDeleteOrder = () => {
    if (orderToDelete) {
      setOrders(orders.filter(order => order.id !== orderToDelete));
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedOrder(null);
    setIsModalOpen(true);
  };

  const openEditModal = (order: ProcurementOrder) => {
    setModalMode('edit');
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const openViewModal = (order: ProcurementOrder) => {
    setModalMode('view');
    setSelectedOrder(order);
    setCurrentTab('all');
    setIsModalOpen(true);
  };

  const openDeleteModal = (orderId: string) => {
    setOrderToDelete(orderId);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Toggle sort direction or change sort field
  const handleSort = (field: keyof ProcurementOrder) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status badge class based on status
  const getStatusBadgeClass = (status: OrderStatus): string => {
    switch (status) {
      case 'pending': return 'badge badge-warning';
      case 'approved': return 'badge badge-success';
      case 'rejected': return 'badge badge-error';
      case 'delivered': return 'badge badge-info';
      case 'completed': return 'badge badge-success';
      default: return 'badge';
    }
  };

  // Get priority badge class based on priority
  const getPriorityBadgeClass = (priority: OrderPriority): string => {
    switch (priority) {
      case 'low': return 'badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'medium': return 'badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'high': return 'badge bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'urgent': return 'badge bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'badge';
    }
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate total for orders
  const calculateTotal = (items: Item[]): number => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // Handle item expansion in order details
  const toggleExpandItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container-fluid py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Procurement Order Management
          </h1>
          <div className="flex items-center mt-4 sm:mt-0 space-x-4">
            <button 
              className="theme-toggle flex items-center" 
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-blue-800" />
              )}
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Toolbar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input pl-10 w-full"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search orders"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {/* Status Filter */}
              <div className="form-group mb-0 w-full sm:w-auto">
                <select
                  className="input"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                  aria-label="Filter by status"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              {/* Priority Filter */}
              <div className="form-group mb-0 w-full sm:w-auto">
                <select
                  className="input"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as OrderPriority | 'all')}
                  aria-label="Filter by priority"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              {/* Add Order Button */}
              <button 
                className="btn btn-primary flex items-center justify-center w-full sm:w-auto" 
                onClick={openAddModal}
                aria-label="Add new order"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Order
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          {loading ? (
            <div className="p-6 text-center">
              <div className="space-y-3 max-w-2xl mx-auto">
                <div className="skeleton-text w-1/2 mx-auto"></div>
                <div className="skeleton-text w-full"></div>
                <div className="skeleton-text w-2/3 mx-auto"></div>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No orders found matching your criteria. Try adjusting your filters or add a new order.
              </p>
              <button 
                className="btn btn-primary mt-4" 
                onClick={openAddModal}
                aria-label="Add first order"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Order
              </button>
            </div>
          ) : (
            <div className="table-container overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('orderNumber')} aria-label="Sort by order number">
                      <div className="flex items-center justify-between">
                        <span>Order #</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('projectName')} aria-label="Sort by project name">
                      <div className="flex items-center justify-between">
                        <span>Project</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('supplier.name')} aria-label="Sort by supplier">
                      <div className="flex items-center justify-between">
                        <span>Supplier</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('requestDate')} aria-label="Sort by request date">
                      <div className="flex items-center justify-between">
                        <span>Request Date</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('requiredByDate')} aria-label="Sort by required date">
                      <div className="flex items-center justify-between">
                        <span>Required By</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('status')} aria-label="Sort by status">
                      <div className="flex items-center justify-between">
                        <span>Status</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('priority')} aria-label="Sort by priority">
                      <div className="flex items-center justify-between">
                        <span>Priority</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header cursor-pointer" onClick={() => handleSort('totalAmount')} aria-label="Sort by amount">
                      <div className="flex items-center justify-between">
                        <span>Amount</span>
                        <ArrowDownUp className="h-4 w-4" />
                      </div>
                    </th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 theme-transition">
                      <td className="table-cell">
                        <span className="font-medium text-primary-600 dark:text-primary-400">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">{order.projectName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.projectCode}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div>
                          <div className="font-medium">{order.supplier.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{order.supplier.contactPerson}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        {format(order.requestDate, 'MMM dd, yyyy')}
                      </td>
                      <td className="table-cell">
                        {format(order.requiredByDate, 'MMM dd, yyyy')}
                      </td>
                      <td className="table-cell">
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={getPriorityBadgeClass(order.priority)}>
                          {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                        </span>
                      </td>
                      <td className="table-cell">
                        {formatCurrency(order.totalAmount)}
                      </td>
                      <td className="table-cell text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            className="btn btn-sm bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                            onClick={() => openViewModal(order)}
                            aria-label={`View order ${order.orderNumber}`}
                          >
                            View
                          </button>
                          <button
                            className="btn btn-sm bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                            onClick={() => openEditModal(order)}
                            aria-label={`Edit order ${order.orderNumber}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                            onClick={() => openDeleteModal(order.id)}
                            aria-label={`Delete order ${order.orderNumber}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="stat-card bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="stat-title text-gray-500 dark:text-gray-400">Total Orders</div>
            <div className="stat-value text-primary-600 dark:text-primary-400">{orders.length}</div>
            <div className="stat-desc text-gray-500 dark:text-gray-400">
              {filteredOrders.length} orders visible with current filters
            </div>
          </div>
          
          <div className="stat-card bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="stat-title text-gray-500 dark:text-gray-400">Pending Approval</div>
            <div className="stat-value text-yellow-600 dark:text-yellow-400">
              {orders.filter(order => order.status === 'pending').length}
            </div>
            <div className="stat-desc text-gray-500 dark:text-gray-400">
              Orders awaiting approval
            </div>
          </div>
          
          <div className="stat-card bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="stat-title text-gray-500 dark:text-gray-400">Urgent Orders</div>
            <div className="stat-value text-red-600 dark:text-red-400">
              {orders.filter(order => order.priority === 'urgent').length}
            </div>
            <div className="stat-desc text-gray-500 dark:text-gray-400">
              High priority procurement requests
            </div>
          </div>
          
          <div className="stat-card bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="stat-title text-gray-500 dark:text-gray-400">Total Value</div>
            <div className="stat-value text-green-600 dark:text-green-400">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </div>
            <div className="stat-desc text-gray-500 dark:text-gray-400">
              Combined value of all orders
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-4xl">
            <div className="modal-header">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Add New Order' : 
                 modalMode === 'edit' ? 'Edit Order' : 
                 `Order Details: ${selectedOrder?.orderNumber}`}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-100"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mt-4">
              {modalMode === 'view' && selectedOrder && (
                <div>
                  {/* View Mode Tabs */}
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <ul className="flex flex-wrap -mb-px">
                      <li className="mr-2">
                        <button
                          className={`inline-block p-4 ${currentTab === 'all' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                          onClick={() => setCurrentTab('all')}
                          aria-label="Show overview tab"
                        >
                          Overview
                        </button>
                      </li>
                      <li className="mr-2">
                        <button
                          className={`inline-block p-4 ${currentTab === 'details' ? 'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                          onClick={() => setCurrentTab('details')}
                          aria-label="Show details tab"
                        >
                          Items Detail
                        </button>
                      </li>
                    </ul>
                  </div>

                  {currentTab === 'all' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Order Number</h4>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.orderNumber}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Project</h4>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.projectName}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.projectCode}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Dates</h4>
                          <div className="flex flex-col sm:flex-row sm:gap-4">
                            <p>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Requested:</span>
                              <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                {format(selectedOrder.requestDate, 'MMM dd, yyyy')}
                              </span>
                            </p>
                            <p>
                              <span className="text-sm text-gray-500 dark:text-gray-400">Required By:</span>
                              <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                {format(selectedOrder.requiredByDate, 'MMM dd, yyyy')}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h4>
                          <div className="flex items-center mt-1">
                            <span className={getStatusBadgeClass(selectedOrder.status)}>
                              {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                            </span>
                            <span className="ml-2">
                              <span className={getPriorityBadgeClass(selectedOrder.priority)}>
                                {selectedOrder.priority.charAt(0).toUpperCase() + selectedOrder.priority.slice(1)} Priority
                              </span>
                            </span>
                          </div>
                        </div>
                        {selectedOrder.approver && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval</h4>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {selectedOrder.approver}
                              {selectedOrder.approvalDate && (
                                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                                  ({format(selectedOrder.approvalDate, 'MMM dd, yyyy')})
                                </span>
                              )}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Supplier</h4>
                          <p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.supplier.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{selectedOrder.supplier.contactPerson}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.supplier.email}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.supplier.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</h4>
                          <p className="font-semibold text-lg text-gray-900 dark:text-white">
                            {formatCurrency(selectedOrder.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedOrder.items.length} {selectedOrder.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</h4>
                          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{selectedOrder.notes || 'No notes provided'}</p>
                        </div>
                      </div>

                      {/* Summary of items */}
                      <div className="col-span-1 md:col-span-2 mt-4">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Items Summary</h4>
                        <div className="table-container overflow-x-auto border rounded-lg">
                          <table className="table w-full text-sm">
                            <thead>
                              <tr>
                                <th className="table-header">Item</th>
                                <th className="table-header">Quantity</th>
                                <th className="table-header">Unit Price</th>
                                <th className="table-header text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                              {selectedOrder.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="table-cell">
                                    <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                    <p className="text-gray-500 dark:text-gray-400 text-xs">{item.category}</p>
                                  </td>
                                  <td className="table-cell">
                                    {item.quantity} {item.unit}
                                  </td>
                                  <td className="table-cell">{formatCurrency(item.unitPrice)}</td>
                                  <td className="table-cell text-right font-medium">
                                    {formatCurrency(item.quantity * item.unitPrice)}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-gray-50 dark:bg-gray-700">
                                <td colSpan={3} className="table-cell text-right font-medium">
                                  Total:
                                </td>
                                <td className="table-cell text-right font-bold">
                                  {formatCurrency(selectedOrder.totalAmount)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Order Items</h3>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="card dark:bg-gray-750">
                            <div 
                              className="flex justify-between items-center cursor-pointer"
                              onClick={() => toggleExpandItem(item.id)}
                            >
                              <div className="flex items-center space-x-2">
                                {expandedItem === item.id ? 
                                  <ChevronDown className="h-5 w-5 text-gray-400" /> : 
                                  <ChevronRight className="h-5 w-5 text-gray-400" />
                                }
                                <div>
                                  <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {item.quantity} {item.unit} × {formatCurrency(item.unitPrice)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatCurrency(item.quantity * item.unitPrice)}
                                </p>
                                <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            
                            {expandedItem === item.id && (
                              <div className="mt-4 pl-7 border-t pt-4 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300 mb-3">{item.description}</p>
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                  <div>
                                    <dt className="text-gray-500 dark:text-gray-400">Quantity</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">{item.quantity} {item.unit}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-gray-500 dark:text-gray-400">Unit Price</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.unitPrice)}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-gray-500 dark:text-gray-400">Category</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">{item.category}</dd>
                                  </div>
                                  <div>
                                    <dt className="text-gray-500 dark:text-gray-400">Total</dt>
                                    <dd className="font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(item.quantity * item.unitPrice)}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="stat-card mt-4 flex justify-between items-center">
                        <div>
                          <div className="stat-title text-gray-500 dark:text-gray-400">Total Items</div>
                          <div className="stat-value text-gray-900 dark:text-white">{selectedOrder.items.length}</div>
                        </div>
                        <div className="text-right">
                          <div className="stat-title text-gray-500 dark:text-gray-400">Order Total</div>
                          <div className="stat-value text-gray-900 dark:text-white">
                            {formatCurrency(selectedOrder.totalAmount)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(modalMode === 'add' || modalMode === 'edit') && (
                <form onSubmit={handleSubmit(modalMode === 'add' ? handleAddOrder : handleUpdateOrder)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Order Information */}
                    <div className="col-span-1 md:col-span-2">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Order Information</h4>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="orderNumber">Order Number</label>
                      <input
                        id="orderNumber"
                        type="text"
                        className="input"
                        readOnly={modalMode === 'edit'}
                        aria-label="Order number"
                        {...register('orderNumber', { required: 'Order number is required' })}
                      />
                      {errors.orderNumber && (
                        <p className="form-error">{errors.orderNumber.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="projectCode">Project Code</label>
                      <input
                        id="projectCode"
                        type="text"
                        className="input"
                        aria-label="Project code"
                        {...register('projectCode', { required: 'Project code is required' })}
                      />
                      {errors.projectCode && (
                        <p className="form-error">{errors.projectCode.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="projectName">Project Name</label>
                      <input
                        id="projectName"
                        type="text"
                        className="input"
                        aria-label="Project name"
                        {...register('projectName', { required: 'Project name is required' })}
                      />
                      {errors.projectName && (
                        <p className="form-error">{errors.projectName.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="status">Status</label>
                      <select
                        id="status"
                        className="input"
                        aria-label="Order status"
                        {...register('status')}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="delivered">Delivered</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="requestDate">Request Date</label>
                      <input
                        id="requestDate"
                        type="date"
                        className="input"
                        aria-label="Request date"
                        {...register('requestDate', { required: 'Request date is required' })}
                      />
                      {errors.requestDate && (
                        <p className="form-error">{errors.requestDate.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="requiredByDate">Required By Date</label>
                      <input
                        id="requiredByDate"
                        type="date"
                        className="input"
                        aria-label="Required by date"
                        {...register('requiredByDate', { required: 'Required by date is required' })}
                      />
                      {errors.requiredByDate && (
                        <p className="form-error">{errors.requiredByDate.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="priority">Priority</label>
                      <select
                        id="priority"
                        className="input"
                        aria-label="Order priority"
                        {...register('priority')}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    
                    {/* Supplier Information */}
                    <div className="col-span-1 md:col-span-2 mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supplier Information</h4>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="supplier.name">Supplier Name</label>
                      <input
                        id="supplier.name"
                        type="text"
                        className="input"
                        aria-label="Supplier name"
                        {...register('supplier.name', { required: 'Supplier name is required' })}
                      />
                      {errors.supplier?.name && (
                        <p className="form-error">{errors.supplier.name.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="supplier.contactPerson">Contact Person</label>
                      <input
                        id="supplier.contactPerson"
                        type="text"
                        className="input"
                        aria-label="Contact person"
                        {...register('supplier.contactPerson')}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="supplier.email">Email</label>
                      <input
                        id="supplier.email"
                        type="email"
                        className="input"
                        aria-label="Supplier email"
                        {...register('supplier.email', {
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                      {errors.supplier?.email && (
                        <p className="form-error">{errors.supplier.email.message}</p>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label" htmlFor="supplier.phone">Phone</label>
                      <input
                        id="supplier.phone"
                        type="text"
                        className="input"
                        aria-label="Supplier phone"
                        {...register('supplier.phone')}
                      />
                    </div>
                    
                    {/* Notes */}
                    <div className="col-span-1 md:col-span-2 mt-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="notes">Notes</label>
                        <textarea
                          id="notes"
                          className="input min-h-[100px]"
                          aria-label="Order notes"
                          {...register('notes')}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      onClick={closeModal}
                      aria-label="Cancel"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      aria-label={modalMode === 'add' ? 'Add order' : 'Update order'}
                    >
                      {modalMode === 'add' ? 'Add Order' : 'Update Order'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-md">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-gray-200 dark:hover:text-gray-100"
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label="Close delete modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this order? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                className="btn bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                onClick={handleDeleteOrder}
                aria-label="Confirm deletion"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner mt-8">
        <div className="container-fluid py-4 text-center text-gray-600 dark:text-gray-400 text-sm">
          Copyright &copy; 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;
