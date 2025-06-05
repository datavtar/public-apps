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
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Building,
  Camera as CameraIcon,
  RefreshCw
} from 'lucide-react';
import styles from './styles/styles.module.css';

interface Customer {
  id: string;
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
type ManagerTab = 'dashboard' | 'appointments' | 'customers' | 'services' | 'analytics' | 'settings';

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  const cameraRef = useRef<any>(null);
  
  // Core state
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [activeTab, setActiveTab] = useState<ManagerTab>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data state
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  
  // UI state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
    estimatedCost: 0
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
  
  // Load data on mount
  useEffect(() => {
    loadData();
    initializeDefaultData();
    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Auto-save data changes
  useEffect(() => {
    saveData();
  }, [customers, appointments, serviceTypes, reminders]);
  
  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);
  
  // Check camera permissions when scanner is activated
  useEffect(() => {
    if (scannerActive) {
      checkCameraPermissions();
    }
  }, [scannerActive]);
  
  const checkCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission('granted');
      setCameraError(null);
      // Stop the stream as we just wanted to check permissions
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
      const savedReminders = localStorage.getItem('mechanic_reminders');
      
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
      if (savedServiceTypes) setServiceTypes(JSON.parse(savedServiceTypes));
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
      localStorage.setItem('mechanic_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving data:', error);
      setError('Failed to save data to storage');
    }
  };
  
  const initializeDefaultData = () => {
    // Initialize default service types if none exist
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
  };
  
  const generateId = (): string => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };
  
  const generateQRCode = (customerId: string): string => {
    return `MECHANIC_CUSTOMER_${customerId}_${Date.now()}`;
  };
  
  const createCustomer = () => {
    if (!customerForm.firstName || !customerForm.lastName || !customerForm.email || !customerForm.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    const newCustomer: Customer = {
      id: generateId(),
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
    setSuccess('Customer registered successfully!');
    setTimeout(() => setSuccess(null), 3000);
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
    
    // Update customer's appointment count
    if (appointmentForm.customerId) {
      setCustomers(prev => prev.map(c => 
        c.id === appointmentForm.customerId 
          ? { ...c, totalAppointments: c.totalAppointments + 1, lastVisit: appointmentForm.date }
          : c
      ));
    }
    
    // Schedule reminder
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
    reminderDate.setDate(reminderDate.getDate() - 1); // 24 hours before
    
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
      estimatedCost: 0
    });
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
        estimatedCost: item.estimatedCost
      });
    }
  };
  
  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedCustomer(null);
    setSelectedAppointment(null);
    resetCustomerForm();
    resetAppointmentForm();
    resetServiceForm();
    setError(null);
    document.body.classList.remove('modal-open');
  };
  
  const closeScannerModal = () => {
    setScannerActive(false);
    setScannedData('');
    setCameraError(null);
    setIsScanning(false);
    setCameraPermission('prompt');
    document.body.classList.remove('modal-open');
  };
  
  // AI Functions
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
  
  // QR Code functions
  const handleQRScan = (qrData: string) => {
    setScannedData(qrData);
    setIsScanning(false);
    
    // Try to find customer by QR code
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
        
        // In a real implementation, you would decode the QR code from the image
        // For now, we'll simulate QR code detection
        setTimeout(() => {
          // Simulate QR code detection from the image
          const mockQRData = 'MECHANIC_CUSTOMER_1_1735776000000'; // Mock QR code data
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
  
  // Analytics calculations
  const calculateAnalytics = (): Analytics => {
    const completedAppointments = appointments.filter(a => a.status === 'completed');
    const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.actualCost || a.estimatedCost), 0);
    const avgAppointmentValue = completedAppointments.length > 0 ? totalRevenue / completedAppointments.length : 0;
    const completionRate = appointments.length > 0 ? (completedAppointments.length / appointments.length) * 100 : 0;
    
    // Popular services
    const serviceCounts: { [key: string]: number } = {};
    appointments.forEach(a => {
      serviceCounts[a.serviceType] = (serviceCounts[a.serviceType] || 0) + 1;
    });
    const popularServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Monthly revenue (last 6 months)
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
      customerSatisfaction: 4.8 // Mock data
    };
  };
  
  // Export data functions
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
    setReminders([]);
    localStorage.removeItem('mechanic_customers');
    localStorage.removeItem('mechanic_appointments');
    localStorage.removeItem('mechanic_reminders');
    setSuccess('All data cleared successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  // Filter functions
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
             customer.phone.includes(searchTerm);
    });
  };
  
  // Handle keyboard events for modals
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
    <div id="welcome_fallback" className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      <div className="bg-white dark:bg-gray-900 min-h-screen theme-transition">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b theme-transition">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Navigation */}
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
                
                {/* View Mode Toggle */}
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
              
              {/* User Info and Actions */}
              <div className="flex items-center space-x-4">
                {/* Dark Mode Toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                
                {/* User Info */}
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
        
        {/* Mobile View Mode Toggle */}
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
        
        {/* Notifications */}
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
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {viewMode === 'customer' ? (
            // Customer View
            <div className="space-y-6">
              {/* Customer Welcome */}
              <div id="generation_issue_fallback" className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">Welcome to AutoService Pro</h2>
                <p className="text-blue-100 mb-4">Schedule your vehicle maintenance and repairs with ease</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-white/10 rounded-lg p-4">
                    <Calendar className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Easy Scheduling</h3>
                    <p className="text-sm text-blue-100">Book appointments anytime</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <Bell className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Automated Reminders</h3>
                    <p className="text-sm text-blue-100">Never miss an appointment</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4">
                    <QrCode className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="font-semibold">QR Code Access</h3>
                    <p className="text-sm text-blue-100">Quick check-in process</p>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Book Appointment */}
                <div id="book-appointment" className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Book an Appointment
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="form-label">Your Name *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Enter your full name"
                        value={appointmentForm.customerName}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, customerName: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Service Type *</label>
                      <select
                        className="input"
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
                          className="input"
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
                          className="input"
                          min={new Date().toISOString().split('T')[0]}
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Time *</label>
                        <select
                          className="input"
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
                        className="input"
                        placeholder="Year, Make, Model (e.g., 2020 Honda Civic)"
                        value={appointmentForm.vehicleInfo}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Additional Notes</label>
                      <textarea
                        className="input"
                        rows={3}
                        placeholder="Any additional information about your vehicle or service needs"
                        value={appointmentForm.notes}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    
                    {appointmentForm.estimatedCost > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
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
                
                {/* Customer Registration */}
                <div id="customer-registration" className="card">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-green-600" />
                    New Customer Registration
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="First name"
                          value={customerForm.firstName}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="input"
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
                        className="input"
                        placeholder="your.email@example.com"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Phone Number *</label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="(555) 123-4567"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Your address"
                        value={customerForm.address}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Vehicle Information</label>
                      <input
                        type="text"
                        className="input"
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
              </div>
              
              {/* Service Types Display */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Wrench className="h-5 w-5 mr-2 text-blue-600" />
                  Our Services
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceTypes.map(service => (
                    <div key={service.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
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
            // Manager View
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar */}
              <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <nav className="space-y-2">
                    <button
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
              
              {/* Main Content */}
              <div className="flex-1">
                {activeTab === 'dashboard' && (
                  <div id="manager-dashboard" className="space-y-6">
                    {/* Stats Cards */}
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
                        <div className="stat-title text-purple-600 dark:text-purple-400">Completion Rate</div>
                        <div className="stat-value text-purple-700 dark:text-purple-300">{analytics.completionRate.toFixed(1)}%</div>
                        <div className="stat-desc text-purple-500">Success rate</div>
                      </div>
                    </div>
                    
                    {/* Recent Appointments */}
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
                    
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          document.body.classList.add('modal-open');
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
                
                {activeTab === 'appointments' && (
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h2>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => {
                            setScannerActive(true);
                            document.body.classList.add('modal-open');
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
                    
                    {/* Filters */}
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
                    
                    {/* Appointments List */}
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
                    {/* Header */}
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
                    
                    {/* Search */}
                    <div className="card">
                      <div className="relative">
                        <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search customers..."
                          className="input pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {/* Customers Grid */}
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
                          </div>
                          
                          {/* QR Code Display */}
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
                    {/* Header */}
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
                    
                    {/* Services Grid */}
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
                
                {activeTab === 'analytics' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics & Reports</h2>
                    
                    {/* Key Metrics */}
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
                        <div className="stat-title">Active Customers</div>
                        <div className="stat-value">{customers.filter(c => c.totalAppointments > 0).length}</div>
                        <div className="stat-desc">With appointments</div>
                      </div>
                    </div>
                    
                    {/* Popular Services */}
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
                    
                    {/* Export Options */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Data</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          onClick={() => exportToCSV(serviceTypes, 'services')}
                          className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export Services
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
                    
                    {/* AI Assistant */}
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
                    
                    {/* Data Management */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
                      
                      <div className="space-y-4">
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">Danger Zone</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                            This action will permanently delete all customer data, appointments, and settings. This cannot be undone.
                          </p>
                          <button
                            onClick={() => {
                              const confirmed = window.confirm('Are you sure you want to delete all data? This cannot be undone.');
                              if (confirmed) {
                                clearAllData();
                              }
                            }}
                            className="btn bg-red-600 text-white hover:bg-red-700 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Data
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Import Data */}
                    <div className="card">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Import Data</h3>
                      
                      <div className="space-y-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Import customer and appointment data from CSV files. Make sure your CSV files have the correct headers.
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
                                  // CSV import functionality would go here
                                  setSuccess('CSV import feature ready for implementation');
                                  setTimeout(() => setSuccess(null), 3000);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label className="form-label">Import Appointments</label>
                            <input
                              type="file"
                              accept=".csv"
                              className="input"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // CSV import functionality would go here
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
        
        {/* QR Scanner Modal */}
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
                      
                      {/* Scanner Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-lg"></div>
                          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-lg"></div>
                          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-lg"></div>
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-lg"></div>
                        </div>
                      </div>
                      
                      {/* Scanning indicator */}
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
        
        {/* Modal */}
        {showModal && (
          <div className="modal-backdrop" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {modalType === 'new-customer' ? 'New Customer' :
                   modalType === 'edit-customer' ? 'Edit Customer' :
                   modalType === 'new-appointment' ? 'New Appointment' :
                   modalType === 'edit-appointment' ? 'Edit Appointment' :
                   modalType === 'new-service' ? 'New Service Type' :
                   'Modal'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4">
                {(modalType === 'new-customer' || modalType === 'edit-customer') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          className="input"
                          value={customerForm.firstName}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          className="input"
                          value={customerForm.lastName}
                          onChange={(e) => setCustomerForm(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="form-label">Email *</label>
                      <input
                        type="email"
                        className="input"
                        value={customerForm.email}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Phone *</label>
                      <input
                        type="tel"
                        className="input"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="input"
                        value={customerForm.address}
                        onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Vehicle Information</label>
                      <input
                        type="text"
                        className="input"
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
                        className="input"
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
                          className="input"
                          placeholder="Customer name for walk-in appointment"
                          value={appointmentForm.customerName}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, customerName: e.target.value }))}
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="form-label">Service Type *</label>
                      <select
                        className="input"
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
                          className="input"
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
                          className="input"
                          min={new Date().toISOString().split('T')[0]}
                          value={appointmentForm.date}
                          onChange={(e) => setAppointmentForm(prev => ({ ...prev, date: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Time *</label>
                        <select
                          className="input"
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
                        className="input"
                        placeholder="Year, Make, Model"
                        value={appointmentForm.vehicleInfo}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Estimated Cost ($)</label>
                      <input
                        type="number"
                        className="input"
                        min="0"
                        step="0.01"
                        value={appointmentForm.estimatedCost}
                        onChange={(e) => setAppointmentForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Notes</label>
                      <textarea
                        className="input"
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
                        className="input"
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Description *</label>
                      <textarea
                        className="input"
                        rows={3}
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">Category *</label>
                      <select
                        className="input"
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
                          className="input"
                          min="0"
                          value={serviceForm.estimatedDuration}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                        />
                      </div>
                      <div>
                        <label className="form-label">Estimated Cost ($)</label>
                        <input
                          type="number"
                          className="input"
                          min="0"
                          step="0.01"
                          value={serviceForm.estimatedCost}
                          onChange={(e) => setServiceForm(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                        />
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
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (modalType === 'new-customer') createCustomer();
                    else if (modalType === 'edit-customer') updateCustomer();
                    else if (modalType === 'new-appointment') createAppointment();
                    else if (modalType === 'edit-appointment') updateAppointment();
                    else if (modalType === 'new-service') createService();
                  }}
                  className="btn btn-primary"
                >
                  {modalType.includes('edit') ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
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