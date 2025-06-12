import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { Camera } from 'react-camera-pro';
import {
  Calendar,
  Clock,
  User,
  Settings,
  BarChart3,
  QrCode,
  Scan,
  Car,
  Wrench,
  Plus,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  Upload,
  Bell,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MapPin,
  Phone,
  Mail,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  Package,
  Eye,
  MessageCircle,
  Minus,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Building,
  Camera as CameraIcon,
  RefreshCw,
  History,
  FileImage,
  AlertCircle,
  ShoppingCart,
  Tag,
  UserCheck,
  ArrowDown
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Customer {
  id: string;
  userId: string; // 5-digit alphanumeric user ID
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  vehicleInfo: string;
  registrationDate: string;
  totalAppointments: number;
  lastVisit: string;
  qrCode: string;
}

interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  customService?: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string;
  estimatedCost: number;
  actualCost?: number;
  vehicleInfo: string;
  createdAt: string;
  reminderSent: boolean;
}

interface ServiceType {
  id: string;
  name: string;
  description: string;
  estimatedDuration: number;
  estimatedCost: number;
  category: string;
}

interface ServiceHistory {
  id: string;
  customerId: string;
  customerName: string;
  vehicleInfo: string;
  date: string;
  description: string;
  partsUsed: string[];
  mechanicName: string;
  cost: number;
  mileage?: number;
  notes: string;
  createdAt: string;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  reorderPoint: number;
  cost: number;
  supplier: string;
  location: string;
  lastUpdated: string;
}

interface DamageAssessment {
  id: string;
  customerId?: string;
  customerName: string;
  vehicleInfo: string;
  date: string;
  damageDescription: string;
  repairRecommendations: string[];
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high';
  imageUrl?: string;
  createdAt: string;
}

interface Reminder {
  id: string;
  appointmentId: string;
  customerName: string;
  message: string;
  scheduledDate: string;
  sent: boolean;
  type: 'email' | 'sms';
}

interface Analytics {
  totalCustomers: number;
  totalAppointments: number;
  totalRevenue: number;
  avgAppointmentValue: number;
  completionRate: number;
  popularServices: { name: string; count: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
  customerSatisfaction: number;
}

type ViewMode = 'customer' | 'manager';
type ManagerTab = 'dashboard' | 'appointments' | 'customers' | 'services' | 'history' | 'inventory' | 'damage-assessment' | 'analytics' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  const cameraRef = useRef<any>(null);
  
  // Core state
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [activeTab, setActiveTab] = useState<ManagerTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [confirmClearAllData, setConfirmClearAllData] = useState(false);
  
  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [damageAssessments, setDamageAssessments] = useState<DamageAssessment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // UI state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedServiceRecord, setSelectedServiceRecord] = useState<ServiceHistory | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);
  const [selectedDamageAssessment, setSelectedDamageAssessment] = useState<DamageAssessment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [appointmentForm, setAppointmentForm] = useState({
    customerId: '',
    customerName: '',
    serviceType: '',
    customService: '',
    date: '',
    time: '',
    notes: '',
    vehicleInfo: '',
    estimatedCost: 0,
    userId: '' // New field for User ID lookup
  });
  
  const [customerForm, setCustomerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    vehicleInfo: ''
  });
  
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    estimatedDuration: 0,
    estimatedCost: 0,
    category: ''
  });

  const [serviceHistoryForm, setServiceHistoryForm] = useState({
    customerId: '',
    customerName: '',
    vehicleInfo: '',
    date: '',
    description: '',
    partsUsed: [] as string[],
    mechanicName: '',
    cost: 0,
    mileage: 0,
    notes: ''
  });

  const [inventoryForm, setInventoryForm] = useState({
    name: '',
    description: '',
    category: '',
    quantity: 0,
    reorderPoint: 0,
    cost: 0,
    supplier: '',
    location: ''
  });

  const [damageAssessmentForm, setDamageAssessmentForm] = useState({
    customerId: '',
    customerName: '',
    vehicleInfo: '',
    damageDescription: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimatedCost: 0,
    repairRecommendations: [] as string[]
  });
  
  // AI state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // QR Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [numberOfCameras, setNumberOfCameras] = useState(0);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('environment');
  
  // User ID lookup state
  const [userIdLookup, setUserIdLookup] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  
  // Load data on mount
  useEffect(() => {
    loadData();
    initializeDefaultData();
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
    }
  }, []);
  
  // Auto-save data changes
  useEffect(() => {
    saveData();
  }, [customers, appointments, serviceTypes, serviceHistory, inventory, damageAssessments, reminders]);
  
  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      localStorage.setItem('darkMode', 'true');
    } else {
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);
  
  // Check camera permissions when scanner is activated
  useEffect(() => {
    if (scannerActive) {
      checkCameraPermissions();
    }
  }, [scannerActive]);
  
  // User ID lookup effect
  useEffect(() => {
    if (userIdLookup.length === 5) {
      const customer = customers.find(c => c.userId.toLowerCase() === userIdLookup.toLowerCase());
      if (customer) {
        setFoundCustomer(customer);
        setAppointmentForm(prev => ({
          ...prev,
          customerId: customer.id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          vehicleInfo: customer.vehicleInfo
        }));
      } else {
        setFoundCustomer(null);
        setAppointmentForm(prev => ({
          ...prev,
          customerId: '',
          customerName: '',
          vehicleInfo: ''
        }));
      }
    } else {
      setFoundCustomer(null);
      if (userIdLookup.length === 0) {
        setAppointmentForm(prev => ({
          ...prev,
          customerId: '',
          customerName: '',
          vehicleInfo: ''
        }));
      }
    }
  }, [userIdLookup, customers]);
  
  const checkCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      setCameraError(null);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      setCameraPermission('denied');
      setCameraError('Camera access denied. Please enable camera permissions in your browser settings and refresh the page.');
    }
  };
  
  const loadData = () => {
    try {
      const savedCustomers = localStorage.getItem('mechanic_customers');
      const savedAppointments = localStorage.getItem('mechanic_appointments');
      const savedServiceTypes = localStorage.getItem('mechanic_service_types');
      const savedServiceHistory = localStorage.getItem('mechanic_service_history');
      const savedInventory = localStorage.getItem('mechanic_inventory');
      const savedDamageAssessments = localStorage.getItem('mechanic_damage_assessments');
      const savedReminders = localStorage.getItem('mechanic_reminders');
      
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
      if (savedServiceTypes) setServiceTypes(JSON.parse(savedServiceTypes));
      if (savedServiceHistory) setServiceHistory(JSON.parse(savedServiceHistory));
      if (savedInventory) setInventory(JSON.parse(savedInventory));
      if (savedDamageAssessments) setDamageAssessments(JSON.parse(savedDamageAssessments));
      if (savedReminders) setReminders(JSON.parse(savedReminders));
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data from storage');
    }
  };
  
  const saveData = () => {
    try {
      localStorage.setItem('mechanic_customers', JSON.stringify(customers));
      localStorage.setItem('mechanic_appointments', JSON.stringify(appointments));
      localStorage.setItem('mechanic_service_types', JSON.stringify(serviceTypes));
      localStorage.setItem('mechanic_service_history', JSON.stringify(serviceHistory));
      localStorage.setItem('mechanic_inventory', JSON.stringify(inventory));
      localStorage.setItem('mechanic_damage_assessments', JSON.stringify(damageAssessments));
      localStorage.setItem('mechanic_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save data to storage');
    }
  };
  
  const initializeDefaultData = () => {
    const savedServiceTypes = localStorage.getItem('mechanic_service_types');
    if (!savedServiceTypes) {
      const defaultServices: ServiceType[] = [
        {
          id: '1',
          name: 'Oil Change',
          description: 'Regular oil and filter change',
          estimatedDuration: 30,
          estimatedCost: 45,
          category: 'Maintenance'
        },
        {
          id: '2',
          name: 'Brake Inspection',
          description: 'Complete brake system inspection',
          estimatedDuration: 60,
          estimatedCost: 80,
          category: 'Safety'
        },
        {
          id: '3',
          name: 'Tire Rotation',
          description: 'Rotate tires for even wear',
          estimatedDuration: 45,
          estimatedCost: 35,
          category: 'Maintenance'
        },
        {
          id: '4',
          name: 'Engine Diagnostic',
          description: 'Computer diagnostic scan',
          estimatedDuration: 90,
          estimatedCost: 120,
          category: 'Diagnostic'
        },
        {
          id: '5',
          name: 'Transmission Service',
          description: 'Transmission fluid change and inspection',
          estimatedDuration: 120,
          estimatedCost: 180,
          category: 'Maintenance'
        }
      ];
      setServiceTypes(defaultServices);
    }

    const savedInventory = localStorage.getItem('mechanic_inventory');
    if (!savedInventory) {
      const defaultInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Engine Oil Filter',
          description: 'Standard oil filter for most vehicles',
          category: 'Filters',
          quantity: 25,
          reorderPoint: 10,
          cost: 8.99,
          supplier: 'AutoParts Plus',
          location: 'Shelf A1',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Brake Pads',
          description: 'Ceramic brake pads - front set',
          category: 'Brakes',
          quantity: 5,
          reorderPoint: 8,
          cost: 45.99,
          supplier: 'Brake Specialists',
          location: 'Shelf B2',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Motor Oil 5W-30',
          description: 'Synthetic motor oil 5 quart container',
          category: 'Fluids',
          quantity: 15,
          reorderPoint: 12,
          cost: 24.99,
          supplier: 'Oil Direct',
          location: 'Storage Room',
          lastUpdated: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Air Filter',
          description: 'Engine air filter universal fit',
          category: 'Filters',
          quantity: 8,
          reorderPoint: 15,
          cost: 12.99,
          supplier: 'AutoParts Plus',
          location: 'Shelf A2',
          lastUpdated: new Date().toISOString()
        }
      ];
      setInventory(defaultInventory);
    }
  };
  
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };
  
  const generateUserId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    const exists = customers.some(c => c.userId === result);
    return exists ? generateUserId() : result;
  };
  
  const generateQRCode = (customerId: string): string => {
    return `MECHANIC_CUSTOMER_${customerId}_${Date.now()}`;
  };
  
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  const createCustomer = () => {
    if (!customerForm.firstName || !customerForm.lastName || !customerForm.email || !customerForm.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newCustomer: Customer = {
      id: generateId(),
      userId: generateUserId(),
      firstName: customerForm.firstName,
      lastName: customerForm.lastName,
      email: customerForm.email,
      phone: customerForm.phone,
      address: customerForm.address,
      vehicleInfo: customerForm.vehicleInfo,
      registrationDate: new Date().toISOString(),
      totalAppointments: 0,
      lastVisit: '',
      qrCode: ''
    };
    
    newCustomer.qrCode = generateQRCode(newCustomer.id);
    
    setCustomers(prev => [...prev, newCustomer]);
    resetCustomerForm();
    setShowModal(false);
    setSuccess(`Customer registered successfully! User ID: ${newCustomer.userId}`);
    setTimeout(() => setSuccess(null), 5000);
  };
  
  const updateCustomer = () => {
    if (!selectedCustomer) return;
    
    const updatedCustomer: Customer = {
      ...selectedCustomer,
      firstName: customerForm.firstName,
      lastName: customerForm.lastName,
      email: customerForm.email,
      phone: customerForm.phone,
      address: customerForm.address,
      vehicleInfo: customerForm.vehicleInfo
    };
    
    setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updatedCustomer : c));
    resetCustomerForm();
    setSelectedCustomer(null);
    setShowModal(false);
    setSuccess('Customer updated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const deleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setAppointments(prev => prev.filter(a => a.customerId !== customerId));
    setServiceHistory(prev => prev.filter(s => s.customerId !== customerId));
    setSuccess('Customer deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const createAppointment = () => {
    if (!appointmentForm.customerName || !appointmentForm.serviceType || !appointmentForm.date || !appointmentForm.time) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newAppointment: Appointment = {
      id: generateId(),
      customerId: appointmentForm.customerId || generateId(),
      customerName: appointmentForm.customerName,
      serviceType: appointmentForm.serviceType,
      customService: appointmentForm.customService,
      date: appointmentForm.date,
      time: appointmentForm.time,
      status: 'pending',
      notes: appointmentForm.notes,
      estimatedCost: appointmentForm.estimatedCost,
      vehicleInfo: appointmentForm.vehicleInfo,
      createdAt: new Date().toISOString(),
      reminderSent: false
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    
    if (appointmentForm.customerId) {
      setCustomers(prev => prev.map(c => 
        c.id === appointmentForm.customerId 
          ? { ...c, totalAppointments: c.totalAppointments + 1, lastVisit: appointmentForm.date }
          : c
      ));
    }
    
    scheduleReminder(newAppointment);
    
    resetAppointmentForm();
    setShowModal(false);
    setSuccess('Appointment scheduled successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const updateAppointment = () => {
    if (!selectedAppointment) return;
    
    const updatedAppointment: Appointment = {
      ...selectedAppointment,
      customerName: appointmentForm.customerName,
      serviceType: appointmentForm.serviceType,
      customService: appointmentForm.customService,
      date: appointmentForm.date,
      time: appointmentForm.time,
      notes: appointmentForm.notes,
      estimatedCost: appointmentForm.estimatedCost,
      vehicleInfo: appointmentForm.vehicleInfo
    };
    
    setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? updatedAppointment : a));
    resetAppointmentForm();
    setSelectedAppointment(null);
    setShowModal(false);
    setSuccess('Appointment updated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const deleteAppointment = (appointmentId: string) => {
    setAppointments(prev => prev.filter(a => a.id !== appointmentId));
    setReminders(prev => prev.filter(r => r.appointmentId !== appointmentId));
    setSuccess('Appointment deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const updateAppointmentStatus = (appointmentId: string, status: Appointment['status'], actualCost?: number) => {
    setAppointments(prev => prev.map(a => 
      a.id === appointmentId 
        ? { ...a, status, actualCost: actualCost || a.actualCost }
        : a
    ));
  };
  
  const scheduleReminder = (appointment: Appointment) => {
    const reminderDate = new Date(appointment.date);
    reminderDate.setDate(reminderDate.getDate() - 1);
    
    const reminder: Reminder = {
      id: generateId(),
      appointmentId: appointment.id,
      customerName: appointment.customerName,
      message: `Reminder: Your appointment for ${appointment.serviceType} is scheduled for tomorrow at ${appointment.time}`,
      scheduledDate: reminderDate.toISOString(),
      sent: false,
      type: 'email'
    };
    
    setReminders(prev => [...prev, reminder]);
  };
  
  const createService = () => {
    if (!serviceForm.name || !serviceForm.description || !serviceForm.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newService: ServiceType = {
      id: generateId(),
      name: serviceForm.name,
      description: serviceForm.description,
      estimatedDuration: serviceForm.estimatedDuration,
      estimatedCost: serviceForm.estimatedCost,
      category: serviceForm.category
    };
    
    setServiceTypes(prev => [...prev, newService]);
    resetServiceForm();
    setShowModal(false);
    setSuccess('Service type created successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const deleteService = (serviceId: string) => {
    setServiceTypes(prev => prev.filter(s => s.id !== serviceId));
    setSuccess('Service type deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const createServiceRecord = () => {
    if (!serviceHistoryForm.customerName || !serviceHistoryForm.description || !serviceHistoryForm.mechanicName) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newRecord: ServiceHistory = {
      id: generateId(),
      customerId: serviceHistoryForm.customerId,
      customerName: serviceHistoryForm.customerName,
      vehicleInfo: serviceHistoryForm.vehicleInfo,
      date: serviceHistoryForm.date || new Date().toISOString().split('T')[0],
      description: serviceHistoryForm.description,
      partsUsed: serviceHistoryForm.partsUsed,
      mechanicName: serviceHistoryForm.mechanicName,
      cost: serviceHistoryForm.cost,
      mileage: serviceHistoryForm.mileage,
      notes: serviceHistoryForm.notes,
      createdAt: new Date().toISOString()
    };
    
    setServiceHistory(prev => [...prev, newRecord]);
    resetServiceHistoryForm();
    setShowModal(false);
    setSuccess('Service record created successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const updateServiceRecord = () => {
    if (!selectedServiceRecord) return;
    
    const updatedRecord: ServiceHistory = {
      ...selectedServiceRecord,
      customerName: serviceHistoryForm.customerName,
      vehicleInfo: serviceHistoryForm.vehicleInfo,
      date: serviceHistoryForm.date,
      description: serviceHistoryForm.description,
      partsUsed: serviceHistoryForm.partsUsed,
      mechanicName: serviceHistoryForm.mechanicName,
      cost: serviceHistoryForm.cost,
      mileage: serviceHistoryForm.mileage,
      notes: serviceHistoryForm.notes
    };
    
    setServiceHistory(prev => prev.map(s => s.id === selectedServiceRecord.id ? updatedRecord : s));
    resetServiceHistoryForm();
    setSelectedServiceRecord(null);
    setShowModal(false);
    setSuccess('Service record updated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const deleteServiceRecord = (recordId: string) => {
    setServiceHistory(prev => prev.filter(s => s.id !== recordId));
    setSuccess('Service record deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const createInventoryItem = () => {
    if (!inventoryForm.name || !inventoryForm.category) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newItem: InventoryItem = {
      id: generateId(),
      name: inventoryForm.name,
      description: inventoryForm.description,
      category: inventoryForm.category,
      quantity: inventoryForm.quantity,
      reorderPoint: inventoryForm.reorderPoint,
      cost: inventoryForm.cost,
      supplier: inventoryForm.supplier,
      location: inventoryForm.location,
      lastUpdated: new Date().toISOString()
    };
    
    setInventory(prev => [...prev, newItem]);
    resetInventoryForm();
    setShowModal(false);
    setSuccess('Inventory item created successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const updateInventoryItem = () => {
    if (!selectedInventoryItem) return;
    
    const updatedItem: InventoryItem = {
      ...selectedInventoryItem,
      name: inventoryForm.name,
      description: inventoryForm.description,
      category: inventoryForm.category,
      quantity: inventoryForm.quantity,
      reorderPoint: inventoryForm.reorderPoint,
      cost: inventoryForm.cost,
      supplier: inventoryForm.supplier,
      location: inventoryForm.location,
      lastUpdated: new Date().toISOString()
    };
    
    setInventory(prev => prev.map(i => i.id === selectedInventoryItem.id ? updatedItem : i));
    resetInventoryForm();
    setSelectedInventoryItem(null);
    setShowModal(false);
    setSuccess('Inventory item updated successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const deleteInventoryItem = (itemId: string) => {
    setInventory(prev => prev.filter(i => i.id !== itemId));
    setSuccess('Inventory item deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const adjustInventoryQuantity = (itemId: string, adjustment: number) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, quantity: Math.max(0, item.quantity + adjustment), lastUpdated: new Date().toISOString() }
        : item
    ));
  };

  const createDamageAssessment = () => {
    if (!damageAssessmentForm.customerName || !damageAssessmentForm.vehicleInfo || !damageAssessmentForm.damageDescription) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newAssessment: DamageAssessment = {
      id: generateId(),
      customerId: damageAssessmentForm.customerId,
      customerName: damageAssessmentForm.customerName,
      vehicleInfo: damageAssessmentForm.vehicleInfo,
      date: new Date().toISOString().split('T')[0],
      damageDescription: damageAssessmentForm.damageDescription,
      repairRecommendations: damageAssessmentForm.repairRecommendations,
      estimatedCost: damageAssessmentForm.estimatedCost,
      priority: damageAssessmentForm.priority,
      createdAt: new Date().toISOString()
    };
    
    setDamageAssessments(prev => [...prev, newAssessment]);
    resetDamageAssessmentForm();
    setShowModal(false);
    setSuccess('Damage assessment created successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const updateDamageAssessment = (assessmentId: string, recommendations: string[], estimatedCost: number) => {
    setDamageAssessments(prev => prev.map(assessment => 
      assessment.id === assessmentId 
        ? { ...assessment, repairRecommendations: recommendations, estimatedCost }
        : assessment
    ));
  };

  const deleteDamageAssessment = (assessmentId: string) => {
    setDamageAssessments(prev => prev.filter(a => a.id !== assessmentId));
    setSuccess('Damage assessment deleted successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const resetCustomerForm = () => {
    setCustomerForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      vehicleInfo: ''
    });
  };
  
  const resetAppointmentForm = () => {
    setAppointmentForm({
      customerId: '',
      customerName: '',
      serviceType: '',
      customService: '',
      date: '',
      time: '',
      notes: '',
      vehicleInfo: '',
      estimatedCost: 0,
      userId: ''
    });
    setUserIdLookup('');
    setFoundCustomer(null);
  };
  
  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      description: '',
      estimatedDuration: 0,
      estimatedCost: 0,
      category: ''
    });
  };

  const resetServiceHistoryForm = () => {
    setServiceHistoryForm({
      customerId: '',
      customerName: '',
      vehicleInfo: '',
      date: '',
      description: '',
      partsUsed: [],
      mechanicName: '',
      cost: 0,
      mileage: 0,
      notes: ''
    });
  };

  const resetInventoryForm = () => {
    setInventoryForm({
      name: '',
      description: '',
      category: '',
      quantity: 0,
      reorderPoint: 0,
      cost: 0,
      supplier: '',
      location: ''
    });
  };

  const resetDamageAssessmentForm = () => {
    setDamageAssessmentForm({
      customerId: '',
      customerName: '',
      vehicleInfo: '',
      damageDescription: '',
      priority: 'medium',
      estimatedCost: 0,
      repairRecommendations: []
    });
  };
  
  const openModal = (type: string, item?: any) => {
    setModalType(type);
    setShowModal(true);
    
    if (type === 'edit-customer' && item) {
      setSelectedCustomer(item);
      setCustomerForm({
        firstName: item.firstName,
        lastName: item.lastName,
        email: item.email,
        phone: item.phone,
        address: item.address,
        vehicleInfo: item.vehicleInfo
      });
    }
    
    if (type === 'edit-appointment' && item) {
      setSelectedAppointment(item);
      setAppointmentForm({
        customerId: item.customerId,
        customerName: item.customerName,
        serviceType: item.serviceType,
        customService: item.customService || '',
        date: item.date,
        time: item.time,
        notes: item.notes,
        vehicleInfo: item.vehicleInfo,
        estimatedCost: item.estimatedCost,
        userId: ''
      });
    }

    if (type === 'edit-service-record' && item) {
      setSelectedServiceRecord(item);
      setServiceHistoryForm({
        customerId: item.customerId,
        customerName: item.customerName,
        vehicleInfo: item.vehicleInfo,
        date: item.date,
        description: item.description,
        partsUsed: item.partsUsed,
        mechanicName: item.mechanicName,
        cost: item.cost,
        mileage: item.mileage || 0,
        notes: item.notes
      });
    }

    if (type === 'edit-inventory' && item) {
      setSelectedInventoryItem(item);
      setInventoryForm({
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        reorderPoint: item.reorderPoint,
        cost: item.cost,
        supplier: item.supplier,
        location: item.location
      });
    }

    if (type === 'view-damage-assessment' && item) {
      setSelectedDamageAssessment(item);
    }

    if (type === 'ai-damage-assessment') {
      resetDamageAssessmentForm();
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedCustomer(null);
    setSelectedAppointment(null);
    setSelectedServiceRecord(null);
    setSelectedInventoryItem(null);
    setSelectedDamageAssessment(null);
    resetCustomerForm();
    resetAppointmentForm();
    resetServiceForm();
    resetServiceHistoryForm();
    resetInventoryForm();
    resetDamageAssessmentForm();
    setError(null);
    setSelectedFile(null);
    setAiResult(null);
    setAiError(null);
  };
  
  const closeScannerModal = () => {
    setScannerActive(false);
    setScannedData('');
    setCameraError(null);
    setIsScanning(false);
    setCameraPermission('prompt');
  };
  
  const handleAIAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    try {
      const fullPrompt = `As a mechanic shop assistant, ${aiPrompt}. Please provide practical, actionable advice for automotive service and repair.`;
      aiLayerRef.current?.sendToAI(fullPrompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const handleDamageAssessmentAI = () => {
    if (!selectedFile) {
      setAiError('Please select an image of the vehicle damage');
      return;
    }

    setAiResult(null);
    setAiError(null);

    const prompt = `Analyze this vehicle damage image and provide detailed assessment information. Return the response in this exact JSON format:
{
  "damage_description": "detailed description of visible damage",
  "repair_recommendations": ["specific repair 1", "specific repair 2", "specific repair 3"],
  "estimated_cost": 1500,
  "priority": "medium",
  "safety_concerns": ["safety concern 1", "safety concern 2"],
  "parts_needed": ["part 1", "part 2", "part 3"]
}

Please ensure the JSON is valid and follows this exact structure.`;

    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile);
    } catch (error) {
      setAiError('Failed to analyze damage. Please try again.');
    }
  };

  const processDamageAssessmentResult = (result: string) => {
    try {
      const parsedResult = JSON.parse(result);
      
      // Auto-populate the form fields
      setDamageAssessmentForm(prev => ({
        ...prev,
        damageDescription: parsedResult.damage_description || '',
        repairRecommendations: parsedResult.repair_recommendations || [],
        estimatedCost: parsedResult.estimated_cost || 0,
        priority: parsedResult.priority || 'medium'
      }));
      
      setSuccess('AI analysis complete! Form fields have been auto-populated. You can review and edit before saving.');
      setTimeout(() => setSuccess(null), 5000);
      
    } catch (error) {
      // If JSON parsing fails, treat as plain text and extract what we can
      const lines = result.split('\n').filter(line => line.trim().length > 0);
      setDamageAssessmentForm(prev => ({
        ...prev,
        damageDescription: lines.length > 0 ? lines[0] : result.substring(0, 200),
        repairRecommendations: lines.slice(1) || [result]
      }));
      
      setSuccess('AI analysis complete! Please review the auto-populated fields before saving.');
      setTimeout(() => setSuccess(null), 5000);
    }
  };
  
  const handleServiceRecommendation = (vehicleInfo: string, symptoms: string) => {
    const prompt = `Based on vehicle information: "${vehicleInfo}" and symptoms: "${symptoms}", recommend appropriate automotive services. Return as JSON with keys: "recommended_services", "estimated_costs", "urgency_level", "explanation".`;
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to get service recommendations');
    }
  };
  
  const handleQRScan = (qrData: string) => {
    setScannedData(qrData);
    setIsScanning(false);
    
    const customer = customers.find(c => c.qrCode === qrData);
    if (customer) {
      setAppointmentForm(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        vehicleInfo: customer.vehicleInfo
      }));
      setSuccess(`Customer ${customer.firstName} ${customer.lastName} loaded from QR code!`);
      setTimeout(() => setSuccess(null), 3000);
      closeScannerModal();
    } else {
      setError('Customer not found for this QR code');
      setTimeout(() => setError(null), 3000);
    }
  };
  
  const takePhoto = () => {
    if (cameraRef.current) {
      try {
        setIsScanning(true);
        const imageSrc = cameraRef.current.takePhoto();
        
        setTimeout(() => {
          const mockQRData = 'MECHANIC_CUSTOMER_1_1735776000000';
          handleQRScan(mockQRData);
        }, 1000);
        
      } catch (error) {
        setIsScanning(false);
        setCameraError('Failed to capture image. Please try again.');
      }
    }
  };
  
  const switchCamera = () => {
    if (cameraRef.current && numberOfCameras > 1) {
      try {
        const newCamera = cameraRef.current.switchCamera();
        setCurrentCamera(newCamera);
      } catch (error) {
        setCameraError('Failed to switch camera.');
      }
    }
  };
  
  const calculateAnalytics = (): Analytics => {
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.actualCost || a.estimatedCost), 0);
    const avgAppointmentValue = completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0;
    const completionRate = appointments.length > 0 ? (completedAppointments.length / appointments.length) * 100 : 0;
    
    const serviceCounts: { [key: string]: number } = {};
    appointments.forEach(a => {
      serviceCounts[a.serviceType] = (serviceCounts[a.serviceType] || 0) + 1;
    });
    const popularServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const monthRevenue = completedAppointments
        .filter(a => {
          const appointmentDate = new Date(a.date);
          return appointmentDate.getMonth() === date.getMonth() && 
                 appointmentDate.getFullYear() === date.getFullYear();
        })
        .reduce((sum, a) => sum + (a.actualCost || a.estimatedCost), 0);
      monthlyRevenue.push({ month: monthYear, revenue: monthRevenue });
    }
    
    return {
      totalCustomers: customers.length,
      totalAppointments: appointments.length,
      totalRevenue,
      avgAppointmentValue,
      completionRate,
      popularServices,
      monthlyRevenue,
      customerSatisfaction: 4.8
    };
  };

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= item.reorderPoint);
  };

  const getTotalLowStockCount = () => {
    return getLowStockItems().length;
  };
  
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      setError('No data to export');
      return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setSuccess(`${filename} exported successfully!`);
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const clearAllData = () => {
    setCustomers([]);
    setAppointments([]);
    setServiceHistory([]);
    setInventory([]);
    setDamageAssessments([]);
    setReminders([]);
    localStorage.removeItem('mechanic_customers');
    localStorage.removeItem('mechanic_appointments');
    localStorage.removeItem('mechanic_service_history');
    localStorage.removeItem('mechanic_inventory');
    localStorage.removeItem('mechanic_damage_assessments');
    localStorage.removeItem('mechanic_reminders');
    setSuccess('All data cleared successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      const matchesSearch = appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           appointment.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || appointment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  };
  
  const getFilteredCustomers = () => {
    return customers.filter(customer => {
      const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) ||
             customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             customer.phone.includes(searchTerm) ||
             customer.userId.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  const getFilteredServiceHistory = () => {
    return serviceHistory.filter(record => {
      const matchesSearch = record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.mechanicName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  const getFilteredInventory = () => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getFilteredDamageAssessments = () => {
    return damageAssessments.filter(assessment => {
      const matchesSearch = assessment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assessment.vehicleInfo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assessment.damageDescription.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterStatus === 'all' || assessment.priority === filterStatus;
      return matchesSearch && matchesPriority;
    });
  };
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (scannerActive) {
          closeScannerModal();
        } else if (showModal) {
          closeModal();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [scannerActive, showModal]);
  
  const analytics = calculateAnalytics();
  const lowStockCount = getTotalLowStockCount();
  
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Car className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Loading...</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Please wait while we load your mechanic shop management system.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div id="welcome_fallback" className={`min-h-screen ${darkMode ? 'dark' : ''} ${(showModal || scannerActive) ? styles.bodyModalOpen : ''}`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => {
          setAiResult(result);
          if (modalType === 'ai-damage-assessment') {
            processDamageAssessmentResult(result);
          }
        }}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      <div className="bg-white dark:bg-gray-900 min-h-screen theme-transition">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b theme-transition">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">AutoService Pro</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Professional Mechanic Management</p>
                  </div>
                </div>
                
                <div className="hidden sm:flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('customer')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'customer'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <User className="h-4 w-4 inline mr-1" />
                    Customer View
                  </button>
                  <button
                    onClick={() => setViewMode('manager')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'manager'
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Building className="h-4 w-4 inline mr-1" />
                    Manager View
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {viewMode === 'manager' && lowStockCount > 0 && (
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setFilterCategory('all');
                      setSearchTerm('');
                    }}
                    className="relative p-2 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                    title={`${lowStockCount} items low in stock`}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {lowStockCount}
                    </span>
                  </button>
                )}

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.first_name} {currentUser.last_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <div className="sm:hidden bg-gray-50 dark:bg-gray-800 border-b">
          <div className="px-4 py-2">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('customer')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'customer'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <User className="h-4 w-4 inline mr-1" />
                Customer
              </button>
              <button
                onClick={() => setViewMode('manager')}
                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'manager'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
                    : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                <Building className="h-4 w-4 inline mr-1" />
                Manager
              </button>
            </div>
          </div>
        </div>
        
        {viewMode === 'manager' && lowStockCount > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mr-2" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} need reordering
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('inventory');
                    setFilterCategory('all');
                    setSearchTerm('');
                  }}
                  className="text-sm text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 font-medium"
                >
                  View Inventory →
                </button>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 px-4 py-3 mx-4 mt-4 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <p className="ml-3 text-sm text-green-800 dark:text-green-200">{success}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 mx-4 mt-4 rounded-md">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {viewMode === 'customer' ? (
            <div className="space-y-8">
              <div id="generation_issue_fallback" className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome to AutoService Pro</h2>
                <p className="text-blue-100 mb-4">Schedule your vehicle maintenance and repairs with ease</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <button
                    onClick={() => scrollToSection('book-appointment')}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Easy Scheduling</h3>
                    <p className="text-sm text-blue-100">Book appointments anytime</p>
                    <ArrowDown className="h-4 w-4 mx-auto mt-2 animate-bounce" />
                  </button>
                  <button
                    onClick={() => scrollToSection('customer-registration')}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <Bell className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Automated Reminders</h3>
                    <p className="text-sm text-blue-100">Never miss an appointment</p>
                    <ArrowDown className="h-4 w-4 mx-auto mt-2 animate-bounce" />
                  </button>
                  <button
                    onClick={() => scrollToSection('our-services')}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <QrCode className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">QR Code Access</h3>
                    <p className="text-sm text-blue-100">Quick check-in process</p>
                    <ArrowDown className="h-4 w-4 mx-auto mt-2 animate-bounce" />
                  </button>
                </div>
              </div>
              
              {/* Prominent User ID Display */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                <div className="text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md mx-auto">
                    <div className="flex items-center justify-center mb-4">
                      <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                        <Tag className="h-8 w-8 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your Customer ID System</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      When you register as a customer, you'll receive a unique 5-digit User ID for easy appointment booking.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Example User ID Format:</p>
                      <p className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">A1B2C</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div id="customer-registration" className={styles.sectionCard}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-600" />
                    New Customer Registration
                  </h3>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          placeholder="First name"
                          value={customerForm.firstName}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          placeholder="Last name"
                          value={customerForm.lastName}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={styles.inputSpaced}
                        placeholder="your.email@example.com"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className={styles.inputSpaced}
                        placeholder="(555) 123-4567"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Your address"
                        value={customerForm.address}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Vehicle Information</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Year, Make, Model"
                        value={customerForm.vehicleInfo}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      />
                    </div>
                    
                    <button
                      onClick={createCustomer}
                      disabled={isLoading}
                      className="btn btn-secondary w-full flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className={styles.spinner} />
                      ) : (
                        <>
                          <User className="h-4 w-4 mr-2" />
                          Register as Customer
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div id="book-appointment" className={styles.sectionCard}>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Book an Appointment
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="form-label">User ID (if registered)</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Enter your 5-digit User ID (e.g., A1B2C)"
                        maxLength={5}
                        value={userIdLookup}
                        onChange={(e) => setUserIdLookup(e.target.value.toUpperCase())}
                      />
                      {foundCustomer && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                          <p className="text-sm text-green-800 dark:text-green-200 flex items-center">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Welcome back, {foundCustomer.firstName} {foundCustomer.lastName}!
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label">Your Name *</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Enter your full name"
                        value={appointmentForm.customerName}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, customerName: e.target.value }))}
                        disabled={!!foundCustomer}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Service Type *</label>
                      <select
                        className={styles.inputSpaced}
                        value={appointmentForm.serviceType}
                        onChange={(e) => {
                          setAppointmentForm(prev => ({ ...prev, serviceType: e.target.value }));
                          const service = serviceTypes.find(s => s.name === e.target.value);
                          if (service) {
                            setAppointmentForm(prev => ({ ...prev, estimatedCost: service.estimatedCost }));
                          }
                        }}
                      >
                        <option value="">Select a service</option>
                        {serviceTypes.map(service => (
                          <option key={service.id} value={service.name}>
                            {service.name} - ${service.estimatedCost}
                          </option>
                        ))}
                        <option value="Other">Other (Custom Service)</option>
                      </select>
                    </div>
                    
                    {appointmentForm.serviceType === 'Other' && (
                      <div>
                        <label className="form-label">Custom Service Description *</label>
                        <textarea
                          className={styles.inputSpaced}
                          rows={3}
                          placeholder="Describe the service you need"
                          value={appointmentForm.customService}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, customService: e.target.value }))}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Date *</label>
                        <input
                          type="date"
                          className={styles.inputSpaced}
                          min={new Date().toISOString().split('T')[0]}
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Time *</label>
                        <select
                          className={styles.inputSpaced}
                          value={appointmentForm.time}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                        >
                          <option value="">Select time</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Vehicle Information</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Year, Make, Model (e.g., 2020 Honda Civic)"
                        value={appointmentForm.vehicleInfo}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                        disabled={!!foundCustomer}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Additional Notes</label>
                      <textarea
                        className={styles.inputSpaced}
                        rows={3}
                        placeholder="Any additional information about your vehicle or service needs"
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    
                    {appointmentForm.estimatedCost > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md">
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          <DollarSign className="h-4 w-4 inline mr-1" />
                          Estimated Cost: ${appointmentForm.estimatedCost}
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={createAppointment}
                      disabled={isLoading}
                      className="btn btn-primary w-full flex items-center justify-center"
                    >
                      {isLoading ? (
                        <div className={styles.spinner} />
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="our-services" className={styles.sectionCard}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-600" />
                  Our Services
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {serviceTypes.map(service => (
                    <div key={service.id} className={styles.serviceCard}>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{service.description}</p>
                      <div className="mt-3 flex justify-between text-sm">
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          ${service.estimatedCost}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          ~{service.estimatedDuration} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <nav className="space-y-2">
                    <button
                      id="dashboard-tab"
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'dashboard'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <BarChart3 className="h-4 w-4 mr-3" />
                      Dashboard
                    </button>
                    <button
                      id="damage-assessment-tab"
                      onClick={() => setActiveTab('damage-assessment')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'damage-assessment'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <FileImage className="h-4 w-4 mr-3" />
                      AI Damage Assessment
                    </button>
                    <button
                      id="appointments-tab"
                      onClick={() => setActiveTab('appointments')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'appointments'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-3" />
                      Appointments
                    </button>
                    <button
                      id="customers-tab"
                      onClick={() => setActiveTab('customers')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'customers'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Users className="h-4 w-4 mr-3" />
                      Customers
                    </button>
                    <button
                      id="services-tab"
                      onClick={() => setActiveTab('services')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'services'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Package className="h-4 w-4 mr-3" />
                      Services
                    </button>
                    <button
                      id="history-tab"
                      onClick={() => setActiveTab('history')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'history'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <History className="h-4 w-4 mr-3" />
                      Service History
                    </button>
                    <button
                      id="inventory-tab"
                      onClick={() => setActiveTab('inventory')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'inventory'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-3" />
                      Inventory
                      {lowStockCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {lowStockCount}
                        </span>
                      )}
                    </button>
                    <button
                      id="analytics-tab"
                      onClick={() => setActiveTab('analytics')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'analytics'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mr-3" />
                      Analytics
                    </button>
                    <button
                      id="settings-tab"
                      onClick={() => setActiveTab('settings')}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'settings'
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Settings
                    </button>
                  </nav>
                </div>
              </div>
              
              <div className="flex-1">
                {activeTab === 'dashboard' && (
                  <div id="manager-dashboard" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="stat-card bg-blue-50 dark:bg-blue-900/20">
                        <div className="stat-title text-blue-600 dark:text-blue-400">Total Customers</div>
                        <div className="stat-value text-blue-700 dark:text-blue-300">{analytics.totalCustomers}</div>
                        <div className="stat-desc text-blue-500">Registered customers</div>
                      </div>
                      <div className="stat-card bg-green-50 dark:bg-green-900/20">
                        <div className="stat-title text-green-600 dark:text-green-400">Total Appointments</div>
                        <div className="stat-value text-green-700 dark:text-green-300">{analytics.totalAppointments}</div>
                        <div className="stat-desc text-green-500">All time bookings</div>
                      </div>
                      <div className="stat-card bg-yellow-50 dark:bg-yellow-900/20">
                        <div className="stat-title text-yellow-600 dark:text-yellow-400">Total Revenue</div>
                        <div className="stat-value text-yellow-700 dark:text-yellow-300">${analytics.totalRevenue.toFixed(2)}</div>
                        <div className="stat-desc text-yellow-500">Completed services</div>
                      </div>
                      <div className="stat-card bg-purple-50 dark:bg-purple-900/20">
                        <div className="stat-title text-purple-600 dark:text-purple-400">Service Records</div>
                        <div className="stat-value text-purple-700 dark:text-purple-300">{serviceHistory.length}</div>
                        <div className="stat-desc text-purple-500">Documented services</div>
                      </div>
                    </div>

                    {lowStockCount > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mr-3" />
                            <div>
                              <h3 className="font-semibold text-amber-800 dark:text-amber-200">Low Stock Alert</h3>
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} need reordering
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('inventory')}
                            className="btn bg-amber-600 text-white hover:bg-amber-700"
                          >
                            View Inventory
                          </button>
                        </div>
                        <div className="mt-3 space-y-1">
                          {getLowStockItems().slice(0, 3).map(item => (
                            <div key={item.id} className="text-sm text-amber-700 dark:text-amber-300">
                              • {item.name}: {item.quantity} left (reorder at {item.reorderPoint})
                            </div>
                          ))}
                          {lowStockCount > 3 && (
                            <div className="text-sm text-amber-600 dark:text-amber-400">
                              ... and {lowStockCount - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="card">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Appointments</h3>
                        <button
                          onClick={() => setActiveTab('appointments')}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View All
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {appointments.slice(0, 5).map(appointment => (
                          <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{appointment.customerName}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.serviceType}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{appointment.date} at {appointment.time}</p>
                            </div>
                            <div className="text-right">
                              <span className={`badge ${
                                appointment.status === 'completed' ? 'badge-success' :
                                appointment.status === 'confirmed' ? 'badge-info' :
                                appointment.status === 'cancelled' ? 'badge-error' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {appointment.status}
                              </span>
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                ${appointment.actualCost || appointment.estimatedCost}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={() => openModal('ai-damage-assessment')}
                        className="card hover:shadow-lg transition-shadow cursor-pointer text-left bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-orange-900 dark:text-orange-100">AI Damage Assessment</h4>
                            <p className="text-sm text-orange-700 dark:text-orange-300">Smart damage analysis</p>
                          </div>
                          <FileImage className="h-8 w-8 text-orange-600" />
                        </div>
                      </button>
                      
                      <button
                        onClick={() => openModal('new-appointment')}
                        className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">New Appointment</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Schedule a new service</p>
                          </div>
                          <Plus className="h-8 w-8 text-blue-600" />
                        </div>
                      </button>
                      
                      <button
                        onClick={() => openModal('new-customer')}
                        className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">New Customer</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Register new customer</p>
                          </div>
                          <User className="h-8 w-8 text-green-600" />
                        </div>
                      </button>
                      
                      <button
                        onClick={() => {
                          setScannerActive(true);
                        }}
                        className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">QR Scanner</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Scan customer QR code</p>
                          </div>
                          <Scan className="h-8 w-8 text-purple-600" />
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'damage-assessment' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">AI Damage Assessment</h2>
                      <button
                        onClick={() => openModal('ai-damage-assessment')}
                        className="btn btn-primary flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New AI Assessment
                      </button>
                    </div>
                    
                    <div className="card">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search assessments..."
                              className="input pl-10"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="sm:w-48">
                          <select
                            className="input"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Priorities</option>
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {getFilteredDamageAssessments().map(assessment => (
                        <div key={assessment.id} className="card hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                assessment.priority === 'high' ? 'bg-red-100 dark:bg-red-900' :
                                assessment.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900' :
                                'bg-green-100 dark:bg-green-900'
                              }`}>
                                <FileImage className={`h-6 w-6 ${
                                  assessment.priority === 'high' ? 'text-red-600 dark:text-red-400' :
                                  assessment.priority === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                  'text-green-600 dark:text-green-400'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{assessment.customerName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{assessment.vehicleInfo}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{assessment.date}</p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => openModal('view-damage-assessment', assessment)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteDamageAssessment(assessment.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Damage Description</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{assessment.damageDescription}</p>
                            </div>
                            
                            {assessment.repairRecommendations.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">AI Recommendations</h4>
                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                  {assessment.repairRecommendations.slice(0, 3).map((recommendation, index) => (
                                    <li key={index} className="flex items-start">
                                      <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                                      {recommendation}
                                    </li>
                                  ))}
                                  {assessment.repairRecommendations.length > 3 && (
                                    <li className="text-gray-500 dark:text-gray-400 text-xs">
                                      +{assessment.repairRecommendations.length - 3} more recommendations
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                            
                            <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-600">
                              <div>
                                <span className={`badge ${
                                  assessment.priority === 'high' ? 'badge-error' :
                                  assessment.priority === 'medium' ? 'badge-warning' :
                                  'badge-success'
                                }`}>
                                  {assessment.priority} priority
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Estimated Cost</span>
                                <p className="font-medium text-green-600 dark:text-green-400">
                                  {assessment.estimatedCost > 0 ? `$${assessment.estimatedCost}` : 'Pending'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'appointments' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            setScannerActive(true);
                          }}
                          className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center"
                        >
                          <Scan className="h-4 w-4 mr-2" />
                          QR Scanner
                        </button>
                        <button
                          onClick={() => openModal('new-appointment')}
                          className="btn btn-primary flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          New Appointment
                        </button>
                      </div>
                    </div>
                    
                    <div className="card">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search appointments..."
                              className="input pl-10"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="sm:w-48">
                          <select
                            className="input"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card">
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th className="table-header">Customer</th>
                              <th className="table-header">Service</th>
                              <th className="table-header">Date & Time</th>
                              <th className="table-header">Status</th>
                              <th className="table-header">Cost</th>
                              <th className="table-header">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                            {getFilteredAppointments().map(appointment => (
                              <tr key={appointment.id}>
                                <td className="table-cell">
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{appointment.customerName}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.vehicleInfo}</p>
                                  </div>
                                </td>
                                <td className="table-cell">
                                  <div>
                                    <p className="font-medium">{appointment.serviceType}</p>
                                    {appointment.customService && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.customService}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="table-cell">
                                  <div>
                                    <p className="font-medium">{appointment.date}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{appointment.time}</p>
                                  </div>
                                </td>
                                <td className="table-cell">
                                  <select
                                    value={appointment.status}
                                    onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value as Appointment['status'])}
                                    className={`text-xs font-medium rounded-full px-2 py-1 border-0 ${
                                      appointment.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="table-cell">
                                  <div>
                                    <p className="font-medium">${appointment.actualCost || appointment.estimatedCost}</p>
                                    {appointment.actualCost && appointment.actualCost !== appointment.estimatedCost && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400">Est: ${appointment.estimatedCost}</p>
                                    )}
                                  </div>
                                </td>
                                <td className="table-cell">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => openModal('edit-appointment', appointment)}
                                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteAppointment(appointment.id)}
                                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
                )}
                
                {activeTab === 'customers' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
                      <button
                        onClick={() => openModal('new-customer')}
                        className="btn btn-primary flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Customer
                      </button>
                    </div>
                    
                    <div className="card">
                      <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search customers by name, email, phone, or User ID..."
                          className="input pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredCustomers().map(customer => (
                        <div key={customer.id} className="card hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {customer.firstName} {customer.lastName}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded mt-1">
                                  ID: {customer.userId}
                                </p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => openModal('edit-customer', customer)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteCustomer(customer.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                              <Phone className="h-4 w-4 mr-2" />
                              {customer.phone}
                            </div>
                            {customer.address && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <MapPin className="h-4 w-4 mr-2" />
                                {customer.address}
                              </div>
                            )}
                            {customer.vehicleInfo && (
                              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <Car className="h-4 w-4 mr-2" />
                                {customer.vehicleInfo}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Total Appointments</span>
                              <span className="font-medium text-gray-900 dark:text-white">{customer.totalAppointments}</span>
                            </div>
                            {customer.lastVisit && (
                              <div className="flex justify-between text-sm mt-1">
                                <span className="text-gray-500 dark:text-gray-400">Last Visit</span>
                                <span className="font-medium text-gray-900 dark:text-white">{customer.lastVisit}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm mt-1">
                              <span className="text-gray-500 dark:text-gray-400">Service Records</span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {serviceHistory.filter(s => s.customerId === customer.id).length}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">QR Code</span>
                              <QrCode className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono break-all">
                              {customer.qrCode}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Types</h2>
                      <button
                        onClick={() => openModal('new-service')}
                        className="btn btn-primary flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Service
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {serviceTypes.map(service => (
                        <div key={service.id} className="card hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                                <Wrench className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                  {service.category}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => deleteService(service.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Estimated Cost</span>
                              <span className="font-medium text-green-600 dark:text-green-400">${service.estimatedCost}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500 dark:text-gray-400">Duration</span>
                              <span className="font-medium text-gray-900 dark:text-white">{service.estimatedDuration} min</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service History</h2>
                      <button
                        onClick={() => openModal('new-service-record')}
                        className="btn btn-primary flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        New Service Record
                      </button>
                    </div>
                    
                    <div className="card">
                      <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search service records..."
                          className="input pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {getFilteredServiceHistory().map(record => (
                        <div key={record.id} className="card hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
                                <History className="h-6 w-6 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{record.customerName}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{record.vehicleInfo}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{record.date}</p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => openModal('edit-service-record', record)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteServiceRecord(record.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white mb-1">Service Description</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{record.description}</p>
                            </div>
                            
                            {record.partsUsed.length > 0 && (
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Parts Used</h4>
                                <div className="flex flex-wrap gap-1">
                                  {record.partsUsed.map((part, index) => (
                                    <span key={index} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                      {part}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Mechanic</span>
                                <p className="font-medium text-gray-900 dark:text-white">{record.mechanicName}</p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Cost</span>
                                <p className="font-medium text-green-600 dark:text-green-400">${record.cost}</p>
                              </div>
                              {record.mileage && record.mileage > 0 && (
                                <div>
                                  <span className="text-gray-500 dark:text-gray-400">Mileage</span>
                                  <p className="font-medium text-gray-900 dark:text-white">{record.mileage.toLocaleString()} mi</p>
                                </div>
                              )}
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Date</span>
                                <p className="font-medium text-gray-900 dark:text-white">{record.date}</p>
                              </div>
                            </div>
                            
                            {record.notes && (
                              <div>
                                <h4 className="font-medium text-gray-900 dark:text-white mb-1">Notes</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">{record.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'inventory' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Parts Inventory</h2>
                      <button
                        onClick={() => openModal('new-inventory')}
                        className="btn btn-primary flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Part
                      </button>
                    </div>
                    
                    <div className="card">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search inventory..."
                              className="input pl-10"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="sm:w-48">
                          <select
                            className="input"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                          >
                            <option value="all">All Categories</option>
                            <option value="Filters">Filters</option>
                            <option value="Brakes">Brakes</option>
                            <option value="Fluids">Fluids</option>
                            <option value="Engine">Engine</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Suspension">Suspension</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {getFilteredInventory().map(item => (
                        <div key={item.id} className="card hover:shadow-lg transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${
                                item.quantity <= item.reorderPoint 
                                  ? 'bg-red-100 dark:bg-red-900' 
                                  : 'bg-blue-100 dark:bg-blue-900'
                              }`}>
                                <Package className={`h-6 w-6 ${
                                  item.quantity <= item.reorderPoint 
                                    ? 'text-red-600 dark:text-red-400' 
                                    : 'text-blue-600 dark:text-blue-400'
                                }`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                                <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                  {item.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => openModal('edit-inventory', item)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteInventoryItem(item.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{item.description}</p>
                          
                          <div className={`p-3 rounded-lg mb-4 ${
                            item.quantity <= item.reorderPoint 
                              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
                              : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          }`}>
                            <div className="flex justify-between items-center">
                              <span className={`font-medium ${
                                item.quantity <= item.reorderPoint 
                                  ? 'text-red-800 dark:text-red-200' 
                                  : 'text-green-800 dark:text-green-200'
                              }`}>
                                In Stock: {item.quantity}
                              </span>
                              {item.quantity <= item.reorderPoint && (
                                <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded">
                                  REORDER
                                </span>
                              )}
                            </div>
                            <p className={`text-sm mt-1 ${
                              item.quantity <= item.reorderPoint 
                                ? 'text-red-600 dark:text-red-300' 
                                : 'text-green-600 dark:text-green-300'
                            }`}>
                              Reorder Point: {item.reorderPoint}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Adjust Quantity</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => adjustInventoryQuantity(item.id, -1)}
                                className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 p-1"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => adjustInventoryQuantity(item.id, 1)}
                                className="btn btn-sm bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:hover:bg-green-800 p-1"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Cost</span>
                              <span className="font-medium text-gray-900 dark:text-white">${item.cost}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Supplier</span>
                              <span className="font-medium text-gray-900 dark:text-white">{item.supplier}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500 dark:text-gray-400">Location</span>
                              <span className="font-medium text-gray-900 dark:text-white">{item.location}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="stat-card">
                        <div className="stat-title">Average Service Value</div>
                        <div className="stat-value">${analytics.avgAppointmentValue.toFixed(2)}</div>
                        <div className="stat-desc">Per completed appointment</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Customer Satisfaction</div>
                        <div className="stat-value">{analytics.customerSatisfaction}/5.0</div>
                        <div className="stat-desc">Average rating</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Completion Rate</div>
                        <div className="stat-value">{analytics.completionRate.toFixed(1)}%</div>
                        <div className="stat-desc">Appointments completed</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-title">Inventory Value</div>
                        <div className="stat-value">${inventory.reduce((sum, item) => sum + (item.quantity * item.cost), 0).toFixed(2)}</div>
                        <div className="stat-desc">Total parts value</div>
                      </div>
                    </div>
                    
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Services</h3>
                      <div className="space-y-3">
                        {analytics.popularServices.map((service, index) => (
                          <div key={service.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-4">{index + 1}.</span>
                              <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${(service.count / Math.max(...analytics.popularServices.map(s => s.count))) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{service.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                          onClick={() => exportToCSV(customers, 'customers')}
                          className="btn bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Customers
                        </button>
                        <button
                          onClick={() => exportToCSV(appointments, 'appointments')}
                          className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Appointments
                        </button>
                        <button
                          onClick={() => exportToCSV(serviceHistory, 'service_history')}
                          className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Service History
                        </button>
                        <button
                          onClick={() => exportToCSV(inventory, 'inventory')}
                          className="btn bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Inventory
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                        AI Service Assistant
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="form-label">Ask AI for service recommendations or automotive advice</label>
                          <textarea
                            className="input"
                            rows={3}
                            placeholder="e.g., 'Customer has a 2018 Honda Civic with squeaking brakes and vibration when stopping. What services should I recommend?'"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <label className="form-label">Upload Image (optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="input"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        
                        <button
                          onClick={handleAIAnalysis}
                          disabled={aiLoading}
                          className="btn btn-primary flex items-center"
                        >
                          {aiLoading ? (
                            <div className={styles.spinner} />
                          ) : (
                            <>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Get AI Recommendations
                            </>
                          )}
                        </button>
                        
                        {aiResult && (
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">AI Recommendations:</h4>
                            <div className="text-sm text-green-700 dark:text-green-300 whitespace-pre-wrap">{aiResult}</div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                              Note: AI recommendations are for guidance only. Please verify all suggestions before implementation.
                            </p>
                          </div>
                        )}
                        
                        {aiError && (
                          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Error:</h4>
                            <div className="text-sm text-red-700 dark:text-red-300">{aiError.toString()}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                            This action will permanently delete all customer data, appointments, service history, inventory, and settings. This cannot be undone.
                          </p>
                          {confirmClearAllData ? (
                            <div className="mt-2 p-3 border border-red-300 dark:border-red-700 rounded-md">
                              <p className="text-sm text-red-700 dark:text-red-200 mb-3">
                                Are you absolutely sure you want to delete all data? This action cannot be undone.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    clearAllData();
                                    setConfirmClearAllData(false);
                                  }}
                                  className="btn bg-red-700 text-white hover:bg-red-800 flex-1"
                                >
                                  Yes, Delete All Data
                                </button>
                                <button
                                  onClick={() => setConfirmClearAllData(false)}
                                  className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 flex-1"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmClearAllData(true)}
                              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear All Data
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Data</h3>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Import customer, appointment, and inventory data from CSV files. Make sure your CSV files have the correct headers.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="form-label">Import Customers</label>
                            <input
                              type="file"
                              accept=".csv"
                              className="input"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSuccess('CSV import feature ready for implementation');
                                  setTimeout(() => setSuccess(null), 3000);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="form-label">Import Inventory</label>
                            <input
                              type="file"
                              accept=".csv"
                              className="input"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSuccess('CSV import feature ready for implementation');
                                  setTimeout(() => setSuccess(null), 3000);
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        
        {scannerActive && (
          <div className="modal-backdrop" onClick={closeScannerModal}>
            <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <Scan className="h-5 w-5 mr-2 text-purple-600" />
                  QR Code Scanner
                </h3>
                <button
                  onClick={closeScannerModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                {cameraPermission === 'denied' ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
                    <XCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
                    <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Camera Access Denied</h4>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                      {cameraError}
                    </p>
                    <div className="text-sm text-red-600 dark:text-red-400 space-y-2">
                      <p><strong>To enable camera access:</strong></p>
                      <ul className="list-disc list-inside space-y-1 text-left">
                        <li>Click the camera icon in your browser's address bar</li>
                        <li>Select "Allow" for camera permissions</li>
                        <li>Refresh the page and try again</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => {
                        setCameraPermission('prompt');
                        setCameraError(null);
                        checkCameraPermissions();
                      }}
                      className="btn btn-primary mt-4 flex items-center mx-auto"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                ) : cameraPermission === 'granted' ? (
                  <div className="space-y-4">
                    <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '4/3' }}>
                      <Camera
                        ref={cameraRef}
                        aspectRatio="cover"
                        facingMode={currentCamera}
                        numberOfCamerasCallback={setNumberOfCameras}
                        errorMessages={{
                          noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
                          permissionDenied: 'Permission denied. Please refresh and give camera permission.',
                          switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
                          canvas: 'Canvas is not supported.'
                        }}
                      />
                      
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>
                        </div>
                      </div>
                      
                      {isScanning && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center space-x-3">
                            <div className={styles.spinner} />
                            <span className="text-gray-900 dark:text-white font-medium">Scanning QR Code...</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center space-y-3">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Position the QR code within the frame above
                      </p>
                      
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={takePhoto}
                          disabled={isScanning}
                          className="btn btn-primary flex items-center"
                        >
                          <CameraIcon className="h-4 w-4 mr-2" />
                          {isScanning ? 'Scanning...' : 'Scan QR Code'}
                        </button>
                        
                        {numberOfCameras > 1 && (
                          <button
                            onClick={switchCamera}
                            className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Switch Camera
                          </button>
                        )}
                      </div>
                      
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-200">
                          <strong>Note:</strong> This demo simulates QR scanning. In production, this would decode actual QR codes from the camera feed.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                    <div className={styles.spinner} />
                    <p className="text-gray-600 dark:text-gray-300 mt-4">Requesting camera access...</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Please allow camera permissions when prompted
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {showModal && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {modalType === 'new-customer' ? 'New Customer' :
                   modalType === 'edit-customer' ? 'Edit Customer' :
                   modalType === 'new-appointment' ? 'New Appointment' :
                   modalType === 'edit-appointment' ? 'Edit Appointment' :
                   modalType === 'new-service' ? 'New Service Type' :
                   modalType === 'new-service-record' ? 'New Service Record' :
                   modalType === 'edit-service-record' ? 'Edit Service Record' :
                   modalType === 'new-inventory' ? 'New Inventory Item' :
                   modalType === 'edit-inventory' ? 'Edit Inventory Item' :
                   modalType === 'ai-damage-assessment' ? 'AI Damage Assessment' :
                   modalType === 'view-damage-assessment' ? 'Damage Assessment Details' :
                   'Modal'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className={styles.modalContent}>
                {(modalType === 'new-customer' || modalType === 'edit-customer') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          value={customerForm.firstName}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          value={customerForm.lastName}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className={styles.inputSpaced}
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        className={styles.inputSpaced}
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        value={customerForm.address}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Vehicle Information</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Year, Make, Model"
                        value={customerForm.vehicleInfo}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                
                {(modalType === 'new-appointment' || modalType === 'edit-appointment') && (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Customer *</label>
                      <select
                        className={styles.inputSpaced}
                        value={appointmentForm.customerId}
                        onChange={(e) => {
                          const customer = customers.find(c => c.id === e.target.value);
                          setAppointmentForm(prev => ({
                            ...prev,
                            customerId: e.target.value,
                            customerName: customer ? `${customer.firstName} ${customer.lastName}` : '',
                            vehicleInfo: customer?.vehicleInfo || ''
                          }));
                        }}
                      >
                        <option value="">Select customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName} - {customer.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {!appointmentForm.customerId && (
                      <div>
                        <label className="form-label">Customer Name (Walk-in) *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          placeholder="Customer name for walk-in appointment"
                          value={appointmentForm.customerName}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, customerName: e.target.value }))}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="form-label">Service Type *</label>
                      <select
                        className={styles.inputSpaced}
                        value={appointmentForm.serviceType}
                        onChange={(e) => {
                          setAppointmentForm(prev => ({ ...prev, serviceType: e.target.value }));
                          const service = serviceTypes.find(s => s.name === e.target.value);
                          if (service) {
                            setAppointmentForm(prev => ({ ...prev, estimatedCost: service.estimatedCost }));
                          }
                        }}
                      >
                        <option value="">Select service</option>
                        {serviceTypes.map(service => (
                          <option key={service.id} value={service.name}>
                            {service.name} - ${service.estimatedCost}
                          </option>
                        ))}
                        <option value="Other">Other (Custom Service)</option>
                      </select>
                    </div>
                    
                    {appointmentForm.serviceType === 'Other' && (
                      <div>
                        <label className="form-label">Custom Service *</label>
                        <textarea
                          className={styles.inputSpaced}
                          rows={3}
                          value={appointmentForm.customService}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, customService: e.target.value }))}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Date *</label>
                        <input
                          type="date"
                          className={styles.inputSpaced}
                          min={new Date().toISOString().split('T')[0]}
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Time *</label>
                        <select
                          className={styles.inputSpaced}
                          value={appointmentForm.time}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, time: e.target.value }))}
                        >
                          <option value="">Select time</option>
                          <option value="08:00">8:00 AM</option>
                          <option value="09:00">9:00 AM</option>
                          <option value="10:00">10:00 AM</option>
                          <option value="11:00">11:00 AM</option>
                          <option value="13:00">1:00 PM</option>
                          <option value="14:00">2:00 PM</option>
                          <option value="15:00">3:00 PM</option>
                          <option value="16:00">4:00 PM</option>
                          <option value="17:00">5:00 PM</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Vehicle Information</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Year, Make, Model"
                        value={appointmentForm.vehicleInfo}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Estimated Cost ($)</label>
                      <input
                        type="number"
                        className={styles.inputSpaced}
                        min="0"
                        step="0.01"
                        value={appointmentForm.estimatedCost}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Notes</label>
                      <textarea
                        className={styles.inputSpaced}
                        rows={3}
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                
                {modalType === 'new-service' && (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Service Name *</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Description *</label>
                      <textarea
                        className={styles.inputSpaced}
                        rows={3}
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Category *</label>
                      <select
                        className={styles.inputSpaced}
                        value={serviceForm.category}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Repair">Repair</option>
                        <option value="Diagnostic">Diagnostic</option>
                        <option value="Safety">Safety</option>
                        <option value="Performance">Performance</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Estimated Duration (minutes)</label>
                        <input
                          type="number"
                          className={styles.inputSpaced}
                          min="0"
                          value={serviceForm.estimatedDuration}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Estimated Cost ($)</label>
                        <input
                          type="number"
                          className={styles.inputSpaced}
                          min="0"
                          step="0.01"
                          value={serviceForm.estimatedCost}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(modalType === 'new-service-record' || modalType === 'edit-service-record') && (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Customer *</label>
                      <select
                        className={styles.inputSpaced}
                        value={serviceHistoryForm.customerId}
                        onChange={(e) => {
                          const customer = customers.find(c => c.id === e.target.value);
                          setServiceHistoryForm(prev => ({
                            ...prev,
                            customerId: e.target.value,
                            customerName: customer ? `${customer.firstName} ${customer.lastName}` : '',
                            vehicleInfo: customer?.vehicleInfo || ''
                          }));
                        }}
                      >
                        <option value="">Select customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName} - {customer.vehicleInfo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!serviceHistoryForm.customerId && (
                      <div>
                        <label className="form-label">Customer Name (Walk-in) *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          value={serviceHistoryForm.customerName}
                          onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, customerName: e.target.value }))}
                        />
                      </div>
                    )}

                    <div>
                      <label className="form-label">Vehicle Information</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Year, Make, Model"
                        value={serviceHistoryForm.vehicleInfo}
                        onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Service Date *</label>
                        <input
                          type="date"
                          className={styles.inputSpaced}
                          value={serviceHistoryForm.date}
                          onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Mechanic Name *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          value={serviceHistoryForm.mechanicName}
                          onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, mechanicName: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Service Description *</label>
                      <textarea
                        className={styles.inputSpaced}
                        rows={3}
                        placeholder="Describe the work performed..."
                        value={serviceHistoryForm.description}
                        onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="form-label">Parts Used</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Enter part names separated by commas"
                        value={serviceHistoryForm.partsUsed.join(', ')}
                        onChange={(e) => setServiceHistoryForm(prev => ({ 
                          ...prev, 
                          partsUsed: e.target.value.split(',').map(part => part.trim()).filter(part => part.length > 0)
                        }))}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Total Cost ($) *</label>
                        <input
                          type="number"
                          className={styles.inputSpaced}
                          min="0"
                          step="0.01"
                          value={serviceHistoryForm.cost}
                          onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Vehicle Mileage</label>
                        <input
                          type="number"
                          className={styles.inputSpaced}
                          min="0"
                          value={serviceHistoryForm.mileage}
                          onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Additional Notes</label>
                      <textarea
                        className={styles.inputSpaced}
                        rows={3}
                        placeholder="Any additional notes or observations..."
                        value={serviceHistoryForm.notes}
                        onChange={(e) => setServiceHistoryForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {(modalType === 'new-inventory' || modalType === 'edit-inventory') && (
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Part Name *</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        value={inventoryForm.name}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        className={styles.inputSpaced}
                        rows={2}
                        value={inventoryForm.description}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="form-label">Category *</label>
                      <select
                        className={styles.inputSpaced}
                        value={inventoryForm.category}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="">Select category</option>
                        <option value="Filters">Filters</option>
                        <option value="Brakes">Brakes</option>
                        <option value="Fluids">Fluids</option>
                        <option value="Engine">Engine</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Tires">Tires</option>
                        <option value="Tools">Tools</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Quantity *</label>
                        <input
                          type="number"
                          className={styles.inputSpaced}
                          min="0"
                          value={inventoryForm.quantity}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Reorder Point *</label>
                        <input
                          type="number"
                          className={styles.inputSpaced}
                          min="0"
                          value={inventoryForm.reorderPoint}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">Cost per Unit ($)</label>
                        <input
                          type="number"
                          className={styles.inputSpaced}
                          min="0"
                          step="0.01"
                          value={inventoryForm.cost}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Storage Location</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          placeholder="e.g., Shelf A1, Storage Room"
                          value={inventoryForm.location}
                          onChange={(e) => setInventoryForm(prev => ({ ...prev, location: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Supplier</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        value={inventoryForm.supplier}
                        onChange={(e) => setInventoryForm(prev => ({ ...prev, supplier: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                {modalType === 'ai-damage-assessment' && (
                  <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
                        <FileImage className="h-5 w-5 mr-2" />
                        AI-Powered Damage Analysis
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="form-label">Upload Damage Photo *</label>
                          <input
                            type="file"
                            accept="image/*"
                            className={styles.inputSpaced}
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          />
                          <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                            Upload a clear photo of the vehicle damage for AI analysis
                          </p>
                        </div>
                        
                        <button
                          onClick={handleDamageAssessmentAI}
                          disabled={aiLoading || !selectedFile}
                          className="btn bg-orange-600 text-white hover:bg-orange-700 flex items-center w-full justify-center"
                        >
                          {aiLoading ? (
                            <div className={styles.spinner} />
                          ) : (
                            <>
                              <FileImage className="h-4 w-4 mr-2" />
                              Analyze Damage with AI
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="form-label">Customer</label>
                      <select
                        className={styles.inputSpaced}
                        value={damageAssessmentForm.customerId}
                        onChange={(e) => {
                          const customer = customers.find(c => c.id === e.target.value);
                          setDamageAssessmentForm(prev => ({
                            ...prev,
                            customerId: e.target.value,
                            customerName: customer ? `${customer.firstName} ${customer.lastName}` : '',
                            vehicleInfo: customer?.vehicleInfo || ''
                          }));
                        }}
                      >
                        <option value="">Select customer</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id}>
                            {customer.firstName} {customer.lastName} - {customer.vehicleInfo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {!damageAssessmentForm.customerId && (
                      <div>
                        <label className="form-label">Customer Name (Walk-in) *</label>
                        <input
                          type="text"
                          className={styles.inputSpaced}
                          value={damageAssessmentForm.customerName}
                          onChange={(e) => setDamageAssessmentForm(prev => ({ ...prev, customerName: e.target.value }))}
                        />
                      </div>
                    )}

                    <div>
                      <label className="form-label">Vehicle Information *</label>
                      <input
                        type="text"
                        className={styles.inputSpaced}
                        placeholder="Year, Make, Model"
                        value={damageAssessmentForm.vehicleInfo}
                        onChange={(e) => setDamageAssessmentForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="form-label">Damage Description *</label>
                      <textarea
                        className={styles.inputSpaced}
                        rows={3}
                        placeholder="AI will auto-populate this field..."
                        value={damageAssessmentForm.damageDescription}
                        onChange={(e) => setDamageAssessmentForm(prev => ({ ...prev, damageDescription: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label className="form-label">Priority Level</label>
                      <select
                        className={styles.inputSpaced}
                        value={damageAssessmentForm.priority}
                        onChange={(e) => setDamageAssessmentForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Estimated Cost ($)</label>
                      <input
                        type="number"
                        className={styles.inputSpaced}
                        min="0"
                        step="0.01"
                        placeholder="AI will auto-populate this field..."
                        value={damageAssessmentForm.estimatedCost}
                        onChange={(e) => setDamageAssessmentForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>

                    {damageAssessmentForm.repairRecommendations.length > 0 && (
                      <div>
                        <label className="form-label">AI Repair Recommendations</label>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <ul className="space-y-1">
                            {damageAssessmentForm.repairRecommendations.map((recommendation, index) => (
                              <li key={index} className="flex items-start text-sm text-green-700 dark:text-green-300">
                                <span className="text-green-600 dark:text-green-400 mr-2">•</span>
                                {recommendation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    {aiError && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Analysis Error:</h4>
                        <div className="text-sm text-red-700 dark:text-red-300">{aiError.toString()}</div>
                      </div>
                    )}
                  </div>
                )}

                {modalType === 'view-damage-assessment' && selectedDamageAssessment && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Customer</h4>
                        <p className="text-gray-600 dark:text-gray-300">{selectedDamageAssessment.customerName}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Vehicle</h4>
                        <p className="text-gray-600 dark:text-gray-300">{selectedDamageAssessment.vehicleInfo}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Damage Description</h4>
                      <p className="text-gray-600 dark:text-gray-300">{selectedDamageAssessment.damageDescription}</p>
                    </div>

                    {selectedDamageAssessment.repairRecommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Repair Recommendations</h4>
                        <ul className="space-y-1">
                          {selectedDamageAssessment.repairRecommendations.map((recommendation, index) => (
                            <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                              <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                              {recommendation}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Priority</h4>
                        <span className={`badge ${
                          selectedDamageAssessment.priority === 'high' ? 'badge-error' :
                          selectedDamageAssessment.priority === 'medium' ? 'badge-warning' :
                          'badge-success'
                        }`}>
                          {selectedDamageAssessment.priority}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Estimated Cost</h4>
                        <p className="text-green-600 dark:text-green-400 font-medium">
                          {selectedDamageAssessment.estimatedCost > 0 ? `$${selectedDamageAssessment.estimatedCost}` : 'Pending Analysis'}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Date</h4>
                        <p className="text-gray-600 dark:text-gray-300">{selectedDamageAssessment.date}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button
                  onClick={closeModal}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  {modalType === 'view-damage-assessment' ? 'Close' : 'Cancel'}
                </button>
                {modalType !== 'view-damage-assessment' && (
                  <button
                    onClick={() => {
                      if (modalType === 'new-customer') createCustomer();
                      else if (modalType === 'edit-customer') updateCustomer();
                      else if (modalType === 'new-appointment') createAppointment();
                      else if (modalType === 'edit-appointment') updateAppointment();
                      else if (modalType === 'new-service') createService();
                      else if (modalType === 'new-service-record') createServiceRecord();
                      else if (modalType === 'edit-service-record') updateServiceRecord();
                      else if (modalType === 'new-inventory') createInventoryItem();
                      else if (modalType === 'edit-inventory') updateInventoryItem();
                      else if (modalType === 'ai-damage-assessment') createDamageAssessment();
                    }}
                    className="btn btn-primary"
                  >
                    {modalType.includes('edit') ? 'Update' : modalType === 'ai-damage-assessment' ? 'Save Assessment' : 'Create'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        <footer className="bg-gray-50 dark:bg-gray-800 border-t mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Copyright © 2025 of Datavtar Private Limited. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;