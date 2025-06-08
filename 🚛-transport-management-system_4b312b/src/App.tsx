import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Truck, User, Route, BarChart3, Settings, Plus, Search, Filter, Edit, Trash2, 
  Download, Upload, Calendar, MapPin, Fuel, Wrench, Clock, TrendingUp, 
  AlertTriangle, CheckCircle, Package, Navigation, DollarSign, Eye,
  FileText, Camera, X, Menu, LogOut, Target, Gauge
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

// Types and Interfaces
interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  model: string;
  year: number;
  capacity: number;
  fuelType: 'diesel' | 'petrol' | 'electric' | 'hybrid';
  status: 'active' | 'maintenance' | 'inactive';
  lastMaintenance: string;
  nextMaintenance: string;
  mileage: number;
  fuelConsumption: number;
  driverId?: string;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  phone: string;
  email: string;
  experience: number;
  rating: number;
  status: 'available' | 'on_trip' | 'off_duty';
  totalTrips: number;
  totalDistance: number;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  from: string;
  to: string;
  distance: number;
  vehicleId: string;
  driverId: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  scheduledDate: string;
  deliveryDate?: string;
  cargo: string;
  weight: number;
  cost: number;
  customerName: string;
  customerPhone: string;
}

interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  date: string;
  mileage: number;
  nextDue?: string;
}

interface FuelRecord {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  cost: number;
  mileage: number;
  station: string;
}

type TabType = 'dashboard' | 'fleet' | 'drivers' | 'shipments' | 'analytics' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);

  // Modal and Form States
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteItem, setDeleteItem] = useState<any>(null);
  const [importType, setImportType] = useState<'vehicles' | 'drivers' | 'shipments'>('vehicles');

  // Search and Filter States
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [driverSearch, setDriverSearch] = useState('');
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [shipmentFilter, setShipmentFilter] = useState('all');

  // Form States
  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({});
  const [driverForm, setDriverForm] = useState<Partial<Driver>>({});
  const [shipmentForm, setShipmentForm] = useState<Partial<Shipment>>({});
  const [maintenanceForm, setMaintenanceForm] = useState<Partial<MaintenanceRecord>>({});
  const [fuelForm, setFuelForm] = useState<Partial<FuelRecord>>({});

  // AI States
  const [promptText, setPromptText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);

  // Settings States
  const [currency, setCurrency] = useState('USD');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [fuelUnit, setFuelUnit] = useState('liters');

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadStoredData = () => {
      const storedVehicles = localStorage.getItem('transport_vehicles');
      const storedDrivers = localStorage.getItem('transport_drivers');
      const storedShipments = localStorage.getItem('transport_shipments');
      const storedMaintenance = localStorage.getItem('transport_maintenance');
      const storedFuel = localStorage.getItem('transport_fuel');
      const storedSettings = localStorage.getItem('transport_settings');

      if (storedVehicles) setVehicles(JSON.parse(storedVehicles));
      if (storedDrivers) setDrivers(JSON.parse(storedDrivers));
      if (storedShipments) setShipments(JSON.parse(storedShipments));
      if (storedMaintenance) setMaintenanceRecords(JSON.parse(storedMaintenance));
      if (storedFuel) setFuelRecords(JSON.parse(storedFuel));
      
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setCurrency(settings.currency || 'USD');
        setDistanceUnit(settings.distanceUnit || 'km');
        setFuelUnit(settings.fuelUnit || 'liters');
      } else {
        // Initialize with sample data
        initializeSampleData();
      }
    };

    loadStoredData();
  }, []);

  // Initialize sample data
  const initializeSampleData = () => {
    const sampleVehicles: Vehicle[] = [
      {
        id: '1',
        plateNumber: 'TRK-001',
        type: 'truck',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        fuelType: 'diesel',
        status: 'active',
        lastMaintenance: '2025-05-15',
        nextMaintenance: '2025-07-15',
        mileage: 125000,
        fuelConsumption: 35.5,
        driverId: '1'
      },
      {
        id: '2',
        plateNumber: 'VAN-002',
        type: 'van',
        model: 'Mercedes Sprinter',
        year: 2021,
        capacity: 3500,
        fuelType: 'diesel',
        status: 'active',
        lastMaintenance: '2025-06-01',
        nextMaintenance: '2025-08-01',
        mileage: 75000,
        fuelConsumption: 12.5,
        driverId: '2'
      }
    ];

    const sampleDrivers: Driver[] = [
      {
        id: '1',
        name: 'John Smith',
        licenseNumber: 'DL123456789',
        licenseExpiry: '2026-12-31',
        phone: '+1234567890',
        email: 'john.smith@transport.com',
        experience: 8,
        rating: 4.8,
        status: 'on_trip',
        totalTrips: 450,
        totalDistance: 875000
      },
      {
        id: '2',
        name: 'Maria Garcia',
        licenseNumber: 'DL987654321',
        licenseExpiry: '2027-06-30',
        phone: '+1234567891',
        email: 'maria.garcia@transport.com',
        experience: 5,
        rating: 4.9,
        status: 'available',
        totalTrips: 320,
        totalDistance: 560000
      }
    ];

    const sampleShipments: Shipment[] = [
      {
        id: '1',
        trackingNumber: 'TMS2025001',
        from: 'New York, NY',
        to: 'Boston, MA',
        distance: 215,
        vehicleId: '1',
        driverId: '1',
        status: 'in_transit',
        scheduledDate: '2025-06-08',
        cargo: 'Electronics',
        weight: 15000,
        cost: 2500,
        customerName: 'Tech Solutions Inc',
        customerPhone: '+1555123456'
      },
      {
        id: '2',
        trackingNumber: 'TMS2025002',
        from: 'Chicago, IL',
        to: 'Detroit, MI',
        distance: 285,
        vehicleId: '2',
        driverId: '2',
        status: 'delivered',
        scheduledDate: '2025-06-07',
        deliveryDate: '2025-06-07',
        cargo: 'Furniture',
        weight: 2800,
        cost: 1800,
        customerName: 'Home Designs LLC',
        customerPhone: '+1555789012'
      }
    ];

    setVehicles(sampleVehicles);
    setDrivers(sampleDrivers);
    setShipments(sampleShipments);
  };

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('transport_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transport_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('transport_shipments', JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem('transport_maintenance', JSON.stringify(maintenanceRecords));
  }, [maintenanceRecords]);

  useEffect(() => {
    localStorage.setItem('transport_fuel', JSON.stringify(fuelRecords));
  }, [fuelRecords]);

  useEffect(() => {
    localStorage.setItem('transport_settings', JSON.stringify({
      currency,
      distanceUnit,
      fuelUnit
    }));
  }, [currency, distanceUnit, fuelUnit]);

  // AI Functions
  const handleAiProcess = () => {
    if (!promptText?.trim() && !selectedFile) {
      setAiError("Please provide input or select a file to process.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      if (selectedFile) {
        // Auto-generate prompt based on file type and current context
        let autoPrompt = promptText || "Extract transportation data from this document";
        
        if (activeTab === 'fleet') {
          autoPrompt = `Extract vehicle information from this document. Return JSON with keys: "plateNumber", "type", "model", "year", "capacity", "fuelType", "mileage". ${promptText}`;
        } else if (activeTab === 'drivers') {
          autoPrompt = `Extract driver information from this document. Return JSON with keys: "name", "licenseNumber", "licenseExpiry", "phone", "email", "experience". ${promptText}`;
        } else if (activeTab === 'shipments') {
          autoPrompt = `Extract shipment/delivery information from this document. Return JSON with keys: "trackingNumber", "from", "to", "distance", "cargo", "weight", "customerName", "customerPhone". ${promptText}`;
        }
        
        aiLayerRef.current?.sendToAI(autoPrompt, selectedFile);
      } else {
        aiLayerRef.current?.sendToAI(promptText);
      }
    } catch (error) {
      setAiError("Failed to process AI request");
    }
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    
    // Try to parse and auto-populate forms if result contains structured data
    try {
      const parsedData = JSON.parse(result);
      
      if (activeTab === 'fleet' && showVehicleModal) {
        setVehicleForm(prev => ({
          ...prev,
          ...parsedData,
          id: prev.id || Date.now().toString(),
          status: prev.status || 'active'
        }));
      } else if (activeTab === 'drivers' && showDriverModal) {
        setDriverForm(prev => ({
          ...prev,
          ...parsedData,
          id: prev.id || Date.now().toString(),
          rating: prev.rating || 5.0,
          status: prev.status || 'available',
          totalTrips: prev.totalTrips || 0,
          totalDistance: prev.totalDistance || 0
        }));
      } else if (activeTab === 'shipments' && showShipmentModal) {
        setShipmentForm(prev => ({
          ...prev,
          ...parsedData,
          id: prev.id || Date.now().toString(),
          status: prev.status || 'pending',
          scheduledDate: prev.scheduledDate || new Date().toISOString().split('T')[0]
        }));
      }
    } catch (e) {
      // If not JSON, just display the result
      console.log("AI result is not JSON format, displaying as text");
    }
  };

  // Vehicle Functions
  const handleSaveVehicle = () => {
    if (!vehicleForm.plateNumber || !vehicleForm.model) return;

    const vehicleData: Vehicle = {
      id: vehicleForm.id || Date.now().toString(),
      plateNumber: vehicleForm.plateNumber,
      type: vehicleForm.type || 'truck',
      model: vehicleForm.model,
      year: vehicleForm.year || new Date().getFullYear(),
      capacity: vehicleForm.capacity || 0,
      fuelType: vehicleForm.fuelType || 'diesel',
      status: vehicleForm.status || 'active',
      lastMaintenance: vehicleForm.lastMaintenance || '',
      nextMaintenance: vehicleForm.nextMaintenance || '',
      mileage: vehicleForm.mileage || 0,
      fuelConsumption: vehicleForm.fuelConsumption || 0
    };

    if (editingItem) {
      setVehicles(prev => prev.map(v => v.id === editingItem.id ? vehicleData : v));
    } else {
      setVehicles(prev => [...prev, vehicleData]);
    }

    setShowVehicleModal(false);
    setVehicleForm({});
    setEditingItem(null);
  };

  // Driver Functions
  const handleSaveDriver = () => {
    if (!driverForm.name || !driverForm.licenseNumber) return;

    const driverData: Driver = {
      id: driverForm.id || Date.now().toString(),
      name: driverForm.name,
      licenseNumber: driverForm.licenseNumber,
      licenseExpiry: driverForm.licenseExpiry || '',
      phone: driverForm.phone || '',
      email: driverForm.email || '',
      experience: driverForm.experience || 0,
      rating: driverForm.rating || 5.0,
      status: driverForm.status || 'available',
      totalTrips: driverForm.totalTrips || 0,
      totalDistance: driverForm.totalDistance || 0
    };

    if (editingItem) {
      setDrivers(prev => prev.map(d => d.id === editingItem.id ? driverData : d));
    } else {
      setDrivers(prev => [...prev, driverData]);
    }

    setShowDriverModal(false);
    setDriverForm({});
    setEditingItem(null);
  };

  // Shipment Functions
  const handleSaveShipment = () => {
    if (!shipmentForm.trackingNumber || !shipmentForm.from || !shipmentForm.to) return;

    const shipmentData: Shipment = {
      id: shipmentForm.id || Date.now().toString(),
      trackingNumber: shipmentForm.trackingNumber,
      from: shipmentForm.from,
      to: shipmentForm.to,
      distance: shipmentForm.distance || 0,
      vehicleId: shipmentForm.vehicleId || '',
      driverId: shipmentForm.driverId || '',
      status: shipmentForm.status || 'pending',
      scheduledDate: shipmentForm.scheduledDate || new Date().toISOString().split('T')[0],
      deliveryDate: shipmentForm.deliveryDate,
      cargo: shipmentForm.cargo || '',
      weight: shipmentForm.weight || 0,
      cost: shipmentForm.cost || 0,
      customerName: shipmentForm.customerName || '',
      customerPhone: shipmentForm.customerPhone || ''
    };

    if (editingItem) {
      setShipments(prev => prev.map(s => s.id === editingItem.id ? shipmentData : s));
    } else {
      setShipments(prev => [...prev, shipmentData]);
    }

    setShowShipmentModal(false);
    setShipmentForm({});
    setEditingItem(null);
  };

  // Delete Functions
  const handleDelete = () => {
    if (!deleteItem) return;

    if (deleteItem.type === 'vehicle') {
      setVehicles(prev => prev.filter(v => v.id !== deleteItem.id));
    } else if (deleteItem.type === 'driver') {
      setDrivers(prev => prev.filter(d => d.id !== deleteItem.id));
    } else if (deleteItem.type === 'shipment') {
      setShipments(prev => prev.filter(s => s.id !== deleteItem.id));
    }

    setShowDeleteConfirm(false);
    setDeleteItem(null);
  };

  // Export Functions
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

  // Import Functions
  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index] || '';
          });
          obj.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          return obj;
        });

      if (importType === 'vehicles') {
        setVehicles(prev => [...prev, ...data]);
      } else if (importType === 'drivers') {
        setDrivers(prev => [...prev, ...data]);
      } else if (importType === 'shipments') {
        setShipments(prev => [...prev, ...data]);
      }

      setShowImportModal(false);
    };
    reader.readAsText(file);
  };

  // Download template
  const downloadTemplate = (type: 'vehicles' | 'drivers' | 'shipments') => {
    let templateData: any[] = [];
    
    if (type === 'vehicles') {
      templateData = [{
        plateNumber: 'TRK-001',
        type: 'truck',
        model: 'Volvo FH16',
        year: 2020,
        capacity: 25000,
        fuelType: 'diesel',
        status: 'active',
        lastMaintenance: '2025-05-15',
        nextMaintenance: '2025-07-15',
        mileage: 125000,
        fuelConsumption: 35.5
      }];
    } else if (type === 'drivers') {
      templateData = [{
        name: 'John Smith',
        licenseNumber: 'DL123456789',
        licenseExpiry: '2026-12-31',
        phone: '+1234567890',
        email: 'john.smith@transport.com',
        experience: 8,
        rating: 4.8,
        status: 'available',
        totalTrips: 450,
        totalDistance: 875000
      }];
    } else if (type === 'shipments') {
      templateData = [{
        trackingNumber: 'TMS2025001',
        from: 'New York, NY',
        to: 'Boston, MA',
        distance: 215,
        vehicleId: '1',
        driverId: '1',
        status: 'pending',
        scheduledDate: '2025-06-08',
        cargo: 'Electronics',
        weight: 15000,
        cost: 2500,
        customerName: 'Tech Solutions Inc',
        customerPhone: '+1555123456'
      }];
    }

    exportToCSV(templateData, `${type}_template.csv`);
  };

  // Clear all data
  const clearAllData = () => {
    setVehicles([]);
    setDrivers([]);
    setShipments([]);
    setMaintenanceRecords([]);
    setFuelRecords([]);
    localStorage.removeItem('transport_vehicles');
    localStorage.removeItem('transport_drivers');
    localStorage.removeItem('transport_shipments');
    localStorage.removeItem('transport_maintenance');
    localStorage.removeItem('transport_fuel');
  };

  // Filter Functions
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plateNumber.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(vehicleSearch.toLowerCase());
    const matchesFilter = vehicleFilter === 'all' || vehicle.status === vehicleFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(driverSearch.toLowerCase()) ||
                         driver.licenseNumber.toLowerCase().includes(driverSearch.toLowerCase());
    const matchesFilter = driverFilter === 'all' || driver.status === driverFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.trackingNumber.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
                         shipment.from.toLowerCase().includes(shipmentSearch.toLowerCase()) ||
                         shipment.to.toLowerCase().includes(shipmentSearch.toLowerCase());
    const matchesFilter = shipmentFilter === 'all' || shipment.status === shipmentFilter;
    return matchesSearch && matchesFilter;
  });

  // Analytics Data
  const dashboardStats = {
    totalVehicles: vehicles.length,
    activeVehicles: vehicles.filter(v => v.status === 'active').length,
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.status === 'available').length,
    totalShipments: shipments.length,
    inTransitShipments: shipments.filter(s => s.status === 'in_transit').length,
    deliveredShipments: shipments.filter(s => s.status === 'delivered').length,
    totalRevenue: shipments.filter(s => s.status === 'delivered').reduce((sum, s) => sum + s.cost, 0)
  };

  const vehicleTypeData = [
    { name: 'Trucks', value: vehicles.filter(v => v.type === 'truck').length, color: '#3B82F6' },
    { name: 'Vans', value: vehicles.filter(v => v.type === 'van').length, color: '#10B981' },
    { name: 'Cars', value: vehicles.filter(v => v.type === 'car').length, color: '#F59E0B' },
    { name: 'Motorcycles', value: vehicles.filter(v => v.type === 'motorcycle').length, color: '#EF4444' }
  ];

  const shipmentStatusData = [
    { name: 'Pending', value: shipments.filter(s => s.status === 'pending').length, color: '#F59E0B' },
    { name: 'In Transit', value: shipments.filter(s => s.status === 'in_transit').length, color: '#3B82F6' },
    { name: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, color: '#10B981' },
    { name: 'Cancelled', value: shipments.filter(s => s.status === 'cancelled').length, color: '#EF4444' }
  ];

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 58000 },
    { month: 'May', revenue: 65000 },
    { month: 'Jun', revenue: 72000 }
  ];

  // Render Functions
  const renderNavigation = () => (
    <nav className="bg-white dark:bg-slate-800 shadow-lg border-b border-gray-200 dark:border-slate-700">
      <div className="container-fluid">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Truck className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transport Management</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'fleet', label: 'Fleet', icon: Truck },
              { id: 'drivers', label: 'Drivers', icon: User },
              { id: 'shipments', label: 'Shipments', icon: Package },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`${tab.id}-tab`}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <span>Welcome, {currentUser.first_name}</span>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <Menu className="h-6 w-6" />
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="flex flex-col gap-2">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                { id: 'fleet', label: 'Fleet', icon: Truck },
                { id: 'drivers', label: 'Drivers', icon: User },
                { id: 'shipments', label: 'Shipments', icon: Package },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderDashboard = () => (
    <div id="welcome_fallback" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h2>
        <div className="text-sm text-gray-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Vehicles</div>
              <div className="stat-value text-blue-600">{dashboardStats.totalVehicles}</div>
              <div className="stat-desc">{dashboardStats.activeVehicles} active</div>
            </div>
            <Truck className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Drivers</div>
              <div className="stat-value text-green-600">{dashboardStats.totalDrivers}</div>
              <div className="stat-desc">{dashboardStats.availableDrivers} available</div>
            </div>
            <User className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Active Shipments</div>
              <div className="stat-value text-orange-600">{dashboardStats.inTransitShipments}</div>
              <div className="stat-desc">{dashboardStats.deliveredShipments} delivered</div>
            </div>
            <Package className="h-12 w-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value text-purple-600">{currency} {dashboardStats.totalRevenue.toLocaleString()}</div>
              <div className="stat-desc">This period</div>
            </div>
            <DollarSign className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fleet Composition</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vehicleTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {vehicleTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Shipment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={shipmentStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {shipmentStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${currency} ${value?.toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderFleetManagement = () => (
    <div id="generation_issue_fallback" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Fleet Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            id="add-vehicle-btn"
            onClick={() => {
              setEditingItem(null);
              setVehicleForm({});
              setShowVehicleModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Vehicle
          </button>
          <button
            onClick={() => exportToCSV(vehicles, 'vehicles.csv')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
          <button
            onClick={() => {
              setImportType('vehicles');
              setShowImportModal(true);
            }}
            className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Import
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vehicles..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Plate Number</th>
                <th className="table-header">Type</th>
                <th className="table-header">Model</th>
                <th className="table-header">Status</th>
                <th className="table-header">Driver</th>
                <th className="table-header">Mileage</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {filteredVehicles.map((vehicle) => {
                const assignedDriver = drivers.find(d => d.id === vehicle.driverId);
                return (
                  <tr key={vehicle.id}>
                    <td className="table-cell font-medium">{vehicle.plateNumber}</td>
                    <td className="table-cell capitalize">{vehicle.type}</td>
                    <td className="table-cell">{vehicle.model} ({vehicle.year})</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        vehicle.status === 'active' ? 'badge-success' :
                        vehicle.status === 'maintenance' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {assignedDriver ? assignedDriver.name : 'Unassigned'}
                    </td>
                    <td className="table-cell">{vehicle.mileage.toLocaleString()} {distanceUnit}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(vehicle);
                            setVehicleForm(vehicle);
                            setShowVehicleModal(true);
                          }}
                          className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem({ type: 'vehicle', id: vehicle.id, name: vehicle.plateNumber });
                            setShowDeleteConfirm(true);
                          }}
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderDriverManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Driver Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            id="add-driver-btn"
            onClick={() => {
              setEditingItem(null);
              setDriverForm({});
              setShowDriverModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Driver
          </button>
          <button
            onClick={() => exportToCSV(drivers, 'drivers.csv')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
          <button
            onClick={() => {
              setImportType('drivers');
              setShowImportModal(true);
            }}
            className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Import
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={driverSearch}
                onChange={(e) => setDriverSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">License</th>
                <th className="table-header">Status</th>
                <th className="table-header">Rating</th>
                <th className="table-header">Experience</th>
                <th className="table-header">Total Trips</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id}>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-sm text-gray-500">{driver.email}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="font-medium">{driver.licenseNumber}</div>
                      <div className="text-sm text-gray-500">Expires: {driver.licenseExpiry}</div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`badge ${
                      driver.status === 'available' ? 'badge-success' :
                      driver.status === 'on_trip' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {driver.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{driver.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </td>
                  <td className="table-cell">{driver.experience} years</td>
                  <td className="table-cell">{driver.totalTrips}</td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(driver);
                          setDriverForm(driver);
                          setShowDriverModal(true);
                        }}
                        className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDeleteItem({ type: 'driver', id: driver.id, name: driver.name });
                          setShowDeleteConfirm(true);
                        }}
                        className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
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
      </div>
    </div>
  );

  const renderShipmentManagement = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipment Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            id="add-shipment-btn"
            onClick={() => {
              setEditingItem(null);
              setShipmentForm({});
              setShowShipmentModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Shipment
          </button>
          <button
            onClick={() => exportToCSV(shipments, 'shipments.csv')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Export
          </button>
          <button
            onClick={() => {
              setImportType('shipments');
              setShowImportModal(true);
            }}
            className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
          >
            <Upload className="h-5 w-5" />
            Import
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search shipments..."
                value={shipmentSearch}
                onChange={(e) => setShipmentSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={shipmentFilter}
              onChange={(e) => setShipmentFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Shipments Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Tracking #</th>
                <th className="table-header">Route</th>
                <th className="table-header">Status</th>
                <th className="table-header">Vehicle</th>
                <th className="table-header">Driver</th>
                <th className="table-header">Cargo</th>
                <th className="table-header">Cost</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              {filteredShipments.map((shipment) => {
                const vehicle = vehicles.find(v => v.id === shipment.vehicleId);
                const driver = drivers.find(d => d.id === shipment.driverId);
                return (
                  <tr key={shipment.id}>
                    <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{shipment.from}</div>
                        <div className="text-sm text-gray-500">→ {shipment.to}</div>
                        <div className="text-sm text-gray-500">{shipment.distance} {distanceUnit}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        shipment.status === 'delivered' ? 'badge-success' :
                        shipment.status === 'in_transit' ? 'badge-info' :
                        shipment.status === 'pending' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {shipment.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      {vehicle ? vehicle.plateNumber : 'Unassigned'}
                    </td>
                    <td className="table-cell">
                      {driver ? driver.name : 'Unassigned'}
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium">{shipment.cargo}</div>
                        <div className="text-sm text-gray-500">{shipment.weight} kg</div>
                      </div>
                    </td>
                    <td className="table-cell font-medium">
                      {currency} {shipment.cost.toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingItem(shipment);
                            setShipmentForm(shipment);
                            setShowShipmentModal(true);
                          }}
                          className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteItem({ type: 'shipment', id: shipment.id, name: shipment.trackingNumber });
                            setShowDeleteConfirm(true);
                          }}
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
        <div className="flex gap-2">
          <button
            onClick={() => exportToCSV(shipments, 'shipments_report.csv')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Fleet Utilization</div>
          <div className="stat-value text-blue-600">
            {vehicles.length > 0 ? Math.round((dashboardStats.activeVehicles / dashboardStats.totalVehicles) * 100) : 0}%
          </div>
          <div className="stat-desc">Active vehicles</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Delivery Rate</div>
          <div className="stat-value text-green-600">
            {shipments.length > 0 ? Math.round((dashboardStats.deliveredShipments / dashboardStats.totalShipments) * 100) : 0}%
          </div>
          <div className="stat-desc">Successful deliveries</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Avg Driver Rating</div>
          <div className="stat-value text-yellow-600">
            {drivers.length > 0 ? (drivers.reduce((sum, d) => sum + d.rating, 0) / drivers.length).toFixed(1) : '0.0'}
          </div>
          <div className="stat-desc">Out of 5.0</div>
        </div>

        <div className="stat-card">
          <div className="stat-title">Total Distance</div>
          <div className="stat-value text-purple-600">
            {drivers.reduce((sum, d) => sum + d.totalDistance, 0).toLocaleString()}
          </div>
          <div className="stat-desc">{distanceUnit} covered</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { status: 'Active', count: vehicles.filter(v => v.status === 'active').length },
              { status: 'Maintenance', count: vehicles.filter(v => v.status === 'maintenance').length },
              { status: 'Inactive', count: vehicles.filter(v => v.status === 'inactive').length }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Driver Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={drivers.slice(0, 5).map(d => ({
              name: d.name.split(' ')[0],
              trips: d.totalTrips,
              rating: d.rating
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="trips" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`${currency} ${value?.toLocaleString()}`, 'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Distance Unit</label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="input"
              >
                <option value="km">Kilometers</option>
                <option value="miles">Miles</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Fuel Unit</label>
              <select
                value={fuelUnit}
                onChange={(e) => setFuelUnit(e.target.value)}
                className="input"
              >
                <option value="liters">Liters</option>
                <option value="gallons">Gallons</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Download Templates</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => downloadTemplate('vehicles')}
                  className="btn bg-blue-600 text-white hover:bg-blue-700"
                >
                  Vehicle Template
                </button>
                <button
                  onClick={() => downloadTemplate('drivers')}
                  className="btn bg-green-600 text-white hover:bg-green-700"
                >
                  Driver Template
                </button>
                <button
                  onClick={() => downloadTemplate('shipments')}
                  className="btn bg-purple-600 text-white hover:bg-purple-700"
                >
                  Shipment Template
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Export All Data</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => exportToCSV(vehicles, 'all_vehicles.csv')}
                  className="btn bg-gray-600 text-white hover:bg-gray-700"
                >
                  Export Vehicles
                </button>
                <button
                  onClick={() => exportToCSV(drivers, 'all_drivers.csv')}
                  className="btn bg-gray-600 text-white hover:bg-gray-700"
                >
                  Export Drivers
                </button>
                <button
                  onClick={() => exportToCSV(shipments, 'all_shipments.csv')}
                  className="btn bg-gray-600 text-white hover:bg-gray-700"
                >
                  Export Shipments
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Clear All Data</label>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                    clearAllData();
                  }
                }}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Clear All Data
              </button>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Warning: This will permanently delete all vehicles, drivers, and shipments data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Document Processing */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Document Processing</h3>
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          Upload documents like delivery receipts, vehicle inspection reports, or driver licenses to automatically extract data.
        </p>
        
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Upload Document</label>
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Additional Instructions (Optional)</label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Add any specific instructions for data extraction..."
              rows={3}
              className="input"
            />
          </div>

          <button
            onClick={handleAiProcess}
            disabled={isAiLoading}
            className="btn btn-primary flex items-center gap-2"
          >
            {isAiLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                Process Document
              </>
            )}
          </button>

          {aiError && (
            <div className="alert alert-error">
              <AlertTriangle className="h-5 w-5" />
              <p>{aiError.message || aiError}</p>
            </div>
          )}

          {aiResult && (
            <div className="alert alert-success">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Document processed successfully!</p>
                <pre className="text-sm mt-2 whitespace-pre-wrap">{aiResult}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Modal Components
  const renderVehicleModal = () => (
    showVehicleModal && (
      <div className="modal-backdrop" onClick={() => setShowVehicleModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingItem ? 'Edit Vehicle' : 'Add Vehicle'}
            </h3>
            <button
              onClick={() => setShowVehicleModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Plate Number *</label>
                <input
                  type="text"
                  value={vehicleForm.plateNumber || ''}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  value={vehicleForm.type || 'truck'}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, type: e.target.value as Vehicle['type'] }))}
                  className="input"
                >
                  <option value="truck">Truck</option>
                  <option value="van">Van</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Model *</label>
                <input
                  type="text"
                  value={vehicleForm.model || ''}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <input
                  type="number"
                  value={vehicleForm.year || ''}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Capacity (kg)</label>
                <input
                  type="number"
                  value={vehicleForm.capacity || ''}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select
                  value={vehicleForm.fuelType || 'diesel'}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, fuelType: e.target.value as Vehicle['fuelType'] }))}
                  className="input"
                >
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={vehicleForm.status || 'active'}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, status: e.target.value as Vehicle['status'] }))}
                  className="input"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Mileage</label>
                <input
                  type="number"
                  value={vehicleForm.mileage || ''}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Maintenance</label>
                <input
                  type="date"
                  value={vehicleForm.lastMaintenance || ''}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, lastMaintenance: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Next Maintenance</label>
                <input
                  type="date"
                  value={vehicleForm.nextMaintenance || ''}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, nextMaintenance: e.target.value }))}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowVehicleModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveVehicle}
              className="btn btn-primary"
            >
              {editingItem ? 'Update' : 'Add'} Vehicle
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderDriverModal = () => (
    showDriverModal && (
      <div className="modal-backdrop" onClick={() => setShowDriverModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingItem ? 'Edit Driver' : 'Add Driver'}
            </h3>
            <button
              onClick={() => setShowDriverModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  value={driverForm.name || ''}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">License Number *</label>
                <input
                  type="text"
                  value={driverForm.licenseNumber || ''}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">License Expiry</label>
                <input
                  type="date"
                  value={driverForm.licenseExpiry || ''}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, licenseExpiry: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={driverForm.phone || ''}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={driverForm.email || ''}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, email: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience (years)</label>
                <input
                  type="number"
                  value={driverForm.experience || ''}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rating</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={driverForm.rating || ''}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, rating: parseFloat(e.target.value) || 5.0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={driverForm.status || 'available'}
                  onChange={(e) => setDriverForm(prev => ({ ...prev, status: e.target.value as Driver['status'] }))}
                  className="input"
                >
                  <option value="available">Available</option>
                  <option value="on_trip">On Trip</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowDriverModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDriver}
              className="btn btn-primary"
            >
              {editingItem ? 'Update' : 'Add'} Driver
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderShipmentModal = () => (
    showShipmentModal && (
      <div className="modal-backdrop" onClick={() => setShowShipmentModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingItem ? 'Edit Shipment' : 'Add Shipment'}
            </h3>
            <button
              onClick={() => setShowShipmentModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Tracking Number *</label>
                <input
                  type="text"
                  value={shipmentForm.trackingNumber || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, trackingNumber: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={shipmentForm.status || 'pending'}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, status: e.target.value as Shipment['status'] }))}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">From *</label>
                <input
                  type="text"
                  value={shipmentForm.from || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, from: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">To *</label>
                <input
                  type="text"
                  value={shipmentForm.to || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, to: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Distance ({distanceUnit})</label>
                <input
                  type="number"
                  value={shipmentForm.distance || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, distance: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vehicle</label>
                <select
                  value={shipmentForm.vehicleId || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, vehicleId: e.target.value }))}
                  className="input"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.plateNumber} - {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Driver</label>
                <select
                  value={shipmentForm.driverId || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, driverId: e.target.value }))}
                  className="input"
                >
                  <option value="">Select Driver</option>
                  {drivers.map(driver => (
                    <option key={driver.id} value={driver.id}>
                      {driver.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scheduled Date</label>
                <input
                  type="date"
                  value={shipmentForm.scheduledDate || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cargo</label>
                <input
                  type="text"
                  value={shipmentForm.cargo || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, cargo: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  value={shipmentForm.weight || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost ({currency})</label>
                <input
                  type="number"
                  value={shipmentForm.cost || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Name</label>
                <input
                  type="text"
                  value={shipmentForm.customerName || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Customer Phone</label>
                <input
                  type="tel"
                  value={shipmentForm.customerPhone || ''}
                  onChange={(e) => setShipmentForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowShipmentModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveShipment}
              className="btn btn-primary"
            >
              {editingItem ? 'Update' : 'Add'} Shipment
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderImportModal = () => (
    showImportModal && (
      <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import {importType}</h3>
            <button
              onClick={() => setShowImportModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Upload a CSV file to import multiple {importType}. Download the template first to see the required format.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => downloadTemplate(importType)}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="h-5 w-5" />
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
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  );

  const renderDeleteConfirm = () => (
    showDeleteConfirm && (
      <div className="modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="py-4">
            <p className="text-gray-600 dark:text-slate-400">
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </p>
          </div>

          <div className="modal-footer">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="btn bg-red-600 text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Handle ESC key for modals
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowVehicleModal(false);
        setShowDriverModal(false);
        setShowShipmentModal(false);
        setShowImportModal(false);
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={promptText}
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={setAiError}
        onLoading={setIsAiLoading}
      />

      {/* Navigation */}
      {renderNavigation()}

      {/* Main Content */}
      <main className="container-fluid py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'fleet' && renderFleetManagement()}
        {activeTab === 'drivers' && renderDriverManagement()}
        {activeTab === 'shipments' && renderShipmentManagement()}
        {activeTab === 'analytics' && renderAnalytics()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Modals */}
      {renderVehicleModal()}
      {renderDriverModal()}
      {renderShipmentModal()}
      {renderImportModal()}
      {renderDeleteConfirm()}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4">
        <div className="container-fluid">
          <div className="text-center text-sm text-gray-600 dark:text-slate-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;