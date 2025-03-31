import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Package, Truck, Clipboard, Users, Home, Search, Plus, Edit, Trash2, 
  Download, Upload, RefreshCw, Filter, ChevronDown, Moon, Sun, X, Check,
  FileText, BarChart2, Menu, LogOut, ArrowLeft, ArrowRight
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and interfaces
type Product = {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  location: string;
  lastUpdated: string;
};

type Supplier = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  productsSupplied: string[];
};

type PurchaseOrder = {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  expectedDelivery: string;
  items: PurchaseOrderItem[];
  status: 'Draft' | 'Confirmed' | 'Received' | 'Cancelled';
  totalAmount: number;
};

type PurchaseOrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type Shipment = {
  id: string;
  shipmentNumber: string;
  customerName: string;
  orderDate: string;
  shipmentDate: string;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  items: ShipmentItem[];
};

type ShipmentItem = {
  productId: string;
  productName: string;
  quantity: number;
};

type InventoryMovement = {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: 'Inbound' | 'Outbound' | 'Adjustment';
  quantity: number;
  referenceNumber: string;
  notes: string;
};

type StockAlert = {
  productId: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  reorderPoint: number;
  status: 'Low' | 'Critical' | 'Out of Stock';
};

type Tab = 'dashboard' | 'inventory' | 'orders' | 'shipments' | 'suppliers';
type InventorySubTab = 'list' | 'movements' | 'alerts';
type OrdersSubTab = 'list' | 'create';
type ShipmentsSubTab = 'list' | 'create';
type SuppliersSubTab = 'list' | 'add';

const App: React.FC = () => {
  // State for UI control
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [inventorySubTab, setInventorySubTab] = useState<InventorySubTab>('list');
  const [ordersSubTab, setOrdersSubTab] = useState<OrdersSubTab>('list');
  const [shipmentsSubTab, setShipmentsSubTab] = useState<ShipmentsSubTab>('list');
  const [suppliersSubTab, setSuppliersSubTab] = useState<SuppliersSubTab>('list');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(window.innerWidth > 768);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // State for modals
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [showEditProductModal, setShowEditProductModal] = useState<boolean>(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState<boolean>(false);
  const [showEditSupplierModal, setShowEditSupplierModal] = useState<boolean>(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState<boolean>(false);
  const [showAddShipmentModal, setShowAddShipmentModal] = useState<boolean>(false);
  
  // State for data
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([]);
  
  // State for form data
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  const [currentOrder, setCurrentOrder] = useState<PurchaseOrder | null>(null);
  const [currentShipment, setCurrentShipment] = useState<Shipment | null>(null);
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Load data from localStorage on component mount
  useEffect(() => {
    // Load products
    const savedProducts = localStorage.getItem('warehouse_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Set sample data if no data exists
      const sampleProducts: Product[] = [
        {
          id: "p1",
          sku: "LAP-001",
          name: "Dell XPS 15",
          category: "Electronics",
          quantity: 25,
          unit: "pcs",
          unitPrice: 1299.99,
          location: "A1-S3-R2",
          lastUpdated: new Date().toISOString()
        },
        {
          id: "p2",
          sku: "MON-002",
          name: "Samsung 27\" Monitor",
          category: "Electronics",
          quantity: 42,
          unit: "pcs",
          unitPrice: 249.99,
          location: "A1-S3-R3",
          lastUpdated: new Date().toISOString()
        },
        {
          id: "p3",
          sku: "DSK-001",
          name: "Office Desk",
          category: "Furniture",
          quantity: 15,
          unit: "pcs",
          unitPrice: 349.99,
          location: "B2-S1-R1",
          lastUpdated: new Date().toISOString()
        },
        {
          id: "p4",
          sku: "CHR-001",
          name: "Ergonomic Chair",
          category: "Furniture",
          quantity: 30,
          unit: "pcs",
          unitPrice: 189.99,
          location: "B2-S1-R2",
          lastUpdated: new Date().toISOString()
        },
        {
          id: "p5",
          sku: "PHN-003",
          name: "iPhone 13",
          category: "Electronics",
          quantity: 10,
          unit: "pcs",
          unitPrice: 999.99,
          location: "A1-S2-R1",
          lastUpdated: new Date().toISOString()
        }
      ];
      setProducts(sampleProducts);
      localStorage.setItem('warehouse_products', JSON.stringify(sampleProducts));
    }

    // Load suppliers
    const savedSuppliers = localStorage.getItem('warehouse_suppliers');
    if (savedSuppliers) {
      setSuppliers(JSON.parse(savedSuppliers));
    } else {
      // Set sample data if no data exists
      const sampleSuppliers: Supplier[] = [
        {
          id: "s1",
          name: "TechSource Inc.",
          contactPerson: "John Smith",
          email: "john@techsource.com",
          phone: "+1-555-1234",
          address: "123 Tech Avenue, San Jose, CA 95123",
          productsSupplied: ["p1", "p2", "p5"]
        },
        {
          id: "s2",
          name: "Office Solutions Ltd.",
          contactPerson: "Jane Doe",
          email: "jane@officesolutions.com",
          phone: "+1-555-5678",
          address: "456 Office Blvd, Chicago, IL 60601",
          productsSupplied: ["p3", "p4"]
        }
      ];
      setSuppliers(sampleSuppliers);
      localStorage.setItem('warehouse_suppliers', JSON.stringify(sampleSuppliers));
    }

    // Load purchase orders
    const savedOrders = localStorage.getItem('warehouse_orders');
    if (savedOrders) {
      setPurchaseOrders(JSON.parse(savedOrders));
    } else {
      // Set sample data if no data exists
      const sampleOrders: PurchaseOrder[] = [
        {
          id: "o1",
          poNumber: "PO-2024-001",
          supplier: "s1",
          orderDate: new Date(2024, 5, 15).toISOString(),
          expectedDelivery: new Date(2024, 5, 30).toISOString(),
          items: [
            {
              productId: "p1",
              productName: "Dell XPS 15",
              quantity: 10,
              unitPrice: 1299.99,
              totalPrice: 12999.90
            },
            {
              productId: "p2",
              productName: "Samsung 27\" Monitor",
              quantity: 15,
              unitPrice: 249.99,
              totalPrice: 3749.85
            }
          ],
          status: "Confirmed",
          totalAmount: 16749.75
        },
        {
          id: "o2",
          poNumber: "PO-2024-002",
          supplier: "s2",
          orderDate: new Date(2024, 5, 18).toISOString(),
          expectedDelivery: new Date(2024, 6, 2).toISOString(),
          items: [
            {
              productId: "p3",
              productName: "Office Desk",
              quantity: 5,
              unitPrice: 349.99,
              totalPrice: 1749.95
            },
            {
              productId: "p4",
              productName: "Ergonomic Chair",
              quantity: 10,
              unitPrice: 189.99,
              totalPrice: 1899.90
            }
          ],
          status: "Draft",
          totalAmount: 3649.85
        }
      ];
      setPurchaseOrders(sampleOrders);
      localStorage.setItem('warehouse_orders', JSON.stringify(sampleOrders));
    }

    // Load shipments
    const savedShipments = localStorage.getItem('warehouse_shipments');
    if (savedShipments) {
      setShipments(JSON.parse(savedShipments));
    } else {
      // Set sample data if no data exists
      const sampleShipments: Shipment[] = [
        {
          id: "sh1",
          shipmentNumber: "SHP-2024-001",
          customerName: "Acme Corporation",
          orderDate: new Date(2024, 5, 10).toISOString(),
          shipmentDate: new Date(2024, 5, 12).toISOString(),
          status: "Shipped",
          items: [
            {
              productId: "p1",
              productName: "Dell XPS 15",
              quantity: 5
            },
            {
              productId: "p2",
              productName: "Samsung 27\" Monitor",
              quantity: 8
            }
          ]
        },
        {
          id: "sh2",
          shipmentNumber: "SHP-2024-002",
          customerName: "GlobalTech Solutions",
          orderDate: new Date(2024, 5, 15).toISOString(),
          shipmentDate: new Date(2024, 5, 17).toISOString(),
          status: "Processing",
          items: [
            {
              productId: "p3",
              productName: "Office Desk",
              quantity: 3
            },
            {
              productId: "p4",
              productName: "Ergonomic Chair",
              quantity: 6
            }
          ]
        }
      ];
      setShipments(sampleShipments);
      localStorage.setItem('warehouse_shipments', JSON.stringify(sampleShipments));
    }

    // Load inventory movements
    const savedMovements = localStorage.getItem('warehouse_movements');
    if (savedMovements) {
      setInventoryMovements(JSON.parse(savedMovements));
    } else {
      // Set sample data if no data exists
      const sampleMovements: InventoryMovement[] = [
        {
          id: "m1",
          date: new Date(2024, 5, 10).toISOString(),
          productId: "p1",
          productName: "Dell XPS 15",
          type: "Inbound",
          quantity: 10,
          referenceNumber: "PO-2024-001",
          notes: "Received from TechSource Inc."
        },
        {
          id: "m2",
          date: new Date(2024, 5, 12).toISOString(),
          productId: "p1",
          productName: "Dell XPS 15",
          type: "Outbound",
          quantity: 5,
          referenceNumber: "SHP-2024-001",
          notes: "Shipped to Acme Corporation"
        },
        {
          id: "m3",
          date: new Date(2024, 5, 15).toISOString(),
          productId: "p2",
          productName: "Samsung 27\" Monitor",
          type: "Inbound",
          quantity: 15,
          referenceNumber: "PO-2024-001",
          notes: "Received from TechSource Inc."
        },
        {
          id: "m4",
          date: new Date(2024, 5, 15).toISOString(),
          productId: "p2",
          productName: "Samsung 27\" Monitor",
          type: "Outbound",
          quantity: 8,
          referenceNumber: "SHP-2024-001",
          notes: "Shipped to Acme Corporation"
        },
      ];
      setInventoryMovements(sampleMovements);
      localStorage.setItem('warehouse_movements', JSON.stringify(sampleMovements));
    }

    // Generate stock alerts based on product data
    const alerts: StockAlert[] = products
      .filter(product => product.quantity <= 15)
      .map(product => ({
        productId: product.id,
        productName: product.name,
        currentStock: product.quantity,
        minStockLevel: 5,
        reorderPoint: 15,
        status: product.quantity <= 0 ? 'Out of Stock' : 
                product.quantity <= 5 ? 'Critical' : 'Low'
      }));
    setStockAlerts(alerts);

  }, []);

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('warehouse_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('warehouse_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('warehouse_orders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);

  useEffect(() => {
    localStorage.setItem('warehouse_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('warehouse_movements', JSON.stringify(inventoryMovements));
  }, [inventoryMovements]);

  // Side effect - adjust sidebar visibility on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Add new product
  const addProduct = (product: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...product,
      id: `p${Date.now()}`,
      lastUpdated: new Date().toISOString()
    };

    setProducts([...products, newProduct]);
    setShowAddProductModal(false);

    // Add inventory movement for new product
    const movement: InventoryMovement = {
      id: `m${Date.now()}`,
      date: new Date().toISOString(),
      productId: newProduct.id,
      productName: newProduct.name,
      type: 'Inbound',
      quantity: newProduct.quantity,
      referenceNumber: 'Initial Stock',
      notes: 'Initial inventory setup'
    };

    setInventoryMovements([...inventoryMovements, movement]);
  };

  // Update existing product
  const updateProduct = (updatedProduct: Product) => {
    const prevProduct = products.find(p => p.id === updatedProduct.id);
    const quantityDifference = updatedProduct.quantity - (prevProduct?.quantity || 0);
    
    // Update product
    const updated = products.map(product => 
      product.id === updatedProduct.id ? 
        {...updatedProduct, lastUpdated: new Date().toISOString()} : 
        product
    );
    setProducts(updated);
    setShowEditProductModal(false);
    setCurrentProduct(null);

    // Add inventory movement if quantity changed
    if (quantityDifference !== 0) {
      const movement: InventoryMovement = {
        id: `m${Date.now()}`,
        date: new Date().toISOString(),
        productId: updatedProduct.id,
        productName: updatedProduct.name,
        type: quantityDifference > 0 ? 'Inbound' : 'Adjustment',
        quantity: Math.abs(quantityDifference),
        referenceNumber: 'Manual Adjustment',
        notes: `Manual inventory adjustment by ${Math.abs(quantityDifference)} units`
      };

      setInventoryMovements([...inventoryMovements, movement]);
    }
  };

  // Delete product
  const deleteProduct = (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!productToDelete) return;

    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete ${productToDelete.name}?`)) {
      setProducts(products.filter(product => product.id !== productId));

      // Add outbound movement for deleted product
      const movement: InventoryMovement = {
        id: `m${Date.now()}`,
        date: new Date().toISOString(),
        productId: productToDelete.id,
        productName: productToDelete.name,
        type: 'Adjustment',
        quantity: productToDelete.quantity,
        referenceNumber: 'Product Deleted',
        notes: 'Product removed from inventory'
      };

      setInventoryMovements([...inventoryMovements, movement]);
    }
  };

  // Add new supplier
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `s${Date.now()}`
    };

    setSuppliers([...suppliers, newSupplier]);
    setShowAddSupplierModal(false);
  };

  // Update existing supplier
  const updateSupplier = (updatedSupplier: Supplier) => {
    const updated = suppliers.map(supplier => 
      supplier.id === updatedSupplier.id ? updatedSupplier : supplier
    );
    setSuppliers(updated);
    setShowEditSupplierModal(false);
    setCurrentSupplier(null);
  };

  // Delete supplier
  const deleteSupplier = (supplierId: string) => {
    const supplierToDelete = suppliers.find(s => s.id === supplierId);
    if (!supplierToDelete) return;

    // Confirm deletion
    if (window.confirm(`Are you sure you want to delete ${supplierToDelete.name}?`)) {
      setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId));
    }
  };

  // Add new purchase order
  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id'>) => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: `o${Date.now()}`
    };

    setPurchaseOrders([...purchaseOrders, newOrder]);
    setShowAddOrderModal(false);
  };

  // Update purchase order status
  const updateOrderStatus = (orderId: string, newStatus: PurchaseOrder['status']) => {
    const updatedOrders = purchaseOrders.map(order => {
      if (order.id === orderId) {
        const updatedOrder = { ...order, status: newStatus };
        
        // If status changed to Received, update inventory
        if (newStatus === 'Received' && order.status !== 'Received') {
          // Increase product quantities
          const updatedProducts = [...products];
          
          for (const item of order.items) {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex >= 0) {
              updatedProducts[productIndex] = {
                ...updatedProducts[productIndex],
                quantity: updatedProducts[productIndex].quantity + item.quantity,
                lastUpdated: new Date().toISOString()
              };
            }
            
            // Add inventory movement
            const movement: InventoryMovement = {
              id: `m${Date.now()}-${item.productId}`,
              date: new Date().toISOString(),
              productId: item.productId,
              productName: item.productName,
              type: 'Inbound',
              quantity: item.quantity,
              referenceNumber: order.poNumber,
              notes: `Received from order ${order.poNumber}`
            };
            
            setInventoryMovements(prev => [...prev, movement]);
          }
          
          setProducts(updatedProducts);
        }
        
        return updatedOrder;
      }
      return order;
    });
    
    setPurchaseOrders(updatedOrders);
  };

  // Add new shipment
  const addShipment = (shipment: Omit<Shipment, 'id'>) => {
    const newShipment: Shipment = {
      ...shipment,
      id: `sh${Date.now()}`
    };

    setShipments([...shipments, newShipment]);
    setShowAddShipmentModal(false);

    // If status is Shipped or Delivered, decrease inventory
    if (shipment.status === 'Shipped' || shipment.status === 'Delivered') {
      // Decrease product quantities
      const updatedProducts = [...products];
      
      for (const item of shipment.items) {
        const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
        if (productIndex >= 0) {
          updatedProducts[productIndex] = {
            ...updatedProducts[productIndex],
            quantity: Math.max(0, updatedProducts[productIndex].quantity - item.quantity),
            lastUpdated: new Date().toISOString()
          };
        }
        
        // Add inventory movement
        const movement: InventoryMovement = {
          id: `m${Date.now()}-${item.productId}`,
          date: new Date().toISOString(),
          productId: item.productId,
          productName: item.productName,
          type: 'Outbound',
          quantity: item.quantity,
          referenceNumber: shipment.shipmentNumber,
          notes: `Shipped to ${shipment.customerName}`
        };
        
        setInventoryMovements(prev => [...prev, movement]);
      }
      
      setProducts(updatedProducts);
    }
  };

  // Update shipment status
  const updateShipmentStatus = (shipmentId: string, newStatus: Shipment['status']) => {
    const updatedShipments = shipments.map(shipment => {
      if (shipment.id === shipmentId) {
        const prevStatus = shipment.status;
        const updatedShipment = { ...shipment, status: newStatus };
        
        // If shipment wasn't shipped before but is now, update inventory
        if ((newStatus === 'Shipped' || newStatus === 'Delivered') && 
            (prevStatus !== 'Shipped' && prevStatus !== 'Delivered')) {
          // Decrease product quantities
          const updatedProducts = [...products];
          
          for (const item of shipment.items) {
            const productIndex = updatedProducts.findIndex(p => p.id === item.productId);
            if (productIndex >= 0) {
              updatedProducts[productIndex] = {
                ...updatedProducts[productIndex],
                quantity: Math.max(0, updatedProducts[productIndex].quantity - item.quantity),
                lastUpdated: new Date().toISOString()
              };
            }
            
            // Add inventory movement
            const movement: InventoryMovement = {
              id: `m${Date.now()}-${item.productId}`,
              date: new Date().toISOString(),
              productId: item.productId,
              productName: item.productName,
              type: 'Outbound',
              quantity: item.quantity,
              referenceNumber: shipment.shipmentNumber,
              notes: `Shipped to ${shipment.customerName}`
            };
            
            setInventoryMovements(prev => [...prev, movement]);
          }
          
          setProducts(updatedProducts);
        }
        
        return updatedShipment;
      }
      return shipment;
    });
    
    setShipments(updatedShipments);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Filter orders based on search and status
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      suppliers.find(s => s.id === order.supplier)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter shipments based on search and status
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = searchTerm === '' || 
      shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier => {
    return searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter inventory movements based on search
  const filteredMovements = inventoryMovements.filter(movement => {
    return searchTerm === '' || 
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Generate categories for filter dropdown
  const categories = ['all', ...new Set(products.map(product => product.category))];

  // Prepare dashboard data
  const prepareDashboardData = () => {
    // Inventory by category chart data
    const inventoryByCategory = products.reduce<Record<string, number>>(
      (acc, product) => {
        const category = product.category;
        acc[category] = (acc[category] || 0) + product.quantity;
        return acc;
      },
      {}
    );

    const inventoryCategoryData = Object.entries(inventoryByCategory).map(([category, count]) => ({
      name: category,
      value: count,
    }));

    // Recent movements
    const recentMovements = [...inventoryMovements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Inventory value
    const totalInventoryValue = products.reduce(
      (sum, product) => sum + product.quantity * product.unitPrice,
      0
    );

    // Pending orders value
    const pendingOrdersValue = purchaseOrders
      .filter(order => order.status === 'Confirmed')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    // Shipments in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentShipments = shipments.filter(
      shipment => new Date(shipment.shipmentDate) >= thirtyDaysAgo
    );

    return {
      inventoryCategoryData,
      recentMovements,
      totalInventoryValue,
      pendingOrdersValue,
      totalProducts: products.length,
      lowStockItems: stockAlerts.length,
      recentShipments: recentShipments.length,
      pendingOrders: purchaseOrders.filter(o => o.status === 'Confirmed').length,
    };
  };

  const dashboardData = prepareDashboardData();

  // COLORS for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#8DD1E1'];

  // Handlers for product forms
  const handleAddProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const newProduct = {
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string, 10),
      unit: formData.get('unit') as string,
      unitPrice: parseFloat(formData.get('unitPrice') as string),
      location: formData.get('location') as string
    };
    
    addProduct(newProduct);
    form.reset();
  };

  const handleEditProductSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentProduct) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const updatedProduct = {
      ...currentProduct,
      sku: formData.get('sku') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string, 10),
      unit: formData.get('unit') as string,
      unitPrice: parseFloat(formData.get('unitPrice') as string),
      location: formData.get('location') as string
    };
    
    updateProduct(updatedProduct);
  };

  // Handlers for supplier forms
  const handleAddSupplierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const selectedProductIds = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="products"]:checked'))
      .map(input => input.value);
    
    const newSupplier = {
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      productsSupplied: selectedProductIds
    };
    
    addSupplier(newSupplier);
    form.reset();
  };

  const handleEditSupplierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentSupplier) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const selectedProductIds = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="products"]:checked'))
      .map(input => input.value);
    
    const updatedSupplier = {
      ...currentSupplier,
      name: formData.get('name') as string,
      contactPerson: formData.get('contactPerson') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      productsSupplied: selectedProductIds
    };
    
    updateSupplier(updatedSupplier);
  };

  // Handlers for purchase order form
  const handleAddOrderSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Get selected items from the form
    const itemContainers = form.querySelectorAll('.order-item');
    const items: PurchaseOrderItem[] = [];
    let totalAmount = 0;
    
    itemContainers.forEach(container => {
      const productSelect = container.querySelector('select[name^="product"]') as HTMLSelectElement;
      const quantityInput = container.querySelector('input[name^="quantity"]') as HTMLInputElement;
      const unitPriceInput = container.querySelector('input[name^="unitPrice"]') as HTMLInputElement;
      
      if (productSelect && quantityInput && unitPriceInput) {
        const productId = productSelect.value;
        const product = products.find(p => p.id === productId);
        
        if (product) {
          const quantity = parseInt(quantityInput.value, 10);
          const unitPrice = parseFloat(unitPriceInput.value);
          const totalPrice = quantity * unitPrice;
          
          items.push({
            productId,
            productName: product.name,
            quantity,
            unitPrice,
            totalPrice
          });
          
          totalAmount += totalPrice;
        }
      }
    });
    
    const newOrder = {
      poNumber: formData.get('poNumber') as string,
      supplier: formData.get('supplier') as string,
      orderDate: new Date(formData.get('orderDate') as string).toISOString(),
      expectedDelivery: new Date(formData.get('expectedDelivery') as string).toISOString(),
      items,
      status: 'Draft' as const,
      totalAmount
    };
    
    addPurchaseOrder(newOrder);
    form.reset();
  };

  // Handlers for shipment form
  const handleAddShipmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Get selected items from the form
    const itemContainers = form.querySelectorAll('.shipment-item');
    const items: ShipmentItem[] = [];
    
    itemContainers.forEach(container => {
      const productSelect = container.querySelector('select[name^="product"]') as HTMLSelectElement;
      const quantityInput = container.querySelector('input[name^="quantity"]') as HTMLInputElement;
      
      if (productSelect && quantityInput) {
        const productId = productSelect.value;
        const product = products.find(p => p.id === productId);
        
        if (product) {
          const quantity = parseInt(quantityInput.value, 10);
          
          items.push({
            productId,
            productName: product.name,
            quantity
          });
        }
      }
    });
    
    const newShipment = {
      shipmentNumber: formData.get('shipmentNumber') as string,
      customerName: formData.get('customerName') as string,
      orderDate: new Date(formData.get('orderDate') as string).toISOString(),
      shipmentDate: new Date(formData.get('shipmentDate') as string).toISOString(),
      items,
      status: formData.get('status') as Shipment['status']
    };
    
    addShipment(newShipment);
    form.reset();
  };

  // Function to download inventory as CSV
  const downloadInventoryCsv = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Location', 'Last Updated'];
    
    const csvRows = [
      headers.join(','),
      ...products.map(product => {
        return [
          product.sku,
          `"${product.name}"`,
          product.category,
          product.quantity,
          product.unit,
          product.unitPrice,
          `"${product.location}"`,
          format(new Date(product.lastUpdated), 'yyyy-MM-dd HH:mm')
        ].join(',');
      })
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to download an inventory template
  const downloadTemplateFile = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Unit', 'Unit Price', 'Location'];
    const sampleRow = ['SKU-001', 'Product Name', 'Category', '10', 'pcs', '100.00', 'A1-B2-C3'];
    
    const csvRows = [
      headers.join(','),
      sampleRow.join(',')
    ];
    
    const csvContent = csvRows.join('\n');
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
        <div className="container-fluid px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none theme-transition"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white ml-2 md:ml-0 theme-transition">
              Warehouse Management System
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                className="input-responsive pl-9 py-2 w-40 md:w-64 bg-gray-100 dark:bg-gray-700 theme-transition"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            </div>
            <button 
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none theme-transition"
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 z-40 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out pt-16 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 theme-transition`}
        >
          <nav className="mt-5 px-4">
            <ul className="space-y-2">
              <li>
                <button
                  className={`flex items-center w-full px-4 py-2 rounded-md ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} theme-transition`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Home size={18} className="mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full px-4 py-2 rounded-md ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} theme-transition`}
                  onClick={() => {
                    setActiveTab('inventory');
                    setInventorySubTab('list');
                  }}
                >
                  <Package size={18} className="mr-3" />
                  <span>Inventory</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full px-4 py-2 rounded-md ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} theme-transition`}
                  onClick={() => {
                    setActiveTab('orders');
                    setOrdersSubTab('list');
                  }}
                >
                  <Clipboard size={18} className="mr-3" />
                  <span>Purchase Orders</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full px-4 py-2 rounded-md ${activeTab === 'shipments' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} theme-transition`}
                  onClick={() => {
                    setActiveTab('shipments');
                    setShipmentsSubTab('list');
                  }}
                >
                  <Truck size={18} className="mr-3" />
                  <span>Shipments</span>
                </button>
              </li>
              <li>
                <button
                  className={`flex items-center w-full px-4 py-2 rounded-md ${activeTab === 'suppliers' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'} theme-transition`}
                  onClick={() => {
                    setActiveTab('suppliers');
                    setSuppliersSubTab('list');
                  }}
                >
                  <Users size={18} className="mr-3" />
                  <span>Suppliers</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-auto pt-16 pb-6 md:ml-64">
          <div className="container-fluid px-4 sm:px-6 py-4">
            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white theme-transition">Dashboard</h2>
                  <div className="flex space-x-2">
                    <button 
                      className="btn btn-sm btn-primary flex items-center gap-2"
                      onClick={() => setActiveTab('inventory')}
                    >
                      <Package size={16} />
                      <span className="hidden sm:inline">Manage Inventory</span>
                      <span className="sm:hidden">Inventory</span>
                    </button>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Total Inventory</div>
                        <div className="stat-value">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(dashboardData.totalInventoryValue)}
                        </div>
                        <div className="stat-desc">{dashboardData.totalProducts} products</div>
                      </div>
                      <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 theme-transition">
                        <Package size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Pending Orders</div>
                        <div className="stat-value">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(dashboardData.pendingOrdersValue)}
                        </div>
                        <div className="stat-desc">{dashboardData.pendingOrders} orders</div>
                      </div>
                      <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 theme-transition">
                        <Clipboard size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Recent Shipments</div>
                        <div className="stat-value">{dashboardData.recentShipments}</div>
                        <div className="stat-desc">Last 30 days</div>
                      </div>
                      <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 theme-transition">
                        <Truck size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="stat-title">Low Stock Items</div>
                        <div className="stat-value">{dashboardData.lowStockItems}</div>
                        <div className="stat-desc">Need attention</div>
                      </div>
                      <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 theme-transition">
                        <RefreshCw size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 theme-transition">Inventory by Category</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={dashboardData.inventoryCategoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {dashboardData.inventoryCategoryData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Quantity']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 theme-transition">Stock Levels</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={products.slice(0, 5)}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} height={60} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="quantity" name="Quantity" fill="#0088FE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Recent activity and alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white theme-transition">Recent Activity</h3>
                      <button 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm theme-transition"
                        onClick={() => {
                          setActiveTab('inventory');
                          setInventorySubTab('movements');
                        }}
                      >
                        View All
                      </button>
                    </div>
                    <div className="overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="table-header">Product</th>
                            <th className="table-header">Type</th>
                            <th className="table-header">Quantity</th>
                            <th className="table-header">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                          {dashboardData.recentMovements.map(movement => (
                            <tr key={movement.id}>
                              <td className="table-cell">{movement.productName}</td>
                              <td className="table-cell">
                                <span className={
                                  `badge 
                                  ${movement.type === 'Inbound' ? 'badge-success' : 
                                    movement.type === 'Outbound' ? 'badge-error' : 'badge-warning'}
                                  `
                                }>
                                  {movement.type}
                                </span>
                              </td>
                              <td className="table-cell">{movement.quantity}</td>
                              <td className="table-cell">{format(new Date(movement.date), 'MMM dd, yyyy')}</td>
                            </tr>
                          ))}
                          {dashboardData.recentMovements.length === 0 && (
                            <tr>
                              <td colSpan={4} className="table-cell text-center">No recent activity</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="card">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white theme-transition">Stock Alerts</h3>
                      <button 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm theme-transition"
                        onClick={() => {
                          setActiveTab('inventory');
                          setInventorySubTab('alerts');
                        }}
                      >
                        View All
                      </button>
                    </div>
                    <div className="overflow-hidden">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="table-header">Product</th>
                            <th className="table-header">Current</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                          {stockAlerts.slice(0, 5).map(alert => (
                            <tr key={alert.productId}>
                              <td className="table-cell">{alert.productName}</td>
                              <td className="table-cell">{alert.currentStock}</td>
                              <td className="table-cell">
                                <span className={
                                  `badge 
                                  ${alert.status === 'Critical' ? 'badge-error' : 
                                    alert.status === 'Out of Stock' ? 'badge-error' : 'badge-warning'}
                                  `
                                }>
                                  {alert.status}
                                </span>
                              </td>
                              <td className="table-cell">
                                <button 
                                  className="btn btn-sm btn-primary"
                                  onClick={() => {
                                    setActiveTab('orders');
                                    setOrdersSubTab('create');
                                  }}
                                >
                                  Order
                                </button>
                              </td>
                            </tr>
                          ))}
                          {stockAlerts.length === 0 && (
                            <tr>
                              <td colSpan={4} className="table-cell text-center">No stock alerts</td>
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
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0 theme-transition">Inventory Management</h2>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className={`btn btn-sm ${inventorySubTab === 'list' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setInventorySubTab('list')}
                    >
                      Product List
                    </button>
                    <button 
                      className={`btn btn-sm ${inventorySubTab === 'movements' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setInventorySubTab('movements')}
                    >
                      Movements
                    </button>
                    <button 
                      className={`btn btn-sm ${inventorySubTab === 'alerts' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setInventorySubTab('alerts')}
                    >
                      Stock Alerts
                    </button>
                  </div>
                </div>

                {inventorySubTab === 'list' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative">
                          <input
                            type="text"
                            className="input-responsive pl-9 py-2 w-full sm:w-64 bg-white dark:bg-gray-700 theme-transition"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <div className="relative">
                          <select 
                            className="input-responsive pl-3 pr-8 py-2 appearance-none bg-white dark:bg-gray-700 theme-transition"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category === 'all' ? 'All Categories' : category}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-start sm:justify-end">
                        <button 
                          className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center gap-2 theme-transition"
                          onClick={downloadInventoryCsv}
                        >
                          <Download size={16} />
                          Export
                        </button>
                        <button 
                          className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 flex items-center gap-2 theme-transition"
                          onClick={downloadTemplateFile}
                        >
                          <FileText size={16} />
                          Template
                        </button>
                        <button 
                          className="btn btn-sm btn-primary flex items-center gap-2"
                          onClick={() => setShowAddProductModal(true)}
                        >
                          <Plus size={16} />
                          Add Product
                        </button>
                      </div>
                    </div>

                    <div className="card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">SKU</th>
                              <th className="table-header">Name</th>
                              <th className="table-header">Category</th>
                              <th className="table-header">Quantity</th>
                              <th className="table-header">Unit Price</th>
                              <th className="table-header">Location</th>
                              <th className="table-header">Last Updated</th>
                              <th className="table-header">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                            {filteredProducts.map(product => (
                              <tr key={product.id}>
                                <td className="table-cell font-medium">{product.sku}</td>
                                <td className="table-cell">{product.name}</td>
                                <td className="table-cell">{product.category}</td>
                                <td className="table-cell">
                                  <span className={
                                    `font-medium 
                                    ${product.quantity <= 0 ? 'text-red-600 dark:text-red-400' : 
                                      product.quantity <= 5 ? 'text-orange-600 dark:text-orange-400' : 
                                      product.quantity <= 15 ? 'text-yellow-600 dark:text-yellow-400' : 
                                      'text-green-600 dark:text-green-400'}
                                    theme-transition`
                                  }>
                                    {product.quantity}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400 ml-1 theme-transition">{product.unit}</span>
                                </td>
                                <td className="table-cell">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  }).format(product.unitPrice)}
                                </td>
                                <td className="table-cell">{product.location}</td>
                                <td className="table-cell">{format(new Date(product.lastUpdated), 'MMM dd, yyyy')}</td>
                                <td className="table-cell">
                                  <div className="flex space-x-2">
                                    <button 
                                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 theme-transition"
                                      onClick={() => {
                                        setCurrentProduct(product);
                                        setShowEditProductModal(true);
                                      }}
                                      aria-label={`Edit ${product.name}`}
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button 
                                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 theme-transition"
                                      onClick={() => deleteProduct(product.id)}
                                      aria-label={`Delete ${product.name}`}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {filteredProducts.length === 0 && (
                              <tr>
                                <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 theme-transition">
                                  No products found. Add a new product or adjust your search.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {inventorySubTab === 'movements' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          className="input-responsive pl-9 py-2 w-full sm:w-64 bg-white dark:bg-gray-700 theme-transition"
                          placeholder="Search movements..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      </div>
                    </div>

                    <div className="card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">Date</th>
                              <th className="table-header">Product</th>
                              <th className="table-header">Type</th>
                              <th className="table-header">Quantity</th>
                              <th className="table-header">Reference</th>
                              <th className="table-header">Notes</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                            {filteredMovements.map(movement => (
                              <tr key={movement.id}>
                                <td className="table-cell">{format(new Date(movement.date), 'MMM dd, yyyy HH:mm')}</td>
                                <td className="table-cell">{movement.productName}</td>
                                <td className="table-cell">
                                  <span className={
                                    `badge 
                                    ${movement.type === 'Inbound' ? 'badge-success' : 
                                      movement.type === 'Outbound' ? 'badge-error' : 'badge-warning'}
                                    `
                                  }>
                                    {movement.type}
                                  </span>
                                </td>
                                <td className="table-cell">{movement.quantity}</td>
                                <td className="table-cell">{movement.referenceNumber}</td>
                                <td className="table-cell">{movement.notes}</td>
                              </tr>
                            ))}
                            {filteredMovements.length === 0 && (
                              <tr>
                                <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 theme-transition">
                                  No movements found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {inventorySubTab === 'alerts' && (
                  <div>
                    <div className="card overflow-hidden mb-6">
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">Product</th>
                              <th className="table-header">Current Stock</th>
                              <th className="table-header">Min Level</th>
                              <th className="table-header">Reorder Point</th>
                              <th className="table-header">Status</th>
                              <th className="table-header">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                            {stockAlerts.map(alert => (
                              <tr key={alert.productId}>
                                <td className="table-cell">{alert.productName}</td>
                                <td className="table-cell font-medium">{alert.currentStock}</td>
                                <td className="table-cell">{alert.minStockLevel}</td>
                                <td className="table-cell">{alert.reorderPoint}</td>
                                <td className="table-cell">
                                  <span className={
                                    `badge 
                                    ${alert.status === 'Critical' ? 'badge-error' : 
                                      alert.status === 'Out of Stock' ? 'badge-error' : 'badge-warning'}
                                    `
                                  }>
                                    {alert.status}
                                  </span>
                                </td>
                                <td className="table-cell">
                                  <div className="flex space-x-2">
                                    <button 
                                      className="btn btn-sm btn-primary"
                                      onClick={() => {
                                        setActiveTab('orders');
                                        setOrdersSubTab('create');
                                      }}
                                    >
                                      Reorder
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {stockAlerts.length === 0 && (
                              <tr>
                                <td colSpan={6} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 theme-transition">
                                  No stock alerts. All inventory levels are good.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {stockAlerts.length > 0 && (
                      <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 theme-transition">Low Stock Items Distribution</h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stockAlerts}
                              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="productName" tick={{ fontSize: 12 }} height={60} tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value} />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="currentStock" name="Current Stock" fill="#FF8042" />
                              <Bar dataKey="reorderPoint" name="Reorder Point" fill="#8884D8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Purchase Orders */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0 theme-transition">Purchase Orders</h2>
                  <div className="flex gap-2">
                    <button 
                      className={`btn btn-sm ${ordersSubTab === 'list' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setOrdersSubTab('list')}
                    >
                      Order List
                    </button>
                    <button 
                      className={`btn btn-sm ${ordersSubTab === 'create' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setOrdersSubTab('create')}
                    >
                      Create Order
                    </button>
                  </div>
                </div>

                {ordersSubTab === 'list' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative">
                          <input
                            type="text"
                            className="input-responsive pl-9 py-2 w-full sm:w-64 bg-white dark:bg-gray-700 theme-transition"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <div className="relative">
                          <select 
                            className="input-responsive pl-3 pr-8 py-2 appearance-none bg-white dark:bg-gray-700 theme-transition"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="all">All Statuses</option>
                            <option value="Draft">Draft</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Received">Received</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                        <button 
                          className="btn btn-sm btn-primary flex items-center gap-2"
                          onClick={() => setOrdersSubTab('create')}
                        >
                          <Plus size={16} />
                          New Order
                        </button>
                      </div>
                    </div>

                    <div className="card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">PO Number</th>
                              <th className="table-header">Supplier</th>
                              <th className="table-header">Order Date</th>
                              <th className="table-header">Expected Delivery</th>
                              <th className="table-header">Total Amount</th>
                              <th className="table-header">Status</th>
                              <th className="table-header">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                            {filteredOrders.map(order => (
                              <tr key={order.id}>
                                <td className="table-cell font-medium">{order.poNumber}</td>
                                <td className="table-cell">
                                  {suppliers.find(s => s.id === order.supplier)?.name || 'Unknown'}
                                </td>
                                <td className="table-cell">{format(new Date(order.orderDate), 'MMM dd, yyyy')}</td>
                                <td className="table-cell">{format(new Date(order.expectedDelivery), 'MMM dd, yyyy')}</td>
                                <td className="table-cell">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: 'USD'
                                  }).format(order.totalAmount)}
                                </td>
                                <td className="table-cell">
                                  <span className={
                                    `badge 
                                    ${order.status === 'Draft' ? 'badge-warning' : 
                                      order.status === 'Confirmed' ? 'badge-info' : 
                                      order.status === 'Received' ? 'badge-success' : 
                                      'badge-error'}
                                    `
                                  }>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="table-cell">
                                  <div className="flex space-x-2">
                                    {order.status === 'Draft' && (
                                      <button 
                                        className="btn btn-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 theme-transition"
                                        onClick={() => updateOrderStatus(order.id, 'Confirmed')}
                                      >
                                        Confirm
                                      </button>
                                    )}
                                    {order.status === 'Confirmed' && (
                                      <button 
                                        className="btn btn-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 theme-transition"
                                        onClick={() => updateOrderStatus(order.id, 'Received')}
                                      >
                                        Mark Received
                                      </button>
                                    )}
                                    {(order.status === 'Draft' || order.status === 'Confirmed') && (
                                      <button 
                                        className="btn btn-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 theme-transition"
                                        onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {filteredOrders.length === 0 && (
                              <tr>
                                <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 theme-transition">
                                  No purchase orders found. Create a new order or adjust your search.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {ordersSubTab === 'create' && (
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 theme-transition">Create Purchase Order</h3>
                    
                    <form onSubmit={handleAddOrderSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="poNumber">PO Number</label>
                          <input 
                            type="text" 
                            id="poNumber" 
                            name="poNumber" 
                            className="input" 
                            placeholder="e.g. PO-2024-005"
                            required 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label" htmlFor="supplier">Supplier</label>
                          <select id="supplier" name="supplier" className="input" required>
                            <option value="">Select Supplier</option>
                            {suppliers.map(supplier => (
                              <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label" htmlFor="orderDate">Order Date</label>
                          <input 
                            type="date" 
                            id="orderDate" 
                            name="orderDate" 
                            className="input" 
                            defaultValue={format(new Date(), 'yyyy-MM-dd')}
                            required 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label" htmlFor="expectedDelivery">Expected Delivery</label>
                          <input 
                            type="date" 
                            id="expectedDelivery" 
                            name="expectedDelivery" 
                            className="input" 
                            defaultValue={format(new Date(new Date().setDate(new Date().getDate() + 14)), 'yyyy-MM-dd')}
                            required 
                          />
                        </div>
                      </div>
                      
                      <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3 theme-transition">Order Items</h4>
                      
                      <div className="order-items space-y-4 mb-6">
                        <div className="order-item p-4 bg-gray-50 dark:bg-gray-700 rounded-md theme-transition">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-group">
                              <label className="form-label" htmlFor="product-1">Product</label>
                              <select id="product-1" name="product-1" className="input" required>
                                <option value="">Select Product</option>
                                {products.map(product => (
                                  <option key={product.id} value={product.id}>{product.name}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label" htmlFor="quantity-1">Quantity</label>
                              <input 
                                type="number" 
                                id="quantity-1" 
                                name="quantity-1" 
                                className="input" 
                                min="1"
                                placeholder="Quantity"
                                required 
                              />
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label" htmlFor="unitPrice-1">Unit Price</label>
                              <input 
                                type="number" 
                                id="unitPrice-1" 
                                name="unitPrice-1" 
                                className="input" 
                                min="0.01"
                                step="0.01"
                                placeholder="Unit Price"
                                required 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-6">
                        <button 
                          type="button"
                          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                          onClick={() => {
                            const orderItemsContainer = document.querySelector('.order-items');
                            if (orderItemsContainer) {
                              const lastItem = orderItemsContainer.lastElementChild;
                              if (lastItem) {
                                const clone = lastItem.cloneNode(true) as HTMLElement;
                                const itemCount = orderItemsContainer.childElementCount + 1;
                                
                                // Update IDs and names
                                const productSelect = clone.querySelector('select[name^="product"]') as HTMLSelectElement;
                                const quantityInput = clone.querySelector('input[name^="quantity"]') as HTMLInputElement;
                                const unitPriceInput = clone.querySelector('input[name^="unitPrice"]') as HTMLInputElement;
                                
                                if (productSelect) {
                                  productSelect.id = `product-${itemCount}`;
                                  productSelect.name = `product-${itemCount}`;
                                  productSelect.value = '';
                                  const label = productSelect.previousElementSibling as HTMLLabelElement;
                                  if (label) label.htmlFor = `product-${itemCount}`;
                                }
                                
                                if (quantityInput) {
                                  quantityInput.id = `quantity-${itemCount}`;
                                  quantityInput.name = `quantity-${itemCount}`;
                                  quantityInput.value = '';
                                  const label = quantityInput.previousElementSibling as HTMLLabelElement;
                                  if (label) label.htmlFor = `quantity-${itemCount}`;
                                }
                                
                                if (unitPriceInput) {
                                  unitPriceInput.id = `unitPrice-${itemCount}`;
                                  unitPriceInput.name = `unitPrice-${itemCount}`;
                                  unitPriceInput.value = '';
                                  const label = unitPriceInput.previousElementSibling as HTMLLabelElement;
                                  if (label) label.htmlFor = `unitPrice-${itemCount}`;
                                }
                                
                                orderItemsContainer.appendChild(clone);
                              }
                            }
                          }}
                        >
                          Add Item
                        </button>
                        
                        <button 
                          type="submit"
                          className="btn btn-primary"
                        >
                          Create Purchase Order
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Shipments */}
            {activeTab === 'shipments' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0 theme-transition">Shipments</h2>
                  <div className="flex gap-2">
                    <button 
                      className={`btn btn-sm ${shipmentsSubTab === 'list' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setShipmentsSubTab('list')}
                    >
                      Shipment List
                    </button>
                    <button 
                      className={`btn btn-sm ${shipmentsSubTab === 'create' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setShipmentsSubTab('create')}
                    >
                      Create Shipment
                    </button>
                  </div>
                </div>

                {shipmentsSubTab === 'list' && (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative">
                          <input
                            type="text"
                            className="input-responsive pl-9 py-2 w-full sm:w-64 bg-white dark:bg-gray-700 theme-transition"
                            placeholder="Search shipments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                        <div className="relative">
                          <select 
                            className="input-responsive pl-3 pr-8 py-2 appearance-none bg-white dark:bg-gray-700 theme-transition"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="all">All Statuses</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto justify-start sm:justify-end">
                        <button 
                          className="btn btn-sm btn-primary flex items-center gap-2"
                          onClick={() => setShipmentsSubTab('create')}
                        >
                          <Plus size={16} />
                          New Shipment
                        </button>
                      </div>
                    </div>

                    <div className="card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">Shipment #</th>
                              <th className="table-header">Customer</th>
                              <th className="table-header">Order Date</th>
                              <th className="table-header">Shipment Date</th>
                              <th className="table-header">Items</th>
                              <th className="table-header">Status</th>
                              <th className="table-header">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700 theme-transition">
                            {filteredShipments.map(shipment => (
                              <tr key={shipment.id}>
                                <td className="table-cell font-medium">{shipment.shipmentNumber}</td>
                                <td className="table-cell">{shipment.customerName}</td>
                                <td className="table-cell">{format(new Date(shipment.orderDate), 'MMM dd, yyyy')}</td>
                                <td className="table-cell">{format(new Date(shipment.shipmentDate), 'MMM dd, yyyy')}</td>
                                <td className="table-cell">{shipment.items.length} items</td>
                                <td className="table-cell">
                                  <span className={
                                    `badge 
                                    ${shipment.status === 'Processing' ? 'badge-warning' : 
                                      shipment.status === 'Shipped' ? 'badge-info' : 
                                      shipment.status === 'Delivered' ? 'badge-success' : 
                                      'badge-error'}
                                    `
                                  }>
                                    {shipment.status}
                                  </span>
                                </td>
                                <td className="table-cell">
                                  <div className="flex space-x-2">
                                    {shipment.status === 'Processing' && (
                                      <button 
                                        className="btn btn-xs bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 theme-transition"
                                        onClick={() => updateShipmentStatus(shipment.id, 'Shipped')}
                                      >
                                        Ship
                                      </button>
                                    )}
                                    {shipment.status === 'Shipped' && (
                                      <button 
                                        className="btn btn-xs bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800 theme-transition"
                                        onClick={() => updateShipmentStatus(shipment.id, 'Delivered')}
                                      >
                                        Deliver
                                      </button>
                                    )}
                                    {(shipment.status === 'Processing') && (
                                      <button 
                                        className="btn btn-xs bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 theme-transition"
                                        onClick={() => updateShipmentStatus(shipment.id, 'Cancelled')}
                                      >
                                        Cancel
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {filteredShipments.length === 0 && (
                              <tr>
                                <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400 theme-transition">
                                  No shipments found. Create a new shipment or adjust your search.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {shipmentsSubTab === 'create' && (
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 theme-transition">Create Shipment</h3>
                    
                    <form onSubmit={handleAddShipmentSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="shipmentNumber">Shipment Number</label>
                          <input 
                            type="text" 
                            id="shipmentNumber" 
                            name="shipmentNumber" 
                            className="input" 
                            placeholder="e.g. SHP-2024-005"
                            required 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label" htmlFor="customerName">Customer Name</label>
                          <input 
                            type="text" 
                            id="customerName" 
                            name="customerName" 
                            className="input" 
                            placeholder="Customer Name"
                            required 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label" htmlFor="orderDate">Order Date</label>
                          <input 
                            type="date" 
                            id="orderDate" 
                            name="orderDate" 
                            className="input" 
                            defaultValue={format(new Date(), 'yyyy-MM-dd')}
                            required 
                          />
                        </div>
                        
                        <div className="form-group">
                          <label className="form-label" htmlFor="shipmentDate">Shipment Date</label>
                          <input 
                            type="date" 
                            id="shipmentDate" 
                            name="shipmentDate" 
                            className="input" 
                            defaultValue={format(new Date(), 'yyyy-MM-dd')}
                            required 
                          />
                        </div>

                        <div className="form-group md:col-span-2">
                          <label className="form-label" htmlFor="status">Status</label>
                          <select id="status" name="status" className="input" required>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </div>
                      </div>
                      
                      <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3 theme-transition">Shipment Items</h4>
                      
                      <div className="shipment-items space-y-4 mb-6">
                        <div className="shipment-item p-4 bg-gray-50 dark:bg-gray-700 rounded-md theme-transition">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group">
                              <label className="form-label" htmlFor="product-1">Product</label>
                              <select id="product-1" name="product-1" className="input" required>
                                <option value="">Select Product</option>
                                {products.map(product => (
                                  <option key={product.id} value={product.id}>
                                    {product.name} ({product.quantity} in stock)
                                  </option>
                                ))}
                              </select>
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label" htmlFor="quantity-1">Quantity</label>
                              <input 
                                type="number" 
                                id="quantity-1" 
                                name="quantity-1" 
                                className="input" 
                                min="1"
                                placeholder="Quantity"
                                required 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-6">
                        <button 
                          type="button"
                          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                          onClick={() => {
                            const shipmentItemsContainer = document.querySelector('.shipment-items');
                            if (shipmentItemsContainer) {
                              const lastItem = shipmentItemsContainer.lastElementChild;
                              if (lastItem) {
                                const clone = lastItem.cloneNode(true) as HTMLElement;
                                const itemCount = shipmentItemsContainer.childElementCount + 1;
                                
                                // Update IDs and names
                                const productSelect = clone.querySelector('select[name^="product"]') as HTMLSelectElement;
                                const quantityInput = clone.querySelector('input[name^="quantity"]') as HTMLInputElement;
                                
                                if (productSelect) {
                                  productSelect.id = `product-${itemCount}`;
                                  productSelect.name = `product-${itemCount}`;
                                  productSelect.value = '';
                                  const label = productSelect.previousElementSibling as HTMLLabelElement;
                                  if (label) label.htmlFor = `product-${itemCount}`;
                                }
                                
                                if (quantityInput) {
                                  quantityInput.id = `quantity-${itemCount}`;
                                  quantityInput.name = `quantity-${itemCount}`;
                                  quantityInput.value = '';
                                  const label = quantityInput.previousElementSibling as HTMLLabelElement;
                                  if (label) label.htmlFor = `quantity-${itemCount}`;
                                }
                                
                                shipmentItemsContainer.appendChild(clone);
                              }
                            }
                          }}
                        >
                          Add Item
                        </button>
                        
                        <button 
                          type="submit"
                          className="btn btn-primary"
                        >
                          Create Shipment
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Suppliers */}
            {activeTab === 'suppliers' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white mb-4 sm:mb-0 theme-transition">Suppliers</h2>
                  <div className="flex gap-2">
                    <button 
                      className={`btn btn-sm ${suppliersSubTab === 'list' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setSuppliersSubTab('list')}
                    >
                      Supplier List
                    </button>
                    <button 
                      className={`btn btn-sm ${suppliersSubTab === 'add' ? 'btn-primary' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} theme-transition`}
                      onClick={() => setSuppliersSubTab('add')}
                    >
                      Add Supplier
                    </button>
                  </div>
                </div>

                {suppliersSubTab === 'list' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="relative">
                        <input
                          type="text"
                          className="input-responsive pl-9 py-2 w-full sm:w-64 bg-white dark:bg-gray-700 theme-transition"
                          placeholder="Search suppliers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      </div>
                      <button 
                        className="btn btn-sm btn-primary flex items-center gap-2"
                        onClick={() => setShowAddSupplierModal(true)}
                      >
                        <Plus size={16} />
                        Add Supplier
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredSuppliers.map(supplier => (
                        <div key={supplier.id} className="card">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white theme-transition">{supplier.name}</h3>
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 theme-transition"
                                onClick={() => {
                                  setCurrentSupplier(supplier);
                                  setShowEditSupplierModal(true);
                                }}
                                aria-label={`Edit ${supplier.name}`}
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 theme-transition"
                                onClick={() => deleteSupplier(supplier.id)}
                                aria-label={`Delete ${supplier.name}`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 theme-transition">
                              <span className="font-medium text-gray-700 dark:text-gray-200 theme-transition">Contact: </span>
                              {supplier.contactPerson}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 theme-transition">
                              <span className="font-medium text-gray-700 dark:text-gray-200 theme-transition">Email: </span>
                              {supplier.email}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 theme-transition">
                              <span className="font-medium text-gray-700 dark:text-gray-200 theme-transition">Phone: </span>
                              {supplier.phone}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 theme-transition">
                              <span className="font-medium text-gray-700 dark:text-gray-200 theme-transition">Address: </span>
                              {supplier.address}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 theme-transition">Products Supplied:</h4>
                            <div className="flex flex-wrap gap-2">
                              {supplier.productsSupplied.map(productId => {
                                const product = products.find(p => p.id === productId);
                                return product ? (
                                  <span 
                                    key={productId} 
                                    className="inline-block px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 theme-transition"
                                  >
                                    {product.name}
                                  </span>
                                ) : null;
                              })}
                              {supplier.productsSupplied.length === 0 && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 theme-transition">No products</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {filteredSuppliers.length === 0 && (
                        <div className="md:col-span-2 xl:col-span-3 py-8 text-center text-gray-500 dark:text-gray-400 theme-transition">
                          No suppliers found. Add a new supplier or adjust your search.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {suppliersSubTab === 'add' && (
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 theme-transition">Add New Supplier</h3>
                    <form onSubmit={handleAddSupplierSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="name">Supplier Name</label>
                          <input type="text" id="name" name="name" className="input" required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="contactPerson">Contact Person</label>
                          <input type="text" id="contactPerson" name="contactPerson" className="input" required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="email">Email</label>
                          <input type="email" id="email" name="email" className="input" required />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="phone">Phone</label>
                          <input type="tel" id="phone" name="phone" className="input" required />
                        </div>
                        <div className="form-group md:col-span-2">
                          <label className="form-label" htmlFor="address">Address</label>
                          <textarea id="address" name="address" rows={3} className="input" required></textarea>
                        </div>
                      </div>
                      
                      <h4 className="text-md font-medium text-gray-800 dark:text-white mb-3 theme-transition">Products Supplied</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                        {products.map(product => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <input 
                              type="checkbox" 
                              id={`product-${product.id}`} 
                              name="products" 
                              value={product.id} 
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600 theme-transition" 
                            />
                            <label htmlFor={`product-${product.id}`} className="text-sm text-gray-700 dark:text-gray-300 theme-transition">
                              {product.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <button 
                          type="button"
                          className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                          onClick={() => setSuppliersSubTab('list')}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">Add Supplier</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-4 text-center text-sm text-gray-600 dark:text-gray-400 theme-transition">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Modals */}
      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white theme-transition">
                Add New Product
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setShowAddProductModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProductSubmit}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="sku">SKU</label>
                  <input type="text" id="sku" name="sku" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Product Name</label>
                  <input type="text" id="name" name="name" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="category">Category</label>
                  <input type="text" id="category" name="category" className="input" list="categories" required />
                  <datalist id="categories">
                    {[...new Set(products.map(product => product.category))].map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="quantity">Quantity</label>
                  <input type="number" id="quantity" name="quantity" className="input" min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="unit">Unit</label>
                  <input type="text" id="unit" name="unit" className="input" defaultValue="pcs" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="unitPrice">Unit Price</label>
                  <input type="number" id="unitPrice" name="unitPrice" className="input" min="0" step="0.01" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="location">Location</label>
                  <input type="text" id="location" name="location" className="input" required />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                  onClick={() => setShowAddProductModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && currentProduct && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white theme-transition">
                Edit Product: {currentProduct.name}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => {
                  setShowEditProductModal(false);
                  setCurrentProduct(null);
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditProductSubmit}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-sku">SKU</label>
                  <input 
                    type="text" 
                    id="edit-sku" 
                    name="sku" 
                    className="input" 
                    defaultValue={currentProduct.sku}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-name">Product Name</label>
                  <input 
                    type="text" 
                    id="edit-name" 
                    name="name" 
                    className="input" 
                    defaultValue={currentProduct.name}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-category">Category</label>
                  <input 
                    type="text" 
                    id="edit-category" 
                    name="category" 
                    className="input" 
                    list="edit-categories" 
                    defaultValue={currentProduct.category}
                    required 
                  />
                  <datalist id="edit-categories">
                    {[...new Set(products.map(product => product.category))].map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-quantity">Quantity</label>
                  <input 
                    type="number" 
                    id="edit-quantity" 
                    name="quantity" 
                    className="input" 
                    min="0" 
                    defaultValue={currentProduct.quantity}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-unit">Unit</label>
                  <input 
                    type="text" 
                    id="edit-unit" 
                    name="unit" 
                    className="input" 
                    defaultValue={currentProduct.unit}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-unitPrice">Unit Price</label>
                  <input 
                    type="number" 
                    id="edit-unitPrice" 
                    name="unitPrice" 
                    className="input" 
                    min="0" 
                    step="0.01" 
                    defaultValue={currentProduct.unitPrice}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-location">Location</label>
                  <input 
                    type="text" 
                    id="edit-location" 
                    name="location" 
                    className="input" 
                    defaultValue={currentProduct.location}
                    required 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                  onClick={() => {
                    setShowEditProductModal(false);
                    setCurrentProduct(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white theme-transition">
                Add New Supplier
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setShowAddSupplierModal(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSupplierSubmit}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="supplier-name">Supplier Name</label>
                  <input type="text" id="supplier-name" name="name" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="contactPerson">Contact Person</label>
                  <input type="text" id="contactPerson" name="contactPerson" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="supplier-email">Email</label>
                  <input type="email" id="supplier-email" name="email" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="supplier-phone">Phone</label>
                  <input type="tel" id="supplier-phone" name="phone" className="input" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="supplier-address">Address</label>
                  <textarea id="supplier-address" name="address" rows={3} className="input" required></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label mb-2 block">Products Supplied</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`supplier-product-${product.id}`} 
                          name="products" 
                          value={product.id} 
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600 theme-transition" 
                        />
                        <label htmlFor={`supplier-product-${product.id}`} className="text-sm text-gray-700 dark:text-gray-300 theme-transition">
                          {product.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                  onClick={() => setShowAddSupplierModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Supplier Modal */}
      {showEditSupplierModal && currentSupplier && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white theme-transition">
                Edit Supplier: {currentSupplier.name}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => {
                  setShowEditSupplierModal(false);
                  setCurrentSupplier(null);
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditSupplierSubmit}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-supplier-name">Supplier Name</label>
                  <input 
                    type="text" 
                    id="edit-supplier-name" 
                    name="name" 
                    className="input" 
                    defaultValue={currentSupplier.name}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-contactPerson">Contact Person</label>
                  <input 
                    type="text" 
                    id="edit-contactPerson" 
                    name="contactPerson" 
                    className="input" 
                    defaultValue={currentSupplier.contactPerson}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-supplier-email">Email</label>
                  <input 
                    type="email" 
                    id="edit-supplier-email" 
                    name="email" 
                    className="input" 
                    defaultValue={currentSupplier.email}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-supplier-phone">Phone</label>
                  <input 
                    type="tel" 
                    id="edit-supplier-phone" 
                    name="phone" 
                    className="input" 
                    defaultValue={currentSupplier.phone}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-supplier-address">Address</label>
                  <textarea 
                    id="edit-supplier-address" 
                    name="address" 
                    rows={3} 
                    className="input" 
                    defaultValue={currentSupplier.address}
                    required
                  ></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label mb-2 block">Products Supplied</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`edit-supplier-product-${product.id}`} 
                          name="products" 
                          value={product.id} 
                          defaultChecked={currentSupplier.productsSupplied.includes(product.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:focus:ring-blue-600 theme-transition" 
                        />
                        <label htmlFor={`edit-supplier-product-${product.id}`} className="text-sm text-gray-700 dark:text-gray-300 theme-transition">
                          {product.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 theme-transition"
                  onClick={() => {
                    setShowEditSupplierModal(false);
                    setCurrentSupplier(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Update Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;