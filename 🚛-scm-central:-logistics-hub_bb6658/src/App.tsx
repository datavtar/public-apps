import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, UserPlus, Trash2, Filter, ArrowUp, ArrowDown, Shield, Key, Lock, LogOut, Package, 
  Truck, Warehouse, Calculator, House, FileText, Download, Upload, Edit, Plus, Minus, 
  Check, X, Search, Menu, TrendingUp, TrendingDown, ChartPie, ChartBar, ChartLine, 
  Clock, Calendar, Settings, Navigation, Route, Eye, MapPin, AlertTriangle, CheckCircle,
  XCircle, Users, FileImage, Building2, Phone, Mail, Globe, Tag, DollarSign, Percent,
  BarChart3, PieChart, Activity, Bell, Archive, Star, Target, Zap
} from 'lucide-react';

// Types and Interfaces
interface User {
  id: string;
  username: string;
  email: string;
  role: 'Admin' | 'Manager' | 'Warehouse Staff' | 'Driver';
  first_name: string;
  last_name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  unitPrice: number;
  supplierId: string;
  location: string;
  lastUpdated: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  products: string[];
  rating: number;
  paymentTerms: string;
  createdAt: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  assignedShipment?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  notes: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Shipment {
  id: string;
  orders: string[];
  driverId: string;
  vehicleId: string;
  status: 'Planning' | 'In Transit' | 'Delivered' | 'Delayed';
  startDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  route: string;
  notes: string;
  totalValue: number;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  type: string;
  capacity: number;
  status: 'Available' | 'In Use' | 'Maintenance';
  lastMaintenance: string;
  fuelEfficiency: number;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  status: 'Available' | 'On Route' | 'Off Duty';
  rating: number;
  totalDeliveries: number;
}

interface StockMovement {
  id: string;
  productId: string;
  type: 'In' | 'Out';
  quantity: number;
  reason: string;
  date: string;
  reference: string;
  userId: string;
}

interface Report {
  id: string;
  name: string;
  type: 'Orders' | 'Inventory' | 'Shipments' | 'Suppliers';
  data: any;
  generatedAt: string;
  generatedBy: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Settings State
  const [settings, setSettings] = useState({
    language: 'English',
    currency: 'USD',
    timezone: 'UTC',
    lowStockThreshold: 10,
    autoReorder: false,
    notifications: true
  });

  // Form State
  const [formData, setFormData] = useState<any>({});
  const [formErrors, setFormErrors] = useState<any>({});

  // Initialize data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const savedProducts = localStorage.getItem('scm_products');
      const savedSuppliers = localStorage.getItem('scm_suppliers');
      const savedOrders = localStorage.getItem('scm_orders');
      const savedShipments = localStorage.getItem('scm_shipments');
      const savedVehicles = localStorage.getItem('scm_vehicles');
      const savedDrivers = localStorage.getItem('scm_drivers');
      const savedStockMovements = localStorage.getItem('scm_stock_movements');
      const savedReports = localStorage.getItem('scm_reports');
      const savedSettings = localStorage.getItem('scm_settings');

      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
      if (savedOrders) setOrders(JSON.parse(savedOrders));
      if (savedShipments) setShipments(JSON.parse(savedShipments));
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
      if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
      if (savedStockMovements) setStockMovements(JSON.parse(savedStockMovements));
      if (savedReports) setReports(JSON.parse(savedReports));
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      // Initialize with sample data if empty
      if (!savedProducts || JSON.parse(savedProducts).length === 0) {
        initializeSampleData();
      }
    } catch (error) {
      console.error('Error loading data:', error);
      initializeSampleData();
    }
  };

  const initializeSampleData = () => {
    const sampleSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'TechCorp Industries',
        contactPerson: 'John Smith',
        email: 'john@techcorp.com',
        phone: '+1-555-0123',
        address: '123 Tech Street, Silicon Valley, CA 94000',
        products: ['1', '2'],
        rating: 4.5,
        paymentTerms: 'Net 30',
        createdAt: '2025-01-01'
      },
      {
        id: '2',
        name: 'Global Electronics',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@globalelec.com',
        phone: '+1-555-0124',
        address: '456 Electronics Ave, Austin, TX 78701',
        products: ['3', '4'],
        rating: 4.2,
        paymentTerms: 'Net 15',
        createdAt: '2025-01-02'
      }
    ];

    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Wireless Headphones',
        sku: 'WH-001',
        description: 'Premium wireless headphones with noise cancellation',
        category: 'Electronics',
        currentStock: 45,
        reorderLevel: 20,
        unitPrice: 199.99,
        supplierId: '1',
        location: 'A-1-1',
        lastUpdated: '2025-06-07'
      },
      {
        id: '2',
        name: 'Smart Watch',
        sku: 'SW-002',
        description: 'Fitness tracking smart watch with GPS',
        category: 'Electronics',
        currentStock: 8,
        reorderLevel: 15,
        unitPrice: 299.99,
        supplierId: '1',
        location: 'A-1-2',
        lastUpdated: '2025-06-06'
      },
      {
        id: '3',
        name: 'Bluetooth Speaker',
        sku: 'BS-003',
        description: 'Portable waterproof Bluetooth speaker',
        category: 'Electronics',
        currentStock: 32,
        reorderLevel: 25,
        unitPrice: 89.99,
        supplierId: '2',
        location: 'B-2-1',
        lastUpdated: '2025-06-05'
      },
      {
        id: '4',
        name: 'Phone Case',
        sku: 'PC-004',
        description: 'Protective case for smartphones',
        category: 'Accessories',
        currentStock: 5,
        reorderLevel: 30,
        unitPrice: 24.99,
        supplierId: '2',
        location: 'C-1-1',
        lastUpdated: '2025-06-04'
      }
    ];

    const sampleDrivers: Driver[] = [
      {
        id: '1',
        name: 'Mike Rodriguez',
        licenseNumber: 'CDL123456',
        phone: '+1-555-0201',
        email: 'mike@company.com',
        status: 'Available',
        rating: 4.8,
        totalDeliveries: 150
      },
      {
        id: '2',
        name: 'Lisa Chen',
        licenseNumber: 'CDL789012',
        phone: '+1-555-0202',
        email: 'lisa@company.com',
        status: 'On Route',
        rating: 4.9,
        totalDeliveries: 200
      }
    ];

    const sampleVehicles: Vehicle[] = [
      {
        id: '1',
        licensePlate: 'TRK-001',
        type: 'Delivery Truck',
        capacity: 5000,
        status: 'Available',
        lastMaintenance: '2025-05-15',
        fuelEfficiency: 8.5
      },
      {
        id: '2',
        licensePlate: 'VAN-002',
        type: 'Cargo Van',
        capacity: 2000,
        status: 'In Use',
        lastMaintenance: '2025-05-20',
        fuelEfficiency: 12.3
      }
    ];

    const sampleOrders: Order[] = [
      {
        id: '1',
        customerName: 'Alice Cooper',
        customerEmail: 'alice@email.com',
        customerPhone: '+1-555-0301',
        customerAddress: '789 Customer St, New York, NY 10001',
        items: [
          { productId: '1', productName: 'Wireless Headphones', quantity: 2, unitPrice: 199.99, totalPrice: 399.98 },
          { productId: '3', productName: 'Bluetooth Speaker', quantity: 1, unitPrice: 89.99, totalPrice: 89.99 }
        ],
        status: 'Processing',
        totalAmount: 489.97,
        orderDate: '2025-06-05',
        expectedDelivery: '2025-06-10',
        priority: 'High',
        notes: 'Customer requested expedited shipping'
      },
      {
        id: '2',
        customerName: 'Bob Johnson',
        customerEmail: 'bob@email.com',
        customerPhone: '+1-555-0302',
        customerAddress: '321 Main Ave, Los Angeles, CA 90001',
        items: [
          { productId: '2', productName: 'Smart Watch', quantity: 1, unitPrice: 299.99, totalPrice: 299.99 }
        ],
        status: 'Pending',
        totalAmount: 299.99,
        orderDate: '2025-06-06',
        expectedDelivery: '2025-06-12',
        priority: 'Medium',
        notes: ''
      }
    ];

    const sampleShipments: Shipment[] = [
      {
        id: '1',
        orders: ['1'],
        driverId: '2',
        vehicleId: '2',
        status: 'In Transit',
        startDate: '2025-06-07',
        expectedDelivery: '2025-06-10',
        route: 'Warehouse → New York, NY',
        notes: 'Priority delivery',
        totalValue: 489.97
      }
    ];

    setSuppliers(sampleSuppliers);
    setProducts(sampleProducts);
    setDrivers(sampleDrivers);
    setVehicles(sampleVehicles);
    setOrders(sampleOrders);
    setShipments(sampleShipments);

    saveData('scm_suppliers', sampleSuppliers);
    saveData('scm_products', sampleProducts);
    saveData('scm_drivers', sampleDrivers);
    saveData('scm_vehicles', sampleVehicles);
    saveData('scm_orders', sampleOrders);
    saveData('scm_shipments', sampleShipments);
  };

  const saveData = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  // AI Functions
  const handleAiSubmit = () => {
    if (!aiPrompt?.trim() && !aiFile) {
      setAiError("Please provide a prompt or select a file to process.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      let finalPrompt = aiPrompt;
      
      if (aiFile && !aiPrompt.trim()) {
        if (aiFile.name.toLowerCase().includes('invoice') || aiFile.name.toLowerCase().includes('receipt')) {
          finalPrompt = 'Extract supplier invoice data. Return JSON with keys: "supplier_name", "invoice_number", "date", "total_amount", "items" (array with "name", "quantity", "unit_price"), "payment_terms"';
        } else if (aiFile.name.toLowerCase().includes('product') || aiFile.name.toLowerCase().includes('catalog')) {
          finalPrompt = 'Extract product catalog data. Return JSON with keys: "products" (array with "name", "sku", "description", "category", "price", "supplier")';
        } else {
          finalPrompt = 'Analyze this document and extract relevant supply chain data. Return structured JSON format.';
        }
      }

      aiLayerRef.current?.sendToAI(finalPrompt, aiFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const processAiResult = (result: string) => {
    try {
      const data = JSON.parse(result);
      
      if (data.products) {
        // Process product catalog
        data.products.forEach((productData: any) => {
          const newProduct: Product = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: productData.name || 'Unknown Product',
            sku: productData.sku || `SKU-${Date.now()}`,
            description: productData.description || '',
            category: productData.category || 'General',
            currentStock: 0,
            reorderLevel: 10,
            unitPrice: parseFloat(productData.price) || 0,
            supplierId: productData.supplier || '',
            location: 'TBD',
            lastUpdated: new Date().toISOString().split('T')[0]
          };
          
          const updatedProducts = [...products, newProduct];
          setProducts(updatedProducts);
          saveData('scm_products', updatedProducts);
        });
      } else if (data.supplier_name) {
        // Process supplier invoice
        const supplierId = suppliers.find(s => s.name.toLowerCase().includes(data.supplier_name.toLowerCase()))?.id || '';
        
        if (data.items) {
          data.items.forEach((item: any) => {
            const stockMovement: StockMovement = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              productId: products.find(p => p.name.toLowerCase().includes(item.name.toLowerCase()))?.id || '',
              type: 'In',
              quantity: parseInt(item.quantity) || 0,
              reason: `Invoice ${data.invoice_number || 'Unknown'}`,
              date: data.date || new Date().toISOString().split('T')[0],
              reference: data.invoice_number || '',
              userId: currentUser?.id || ''
            };
            
            const updatedMovements = [...stockMovements, stockMovement];
            setStockMovements(updatedMovements);
            saveData('scm_stock_movements', updatedMovements);
          });
        }
      }
    } catch (error) {
      console.error('Error processing AI result:', error);
    }
  };

  useEffect(() => {
    if (aiResult) {
      processAiResult(aiResult);
    }
  }, [aiResult]);

  // Utility Functions
  const hasPermission = (requiredRole: string[]): boolean => {
    if (!currentUser) return false;
    const roleHierarchy = ['Driver', 'Warehouse Staff', 'Manager', 'Admin'];
    const userRoleIndex = roleHierarchy.indexOf(currentUser.role);
    return requiredRole.some(role => {
      const requiredIndex = roleHierarchy.indexOf(role);
      return userRoleIndex >= requiredIndex;
    });
  };

  const getLowStockProducts = (): Product[] => {
    return products.filter(product => product.currentStock <= product.reorderLevel);
  };

  const getUrgentOrders = (): Order[] => {
    return orders.filter(order => order.priority === 'Urgent' && order.status !== 'Delivered');
  };

  const getPendingShipments = (): Shipment[] => {
    return shipments.filter(shipment => shipment.status === 'Planning' || shipment.status === 'In Transit');
  };

  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setEditingItem(item);
    setFormData(item || {});
    setFormErrors({});
    setShowModal(true);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditingItem(null);
    setFormData({});
    setFormErrors({});
    document.body.classList.remove('modal-open');
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(item => 
        headers.map(header => {
          const value = item[header];
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        const data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const item: any = {};
          headers.forEach((header, index) => {
            item[header.trim()] = values[index]?.trim() || '';
          });
          item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          return item;
        });

        switch (type) {
          case 'products':
            const updatedProducts = [...products, ...data];
            setProducts(updatedProducts);
            saveData('scm_products', updatedProducts);
            break;
          case 'suppliers':
            const updatedSuppliers = [...suppliers, ...data];
            setSuppliers(updatedSuppliers);
            saveData('scm_suppliers', updatedSuppliers);
            break;
          case 'orders':
            const updatedOrders = [...orders, ...data];
            setOrders(updatedOrders);
            saveData('scm_orders', updatedOrders);
            break;
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = (type: string) => {
    const templates = {
      products: [
        { name: 'Sample Product', sku: 'SKU-001', description: 'Product description', category: 'Electronics', currentStock: 100, reorderLevel: 20, unitPrice: 29.99, supplierId: '', location: 'A-1-1' }
      ],
      suppliers: [
        { name: 'Sample Supplier', contactPerson: 'John Doe', email: 'john@supplier.com', phone: '+1-555-0123', address: '123 Supplier St', products: '', rating: 4.5, paymentTerms: 'Net 30' }
      ],
      orders: [
        { customerName: 'Sample Customer', customerEmail: 'customer@email.com', customerPhone: '+1-555-0123', customerAddress: '123 Customer St', status: 'Pending', totalAmount: 99.99, orderDate: '2025-06-07', expectedDelivery: '2025-06-14', priority: 'Medium', notes: '' }
      ]
    };

    const template = templates[type as keyof typeof templates];
    if (template) {
      exportToCSV(template, `${type}_template`);
    }
  };

  // CRUD Operations
  const handleSave = () => {
    try {
      const newItem = {
        ...formData,
        id: editingItem?.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      switch (modalType) {
        case 'product':
          const updatedProducts = editingItem 
            ? products.map(p => p.id === editingItem.id ? newItem : p)
            : [...products, newItem];
          setProducts(updatedProducts);
          saveData('scm_products', updatedProducts);
          break;
        case 'supplier':
          const updatedSuppliers = editingItem
            ? suppliers.map(s => s.id === editingItem.id ? newItem : s)
            : [...suppliers, newItem];
          setSuppliers(updatedSuppliers);
          saveData('scm_suppliers', updatedSuppliers);
          break;
        case 'order':
          const updatedOrders = editingItem
            ? orders.map(o => o.id === editingItem.id ? newItem : o)
            : [...orders, newItem];
          setOrders(updatedOrders);
          saveData('scm_orders', updatedOrders);
          break;
        case 'shipment':
          const updatedShipments = editingItem
            ? shipments.map(s => s.id === editingItem.id ? newItem : s)
            : [...shipments, newItem];
          setShipments(updatedShipments);
          saveData('scm_shipments', updatedShipments);
          break;
        case 'vehicle':
          const updatedVehicles = editingItem
            ? vehicles.map(v => v.id === editingItem.id ? newItem : v)
            : [...vehicles, newItem];
          setVehicles(updatedVehicles);
          saveData('scm_vehicles', updatedVehicles);
          break;
        case 'driver':
          const updatedDrivers = editingItem
            ? drivers.map(d => d.id === editingItem.id ? newItem : d)
            : [...drivers, newItem];
          setDrivers(updatedDrivers);
          saveData('scm_drivers', updatedDrivers);
          break;
      }
      closeModal();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = (type: string, id: string) => {
    try {
      switch (type) {
        case 'product':
          const filteredProducts = products.filter(p => p.id !== id);
          setProducts(filteredProducts);
          saveData('scm_products', filteredProducts);
          break;
        case 'supplier':
          const filteredSuppliers = suppliers.filter(s => s.id !== id);
          setSuppliers(filteredSuppliers);
          saveData('scm_suppliers', filteredSuppliers);
          break;
        case 'order':
          const filteredOrders = orders.filter(o => o.id !== id);
          setOrders(filteredOrders);
          saveData('scm_orders', filteredOrders);
          break;
        case 'shipment':
          const filteredShipments = shipments.filter(s => s.id !== id);
          setShipments(filteredShipments);
          saveData('scm_shipments', filteredShipments);
          break;
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Dashboard Components
  const DashboardStats = () => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const lowStockCount = getLowStockProducts().length;
    const activeShipments = shipments.filter(s => s.status === 'In Transit').length;
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="stat-card bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Orders</div>
              <div className="stat-value text-blue-600 dark:text-blue-400">{totalOrders}</div>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="stat-card bg-yellow-50 dark:bg-yellow-900/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Pending Orders</div>
              <div className="stat-value text-yellow-600 dark:text-yellow-400">{pendingOrders}</div>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="stat-card bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Low Stock Items</div>
              <div className="stat-value text-red-600 dark:text-red-400">{lowStockCount}</div>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="stat-card bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Active Shipments</div>
              <div className="stat-value text-green-600 dark:text-green-400">{activeShipments}</div>
            </div>
            <Truck className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="stat-card bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Inventory Value</div>
              <div className="stat-value text-purple-600 dark:text-purple-400">${totalInventoryValue.toLocaleString()}</div>
            </div>
            <DollarSign className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>
    );
  };

  const renderDashboard = () => (
    <div id="dashboard-tab" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <div className="text-sm text-gray-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Urgent Alerts
          </h3>
          <div className="space-y-3">
            {getLowStockProducts().slice(0, 5).map(product => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">{product.name}</p>
                  <p className="text-sm text-red-600 dark:text-red-300">Stock: {product.currentStock} (Reorder: {product.reorderLevel})</p>
                </div>
                <span className="badge badge-error">Low Stock</span>
              </div>
            ))}
            {getUrgentOrders().slice(0, 3).map(order => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div>
                  <p className="font-medium text-orange-800 dark:text-orange-200">{order.customerName}</p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">Due: {order.expectedDelivery}</p>
                </div>
                <span className="badge badge-warning">Urgent</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-500" />
            Recent Activities
          </h3>
          <div className="space-y-3">
            {stockMovements.slice(-5).reverse().map(movement => {
              const product = products.find(p => p.id === movement.productId);
              return (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product?.name || 'Unknown Product'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      {movement.type} - Qty: {movement.quantity} ({movement.reason})
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">{movement.date}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOrders = () => {
    const filteredOrders = orders.filter(order => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const sortedOrders = [...filteredOrders].sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField as keyof Order];
      const bVal = b[sortField as keyof Order];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? direction : -direction;
    });

    return (
      <div id="orders-tab" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h2>
          {hasPermission(['Manager', 'Admin']) && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => openModal('order')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Order
              </button>
              <button 
                onClick={() => setShowAiModal(true)}
                className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              >
                <Zap className="h-4 w-4" />
                AI Process
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">
                  <button onClick={() => handleSort('id')} className="flex items-center gap-1">
                    Order ID {sortField === 'id' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">
                  <button onClick={() => handleSort('customerName')} className="flex items-center gap-1">
                    Customer {sortField === 'customerName' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">
                  <button onClick={() => handleSort('totalAmount')} className="flex items-center gap-1">
                    Amount {sortField === 'totalAmount' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1">
                    Status {sortField === 'status' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">
                  <button onClick={() => handleSort('priority')} className="flex items-center gap-1">
                    Priority {sortField === 'priority' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">Expected Delivery</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="table-cell font-medium">#{order.id}</td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{order.customerEmail}</div>
                    </div>
                  </td>
                  <td className="table-cell font-medium">${order.totalAmount.toFixed(2)}</td>
                  <td className="table-cell">
                    <span className={`badge ${
                      order.status === 'Delivered' ? 'badge-success' :
                      order.status === 'Shipped' ? 'badge-info' :
                      order.status === 'Processing' ? 'badge-warning' :
                      order.status === 'Cancelled' ? 'badge-error' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      order.priority === 'Urgent' ? 'badge-error' :
                      order.priority === 'High' ? 'badge-warning' :
                      order.priority === 'Medium' ? 'badge-info' : 'badge-success'
                    }`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="table-cell">{order.expectedDelivery}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => openModal('order', order)}
                        className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      {hasPermission(['Manager', 'Admin']) && (
                        <>
                          <button 
                            onClick={() => openModal('order', order)}
                            className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete('order', order.id)}
                            className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'low-stock' && product.currentStock <= product.reorderLevel) ||
                          (filterStatus === 'in-stock' && product.currentStock > product.reorderLevel);
      return matchesSearch && matchesFilter;
    });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField as keyof Product];
      const bVal = b[sortField as keyof Product];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? direction : -direction;
    });

    return (
      <div id="inventory-tab" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
          {hasPermission(['Warehouse Staff', 'Manager', 'Admin']) && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => openModal('product')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
              <button 
                onClick={() => exportToCSV(products, 'inventory')}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleImportCSV(e, 'products')}
                  className="hidden"
                />
              </label>
              <button 
                onClick={() => downloadTemplate('products')}
                className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Template
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input w-full"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input sm:w-auto"
          >
            <option value="all">All Items</option>
            <option value="low-stock">Low Stock</option>
            <option value="in-stock">In Stock</option>
          </select>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">
                  <button onClick={() => handleSort('sku')} className="flex items-center gap-1">
                    SKU {sortField === 'sku' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1">
                    Product {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">Category</th>
                <th className="table-header">
                  <button onClick={() => handleSort('currentStock')} className="flex items-center gap-1">
                    Stock {sortField === 'currentStock' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">Reorder Level</th>
                <th className="table-header">
                  <button onClick={() => handleSort('unitPrice')} className="flex items-center gap-1">
                    Price {sortField === 'unitPrice' && (sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="table-header">Location</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                  <td className="table-cell font-medium">{product.sku}</td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs">{product.description}</div>
                    </div>
                  </td>
                  <td className="table-cell">{product.category}</td>
                  <td className="table-cell">
                    <span className={`font-medium ${
                      product.currentStock <= product.reorderLevel ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                    }`}>
                      {product.currentStock}
                    </span>
                  </td>
                  <td className="table-cell">{product.reorderLevel}</td>
                  <td className="table-cell">${product.unitPrice.toFixed(2)}</td>
                  <td className="table-cell">{product.location}</td>
                  <td className="table-cell">
                    {product.currentStock <= product.reorderLevel ? (
                      <span className="badge badge-error">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {hasPermission(['Warehouse Staff', 'Manager', 'Admin']) && (
                        <>
                          <button 
                            onClick={() => openModal('product', product)}
                            className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => openModal('stock-movement', { productId: product.id, productName: product.name })}
                            className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            <Package className="h-3 w-3" />
                          </button>
                          {hasPermission(['Manager', 'Admin']) && (
                            <button 
                              onClick={() => handleDelete('product', product.id)}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderShipments = () => {
    const filteredShipments = shipments.filter(shipment => {
      const matchesSearch = shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          shipment.route.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || shipment.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div id="shipments-tab" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment & Fleet Management</h2>
          {hasPermission(['Manager', 'Admin']) && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => openModal('shipment')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Shipment
              </button>
              <button 
                onClick={() => openModal('vehicle')}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </button>
              <button 
                onClick={() => openModal('driver')}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Driver
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input w-full"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input sm:w-auto"
              >
                <option value="all">All Status</option>
                <option value="Planning">Planning</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
                <option value="Delayed">Delayed</option>
              </select>
            </div>

            <div className="space-y-4">
              {filteredShipments.map(shipment => {
                const driver = drivers.find(d => d.id === shipment.driverId);
                const vehicle = vehicles.find(v => v.id === shipment.vehicleId);
                
                return (
                  <div key={shipment.id} className="card">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Shipment #{shipment.id}
                          </h3>
                          <span className={`badge ${
                            shipment.status === 'Delivered' ? 'badge-success' :
                            shipment.status === 'In Transit' ? 'badge-info' :
                            shipment.status === 'Delayed' ? 'badge-error' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {shipment.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><span className="font-medium">Driver:</span> {driver?.name || 'Unassigned'}</p>
                            <p><span className="font-medium">Vehicle:</span> {vehicle?.licensePlate || 'Unassigned'}</p>
                          </div>
                          <div>
                            <p><span className="font-medium">Route:</span> {shipment.route}</p>
                            <p><span className="font-medium">Value:</span> ${shipment.totalValue.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-slate-400">
                          <span>Start: {shipment.startDate}</span>
                          <span>Expected: {shipment.expectedDelivery}</span>
                          {shipment.actualDelivery && <span>Delivered: {shipment.actualDelivery}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openModal('shipment', shipment)}
                          className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                        {hasPermission(['Manager', 'Admin']) && (
                          <>
                            <button 
                              onClick={() => openModal('shipment', shipment)}
                              className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button 
                              onClick={() => handleDelete('shipment', shipment.id)}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Fleet Status</h3>
              <div className="space-y-3">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{vehicle.type}</p>
                    </div>
                    <span className={`badge ${
                      vehicle.status === 'Available' ? 'badge-success' :
                      vehicle.status === 'In Use' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Driver Status</h3>
              <div className="space-y-3">
                {drivers.map(driver => (
                  <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{driver.name}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        Rating: {driver.rating}/5 ({driver.totalDeliveries} deliveries)
                      </p>
                    </div>
                    <span className={`badge ${
                      driver.status === 'Available' ? 'badge-success' :
                      driver.status === 'On Route' ? 'badge-warning' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {driver.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSuppliers = () => {
    const filteredSuppliers = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
      if (!sortField) return 0;
      const aVal = a[sortField as keyof Supplier];
      const bVal = b[sortField as keyof Supplier];
      const direction = sortDirection === 'asc' ? 1 : -1;
      return aVal > bVal ? direction : -direction;
    });

    return (
      <div id="suppliers-tab" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h2>
          {hasPermission(['Manager', 'Admin']) && (
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => openModal('supplier')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Supplier
              </button>
              <button 
                onClick={() => exportToCSV(suppliers, 'suppliers')}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
              <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 cursor-pointer">
                <Upload className="h-4 w-4" />
                Import
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => handleImportCSV(e, 'suppliers')}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        <div className="flex-1">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSuppliers.map(supplier => {
            const supplierProducts = products.filter(p => p.supplierId === supplier.id);
            
            return (
              <div key={supplier.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{supplier.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-300">{supplier.contactPerson}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600 dark:text-slate-300 ml-1">{supplier.rating}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-slate-300">{supplier.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-slate-300">{supplier.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600 dark:text-slate-300 text-xs">{supplier.address}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-600">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-slate-300">Products: {supplierProducts.length}</span>
                    <span className="text-gray-600 dark:text-slate-300">Terms: {supplier.paymentTerms}</span>
                  </div>
                </div>

                {hasPermission(['Manager', 'Admin']) && (
                  <div className="flex items-center gap-2 mt-4">
                    <button 
                      onClick={() => openModal('supplier', supplier)}
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 flex-1"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete('supplier', supplier.id)}
                      className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + o.totalAmount, 0);
    const totalInventoryValue = products.reduce((sum, p) => sum + (p.currentStock * p.unitPrice), 0);
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const deliveryRate = orders.length > 0 ? (deliveredOrders / orders.length * 100).toFixed(1) : '0';

    const ordersByStatus = [
      { name: 'Pending', value: orders.filter(o => o.status === 'Pending').length, color: '#8B5CF6' },
      { name: 'Processing', value: orders.filter(o => o.status === 'Processing').length, color: '#F59E0B' },
      { name: 'Shipped', value: orders.filter(o => o.status === 'Shipped').length, color: '#3B82F6' },
      { name: 'Delivered', value: orders.filter(o => o.status === 'Delivered').length, color: '#10B981' },
      { name: 'Cancelled', value: orders.filter(o => o.status === 'Cancelled').length, color: '#EF4444' }
    ];

    const topProducts = products
      .map(product => {
        const totalSold = orders
          .filter(o => o.status === 'Delivered')
          .reduce((sum, order) => {
            const item = order.items.find(i => i.productId === product.id);
            return sum + (item?.quantity || 0);
          }, 0);
        return { ...product, totalSold };
      })
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);

    return (
      <div id="reports-tab" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
          <button 
            onClick={() => exportToCSV(orders, 'orders_report')}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card bg-green-50 dark:bg-green-900/20">
            <div className="stat-title">Total Revenue</div>
            <div className="stat-value text-green-600 dark:text-green-400">${totalRevenue.toLocaleString()}</div>
            <div className="stat-desc">From delivered orders</div>
          </div>
          
          <div className="stat-card bg-blue-50 dark:bg-blue-900/20">
            <div className="stat-title">Inventory Value</div>
            <div className="stat-value text-blue-600 dark:text-blue-400">${totalInventoryValue.toLocaleString()}</div>
            <div className="stat-desc">Current stock value</div>
          </div>
          
          <div className="stat-card bg-purple-50 dark:bg-purple-900/20">
            <div className="stat-title">Orders Delivered</div>
            <div className="stat-value text-purple-600 dark:text-purple-400">{deliveredOrders}</div>
            <div className="stat-desc">{deliveryRate}% delivery rate</div>
          </div>
          
          <div className="stat-card bg-orange-50 dark:bg-orange-900/20">
            <div className="stat-title">Active Shipments</div>
            <div className="stat-value text-orange-600 dark:text-orange-400">{getPendingShipments().length}</div>
            <div className="stat-desc">Currently in transit</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Status Distribution</h3>
            <div className="space-y-3">
              {ordersByStatus.map(status => (
                <div key={status.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-slate-300">{status.name}</span>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{status.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Selling Products</h3>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{product.sku}</p>
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{product.totalSold} sold</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Low Stock Alerts</h3>
            <div className="space-y-3">
              {getLowStockProducts().slice(0, 5).map(product => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800 dark:text-red-200">{product.name}</p>
                    <p className="text-sm text-red-600 dark:text-red-300">Current: {product.currentStock} | Reorder: {product.reorderLevel}</p>
                  </div>
                  <span className="badge badge-error">Action Needed</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Performance</h3>
            <div className="space-y-3">
              {shipments.slice(0, 5).map(shipment => {
                const isDelayed = shipment.status === 'Delayed' || 
                  (shipment.status === 'In Transit' && new Date(shipment.expectedDelivery) < new Date());
                
                return (
                  <div key={shipment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Shipment #{shipment.id}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{shipment.route}</p>
                    </div>
                    <span className={`badge ${
                      shipment.status === 'Delivered' ? 'badge-success' :
                      isDelayed ? 'badge-error' : 'badge-info'
                    }`}>
                      {isDelayed ? 'Delayed' : shipment.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => {
    const handleClearAllData = () => {
      const confirmClear = window.confirm('Are you sure you want to clear all data? This action cannot be undone.');
      if (confirmClear) {
        localStorage.clear();
        setProducts([]);
        setSuppliers([]);
        setOrders([]);
        setShipments([]);
        setVehicles([]);
        setDrivers([]);
        setStockMovements([]);
        setReports([]);
      }
    };

    const handleExportAllData = () => {
      const allData = {
        products,
        suppliers,
        orders,
        shipments,
        vehicles,
        drivers,
        stockMovements,
        reports,
        settings,
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(allData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scm_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    };

    return (
      <div id="settings-tab" className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Language</label>
                <select 
                  value={settings.language}
                  onChange={(e) => setSettings({...settings, language: e.target.value})}
                  className="input"
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Currency</label>
                <select 
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  className="input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select 
                  value={settings.timezone}
                  onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  className="input"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                  <option value="GMT">GMT</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Inventory Settings</h3>
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Low Stock Threshold</label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({...settings, lowStockThreshold: parseInt(e.target.value)})}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoReorder}
                    onChange={(e) => setSettings({...settings, autoReorder: e.target.checked})}
                    className="rounded"
                  />
                  <span>Enable Auto Reordering</span>
                </label>
              </div>

              <div className="form-group">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    className="rounded"
                  />
                  <span>Enable Notifications</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={handleExportAllData}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 justify-center"
            >
              <Download className="h-4 w-4" />
              Export All Data
            </button>
            
            <label className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 justify-center cursor-pointer">
              <Upload className="h-4 w-4" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        setProducts(data.products || []);
                        setSuppliers(data.suppliers || []);
                        setOrders(data.orders || []);
                        setShipments(data.shipments || []);
                        setVehicles(data.vehicles || []);
                        setDrivers(data.drivers || []);
                        setStockMovements(data.stockMovements || []);
                        setReports(data.reports || []);
                        if (data.settings) setSettings(data.settings);
                      } catch (error) {
                        console.error('Error importing data:', error);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
                className="hidden"
              />
            </label>
            
            <button 
              onClick={handleClearAllData}
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 justify-center"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300">Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentUser?.first_name} {currentUser?.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300">Role</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentUser?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-slate-300">Username</p>
              <p className="font-medium text-gray-900 dark:text-white">{currentUser?.username}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal Components
  const renderModal = () => {
    if (!showModal) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    return (
      <div 
        className="modal-backdrop" 
        onClick={closeModal}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <div 
          className="modal-content max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
            </h3>
            <button 
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4">
            {modalType === 'product' && renderProductForm()}
            {modalType === 'supplier' && renderSupplierForm()}
            {modalType === 'order' && renderOrderForm()}
            {modalType === 'shipment' && renderShipmentForm()}
            {modalType === 'vehicle' && renderVehicleForm()}
            {modalType === 'driver' && renderDriverForm()}
            {modalType === 'stock-movement' && renderStockMovementForm()}
          </div>

          <div className="modal-footer">
            <button 
              onClick={closeModal}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="btn btn-primary"
            >
              {editingItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderProductForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="form-label">Product Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">SKU</label>
        <input
          type="text"
          value={formData.sku || ''}
          onChange={(e) => setFormData({...formData, sku: e.target.value})}
          className="input"
          required
        />
      </div>
      <div className="form-group md:col-span-2">
        <label className="form-label">Description</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="input"
          rows={3}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Category</label>
        <input
          type="text"
          value={formData.category || ''}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Current Stock</label>
        <input
          type="number"
          value={formData.currentStock || 0}
          onChange={(e) => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Reorder Level</label>
        <input
          type="number"
          value={formData.reorderLevel || 0}
          onChange={(e) => setFormData({...formData, reorderLevel: parseInt(e.target.value) || 0})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Unit Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.unitPrice || 0}
          onChange={(e) => setFormData({...formData, unitPrice: parseFloat(e.target.value) || 0})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Supplier</label>
        <select
          value={formData.supplierId || ''}
          onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
          className="input"
        >
          <option value="">Select Supplier</option>
          {suppliers.map(supplier => (
            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Location</label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
          className="input"
        />
      </div>
    </div>
  );

  const renderSupplierForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="form-label">Company Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Contact Person</label>
        <input
          type="text"
          value={formData.contactPerson || ''}
          onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Phone</label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group md:col-span-2">
        <label className="form-label">Address</label>
        <textarea
          value={formData.address || ''}
          onChange={(e) => setFormData({...formData, address: e.target.value})}
          className="input"
          rows={3}
        />
      </div>
      <div className="form-group">
        <label className="form-label">Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          step="0.1"
          value={formData.rating || 5}
          onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 5})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Payment Terms</label>
        <select
          value={formData.paymentTerms || 'Net 30'}
          onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
          className="input"
        >
          <option value="Net 15">Net 15</option>
          <option value="Net 30">Net 30</option>
          <option value="Net 60">Net 60</option>
          <option value="COD">COD</option>
        </select>
      </div>
    </div>
  );

  const renderOrderForm = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">Customer Name</label>
          <input
            type="text"
            value={formData.customerName || ''}
            onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            className="input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Customer Email</label>
          <input
            type="email"
            value={formData.customerEmail || ''}
            onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Customer Phone</label>
          <input
            type="tel"
            value={formData.customerPhone || ''}
            onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
            className="input"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Priority</label>
          <select
            value={formData.priority || 'Medium'}
            onChange={(e) => setFormData({...formData, priority: e.target.value})}
            className="input"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
        <div className="form-group md:col-span-2">
          <label className="form-label">Customer Address</label>
          <textarea
            value={formData.customerAddress || ''}
            onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
            className="input"
            rows={3}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            value={formData.status || 'Pending'}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="input"
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Expected Delivery</label>
          <input
            type="date"
            value={formData.expectedDelivery || ''}
            onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
            className="input"
          />
        </div>
        <div className="form-group md:col-span-2">
          <label className="form-label">Notes</label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="input"
            rows={2}
          />
        </div>
      </div>
    </div>
  );

  const renderShipmentForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="form-label">Driver</label>
        <select
          value={formData.driverId || ''}
          onChange={(e) => setFormData({...formData, driverId: e.target.value})}
          className="input"
        >
          <option value="">Select Driver</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>{driver.name}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Vehicle</label>
        <select
          value={formData.vehicleId || ''}
          onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
          className="input"
        >
          <option value="">Select Vehicle</option>
          {vehicles.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>{vehicle.licensePlate} - {vehicle.type}</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          value={formData.status || 'Planning'}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          className="input"
        >
          <option value="Planning">Planning</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
          <option value="Delayed">Delayed</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Start Date</label>
        <input
          type="date"
          value={formData.startDate || ''}
          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Expected Delivery</label>
        <input
          type="date"
          value={formData.expectedDelivery || ''}
          onChange={(e) => setFormData({...formData, expectedDelivery: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Total Value</label>
        <input
          type="number"
          step="0.01"
          value={formData.totalValue || 0}
          onChange={(e) => setFormData({...formData, totalValue: parseFloat(e.target.value) || 0})}
          className="input"
        />
      </div>
      <div className="form-group md:col-span-2">
        <label className="form-label">Route</label>
        <input
          type="text"
          value={formData.route || ''}
          onChange={(e) => setFormData({...formData, route: e.target.value})}
          className="input"
          placeholder="e.g., Warehouse → City A → City B"
        />
      </div>
      <div className="form-group md:col-span-2">
        <label className="form-label">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          className="input"
          rows={3}
        />
      </div>
    </div>
  );

  const renderVehicleForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="form-label">License Plate</label>
        <input
          type="text"
          value={formData.licensePlate || ''}
          onChange={(e) => setFormData({...formData, licensePlate: e.target.value})}
          className="input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Vehicle Type</label>
        <select
          value={formData.type || ''}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="input"
        >
          <option value="">Select Type</option>
          <option value="Delivery Truck">Delivery Truck</option>
          <option value="Cargo Van">Cargo Van</option>
          <option value="Semi Truck">Semi Truck</option>
          <option value="Pickup Truck">Pickup Truck</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Capacity (lbs)</label>
        <input
          type="number"
          value={formData.capacity || 0}
          onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          value={formData.status || 'Available'}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          className="input"
        >
          <option value="Available">Available</option>
          <option value="In Use">In Use</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Last Maintenance</label>
        <input
          type="date"
          value={formData.lastMaintenance || ''}
          onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Fuel Efficiency (MPG)</label>
        <input
          type="number"
          step="0.1"
          value={formData.fuelEfficiency || 0}
          onChange={(e) => setFormData({...formData, fuelEfficiency: parseFloat(e.target.value) || 0})}
          className="input"
        />
      </div>
    </div>
  );

  const renderDriverForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="form-label">Driver Name</label>
        <input
          type="text"
          value={formData.name || ''}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">License Number</label>
        <input
          type="text"
          value={formData.licenseNumber || ''}
          onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Phone</label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({...formData, phone: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select
          value={formData.status || 'Available'}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          className="input"
        >
          <option value="Available">Available</option>
          <option value="On Route">On Route</option>
          <option value="Off Duty">Off Duty</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Rating</label>
        <input
          type="number"
          min="1"
          max="5"
          step="0.1"
          value={formData.rating || 5}
          onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 5})}
          className="input"
        />
      </div>
    </div>
  );

  const renderStockMovementForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="form-group">
        <label className="form-label">Product</label>
        <select
          value={formData.productId || ''}
          onChange={(e) => setFormData({...formData, productId: e.target.value})}
          className="input"
          required
        >
          <option value="">Select Product</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>{product.name} ({product.sku})</option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Movement Type</label>
        <select
          value={formData.type || 'In'}
          onChange={(e) => setFormData({...formData, type: e.target.value})}
          className="input"
        >
          <option value="In">Stock In</option>
          <option value="Out">Stock Out</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Quantity</label>
        <input
          type="number"
          value={formData.quantity || 0}
          onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
          className="input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          type="date"
          value={formData.date || new Date().toISOString().split('T')[0]}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          className="input"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Reason</label>
        <input
          type="text"
          value={formData.reason || ''}
          onChange={(e) => setFormData({...formData, reason: e.target.value})}
          className="input"
          placeholder="e.g., Received shipment, Sale, Damage"
        />
      </div>
      <div className="form-group">
        <label className="form-label">Reference</label>
        <input
          type="text"
          value={formData.reference || ''}
          onChange={(e) => setFormData({...formData, reference: e.target.value})}
          className="input"
          placeholder="e.g., PO-123, Invoice-456"
        />
      </div>
    </div>
  );

  // AI Modal Component
  const renderAiModal = () => {
    if (!showAiModal) return null;

    return (
      <div 
        className="modal-backdrop" 
        onClick={() => setShowAiModal(false)}
      >
        <div 
          className="modal-content max-w-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-500" />
              AI Document Processor
            </h3>
            <button 
              onClick={() => setShowAiModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>AI Features:</strong> Upload supplier invoices, product catalogs, or delivery receipts. 
                The AI will automatically extract data and populate your system. You can also ask questions about your supply chain data.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">AI Prompt (Optional)</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="input"
                rows={3}
                placeholder="Ask a question or provide instructions for document processing..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Document (Optional)</label>
              <input
                type="file"
                onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                className="input"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              {aiFile && (
                <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
                  Selected: {aiFile.name}
                </p>
              )}
            </div>

            {aiResult && (
              <div className="form-group">
                <label className="form-label">AI Response</label>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <pre className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                    {aiResult}
                  </pre>
                </div>
              </div>
            )}

            {aiError && (
              <div className="alert alert-error">
                <X className="h-5 w-5" />
                <p>{aiError.toString()}</p>
              </div>
            )}

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> AI responses may contain errors. Please review all extracted data before saving to your system.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              onClick={() => setShowAiModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Close
            </button>
            <button 
              onClick={handleAiSubmit}
              disabled={aiLoading}
              className="btn btn-primary flex items-center gap-2"
            >
              {aiLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Process with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Navigation
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: House, roles: ['Admin', 'Manager', 'Warehouse Staff', 'Driver'] },
    { id: 'orders', label: 'Orders', icon: Package, roles: ['Admin', 'Manager', 'Warehouse Staff'] },
    { id: 'inventory', label: 'Inventory', icon: Warehouse, roles: ['Admin', 'Manager', 'Warehouse Staff'] },
    { id: 'shipments', label: 'Shipments', icon: Truck, roles: ['Admin', 'Manager', 'Driver'] },
    { id: 'suppliers', label: 'Suppliers', icon: Building2, roles: ['Admin', 'Manager'] },
    { id: 'reports', label: 'Reports', icon: ChartBar, roles: ['Admin', 'Manager'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Manager', 'Warehouse Staff', 'Driver'] }
  ];

  const visibleNavigation = navigationItems.filter(item => 
    hasPermission(item.roles)
  );

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 flex">
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={aiFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600 dark:bg-blue-700">
          <h1 className="text-white font-bold text-lg">SCM Pro</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {visibleNavigation.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`${item.id}-tab`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                    setSearchTerm('');
                    setFilterStatus('all');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {currentUser.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 dark:text-slate-300"
              >
                <Menu className="h-6 w-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                {activeTab}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {(getLowStockProducts().length > 0 || getUrgentOrders().length > 0) && (
                <div className="relative">
                  <Bell className="h-6 w-6 text-red-500 animate-pulse" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5">
                    {getLowStockProducts().length + getUrgentOrders().length}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-600 dark:text-slate-300">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main id="generation_issue_fallback" className="flex-1 overflow-auto">
          <div className="container-fluid py-8">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'inventory' && renderInventory()}
            {activeTab === 'shipments' && renderShipments()}
            {activeTab === 'suppliers' && renderSuppliers()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4">
          <div className="container-fluid">
            <p className="text-center text-sm text-gray-500 dark:text-slate-400">
              Copyright © 2025 Datavtar Private Limited. All rights reserved.
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {renderModal()}
      {renderAiModal()}
    </div>
  );
};

export default App;