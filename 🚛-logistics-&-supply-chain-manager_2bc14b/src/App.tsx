import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Package,
  Truck,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Circle,
  Eye,
  FileText,
  Globe,
  Users,
  Warehouse,
  Calculator,
  Calendar,
  Target,
  Zap,
  Navigation,
  PhoneCall,
  Mail,
  User,
  LogOut
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';

interface Shipment {
  id: string;
  trackingNumber: string;
  origin: string;
  destination: string;
  customer: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed';
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  cost: number;
  driver?: string;
  vehicle?: string;
  notes?: string;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  minStock: number;
  maxStock: number;
  location: string;
  supplier: string;
  unitCost: number;
  lastUpdated: string;
}

interface Vehicle {
  id: string;
  plateNumber: string;
  type: string;
  capacity: number;
  driver: string;
  status: 'available' | 'in-use' | 'maintenance';
  fuelEfficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
  currentLocation?: string;
}

interface Driver {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
  status: 'available' | 'on-route' | 'off-duty';
  rating: number;
  totalDeliveries: number;
}

type TabType = 'dashboard' | 'shipments' | 'inventory' | 'fleet' | 'analytics' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Main app state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  // Modal states
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // AI states
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Load data from localStorage on mount
  useEffect(() => {
    const loadedShipments = localStorage.getItem('scl_shipments');
    const loadedInventory = localStorage.getItem('scl_inventory');
    const loadedVehicles = localStorage.getItem('scl_vehicles');
    const loadedDrivers = localStorage.getItem('scl_drivers');

    if (loadedShipments) setShipments(JSON.parse(loadedShipments));
    if (loadedInventory) setInventory(JSON.parse(loadedInventory));
    if (loadedVehicles) setVehicles(JSON.parse(loadedVehicles));
    if (loadedDrivers) setDrivers(JSON.parse(loadedDrivers));

    // Initialize with sample data if empty
    if (!loadedShipments) {
      const sampleShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'SCL-2025-001',
          origin: 'Los Angeles, CA',
          destination: 'New York, NY',
          customer: 'ABC Corporation',
          status: 'in-transit',
          estimatedDelivery: '2025-06-10',
          weight: 2500,
          cost: 1200,
          driver: 'John Smith',
          vehicle: 'TRK-001',
          createdAt: '2025-06-05'
        },
        {
          id: '2',
          trackingNumber: 'SCL-2025-002',
          origin: 'Chicago, IL',
          destination: 'Miami, FL',
          customer: 'XYZ Logistics',
          status: 'delivered',
          estimatedDelivery: '2025-06-08',
          actualDelivery: '2025-06-07',
          weight: 1800,
          cost: 950,
          driver: 'Sarah Johnson',
          vehicle: 'TRK-002',
          createdAt: '2025-06-03'
        }
      ];
      setShipments(sampleShipments);
      localStorage.setItem('scl_shipments', JSON.stringify(sampleShipments));
    }

    if (!loadedInventory) {
      const sampleInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Electronic Components',
          sku: 'EC-001',
          category: 'Electronics',
          quantity: 500,
          minStock: 100,
          maxStock: 1000,
          location: 'Warehouse A',
          supplier: 'TechSupply Co.',
          unitCost: 25.50,
          lastUpdated: '2025-06-07'
        },
        {
          id: '2',
          name: 'Packaging Materials',
          sku: 'PM-001',
          category: 'Packaging',
          quantity: 50,
          minStock: 200,
          maxStock: 2000,
          location: 'Warehouse B',
          supplier: 'PackagePro Inc.',
          unitCost: 0.75,
          lastUpdated: '2025-06-06'
        }
      ];
      setInventory(sampleInventory);
      localStorage.setItem('scl_inventory', JSON.stringify(sampleInventory));
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('scl_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('scl_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('scl_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('scl_drivers', JSON.stringify(drivers));
  }, [drivers]);

  // AI processing function
  const handleProcessWithAI = () => {
    if (!promptText?.trim() && !selectedFile) {
      setAiError("Please provide text input or select a file to process.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const prompt = promptText || "Extract shipping and logistics data from this document and return in JSON format with fields: trackingNumber, origin, destination, customer, weight, cost, estimatedDelivery, notes";
    
    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  // Process AI result for shipment creation
  const processAIResult = (result: string) => {
    try {
      const parsedData = JSON.parse(result);
      if (parsedData.trackingNumber || parsedData.origin || parsedData.destination) {
        const newShipment: Shipment = {
          id: Date.now().toString(),
          trackingNumber: parsedData.trackingNumber || `SCL-${new Date().getFullYear()}-${String(shipments.length + 1).padStart(3, '0')}`,
          origin: parsedData.origin || '',
          destination: parsedData.destination || '',
          customer: parsedData.customer || '',
          status: 'pending',
          estimatedDelivery: parsedData.estimatedDelivery || '',
          weight: parseFloat(parsedData.weight) || 0,
          cost: parseFloat(parsedData.cost) || 0,
          notes: parsedData.notes || '',
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        setShipments(prev => [...prev, newShipment]);
        setShowShipmentModal(false);
        setPromptText('');
        setSelectedFile(null);
        setAiResult(null);
      }
    } catch (error) {
      console.log('AI result is not JSON, displaying as text');
    }
  };

  // CRUD operations
  const handleAddShipment = (shipmentData: Partial<Shipment>) => {
    const newShipment: Shipment = {
      id: Date.now().toString(),
      trackingNumber: shipmentData.trackingNumber || `SCL-${new Date().getFullYear()}-${String(shipments.length + 1).padStart(3, '0')}`,
      origin: shipmentData.origin || '',
      destination: shipmentData.destination || '',
      customer: shipmentData.customer || '',
      status: shipmentData.status || 'pending',
      estimatedDelivery: shipmentData.estimatedDelivery || '',
      weight: shipmentData.weight || 0,
      cost: shipmentData.cost || 0,
      driver: shipmentData.driver || '',
      vehicle: shipmentData.vehicle || '',
      notes: shipmentData.notes || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setShipments(prev => [...prev, newShipment]);
    setShowShipmentModal(false);
    setEditingItem(null);
  };

  const handleUpdateShipment = (id: string, updates: Partial<Shipment>) => {
    setShipments(prev => prev.map(shipment => 
      shipment.id === id ? { ...shipment, ...updates } : shipment
    ));
    setShowShipmentModal(false);
    setEditingItem(null);
  };

  const handleDeleteShipment = (id: string) => {
    setShipments(prev => prev.filter(shipment => shipment.id !== id));
  };

  // Export data as CSV
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Import CSV handler
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const importedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const item: any = {};
          headers.forEach((header, index) => {
            item[header] = values[index] || '';
          });
          item.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          return item;
        });

      if (activeTab === 'shipments') {
        setShipments(prev => [...prev, ...importedData]);
      } else if (activeTab === 'inventory') {
        setInventory(prev => [...prev, ...importedData]);
      }
      
      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  // Generate template CSV
  const generateTemplate = () => {
    const templates = {
      shipments: 'trackingNumber,origin,destination,customer,status,estimatedDelivery,weight,cost,driver,vehicle,notes\nSCL-2025-XXX,Origin City,Destination City,Customer Name,pending,2025-06-15,1000,500,Driver Name,Vehicle ID,Notes',
      inventory: 'name,sku,category,quantity,minStock,maxStock,location,supplier,unitCost\nSample Item,SKU-001,Category,100,10,500,Warehouse A,Supplier Name,10.50'
    };
    
    const template = templates[activeTab as keyof typeof templates];
    if (!template) return;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_template.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter data based on search and filters
  const getFilteredShipments = () => {
    return shipments.filter(shipment => {
      const matchesSearch = !searchTerm || 
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredInventory = () => {
    return inventory.filter(item => {
      const matchesSearch = !searchTerm || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };

  // Dashboard metrics
  const getDashboardMetrics = () => {
    const totalShipments = shipments.length;
    const inTransitShipments = shipments.filter(s => s.status === 'in-transit').length;
    const deliveredShipments = shipments.filter(s => s.status === 'delivered').length;
    const delayedShipments = shipments.filter(s => s.status === 'delayed').length;
    const totalRevenue = shipments.reduce((sum, s) => sum + s.cost, 0);
    const lowStockItems = inventory.filter(i => i.quantity <= i.minStock).length;

    return {
      totalShipments,
      inTransitShipments,
      deliveredShipments,
      delayedShipments,
      totalRevenue,
      lowStockItems,
      deliveryRate: totalShipments > 0 ? ((deliveredShipments / totalShipments) * 100).toFixed(1) : '0'
    };
  };

  // Chart data
  const getChartData = () => {
    const statusData = [
      { name: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, color: '#10b981' },
      { name: 'In Transit', value: shipments.filter(s => s.status === 'in-transit').length, color: '#f59e0b' },
      { name: 'Pending', value: shipments.filter(s => s.status === 'pending').length, color: '#6b7280' },
      { name: 'Delayed', value: shipments.filter(s => s.status === 'delayed').length, color: '#ef4444' }
    ];

    const revenueData = shipments.reduce((acc: any[], shipment) => {
      const date = shipment.createdAt;
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.revenue += shipment.cost;
      } else {
        acc.push({ date, revenue: shipment.cost });
      }
      return acc;
    }, []).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { statusData, revenueData };
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading application...</p>
        </div>
      </div>
    );
  }

  const metrics = getDashboardMetrics();
  const { statusData, revenueData } = getChartData();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900" id="welcome_fallback">
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          processAIResult(result);
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700" id="generation_issue_fallback">
        <div className="container-wide">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Supply Chain Manager</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Complete logistics solution</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser.first_name}</span>
              </div>
              <button
                onClick={logout}
                className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="container-wide">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'shipments', label: 'Shipments', icon: Package },
              { id: 'inventory', label: 'Inventory', icon: Warehouse },
              { id: 'fleet', label: 'Fleet', icon: Truck },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-wide py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dashboard-metrics">
              <div className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">Total Shipments</div>
                    <div className="stat-value">{metrics.totalShipments}</div>
                  </div>
                  <Package className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">In Transit</div>
                    <div className="stat-value">{metrics.inTransitShipments}</div>
                  </div>
                  <Truck className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">Total Revenue</div>
                    <div className="stat-value">${metrics.totalRevenue.toLocaleString()}</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="stat-card">
                <div className="flex-between">
                  <div>
                    <div className="stat-title">Delivery Rate</div>
                    <div className="stat-value">{metrics.deliveryRate}%</div>
                  </div>
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Shipments</h3>
              <div className="space-y-3">
                {shipments.slice(0, 5).map(shipment => (
                  <div key={shipment.id} className="flex-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        shipment.status === 'delivered' ? 'bg-green-500' :
                        shipment.status === 'in-transit' ? 'bg-yellow-500' :
                        shipment.status === 'delayed' ? 'bg-red-500' : 'bg-gray-400'
                      }`}></div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</div>
                        <div className="text-sm text-gray-500 dark:text-slate-400">{shipment.customer}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">${shipment.cost}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">{shipment.estimatedDelivery}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Shipments Tab */}
        {activeTab === 'shipments' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-2"
                  id="import-shipments-btn"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={() => exportToCSV(shipments, 'shipments.csv')}
                  className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowShipmentModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                  id="add-shipment-btn"
                >
                  <Plus className="w-4 h-4" />
                  Add Shipment
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search shipments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="input w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
            </div>

            {/* Shipments Table */}
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Tracking #</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Route</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Delivery Date</th>
                      <th className="table-header">Cost</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredShipments().map(shipment => (
                      <tr key={shipment.id}>
                        <td className="table-cell">
                          <div className="font-medium text-gray-900 dark:text-white">{shipment.trackingNumber}</div>
                        </td>
                        <td className="table-cell">{shipment.customer}</td>
                        <td className="table-cell">
                          <div className="text-sm">
                            <div>{shipment.origin}</div>
                            <div className="text-gray-500 dark:text-slate-400">→ {shipment.destination}</div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${
                            shipment.status === 'delivered' ? 'badge-success' :
                            shipment.status === 'in-transit' ? 'badge-warning' :
                            shipment.status === 'delayed' ? 'badge-error' : 'badge-info'
                          }`}>
                            {shipment.status}
                          </span>
                        </td>
                        <td className="table-cell">{shipment.estimatedDelivery}</td>
                        <td className="table-cell">${shipment.cost}</td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(shipment);
                                setShowShipmentModal(true);
                              }}
                              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteShipment(shipment.id)}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImportModal(true)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Import
                </button>
                <button
                  onClick={() => exportToCSV(inventory, 'inventory.csv')}
                  className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={() => setShowInventoryModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                  id="add-inventory-btn"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>
            </div>

            {/* Low Stock Alert */}
            {inventory.filter(item => item.quantity <= item.minStock).length > 0 && (
              <div className="alert alert-warning">
                <AlertTriangle className="w-5 h-5" />
                <p>{inventory.filter(item => item.quantity <= item.minStock).length} items are running low on stock!</p>
              </div>
            )}

            {/* Search and Filters */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="input w-auto"
                >
                  <option value="all">All Categories</option>
                  {[...new Set(inventory.map(item => item.category))].map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="card p-0">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Item Name</th>
                      <th className="table-header">SKU</th>
                      <th className="table-header">Category</th>
                      <th className="table-header">Quantity</th>
                      <th className="table-header">Location</th>
                      <th className="table-header">Unit Cost</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {getFilteredInventory().map(item => (
                      <tr key={item.id}>
                        <td className="table-cell">
                          <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                        </td>
                        <td className="table-cell">{item.sku}</td>
                        <td className="table-cell">{item.category}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <span>{item.quantity}</span>
                            {item.quantity <= item.minStock && (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="table-cell">{item.location}</td>
                        <td className="table-cell">${item.unitCost}</td>
                        <td className="table-cell">
                          <span className={`badge ${
                            item.quantity > item.minStock ? 'badge-success' :
                            item.quantity > 0 ? 'badge-warning' : 'badge-error'
                          }`}>
                            {item.quantity > item.minStock ? 'In Stock' :
                             item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item);
                                setShowInventoryModal(true);
                              }}
                              className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => setInventory(prev => prev.filter(i => i.id !== item.id))}
                              className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Fleet Tab */}
        {activeTab === 'fleet' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Management</h2>
              <button
                onClick={() => setShowVehicleModal(true)}
                className="btn btn-primary flex items-center gap-2"
                id="add-vehicle-btn"
              >
                <Plus className="w-4 h-4" />
                Add Vehicle
              </button>
            </div>

            {/* Fleet Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="stat-title">Total Vehicles</div>
                <div className="stat-value">{vehicles.length}</div>
                <div className="stat-desc">Active fleet size</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Available</div>
                <div className="stat-value">{vehicles.filter(v => v.status === 'available').length}</div>
                <div className="stat-desc">Ready for dispatch</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">In Use</div>
                <div className="stat-value">{vehicles.filter(v => v.status === 'in-use').length}</div>
                <div className="stat-desc">Currently deployed</div>
              </div>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="card">
                  <div className="flex-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">{vehicle.plateNumber}</h3>
                    <span className={`badge ${
                      vehicle.status === 'available' ? 'badge-success' :
                      vehicle.status === 'in-use' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex-between">
                      <span className="text-gray-500 dark:text-slate-400">Type:</span>
                      <span className="text-gray-900 dark:text-white">{vehicle.type}</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-gray-500 dark:text-slate-400">Capacity:</span>
                      <span className="text-gray-900 dark:text-white">{vehicle.capacity} kg</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-gray-500 dark:text-slate-400">Driver:</span>
                      <span className="text-gray-900 dark:text-white">{vehicle.driver}</span>
                    </div>
                    <div className="flex-between">
                      <span className="text-gray-500 dark:text-slate-400">Fuel Efficiency:</span>
                      <span className="text-gray-900 dark:text-white">{vehicle.fuelEfficiency} mpg</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setEditingItem(vehicle);
                        setShowVehicleModal(true);
                      }}
                      className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => setVehicles(prev => prev.filter(v => v.id !== vehicle.id))}
                      className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
              <button
                onClick={() => exportToCSV(shipments, 'analytics_report.csv')}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="stat-title">On-Time Delivery</div>
                <div className="stat-value text-green-600">{metrics.deliveryRate}%</div>
                <div className="stat-desc flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  +5% from last month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Avg. Cost per Shipment</div>
                <div className="stat-value">${shipments.length > 0 ? Math.round(metrics.totalRevenue / shipments.length) : 0}</div>
                <div className="stat-desc flex items-center gap-1 text-red-600">
                  <TrendingDown className="w-4 h-4" />
                  -2% from last month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Customer Satisfaction</div>
                <div className="stat-value">4.8/5</div>
                <div className="stat-desc">Based on 120 reviews</div>
              </div>
              <div className="stat-card">
                <div className="stat-title">Fleet Utilization</div>
                <div className="stat-value">85%</div>
                <div className="stat-desc">Above industry average</div>
              </div>
            </div>

            {/* Detailed Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cost Analysis</h3>
                <div className="space-y-4">
                  <div className="flex-between">
                    <span className="text-gray-600 dark:text-slate-400">Fuel Costs</span>
                    <span className="font-medium">${(metrics.totalRevenue * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-gray-600 dark:text-slate-400">Labor Costs</span>
                    <span className="font-medium">${(metrics.totalRevenue * 0.4).toLocaleString()}</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-gray-600 dark:text-slate-400">Maintenance</span>
                    <span className="font-medium">${(metrics.totalRevenue * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="flex-between">
                    <span className="text-gray-600 dark:text-slate-400">Insurance</span>
                    <span className="font-medium">${(metrics.totalRevenue * 0.05).toLocaleString()}</span>
                  </div>
                  <div className="flex-between border-t pt-2">
                    <span className="font-medium text-gray-900 dark:text-white">Net Profit</span>
                    <span className="font-bold text-green-600">${(metrics.totalRevenue * 0.15).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6" id="settings-section">
            <div className="flex-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">General Settings</h3>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input type="text" className="input" defaultValue="Your Supply Chain Company" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Default Currency</label>
                    <select className="input">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Zone</label>
                    <select className="input">
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      const allData = {
                        shipments,
                        inventory,
                        vehicles,
                        drivers,
                        exportDate: new Date().toISOString()
                      };
                      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'supply_chain_backup.json';
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </button>
                  <button
                    onClick={() => {
                      const confirmed = window.confirm('Are you sure you want to clear all data? This action cannot be undone.');
                      if (confirmed) {
                        setShipments([]);
                        setInventory([]);
                        setVehicles([]);
                        setDrivers([]);
                        localStorage.removeItem('scl_shipments');
                        localStorage.removeItem('scl_inventory');
                        localStorage.removeItem('scl_vehicles');
                        localStorage.removeItem('scl_drivers');
                      }
                    }}
                    className="btn bg-red-100 text-red-700 hover:bg-red-200 w-full flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
              </div>

              {/* AI Assistant */}
              <div className="card lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Document Processor</h3>
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Upload shipping documents for automatic data extraction</label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Additional Instructions (Optional)</label>
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      placeholder="e.g., Extract customer details and delivery information..."
                      className="input"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={handleProcessWithAI}
                    disabled={isAiLoading || (!promptText && !selectedFile)}
                    className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Process with AI
                      </>
                    )}
                  </button>
                  
                  {aiError && (
                    <div className="alert alert-error">
                      <AlertTriangle className="w-5 h-5" />
                      <p>{aiError}</p>
                    </div>
                  )}
                  
                  {aiResult && (
                    <div className="alert alert-success">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <p className="font-medium">AI Processing Complete!</p>
                        <div className="mt-2 text-sm bg-white dark:bg-slate-800 p-3 rounded border">
                          <pre className="whitespace-pre-wrap">{aiResult}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Shipment Modal */}
      {showShipmentModal && (
        <div className="modal-backdrop" onClick={() => {
          setShowShipmentModal(false);
          setEditingItem(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingItem ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button
                onClick={() => {
                  setShowShipmentModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const shipmentData = {
                  trackingNumber: formData.get('trackingNumber') as string,
                  origin: formData.get('origin') as string,
                  destination: formData.get('destination') as string,
                  customer: formData.get('customer') as string,
                  status: formData.get('status') as 'pending' | 'in-transit' | 'delivered' | 'delayed',
                  estimatedDelivery: formData.get('estimatedDelivery') as string,
                  weight: parseFloat(formData.get('weight') as string) || 0,
                  cost: parseFloat(formData.get('cost') as string) || 0,
                  driver: formData.get('driver') as string,
                  vehicle: formData.get('vehicle') as string,
                  notes: formData.get('notes') as string
                };
                
                if (editingItem) {
                  handleUpdateShipment(editingItem.id, shipmentData);
                } else {
                  handleAddShipment(shipmentData);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tracking Number</label>
                  <input
                    name="trackingNumber"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.trackingNumber || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Customer</label>
                  <input
                    name="customer"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.customer || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input
                    name="origin"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.origin || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input
                    name="destination"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.destination || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" className="input" defaultValue={editingItem?.status || 'pending'}>
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Delivery</label>
                  <input
                    name="estimatedDelivery"
                    type="date"
                    className="input"
                    defaultValue={editingItem?.estimatedDelivery || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    name="weight"
                    type="number"
                    className="input"
                    defaultValue={editingItem?.weight || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Cost ($)</label>
                  <input
                    name="cost"
                    type="number"
                    step="0.01"
                    className="input"
                    defaultValue={editingItem?.cost || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Driver</label>
                  <input
                    name="driver"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.driver || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle</label>
                  <input
                    name="vehicle"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.vehicle || ''}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  name="notes"
                  className="input"
                  rows={3}
                  defaultValue={editingItem?.notes || ''}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowShipmentModal(false);
                    setEditingItem(null);
                  }}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Create'} Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="modal-backdrop" onClick={() => {
          setShowInventoryModal(false);
          setEditingItem(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingItem ? 'Edit Inventory Item' : 'Add New Item'}
              </h3>
              <button
                onClick={() => {
                  setShowInventoryModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const itemData = {
                  name: formData.get('name') as string,
                  sku: formData.get('sku') as string,
                  category: formData.get('category') as string,
                  quantity: parseInt(formData.get('quantity') as string) || 0,
                  minStock: parseInt(formData.get('minStock') as string) || 0,
                  maxStock: parseInt(formData.get('maxStock') as string) || 0,
                  location: formData.get('location') as string,
                  supplier: formData.get('supplier') as string,
                  unitCost: parseFloat(formData.get('unitCost') as string) || 0,
                  lastUpdated: new Date().toISOString().split('T')[0]
                };
                
                if (editingItem) {
                  setInventory(prev => prev.map(item => 
                    item.id === editingItem.id ? { ...item, ...itemData } : item
                  ));
                } else {
                  const newItem: InventoryItem = {
                    id: Date.now().toString(),
                    ...itemData
                  };
                  setInventory(prev => [...prev, newItem]);
                }
                
                setShowInventoryModal(false);
                setEditingItem(null);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    name="name"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.name || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    name="sku"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.sku || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input
                    name="category"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.category || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input
                    name="quantity"
                    type="number"
                    className="input"
                    defaultValue={editingItem?.quantity || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Stock</label>
                  <input
                    name="minStock"
                    type="number"
                    className="input"
                    defaultValue={editingItem?.minStock || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Max Stock</label>
                  <input
                    name="maxStock"
                    type="number"
                    className="input"
                    defaultValue={editingItem?.maxStock || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    name="location"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.location || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input
                    name="supplier"
                    type="text"
                    className="input"
                    defaultValue={editingItem?.supplier || ''}
                  />
                </div>
                <div className="form-group sm:col-span-2">
                  <label className="form-label">Unit Cost ($)</label>
                  <input
                    name="unitCost"
                    type="number"
                    step="0.01"
                    className="input"
                    defaultValue={editingItem?.unitCost || ''}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowInventoryModal(false);
                    setEditingItem(null);
                  }}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Data</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="alert alert-info">
                <FileText className="w-5 h-5" />
                <p>Upload a CSV file to import {activeTab} data. Make sure your file follows the correct format.</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={generateTemplate}
                  className="btn bg-blue-100 text-blue-700 hover:bg-blue-200 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Template
                </button>
              </div>
              
              <div className="form-group">
                <label className="form-label">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportCSV}
                  className="input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-12">
        <div className="container-wide py-6">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;