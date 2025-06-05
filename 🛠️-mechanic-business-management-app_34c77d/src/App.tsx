import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  User, Calendar, Wrench, Package, DollarSign, TrendingUp, Search, Plus,
  Edit, Trash2, Car, Clock, Phone, Mail, MapPin, FileText, Download,
  Filter, Settings, Eye, CheckCircle, AlertCircle, XCircle, BarChart3,
  PieChart, Users, Truck, Fuel, Gauge, Cog, Bell, Menu, X, ChevronDown,
  ChevronRight, Home, LogOut, Calculator, Tag, Zap, Shield, Key
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  vehicles: Vehicle[];
  createdAt: string;
  totalSpent: number;
  lastService: string;
}

interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  mileage: number;
  color: string;
  engineType: string;
  lastServiceDate: string;
  nextServiceDue: string;
}

interface ServiceAppointment {
  id: string;
  customerId: string;
  vehicleId: string;
  customerName: string;
  vehicleMake: string;
  vehicleModel: string;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description: string;
  estimatedCost: number;
  actualCost: number;
  laborHours: number;
  parts: ServicePart[];
  notes: string;
  createdAt: string;
  completedAt?: string;
}

interface ServicePart {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand: string;
  partNumber: string;
  quantity: number;
  minStockLevel: number;
  unitPrice: number;
  supplier: string;
  location: string;
  description: string;
  lastRestocked: string;
}

interface Invoice {
  id: string;
  serviceId: string;
  customerName: string;
  vehicleInfo: string;
  serviceDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: string;
  dueDate: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

type ModalType = 'customer' | 'vehicle' | 'appointment' | 'inventory' | 'invoice' | 'settings' | null;
type ViewType = 'dashboard' | 'customers' | 'appointments' | 'inventory' | 'invoices' | 'analytics' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Core state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<ServiceAppointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Form state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<ServiceAppointment | null>(null);
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedCustomers = localStorage.getItem('mechanic_customers');
        const storedVehicles = localStorage.getItem('mechanic_vehicles');
        const storedAppointments = localStorage.getItem('mechanic_appointments');
        const storedInventory = localStorage.getItem('mechanic_inventory');
        const storedInvoices = localStorage.getItem('mechanic_invoices');

        if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
        if (storedVehicles) setVehicles(JSON.parse(storedVehicles));
        if (storedAppointments) setAppointments(JSON.parse(storedAppointments));
        if (storedInventory) setInventory(JSON.parse(storedInventory));
        if (storedInvoices) setInvoices(JSON.parse(storedInvoices));
      } catch (error) {
        console.error('Error loading stored data:', error);
      }
    };

    const initializeSampleData = () => {
      if (customers.length === 0) {
        const sampleCustomers: Customer[] = [
          {
            id: '1',
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '(555) 123-4567',
            address: '123 Main St, Anytown, ST 12345',
            vehicles: [],
            createdAt: '2025-05-01',
            totalSpent: 2450.75,
            lastService: '2025-05-15'
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            email: 'sarah.j@email.com',
            phone: '(555) 987-6543',
            address: '456 Oak Ave, Somewhere, ST 67890',
            vehicles: [],
            createdAt: '2025-04-15',
            totalSpent: 1875.25,
            lastService: '2025-06-01'
          }
        ];
        setCustomers(sampleCustomers);
        localStorage.setItem('mechanic_customers', JSON.stringify(sampleCustomers));
      }

      if (vehicles.length === 0) {
        const sampleVehicles: Vehicle[] = [
          {
            id: '1',
            customerId: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2019,
            vin: '1HGBH41JXMN109186',
            licensePlate: 'ABC123',
            mileage: 45000,
            color: 'Silver',
            engineType: '2.5L 4-Cylinder',
            lastServiceDate: '2025-05-15',
            nextServiceDue: '2025-08-15'
          },
          {
            id: '2',
            customerId: '2',
            make: 'Honda',
            model: 'CR-V',
            year: 2020,
            vin: '2HKRM4H75LH123456',
            licensePlate: 'XYZ789',
            mileage: 32000,
            color: 'Blue',
            engineType: '1.5L Turbo',
            lastServiceDate: '2025-06-01',
            nextServiceDue: '2025-09-01'
          }
        ];
        setVehicles(sampleVehicles);
        localStorage.setItem('mechanic_vehicles', JSON.stringify(sampleVehicles));
      }

      if (appointments.length === 0) {
        const sampleAppointments: ServiceAppointment[] = [
          {
            id: '1',
            customerId: '1',
            vehicleId: '1',
            customerName: 'John Smith',
            vehicleMake: 'Toyota',
            vehicleModel: 'Camry',
            serviceType: 'Oil Change',
            scheduledDate: '2025-06-05',
            scheduledTime: '10:00',
            status: 'scheduled',
            description: 'Regular oil change and filter replacement',
            estimatedCost: 75.00,
            actualCost: 0,
            laborHours: 1,
            parts: [],
            notes: '',
            createdAt: '2025-06-01'
          },
          {
            id: '2',
            customerId: '2',
            vehicleId: '2',
            customerName: 'Sarah Johnson',
            vehicleMake: 'Honda',
            vehicleModel: 'CR-V',
            serviceType: 'Brake Inspection',
            scheduledDate: '2025-06-06',
            scheduledTime: '14:00',
            status: 'scheduled',
            description: 'Complete brake system inspection and service',
            estimatedCost: 150.00,
            actualCost: 0,
            laborHours: 2,
            parts: [],
            notes: '',
            createdAt: '2025-06-02'
          }
        ];
        setAppointments(sampleAppointments);
        localStorage.setItem('mechanic_appointments', JSON.stringify(sampleAppointments));
      }

      if (inventory.length === 0) {
        const sampleInventory: InventoryItem[] = [
          {
            id: '1',
            name: 'Engine Oil 5W-30',
            category: 'Fluids',
            brand: 'Mobil 1',
            partNumber: 'M1-5W30-5QT',
            quantity: 25,
            minStockLevel: 10,
            unitPrice: 28.99,
            supplier: 'AutoZone',
            location: 'A1-B2',
            description: 'Full synthetic motor oil',
            lastRestocked: '2025-05-20'
          },
          {
            id: '2',
            name: 'Brake Pads - Front',
            category: 'Brakes',
            brand: 'Wagner',
            partNumber: 'WG-ZX1234',
            quantity: 12,
            minStockLevel: 5,
            unitPrice: 45.99,
            supplier: 'NAPA',
            location: 'B3-C1',
            description: 'Ceramic brake pads for front wheels',
            lastRestocked: '2025-05-15'
          },
          {
            id: '3',
            name: 'Air Filter',
            category: 'Filters',
            brand: 'K&N',
            partNumber: 'KN-33-2304',
            quantity: 8,
            minStockLevel: 15,
            unitPrice: 32.99,
            supplier: 'O\'Reilly',
            location: 'C2-D1',
            description: 'High-flow air filter',
            lastRestocked: '2025-05-25'
          }
        ];
        setInventory(sampleInventory);
        localStorage.setItem('mechanic_inventory', JSON.stringify(sampleInventory));
      }
    };

    loadStoredData();
    setTimeout(initializeSampleData, 100);
  }, [customers.length, vehicles.length, appointments.length, inventory.length]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('mechanic_customers', JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (vehicles.length > 0) {
      localStorage.setItem('mechanic_vehicles', JSON.stringify(vehicles));
    }
  }, [vehicles]);

  useEffect(() => {
    if (appointments.length > 0) {
      localStorage.setItem('mechanic_appointments', JSON.stringify(appointments));
    }
  }, [appointments]);

  useEffect(() => {
    if (inventory.length > 0) {
      localStorage.setItem('mechanic_inventory', JSON.stringify(inventory));
    }
  }, [inventory]);

  useEffect(() => {
    if (invoices.length > 0) {
      localStorage.setItem('mechanic_invoices', JSON.stringify(invoices));
    }
  }, [invoices]);

  // Modal management
  const openModal = (type: ModalType, item?: any) => {
    setActiveModal(type);
    if (type === 'customer') setEditingCustomer(item || null);
    if (type === 'vehicle') setEditingVehicle(item || null);
    if (type === 'appointment') setEditingAppointment(item || null);
    if (type === 'inventory') setEditingInventory(item || null);
    if (type === 'invoice') setEditingInvoice(item || null);
    document.body.classList.add('modal-open');
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditingCustomer(null);
    setEditingVehicle(null);
    setEditingAppointment(null);
    setEditingInventory(null);
    setEditingInvoice(null);
    document.body.classList.remove('modal-open');
  };

  // AI functions
  const handleAiAnalysis = (type: string, data?: any) => {
    let prompt = '';
    
    switch (type) {
      case 'service_recommendation':
        prompt = `Analyze this vehicle data and provide service recommendations. Return JSON with keys "recommendations", "urgency_level", "estimated_cost", "next_service_date". Vehicle: ${data?.make} ${data?.model} ${data?.year}, Mileage: ${data?.mileage}, Last Service: ${data?.lastServiceDate}`;
        break;
      case 'cost_estimation':
        prompt = `Estimate service costs for this repair. Return JSON with keys "labor_cost", "parts_cost", "total_estimate", "time_required", "difficulty_level". Service: ${data?.serviceType}, Vehicle: ${data?.vehicleMake} ${data?.vehicleModel}`;
        break;
      case 'inventory_analysis':
        prompt = `Analyze inventory levels and suggest reorder points. Return JSON with keys "low_stock_items", "reorder_suggestions", "cost_optimization", "seasonal_trends". Current inventory count: ${inventory.length} items`;
        break;
      case 'document_processing':
        prompt = `Extract invoice or receipt data from this document. Return JSON with keys "vendor", "amount", "date", "items", "part_numbers", "category".`;
        break;
      default:
        prompt = aiPrompt;
    }

    if (!prompt.trim() && !selectedFile) {
      setAiError('Please provide input or select a file to analyze.');
      return;
    }

    setAiResult(null);
    setAiError(null);
    
    try {
      if (selectedFile) {
        aiLayerRef.current?.sendToAI(prompt, selectedFile);
      } else {
        aiLayerRef.current?.sendToAI(prompt);
      }
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  // CRUD operations
  const saveCustomer = (customerData: Partial<Customer>) => {
    const newCustomer: Customer = {
      id: editingCustomer?.id || Date.now().toString(),
      name: customerData.name || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      address: customerData.address || '',
      vehicles: editingCustomer?.vehicles || [],
      createdAt: editingCustomer?.createdAt || new Date().toISOString().split('T')[0],
      totalSpent: editingCustomer?.totalSpent || 0,
      lastService: editingCustomer?.lastService || ''
    };

    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === editingCustomer.id ? newCustomer : c));
    } else {
      setCustomers([...customers, newCustomer]);
    }
    closeModal();
  };

  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    setVehicles(vehicles.filter(v => v.customerId !== id));
    setAppointments(appointments.filter(a => a.customerId !== id));
  };

  const saveVehicle = (vehicleData: Partial<Vehicle>) => {
    const newVehicle: Vehicle = {
      id: editingVehicle?.id || Date.now().toString(),
      customerId: vehicleData.customerId || '',
      make: vehicleData.make || '',
      model: vehicleData.model || '',
      year: vehicleData.year || new Date().getFullYear(),
      vin: vehicleData.vin || '',
      licensePlate: vehicleData.licensePlate || '',
      mileage: vehicleData.mileage || 0,
      color: vehicleData.color || '',
      engineType: vehicleData.engineType || '',
      lastServiceDate: editingVehicle?.lastServiceDate || '',
      nextServiceDue: editingVehicle?.nextServiceDue || ''
    };

    if (editingVehicle) {
      setVehicles(vehicles.map(v => v.id === editingVehicle.id ? newVehicle : v));
    } else {
      setVehicles([...vehicles, newVehicle]);
    }
    closeModal();
  };

  const deleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    setAppointments(appointments.filter(a => a.vehicleId !== id));
  };

  const saveAppointment = (appointmentData: Partial<ServiceAppointment>) => {
    const customer = customers.find(c => c.id === appointmentData.customerId);
    const vehicle = vehicles.find(v => v.id === appointmentData.vehicleId);
    
    const newAppointment: ServiceAppointment = {
      id: editingAppointment?.id || Date.now().toString(),
      customerId: appointmentData.customerId || '',
      vehicleId: appointmentData.vehicleId || '',
      customerName: customer?.name || '',
      vehicleMake: vehicle?.make || '',
      vehicleModel: vehicle?.model || '',
      serviceType: appointmentData.serviceType || '',
      scheduledDate: appointmentData.scheduledDate || '',
      scheduledTime: appointmentData.scheduledTime || '',
      status: appointmentData.status || 'scheduled',
      description: appointmentData.description || '',
      estimatedCost: appointmentData.estimatedCost || 0,
      actualCost: appointmentData.actualCost || 0,
      laborHours: appointmentData.laborHours || 0,
      parts: appointmentData.parts || [],
      notes: appointmentData.notes || '',
      createdAt: editingAppointment?.createdAt || new Date().toISOString().split('T')[0],
      completedAt: appointmentData.completedAt
    };

    if (editingAppointment) {
      setAppointments(appointments.map(a => a.id === editingAppointment.id ? newAppointment : a));
    } else {
      setAppointments([...appointments, newAppointment]);
    }
    closeModal();
  };

  const deleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const saveInventoryItem = (itemData: Partial<InventoryItem>) => {
    const newItem: InventoryItem = {
      id: editingInventory?.id || Date.now().toString(),
      name: itemData.name || '',
      category: itemData.category || '',
      brand: itemData.brand || '',
      partNumber: itemData.partNumber || '',
      quantity: itemData.quantity || 0,
      minStockLevel: itemData.minStockLevel || 0,
      unitPrice: itemData.unitPrice || 0,
      supplier: itemData.supplier || '',
      location: itemData.location || '',
      description: itemData.description || '',
      lastRestocked: itemData.lastRestocked || new Date().toISOString().split('T')[0]
    };

    if (editingInventory) {
      setInventory(inventory.map(i => i.id === editingInventory.id ? newItem : i));
    } else {
      setInventory([...inventory, newItem]);
    }
    closeModal();
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(i => i.id !== id));
  };

  // Data export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    localStorage.removeItem('mechanic_customers');
    localStorage.removeItem('mechanic_vehicles');
    localStorage.removeItem('mechanic_appointments');
    localStorage.removeItem('mechanic_inventory');
    localStorage.removeItem('mechanic_invoices');
    setCustomers([]);
    setVehicles([]);
    setAppointments([]);
    setInventory([]);
    setInvoices([]);
    closeModal();
  };

  // Analytics calculations
  const todaysAppointments = appointments.filter(a => a.scheduledDate === '2025-06-05');
  const completedAppointments = appointments.filter(a => a.status === 'completed');
  const totalRevenue = completedAppointments.reduce((sum, a) => sum + a.actualCost, 0);
  const avgServiceCost = completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0;
  const lowStockItems = inventory.filter(item => item.quantity <= item.minStockLevel);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'scheduled': return <Calendar className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.vehicleMake.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterCategory === 'all') return matchesSearch;
    return matchesSearch && appointment.status === filterCategory;
  });

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterCategory === 'all') return matchesSearch;
    if (filterCategory === 'low-stock') return matchesSearch && item.quantity <= item.minStockLevel;
    return matchesSearch && item.category.toLowerCase() === filterCategory.toLowerCase();
  });

  // Navigation component
  const Navigation = () => (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="container-fluid">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">AutoPro Manager</h1>
              <p className="text-sm text-gray-300">Professional Automotive Service</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              id="dashboard-nav"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('customers')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'customers' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              id="customers-nav"
            >
              <Users className="w-4 h-4" />
              Customers
            </button>
            <button
              onClick={() => setCurrentView('appointments')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'appointments' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              id="appointments-nav"
            >
              <Calendar className="w-4 h-4" />
              Appointments
            </button>
            <button
              onClick={() => setCurrentView('inventory')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'inventory' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              id="inventory-nav"
            >
              <Package className="w-4 h-4" />
              Inventory
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                currentView === 'analytics' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
              id="analytics-nav"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-sm text-gray-300">
              Welcome, {currentUser?.first_name}
            </span>
            <button
              onClick={() => setCurrentView('settings')}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              id="settings-nav"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={logout}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-4">
            <div className="flex flex-col gap-2">
              {[
                { view: 'dashboard', icon: Home, label: 'Dashboard' },
                { view: 'customers', icon: Users, label: 'Customers' },
                { view: 'appointments', icon: Calendar, label: 'Appointments' },
                { view: 'inventory', icon: Package, label: 'Inventory' },
                { view: 'analytics', icon: BarChart3, label: 'Analytics' }
              ].map(({ view, icon: Icon, label }) => (
                <button
                  key={view}
                  onClick={() => {
                    setCurrentView(view as ViewType);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    currentView === view ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // Dashboard view
  const DashboardView = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Today's overview and quick stats</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">June 5, 2025</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Today's Appointments</div>
              <div className="stat-value">{todaysAppointments.length}</div>
            </div>
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Active Customers</div>
              <div className="stat-value">{customers.length}</div>
            </div>
            <Users className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex-between">
            <div>
              <div className="stat-title">Low Stock Alerts</div>
              <div className="stat-value text-red-600">{lowStockItems.length}</div>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => openModal('appointment')}
            className="btn btn-primary flex items-center gap-2 justify-center"
            id="quick-appointment"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
          <button
            onClick={() => openModal('customer')}
            className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
          <button
            onClick={() => openModal('inventory')}
            className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 justify-center"
          >
            <Plus className="w-4 h-4" />
            Add Part
          </button>
          <button
            onClick={() => handleAiAnalysis('inventory_analysis')}
            className="btn bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2 justify-center"
            id="ai-analysis"
          >
            <Zap className="w-4 h-4" />
            AI Analysis
          </button>
        </div>
      </div>

      {/* Today's Appointments */}
      <div className="card">
        <div className="flex-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Today's Schedule</h3>
          <button
            onClick={() => setCurrentView('appointments')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>
        
        {todaysAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No appointments scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todaysAppointments.slice(0, 3).map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(appointment.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {appointment.customerName}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {appointment.vehicleMake} {appointment.vehicleModel} - {appointment.serviceType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {appointment.scheduledTime}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Low Stock Alerts</h3>
          </div>
          <div className="space-y-2">
            {lowStockItems.slice(0, 3).map((item) => (
              <div key={item.id} className="flex-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Stock: {item.quantity} (Min: {item.minStockLevel})</p>
                </div>
                <span className="badge badge-error">Low Stock</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Customers view
  const CustomersView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your customer database</p>
        </div>
        <button
          onClick={() => openModal('customer')}
          className="btn btn-primary flex items-center gap-2"
          id="add-customer"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search and filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportToCSV(customers, 'customers')}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Customers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const customerVehicles = vehicles.filter(v => v.customerId === customer.id);
          const customerAppointments = appointments.filter(a => a.customerId === customer.id);
          
          return (
            <div key={customer.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer since {customer.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal('customer', customer)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCustomer(customer.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Mail className="w-4 h-4" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Phone className="w-4 h-4" />
                  <span>{customer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{customer.address}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vehicles</p>
                  <p className="font-medium text-gray-900 dark:text-white">{customerVehicles.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
                  <p className="font-medium text-gray-900 dark:text-white">${customer.totalSpent.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openModal('vehicle', { customerId: customer.id })}
                  className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1 flex-1"
                >
                  <Car className="w-3 h-3" />
                  Add Vehicle
                </button>
                <button
                  onClick={() => openModal('appointment', { customerId: customer.id })}
                  className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex items-center gap-1 flex-1"
                >
                  <Calendar className="w-3 h-3" />
                  Book Service
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No customers found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first customer</p>
          <button
            onClick={() => openModal('customer')}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      )}
    </div>
  );

  // Appointments view
  const AppointmentsView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Appointments</h2>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage service appointments</p>
        </div>
        <button
          onClick={() => openModal('appointment')}
          className="btn btn-primary flex items-center gap-2"
          id="add-appointment"
        >
          <Plus className="w-4 h-4" />
          New Appointment
        </button>
      </div>

      {/* Search and filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => exportToCSV(appointments, 'appointments')}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Appointments list */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {appointment.customerName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {appointment.vehicleMake} {appointment.vehicleModel}
                    </p>
                  </div>
                </div>
                
                <div className="ml-13">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{appointment.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.scheduledTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Wrench className="w-4 h-4" />
                      <span>{appointment.serviceType}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${appointment.estimatedCost.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {appointment.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {appointment.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-2">{appointment.status}</span>
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openModal('appointment', appointment)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleAiAnalysis('cost_estimation', appointment)}
                    className="p-2 text-gray-400 hover:text-orange-600 transition-colors"
                    title="AI Cost Estimation"
                  >
                    <Calculator className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No appointments found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Schedule your first service appointment</p>
          <button
            onClick={() => openModal('appointment')}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      )}
    </div>
  );

  // Inventory view
  const InventoryView = () => (
    <div className="space-y-6">
      <div className="flex-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parts Inventory</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your parts and supplies</p>
        </div>
        <button
          onClick={() => openModal('inventory')}
          className="btn btn-primary flex items-center gap-2"
          id="add-inventory"
        >
          <Plus className="w-4 h-4" />
          Add Part
        </button>
      </div>

      {/* Search and filters */}
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
          <div className="flex gap-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input"
            >
              <option value="all">All Categories</option>
              <option value="fluids">Fluids</option>
              <option value="brakes">Brakes</option>
              <option value="filters">Filters</option>
              <option value="low-stock">Low Stock</option>
            </select>
            <button
              onClick={() => exportToCSV(inventory, 'inventory')}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Inventory grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <div key={item.id} className={`card hover:shadow-lg transition-shadow ${
            item.quantity <= item.minStockLevel ? 'border-l-4 border-red-500' : ''
          }`}>
            <div className="flex-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.brand}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openModal('inventory', item)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteInventoryItem(item.id)}
                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Part #:</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.partNumber}</span>
              </div>
              <div className="flex-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Category:</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.category}</span>
              </div>
              <div className="flex-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Location:</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.location}</span>
              </div>
              <div className="flex-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
                <span className="font-medium text-gray-900 dark:text-white">{item.supplier}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Stock Level</p>
                <p className={`font-medium ${
                  item.quantity <= item.minStockLevel ? 'text-red-600' : 'text-gray-900 dark:text-white'
                }`}>
                  {item.quantity}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Min: {item.minStockLevel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unit Price</p>
                <p className="font-medium text-gray-900 dark:text-white">${item.unitPrice.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Value: ${(item.quantity * item.unitPrice).toFixed(2)}</p>
              </div>
            </div>
            
            {item.quantity <= item.minStockLevel && (
              <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-400 font-medium">Low Stock Alert</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No inventory items found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Start building your parts inventory</p>
          <button
            onClick={() => openModal('inventory')}
            className="btn btn-primary flex items-center gap-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            Add Part
          </button>
        </div>
      )}
    </div>
  );

  // Analytics view
  const AnalyticsView = () => {
    const monthlyRevenue = [
      { month: 'Jan', revenue: 4500 },
      { month: 'Feb', revenue: 3800 },
      { month: 'Mar', revenue: 5200 },
      { month: 'Apr', revenue: 4700 },
      { month: 'May', revenue: 6100 },
      { month: 'Jun', revenue: 5800 }
    ];

    const serviceTypes = [
      { name: 'Oil Change', count: 45, percentage: 35 },
      { name: 'Brake Service', count: 28, percentage: 22 },
      { name: 'Engine Repair', count: 18, percentage: 14 },
      { name: 'Transmission', count: 15, percentage: 12 },
      { name: 'Other', count: 22, percentage: 17 }
    ];

    return (
      <div className="space-y-6">
        <div className="flex-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Business insights and performance metrics</p>
          </div>
          <button
            onClick={() => handleAiAnalysis('inventory_analysis')}
            className="btn bg-orange-600 text-white hover:bg-orange-700 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            AI Insights
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Monthly Revenue</div>
            <div className="stat-value">${totalRevenue.toFixed(2)}</div>
            <div className="stat-desc flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              +12% from last month
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Avg Service Cost</div>
            <div className="stat-value">${avgServiceCost.toFixed(2)}</div>
            <div className="stat-desc">Per appointment</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Customer Retention</div>
            <div className="stat-value">87%</div>
            <div className="stat-desc">Returning customers</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Inventory Value</div>
            <div className="stat-value">${inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0).toFixed(2)}</div>
            <div className="stat-desc">{inventory.length} total items</div>
          </div>
        </div>

        {/* Service Types Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Service Types Distribution</h3>
          <div className="space-y-4">
            {serviceTypes.map((service, index) => (
              <div key={service.name} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {service.name}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-red-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 w-12">
                      {service.percentage}%
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white w-8">
                      {service.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Monthly Revenue Trend</h3>
          <div className="flex items-end gap-4 h-64">
            {monthlyRevenue.map((month, index) => {
              const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));
              const heightPercentage = (month.revenue / maxRevenue) * 100;
              
              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    ${month.revenue.toLocaleString()}
                  </div>
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
                    style={{ height: `${heightPercentage}%` }}
                  ></div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {month.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(appointment.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {appointment.customerName} - {appointment.serviceType}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {appointment.scheduledDate} at {appointment.scheduledTime}
                  </p>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  ${appointment.estimatedCost.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Settings view
  const SettingsView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Manage your shop settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Information */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Business Information</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input type="text" defaultValue="AutoPro Garage" className="input" />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea defaultValue="123 Service Road, Automotive City, AC 12345" className="input" rows={3}></textarea>
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="tel" defaultValue="(555) 123-SHOP" className="input" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" defaultValue="info@autoprogarage.com" className="input" />
            </div>
          </div>
        </div>

        {/* Service Categories */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Service Categories</h3>
          <div className="space-y-2 mb-4">
            {['Oil Change', 'Brake Service', 'Engine Repair', 'Transmission', 'Electrical', 'AC Service'].map((category) => (
              <div key={category} className="flex-between p-2 border border-gray-200 dark:border-gray-600 rounded">
                <span className="text-gray-900 dark:text-white">{category}</span>
                <button className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Add new category" 
              className="input flex-1" 
            />
            <button className="btn btn-primary">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Labor Rates */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Labor Rates</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Standard Rate ($/hour)</label>
              <input type="number" defaultValue="95" className="input" />
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Rate ($/hour)</label>
              <input type="number" defaultValue="125" className="input" />
            </div>
            <div className="form-group">
              <label className="form-label">Diagnostic Fee</label>
              <input type="number" defaultValue="89" className="input" />
            </div>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Assistant</h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">AI Analysis Prompt</label>
              <textarea 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Enter custom prompt for AI analysis..."
                className="input" 
                rows={3}
              ></textarea>
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="input flex-1"
                accept="image/*,.pdf,.doc,.docx"
              />
              <button
                onClick={() => handleAiAnalysis('document_processing')}
                disabled={isAiLoading}
                className="btn btn-primary flex items-center gap-2"
                id="ai-process-document"
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                Process
              </button>
            </div>
            
            {aiResult && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">AI Analysis Result:</h4>
                <pre className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">{aiResult}</pre>
              </div>
            )}
            
            {aiError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Error:</h4>
                <p className="text-sm text-red-700 dark:text-red-300">{aiError.message || aiError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportToCSV(customers, 'customers')}
                className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 justify-center"
              >
                <Download className="w-4 h-4" />
                Export Customers
              </button>
              <button
                onClick={() => exportToCSV(appointments, 'appointments')}
                className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 justify-center"
              >
                <Download className="w-4 h-4" />
                Export Appointments
              </button>
              <button
                onClick={() => exportToCSV(inventory, 'inventory')}
                className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 justify-center"
              >
                <Download className="w-4 h-4" />
                Export Inventory
              </button>
              <button
                onClick={() => exportToCSV(vehicles, 'vehicles')}
                className="btn bg-yellow-600 text-white hover:bg-yellow-700 flex items-center gap-2 justify-center"
              >
                <Download className="w-4 h-4" />
                Export Vehicles
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <button
                onClick={clearAllData}
                className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 justify-center w-full"
              >
                <Trash2 className="w-4 h-4" />
                Clear All Data
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Warning: This action cannot be undone
              </p>
            </div>
          </div>
        </div>

        {/* Template Downloads */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Import Templates</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Download CSV templates to import bulk data
          </p>
          <div className="space-y-2">
            {[
              { name: 'Customer Template', headers: 'name,email,phone,address' },
              { name: 'Vehicle Template', headers: 'customerId,make,model,year,vin,licensePlate,mileage,color,engineType' },
              { name: 'Inventory Template', headers: 'name,category,brand,partNumber,quantity,minStockLevel,unitPrice,supplier,location,description' }
            ].map((template) => (
              <button
                key={template.name}
                onClick={() => {
                  const csvContent = template.headers;
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${template.name.toLowerCase().replace(' ', '_')}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2 justify-center w-full"
              >
                <Download className="w-4 h-4" />
                {template.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Modal forms
  const CustomerModal = () => {
    const [formData, setFormData] = useState({
      name: editingCustomer?.name || '',
      email: editingCustomer?.email || '',
      phone: editingCustomer?.phone || '',
      address: editingCustomer?.address || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveCustomer(formData);
    };

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="Enter customer name"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="customer@email.com"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input"
                rows={3}
                placeholder="Customer address"
              ></textarea>
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingCustomer ? 'Update' : 'Add'} Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const VehicleModal = () => {
    const [formData, setFormData] = useState({
      customerId: editingVehicle?.customerId || '',
      make: editingVehicle?.make || '',
      model: editingVehicle?.model || '',
      year: editingVehicle?.year || new Date().getFullYear(),
      vin: editingVehicle?.vin || '',
      licensePlate: editingVehicle?.licensePlate || '',
      mileage: editingVehicle?.mileage || 0,
      color: editingVehicle?.color || '',
      engineType: editingVehicle?.engineType || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveVehicle(formData);
    };

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Customer *</label>
              <select
                required
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className="input"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Make *</label>
                <input
                  type="text"
                  required
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="input"
                  placeholder="Toyota"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input
                  type="text"
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="input"
                  placeholder="Camry"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Year *</label>
                <input
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  className="input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Mileage</label>
                <input
                  type="number"
                  min="0"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                  className="input"
                  placeholder="50000"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">VIN</label>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="input"
                placeholder="17-character VIN"
                maxLength={17}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">License Plate</label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  className="input"
                  placeholder="ABC123"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="input"
                  placeholder="Silver"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Engine Type</label>
              <input
                type="text"
                value={formData.engineType}
                onChange={(e) => setFormData({ ...formData, engineType: e.target.value })}
                className="input"
                placeholder="2.5L 4-Cylinder"
              />
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingVehicle ? 'Update' : 'Add'} Vehicle
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AppointmentModal = () => {
    const [formData, setFormData] = useState({
      customerId: editingAppointment?.customerId || '',
      vehicleId: editingAppointment?.vehicleId || '',
      serviceType: editingAppointment?.serviceType || '',
      scheduledDate: editingAppointment?.scheduledDate || '',
      scheduledTime: editingAppointment?.scheduledTime || '',
      status: editingAppointment?.status || 'scheduled',
      description: editingAppointment?.description || '',
      estimatedCost: editingAppointment?.estimatedCost || 0,
      laborHours: editingAppointment?.laborHours || 1
    });

    const customerVehicles = vehicles.filter(v => v.customerId === formData.customerId);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveAppointment(formData);
    };

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingAppointment ? 'Edit Appointment' : 'New Service Appointment'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value, vehicleId: '' })}
                  className="input"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Vehicle *</label>
                <select
                  required
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                  className="input"
                  disabled={!formData.customerId}
                >
                  <option value="">Select Vehicle</option>
                  {customerVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Service Type *</label>
              <select
                required
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="input"
              >
                <option value="">Select Service</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Brake Service">Brake Service</option>
                <option value="Engine Repair">Engine Repair</option>
                <option value="Transmission Service">Transmission Service</option>
                <option value="Electrical Diagnosis">Electrical Diagnosis</option>
                <option value="AC Service">AC Service</option>
                <option value="Tire Service">Tire Service</option>
                <option value="General Inspection">General Inspection</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                  className="input"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Time *</label>
                <input
                  type="time"
                  required
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Describe the service needed..."
              ></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Estimated Cost ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                  className="input"
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Labor Hours</label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={formData.laborHours}
                  onChange={(e) => setFormData({ ...formData, laborHours: parseFloat(e.target.value) || 1 })}
                  className="input"
                  placeholder="1.0"
                />
              </div>
            </div>
            
            {editingAppointment && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            )}
            
            <div className="modal-footer">
              <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingAppointment ? 'Update' : 'Schedule'} Appointment
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const InventoryModal = () => {
    const [formData, setFormData] = useState({
      name: editingInventory?.name || '',
      category: editingInventory?.category || '',
      brand: editingInventory?.brand || '',
      partNumber: editingInventory?.partNumber || '',
      quantity: editingInventory?.quantity || 0,
      minStockLevel: editingInventory?.minStockLevel || 0,
      unitPrice: editingInventory?.unitPrice || 0,
      supplier: editingInventory?.supplier || '',
      location: editingInventory?.location || '',
      description: editingInventory?.description || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      saveInventoryItem(formData);
    };

    return (
      <div className="modal-backdrop" onClick={closeModal}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingInventory ? 'Edit Part' : 'Add New Part'}
            </h3>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Part Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="Engine Oil 5W-30"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                >
                  <option value="">Select Category</option>
                  <option value="Fluids">Fluids</option>
                  <option value="Brakes">Brakes</option>
                  <option value="Filters">Filters</option>
                  <option value="Belts">Belts</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Engine">Engine</option>
                  <option value="Transmission">Transmission</option>
                  <option value="Tools">Tools</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="input"
                  placeholder="Mobil 1"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Part Number</label>
                <input
                  type="text"
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  className="input"
                  placeholder="M1-5W30-5QT"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="25"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Min Stock Level</label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStockLevel}
                  onChange={(e) => setFormData({ ...formData, minStockLevel: parseInt(e.target.value) || 0 })}
                  className="input"
                  placeholder="10"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Unit Price ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="input"
                  placeholder="28.99"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="input"
                  placeholder="AutoZone"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Storage Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input"
                  placeholder="A1-B2"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={3}
                placeholder="Part description and notes..."
              ></textarea>
            </div>
            
            <div className="modal-footer">
              <button type="button" onClick={closeModal} className="btn bg-gray-100 text-gray-700 hover:bg-gray-200">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingInventory ? 'Update' : 'Add'} Part
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" id="generation_issue_fallback">
      <Navigation />
      
      <main className="container-fluid py-6">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'customers' && <CustomersView />}
        {currentView === 'appointments' && <AppointmentsView />}
        {currentView === 'inventory' && <InventoryView />}
        {currentView === 'analytics' && <AnalyticsView />}
        {currentView === 'settings' && <SettingsView />}
      </main>

      {/* Modals */}
      {activeModal === 'customer' && <CustomerModal />}
      {activeModal === 'vehicle' && <VehicleModal />}
      {activeModal === 'appointment' && <AppointmentModal />}
      {activeModal === 'inventory' && <InventoryModal />}

      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 mt-12">
        <div className="container-fluid">
          <div className="text-center text-sm text-gray-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;