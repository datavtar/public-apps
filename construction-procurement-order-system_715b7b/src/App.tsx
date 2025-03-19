import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';
import { LucideIcon, ListOrdered, Plus, Pencil, Trash2, Search, X, Moon, Sun } from 'lucide-react';

// Define types and interfaces

interface OrderItem {
    id: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
}

enum OrderStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    PROCESSING = 'PROCESSING',
    SHIPPED = 'SHIPPED',
    DELIVERED = 'DELIVERED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

interface Order {
    id: string;
    orderNumber: string;
    orderDate: string;
    supplier: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
}

const initialOrders: Order[] = [
    {
        id: '1', orderNumber: 'PO-2025-001', orderDate: '2025-07-20', supplier: 'Supplier A', items: [
            { id: 'item-1-1', itemDescription: 'Cement', quantity: 50, unitPrice: 10 },
            { id: 'item-1-2', itemDescription: 'Bricks', quantity: 1000, unitPrice: 1 }
        ], totalAmount: 1500, status: OrderStatus.PENDING
    },
    {
        id: '2', orderNumber: 'PO-2025-002', orderDate: '2025-07-21', supplier: 'Supplier B', items: [
            { id: 'item-2-1', itemDescription: 'Steel Rods', quantity: 20, unitPrice: 50 },
            { id: 'item-2-2', itemDescription: 'Plywood', quantity: 100, unitPrice: 25 }
        ], totalAmount: 3500, status: OrderStatus.APPROVED
    },
    {
        id: '3', orderNumber: 'PO-2025-003', orderDate: '2025-07-22', supplier: 'Supplier C', items: [
            { id: 'item-3-1', itemDescription: 'Gravel', quantity: 30, unitPrice: 30 },
            { id: 'item-3-2', itemDescription: 'Sand', quantity: 60, unitPrice: 15 }
        ], totalAmount: 1800, status: OrderStatus.PROCESSING
    }
];

const App: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [isAddingOrder, setIsAddingOrder] = useState<boolean>(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [sortBy, setSortBy] = useState<'orderNumber' | 'orderDate' | 'supplier' | 'totalAmount'>('orderNumber');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('darkMode');
            return savedMode === 'true' ||
                (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDarkMode]);

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleAddOrder = () => {
        setIsAddingOrder(true);
        setEditingOrder(null);
    };

    const handleEditOrder = (order: Order) => {
        setEditingOrder(order);
        setIsAddingOrder(false);
    };

    const handleDeleteOrder = (orderId: string) => {
        setOrders(orders.filter(order => order.id !== orderId));
    };

    const handleSaveOrder = (newOrder: Order) => {
        if (editingOrder) {
            setOrders(orders.map(order => order.id === editingOrder.id ? newOrder : order));
            setEditingOrder(null);
        } else {
            setOrders([...orders, { ...newOrder, id: String(Date.now()) }]);
            setIsAddingOrder(false);
        }
    };

    const handleCancelOrderForm = () => {
        setIsAddingOrder(false);
        setEditingOrder(null);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleSort = (field: 'orderNumber' | 'orderDate' | 'supplier' | 'totalAmount') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const sortedOrders = [...orders].sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'orderNumber') {
            comparison = a.orderNumber.localeCompare(b.orderNumber);
        } else if (sortBy === 'orderDate') {
            comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
        } else if (sortBy === 'supplier') {
            comparison = a.supplier.localeCompare(b.supplier);
        } else if (sortBy === 'totalAmount') {
            comparison = a.totalAmount - b.totalAmount;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const filteredOrders = sortedOrders.filter(order => {
        const searchLower = searchQuery.toLowerCase();
        return (
            order.orderNumber.toLowerCase().includes(searchLower) ||
            order.supplier.toLowerCase().includes(searchLower) ||
            order.status.toLowerCase().includes(searchLower) ||
            order.items.some(item => item.itemDescription.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className="dark:bg-gray-900 dark:text-white transition-colors duration-300 min-h-screen flex flex-col">
            <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
                <div className="font-bold text-xl">Procurement Orders</div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Sun className="text-gray-500" size={16} />
                        <button
                            className="theme-toggle"
                            onClick={handleThemeToggle}
                            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            <span className={`theme-toggle-thumb ${isDarkMode ? 'dark' : ''}`}></span>
                            <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                        </button>
                        <Moon className="text-gray-500" size={16} />
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6 flex-grow">
                <div className="mb-4 flex justify-between items-center">
                    <button className="btn btn-primary" onClick={handleAddOrder} aria-label="Add New Order">
                        <Plus className="h-5 w-5 mr-2" />Add Order
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="search"
                            placeholder="Search orders..."
                            className="input pl-10" // Add pl-10 for padding-left to accommodate the search icon
                            value={searchQuery}
                            onChange={handleSearchChange}
                            aria-label="Search Orders"
                        />
                    </div>
                </div>

                {isAddingOrder || editingOrder ? (
                    <OrderForm
                        onSave={handleSaveOrder}
                        onCancel={handleCancelOrderForm}
                        editingOrder={editingOrder}
                    />
                ) : (
                    <OrderTable
                        orders={filteredOrders}
                        onEdit={handleEditOrder}
                        onDelete={handleDeleteOrder}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />
                )}
            </div>

            <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-center p-4">
                Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </footer>
        </div>
    );
};

interface OrderFormProps {
    onSave: (order: Order) => void;
    onCancel: () => void;
    editingOrder: Order | null;
}

const OrderForm: React.FC<OrderFormProps> = ({ onSave, onCancel, editingOrder }) => {
    const [orderNumber, setOrderNumber] = useState(editingOrder?.orderNumber || '');
    const [orderDate, setOrderDate] = useState(editingOrder?.orderDate || '');
    const [supplier, setSupplier] = useState(editingOrder?.supplier || '');
    const [items, setItems] = useState<OrderItem[]>(editingOrder?.items || [{
        id: String(Date.now()),
        itemDescription: '',
        quantity: 1, // default quantity to 1
        unitPrice: 0 // default unit price to 0
    }]);
    const [status, setStatus] = useState<OrderStatus>(editingOrder?.status || OrderStatus.PENDING);

    useEffect(() => {
        if (editingOrder) {
            setOrderNumber(editingOrder.orderNumber);
            setOrderDate(editingOrder.orderDate);
            setSupplier(editingOrder.supplier);
            setItems(editingOrder.items);
            setStatus(editingOrder.status);
        } else {
            setItems([{
                id: String(Date.now()),
                itemDescription: '',
                quantity: 1,
                unitPrice: 0
            }]);
        }
    }, [editingOrder]);

    const calculateTotalAmount = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const handleAddItem = () => {
        setItems([...items, {
            id: String(Date.now()),
            itemDescription: '',
            quantity: 1,
            unitPrice: 0
        }]);
    };

    const handleRemoveItem = (itemId: string) => {
        setItems(items.filter(item => item.id !== itemId));
    };

    const handleItemChange = (itemId: string, field: keyof OrderItem, value: any) => {
        setItems(items.map(item => item.id === itemId ? { ...item, [field]: value } : item));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const totalAmount = calculateTotalAmount();
        const newOrder: Order = {
            id: editingOrder?.id || String(Date.now()),
            orderNumber,
            orderDate,
            supplier,
            items,
            totalAmount,
            status,
        };
        onSave(newOrder);
    };

    return (
        <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{editingOrder ? 'Edit Order' : 'Add New Order'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="orderNumber" className="form-label">Order Number</label>
                    <input type="text" id="orderNumber" className="input" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required aria-required="true" />
                </div>
                <div className="form-group">
                    <label htmlFor="orderDate" className="form-label">Order Date</label>
                    <input type="date" id="orderDate" className="input" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} required aria-required="true" />
                </div>
                <div className="form-group">
                    <label htmlFor="supplier" className="form-label">Supplier</label>
                    <input type="text" id="supplier" className="input" value={supplier} onChange={(e) => setSupplier(e.target.value)} required aria-required="true" />
                </div>

                <h4 className="text-md font-semibold text-gray-900 dark:text-white mt-4">Items</h4>
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={item.id} className="flex space-x-2 items-center">
                            <div>{index + 1}.</div>
                            <div className="form-group flex-1">
                                <label htmlFor={`itemDescription-${index}`} className="form-label sr-only">Item Description</label>
                                <input
                                    type="text"
                                    id={`itemDescription-${index}`}
                                    className="input"
                                    placeholder="Item Description"
                                    value={item.itemDescription}
                                    onChange={(e) => handleItemChange(item.id, 'itemDescription', e.target.value)}
                                    required={index === 0} // Only first item description is mandatory
                                    aria-required={index === 0}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`quantity-${index}`} className="form-label sr-only">Quantity</label>
                                <input
                                    type="number"
                                    id={`quantity-${index}`}
                                    className="input w-24"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                                    min="1"
                                    required={index === 0} // Only first item quantity is mandatory
                                    aria-required={index === 0}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor={`unitPrice-${index}`} className="form-label sr-only">Unit Price</label>
                                <input
                                    type="number"
                                    id={`unitPrice-${index}`}
                                    className="input w-24"
                                    placeholder="Unit Price"
                                    value={item.unitPrice}
                                    onChange={(e) => handleItemChange(item.id, 'unitPrice', Number(e.target.value))}
                                    min="0"
                                    required={index === 0} // Only first item unit price is mandatory
                                    aria-required={index === 0}
                                />
                            </div>
                            {items.length > 1 && (
                                <button type="button" className="btn btn-error btn-sm" onClick={() => handleRemoveItem(item.id)} aria-label={`Remove item ${index + 1}`}>
                                    <X className="h-4 w-4"/>
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddItem} aria-label="Add item">
                        Add Item
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select
                        id="status"
                        className="input"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    >
                        {Object.values(OrderStatus).map((statusOption) => (
                            <option key={statusOption} value={statusOption}>{statusOption}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                    <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600" onClick={onCancel} aria-label="Cancel form">
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" aria-label="Save order">
                        Save Order
                    </button>
                </div>
            </form>
        </div>
    );
};

interface OrderTableProps {
    orders: Order[];
    onEdit: (order: Order) => void;
    onDelete: (orderId: string) => void;
    sortBy: 'orderNumber' | 'orderDate' | 'supplier' | 'totalAmount';
    sortOrder: 'asc' | 'desc';
    onSort: (field: 'orderNumber' | 'orderDate' | 'supplier' | 'totalAmount') => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ orders, onEdit, onDelete, sortBy, sortOrder, onSort }) => {
    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th className="table-header cursor-pointer" onClick={() => onSort('orderNumber')} aria-sort={sortBy === 'orderNumber' ? sortOrder : 'none'}>
                            Order Number <SortIcon active={sortBy === 'orderNumber'} sortOrder={sortOrder} />
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => onSort('orderDate')} aria-sort={sortBy === 'orderDate' ? sortOrder : 'none'}>
                            Order Date <SortIcon active={sortBy === 'orderDate'} sortOrder={sortOrder} />
                        </th>
                        <th className="table-header cursor-pointer" onClick={() => onSort('supplier')} aria-sort={sortBy === 'supplier' ? sortOrder : 'none'}>
                            Supplier <SortIcon active={sortBy === 'supplier'} sortOrder={sortOrder} />
                        </th>
                        <th className="table-header">Items</th>
                        <th className="table-header cursor-pointer" onClick={() => onSort('totalAmount')} aria-sort={sortBy === 'totalAmount' ? sortOrder : 'none'}>
                            Total Amount <SortIcon active={sortBy === 'totalAmount'} sortOrder={sortOrder} />
                        </th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {orders.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="table-cell text-center">No orders found.</td>
                        </tr>
                    ) : (
                        orders.map(order => (
                            <tr key={order.id}>
                                <td className="table-cell">{order.orderNumber}</td>
                                <td className="table-cell">{order.orderDate}</td>
                                <td className="table-cell">{order.supplier}</td>
                                <td className="table-cell">
                                    <ul className="list-disc list-inside">
                                        {order.items.map(item => (
                                            <li key={item.id}>{item.itemDescription} (Qty: {item.quantity})</li>
                                        ))}
                                    </ul>
                                </td>
                                <td className="table-cell">${order.totalAmount.toFixed(2)}</td>
                                <td className="table-cell">
                                    <Badge status={order.status} />
                                </td>
                                <td className="table-cell flex space-x-2">
                                    <button className="btn btn-sm btn-primary" onClick={() => onEdit(order)} aria-label={`Edit order ${order.orderNumber}`}>
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button className="btn btn-sm btn-error" onClick={() => onDelete(order.id)} aria-label={`Delete order ${order.orderNumber}`}>
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

interface BadgeProps {
    status: OrderStatus;
}

const Badge: React.FC<BadgeProps> = ({ status }) => {
    let badgeClassName = 'badge';
    switch (status) {
        case OrderStatus.PENDING:
            badgeClassName += ' badge-warning';
            break;
        case OrderStatus.APPROVED:
            badgeClassName += ' badge-success';
            break;
        case OrderStatus.REJECTED:
            badgeClassName += ' badge-error';
            break;
        case OrderStatus.PROCESSING:
            badgeClassName += ' badge-info';
            break;
        case OrderStatus.SHIPPED:
            badgeClassName += ' badge-info';
            break;
        case OrderStatus.DELIVERED:
            badgeClassName += ' badge-success';
            break;
        case OrderStatus.COMPLETED:
            badgeClassName += ' badge-success';
            break;
        case OrderStatus.CANCELLED:
            badgeClassName += ' badge-error';
            break;
        default:
            badgeClassName += ' badge-gray';
    }

    return <span className={badgeClassName}>{status}</span>;
};

interface SortIconProps {
    active: boolean;
    sortOrder: 'asc' | 'desc';
}

const SortIcon: React.FC<SortIconProps> = ({ active, sortOrder }) => {
    if (!active) return null;
    return <ListOrdered className={`inline-block w-4 h-4 ml-1 ${sortOrder === 'asc' ? '' : 'transform rotate-180'}`} />; // Rotate icon for desc
};

export default App;
